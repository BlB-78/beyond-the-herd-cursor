import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import {
  verifyStripeCheckout,
  verifyChargilyCheckout,
  getStoredChargilyCheckoutId,
  clearStoredChargilyCheckoutId,
} from '../lib/payments';

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const provider = searchParams.get('provider') || 'stripe';
  const stripeSessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        if (provider === 'chargily') {
          const checkoutId = getStoredChargilyCheckoutId();
          clearStoredChargilyCheckoutId();
          if (!checkoutId) {
            throw new Error('Missing Chargily checkout reference. If you paid, wait a moment and check your dashboard.');
          }
          const result = await verifyChargilyCheckout(checkoutId);
          setCourseId(result.courseId);
        } else {
          if (!stripeSessionId) {
            throw new Error('Missing checkout session.');
          }
          const result = await verifyStripeCheckout(stripeSessionId);
          setCourseId(result.courseId);
        }
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not confirm payment.');
        setStatus('error');
      }
    };

    run();
  }, [provider, stripeSessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-display font-bold mb-2">Confirming payment…</h1>
            <p className="text-gray-400 text-sm">
              {provider === 'chargily'
                ? 'Verifying your Edahabia / CIB payment with Chargily.'
                : 'Please wait while we enroll you in the course.'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-display font-bold mb-2">Payment successful</h1>
            <p className="text-gray-400 mb-8">You are now enrolled. Start learning right away.</p>
            <div className="flex flex-col gap-3">
              {courseId && (
                <button
                  onClick={() => navigate(`/learn/${courseId}/lesson`)}
                  className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400"
                >
                  Start course
                </button>
              )}
              <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm font-medium">
                Go to dashboard
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-display font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <Link to="/courses" className="text-yellow-500 hover:text-yellow-400 font-medium">
              Back to courses
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
