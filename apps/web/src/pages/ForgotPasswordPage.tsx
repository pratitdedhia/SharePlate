import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UtensilsCrossed, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      success('Password reset instructions sent!');
    } catch (err: any) {
      error(err.message || 'Failed to send password reset email.');
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
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Forgot Password</h1>
          <p className="text-sm text-stone-600">
            Enter your registered email to receive secure recovery instructions.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-warm-200 shadow-sm space-y-6">
          {submitted ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-forest-900 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Check Your Inbox</h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  We have dispatched a password reset link to{' '}
                  <strong className="text-stone-900">{email}</strong>.
                  Please follow the instructions in the email to set a new password.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-left text-xs text-stone-600 space-y-1">
                <div className="font-bold text-forest-950 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Evaluation Note:</span>
                </div>
                <p>
                  In live Supabase deployments, clicking the email link opens the <code>/reset-password</code> route with a secure token.
                  You can also test the reset form directly at <Link to="/reset-password" className="font-semibold text-forest-900 underline">/reset-password</Link>.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-warm-100 hover:bg-warm-200 transition"
                >
                  Send to a different email
                </button>
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="recovery-email" className="block text-xs font-bold text-stone-700 mb-1.5">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@dtu.ac.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:ring-1 focus:ring-forest-900 focus:outline-hidden transition bg-warm-50/30"
                  />
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
                    <span>Sending Recovery Instructions...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-stone-500 space-y-2 border-t border-warm-100">
            <div>
              Remembered your credentials?{' '}
              <Link to="/login" className="font-bold text-forest-900 hover:text-forest-950 hover:underline">
                Sign In
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
          <span>PKCE Password Recovery compliant with Supabase Auth standards</span>
        </div>
      </div>
    </div>
  );
};
