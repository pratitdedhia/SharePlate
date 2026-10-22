import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UtensilsCrossed,
  PlusCircle,
  BarChart3,
  HeartHandshake,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isDonor, isRecipient, isAdmin, switchDemoRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = (role: UserRole) => {
    switchDemoRole(role);
    setDemoDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-warm-50/90 backdrop-blur-md border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center shadow-md group-hover:bg-forest-800 transition">
                <UtensilsCrossed className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-forest-950 flex items-center gap-1.5">
                  SharePlate
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-forest-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    HackDays '26
                  </span>
                </span>
                <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                  Rescue Food · Feed Communities
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/donations"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/donations')
                  ? 'bg-forest-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
              }`}
            >
              Browse Food
            </Link>

            <Link
              to="/impact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/impact')
                  ? 'bg-forest-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Impact
              </span>
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/about')
                  ? 'bg-forest-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
              }`}
            >
              About
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/dashboard')
                      ? 'bg-forest-900 text-white'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
                  }`}
                >
                  Dashboard
                </Link>

                {isDonor && (
                  <Link
                    to="/my-donations"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/my-donations')
                        ? 'bg-forest-900 text-white'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
                    }`}
                  >
                    My Listings
                  </Link>
                )}

                {(isRecipient || user.role === 'volunteer') && (
                  <Link
                    to="/my-claims"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/my-claims')
                        ? 'bg-forest-900 text-white'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
                    }`}
                  >
                    My Claims
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin')
                        ? 'bg-forest-900 text-white'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-warm-100'
                    }`}
                  >
                    <span className="flex items-center gap-1 text-amber-700">
                      <ShieldAlert className="w-4 h-4" />
                      Moderation
                    </span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Role Switcher for Hackathon Judges */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-forest-900 border border-emerald-300 hover:bg-emerald-100 transition"
                title="Switch persona for evaluation"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Role: <span className="capitalize">{user?.role || 'Guest'}</span>
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-warm-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Demo Personas
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('donor')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-forest-900 flex items-center justify-between"
                  >
                    <span>Canteen / Donor</span>
                    {user?.role === 'donor' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('recipient')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-forest-900 flex items-center justify-between"
                  >
                    <span>NGO / Recipient</span>
                    {user?.role === 'recipient' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('volunteer')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-forest-900 flex items-center justify-between"
                  >
                    <span>Volunteer Logistics</span>
                    {user?.role === 'volunteer' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-forest-900 flex items-center justify-between"
                  >
                    <span>Platform Admin</span>
                    {user?.role === 'admin' && <span className="text-emerald-600 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Donate CTA button */}
            <Link
              to="/donations/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Donate Food
            </Link>

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-xl bg-warm-200 border border-warm-300 flex items-center justify-center text-stone-700 hover:bg-warm-300 transition overflow-hidden"
                  title="Profile Settings"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-forest-900 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-warm-200 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {/* Persona selector on mobile */}
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <span className="text-xs font-semibold text-forest-900 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Switch Demo Role:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['donor', 'recipient', 'volunteer', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`text-xs py-1.5 px-2 rounded-lg font-medium capitalize text-center ${
                    user?.role === r ? 'bg-forest-900 text-white' : 'bg-white text-stone-700 border'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              to="/donations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-warm-100"
            >
              Browse Food Donations
            </Link>
            <Link
              to="/donations/new"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50"
            >
              + Create Food Donation
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-warm-100"
            >
              Dashboard
            </Link>
            <Link
              to="/my-donations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-warm-100"
            >
              My Listings
            </Link>
            <Link
              to="/my-claims"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-warm-100"
            >
              My Reserved Claims
            </Link>
            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-warm-100"
            >
              Impact Metrics
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-stone-800 hover:bg-warm-100"
            >
              About & Safety Principles
            </Link>
          </div>

          <div className="pt-2 border-t border-warm-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">{user?.full_name}</span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded capitalize">
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-rose-600 font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
