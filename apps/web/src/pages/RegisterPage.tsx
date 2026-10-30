import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  UtensilsCrossed,
  Building2,
  Bike,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../types';
import { INDIAN_STATES, STATE_CITIES_MAP } from '../lib/utils';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { success, error } = useToast();

  // Role Selection (strictly donor, recipient, volunteer - never admin)
  const [role, setRole] = useState<'donor' | 'recipient' | 'volunteer'>('donor');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('Delhi NCR');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role-Specific Fields (Persisted across role switches without loss)
  const [donorOrgName, setDonorOrgName] = useState('');
  const [donorType, setDonorType] = useState('canteen');
  const [donorServiceArea, setDonorServiceArea] = useState('');
  const [donorContactPerson, setDonorContactPerson] = useState('');

  const [recipientOrgName, setRecipientOrgName] = useState('');
  const [recipientType, setRecipientType] = useState('ngo');
  const [recipientServiceArea, setRecipientServiceArea] = useState('');
  const [recipientContactPerson, setRecipientContactPerson] = useState('');

  const [volunteerServiceArea, setVolunteerServiceArea] = useState('');
  const [volunteerAvailability, setVolunteerAvailability] = useState('flexible');
  const [volunteerBio, setVolunteerBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleStateChange = (newState: string) => {
    setState(newState);
    const availableCities = STATE_CITIES_MAP[newState];
    if (availableCities && availableCities.length > 0) {
      setCity(availableCities[0]);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full legal name (min 2 characters).';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    // Indian phone number validation (+91 or 10 digits starting with 6,7,8,9)
    const cleanedPhone = phone.replace(/[\s\-+]/g, '');
    const isIndianPhone = /^(?:91)?[6789]\d{9}$/.test(cleanedPhone);
    if (!phone.trim() || !isIndianPhone) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 98110 12345).';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (role === 'donor') {
      if (!donorOrgName.trim()) {
        errors.donorOrgName = 'Organization/Kitchen name is required for donors.';
      }
    } else if (role === 'recipient') {
      if (!recipientOrgName.trim()) {
        errors.recipientOrgName = 'Organization / NGO name is required for recipients.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      error('Please fix the errors highlighted in the form.');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+91')
        ? phone
        : `+91 ${phone.replace(/^91/, '').trim()}`;

      const registrationPayload = {
        fullName: fullName.trim(),
        role,
        phone: formattedPhone,
        state: state.trim(),
        city: city.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        serviceArea:
          role === 'donor'
            ? donorServiceArea.trim()
            : role === 'recipient'
            ? recipientServiceArea.trim()
            : volunteerServiceArea.trim(),
        organizationName:
          role === 'donor'
            ? donorOrgName.trim()
            : role === 'recipient'
            ? recipientOrgName.trim()
            : undefined,
        donorType: role === 'donor' ? donorType : undefined,
        recipientType: role === 'recipient' ? recipientType : undefined,
        contactPerson:
          role === 'donor'
            ? donorContactPerson.trim()
            : role === 'recipient'
            ? recipientContactPerson.trim()
            : undefined,
        availability: role === 'volunteer' ? volunteerAvailability : undefined,
        bio: role === 'volunteer' ? volunteerBio.trim() : undefined,
      };

      const newProfile = await register(email.trim(), password, registrationPayload);
      success(`Welcome to SharePlate, ${newProfile.full_name}! Account created successfully.`);

      // Direct redirection to the selected role dashboard
      navigate(`/dashboard/${role}`);
    } catch (err: any) {
      error(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const authenticatedProfile = await loginWithGoogle(role);
      success(`Welcome to SharePlate, ${authenticatedProfile.full_name}! Signed in via Google.`);
      navigate(`/dashboard/${authenticatedProfile.role}`);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error(err.message || 'Google registration was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-warm-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center shadow-md group-hover:bg-forest-800 transition">
              <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Community Onboarding
            </span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Join SharePlate</h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Create your account and become part of the food-rescue community.
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-warm-200 shadow-sm space-y-8">
          {/* Quick Sign Up With Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 text-xs font-bold shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google as {role.toUpperCase()}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-warm-200"></div>
              <span className="shrink-0 mx-3 text-[10px] uppercase font-bold text-stone-400">or register with email</span>
              <div className="flex-grow border-t border-warm-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Role Selection Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                1. Select Account Type <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Donor Card */}
                <button
                  type="button"
                  onClick={() => setRole('donor')}
                  className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                    role === 'donor'
                      ? 'border-forest-900 bg-forest-50/60 ring-2 ring-forest-900'
                      : 'border-warm-200 bg-white hover:bg-warm-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-forest-900 flex items-center justify-center">
                      <UtensilsCrossed className="w-5 h-5 text-forest-800" />
                    </div>
                    {role === 'donor' && <CheckCircle2 className="w-5 h-5 text-forest-900" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-stone-900">Donor</h2>
                    <p className="text-xs text-stone-500 mt-1 leading-snug">
                      "I have surplus food to share."
                    </p>
                  </div>
                </button>

                {/* Recipient Organization Card */}
                <button
                  type="button"
                  onClick={() => setRole('recipient')}
                  className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                    role === 'recipient'
                      ? 'border-forest-900 bg-forest-50/60 ring-2 ring-forest-900'
                      : 'border-warm-200 bg-white hover:bg-warm-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-800" />
                    </div>
                    {role === 'recipient' && <CheckCircle2 className="w-5 h-5 text-forest-900" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-stone-900">Recipient Org</h2>
                    <p className="text-xs text-stone-500 mt-1 leading-snug">
                      "I need food donations for my community."
                    </p>
                  </div>
                </button>

                {/* Volunteer Card */}
                <button
                  type="button"
                  onClick={() => setRole('volunteer')}
                  className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                    role === 'volunteer'
                      ? 'border-forest-900 bg-forest-50/60 ring-2 ring-forest-900'
                      : 'border-warm-200 bg-white hover:bg-warm-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Bike className="w-5 h-5 text-amber-800" />
                    </div>
                    {role === 'volunteer' && <CheckCircle2 className="w-5 h-5 text-forest-900" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-stone-900">Volunteer</h2>
                    <p className="text-xs text-stone-500 mt-1 leading-snug">
                      "I want to help collect and distribute food."
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Role-Specific Conditional Fields */}
            <div className="p-4 sm:p-5 rounded-2xl bg-warm-50/80 border border-warm-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-forest-950 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {role === 'donor' && 'Donor Organization Details'}
                  {role === 'recipient' && 'Recipient Organization & Community Details'}
                  {role === 'volunteer' && 'Volunteer Service Preferences'}
                </span>
              </div>

              {/* DONOR FIELDS */}
              {role === 'donor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Business or Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={donorOrgName}
                      onChange={(e) => setDonorOrgName(e.target.value)}
                      placeholder="e.g. DTU Central Canteen or Annapurna Grand Caterers"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                      required
                    />
                    {validationErrors.donorOrgName && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.donorOrgName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Donor Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={donorType}
                      onChange={(e) => setDonorType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    >
                      <option value="canteen">College / Campus Canteen</option>
                      <option value="restaurant">Restaurant / Bistro</option>
                      <option value="caterer">Event Caterer / Banquet Hall</option>
                      <option value="event_organizer">Conference / Event Organizer</option>
                      <option value="bakery">Bakery / Confectionery</option>
                      <option value="other">Other Food Facility</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={donorContactPerson}
                      onChange={(e) => setDonorContactPerson(e.target.value)}
                      placeholder="e.g. Chef Vikram Malhotra (Head Chef)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Service Area / Pickup Zone
                    </label>
                    <input
                      type="text"
                      value={donorServiceArea}
                      onChange={(e) => setDonorServiceArea(e.target.value)}
                      placeholder="e.g. Rohini & Pitampura or Andheri & BKC"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>
              )}

              {/* RECIPIENT FIELDS */}
              {role === 'recipient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientOrgName}
                      onChange={(e) => setRecipientOrgName(e.target.value)}
                      placeholder="e.g. Robin Hood Army - Delhi Chapter or Feeding India"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                      required
                    />
                    {validationErrors.recipientOrgName && (
                      <p className="text-xs text-rose-600 mt-1">{validationErrors.recipientOrgName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Organization Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    >
                      <option value="ngo">Non-Profit NGO</option>
                      <option value="shelter">Homeless / Community Shelter</option>
                      <option value="community_kitchen">Community / Langar Kitchen</option>
                      <option value="food_bank">Registered Food Bank</option>
                      <option value="orphanage">Orphanage or Elder Care Facility</option>
                      <option value="other">Other Humanitarian Entity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={recipientContactPerson}
                      onChange={(e) => setRecipientContactPerson(e.target.value)}
                      placeholder="e.g. Rajesh Kumar (Relief Lead)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Service Area / Distribution Coverage
                    </label>
                    <input
                      type="text"
                      value={recipientServiceArea}
                      onChange={(e) => setRecipientServiceArea(e.target.value)}
                      placeholder="e.g. North & West Delhi slum communities"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>
              )}

              {/* VOLUNTEER FIELDS */}
              {role === 'volunteer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Preferred Service Area / Corridor
                    </label>
                    <input
                      type="text"
                      value={volunteerServiceArea}
                      onChange={(e) => setVolunteerServiceArea(e.target.value)}
                      placeholder="e.g. South Delhi, Noida Sector 62, or Bandra-Andheri"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Availability Windows
                    </label>
                    <select
                      value={volunteerAvailability}
                      onChange={(e) => setVolunteerAvailability(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    >
                      <option value="flexible">Flexible / On-Call</option>
                      <option value="evenings">Weekday Evenings (6 PM - 11 PM)</option>
                      <option value="weekends">Weekends (All Day)</option>
                      <option value="mornings">Morning Breakfast Runs (7 AM - 11 AM)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Optional Introduction / Bio
                    </label>
                    <textarea
                      rows={2}
                      value={volunteerBio}
                      onChange={(e) => setVolunteerBio(e.target.value)}
                      placeholder="Brief note about your transport vehicle (e.g. motorcycle, car) or background in volunteer relief..."
                      className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Common Account Credentials */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Contact & Security Credentials
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:ring-1 focus:ring-forest-900 focus:outline-hidden transition bg-warm-50/30"
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-xs text-rose-600 mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. priya.sharma@dtu.ac.in"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:ring-1 focus:ring-forest-900 focus:outline-hidden transition bg-warm-50/30"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-rose-600 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Indian Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Indian Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98110 12345"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:ring-1 focus:ring-forest-900 focus:outline-hidden transition bg-warm-50/30"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-xs text-rose-600 mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                {/* State Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Operating State <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mb-1.5">
                    Surplus food listings and routes are strictly filtered to your registered state to preserve freshness.
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-forest-700">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-warm-50/30 font-semibold"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Operating City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-warm-50/30"
                    >
                      {(STATE_CITIES_MAP[state] || ['Delhi NCR']).map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Profile Image URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Optional Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-warm-50/30"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Password <span className="text-rose-500">*</span>
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-warm-50/30"
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
                  {validationErrors.password && (
                    <p className="text-xs text-rose-600 mt-1">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-warm-200 text-stone-900 text-sm focus:border-forest-900 focus:outline-hidden bg-warm-50/30"
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
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-rose-600 mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-forest-900 hover:bg-forest-800 active:bg-forest-950 shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Action Links */}
          <div className="pt-2 text-center text-xs text-stone-500 space-y-2 border-t border-warm-100">
            <div>
              Already have an account?{' '}
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

        {/* Security Policy Reminder */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Public registration is strictly restricted to Donors, Recipients, and Volunteers.
            Administrative roles are granted solely by platform governance.
          </span>
        </div>
      </div>
    </div>
  );
};
