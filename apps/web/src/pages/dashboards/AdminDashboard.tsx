import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { demoStore } from '../../lib/mockData';
import { adminService } from '../../services/admin';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
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
  UserPlus,
  Edit2,
  Trash2,
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  Phone,
  Mail,
  Filter,
  Eye,
  CheckCircle,
  UserCheck,
  UserX,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'insights' | 'users' | 'donations' | 'claims' | 'reports'
  const [activeTab, setActiveTab] = useState<'insights' | 'users' | 'donations' | 'claims' | 'reports'>('insights');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [donationSearch, setDonationSearch] = useState('');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState('all');

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Form States for Add / Edit User
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    role: 'donor' as 'donor' | 'recipient' | 'volunteer' | 'admin',
    organization_name: '',
    city: 'Delhi NCR',
    phone: '',
  });

  const loadData = async () => {
    try {
      const donationsRes = await donationsService.getDonations();
      setDonations(donationsRes.data);

      const claimsRes = await claimsService.getAllClaims();
      setClaims(claimsRes);

      setUsers(await adminService.getUsers());
      setReports(await adminService.getReports());
      setActivityLogs(await adminService.getActivityLogs());
    } catch (err: any) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useLiveUpdates(loadData);

  // User Actions
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const u = users.find((x) => x.id === userId);
      const newStatus = await adminService.toggleUserStatus(userId, Boolean(u?.is_active));
      await loadData();
      success(`User status updated: ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`);
    } catch (err: any) {
      error(err.message || 'Failed to update user status');
    }
  };

  const handleOpenAddUser = () => {
    setUserFormData({
      full_name: '',
      email: '',
      role: 'donor',
      organization_name: '',
      city: 'Delhi NCR',
      phone: '',
    });
    setShowAddUserModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.full_name || !userFormData.email) {
      error('Name and email are required');
      return;
    }
    try {
      const newUser = await adminService.createUser({
        full_name: userFormData.full_name,
        email: userFormData.email,
        role: userFormData.role,
        organization_name: userFormData.organization_name || undefined,
        city: userFormData.city || 'Delhi NCR',
        phone: userFormData.phone || undefined,
      });
      await loadData();
      setShowAddUserModal(false);
      success(`Account for ${newUser.full_name} (${newUser.role}) created successfully!`);
    } catch (err: any) {
      error(err.message || 'Failed to create user');
    }
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setSelectedUser(u);
    setUserFormData({
      full_name: u.full_name,
      email: u.email || '',
      role: u.role,
      organization_name: u.organization_name || '',
      city: u.city || 'Delhi NCR',
      phone: u.phone || '',
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const updated = await adminService.updateUser(selectedUser.id, {
        full_name: userFormData.full_name,
        role: userFormData.role,
        organization_name: userFormData.organization_name || undefined,
        city: userFormData.city,
        phone: userFormData.phone || undefined,
      });
      await loadData();
      setShowEditUserModal(false);
      setSelectedUser(null);
      success(`User ${updated.full_name} updated successfully!`);
    } catch (err: any) {
      error(err.message || 'Failed to update user');
    }
  };

  const handleOpenDeleteConfirm = (u: UserProfile) => {
    setSelectedUser(u);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      await loadData();
      setShowDeleteConfirmModal(false);
      setSelectedUser(null);
      success('User account deleted permanently.');
    } catch (err: any) {
      error(err.message || 'Could not delete user.');
    }
  };

  const handleResolveReport = async (
    reportId: string,
    resolution: 'resolved' | 'dismissed' | 'investigating',
    adminNotes?: string
  ) => {
    try {
      await adminService.updateReport(reportId, resolution, adminNotes);
      await loadData();
      success(`Safety report marked as ${resolution}.`);
    } catch (err: any) {
      error(err.message || 'Failed to update report');
    }
  };

  const handleIssueWarning = async (restaurantName: string, reason: string) => {
    try {
      await adminService.issueRestaurantWarning(restaurantName, reason, user?.full_name || 'Platform Administrator');
      await loadData();
      success(`Official warning recorded and issued to ${restaurantName}.`);
    } catch (err: any) {
      error(err.message || 'Failed to issue restaurant warning');
    }
  };

  // Metrics Calculations
  const impact = demoStore.getImpactMetrics();
  const totalUsers = users.length;
  const totalDonations = donations.length;
  const activeClaimsCount = claims.filter((c) => c.status === 'claimed' || c.status === 'collected').length;
  const deliveredClaimsCount = claims.filter((c) => c.status === 'delivered').length;
  const openReportsCount = reports.filter((r) => r.status === 'open' || r.status === 'investigating').length;

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.organization_name && u.organization_name.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredDonations = donations.filter((d) => {
    const q = donationSearch.toLowerCase();
    const donorName = d.donor?.organization_name || d.donor?.full_name || '';
    return (
      d.title.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      donorName.toLowerCase().includes(q)
    );
  });

  const filteredClaims = claims.filter((c) => {
    const q = claimSearch.toLowerCase();
    const matchesQuery =
      c.donation?.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.donation?.donor?.organization_name || '').toLowerCase().includes(q);
    const matchesStatus = claimStatusFilter === 'all' || c.status === claimStatusFilter;
    return matchesQuery && matchesStatus;
  });

  // Category counts for graph
  const categoryBreakdown = donations.reduce((acc: Record<string, number>, d) => {
    acc[d.category] = (acc[d.category] || 0) + (d.quantity_total || 0);
    return acc;
  }, {});

  // City counts
  const cityBreakdown = donations.reduce((acc: Record<string, number>, d) => {
    acc[d.city] = (acc[d.city] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Account Indicator */}
      <DemoAccountBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-900 text-white shadow-xs">
              Superadmin Central Command
            </span>
            <span className="text-xs text-stone-500 font-semibold">Platform Full Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            SharePlate Administration & Insights
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Audit donors and recipients, manage all user logins, inspect full analytics graphs, and oversee platform integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-warm-100 hover:bg-warm-200 text-stone-800 transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
            <span>Sync Live Data</span>
          </button>
          <button
            onClick={handleOpenAddUser}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-forest-900 hover:bg-forest-800 text-white transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
            <span>+ Add New User</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>All User Accounts</span>
            <Users className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalUsers}</div>
          <div className="text-[11px] text-stone-500">Donors, NGOs, Runners & Admins</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Portions Listed</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">{impact.portionsListed}</div>
          <div className="text-[11px] text-stone-500">Across {totalDonations} surplus batches</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Portions Rescued</span>
            <PackageCheck className="w-4 h-4 text-forest-900" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{impact.portionsDelivered}</div>
          <div className="text-[11px] text-stone-500">{impact.rescueRatePercent}% platform rescue rate</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>In-Transit Claims</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">{activeClaimsCount}</div>
          <div className="text-[11px] text-stone-500">Awaiting or in active delivery</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>CO₂e Avoided</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">~{impact.estimatedCo2eSavedKg} kg</div>
          <div className="text-[11px] text-stone-500">Calculated via UNEP benchmark</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-warm-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'insights'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-warm-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Full Insights & Graphs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-warm-100'
          }`}
        >
          <Users className="w-4 h-4 text-purple-300" />
          <span>All User Logins ({totalUsers})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'donations'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:bg-warm-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
          <span>Who Donated ({totalDonations})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'claims'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-warm-100'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-blue-300" />
          <span>Who Received ({claims.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'reports'
              ? 'bg-rose-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-warm-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-300" />
          <span>Safety Reports ({openReportsCount})</span>
        </button>
      </div>

      {/* TAB 1: FULL INSIGHTS & GRAPHS */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Visual Funnel and Rescue Rate Progress */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">Platform Rescue Funnel & Volume</h2>
                <p className="text-xs text-stone-500">Derived from unified impact calculation engine</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-forest-900 border border-emerald-300">
                Rescue Rate: {impact.rescueRatePercent}%
              </span>
            </div>

            {/* Visual Funnel Bars */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-stone-700">
                  <span>1. Listed by Kitchens & Donors</span>
                  <span className="font-extrabold text-stone-900">{impact.portionsListed} Portions (100%)</span>
                </div>
                <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden border border-warm-200">
                  <div className="h-full bg-stone-800 rounded-full w-full" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-amber-800">
                  <span>2. Reserved / In Transit with Couriers</span>
                  <span className="font-extrabold">{impact.portionsReserved} Portions ({impact.portionsListed ? Math.round((impact.portionsReserved / impact.portionsListed) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-4 bg-amber-50 rounded-full overflow-hidden border border-amber-200">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${impact.portionsListed ? (impact.portionsReserved / impact.portionsListed) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-emerald-800">
                  <span>3. Rescued & Delivered to Shelters</span>
                  <span className="font-extrabold">{impact.portionsDelivered} Portions ({impact.rescueRatePercent}%)</span>
                </div>
                <div className="w-full h-4 bg-emerald-50 rounded-full overflow-hidden border border-emerald-200">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${impact.rescueRatePercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-blue-800">
                  <span>4. Currently Remaining Available for Claim</span>
                  <span className="font-extrabold">{impact.portionsAvailable} Portions ({impact.portionsListed ? Math.round((impact.portionsAvailable / impact.portionsListed) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-4 bg-blue-50 rounded-full overflow-hidden border border-blue-200">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${impact.portionsListed ? (impact.portionsAvailable / impact.portionsListed) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Graphs: Categories & Cities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Distribution Graph */}
            <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                <span>Portions Rescued by Category</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([cat, count]) => {
                  const pct = impact.portionsListed ? Math.round((count / impact.portionsListed) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-stone-700 capitalize">
                        <span>{cat.replace('_', ' ')}</span>
                        <span>{count} portions ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest-900 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* City Distribution Graph */}
            <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>City Distribution Volume</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(cityBreakdown).map(([city, count]) => {
                  const pct = totalDonations ? Math.round((count / totalDonations) * 100) : 0;
                  return (
                    <div key={city} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-stone-700">
                        <span>{city}</span>
                        <span>{count} batches ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL USER LOGINS & USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-900">All Registered User Accounts & Logins</h2>
              <p className="text-xs text-stone-500">Add, edit, deactivate, or delete user accounts across all roles</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name, email, org..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-warm-200 text-xs w-48 sm:w-64 focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-warm-200 text-xs font-semibold text-stone-700 bg-white"
              >
                <option value="all">All Roles</option>
                <option value="donor">Donors</option>
                <option value="recipient">Recipients (NGOs)</option>
                <option value="volunteer">Volunteers (Runners)</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                  <th className="p-4 font-bold">User Identity</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Organization</th>
                  <th className="p-4 font-bold">City & Phone</th>
                  <th className="p-4 font-bold">Account Status</th>
                  <th className="p-4 font-bold text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-warm-50/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{u.full_name}</div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{u.email || `${u.id.slice(0, 8)}@shareplate.org`}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : u.role === 'donor'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : u.role === 'recipient'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-700 font-medium">
                      {u.organization_name || 'Individual Contributor'}
                    </td>
                    <td className="p-4 text-stone-600">
                      <div>{u.city || 'Delhi NCR'}</div>
                      <div className="text-[11px] text-stone-400">{u.phone || '+91 98765 43210'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${
                        u.is_active !== false ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${u.is_active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.is_active !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-warm-200 transition"
                          title="Edit User Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            u.is_active !== false
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {u.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteConfirm(u)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WHO DONATED (DONATIONS & DONORS) */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-900">Donations Ledger (Who Donated)</h2>
              <p className="text-xs text-stone-500">Complete record of institutional donors, surplus batches, and compliance</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food, donor, city..."
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-warm-200 text-xs w-64 focus:outline-hidden focus:border-forest-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                  <th className="p-4 font-bold">Food Surplus Item</th>
                  <th className="p-4 font-bold">Donor Institution</th>
                  <th className="p-4 font-bold">Donor Contact</th>
                  <th className="p-4 font-bold">Portions (Available / Total)</th>
                  <th className="p-4 font-bold">Batch Status</th>
                  <th className="p-4 font-bold text-right">Listing Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-warm-50/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{d.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold bg-warm-100 text-stone-700 px-2 py-0.5 rounded capitalize">
                          {d.category.replace('_', ' ')}
                        </span>
                        {d.dietary_type && (
                          <span className="text-[10px] font-semibold bg-emerald-50 text-forest-900 px-2 py-0.5 rounded">
                            {d.dietary_type === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900">
                        {d.donor?.organization_name || d.donor?.full_name || 'Registered Institution'}
                      </div>
                      <div className="text-[11px] text-stone-400">{d.city}</div>
                    </td>
                    <td className="p-4 text-stone-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{d.donor?.phone || '+91 98100 23456'}</span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Prepared: {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-stone-900">
                        {d.quantity_available} / {d.quantity_total} {d.quantity_unit}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Pickup by: {new Date(d.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/donations/${d.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-forest-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WHO RECEIVED (CLAIMS & RECIPIENTS) */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-900">Distribution Ledger (Who Received)</h2>
              <p className="text-xs text-stone-500">Every community claim, recipient NGO, and delivery verification stream</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search claim, food, NGO..."
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-warm-200 text-xs w-48 sm:w-64 focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <select
                value={claimStatusFilter}
                onChange={(e) => setClaimStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-warm-200 text-xs font-semibold text-stone-700 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="claimed">Claimed (Pending Pickup)</option>
                <option value="collected">Collected (In Transit)</option>
                <option value="delivered">Delivered (Rescued)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                  <th className="p-4 font-bold">Recipient NGO / Beneficiary</th>
                  <th className="p-4 font-bold">Food Surplus Item</th>
                  <th className="p-4 font-bold">Origin Donor</th>
                  <th className="p-4 font-bold">Portions Claimed</th>
                  <th className="p-4 font-bold">Lifecycle Status</th>
                  <th className="p-4 font-bold text-right">Activity Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-warm-50/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-stone-900">
                        {c.recipient?.organization_name || c.recipient?.full_name || 'Robin Hood Army'}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>Registered Community NGO</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900">
                        {c.donation?.title || 'Surplus Meal Package'}
                      </div>
                      <div className="text-[11px] text-stone-400">Claim ID: {c.id.slice(0, 8)}</div>
                      {(c.is_flagged_to_admin || c.complaint) && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('reports')}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 px-2 py-0.5 rounded-md mt-1 cursor-pointer transition"
                          title="View grievance in moderation queue"
                        >
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>Flagged Complaint</span>
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-stone-700">
                      {c.donation?.donor?.organization_name || c.donation?.donor?.full_name || 'DTU Canteen'}
                    </td>
                    <td className="p-4">
                      <span className="font-black text-sm text-forest-900">
                        {c.quantity_claimed} {c.donation?.quantity_unit || 'portions'}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4 text-right text-stone-500">
                      <div>Claimed: {new Date(c.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      {c.delivered_at && (
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          Delivered: {new Date(c.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY & MODERATION QUEUE */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-700" />
                <h2 className="text-lg font-black text-stone-900">Safety & Restaurant Moderation Queue</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Investigate user complaints against restaurants, food quality issues, and compliance grievances
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                {openReportsCount} Pending Attention
              </span>
            </div>
          </div>

          <div className="divide-y divide-warm-100">
            {reports.length === 0 ? (
              <div className="p-10 text-center text-xs text-stone-500">
                No active complaints or safety reports filed.
              </div>
            ) : (
              reports.map((report) => {
                const restName =
                  report.restaurant_name ||
                  report.donation?.donor?.organization_name ||
                  report.donation?.donor?.full_name ||
                  'Registered Donor Kitchen';

                return (
                  <div key={report.id} className="p-5 hover:bg-warm-50/50 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            report.status === 'open'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : report.status === 'investigating'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {report.status}
                        </span>

                        <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Restaurant: {restName}</span>
                        </span>

                        {report.claim_id && (
                          <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            Claim ID: {report.claim_id.slice(0, 8)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400">
                        Filed: {new Date(report.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Complaint details */}
                    <div className="bg-warm-50/70 p-3.5 rounded-2xl border border-warm-200/80 space-y-1.5 text-xs">
                      <div className="font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Category: {report.reason}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-warm-200/50">
                        "{report.description}"
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500 pt-1">
                        {report.reporter_name && (
                          <div>
                            <span className="font-semibold text-stone-700">Reported By:</span>{' '}
                            {report.reporter_name} ({report.reporter_role || 'user'})
                          </div>
                        )}
                        {report.reporter_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{report.reporter_phone}</span>
                          </div>
                        )}
                        {report.donation?.title && (
                          <div>
                            <span className="font-semibold text-stone-700">Food Item:</span>{' '}
                            {report.donation.title}
                          </div>
                        )}
                      </div>

                      {report.admin_notes && (
                        <div className="text-[11px] text-stone-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2">
                          <span className="font-bold text-amber-900">Admin Action Note:</span> {report.admin_notes}
                        </div>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {report.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report.id, 'investigating', 'Safety team actively reviewing restaurant logs')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                        >
                          Mark Investigating
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleIssueWarning(restName, `Official warning regarding safety report (${report.reason})`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                        title="Issue warning to restaurant profile and log audit action"
                      >
                        Issue Warning to Restaurant
                      </button>

                      {report.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report.id, 'resolved', 'Issue resolved with donor kitchen')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve Grievance</span>
                        </button>
                      )}

                      {report.status !== 'dismissed' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report.id, 'dismissed', 'Report reviewed and dismissed')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 bg-warm-100 hover:bg-warm-200 transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SYSTEM AUDIT STREAM */}
      <div className="bg-white rounded-3xl border border-warm-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-warm-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              Live Governance Audit Stream
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            Real-Time State Logs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {activityLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="p-3.5 rounded-2xl bg-warm-50 border border-warm-200 space-y-1">
              <div className="font-bold text-stone-900 capitalize">{log.action.replace(/_/g, ' ')}</div>
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

      {/* MODAL: ADD NEW USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-forest-900" />
                <span>Create New User Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@kitchens.org"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-warm-200 text-xs font-semibold bg-white"
                  >
                    <option value="donor">Donor (Kitchen / Canteen)</option>
                    <option value="recipient">Recipient (NGO / Shelter)</option>
                    <option value="volunteer">Volunteer (Courier Runner)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={userFormData.city}
                    onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Community Kitchen"
                  value={userFormData.organization_name}
                  onChange={(e) => setUserFormData({ ...userFormData, organization_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-600 hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-forest-900 text-white hover:bg-forest-800 shadow-xs"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-warm-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-700" />
                <span>Edit User: {selectedUser.full_name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-warm-200 text-xs font-semibold bg-white"
                  >
                    <option value="donor">Donor</option>
                    <option value="recipient">Recipient</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={userFormData.city}
                    onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={userFormData.organization_name}
                  onChange={(e) => setUserFormData({ ...userFormData, organization_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-600 hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-purple-900 text-white hover:bg-purple-800 shadow-xs"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {showDeleteConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">Delete User Account?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to permanently delete <strong>{selectedUser.full_name}</strong>? This action will remove their profile and access rights.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-warm-100 hover:bg-warm-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
