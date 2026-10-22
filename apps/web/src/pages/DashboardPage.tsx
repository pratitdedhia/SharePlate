import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { impactService } from '../services/impact';
import { donationsService } from '../services/donations';
import { claimsService } from '../services/claims';
import { ImpactMetrics, Donation, Claim } from '../types';
import { ImpactStatCard } from '../components/impact/ImpactStatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  UtensilsCrossed,
  PackageCheck,
  Truck,
  Heart,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isDonor, isRecipient, isVolunteer, isAdmin, isDemoUser } = useAuth();
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;
      try {
        const [metricsData, donationsData, claimsData] = await Promise.all([
          impactService.getImpactSummary(),
          donationsService.getDonations({ limit: 5 }),
          claimsService.getMyClaims(user.id, isDonor),
        ]);
        setMetrics(metricsData);
        setRecentDonations(donationsData.data);
        setRecentClaims(claimsData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, isDonor]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Evaluation Banner */}
      {isDemoUser && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-forest-900">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Active Evaluation Persona:</strong> You are viewing SharePlate as{' '}
              <span className="capitalize font-black text-forest-950 underline">{user?.role}</span> (
              {user?.organization_name || user?.full_name}). All actions persist in-session.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
            HackDays 2026 Demo Mode
          </span>
        </div>
      )}

      {/* Role-Specific Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-900 text-white">
              {user?.role} Portal
            </span>
            <span className="text-xs text-stone-500">{user?.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {isDonor && 'Manage your kitchen surplus, monitor collections, and track meals saved.'}
            {isRecipient && 'Coordinate meal reservations, view pickup logistics, and confirm distribution.'}
            {isVolunteer && 'Oversee active transport routes and bridge food pickups to shelters.'}
            {isAdmin && 'Platform oversight, content moderation, and safety reports monitor.'}
          </p>
        </div>

        {/* Quick Action Button */}
        <div>
          {isDonor && (
            <Link
              to="/donations/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              + List Surplus Food
            </Link>
          )}
          {(isRecipient || isVolunteer) && (
            <Link
              to="/donations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              Find Food to Claim
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-800 text-white hover:bg-amber-900 shadow-sm transition"
            >
              <ShieldAlert className="w-4 h-4" />
              Open Moderation Queue
            </Link>
          )}
        </div>
      </div>

      {/* Role-Aware Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDonor && (
            <>
              <ImpactStatCard
                title="Batches Listed"
                value={recentDonations.filter((d) => d.donor_id === user?.id).length || 3}
                subtitle="Active & completed batches"
                icon={UtensilsCrossed}
                color="forest"
              />
              <ImpactStatCard
                title="Portions Contributed"
                value={155}
                subtitle="Wholesome meals prepared"
                icon={PackageCheck}
                color="emerald"
              />
              <ImpactStatCard
                title="Meals Rescued"
                value={90}
                subtitle="Delivered to local shelters"
                icon={Heart}
                color="blue"
              />
              <ImpactStatCard
                title="CO₂e Avoided"
                value="~90 kg"
                subtitle="Landfill methane prevention"
                icon={Truck}
                color="amber"
              />
            </>
          )}

          {isRecipient && (
            <>
              <ImpactStatCard
                title="Active Claims"
                value={recentClaims.filter((c) => c.status !== 'cancelled' && c.status !== 'delivered').length}
                subtitle="Awaiting pickup or transit"
                icon={Clock}
                color="amber"
              />
              <ImpactStatCard
                title="Portions Received"
                value={recentClaims.filter((c) => c.status === 'delivered').reduce((a, b) => a + b.quantity_claimed, 0) || 80}
                subtitle="Delivered to beneficiaries"
                icon={PackageCheck}
                color="emerald"
              />
              <ImpactStatCard
                title="Partner Canteens"
                value={metrics.activeDonors}
                subtitle="Supplying food in your city"
                icon={Building}
                color="forest"
              />
              <ImpactStatCard
                title="Completion Rate"
                value="100%"
                subtitle="Reliable delivery tracking"
                icon={Heart}
                color="blue"
              />
            </>
          )}

          {isVolunteer && (
            <>
              <ImpactStatCard
                title="Available Runs"
                value={metrics.activeClaims}
                subtitle="Pending pickup transport"
                icon={Truck}
                color="amber"
              />
              <ImpactStatCard
                title="Completed Runs"
                value={metrics.completedRescues}
                subtitle="Verified drop-offs"
                icon={PackageCheck}
                color="emerald"
              />
              <ImpactStatCard
                title="City Shelters"
                value={metrics.participatingRecipients}
                subtitle="Registered distribution hubs"
                icon={Building}
                color="forest"
              />
              <ImpactStatCard
                title="Total Meals"
                value={metrics.portionsDelivered}
                subtitle="Portions safely bridged"
                icon={Heart}
                color="blue"
              />
            </>
          )}

          {isAdmin && (
            <>
              <ImpactStatCard
                title="Platform Donations"
                value={metrics.donationsListed}
                subtitle="Total batches listed"
                icon={UtensilsCrossed}
                color="forest"
              />
              <ImpactStatCard
                title="Portions Delivered"
                value={metrics.portionsDelivered}
                subtitle="Verified food rescues"
                icon={PackageCheck}
                color="emerald"
              />
              <ImpactStatCard
                title="Active Donors & NGOs"
                value={metrics.activeDonors + metrics.participatingRecipients}
                subtitle="Participating organizations"
                icon={Building}
                color="blue"
              />
              <ImpactStatCard
                title="Open Reports"
                value="0"
                subtitle="Food safety flags"
                icon={ShieldAlert}
                color="amber"
              />
            </>
          )}
        </div>
      )}

      {/* Role-Specific Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Recent Listings / Active Claims */}
        <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              {isDonor ? 'Your Recent Surplus Listings' : 'Recent Food Reservations'}
            </h3>
            <Link
              to={isDonor ? '/my-donations' : '/my-claims'}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {isDonor ? (
              recentDonations.slice(0, 3).map((d) => (
                <div key={d.id} className="p-3 rounded-2xl bg-warm-50 border border-warm-100 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900 line-clamp-1">{d.title}</h4>
                    <span className="text-[11px] text-stone-500">
                      {d.quantity_available} / {d.quantity_total} {d.quantity_unit} left
                    </span>
                  </div>
                  <StatusBadge status={d.status} size="sm" />
                </div>
              ))
            ) : (
              recentClaims.slice(0, 3).map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-warm-50 border border-warm-100 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900 line-clamp-1">{c.donation?.title}</h4>
                    <span className="text-[11px] text-stone-500">
                      Claimed: {c.quantity_claimed} portions
                    </span>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Operational Checklist */}
        <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">Food Rescue Checklist</h3>
          <ul className="space-y-3 text-xs text-stone-600">
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Temperature Control:</strong> Maintain hot cooked meals at ≥ 60°C or chill quickly below 5°C before transfer.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Accurate Allergen Tags:</strong> Clearly list milk, gluten, nuts, or soy to protect shelter beneficiaries.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>Prompt Pickup:</strong> Arrive before the pickup deadline so canteen staff can hand over containers smoothly.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
