import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, authErrorMessage } from '../lib/supabase';
import { MessageSquareWarning, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLangStore } from '../store/lang';
import logo from '../assets/images/wolf_logo_minimal_1779397330316.png';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, currentLangCode } = useLangStore();
  const isRtl = currentLangCode === 'AR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError(authErrorMessage(err) || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 border-r border-white/5 items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative z-10 p-12 flex flex-col items-center">
          <img src={logo} alt="Logo" className="w-24 h-24 object-cover rounded-2xl mb-8 ring-4 ring-white/10" />
          <h1 className="text-4xl font-display font-bold text-white mb-4 text-center">Beyond The Herd</h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 relative">
        <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </Link>

        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-display font-extrabold text-white mb-2 text-center">Reset Password</h2>
          <p className="text-gray-400 mb-8 text-sm text-center">Enter your email and we&apos;ll send you a reset link.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-[#2C1618] text-[#FF4444] rounded-xl text-sm flex items-center gap-3">
                <MessageSquareWarning size={18} />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-500/10 text-green-400 rounded-xl text-sm flex items-start gap-3">
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                {t('auth.login.email') || 'Email address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-white/10 rounded-xl bg-white/5 text-white focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
