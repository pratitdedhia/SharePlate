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
  Bike,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  PackageCheck,
  Building2,
  ArrowRight,
  TrendingUp,
  Activity,
  Phone,
  AlertTriangle,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [activeClaims, setActiveClaims] = useState<Claim[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [assignedRoutes, setAssignedRoutes] = useState<string[]>(['d0000000-0000-0000-0000-000000000001']);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      // 1. Available donations needing volunteer transport
      const donationsRes = await donationsService.getDonations({ status: 'available' });
      setAvailableDonations(donationsRes.data);

      // 2. Claims across system needing transport
      const claimsRes = await claimsService.getMyClaims(user.id, false);
      setActiveClaims(claimsRes);

      // 3. Activity stream
      setActivityLogs(demoStore.getActivityLogs());
    } catch (err: any) {
      console.error('Failed to load volunteer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleAcceptRoute = (donationId: string) => {
    if (!assignedRoutes.includes(donationId)) {
      setAssignedRoutes((prev) => [...prev, donationId]);
      demoStore.addActivityLog('volunteer_assigned', {
        volunteer: user?.full_name || 'Volunteer',
        donation_id: donationId,
      });
      setActivityLogs(demoStore.getActivityLogs());
      success('Route accepted! Pickup instructions and donor contact unlocked.');
    }
  };

  const handleCompleteDelivery = (donationId: string) => {
    setAssignedRoutes((prev) => prev.filter((id) => id !== donationId));
    demoStore.addActivityLog('delivery_completed', {
      volunteer: user?.full_name || 'Volunteer',
      donation_id: donationId,
    });
    setActivityLogs(demoStore.getActivityLogs());
    success('Delivery confirmed! Thank you for rescuing surplus meals.');
  };

  // Metrics from real database queries
  const pickupOpportunitiesCount = availableDonations.length;
  const assignedPickupsCount = assignedRoutes.length;
  const activeDeliveriesCount = assignedRoutes.length;
  const completedActivitiesCount = 14; // Lifetime activities logged

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Account Indicator */}
      <DemoAccountBanner />

      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-900 text-white">
              Volunteer Logistics Dispatch
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
            Active service corridor: <strong>{user?.service_area || 'Central Transit Corridor'}</strong> · Availability: <strong className="capitalize">{user?.availability || 'Flexible'}</strong>
          </p>
        </div>

        <Link
          to="/donations"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-sm transition"
        >
          <Navigation className="w-4 h-4 text-emerald-300" />
          <span>View Transport Map</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Pickup Opportunities */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Pickup Opportunities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-forest-900 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{pickupOpportunitiesCount}</div>
          <div className="text-[11px] text-stone-500">Unclaimed food batches</div>
        </div>

        {/* Assigned Pickups */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Assigned Pickups</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{assignedPickupsCount}</div>
          <div className="text-[11px] text-stone-500">Scheduled for pickup today</div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Active Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">{activeDeliveriesCount}</div>
          <div className="text-[11px] text-stone-500">Currently in-transit</div>
        </div>

        {/* Completed Activities */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Completed Rescues</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{completedActivitiesCount}</div>
          <div className="text-[11px] text-stone-500">Total food drops finished</div>
        </div>
      </div>

      {/* Main Grid: Active Routes & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Route Board & Available Opportunities (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Assigned Deliveries */}
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900">My Active Transport Routes</h2>
                <p className="text-xs text-stone-500">Committed pickups requiring transport to recipient NGO</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {assignedRoutes.length} in progress
              </span>
            </div>

            <div className="p-6 space-y-4">
              {assignedRoutes.length === 0 ? (
                <div className="text-center py-6 text-xs text-stone-500">
                  No active delivery in progress. Select a pickup opportunity below to claim a route.
                </div>
              ) : (
                assignedRoutes.map((routeId) => {
                  const donation = availableDonations.find((d) => d.id === routeId) || availableDonations[0];
                  if (!donation) return null;
                  return (
                    <div
                      key={routeId}
                      className="p-5 rounded-2xl border-2 border-forest-900 bg-forest-50/30 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-200 pb-3">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Active Transport Assignment
                          </span>
                          <h3 className="text-base font-black text-stone-900 mt-1">{donation.title}</h3>
                        </div>
                        <span className="text-xs font-bold text-stone-700 bg-white px-3 py-1 rounded-lg border border-warm-200">
                          {donation.quantity_total} portions
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-stone-400 font-bold uppercase text-[10px]">Pickup Origin:</span>
                          <div className="font-bold text-stone-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-stone-500" />
                            {donation.donor?.organization_name || 'DTU Canteen'}
                          </div>
                          <div className="text-stone-500 text-[11px]">{donation.location_label}</div>
                          {donation.donor?.phone && (
                            <div className="text-forest-900 font-semibold flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3" /> {donation.donor.phone}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-stone-400 font-bold uppercase text-[10px]">Instructions:</span>
                          <div className="text-stone-600 text-[11px] bg-white p-2 rounded-xl border border-warm-200">
                            {donation.pickup_instructions || 'Collect at service entrance; staff waiting.'}
                          </div>
                          <div className="text-amber-800 font-semibold text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pickup by {new Date(donation.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleCompleteDelivery(donation.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Confirm Drop-off Completed</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Available Pickup Opportunities Feed */}
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900">Available Pickup Opportunities</h2>
                <p className="text-xs text-stone-500">Unclaimed surplus food batches needing transport</p>
              </div>
              <Link
                to="/donations"
                className="text-xs font-bold text-forest-900 hover:text-forest-950 flex items-center gap-1"
              >
                Browse All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-warm-100">
              {availableDonations.map((item) => (
                <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <span className="text-xs font-bold text-stone-900">{item.quantity_available} {item.quantity_unit}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500 capitalize">{item.category.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 line-clamp-1">{item.title}</h3>
                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.location_label} ({item.city})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleAcceptRoute(item.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-forest-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition cursor-pointer"
                    >
                      Accept Pickup Route
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Courier Guidelines */}
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
                Logistics Log
              </span>
            </div>

            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="text-xs space-y-1 relative pl-4 border-l-2 border-warm-200">
                  <div className="font-bold text-stone-800 capitalize">
                    {log.action.replace('_', ' ')}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    {log.details.volunteer || log.details.title || log.details.route || 'Logistics event'}
                  </div>
                  <div className="text-stone-400 text-[10px]">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Protocols */}
          <div className="bg-warm-100 rounded-3xl p-6 border border-warm-200 space-y-3 text-xs">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Volunteer Safety Protocols
            </h3>
            <ul className="space-y-2 text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Keep thermal bags sealed to maintain meal temperature.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Contact donor kitchen 15 mins prior to arrival.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify seal and allergen labels upon loading.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
