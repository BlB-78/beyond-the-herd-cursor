import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLangStore } from '../store/lang';
import { supabase, signInWithGoogle, authErrorMessage } from '../lib/supabase';
import { MessageSquareWarning, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/images/wolf_logo_minimal_1779397330316.png';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is disabled. Please enable "Google" in your Firebase Console (Authentication -> Sign-in method).');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. In Firebase Console, go to Authentication -> Settings -> Authorized domains and add this app URL.');
      } else {
        setError(authErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (signUpError) throw signUpError;
      navigate('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Left abstract visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 border-r border-white/5 items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Abstract pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="relative z-10 p-12 flex flex-col items-center">
          <img src={logo} alt="Logo" className="w-24 h-24 object-cover rounded-2xl mb-8 ring-4 ring-white/10" />
          <h1 className="text-4xl font-display font-bold text-white mb-4 text-center">Beyond The Herd</h1>
          <p className="text-gray-400 text-lg text-center max-w-md">Join our exclusive community of driven individuals mastering the markets.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32 relative text-left">
        <Link to="/" className="absolute top-8 left-8 sm:left-12 lg:left-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium z-10 w-fit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Back to Home
        </Link>
        
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden mx-auto text-center mb-8">
            <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-xl mx-auto mb-4 ring-2 ring-white/10" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white mb-2 text-center">{t('auth.register.title')}</h2>
          <p className="text-gray-400 mb-8 mt-1 text-sm text-center">Create an account to start your journey.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-[#2C1618] text-[#FF4444] rounded-xl text-[14px] flex items-center gap-3">
                <MessageSquareWarning size={18} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium text-gray-400 mb-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t('auth.register.name')}</label>
              <div className="mt-1">
                <input type="text" required value={name} placeholder={t('auth.placeholder.name')} onChange={e => setName(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-white/10 rounded-xl shadow-sm placeholder-gray-600 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors" />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-400 mb-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t('auth.register.email')}</label>
              <div className="mt-1">
                <input type="email" required value={email} placeholder={t('auth.placeholder.email')} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3.5 border border-white/10 rounded-xl shadow-sm placeholder-gray-600 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors" />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-400 mb-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t('auth.register.password')}</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  placeholder={t('auth.placeholder.password')}
                  onChange={e => setPassword(e.target.value)}
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

            <div className="pt-2">
              <button
                disabled={isLoading}
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-black transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? '...' : t('auth.register.submit')}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="border-b border-white/5 w-1/5 lg:w-1/4"></span>
              <span className="text-xs text-center text-gray-600 font-medium uppercase tracking-wider">or sign up with</span>
              <span className="border-b border-white/5 w-1/5 lg:w-1/4"></span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm border border-white/10 text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 focus:ring-offset-black transition-colors cursor-pointer disabled:opacity-50 gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </button>
            </div>
            
            <div className="text-center mt-6">
               <p className="text-sm text-gray-400">
                 {t('auth.register.hasAccount')} <Link to="/login" className="text-white hover:text-yellow-400 font-medium cursor-pointer transition-colors border-b border-yellow-500/30 pb-0.5">{t('auth.register.signin')}</Link>
               </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
