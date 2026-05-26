import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, authErrorMessage } from '../lib/supabase';
import { MessageSquareWarning, CheckCircle, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/images/wolf_logo_minimal_1779397330316.png';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        setCanReset(true);
        setIsVerifying(false);
        return;
      }
      setError('The password reset link is invalid or has expired. Please request a new one.');
      setIsVerifying(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setCanReset(true);
        setIsVerifying(false);
        setError('');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
      setMessage('Your password has been reset successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(authErrorMessage(err) || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 border-r border-white/5 items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="relative z-10 p-12 flex flex-col items-center">
          <img src={logo} alt="Logo" className="w-24 h-24 object-cover rounded-2xl mb-8 ring-4 ring-white/10" />
          <h1 className="text-4xl font-display font-bold text-white text-center">Beyond The Herd</h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-display font-extrabold text-white mb-2 text-center">Create New Password</h2>
          <p className="text-gray-400 mb-8 text-sm text-center">Please enter your new password below.</p>

          {!isVerifying ? (
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
              {!message && canReset && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3.5 border border-white/10 rounded-xl bg-white/5 text-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 border border-white/10 rounded-xl bg-white/5 text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>
              )}
              {!canReset && !message && (
                <div className="text-center">
                  <Link to="/forgot-password" className="text-yellow-500 hover:text-yellow-400 font-medium">
                    Request a new password reset link
                  </Link>
                </div>
              )}
              <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-gray-400 hover:text-white">
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center text-gray-400 py-12 text-sm">Verifying link...</div>
          )}
        </div>
      </div>
    </div>
  );
}
