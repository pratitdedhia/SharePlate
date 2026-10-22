import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UtensilsCrossed, Eye, EyeOff, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Login failed. Please check credentials or use one-click demo personas below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    success(`Signed in as Demo ${role.toUpperCase()}`);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Brand Icon */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center mx-auto shadow-md">
          <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Sign in to SharePlate</h1>
        <p className="text-xs text-stone-500">Rescue Food · Reduce Waste · Feed Communities</p>
      </div>

      {/* Main Login Box */}
      <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya.sharma@dtu.ac.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-700">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Hackathon Demo Account Quick Sign-in */}
        <div className="pt-4 border-t border-warm-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hackathon Evaluation Personas:</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Click any persona to test the platform instantly with verified role permissions:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('donor')}
              className="p-2 rounded-xl bg-warm-50 hover:bg-emerald-50 text-stone-700 hover:text-forest-900 border border-warm-200 text-left font-semibold transition"
            >
              🥗 College Canteen (Donor)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('recipient')}
              className="p-2 rounded-xl bg-warm-50 hover:bg-emerald-50 text-stone-700 hover:text-forest-900 border border-warm-200 text-left font-semibold transition"
            >
              🏢 Robin Hood Army (NGO)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('volunteer')}
              className="p-2 rounded-xl bg-warm-50 hover:bg-emerald-50 text-stone-700 hover:text-forest-900 border border-warm-200 text-left font-semibold transition"
            >
              🛵 Food Runner (Volunteer)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2 rounded-xl bg-warm-50 hover:bg-emerald-50 text-stone-700 hover:text-forest-900 border border-warm-200 text-left font-semibold transition"
            >
              🛡️ Operations Admin
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-forest-900 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
