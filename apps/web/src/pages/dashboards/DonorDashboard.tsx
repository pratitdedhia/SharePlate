import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { demoStore } from '../../lib/mockData';
import { Donation, Claim } from '../../types';
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
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<Claim[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      // 1. Load donations for this donor
      const allDonationsRes = await donationsService.getDonations();
      const myDonations = allDonationsRes.data.filter((d) => d.donor_id === user.id);
      setDonations(myDonations);

      // 2. Load incoming claims on this donor's donations
      const claims = await claimsService.getMyClaims(user.id, true);
      setIncomingClaims(claims);

      // 3. Load activity logs
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

  const handleMarkCollected = async (claimId: string) => {
    try {
      await claimsService.updateClaimStatus(claimId, 'collected');
      success('Claim marked as collected!');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update claim');
    }
  };

  const handleMarkDelivered = async (claimId: string) => {
    try {
      await claimsService.updateClaimStatus(claimId, 'delivered');
      success('Rescue marked as completed & delivered!');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update claim');
    }
  };

  // Metrics calculation from database records
  const totalDonations = donations.length;
  const availableDonations = donations.filter((d) => d.status === 'available').length;
  const claimedDonations = donations.filter((d) => d.status === 'reserved' || d.status === 'claimed').length;
  const completedRescues = donations.filter((d) => d.status === 'delivered').length;

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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donations */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Donations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-forest-800 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Listings created to date</div>
        </div>

        {/* Available Donations */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Available Now</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{availableDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Ready for community claim</div>
        </div>

        {/* Claimed Donations */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Claimed / In-Transit</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{claimedDonations}</div>
          <div className="text-[11px] text-stone-500 font-medium">Reserved by verified NGOs</div>
        </div>

        {/* Completed Rescues */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Completed Rescues</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{completedRescues}</div>
          <div className="text-[11px] text-stone-500 font-medium">Delivered to beneficiaries</div>
        </div>
      </div>

      {/* Main Grid: My Donations & Incoming Claims */}
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

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {claim.status === 'claimed' && (
                        <button
                          type="button"
                          onClick={() => handleMarkCollected(claim.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition cursor-pointer"
                        >
                          Mark Collected
                        </button>
                      )}
                      {claim.status === 'collected' && (
                        <button
                          type="button"
                          onClick={() => handleMarkDelivered(claim.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Confirm Delivered
                        </button>
                      )}
                      {claim.status === 'delivered' && (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
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
    </div>
  );
};
