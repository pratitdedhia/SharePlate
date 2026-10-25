import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { demoStore } from '../../lib/mockData';
import { Donation, Claim, UserProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DemoAccountBanner } from '../../components/common/DemoAccountBanner';
import {
  ShieldAlert,
  Users,
  UtensilsCrossed,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Layers,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'reports'>('reports');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const donationsRes = await donationsService.getDonations();
      setDonations(donationsRes.data);

      setUsers(demoStore.getUsers());
      setReports(demoStore.getReports());
      setActivityLogs(demoStore.getActivityLogs());
    } catch (err: any) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = (userId: string) => {
    const newStatus = demoStore.toggleUserStatus(userId);
    setUsers(demoStore.getUsers());
    success(`User account status updated: ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`);
  };

  const handleResolveReport = (reportId: string, resolution: 'resolved' | 'dismissed') => {
    demoStore.resolveReport(reportId, resolution);
    setReports(demoStore.getReports());
    success(`Safety report marked as ${resolution}.`);
  };

  // Metrics from real queries
  const totalUsers = users.length;
  const totalDonations = donations.length;
  const activeClaims = donations.filter((d) => d.status === 'reserved' || d.status === 'claimed').length;
  const completedRescues = donations.filter((d) => d.status === 'delivered').length;
  const openReportsCount = reports.filter((r) => r.status === 'open' || r.status === 'investigating').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Account Indicator */}
      <DemoAccountBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-900 text-white">
              Platform Governance & Administration
            </span>
            <span className="text-xs text-stone-500 font-semibold">Tier-1 Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            SharePlate Oversight Command
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            System metrics, user privileges, food listing moderation, and safety reports monitor.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-warm-100 hover:bg-warm-200 text-stone-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
          <span>Refresh Database Metrics</span>
        </button>
      </div>

      {/* Real Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalUsers}</div>
          <div className="text-[11px] text-stone-500">Donors, NGOs & Couriers</div>
        </div>

        {/* Total Donations */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Listings</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{totalDonations}</div>
          <div className="text-[11px] text-stone-500">Surplus batches listed</div>
        </div>

        {/* Active Claims */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Active Claims</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{activeClaims}</div>
          <div className="text-[11px] text-stone-500">In pickup or transit</div>
        </div>

        {/* Completed Rescues */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Completed Rescues</span>
            <PackageCheck className="w-4 h-4 text-forest-900" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{completedRescues}</div>
          <div className="text-[11px] text-stone-500">Delivered successfully</div>
        </div>

        {/* Reported Listings */}
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Safety Reports</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">{openReportsCount}</div>
          <div className="text-[11px] text-stone-500">Pending moderation</div>
        </div>
      </div>

      {/* Tabs for Moderation Queues */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-warm-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-rose-100 text-rose-900'
                : 'text-stone-600 hover:bg-warm-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Reported Listings ({openReportsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-purple-100 text-purple-900'
                : 'text-stone-600 hover:bg-warm-100'
            }`}
          >
            <Users className="w-4 h-4 text-purple-600" />
            <span>User Management ({totalUsers})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'listings'
                ? 'bg-forest-900 text-white'
                : 'text-stone-600 hover:bg-warm-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Listings Management ({totalDonations})</span>
          </button>
        </div>

        {/* Tab 1: Safety & Reported Listings Queue */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100">
              <h2 className="text-lg font-black text-stone-900">Safety & Allergen Moderation Queue</h2>
              <p className="text-xs text-stone-500">Flagged donations requiring administrative review</p>
            </div>

            <div className="divide-y divide-warm-100">
              {reports.map((report) => (
                <div key={report.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        report.status === 'open'
                          ? 'bg-rose-100 text-rose-900'
                          : report.status === 'investigating'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-xs font-bold text-stone-900">{report.reason}</span>
                    </div>
                    <p className="text-xs text-stone-600">{report.description}</p>
                    <div className="text-[11px] text-stone-400">
                      Report ID: {report.id} · Filed {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {report.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'resolved')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    )}
                    {report.status !== 'dismissed' && (
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report.id, 'dismissed')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-warm-100 hover:bg-warm-200 transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900">User Account Privileges</h2>
                <p className="text-xs text-stone-500">Inspect registered roles and toggle active authorization status</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-warm-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                    <th className="p-4 font-bold">User</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Organization</th>
                    <th className="p-4 font-bold">City</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-warm-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-stone-900">{u.full_name}</div>
                        <div className="text-[11px] text-stone-400">{u.email || u.id.slice(0, 8)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-900'
                            : u.role === 'donor'
                            ? 'bg-emerald-100 text-emerald-900'
                            : u.role === 'recipient'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-stone-600">{u.organization_name || '—'}</td>
                      <td className="p-4 text-stone-600">{u.city || 'Delhi NCR'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          u.is_active !== false ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {u.is_active !== false ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              u.is_active !== false
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            {u.is_active !== false ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Listings Management */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-warm-100">
              <h2 className="text-lg font-black text-stone-900">Food Listings Catalog</h2>
              <p className="text-xs text-stone-500">Live platform inventory and compliance overview</p>
            </div>

            <div className="divide-y divide-warm-100">
              {donations.map((d) => (
                <div key={d.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.status} />
                      <span className="text-xs font-bold text-stone-900">
                        {d.quantity_available} / {d.quantity_total} {d.quantity_unit}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs text-stone-500">{d.city}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900">{d.title}</h3>
                    <div className="text-[11px] text-stone-400">
                      Donor ID: {d.donor_id.slice(0, 8)} · Created {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/donations/${d.id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-forest-900 bg-warm-100 hover:bg-warm-200 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Audit Log */}
      <div className="bg-white rounded-3xl border border-warm-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-warm-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              System Audit Stream
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Immutable Activity Trail
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
              <div className="font-bold text-stone-900 capitalize">{log.action.replace('_', ' ')}</div>
              <div className="text-[11px] text-stone-500 truncate">
                {JSON.stringify(log.details)}
              </div>
              <div className="text-[10px] text-stone-400">
                {new Date(log.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
