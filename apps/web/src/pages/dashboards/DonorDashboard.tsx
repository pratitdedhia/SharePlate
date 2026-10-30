import React, { useEffect, useState } from 'react';
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
import {
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
  Activity,
  Award,
  Sparkles,
  Gift,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<Claim[]>([]);
  const [rewardsSummary, setRewardsSummary] = useState<DonorRewardsSummary | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'rewards'>('listings');
  const [loading, setLoading] = useState(true);
  const [pickupCodeInput, setPickupCodeInput] = useState<Record<string, string>>({});
  const [verifyingClaimId, setVerifyingClaimId] = useState<string | null>(null);

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

      // 4. Load activity logs
      setActivityLogs(demoStore.getActivityLogs());
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
  const availableDonations = donations.filter((d) => d.status === 'available').length;
  const claimedDonations = donations.filter((d) => d.status === 'reserved' || d.status === 'claimed').length;
  const completedRescues = donations.filter((d) => d.status === 'delivered').length;
  const totalPoints = rewardsSummary?.points_balance || 0;

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

      {/* Metrics Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Donations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Listings</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-forest-800 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">{totalDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Surplus batches listed</div>
        </div>

        {/* Available Donations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Available Now</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{availableDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Ready for NGO reservation</div>
        </div>

        {/* Claimed Donations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Claimed / Transit</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">{claimedDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">In handoff or delivery</div>
        </div>

        {/* Completed Rescues */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-forest-900">{completedRescues}</div>
          <div className="text-[11px] text-stone-500 font-medium">Delivered to shelters</div>
        </div>

        {/* Donor Impact Rewards Balance */}
        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-forest-900 to-emerald-950 p-4 sm:p-5 rounded-2xl border border-emerald-800 text-white shadow-xs space-y-1 text-left hover:scale-[1.02] transition cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: My Donations (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section: My Listings */}
            <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-warm-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-stone-900">My Food Donations</h2>
                  <p className="text-xs text-stone-500">Live inventory of surplus meal batches</p>
                </div>
                <Link
                  to="/my-donations"
                  className="text-xs font-bold text-forest-900 hover:text-forest-950 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-warm-100">
                {donations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">
                    No food donations listed yet. Click "+ Create Donation" to rescue surplus food.
                  </div>
                ) : (
                  donations.slice(0, 4).map((d) => (
                    <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                      <div className="flex items-start gap-3.5">
                        {d.image_url ? (
                          <img
                            src={d.image_url}
                            alt={d.title}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-warm-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-warm-100 flex items-center justify-center shrink-0 text-stone-400">
                            <UtensilsCrossed className="w-6 h-6" />
                          </div>
                        )}
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

            {/* Section: Incoming Claims */}
            <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-warm-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-stone-900">Incoming Claims & Reservations</h2>
                  <p className="text-xs text-stone-500">NGOs and community shelters requesting this food</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-forest-900">
                  {incomingClaims.length} active
                </span>
              </div>

              <div className="divide-y divide-warm-100">
                {incomingClaims.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500">
                    No pending claims on your active donations. When an NGO reserves food, it will appear here.
                  </div>
                ) : (
                  incomingClaims.map((claim) => (
                    <div key={claim.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={claim.status} />
                          <span className="text-xs font-bold text-stone-900">
                            {claim.recipient?.organization_name || claim.recipient?.full_name || 'Community Recipient'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Reserved <strong>{claim.quantity_claimed} portions</strong> of{' '}
                          <em>{claim.donation?.title || 'Food batch'}</em>
                        </p>
                        <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-2">
                          <span>Contact: {claim.recipient?.phone || '+91 98711 22334'}</span>
                          <span>•</span>
                          <span>Reserved {new Date(claim.claimed_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-end sm:self-center">
                        {claim.status === 'claimed' && (
                          claim.verification_status === 'pickup_pending' ? (
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-300">
                              <div className="text-right sm:text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-forest-900 block">
                                  Volunteer Arrived · Enter OTP:
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="4-digit OTP"
                                  value={pickupCodeInput[claim.id] || ''}
                                  onChange={(e) =>
                                    setPickupCodeInput((prev) => ({
                                      ...prev,
                                      [claim.id]: e.target.value.replace(/\D/g, ''),
                                    }))
                                  }
                                  className="w-24 px-2 py-1.5 text-xs font-mono font-bold text-center border border-emerald-300 rounded-lg focus:border-forest-900 focus:outline-hidden bg-white text-stone-900 shadow-2xs"
                                  title="Enter the 4-digit code shown on volunteer's screen"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPickupHandoff(claim.id)}
                                  disabled={verifyingClaimId === claim.id}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1 shrink-0"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>{verifyingClaimId === claim.id ? 'Verifying...' : 'Verify & Release Food'}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Awaiting Volunteer Handover Arrival
                            </span>
                          )
                        )}
                        {claim.status === 'collected' && (
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" /> Handed Over · In Transit
                          </span>
                        )}
                        {claim.status === 'delivered' && (
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified by NGO
                            </span>
                            <span className="text-[10px] text-forest-900 font-bold block mt-0.5">
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
          </div>

          {/* Right Column: Recent Activity Feed (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-warm-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-warm-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                    Recent Activity
                  </h2>
                </div>
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                  Live Audit Stream
                </span>
              </div>

              <div className="space-y-4">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs space-y-1 relative pl-4 border-l-2 border-warm-200">
                    <div className="font-bold text-stone-800 capitalize">
                      {log.action.replace('_', ' ')}
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {log.details.title || log.details.recipient || log.details.route || 'Batch update'}
                    </div>
                    <div className="text-stone-400 text-[10px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Guidance Card */}
            <div className="bg-forest-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Food Safety Guidelines
              </div>
              <h3 className="text-base font-black">Proper Storage & Temperature</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Cooked food must be kept above 60°C or refrigerated below 5°C. Ensure thermal containers are sealed before volunteer collection.
              </p>
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
