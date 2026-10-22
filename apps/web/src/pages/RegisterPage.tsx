import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('donor');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'admin') {
      error('Administrative roles cannot be self-registered.');
      return;
    }
    if (!fullName || !email || !password) {
      error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName, role, organizationName, city);
      success('Account created! Welcome to SharePlate.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center mx-auto shadow-md">
          <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Join the Food Rescue Mission</h1>
        <p className="text-xs text-stone-500">Create your SharePlate account</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Select Your Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-2.5 rounded-xl text-center font-bold transition border ${
                  role === 'donor'
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'bg-warm-50 text-stone-700 border-warm-200 hover:bg-warm-100'
                }`}
              >
                Food Donor
              </button>
              <button
                type="button"
                onClick={() => setRole('recipient')}
                className={`p-2.5 rounded-xl text-center font-bold transition border ${
                  role === 'recipient'
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'bg-warm-50 text-stone-700 border-warm-200 hover:bg-warm-100'
                }`}
              >
                NGO / Shelter
              </button>
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`p-2.5 rounded-xl text-center font-bold transition border ${
                  role === 'volunteer'
                    ? 'bg-forest-900 text-white border-forest-900'
                    : 'bg-warm-50 text-stone-700 border-warm-200 hover:bg-warm-100'
                }`}
              >
                Volunteer
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Organization Name (Canteen, Restaurant, or NGO)
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="e.g. DTU Central Canteen or Robin Hood Army"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
            >
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Noida">Noida</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@organization.org"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 shadow-sm transition flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-forest-900 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
