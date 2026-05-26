import type { Express, Request, Response } from 'express';
import Stripe from 'stripe';
import { getSupabaseAdmin, getUserFromBearer } from './supabaseAdmin.js';
import { fulfillPurchase, recordPendingPayment } from './fulfillment.js';
import { registerChargilyRoutes, isChargilyConfigured, handleChargilyWebhook } from './chargily.js';

export { handleChargilyWebhook };

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function appOrigin(): string {
  return process.env.APP_URL || 'http://localhost:3000';
}

function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function registerPaymentRoutes(app: Express) {
  app.get('/api/checkout/providers', (_req, res) => {
    res.json({
      stripe: isStripeConfigured(),
      chargily: isChargilyConfigured(),
    });
  });

  registerChargilyRoutes(app);

  app.post('/api/checkout/create-session', async (req: Request, res: Response) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({
          error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local.',
        });
      }

      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Sign in required' });

      const { courseId } = req.body as { courseId?: string };
      if (!courseId) return res.status(400).json({ error: 'courseId required' });

      const admin = getSupabaseAdmin();
      const { data: course, error: courseErr } = await admin
        .from('courses')
        .select('id, title, price')
        .eq('id', courseId)
        .maybeSingle();

      if (courseErr || !course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const price = Number(course.price);
      if (price <= 0) {
        return res.status(400).json({ error: 'This course is free — enroll directly.' });
      }

      const { data: enrolled } = await admin
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrolled) {
        return res.status(400).json({ error: 'Already enrolled in this course' });
      }

      const origin = appOrigin();
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(price * 100),
              product_data: {
                name: course.title,
                description: 'Beyond The Herd — course enrollment',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/courses/${courseId}`,
        client_reference_id: user.id,
        metadata: {
          courseId,
          userId: user.id,
        },
      });

      if (!session.url) {
        return res.status(500).json({ error: 'Failed to create checkout session' });
      }

      await recordPendingPayment(user.id, courseId, 'stripe', session.id, price, 'usd');

      res.json({ url: session.url, provider: 'stripe' });
    } catch (err) {
      console.error('stripe create-session:', err);
      res.status(500).json({ error: 'Checkout failed' });
    }
  });

  app.post('/api/checkout/verify', async (req: Request, res: Response) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({ error: 'Stripe not configured' });
      }

      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Sign in required' });

      const { sessionId } = req.body as { sessionId?: string };
      if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.metadata?.userId !== user.id) {
        return res.status(403).json({ error: 'Session does not belong to this account' });
      }

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed yet' });
      }

      const courseId = session.metadata?.courseId;
      if (!courseId) {
        return res.status(400).json({ error: 'Invalid session metadata' });
      }

      await fulfillPurchase(
        user.id,
        courseId,
        'stripe',
        session.id,
        (session.amount_total ?? 0) / 100,
        session.currency ?? 'usd'
      );

      res.json({ enrolled: true, courseId, provider: 'stripe' });
    } catch (err) {
      console.error('stripe verify:', err);
      res.status(500).json({ error: 'Verification failed' });
    }
  });
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    throw new Error('Stripe webhook not configured');
  }

  const event = stripe.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;

    if (userId && courseId && session.id) {
      await fulfillPurchase(
        userId,
        courseId,
        'stripe',
        session.id,
        (session.amount_total ?? 0) / 100,
        session.currency ?? 'usd'
      );
    }
  }

  return { received: true };
}
