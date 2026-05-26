import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import { getSupabaseAdmin, getUserFromBearer } from './supabaseAdmin.js';
import { fulfillPurchase, recordPendingPayment, usdToDzd } from './fulfillment.js';

type ChargilyCheckout = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  checkout_url: string;
  metadata?: Record<string, string> | null;
};

function getChargilyKey(): string | null {
  return process.env.CHARGILY_API_KEY || null;
}

function chargilyApiBase(): string {
  const mode = process.env.CHARGILY_MODE === 'live' ? 'live' : 'test';
  return `https://pay.chargily.net/${mode}/api/v2`;
}

async function chargilyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = getChargilyKey();
  if (!key) throw new Error('CHARGILY_API_KEY not configured');

  const res = await fetch(`${chargilyApiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    },
  });

  const data = (await res.json()) as T & { message?: string; errors?: unknown };
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String(data.message)
        : `Chargily API error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function appOrigin(): string {
  return process.env.APP_URL || 'http://localhost:3000';
}

export function isChargilyConfigured(): boolean {
  return !!getChargilyKey();
}

export function registerChargilyRoutes(app: Express) {
  app.post('/api/checkout/chargily/create-session', async (req: Request, res: Response) => {
    try {
      if (!isChargilyConfigured()) {
        return res.status(503).json({
          error: 'Chargily is not configured. Add CHARGILY_API_KEY to .env.local.',
        });
      }

      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Sign in required' });

      const { courseId, paymentMethod } = req.body as {
        courseId?: string;
        paymentMethod?: 'edahabia' | 'cib';
      };
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

      const priceUsd = Number(course.price);
      if (priceUsd <= 0) {
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

      const amountDzd = usdToDzd(priceUsd);
      const origin = appOrigin();

      const body: Record<string, unknown> = {
        amount: amountDzd,
        currency: 'dzd',
        success_url: `${origin}/checkout/success?provider=chargily`,
        failure_url: `${origin}/courses/${courseId}`,
        webhook_endpoint: `${origin}/api/webhooks/chargily`,
        description: `${course.title} — Beyond The Herd`,
        locale: 'fr',
        metadata: {
          userId: user.id,
          courseId,
        },
      };

      if (paymentMethod === 'edahabia' || paymentMethod === 'cib') {
        body.payment_method = paymentMethod;
      }

      const checkout = await chargilyFetch<ChargilyCheckout>('/checkouts', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!checkout.checkout_url || !checkout.id) {
        return res.status(500).json({ error: 'Invalid Chargily checkout response' });
      }

      await recordPendingPayment(
        user.id,
        courseId,
        'chargily',
        checkout.id,
        amountDzd,
        'dzd'
      );

      res.json({
        url: checkout.checkout_url,
        checkoutId: checkout.id,
        amountDzd,
        currency: 'dzd',
      });
    } catch (err) {
      console.error('chargily create-session:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Chargily checkout failed',
      });
    }
  });

  app.post('/api/checkout/chargily/verify', async (req: Request, res: Response) => {
    try {
      if (!isChargilyConfigured()) {
        return res.status(503).json({ error: 'Chargily not configured' });
      }

      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Sign in required' });

      const { checkoutId } = req.body as { checkoutId?: string };
      if (!checkoutId) return res.status(400).json({ error: 'checkoutId required' });

      const checkout = await chargilyFetch<ChargilyCheckout>(`/checkouts/${checkoutId}`);

      const meta = checkout.metadata ?? {};
      if (meta.userId !== user.id) {
        return res.status(403).json({ error: 'Checkout does not belong to this account' });
      }

      if (checkout.status !== 'paid') {
        return res.status(400).json({
          error: 'Payment not completed yet',
          status: checkout.status,
        });
      }

      const courseId = meta.courseId;
      if (!courseId) {
        return res.status(400).json({ error: 'Invalid checkout metadata' });
      }

      await fulfillPurchase(
        user.id,
        courseId,
        'chargily',
        checkout.id,
        checkout.amount,
        checkout.currency || 'dzd'
      );

      res.json({ enrolled: true, courseId });
    } catch (err) {
      console.error('chargily verify:', err);
      res.status(500).json({ error: 'Verification failed' });
    }
  });
}

export async function handleChargilyWebhook(rawBody: Buffer, signature: string | undefined) {
  const key = getChargilyKey();
  if (!key) throw new Error('Chargily not configured');

  if (!signature) throw new Error('Missing signature header');

  const computed = crypto.createHmac('sha256', key).update(rawBody).digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const compBuf = Buffer.from(computed, 'utf8');
  if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
    throw new Error('Invalid Chargily webhook signature');
  }

  const event = JSON.parse(rawBody.toString('utf8')) as {
    type: string;
    data: ChargilyCheckout & { metadata?: Record<string, string> };
  };

  if (event.type === 'checkout.paid') {
    const checkout = event.data;
    const userId = checkout.metadata?.userId;
    const courseId = checkout.metadata?.courseId;

    if (userId && courseId && checkout.id) {
      await fulfillPurchase(
        userId,
        courseId,
        'chargily',
        checkout.id,
        checkout.amount,
        checkout.currency || 'dzd'
      );
    }
  }

  return { received: true };
}
