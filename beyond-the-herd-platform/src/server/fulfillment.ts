import { getSupabaseAdmin } from './supabaseAdmin.js';

export type PaymentProvider = 'stripe' | 'chargily';

export async function fulfillPurchase(
  userId: string,
  courseId: string,
  provider: PaymentProvider,
  providerCheckoutId: string,
  amount: number,
  currency: string
) {
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (!existing) {
    await admin.from('enrollments').insert({ user_id: userId, course_id: courseId });
  }

  await admin.from('payments').upsert(
    {
      user_id: userId,
      course_id: courseId,
      provider,
      provider_checkout_id: providerCheckoutId,
      amount,
      currency,
      status: 'completed',
    },
    { onConflict: 'provider,provider_checkout_id' }
  );
}

export async function recordPendingPayment(
  userId: string,
  courseId: string,
  provider: PaymentProvider,
  providerCheckoutId: string,
  amount: number,
  currency: string
) {
  const admin = getSupabaseAdmin();
  await admin.from('payments').upsert(
    {
      user_id: userId,
      course_id: courseId,
      provider,
      provider_checkout_id: providerCheckoutId,
      amount,
      currency,
      status: 'pending',
    },
    { onConflict: 'provider,provider_checkout_id' }
  );
}

/** Convert USD list price to DZD for Chargily (whole dinars). */
export function usdToDzd(amountUsd: number): number {
  const rate = Number(process.env.CHARGILY_DZD_PER_USD || 135);
  return Math.max(100, Math.round(amountUsd * rate));
}
