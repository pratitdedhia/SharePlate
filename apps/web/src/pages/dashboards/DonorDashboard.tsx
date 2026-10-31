import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { demoStore } from '../../lib/mockData';
import { Donation, Claim, DonorRewardsSummary, DONOR_REWARD_RULES } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DemoAccountBanner } from '../../components/common/DemoAccountBanner';
import { CloudinaryImage } from '../../components/common/CloudinaryImage';
import {
  Truck,
  RotateCcw,
  UtensilsCrossed,
  PlusCircle,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Award,
  Sparkles,
  Gift,
  Info,
  ShieldCheck,
  Search,
  Filter,
  X,
  ExternalLink,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<Claim[]>([]);
  const [rewardsSummary, setRewardsSummary] = useState<DonorRewardsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'rewards'>('listings');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pickupCodeInput, setPickupCodeInput] = useState<Record<string, string>>({});
  const [verifyingClaimId, setVerifyingClaimId] = useState<string | null>(null);

  const contentSectionRef = useRef<HTMLDivElement>(null);

  const handleStatCardClick = (filter: 'all' | 'available' | 'claimed' | 'completed') => {
    setActiveTab('listings');
    setStatusFilter(filter);
    setTimeout(() => {
      contentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const loadData = async () => {
    if (!user) return;
    try {
      // 1. Load donations for this donor
      const myDonations = await donationsService.getMyDonations(user.id);
      setDonations(myDonations);

      // 2. Load incoming claims on this donor's donations
      const claims = await claimsService.getMyClaims(user.id, true);
      setIncomingClaims(claims);

      // 3. Load donor rewards ledger
      const rewards = await claimsService.getDonorRewards(user.id);
      setRewardsSummary(rewards);
    } catch (err: any) {
      console.error('Failed to load donor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useLiveUpdates(loadData);

  const handleMarkCollected = async (claimId: string) => {
    try {
      await claimsService.updateClaimStatus(claimId, 'collected');
      success('Food handed over for transit! Awaiting recipient NGO receipt verification.');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update claim');
    }
  };

  const handleVerifyPickupHandoff = async (claimId: string) => {
    if (!user) return;
    const code = pickupCodeInput[claimId]?.trim();
    if (!code) {
      error('Please enter the 4-digit pickup code presented by the volunteer.');
      return;
    }
    setVerifyingClaimId(claimId);
    try {
      await claimsService.confirmPickup(claimId, user.id, code);
      success('Volunteer pickup verified! Food is officially in transit.');
      setPickupCodeInput((prev) => ({ ...prev, [claimId]: '' }));
      await loadData();
    } catch (err: any) {
      error(err.message || 'Pickup verification failed.');
    } finally {
      setVerifyingClaimId(null);
    }
  };

  // Metrics calculation from database records
  const totalDonations = donations.length;
  const availableDonations = donations.filter(
    (d) => d.status === 'available' && (d.quantity_available === undefined || d.quantity_available > 0)
  ).length;
  const activeIncomingClaims = incomingClaims.filter(
    (c) => c.status === 'claimed' || c.status === 'collected'
  );
  const activeClaimedDonations = donations.filter(
    (d) => d.status === 'reserved' || d.status === 'claimed' || d.status === 'collected'
  );
  const claimedDonations = activeClaimedDonations.length;
  const deliveredIncomingClaims = incomingClaims.filter((c) => c.status === 'delivered');
  const deliveredDonations = donations.filter((d) => d.status === 'delivered');
  const completedRescues = deliveredDonations.length;
  const totalPoints = rewardsSummary?.points_balance || 0;

  // Filtered donations based on statusFilter and searchQuery
  const filteredDonations = donations.filter((d) => {
    if (statusFilter === 'available') {
      if (d.status !== 'available' || (d.quantity_available !== undefined && d.quantity_available <= 0)) {
        return false;
      }
    } else if (statusFilter === 'claimed') {
      if (d.status !== 'reserved' && d.status !== 'claimed' && d.status !== 'collected') {
        return false;
      }
    } else if (statusFilter === 'completed') {
      if (d.status !== 'delivered') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (d.title || '').toLowerCase().includes(q);
      const matchCategory = (d.category || '').toLowerCase().includes(q);
      const matchCity = (d.city || '').toLowerCase().includes(q);
      return matchTitle || matchCategory || matchCity;
    }

    return true;
  });

  // Filtered claims based on statusFilter and searchQuery
  const filteredIncomingClaims = incomingClaims.filter((c) => {
    if (statusFilter === 'available') {
      return false; // Available mode focuses on ready surplus, not active claims
    } else if (statusFilter === 'claimed') {
      return c.status === 'claimed' || c.status === 'collected';
    } else if (statusFilter === 'completed') {
      return c.status === 'delivered';
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRecipient = (c.recipient?.organization_name || c.recipient?.full_name || '').toLowerCase().includes(q);
      const matchDonation = (c.donation?.title || '').toLowerCase().includes(q);
      return matchRecipient || matchDonation;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Account Indicator */}
      <DemoAccountBanner />

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-900 text-white">
              Food Donor Portal
            </span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {user?.city || 'Delhi NCR'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {user?.organization_name ? `${user.organization_name} · ` : ''}Manage your kitchen surplus, monitor collections, and track meals saved.
          </p>
        </div>

        <Link
          to="/donations/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>+ Create Donation</span>
        </Link>
      </div>

      {/* Metrics Row (5 Interactive Filter Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Donations */}
        <button
          type="button"
          onClick={() => handleStatCardClick('all')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative group ${
            activeTab === 'listings' && statusFilter === 'all'
              ? 'bg-emerald-50/70 border-forest-900 ring-2 ring-forest-900 shadow-sm'
              : 'bg-white border-warm-200 hover:border-emerald-500 hover:shadow-xs'
          }`}
          title="Click to view all surplus batch listings"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span className={activeTab === 'listings' && statusFilter === 'all' ? 'text-forest-950 font-bold' : ''}>
              Total Listings
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
              activeTab === 'listings' && statusFilter === 'all' ? 'bg-forest-900 text-white' : 'bg-emerald-50 text-forest-800'
            }`}>
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">{totalDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Surplus batches listed</div>
          <div className="text-[10px] font-bold text-forest-900 pt-0.5 flex items-center gap-1">
            {activeTab === 'listings' && statusFilter === 'all' ? (
              <span className="text-forest-900 font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active View
              </span>
            ) : (
              <span className="text-stone-400 group-hover:text-forest-900 transition flex items-center gap-0.5">
                Show all &rarr;
              </span>
            )}
          </div>
        </button>

        {/* Available Donations */}
        <button
          type="button"
          onClick={() => handleStatCardClick('available')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative group ${
            activeTab === 'listings' && statusFilter === 'available'
              ? 'bg-blue-50/70 border-blue-700 ring-2 ring-blue-700 shadow-sm'
              : 'bg-white border-warm-200 hover:border-blue-500 hover:shadow-xs'
          }`}
          title="Click to view available surplus open for NGO reservations"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span className={activeTab === 'listings' && statusFilter === 'available' ? 'text-blue-950 font-bold' : ''}>
              Available Now
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
              activeTab === 'listings' && statusFilter === 'available' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800'
            }`}>
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{availableDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Ready for NGO reservation</div>
          <div className="text-[10px] font-bold text-blue-700 pt-0.5 flex items-center gap-1">
            {activeTab === 'listings' && statusFilter === 'available' ? (
              <span className="text-blue-900 font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Filter Active
              </span>
            ) : (
              <span className="text-stone-400 group-hover:text-blue-700 transition flex items-center gap-0.5">
                Show available &rarr;
              </span>
            )}
          </div>
        </button>

        {/* Claimed Donations */}
        <button
          type="button"
          onClick={() => handleStatCardClick('claimed')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative group ${
            activeTab === 'listings' && statusFilter === 'claimed'
              ? 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-amber-500 hover:shadow-xs'
          }`}
          title="Click to view active claims awaiting volunteer pickup and verification"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span className={activeTab === 'listings' && statusFilter === 'claimed' ? 'text-amber-950 font-bold' : ''}>
              Claimed / Transit
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
              activeTab === 'listings' && statusFilter === 'claimed' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
            }`}>
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">{claimedDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">In handoff or delivery</div>
          <div className="text-[10px] font-bold text-amber-700 pt-0.5 flex items-center gap-1">
            {activeTab === 'listings' && statusFilter === 'claimed' ? (
              <span className="text-amber-900 font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-amber-600" /> Filter Active
              </span>
            ) : (
              <span className="text-stone-400 group-hover:text-amber-700 transition flex items-center gap-0.5">
                Verify OTPs &rarr;
              </span>
            )}
          </div>
        </button>

        {/* Completed Rescues */}
        <button
          type="button"
          onClick={() => handleStatCardClick('completed')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-1 relative group ${
            activeTab === 'listings' && statusFilter === 'completed'
              ? 'bg-emerald-50/70 border-emerald-700 ring-2 ring-emerald-700 shadow-sm'
              : 'bg-white border-warm-200 hover:border-emerald-500 hover:shadow-xs'
          }`}
          title="Click to view delivered batches verified by recipient shelters"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span className={activeTab === 'listings' && statusFilter === 'completed' ? 'text-forest-950 font-bold' : ''}>
              Completed
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
              activeTab === 'listings' && statusFilter === 'completed' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'
            }`}>
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-forest-900">{completedRescues}</div>
          <div className="text-[11px] text-stone-500 font-medium">Delivered to shelters</div>
          <div className="text-[10px] font-bold text-emerald-800 pt-0.5 flex items-center gap-1">
            {activeTab === 'listings' && statusFilter === 'completed' ? (
              <span className="text-forest-950 font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Filter Active
              </span>
            ) : (
              <span className="text-stone-400 group-hover:text-emerald-800 transition flex items-center gap-0.5">
                View receipts &rarr;
              </span>
            )}
          </div>
        </button>

        {/* Donor Impact Rewards Balance */}
        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className={`col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl border text-white shadow-xs space-y-1 text-left hover:scale-[1.02] transition cursor-pointer relative group ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-br from-forest-900 to-emerald-950 border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-gradient-to-br from-forest-900 to-emerald-950 border-emerald-800 hover:border-emerald-600'
          }`}
          title="Click to view full Donor Rewards and Points Ledger"
        >
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <span>Donor Rewards</span>
            <div className="w-7 h-7 rounded-lg bg-white/10 text-emerald-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalPoints} pts</div>
          <div className="text-[11px] text-emerald-300/80 font-medium truncate">
            {rewardsSummary?.current_tier || 'Bronze Kitchen'}
          </div>
          <div className="text-[10px] font-bold text-emerald-300 pt-0.5 flex items-center gap-1">
            {activeTab === 'rewards' ? (
              <span className="text-emerald-200 font-black flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Active Tab
              </span>
            ) : (
              <span className="text-emerald-300/70 group-hover:text-emerald-200 transition flex items-center gap-0.5">
                View ledger &rarr;
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-warm-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Listings & Claims</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
            {donations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Donor Rewards & Impact Ledger</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-forest-900 font-bold">
            {totalPoints} pts
          </span>
        </button>
      </div>

      {/* TAB 1: LISTINGS & CLAIMS */}
      {activeTab === 'listings' && (
        <div ref={contentSectionRef} className="space-y-6">
          {/* Interactive Filter Bar & Real-Time Search */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-warm-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-stone-400 mr-1 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'all'
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'bg-warm-100/80 text-stone-600 hover:bg-warm-200 hover:text-stone-900'
                }`}
              >
                <span>All Listings</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-warm-200 text-stone-700'}`}>
                  {donations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'available'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-warm-100/80 text-stone-600 hover:bg-blue-50 hover:text-blue-900'
                }`}
              >
                <span>Available Now</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'available' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900 font-bold'}`}>
                  {availableDonations}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('claimed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'claimed'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-warm-100/80 text-stone-600 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                <span>Claimed / Transit</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'claimed' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'}`}>
                  {claimedDonations}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-warm-100/80 text-stone-600 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
              >
                <span>Completed</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900 font-bold'}`}>
                  {completedRescues}
                </span>
              </button>

              {(statusFilter !== 'all' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition whitespace-nowrap cursor-pointer flex items-center gap-1"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Search Input Box */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, category, city..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-warm-200 rounded-xl bg-warm-50/50 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-forest-900 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Contextual Status Feature Banners */}
          {statusFilter === 'available' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/90 border border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-200 text-blue-900">
                    Ready for Reservation
                  </span>
                  <span className="text-xs font-bold text-blue-800">
                    {availableDonations} active surplus {availableDonations === 1 ? 'batch' : 'batches'} ready
                  </span>
                </div>
                <p className="text-xs text-blue-900/85 leading-relaxed">
                  These meal batches are actively published on the public feed. Verified recipient NGOs, food banks, and shelters can reserve portions immediately.
                </p>
              </div>
              <Link
                to="/donate"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start sm:self-center"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Post Another Batch</span>
              </Link>
            </div>
          )}

          {statusFilter === 'claimed' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                    Active Handoff Dispatch
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {claimedDonations} courier handoff {claimedDonations === 1 ? 'task' : 'tasks'} in progress
                  </span>
                </div>
                <p className="text-xs text-amber-900/85 leading-relaxed">
                  When the volunteer or NGO driver arrives at your kitchen/loading dock, ask for their 4-digit Pickup Code, enter it into the card below, and click <strong>"Verify & Release Food"</strong> to release custody.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-3 py-2 rounded-xl border border-amber-300/80 whitespace-nowrap shrink-0 self-start sm:self-center flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Two-Party Security PIN Active</span>
              </div>
            </div>
          )}

          {statusFilter === 'completed' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900">
                    NGO-Confirmed Rescues
                  </span>
                  <span className="text-xs font-bold text-forest-900">
                    {completedRescues} food rescues successfully delivered & verified
                  </span>
                </div>
                <p className="text-xs text-emerald-900/85 leading-relaxed">
                  These meals were delivered safely to community shelters and inspected upon receipt. Every confirmed portion earned +2 reward points towards your zero-waste certification tier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('rewards')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition shadow-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-300" />
                <span>View Rewards Ledger &rarr;</span>
              </button>
            </div>
          )}

          {/* Grid Layout: Main Feed (2 cols) & Contextual Sidebar (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Contextual Feeds */}
            <div className="lg:col-span-2 space-y-6">
              {/* When statusFilter is 'claimed', prioritize Incoming Claims at the very top */}
              {statusFilter === 'claimed' && (
                <>
                  {/* Section: Incoming Claims Prioritized */}
                  <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-warm-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black text-stone-900">Active Volunteer Handoffs & OTP Release</h2>
                        <p className="text-xs text-stone-500">Verify arriving volunteer OTPs to release food packages</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {filteredIncomingClaims.length} active
                      </span>
                    </div>

                    <div className="divide-y divide-warm-100">
                      {filteredIncomingClaims.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-500">
                          No pending volunteer handoffs requiring OTP verification right now.
                        </div>
                      ) : (
                        filteredIncomingClaims.map((claim) => (
                          <div key={claim.id} className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={claim.status} />
                                <span className="text-xs font-bold text-stone-900">
                                  {claim.recipient?.organization_name || claim.recipient?.full_name || 'Community Recipient'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600">
                                Reserved <strong>{claim.quantity_claimed} portions</strong> of{' '}
                                <em>{claim.donation?.title || 'Food batch'}</em>
                              </p>
                              <div className="text-[11px] text-stone-400 flex items-center gap-2 flex-wrap">
                                <span>Contact: {claim.recipient?.phone || '+91 98711 22334'}</span>
                                <span>•</span>
                                <span>Reserved {new Date(claim.claimed_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="w-full xl:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start xl:self-center shrink-0">
                              {claim.status === 'claimed' && (
                                <div className="w-full xl:w-auto bg-emerald-50/90 p-3 rounded-2xl border border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-forest-900 block whitespace-nowrap">
                                      Volunteer Arrived · Enter OTP:
                                    </span>
                                    {claim.pickup_code && (
                                      <span className="text-[11px] font-mono font-black text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-3xs shrink-0">
                                        {claim.pickup_code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        maxLength={4}
                                        placeholder={claim.pickup_code || "4-digit OTP"}
                                        value={pickupCodeInput[claim.id] || ''}
                                        onChange={(e) =>
                                          setPickupCodeInput((prev) => ({
                                            ...prev,
                                            [claim.id]: e.target.value.replace(/D/g, ''),
                                          }))
                                        }
                                        className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold text-center border border-emerald-300 rounded-xl focus:border-forest-900 focus:outline-hidden bg-white text-stone-900 shadow-2xs"
                                        title="Enter the 4-digit code shown on volunteer's screen"
                                      />
                                      {claim.pickup_code && pickupCodeInput[claim.id] !== claim.pickup_code && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPickupCodeInput((prev) => ({
                                              ...prev,
                                              [claim.id]: claim.pickup_code || '',
                                            }))
                                          }
                                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline px-1 py-0.5 cursor-pointer whitespace-nowrap"
                                          title="Quick fill code from volunteer screen"
                                        >
                                          Auto-fill
                                        </button>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyPickupHandoff(claim.id)}
                                      disabled={verifyingClaimId === claim.id}
                                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 active:bg-forest-950 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                      <span>{verifyingClaimId === claim.id ? 'Verifying...' : 'Verify & Release Food'}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                              {claim.status === 'collected' && (
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 shrink-0">
                                  <Truck className="w-3.5 h-3.5 text-blue-600" /> Handed Over · In Transit
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Section: My Food Donations (Filtered) - Hidden on Completed filter */}
              {statusFilter !== 'completed' && (
                <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-warm-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-stone-900">
                        {statusFilter === 'available'
                          ? 'Available Surplus Food Batches'
                          : statusFilter === 'claimed'
                          ? 'Food Batches in Dispatch / Transit'
                          : 'My Food Donations'}
                      </h2>
                      <p className="text-xs text-stone-500">
                        {statusFilter === 'available'
                          ? 'Open surplus batches ready for NGO pickup'
                          : statusFilter === 'claimed'
                          ? 'Surplus meal batches reserved and en-route'
                          : 'Live inventory of surplus meal batches'}
                      </p>
                    </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-warm-100 text-stone-700">
                      {filteredDonations.length} {filteredDonations.length === 1 ? 'batch' : 'batches'}
                    </span>
                    <Link
                      to="/my-donations"
                      className="text-xs font-bold text-forest-900 hover:text-forest-950 flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-warm-100">
                  {filteredDonations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-500 space-y-3">
                      <div>
                        {statusFilter === 'available'
                          ? 'No active surplus batches available right now.'
                          : statusFilter === 'claimed'
                          ? 'No food batches are currently claimed or in-transit.'
                          : 'No food donations found matching your criteria.'}
                      </div>
                      {statusFilter === 'available' && (
                        <Link
                          to="/donate"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Create New Donation</span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    filteredDonations.map((d) => (
                      <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                        <div className="flex items-start gap-3.5">
                          <CloudinaryImage
                            publicId={d.cloudinary_public_id}
                            src={d.image_url || undefined}
                            fallbackSrc={d.fallback_unsplash_url || undefined}
                            alt={d.title}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-warm-200"
                            containerClassName="w-14 h-14 rounded-2xl overflow-hidden shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={d.status} />
                              <span className="text-[11px] font-semibold text-stone-400 capitalize">
                                {d.category.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-stone-900 mt-1 line-clamp-1">
                              <Link to={`/donations/${d.id}`} className="hover:text-forest-900">
                                {d.title}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                              <span className="font-semibold text-stone-700">
                                {d.quantity_available} / {d.quantity_total} {d.quantity_unit} left
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Pickup by: {new Date(d.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Link
                            to={`/donations/${d.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-forest-900 bg-warm-100 hover:bg-warm-200 transition"
                          >
                            Inspect
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}

              {/* Section: Incoming Claims (Rendered below Donations when statusFilter is NOT 'claimed') */}
              {statusFilter !== 'claimed' && statusFilter !== 'available' && (
                <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-warm-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-stone-900">
                        {statusFilter === 'completed'
                          ? 'Shelter Verified Delivery Receipts'
                          : 'Incoming Claims & Reservations'}
                      </h2>
                      <p className="text-xs text-stone-500">
                        {statusFilter === 'completed'
                          ? 'Deliveries safely received and confirmed by recipient shelters'
                          : 'NGOs and community shelters requesting this food'}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-forest-900">
                      {filteredIncomingClaims.length} records
                    </span>
                  </div>

                  <div className="divide-y divide-warm-100">
                    {filteredIncomingClaims.length === 0 ? (
                      <div className="p-8 text-center text-xs text-stone-500">
                        {statusFilter === 'completed'
                          ? 'No completed delivery receipts found.'
                          : 'No pending claims on your active donations. When an NGO reserves food, it will appear here.'}
                      </div>
                    ) : (
                      filteredIncomingClaims.map((claim) => (
                        <div key={claim.id} className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={claim.status} />
                              <span className="text-xs font-bold text-stone-900">
                                {claim.recipient?.organization_name || claim.recipient?.full_name || 'Community Recipient'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600">
                              Reserved <strong>{claim.quantity_claimed} portions</strong> of{' '}
                              <em>{claim.donation?.title || 'Food batch'}</em>
                            </p>
                            <div className="text-[11px] text-stone-400 flex items-center gap-2 flex-wrap">
                              <span>Contact: {claim.recipient?.phone || '+91 98711 22334'}</span>
                              <span>•</span>
                              <span>Reserved {new Date(claim.claimed_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="w-full xl:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start xl:self-center shrink-0">
                            {claim.status === 'claimed' && (
                              <div className="w-full xl:w-auto bg-emerald-50/90 p-3 rounded-2xl border border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-forest-900 block whitespace-nowrap">
                                    Volunteer Arrived · Enter OTP:
                                  </span>
                                  {claim.pickup_code && (
                                    <span className="text-[11px] font-mono font-black text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-3xs shrink-0">
                                      {claim.pickup_code}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      maxLength={4}
                                      placeholder={claim.pickup_code || "4-digit OTP"}
                                      value={pickupCodeInput[claim.id] || ''}
                                      onChange={(e) =>
                                        setPickupCodeInput((prev) => ({
                                          ...prev,
                                          [claim.id]: e.target.value.replace(/D/g, ''),
                                        }))
                                      }
                                      className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold text-center border border-emerald-300 rounded-xl focus:border-forest-900 focus:outline-hidden bg-white text-stone-900 shadow-2xs"
                                      title="Enter the 4-digit code shown on volunteer's screen"
                                    />
                                    {claim.pickup_code && pickupCodeInput[claim.id] !== claim.pickup_code && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPickupCodeInput((prev) => ({
                                            ...prev,
                                            [claim.id]: claim.pickup_code || '',
                                          }))
                                        }
                                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline px-1 py-0.5 cursor-pointer whitespace-nowrap"
                                        title="Quick fill code from volunteer screen"
                                      >
                                        Auto-fill
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyPickupHandoff(claim.id)}
                                    disabled={verifyingClaimId === claim.id}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 active:bg-forest-950 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                    <span>{verifyingClaimId === claim.id ? 'Verifying...' : 'Verify & Release Food'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                            {claim.status === 'collected' && (
                              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 shrink-0">
                                <Truck className="w-3.5 h-3.5 text-blue-600" /> Handed Over · In Transit
                              </span>
                            )}
                            {claim.status === 'delivered' && (
                              <div className="text-left xl:text-right shrink-0">
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified by NGO
                                </span>
                                <span className="text-[10px] text-forest-900 font-bold block mt-1">
                                  +{Math.min(200, 30 + (claim.portions_delivered_confirmed || claim.quantity_claimed) * 2)} pts in Rewards
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Contextual Guidance & Guidelines */}
            <div className="space-y-6">
              {/* Contextual Guidance Card based on statusFilter */}
              {statusFilter === 'claimed' ? (
                <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 shadow-xs space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Loading Dock Handshake</span>
                  </div>
                  <h3 className="text-sm font-black text-amber-950">
                    Step-by-Step Courier Handoff
                  </h3>
                  <ol className="text-xs text-amber-900/90 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Confirm driver's badge & NGO identity.</li>
                    <li>Inspect driver's thermal bags / containers.</li>
                    <li>Verify the 4-digit code and click <strong>Verify & Release</strong>.</li>
                    <li>Food transitions to <em>In-Transit</em> status automatically.</li>
                  </ol>
                </div>
              ) : statusFilter === 'available' ? (
                <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200 shadow-xs space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-blue-700" />
                    <span>Surplus Reservation Tips</span>
                  </div>
                  <h3 className="text-sm font-black text-blue-950">
                    Maximizing Rescue Speed
                  </h3>
                  <ul className="text-xs text-blue-900/90 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Give at least 90 minutes lead time before closing.</li>
                    <li>Mention container type (trays, boxes, bread crates).</li>
                    <li>Add accurate portion counts to avoid shelter shortages.</li>
                  </ul>
                </div>
              ) : statusFilter === 'completed' ? (
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Zero-Waste Performance</span>
                  </div>
                  <h3 className="text-sm font-black text-emerald-950">
                    Verified Food Impact
                  </h3>
                  <p className="text-xs text-emerald-900/90 leading-relaxed">
                    You have diverted surplus meals from landfill, feeding families while building your verified ESG score.
                  </p>
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-bold text-forest-900">
                    <span>Total Awarded:</span>
                    <span className="text-emerald-700 font-extrabold">{totalPoints} pts</span>
                  </div>
                </div>
              ) : (
                <div className="bg-forest-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Food Safety Guidelines
                  </div>
                  <h3 className="text-base font-black">Proper Storage & Temperature</h3>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Cooked food must be kept above 60°C or refrigerated below 5°C. Ensure thermal containers are sealed before volunteer collection.
                  </p>
                </div>
              )}

              {/* Quick Action Shortcuts Card */}
              <div className="bg-white rounded-3xl border border-warm-200 p-5 shadow-xs space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Quick Donor Actions
                </span>
                <div className="space-y-2 text-xs font-semibold">
                  <Link
                    to="/donate"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-warm-50 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <span>Post Food Surplus Batch</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>

                  <Link
                    to="/browse"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-warm-50 hover:bg-warm-100 text-stone-700 transition"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-stone-500" />
                      <span>Browse Public Food Feed</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveTab('rewards')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-warm-50 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 transition cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Donor Rewards & Audit Ledger</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
{/* TAB 2: DONOR REWARDS & IMPACT LEDGER */}
      {activeTab === 'rewards' && (
        <div className="space-y-8">
          {/* Hero Tier Card */}
          <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Verified Donor Impact Ledger
                  </span>
                  <span className="text-xs text-emerald-200 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Auditable Persisted Data
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Zero-Waste Kitchen Recognition Program
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Every meal you divert from waste feeds hungry families in your city. Points are awarded exclusively upon successful, recipient NGO-confirmed delivery.
                </p>
              </div>

              {/* Total Points Balance Widget */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 text-center shrink-0 min-w-[200px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Total Awarded Points
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {rewardsSummary?.points_balance || 0}
                </div>
                <div className="text-[11px] text-emerald-200/80 mt-0.5 font-medium">
                  {rewardsSummary?.verified_rescues_count || 0} Verified Rescues Delivered
                </div>
              </div>
            </div>

            {/* Tier Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-emerald-200 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Current Tier: <strong className="text-white">{rewardsSummary?.current_tier || 'Bronze Community Kitchen'}</strong>
                </span>
                <span>
                  {rewardsSummary?.points_balance || 0} / {rewardsSummary?.next_tier_threshold || 300} pts to next tier
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((rewardsSummary?.points_balance || 0) /
                        (rewardsSummary?.next_tier_threshold || 300)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Transparent Reward Formula & Rules */}
          <div className="bg-white rounded-3xl border border-warm-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Transparent Donor Points Formula & Integrity Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="font-bold text-stone-900 block">Base Rescue Award</span>
                <p className="text-stone-600 leading-relaxed">
                  <strong>{DONOR_REWARD_RULES.BASE_POINTS_PER_DELIVERY} points</strong> awarded per successfully completed and NGO-confirmed food delivery.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="font-bold text-stone-900 block">Confirmed Quantity Bonus</span>
                <p className="text-stone-600 leading-relaxed">
                  <strong>+{DONOR_REWARD_RULES.POINTS_PER_PORTION} points</strong> per confirmed portion safely received and inspected by the recipient shelter.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
                <span className="font-bold text-stone-900 block">Maximum Cap per Claim</span>
                <p className="text-stone-600 leading-relaxed">
                  Capped at <strong>{DONOR_REWARD_RULES.MAX_POINTS_PER_DELIVERY} points</strong> per claim to reward substantial donations while guarding against point inflation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Tamper-Resistant Delivery Verification:</strong> Points are calculated on the server and awarded <em>only</em> after the recipient NGO confirms delivery and verifies portions received. No points are granted for merely creating a listing, reservation, transit pickup, cancellation, or disputed deliveries. Duplicate awards are cryptographically rejected if delivery confirmation is retried.
              </div>
            </div>
          </div>

          {/* CSR / ESG Certificate & Future Recognition Notice */}
          <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-emerald-950">
                    ESG Recognition & Corporate Partner Incentives (Illustrative Demo Concept)
                  </h4>
                  <span className="text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                    Demo Feature
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  SharePlate donor points translate into verifiable ESG impact reports and waste-diversion certificates for commercial kitchens and university cafeterias. Commercial voucher redemption and tax-deductible donation receipts represent future partner integration concepts.
                </p>
              </div>
            </div>
          </div>

          {/* Donor Rewards Ledger Table */}
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-900">
                  Donor Rewards & Points Audit Ledger
                </h3>
                <p className="text-xs text-stone-500">
                  Immutable record of recipient-confirmed food rescue deliveries and awarded points.
                </p>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {rewardsSummary?.history.length || 0} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-warm-100/60 text-stone-600 font-semibold border-b border-warm-200">
                    <th className="py-3 px-5">Award Date</th>
                    <th className="py-3 px-5">Food Donation</th>
                    <th className="py-3 px-5">Recipient NGO</th>
                    <th className="py-3 px-5 text-right">Confirmed Qty</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Points</th>
                    <th className="py-3 px-5">Calculation Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {!rewardsSummary || rewardsSummary.history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-500">
                        No delivery rewards recorded yet. Points are automatically credited when an NGO confirms food delivery receipt.
                      </td>
                    </tr>
                  ) : (
                    rewardsSummary.history.map((record) => (
                      <tr key={record.id} className="hover:bg-warm-50/50 transition">
                        <td className="py-3.5 px-5 font-medium text-stone-700 whitespace-nowrap">
                          {new Date(record.confirmed_at || record.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-stone-900 max-w-[220px]">
                          {record.donation_id ? (
                            <Link
                              to={`/donations/${record.donation_id}`}
                              className="hover:text-forest-900 hover:underline line-clamp-1"
                            >
                              {record.donation_title}
                            </Link>
                          ) : (
                            <span className="line-clamp-1">{record.donation_title}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-stone-700 font-medium">
                          {record.recipient_name}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-stone-900 text-right whitespace-nowrap">
                          {record.portions_confirmed} portions
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          {record.status === 'awarded' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Delivered & Awarded
                            </span>
                          )}
                          {record.status === 'forfeited' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Forfeited (Disputed)
                            </span>
                          )}
                          {record.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Awaiting NGO Confirmation
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-black text-right whitespace-nowrap">
                          {record.status === 'awarded' ? (
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              +{record.points} pts
                            </span>
                          ) : (
                            <span className="text-stone-400">0 pts</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-[11px] text-stone-500 max-w-[280px] truncate" title={record.reason}>
                          {record.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
