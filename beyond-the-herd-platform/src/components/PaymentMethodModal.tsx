import React, { useEffect, useState } from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';
import {
  getPaymentProviders,
  createStripeCheckout,
  createChargilyCheckout,
  type ChargilyPaymentMethod,
} from '../lib/payments';

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  priceUsd: number;
  courseId: string;
  dzdEstimate?: number;
}

export function PaymentMethodModal({
  open,
  onClose,
  courseTitle,
  priceUsd,
  courseId,
  dzdEstimate,
}: PaymentMethodModalProps) {
  const [providers, setProviders] = useState({ stripe: false, chargily: false });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [chargilyMethod, setChargilyMethod] = useState<ChargilyPaymentMethod | ''>('');

  useEffect(() => {
    if (!open) return;
    setError('');
    getPaymentProviders().then(setProviders).catch(() => {});
  }, [open]);

  if (!open) return null;

  const startStripe = async () => {
    setLoading('stripe');
    setError('');
    try {
      const { url } = await createStripeCheckout(courseId);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stripe checkout failed');
      setLoading(null);
    }
  };

  const startChargily = async () => {
    setLoading('chargily');
    setError('');
    try {
      const { url } = await createChargilyCheckout(
        courseId,
        chargilyMethod || undefined
      );
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargily checkout failed');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-bold pr-8">Choose payment method</h3>
          <p className="text-gray-400 text-sm mt-1 truncate">{courseTitle}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm bg-zinc-900 rounded-lg p-4 border border-white/5">
            <span className="text-gray-400">Price</span>
            <div className="text-right">
              <div className="font-bold text-white">${priceUsd.toFixed(2)} USD</div>
              {dzdEstimate != null && providers.chargily && (
                <div className="text-yellow-500 text-xs mt-0.5">≈ {dzdEstimate.toLocaleString()} DZD via Chargily</div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {providers.stripe && (
            <button
              type="button"
              disabled={!!loading}
              onClick={startStripe}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-yellow-500/30 transition-all text-left disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <CreditCard size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white">International card</div>
                <div className="text-gray-500 text-sm">Stripe — Visa, Mastercard, etc.</div>
              </div>
              {loading === 'stripe' && (
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </button>
          )}

          {providers.chargily && (
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-white">Chargily Pay</div>
                    <div className="text-gray-500 text-sm">Edahabia, CIB — Algeria</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChargilyMethod(chargilyMethod === 'edahabia' ? '' : 'edahabia')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      chargilyMethod === 'edahabia'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Edahabia
                  </button>
                  <button
                    type="button"
                    onClick={() => setChargilyMethod(chargilyMethod === 'cib' ? '' : 'cib')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      chargilyMethod === 'cib'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    CIB / SATIM
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  Optional: pre-select a method, or choose on the Chargily page.
                </p>
              </div>
              <button
                type="button"
                disabled={!!loading}
                onClick={startChargily}
                className="w-full py-3.5 font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === 'chargily' ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Pay with Chargily'
                )}
              </button>
            </div>
          )}

          {!providers.stripe && !providers.chargily && (
            <p className="text-gray-500 text-sm text-center py-4">
              No payment gateways configured. Add Stripe or Chargily keys to `.env.local`.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
