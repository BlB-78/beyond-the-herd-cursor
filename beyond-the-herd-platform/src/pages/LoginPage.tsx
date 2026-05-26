import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLangStore } from '../store/lang';
import { supabase, signInWithGoogle, authErrorMessage } from '../lib/supabase';
import { MessageSquareWarning, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/images/wolf_logo_minimal_1779397330316.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t, currentLangCode } = useLangStore();
  const isRtl = currentLangCode === 'AR';

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      if (!rememberMe) {
        sessionStorage.setItem('bth_session_only', '1');
      } else {
        sessionStorage.removeItem('bth_session_only');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err) || 'Invalid username or password.');
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
          <p className="text-gray-400 text-lg text-center max-w-md">
            Join our exclusive community of driven individuals mastering the markets.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 relative text-left">
        <Link
          to="/"
          className="absolute top-8 left-8 sm:left-12 lg:left-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium z-10 w-fit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </Link>

        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden mx-auto text-center mb-8">
            <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-xl mx-auto mb-4 ring-2 ring-white/10" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white mb-2 text-center">{t('auth.login.title')}</h2>
          <p className="text-gray-400 mb-8 mt-1 text-sm text-center">Welcome back! Please enter your details.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-[#2C1618] text-[#FF4444] rounded-xl text-[14px] flex items-center gap-3">
                <MessageSquareWarning size={18} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium text-gray-400 mb-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('auth.login.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                placeholder={t('auth.placeholder.email')}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3.5 border border-white/10 rounded-xl shadow-sm placeholder-gray-600 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-400 mb-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('auth.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  placeholder={t('auth.placeholder.password')}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-4 py-3.5 border border-white/10 rounded-xl shadow-sm placeholder-gray-600 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors ${isRtl ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer w-12 ${isRtl ? 'left-0' : 'right-0'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-black text-yellow-500 accent-yellow-500"
                />
                <label htmlFor="remember-me" className="block text-sm text-gray-400 cursor-pointer">
                  {t('auth.login.rememberMe') || 'Remember me'}
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-yellow-500 hover:text-yellow-400">
                Forgot password?
              </Link>
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? '...' : t('auth.login.submit')}
            </button>
            <div className="mt-6 flex items-center justify-between">
              <span className="border-b border-white/5 w-2/5" />
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">or sign in with</span>
              <span className="border-b border-white/5 w-2/5" />
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl border border-white/10 text-sm font-medium text-white bg-white/5 hover:bg-white/10 disabled:opacity-50 cursor-pointer gap-3"
            >
              Google
            </button>
            <p className="text-center mt-6 text-sm text-gray-400">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="text-white hover:text-yellow-400 font-medium border-b border-yellow-500/30 pb-0.5">
                {t('auth.login.signup')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
