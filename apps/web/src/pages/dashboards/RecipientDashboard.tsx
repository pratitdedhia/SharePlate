import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { Donation, Claim } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DemoAccountBanner } from '../../components/common/DemoAccountBanner';
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
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      // 1. Available donations to claim
      const allDonations = await donationsService.getDonations({ status: 'available' });
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

  const handleUpdateClaimStatus = async (claimId: string, newStatus: 'collected' | 'delivered') => {
    try {
      await claimsService.updateClaimStatus(claimId, newStatus);
      success(`Claim marked as ${newStatus}!`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Status transition failed.');
    }
  };

  // Metrics from real database query results
  const availableCount = availableDonations.length;
  const activeClaimsCount = myClaims.filter((c) => c.status === 'claimed' || c.status === 'collected').length;
  const upcomingPickups = myClaims.filter((c) => c.status === 'claimed').length;
  const collectedDonations = myClaims.filter((c) => c.status === 'collected').length;
  const completedRescues = myClaims.filter((c) => c.status === 'delivered').length;

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
              {user?.city || 'Delhi NCR'}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Available Donations */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="text-stone-500 text-xs font-semibold">Available Across City</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{availableCount}</div>
          <div className="text-[11px] text-stone-500">Listings ready to claim</div>
        </div>

        {/* My Claims */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="text-stone-500 text-xs font-semibold">My Active Claims</div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{activeClaimsCount}</div>
          <div className="text-[11px] text-stone-500">Reserved portions</div>
        </div>

        {/* Upcoming Pickups */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="text-stone-500 text-xs font-semibold">Upcoming Pickups</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{upcomingPickups}</div>
          <div className="text-[11px] text-stone-500">Awaiting kitchen collection</div>
        </div>

        {/* Collected Donations */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="text-stone-500 text-xs font-semibold">Collected in Transit</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">{collectedDonations}</div>
          <div className="text-[11px] text-stone-500">En route to distribution</div>
        </div>

        {/* Completed Rescues */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-stone-500 text-xs font-semibold">Completed Rescues</div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{completedRescues}</div>
          <div className="text-[11px] text-stone-500">Meals served to people</div>
        </div>
      </div>

      {/* Main Grid: My Claims Table & Nearby Available Food */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Claims (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900">My Claimed Rescues</h2>
                <p className="text-xs text-stone-500">Monitor pickup deadlines and logistics</p>
              </div>
              <Link
                to="/my-claims"
                className="text-xs font-bold text-forest-900 hover:text-forest-950 flex items-center gap-1"
              >
                View Full History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-warm-100">
              {myClaims.length === 0 ? (
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
                myClaims.map((claim) => (
                  <div key={claim.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                    <div className="flex items-start gap-3.5">
                      {claim.donation?.image_url ? (
                        <img
                          src={claim.donation.image_url}
                          alt={claim.donation.title}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-warm-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-warm-100 flex items-center justify-center shrink-0 text-stone-400">
                          <UtensilsCrossed className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={claim.status} />
                          <span className="text-xs font-bold text-stone-900">
                            {claim.quantity_claimed} portions
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 mt-1 line-clamp-1">
                          {claim.donation?.title || 'Food Donation'}
                        </h3>
                        <div className="text-xs text-stone-500 mt-0.5 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              {claim.donation?.donor?.organization_name || claim.donation?.donor?.full_name || 'Donor Kitchen'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{claim.donation?.location_label || claim.donation?.city}</span>
                            {claim.donation?.donor?.phone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {claim.donation.donor.phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {claim.status === 'claimed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateClaimStatus(claim.id, 'collected')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition cursor-pointer"
                        >
                          Mark Collected
                        </button>
                      )}
                      {claim.status === 'collected' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateClaimStatus(claim.id, 'delivered')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Confirm Delivered
                        </button>
                      )}
                      {claim.status === 'delivered' && (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Delivered to Community
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Fast 1-Click Available Food Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                Available Food Nearby
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Feed
              </span>
            </div>

            <div className="space-y-3.5">
              {availableDonations.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-2xl bg-warm-50/70 border border-warm-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-stone-900 line-clamp-1">{item.title}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-forest-800 shrink-0">
                      {item.quantity_available} portions
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>{item.location_label}</span>
                    <Link
                      to={`/donations/${item.id}`}
                      className="font-bold text-forest-900 hover:underline flex items-center gap-0.5"
                    >
                      Reserve <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/donations"
              className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-forest-900 bg-warm-100 hover:bg-warm-200 transition"
            >
              Browse All Listings
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
