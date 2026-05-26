import { supabase } from './supabase';

export type PaymentProvider = 'stripe' | 'chargily';
export type ChargilyPaymentMethod = 'edahabia' | 'cib';

const CHARGILY_CHECKOUT_KEY = 'bth_chargily_checkout_id';

async function authHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function getPaymentProviders(): Promise<{
  stripe: boolean;
  chargily: boolean;
}> {
  const res = await fetch('/api/checkout/providers');
  if (!res.ok) return { stripe: false, chargily: false };
  return res.json();
}

export async function createStripeCheckout(courseId: string): Promise<{ url: string }> {
  const res = await fetch('/api/checkout/create-session', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ courseId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not start Stripe checkout');
  }
  return data;
}

export async function createChargilyCheckout(
  courseId: string,
  paymentMethod?: ChargilyPaymentMethod
): Promise<{ url: string; checkoutId: string; amountDzd: number }> {
  const res = await fetch('/api/checkout/chargily/create-session', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ courseId, paymentMethod }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not start Chargily checkout');
  }

  sessionStorage.setItem(CHARGILY_CHECKOUT_KEY, data.checkoutId);
  return data;
}

export function getStoredChargilyCheckoutId(): string | null {
  return sessionStorage.getItem(CHARGILY_CHECKOUT_KEY);
}

export function clearStoredChargilyCheckoutId(): void {
  sessionStorage.removeItem(CHARGILY_CHECKOUT_KEY);
}

export async function verifyStripeCheckout(
  sessionId: string
): Promise<{ enrolled: boolean; courseId: string }> {
  const res = await fetch('/api/checkout/verify', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ sessionId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not verify Stripe payment');
  }
  return data;
}

export async function verifyChargilyCheckout(
  checkoutId: string
): Promise<{ enrolled: boolean; courseId: string }> {
  const res = await fetch('/api/checkout/chargily/verify', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ checkoutId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not verify Chargily payment');
  }
  return data;
}
