import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { Donation, Claim } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { areCitiesCompatible, areStatesCompatible, inferStateFromCity } from '../../lib/utils';
import { DemoAccountBanner } from '../../components/common/DemoAccountBanner';
import { CloudinaryImage } from '../../components/common/CloudinaryImage';
import {
  UtensilsCrossed,
  PackageCheck,
  Clock,
  CheckCircle2,
  Building2,
  MapPin,
  ArrowRight,
  Truck,
  Heart,
  Phone,
  AlertCircle,
  ShieldAlert,
  RotateCcw,
  Filter,
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryCodeInput, setDeliveryCodeInput] = useState<Record<string, string>>({});
  const [portionsInput, setPortionsInput] = useState<Record<string, number>>({});
  const [confirmingClaimId, setConfirmingClaimId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'claimed' | 'collected' | 'delivered'>('all');
  const availableSectionRef = useRef<HTMLDivElement>(null);
  const claimsSectionRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      // 1. Available donations strictly within the recipient's operating state
      const userState = user.state || inferStateFromCity(user.city);
      const allDonations = await donationsService.getDonations({
        status: 'available',
        state: userState,
      });
      setAvailableDonations(allDonations.data);

      // 2. Claims made by this recipient organization
      const claims = await claimsService.getMyClaims(user.id, false);
      setMyClaims(claims);
    } catch (err: any) {
      console.error('Failed to load recipient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useLiveUpdates(loadData);

  const handleUpdateClaimStatus = async (claimId: string, newStatus: 'collected' | 'delivered') => {
    try {
      await claimsService.updateClaimStatus(claimId, newStatus);
      success(`Claim marked as ${newStatus}!`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Status transition failed.');
    }
  };

  const handleCancelClaim = async (claimId: string) => {
    try {
      await claimsService.cancelClaim(claimId, 'Cancelled by recipient from dashboard');
      success('Claim reservation cancelled and portions returned to kitchen.');
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to cancel claim');
    }
  };

  const handleVerifyDeliveryReceipt = async (claim: Claim) => {
    if (!user) return;
    const code = deliveryCodeInput[claim.id]?.trim();
    if (!code) {
      error('Please enter the 4-digit delivery verification code presented by the volunteer.');
      return;
    }
    const portions = portionsInput[claim.id] ?? claim.quantity_claimed;
    if (portions <= 0) {
      error('Portions received must be at least 1 portion.');
      return;
    }
    setConfirmingClaimId(claim.id);
    try {
      const res = await claimsService.confirmDelivery(claim.id, user.id, portions, code);
      success(`Delivery verified! ${res.pointsAwarded} volunteer reward points released.`);
      setDeliveryCodeInput((prev) => ({ ...prev, [claim.id]: '' }));
      await loadData();
    } catch (err: any) {
      error(err.message || 'Delivery verification failed.');
    } finally {
      setConfirmingClaimId(null);
    }
  };

  // Metrics from real database query results
  const availableCount = availableDonations.length;
  const activeClaimsCount = myClaims.filter((c) => c.status === 'claimed' || c.status === 'collected').length;
  const upcomingPickups = myClaims.filter((c) => c.status === 'claimed').length;
  const collectedDonations = myClaims.filter((c) => c.status === 'collected').length;
  const completedRescues = myClaims.filter((c) => c.status === 'delivered').length;

  const filteredClaims = myClaims.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
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
              Recipient & Community Kitchen Portal
            </span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {user?.city ? `${user.city}, ` : ''}{user?.state || inferStateFromCity(user?.city)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {user?.organization_name ? `${user.organization_name} · ` : ''}Coordinate meal reservations, view pickup logistics, and confirm distribution to community shelters.
          </p>
        </div>

        <Link
          to="/donations"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
        >
          <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
          <span>Browse Food to Claim</span>
        </Link>
      </div>

      {/* Metrics Row (Interactive Filter Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Available Donations */}
        <button
          type="button"
          onClick={() => availableSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-white hover:bg-emerald-50/50 p-5 rounded-2xl border border-warm-200 hover:border-emerald-600 shadow-xs space-y-1 text-left transition cursor-pointer group"
          title="Scroll to view available donations in your state"
        >
          <div className="text-stone-500 text-xs font-semibold flex items-center justify-between">
            <span>Available in {user?.state || inferStateFromCity(user?.city) || 'Your State'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{availableCount}</div>
          <div className="text-[11px] text-stone-500">Listings ready to claim &rarr;</div>
        </button>

        {/* My Claims */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('all');
            claimsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer space-y-1 ${
            statusFilter === 'all'
              ? 'bg-emerald-50/70 border-forest-900 ring-2 ring-forest-900 shadow-sm'
              : 'bg-white border-warm-200 hover:border-emerald-500 shadow-xs'
          }`}
          title="Click to view all claimed rescues"
        >
          <div className="text-stone-500 text-xs font-semibold">My Active Claims</div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{activeClaimsCount}</div>
          <div className="text-[11px] text-stone-500">Reserved portions</div>
        </button>

        {/* Upcoming Pickups */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('claimed');
            claimsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer space-y-1 ${
            statusFilter === 'claimed'
              ? 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-amber-500 shadow-xs'
          }`}
          title="Click to filter upcoming pickups awaiting courier"
        >
          <div className="text-stone-500 text-xs font-semibold">Upcoming Pickups</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{upcomingPickups}</div>
          <div className="text-[11px] text-stone-500">Awaiting kitchen collection</div>
        </button>

        {/* Collected Donations */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('collected');
            claimsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer space-y-1 ${
            statusFilter === 'collected'
              ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-blue-500 shadow-xs'
          }`}
          title="Click to filter donations collected and in-transit"
        >
          <div className="text-stone-500 text-xs font-semibold">Collected in Transit</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">{collectedDonations}</div>
          <div className="text-[11px] text-stone-500">En route to distribution</div>
        </button>

        {/* Completed Rescues */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('delivered');
            claimsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-5 rounded-2xl border text-left transition cursor-pointer space-y-1 col-span-2 sm:col-span-1 ${
            statusFilter === 'delivered'
              ? 'bg-emerald-50/70 border-emerald-700 ring-2 ring-emerald-700 shadow-sm'
              : 'bg-white border-warm-200 hover:border-emerald-500 shadow-xs'
          }`}
          title="Click to filter delivered and verified rescues"
        >
          <div className="text-stone-500 text-xs font-semibold">Completed Rescues</div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{completedRescues}</div>
          <div className="text-[11px] text-stone-500">Meals served to people</div>
        </button>
      </div>

      {/* Main Grid: My Claims Table & Nearby Available Food */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Claims (2 cols) */}
        <div ref={claimsSectionRef} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-stone-900">My Claimed Rescues</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-warm-100 text-stone-700">
                    {filteredClaims.length}
                  </span>
                </div>
                <p className="text-xs text-stone-500">Monitor pickup deadlines, courier transit, and confirm delivery</p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-forest-900 text-white shadow-xs'
                      : 'bg-warm-100 text-stone-600 hover:bg-warm-200'
                  }`}
                >
                  All ({myClaims.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('claimed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'claimed'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-warm-100 text-stone-600 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  Pickups ({upcomingPickups})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('collected')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'collected'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-warm-100 text-stone-600 hover:bg-blue-50 hover:text-blue-900'
                  }`}
                >
                  In Transit ({collectedDonations})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('delivered')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'delivered'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-warm-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  Delivered ({completedRescues})
                </button>
              </div>
            </div>

            <div className="divide-y divide-warm-100">
              {filteredClaims.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 space-y-3">
                  <p>You have not claimed any surplus food yet.</p>
                  <Link
                    to="/donations"
                    className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-forest-900 text-white"
                  >
                    Browse Available Donations
                  </Link>
                </div>
              ) : (
                filteredClaims.map((claim) => (
                  <div key={claim.id} className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <CloudinaryImage
                        publicId={claim.donation?.cloudinary_public_id}
                        src={claim.donation?.image_url || undefined}
                        fallbackSrc={claim.donation?.fallback_unsplash_url || undefined}
                        alt={claim.donation?.title || 'Food Donation'}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-warm-200"
                        containerClassName="w-14 h-14 rounded-2xl overflow-hidden shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={claim.status} />
                          <span className="text-xs font-bold text-stone-900">
                            {claim.quantity_claimed} portions
                          </span>
                          {(claim.is_flagged_to_admin || claim.complaint) && (
                            <span className="text-[10px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-600" /> Flagged to Admin
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 mt-1 line-clamp-1">
                          {claim.donation?.title || 'Food Donation'}
                        </h3>
                        <div className="text-xs text-stone-500 mt-0.5 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">
                              {claim.donation?.donor?.organization_name || claim.donation?.donor?.full_name || 'Donor Kitchen'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] flex-wrap">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{claim.donation?.location_label || claim.donation?.city}</span>
                            {claim.donation?.donor?.phone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 shrink-0" /> {claim.donation.donor.phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start xl:self-center shrink-0">
                      {claim.status === 'claimed' && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {claim.donation && !areStatesCompatible(user?.state || inferStateFromCity(user?.city), claim.donation?.state || inferStateFromCity(claim.donation?.city)) && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200" title="This claimed food is in a different state than your organization">
                              ⚠️ Out-of-State ({claim.donation.state || claim.donation.city})
                            </span>
                          )}
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Reserved · Awaiting Volunteer Pickup
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCancelClaim(claim.id)}
                            className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                            title="Cancel this reservation and return portions"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {claim.status === 'collected' && (
                        claim.verification_status === 'delivery_pending' ? (
                          <div className="w-full xl:w-auto bg-blue-50/90 p-3 rounded-2xl border border-blue-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 block whitespace-nowrap">
                                Volunteer Arrived · Confirm Receipt:
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] font-bold text-stone-600">Portions:</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={claim.quantity_claimed}
                                  value={portionsInput[claim.id] ?? claim.quantity_claimed}
                                  onChange={(e) =>
                                    setPortionsInput((prev) => ({
                                      ...prev,
                                      [claim.id]: parseInt(e.target.value) || 1,
                                    }))
                                  }
                                  className="w-16 px-2 py-1.5 text-xs font-bold text-center border border-blue-300 rounded-xl bg-white text-stone-900 shadow-2xs"
                                  title="Confirmed portions received"
                                />
                              </div>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="4-digit OTP"
                                value={deliveryCodeInput[claim.id] || ''}
                                onChange={(e) =>
                                  setDeliveryCodeInput((prev) => ({
                                    ...prev,
                                    [claim.id]: e.target.value.replace(/\D/g, ''),
                                  }))
                                }
                                className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold text-center border border-blue-300 rounded-xl focus:border-blue-700 focus:outline-hidden bg-white text-stone-900 shadow-2xs"
                                title="Enter 4-digit OTP shown on volunteer's screen"
                              />
                              <button
                                type="button"
                                onClick={() => handleVerifyDeliveryReceipt(claim)}
                                disabled={confirmingClaimId === claim.id}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                                <span>{confirmingClaimId === claim.id ? 'Verifying...' : 'Verify Receipt & Release Points'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" /> In Transit · Awaiting Volunteer Arrival
                          </span>
                        )
                      )}
                      {claim.status === 'delivered' && (
                        <div className="text-left xl:text-right space-y-1 shrink-0">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Delivered to Community
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            {claim.portions_delivered_confirmed || claim.quantity_claimed} portions received & verified
                          </span>
                          <Link
                            to="/my-claims"
                            className="inline-block text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
                          >
                            {claim.is_flagged_to_admin || claim.complaint ? '🚩 Review Complaint' : '🚩 Report Issue / Complaint'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Fast 1-Click Available Food Feed */}
        <div ref={availableSectionRef} className="space-y-6">
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                Available Food in {user?.state || inferStateFromCity(user?.city) || 'Your State'}
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                State Feed
              </span>
            </div>

            <div className="space-y-3.5">
              {availableDonations.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500 bg-warm-50/50 rounded-2xl border border-warm-200 space-y-1">
                  <p className="font-semibold text-stone-700">No active surplus in {user?.state || inferStateFromCity(user?.city) || 'your state'}</p>
                  <p className="text-[11px] text-stone-500">When local donors in your state post food, it will appear here immediately.</p>
                </div>
              ) : (
                availableDonations.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-warm-50/70 border border-warm-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{item.title}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-forest-800 shrink-0">
                        {item.quantity_available} portions
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center justify-between">
                      <span>{item.location_label} ({item.city})</span>
                      <Link
                        to={`/donations/${item.id}`}
                        className="font-bold text-forest-900 hover:underline flex items-center gap-0.5"
                      >
                        Reserve <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              to={`/donations?state=${encodeURIComponent(user?.state || inferStateFromCity(user?.city) || 'Delhi')}`}
              className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-forest-900 bg-warm-100 hover:bg-warm-200 transition"
            >
              Browse All {user?.state || inferStateFromCity(user?.city) || ''} Listings
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-950">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Prompt Collection Required</span>
            </div>
            <p className="text-blue-800 text-[11px]">
              Please arrive with clean meal carriers before the stated pickup deadline to preserve freshness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
