import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UtensilsCrossed,
  PlusCircle,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
  Truck,
  LogIn,
  UserPlus,
  Compass,
  ExternalLink,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isDonor, isRecipient, isVolunteer, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notionUrl = import.meta.env.VITE_NOTION_URL;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Helper for user initials avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Role badge color scheme
  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'donor':
        return 'bg-emerald-100 text-forest-900 border-emerald-300';
      case 'recipient':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'volunteer':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'admin':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getRoleAvatarBg = (role: string) => {
    switch (role) {
      case 'donor':
        return 'bg-forest-900 text-white';
      case 'recipient':
        return 'bg-blue-700 text-white';
      case 'volunteer':
        return 'bg-purple-700 text-white';
      case 'admin':
        return 'bg-stone-800 text-amber-300';
      default:
        return 'bg-stone-600 text-white';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-warm-50/95 backdrop-blur-md border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
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

          {/* Navigation Links - Common for Guests, Role-adapted for Users */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/donations"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/donations')
                  ? 'bg-forest-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
              }`}
            >
              Browse Food
            </Link>

            <Link
              to="/impact"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/impact')
                  ? 'bg-forest-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Impact
              </span>
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/about')
                  ? 'bg-forest-900 text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
              }`}
            >
              About
            </Link>

            {notionUrl && (
              <a href={notionUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-warm-200 transition inline-flex items-center gap-1">
                Project Journey (Notion) <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Authenticated Links Dynamically Adapting to Role */}
            {user && (
              <>
                <Link
                  to={`/dashboard/${user.role}`}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive('/dashboard') || isActive(`/dashboard/${user.role}`)
                      ? 'bg-forest-900 text-white'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
                  }`}
                >
                  Dashboard
                </Link>

                {(isDonor || isAdmin) && (
                  <Link
                    to="/my-donations"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive('/my-donations')
                        ? 'bg-forest-900 text-white'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
                    }`}
                  >
                    My Listings
                  </Link>
                )}

                {(isRecipient || isVolunteer || isAdmin) && (
                  <Link
                    to="/my-claims"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive('/my-claims')
                        ? 'bg-forest-900 text-white'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
                    }`}
                  >
                    {isVolunteer ? 'Deliveries' : 'My Claims'}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive('/admin')
                        ? 'bg-forest-900 text-white'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-warm-200'
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

          {/* Right Action / Auth Container */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Authenticated State: Role-Specific Action CTA + User Profile Chip */
              <div className="flex items-center gap-2.5">
                {/* Role Specific CTA */}
                {isDonor && (
                  <Link
                    to="/donations/new"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    Donate Food
                  </Link>
                )}

                {isRecipient && (
                  <Link
                    to="/donations"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow-xs transition"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-blue-300" />
                    Find Food
                  </Link>
                )}

                {isVolunteer && (
                  <Link
                    to="/my-claims"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-900 text-white hover:bg-purple-800 shadow-xs transition"
                  >
                    <Truck className="w-4 h-4 text-purple-300" />
                    Active Routes
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-amber-300 hover:bg-stone-800 shadow-xs transition"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Ops
                  </Link>
                )}

                <div className="h-6 w-px bg-warm-300 mx-0.5" />

                {/* Logged in User Profile Chip */}
                <div className="flex items-center gap-2 bg-white pl-1.5 pr-2 py-1 rounded-2xl border border-warm-200 shadow-2xs">
                  <Link
                    to="/profile"
                    className={`w-8 h-8 rounded-xl ${getRoleAvatarBg(user.role)} flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0 hover:opacity-90 transition`}
                    title="View Profile"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(user.full_name)}</span>
                    )}
                  </Link>

                  <div className="min-w-0 pr-1 text-left">
                    <p className="text-xs font-bold text-stone-900 truncate leading-tight">
                      {user.full_name}
                    </p>
                    <span
                      className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeClasses(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Guest / Common Landing Taskbar State: Sign In and Register CTAs */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-forest-900 bg-white hover:bg-warm-100 transition border border-warm-300 shadow-2xs flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-forest-800" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 shadow-xs transition flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger button */}
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
        <div className="md:hidden border-t border-warm-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          {/* Active User Card or Guest Onboarding */}
          {user ? (
            <div className="bg-warm-50 p-3.5 rounded-2xl border border-warm-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl ${getRoleAvatarBg(user.role)} flex items-center justify-center font-bold text-xs shrink-0`}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{getInitials(user.full_name)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">{user.full_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeClasses(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    {user.organization_name && (
                      <span className="text-[10px] text-stone-500 truncate max-w-[130px]">
                        {user.organization_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-50 to-warm-50 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-forest-950">Welcome to SharePlate</p>
                <p className="text-[11px] text-stone-600">Sign in to rescue or donate food</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-forest-900 border border-warm-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-forest-900 text-white"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* Role CTA Button on Mobile */}
          {user && isDonor && (
            <Link
              to="/donations/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              + Post Food Donation
            </Link>
          )}

          {user && isRecipient && (
            <Link
              to="/donations"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white shadow-xs"
            >
              <UtensilsCrossed className="w-4 h-4 text-blue-300" />
              Find & Claim Food
            </Link>
          )}

          {user && isVolunteer && (
            <Link
              to="/my-claims"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold bg-purple-900 text-white shadow-xs"
            >
              <Truck className="w-4 h-4 text-purple-300" />
              View Active Dispatch Routes
            </Link>
          )}

          {/* Mobile Links */}
          <div className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              to="/donations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100 flex items-center justify-between"
            >
              <span>Browse Food Batches</span>
              <Compass className="w-4 h-4 text-stone-400" />
            </Link>

            <Link
              to="/impact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100 flex items-center justify-between"
            >
              <span>Impact Metrics</span>
              <BarChart3 className="w-4 h-4 text-stone-400" />
            </Link>

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100"
            >
              About & Safety
            </Link>

            {notionUrl && (
              <a href={notionUrl} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100 inline-flex items-center gap-1">
                Project Journey (Notion) <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {user && (
              <>
                <div className="h-px bg-warm-200 my-1" />
                <Link
                  to={`/dashboard/${user.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100 font-bold"
                >
                  Dashboard ({user.role})
                </Link>

                {(isDonor || isAdmin) && (
                  <Link
                    to="/my-donations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100"
                  >
                    My Listings
                  </Link>
                )}

                {(isRecipient || isVolunteer || isAdmin) && (
                  <Link
                    to="/my-claims"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100"
                  >
                    {isVolunteer ? 'Active Deliveries' : 'My Reserved Claims'}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 font-bold"
                  >
                    Platform Moderation
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-stone-800 hover:bg-warm-100"
                >
                  Profile Settings
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

