import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  UtensilsCrossed,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginDemoRole } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('canteen@dtu.ac.in');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);

  // Return to requested protected route or fallback to role dashboard
  const from = (location.state as any)?.from?.pathname || (location.state as any)?.from;
  const autoReserve = (location.state as any)?.autoReserve;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const authenticatedProfile = await loginWithGoogle();
      success(`Welcome, ${authenticatedProfile.full_name}!`);
      const destination = from && !from.includes('/login') ? from : `/dashboard/${authenticatedProfile.role}`;
      navigate(destination, { replace: true, state: { autoReserve } });
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error(err.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const authenticatedProfile = await login(email, password);
      success(`Welcome back, ${authenticatedProfile.full_name}!`);

      // Determine destination based on trusted authenticated role
      const destination = from && !from.includes('/login') ? from : `/dashboard/${authenticatedProfile.role}`;
      navigate(destination, { replace: true, state: { autoReserve } });
    } catch (err: any) {
      error(err.message || 'Login failed. Please verify your credentials or click a Quick Demo Login Preset below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setDemoLoadingRole(role);
    try {
      const profile = await loginDemoRole(role);
      success(`Signed in as Demo ${role.toUpperCase()}: ${profile.organization_name || profile.full_name}`);
      const destination = from && !from.includes('/login') ? from : `/dashboard/${role}`;
      navigate(destination, { replace: true, state: { autoReserve } });
    } catch (err: any) {
      error(err.message || 'Demo authentication failed.');
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-warm-50/60 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Main Card */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-warm-200 shadow-xl space-y-6">
          {/* Circular Icon and Portal Title */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-forest-900 text-white flex items-center justify-center mx-auto shadow-md">
              <UtensilsCrossed className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 pt-1 tracking-tight">SharePlate Portal Login</h1>
            <p className="text-xs text-stone-500">Sign in to access your role-based dashboard</p>
          </div>

          {/* Reservation Prompt Banner */}
          {autoReserve && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-forest-950 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Sign In Required to Reserve</span>
                <span className="text-[11px] text-stone-600">Please sign in or select a demo role below to complete your surplus food reservation.</span>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || demoLoadingRole !== null}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-warm-200"></div>
            <span className="shrink-0 mx-3 text-[10px] uppercase font-bold text-stone-400">or continue with email</span>
            <div className="flex-grow border-t border-warm-200"></div>
          </div>

          {/* Standard Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
            <div>
              <label htmlFor="login-email" className="block font-bold text-stone-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-xs focus:border-forest-900 focus:ring-1 focus:ring-forest-900 focus:outline-hidden transition bg-warm-50/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block font-bold text-stone-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-forest-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-xs focus:border-forest-900 focus:ring-1 focus:ring-forest-900 focus:outline-hidden transition bg-warm-50/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-forest-900 focus:ring-emerald-500"
                />
                <span className="text-[11px]">Remember me for 30 days</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={loading || demoLoadingRole !== null}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 active:bg-forest-950 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <p className="text-center text-stone-500 text-xs pt-1">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-forest-900 hover:underline">
                Register Here
              </Link>
            </p>
          </form>

          {/* Horizontal Divider Line */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-warm-200"></div>
          </div>

          {/* Quick Demo Login Presets Section */}
          <div className="space-y-3 text-center pt-1">
            <div className="inline-flex items-center gap-1.5 bg-stone-800 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs">
              <span>⚡ Quick Demo Login Presets:</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('donor')}
                disabled={loading || demoLoadingRole !== null}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-emerald-500 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
              >
                {demoLoadingRole === 'donor' ? 'Signing in...' : 'Donor'}
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('recipient')}
                disabled={loading || demoLoadingRole !== null}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-blue-500 text-blue-800 bg-blue-50/60 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
              >
                {demoLoadingRole === 'recipient' ? 'Signing in...' : 'Recipient'}
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('volunteer')}
                disabled={loading || demoLoadingRole !== null}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-purple-500 text-purple-800 bg-purple-50/60 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
              >
                {demoLoadingRole === 'volunteer' ? 'Signing in...' : 'Volunteer'}
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading || demoLoadingRole !== null}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-stone-400 text-stone-700 bg-stone-100 hover:bg-stone-200 transition shadow-2xs cursor-pointer"
              >
                {demoLoadingRole === 'admin' ? 'Signing in...' : 'Admin'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 mt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL RLS & Cloudinary media integration</span>
        </div>
      </div>
    </div>
  );
};
