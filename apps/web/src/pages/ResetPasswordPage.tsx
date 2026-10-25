import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UtensilsCrossed, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { success, error } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setIsSuccess(true);
      success('Password updated successfully! Please sign in with your new credentials.');
    } catch (err: any) {
      error(err.message || 'Failed to update password. Session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-warm-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center shadow-md group-hover:bg-forest-800 transition">
              <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Account Security
            </span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Set New Password</h1>
          <p className="text-sm text-stone-600">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-warm-200 shadow-sm space-y-6">
          {isSuccess ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-forest-900 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Password Changed!</h3>
                <p className="text-xs text-stone-600 mt-2">
                  Your new password is saved. You can now sign in to your SharePlate account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-900 hover:bg-forest-800 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden transition bg-warm-50/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password view"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden transition bg-warm-50/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password view"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-900 hover:bg-forest-800 active:bg-forest-950 shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-stone-500 space-y-2 border-t border-warm-100">
            <div>
              <Link to="/login" className="font-bold text-forest-900 hover:text-forest-950 hover:underline">
                Return to Sign In
              </Link>
            </div>
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 transition"
              >
                <ArrowLeft className="w-3 h-3" />
                Return to Home
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Password Update via Supabase Auth</span>
        </div>
      </div>
    </div>
  );
};
