import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { donationsService } from '../../services/donations';
import { claimsService } from '../../services/claims';
import { demoStore } from '../../lib/mockData';
import { adminService, AdminReport } from '../../services/admin';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { Donation, Claim, UserProfile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DemoAccountBanner } from '../../components/common/DemoAccountBanner';
import {
  Ban,
  RotateCcw,
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
  Truck,
  Sparkles,
  ShieldCheck,
  X,
  ChevronRight,
  ArrowUpRight,
  Info,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Main Tab State: 'insights' | 'users' | 'donations' | 'claims' | 'reports'
  const [activeTab, setActiveTab] = useState<'insights' | 'users' | 'donations' | 'claims' | 'reports'>('insights');

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationCategoryFilter, setDonationCategoryFilter] = useState('all');
  const [donationStatusFilter, setDonationStatusFilter] = useState('all');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Delist & Claim Moderation States
  const [delistTarget, setDelistTarget] = useState<Donation | null>(null);
  const [delistReason, setDelistReason] = useState('Administrative moderation / quality policy check');
  const [isDelisting, setIsDelisting] = useState(false);

  const [cancelClaimTarget, setCancelClaimTarget] = useState<Claim | null>(null);
  const [cancelClaimReason, setCancelClaimReason] = useState('Administrative operational adjustment');
  const [isCancellingClaim, setIsCancellingClaim] = useState(false);

  const [deleteClaimTarget, setDeleteClaimTarget] = useState<Claim | null>(null);
  const [deleteClaimReason, setDeleteClaimReason] = useState('Administrative ledger cleanup');
  const [isDeletingClaim, setIsDeletingClaim] = useState(false);


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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
    success('Platform governance metrics synchronized in real time.');
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
      success(`User account status updated: ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`);
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
      error('Full name and email are required');
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
      success(`Account for ${newUser.full_name} (${newUser.role.toUpperCase()}) created successfully!`);
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
      success(`User ${updated.full_name} profile updated successfully!`);
    } catch (err: any) {
      error(err.message || 'Failed to update user');
    }
  };

  const handleOpenDeleteConfirm = (u: UserProfile) => {
    setSelectedUser(u);
    setShowDeleteConfirmModal(true);
  };

  
  const handleConfirmAdminDelist = async () => {
    if (!delistTarget || !user) return;
    setIsDelisting(true);
    try {
      await adminService.delistDonation(delistTarget.id, delistReason, user.id);
      success(`Surplus food "${delistTarget.title}" has been delisted harmlessly.`);
      setDelistTarget(null);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delist food donation');
    } finally {
      setIsDelisting(false);
    }
  };

  const handleConfirmAdminCancelClaim = async () => {
    if (!cancelClaimTarget || !user) return;
    setIsCancellingClaim(true);
    try {
      await adminService.cancelClaim(cancelClaimTarget.id, cancelClaimReason, user.id);
      success('Claim cancelled harmlessly. Portions have been restored to the restaurant kitchen without penalties.');
      setCancelClaimTarget(null);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to cancel claim');
    } finally {
      setIsCancellingClaim(false);
    }
  };

  const handleConfirmAdminDeleteClaim = async () => {
    if (!deleteClaimTarget || !user) return;
    setIsDeletingClaim(true);
    try {
      await adminService.deleteClaim(deleteClaimTarget.id, deleteClaimReason, user.id);
      success('Claim record deleted harmlessly from ledger without penalizing restaurant or courier.');
      setDeleteClaimTarget(null);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete claim');
    } finally {
      setIsDeletingClaim(false);
    }
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
      success(`Safety report marked as ${resolution.toUpperCase()}.`);
    } catch (err: any) {
      error(err.message || 'Failed to update report');
    }
  };

  const handleIssueWarning = async (restaurantName: string, reason: string) => {
    try {
      await adminService.issueRestaurantWarning(restaurantName, reason, user?.full_name || 'Platform Administrator');
      await loadData();
      success(`Official administrative warning recorded and issued to ${restaurantName}.`);
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
  const openReportsCount = reports.filter((r) => r.status === 'open' || r.status === 'pending' || r.status === 'investigating').length;
  const resolvedReportsCount = reports.filter((r) => r.status === 'resolved' || r.status === 'dismissed').length;

  // Counts by role
  const donorsCount = users.filter((u) => u.role === 'donor').length;
  const recipientsCount = users.filter((u) => u.role === 'recipient').length;
  const volunteersCount = users.filter((u) => u.role === 'volunteer').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;

  // Unique institutions
  const uniqueDonorsCount = new Set(donations.map((d) => d.donor_id)).size;
  const uniqueRecipientsCount = new Set(claims.map((c) => c.recipient_id)).size;

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.organization_name && u.organization_name.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase()));
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const q = donationSearch.toLowerCase();
      const donorName = d.donor?.organization_name || d.donor?.full_name || '';
      const matchesQuery =
        d.title.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        donorName.toLowerCase().includes(q);
      const matchesCategory = donationCategoryFilter === 'all' || d.category === donationCategoryFilter;
      const matchesStatus = donationStatusFilter === 'all' || d.status === donationStatusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [donations, donationSearch, donationCategoryFilter, donationStatusFilter]);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const q = claimSearch.toLowerCase();
      const matchesQuery =
        (c.donation?.title || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.recipient?.organization_name || c.recipient?.full_name || '').toLowerCase().includes(q) ||
        (c.donation?.donor?.organization_name || '').toLowerCase().includes(q);
      const matchesStatus = claimStatusFilter === 'all' || c.status === claimStatusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [claims, claimSearch, claimStatusFilter]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportStatusFilter === 'all') return true;
      if (reportStatusFilter === 'open') return r.status === 'open';
      if (reportStatusFilter === 'investigating') return r.status === 'investigating';
      if (reportStatusFilter === 'resolved') return r.status === 'resolved' || r.status === 'dismissed';
      return true;
    });
  }, [reports, reportStatusFilter]);

  // Category counts for graph
  const categoryBreakdown = useMemo(() => {
    return donations.reduce((acc: Record<string, number>, d) => {
      acc[d.category] = (acc[d.category] || 0) + (d.quantity_total || 0);
      return acc;
    }, {});
  }, [donations]);

  // City counts
  const cityBreakdown = useMemo(() => {
    return donations.reduce((acc: Record<string, number>, d) => {
      acc[d.city] = (acc[d.city] || 0) + 1;
      return acc;
    }, {});
  }, [donations]);

  // Relative time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'recently';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Account Indicator */}
      <DemoAccountBanner />

      {/* Top Header & Live Status */}
      <div className="bg-gradient-to-r from-stone-900 via-forest-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500 text-white shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Superadmin Central Command
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-300 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live System Governance Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              SharePlate Administration & Insights
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Unified control plane to audit institutional donors, verify community beneficiaries, manage courier dispatch, inspect platform analytics, and moderate restaurant compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh live metrics from database and reactive store"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-stone-300'}`} />
              <span>{isRefreshing ? 'Synchronizing...' : 'Sync Live Data'}</span>
            </button>

            <button
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-stone-950 transition shadow-md cursor-pointer font-black"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>+ Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Grievance Alert Banner (Visible if open safety complaints exist) */}
      {openReportsCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-rose-950">
                Action Required: {openReportsCount} Food Safety Grievance{openReportsCount > 1 ? 's' : ''} Pending Investigation
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Recipients or volunteers filed complaints regarding food freshness, hygiene, or refused handovers. Prompt resolution is required to uphold food safety compliance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition shrink-0 cursor-pointer shadow-xs"
          >
            <span>Review Safety Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Metric Summary Cards (Click to Navigate Tabs) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Users */}
        <div
          onClick={() => setActiveTab('users')}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-1 group relative ${
            activeTab === 'users'
              ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-purple-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>All User Logins</span>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalUsers}</div>
          <div className="text-[11px] text-purple-700 font-semibold flex items-center justify-between pt-1">
            <span>{donorsCount} Donors · {recipientsCount} NGOs</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Card 2: Donations */}
        <div
          onClick={() => setActiveTab('donations')}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-1 group relative ${
            activeTab === 'donations'
              ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-emerald-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Portions Listed</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 group-hover:scale-110 transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">{impact.portionsListed}</div>
          <div className="text-[11px] text-emerald-800 font-semibold flex items-center justify-between pt-1">
            <span>Across {totalDonations} surplus batches</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Card 3: Portions Rescued */}
        <div
          onClick={() => {
            setActiveTab('claims');
            setClaimStatusFilter('delivered');
          }}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-1 group relative ${
            activeTab === 'claims' && claimStatusFilter === 'delivered'
              ? 'border-forest-900 bg-forest-50/50 ring-2 ring-forest-900 shadow-sm'
              : 'bg-white border-warm-200 hover:border-forest-700 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Portions Rescued</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-forest-900 group-hover:scale-110 transition">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-900">{impact.portionsDelivered}</div>
          <div className="text-[11px] text-forest-900 font-semibold flex items-center justify-between pt-1">
            <span>{impact.rescueRatePercent}% platform rescue rate</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-forest-900 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Card 4: In-Transit Claims */}
        <div
          onClick={() => {
            setActiveTab('claims');
            setClaimStatusFilter('all');
          }}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-1 group relative ${
            activeTab === 'claims' && claimStatusFilter !== 'delivered'
              ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-amber-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>In-Transit Deliveries</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 group-hover:scale-110 transition">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800">{activeClaimsCount}</div>
          <div className="text-[11px] text-amber-800 font-semibold flex items-center justify-between pt-1">
            <span>Active courier dispatches</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition" />
          </div>
        </div>

        {/* Card 5: CO2e Emissions Avoided */}
        <div
          onClick={() => setActiveTab('insights')}
          className={`p-5 rounded-2xl border transition cursor-pointer space-y-1 group relative col-span-2 lg:col-span-1 ${
            activeTab === 'insights'
              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600 shadow-sm'
              : 'bg-white border-warm-200 hover:border-blue-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>CO₂e Avoided</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900">~{impact.estimatedCo2eSavedKg} kg</div>
          <div className="text-[11px] text-blue-800 font-semibold flex items-center justify-between pt-1">
            <span>UNEP carbon metric</span>
            <ChevronRight className="w-3 h-3 text-stone-400 group-hover:text-blue-800 group-hover:translate-x-0.5 transition" />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-warm-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'insights'
              ? 'bg-forest-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
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
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
          }`}
        >
          <Users className="w-4 h-4 text-purple-300" />
          <span>User Accounts ({totalUsers})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'donations'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
          <span>Food Surplus Ledger ({totalDonations})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'claims'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-blue-300" />
          <span>Distribution Claims ({claims.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'reports'
              ? 'bg-rose-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-warm-100'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${openReportsCount > 0 ? 'text-rose-400' : 'text-stone-400'}`} />
          <span>Safety Reports</span>
          {openReportsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {openReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: FULL INSIGHTS & GRAPHS */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-warm-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Rescue Efficiency</span>
              <div className="text-3xl font-black text-forest-900">{impact.rescueRatePercent}%</div>
              <p className="text-[11px] text-stone-500">Portions successfully rescued vs posted</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-warm-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Active Donor Kitchens</span>
              <div className="text-3xl font-black text-emerald-800">{uniqueDonorsCount}</div>
              <p className="text-[11px] text-stone-500">Commercial canteens & bakeries</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-warm-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Recipient Shelters</span>
              <div className="text-3xl font-black text-blue-900">{uniqueRecipientsCount}</div>
              <p className="text-[11px] text-stone-500">Verified NGOs & community hubs</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-warm-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Volunteer Fleet</span>
              <div className="text-3xl font-black text-purple-900">{volunteersCount}</div>
              <p className="text-[11px] text-stone-500">On-my-way courier runners</p>
            </div>
          </div>

          {/* Visual Funnel and Rescue Rate Progress */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">Platform Rescue Funnel & Volume</h2>
                <p className="text-xs text-stone-500">Derived from unified impact calculation engine & real claim ledger</p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-forest-900 border border-emerald-300">
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
                  <span>3. Rescued & Verified at Shelters</span>
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
                  <span>4. Remaining Available for Claim</span>
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
                <span>Portions by Food Category</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([cat, count]) => {
                  const pct = impact.portionsListed ? Math.round((count / impact.portionsListed) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-stone-700 capitalize">
                        <span>{cat.replace(/_/g, ' ')}</span>
                        <span>{count} portions ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest-900 rounded-full transition-all duration-500"
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
                <span>Regional Volume Distribution</span>
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
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
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

      {/* TAB 2: USER ACCOUNTS & LOGINS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-warm-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">User Directory & Authorization Management</h2>
                <p className="text-xs text-stone-500">Audit user profiles, manage permissions, toggle activation, or remove accounts</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, org, city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-8 py-2 rounded-xl border border-warm-200 text-xs w-64 sm:w-80 focus:outline-hidden focus:border-forest-900"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick 1-Click Role Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[
                { id: 'all', label: 'All Roles', count: totalUsers },
                { id: 'donor', label: 'Donors', count: donorsCount },
                { id: 'recipient', label: 'Recipients (NGOs)', count: recipientsCount },
                { id: 'volunteer', label: 'Volunteers', count: volunteersCount },
                { id: 'admin', label: 'Administrators', count: adminsCount },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setUserRoleFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    userRoleFilter === pill.id
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-warm-100 text-stone-600 hover:bg-warm-200'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    userRoleFilter === pill.id ? 'bg-white/20 text-white' : 'bg-warm-200 text-stone-700'
                  }`}>
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                  <th className="p-4 font-bold">User Identity</th>
                  <th className="p-4 font-bold">Assigned Role</th>
                  <th className="p-4 font-bold">Organization / Entity</th>
                  <th className="p-4 font-bold">City & Phone</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-xs text-stone-500">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const initials = u.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={u.id} className="hover:bg-warm-50/60 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-forest-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div>
                              <div className="font-black text-stone-900">{u.full_name}</div>
                              <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-stone-400" />
                                <span>{u.email || `${u.id.slice(0, 8)}@shareplate.org`}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
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
                        <td className="p-4 text-stone-800 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            <span>{u.organization_name || 'Individual Contributor'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-stone-600">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-800">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{u.city || 'Delhi NCR'}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{u.phone || '+91 98765 43210'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
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
                              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-warm-200 transition cursor-pointer"
                              title="Edit User Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                u.is_active !== false
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {u.is_active !== false ? 'Deactivate' : 'Activate'}
                            </button>

                            {u.role !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteConfirm(u)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WHO DONATED (FOOD SURPLUS LEDGER) */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-900">Surplus Food Ledger (Who Donated)</h2>
              <p className="text-xs text-stone-500">Audit institutional donors, surplus inventory batches, and food safety timelines</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search food item, donor, city..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-warm-200 text-xs w-48 sm:w-64 focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <select
                value={donationCategoryFilter}
                onChange={(e) => setDonationCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-warm-200 text-xs font-semibold text-stone-700 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="cooked_meals">Cooked Meals</option>
                <option value="bakery">Bakery</option>
                <option value="produce">Produce</option>
                <option value="dairy">Dairy</option>
              </select>

              <select
                value={donationStatusFilter}
                onChange={(e) => setDonationStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-warm-200 text-xs font-semibold text-stone-700 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-warm-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-warm-200">
                  <th className="p-4 font-bold">Food Surplus Item</th>
                  <th className="p-4 font-bold">Donor Institution</th>
                  <th className="p-4 font-bold">City & Region</th>
                  <th className="p-4 font-bold">Portions (Available / Total)</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-stone-500">
                      No surplus food listings match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-warm-50/60 transition">
                      <td className="p-4">
                        <div className="font-black text-stone-900">{d.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-warm-100 text-stone-700 px-2 py-0.5 rounded capitalize">
                            {d.category.replace(/_/g, ' ')}
                          </span>
                          {d.dietary_type && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-forest-900 border border-emerald-200 px-2 py-0.5 rounded">
                              {d.dietary_type === 'veg' ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-stone-900">
                          {d.donor?.organization_name || d.donor?.full_name || 'Registered Donor Kitchen'}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{d.donor?.phone || '+91 98100 23456'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-stone-700">
                        <div className="font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{d.city}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 truncate max-w-[180px]">{d.location_label}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-stone-900 text-sm">
                          {d.quantity_available} / {d.quantity_total} <span className="text-xs font-normal text-stone-500">{d.quantity_unit}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Pickup: {new Date(d.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                          {d.status !== 'delisted' && d.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDelistTarget(d);
                                setDelistReason('Administrative moderation / inventory audit');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition ml-2 cursor-pointer shadow-3xs"
                              title="Delist this surplus food batch"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Delist</span>
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WHO RECEIVED (DISTRIBUTION CLAIMS) */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-stone-900">Distribution Ledger (Who Received)</h2>
              <p className="text-xs text-stone-500">Audit recipient NGO reservations, courier handovers, and two-party OTP verifications</p>
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
                <option value="all">All Lifecycle Statuses</option>
                <option value="claimed">Claimed (Awaiting Pickup)</option>
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
                  <th className="p-4 font-bold">Courier / Verification</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Portions & Time</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-xs text-stone-500">
                      No distribution claims found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-warm-50/60 transition">
                      <td className="p-4">
                        <div className="font-black text-stone-900">
                          {c.recipient?.organization_name || c.recipient?.full_name || 'Community Shelter'}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          <span>{c.recipient?.full_name || 'Coordinator'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-stone-900">{c.donation?.title || 'Surplus Meal Package'}</div>
                        <div className="text-[11px] text-stone-400">Claim ID: {c.id.slice(0, 8)}</div>
                        {(c.is_flagged_to_admin || c.complaint) && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('reports')}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 px-2 py-0.5 rounded-md mt-1 cursor-pointer transition"
                            title="Inspect safety complaint in queue"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Flagged Complaint</span>
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-stone-700">
                        <div className="font-semibold">{c.donation?.donor?.organization_name || c.donation?.donor?.full_name || 'DTU Canteen'}</div>
                        <div className="text-[11px] text-stone-400">{c.donation?.city || 'Delhi NCR'}</div>
                      </td>
                      <td className="p-4 text-stone-700">
                        {c.volunteer ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-purple-950">
                            <Truck className="w-3.5 h-3.5 text-purple-700" />
                            <span>{c.volunteer.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">Direct NGO Pickup</span>
                        )}
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Verification: <span className="font-bold uppercase text-stone-700">{c.verification_status || 'unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={c.status} />
                      </td>
                                            <td className="p-4 text-right">
                        <div className="font-black text-sm text-forest-900">
                          {c.quantity_claimed} {c.donation?.quantity_unit || 'portions'}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {getRelativeTime(c.claimed_at)}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelClaimTarget(c);
                                setCancelClaimReason('Operational adjustment / logistics reschedule');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition cursor-pointer shadow-3xs"
                              title="Cancel claim harmlessly without penalty"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-700" />
                              <span>Cancel</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteClaimTarget(c);
                              setDeleteClaimReason('Administrative removal / audit cleanup');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition cursor-pointer shadow-3xs"
                            title="Delete claim record harmlessly from ledger"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SAFETY REPORTS & RESTAURANT MODERATION QUEUE */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-warm-200 shadow-xs overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="p-6 border-b border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-700" />
                <h2 className="text-lg font-black text-stone-900">Safety & Restaurant Moderation Queue</h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Investigate user complaints regarding food quality, hygiene standards, portion mismatches, or refused kitchen handovers.
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Reports', count: reports.length },
                { id: 'open', label: 'Open', count: reports.filter((r) => r.status === 'open').length },
                { id: 'investigating', label: 'Investigating', count: reports.filter((r) => r.status === 'investigating').length },
                { id: 'resolved', label: 'Resolved / Dismissed', count: resolvedReportsCount },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setReportStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    reportStatusFilter === pill.id
                      ? 'bg-rose-900 text-white shadow-2xs'
                      : 'bg-warm-100 text-stone-600 hover:bg-warm-200'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    reportStatusFilter === pill.id ? 'bg-white/20 text-white' : 'bg-warm-200 text-stone-700'
                  }`}>
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-warm-100">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-stone-800 text-sm">No safety reports match this view</div>
                <p>All recorded complaints have been investigated or resolved by platform administration.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const restName =
                  (report as any).restaurant_name ||
                  (report as any).donation?.donor?.organization_name ||
                  (report as any).donation?.donor?.full_name ||
                  'Registered Donor Kitchen';

                return (
                  <div key={report.id} className="p-6 hover:bg-warm-50/50 transition space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            report.status === 'open'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : report.status === 'investigating'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {report.status}
                        </span>

                        <span className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-stone-500" />
                          <span>Restaurant: {restName}</span>
                        </span>

                        {report.claim_id && (
                          <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            Claim ID: {report.claim_id.slice(0, 8)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400">
                        Filed {getRelativeTime(report.created_at)} ({new Date(report.created_at).toLocaleDateString()})
                      </div>
                    </div>

                    {/* Complaint details */}
                    <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200/80 space-y-2 text-xs">
                      <div className="font-black text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Issue Category: {report.reason}</span>
                      </div>

                      <p className="text-stone-800 leading-relaxed bg-white p-3 rounded-xl border border-warm-200 font-medium">
                        "{report.reason ? (report as any).description || 'No detailed description provided.' : ''}"
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500 pt-1">
                        {report.reporter_name && (
                          <div>
                            <span className="font-semibold text-stone-700">Reported By:</span>{' '}
                            {report.reporter_name}
                          </div>
                        )}
                        {(report as any).donation?.title && (
                          <div>
                            <span className="font-semibold text-stone-700">Food Item:</span>{' '}
                            {(report as any).donation.title}
                          </div>
                        )}
                      </div>

                      {report.resolution_notes && (
                        <div className="text-[11px] text-stone-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                          <span className="font-black text-amber-900">Admin Action Note:</span> {report.resolution_notes}
                        </div>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {report.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report.id, 'investigating', 'Safety team reviewing CCTV and kitchen logs')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition cursor-pointer"
                        >
                          Mark Investigating
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleIssueWarning(restName, `Official warning regarding safety report (${report.reason})`)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition cursor-pointer"
                        title="Issue warning to restaurant profile and log audit action"
                      >
                        Issue Warning to Restaurant
                      </button>

                      {report.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report.id, 'resolved', 'Complaint audited and resolved with kitchen')}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-forest-900 hover:bg-forest-800 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resolve Grievance</span>
                        </button>
                      )}

                      {report.status !== 'dismissed' && (
                        <button
                          type="button"
                          onClick={() => handleResolveReport(report.id, 'dismissed', 'Reviewed and dismissed')}
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

      {/* SYSTEM AUDIT LOG STREAM */}
      <div className="bg-white rounded-3xl border border-warm-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-warm-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-700" />
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              Live Governance Audit Stream
            </h2>
          </div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Real-Time Transactional Activity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {activityLogs.slice(0, 8).map((log) => (
            <div key={log.id} className="p-3.5 rounded-2xl bg-warm-50 border border-warm-200 space-y-1 hover:bg-warm-100/70 transition">
              <div className="font-black text-stone-900 capitalize flex items-center justify-between">
                <span>{log.action.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-stone-400 font-normal">{getRelativeTime(log.created_at || log.timestamp)}</span>
              </div>
              <div className="text-[11px] text-stone-600 truncate font-mono">
                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
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
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-forest-900" />
                <span>Create New User Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer text-sm"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Assigned Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-warm-200 text-xs font-semibold bg-white"
                  >
                    <option value="donor">Donor (Kitchen / Bakery)</option>
                    <option value="recipient">Recipient (NGO / Shelter)</option>
                    <option value="volunteer">Volunteer (Courier Runner)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Operating City</label>
                  <input
                    type="text"
                    value={userFormData.city}
                    onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Organization / Shelter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robin Hood Army or Central Canteen"
                  value={userFormData.organization_name}
                  onChange={(e) => setUserFormData({ ...userFormData, organization_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 hover:bg-warm-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-black bg-forest-900 text-white hover:bg-forest-800 shadow-xs cursor-pointer"
                >
                  Create User Account
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
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-700" />
                <span>Edit User: {selectedUser.full_name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer text-sm"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-warm-200 text-xs font-semibold bg-white"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={userFormData.organization_name}
                  onChange={(e) => setUserFormData({ ...userFormData, organization_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-xs focus:outline-hidden focus:border-forest-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-stone-600 hover:bg-warm-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-black bg-purple-900 text-white hover:bg-purple-800 shadow-xs cursor-pointer"
                >
                  Save Profile Changes
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
              <h3 className="text-base font-black text-stone-900">Delete User Account?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to permanently delete <strong>{selectedUser.full_name}</strong>? This will remove their credentials and access authorization.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-warm-100 hover:bg-warm-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="w-1/2 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN DELIST FOOD */}
      {delistTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Delist Food Batch (Admin)</h3>
                  <p className="text-xs text-stone-500">Moderation removal from public listings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDelistTarget(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Harmless Administrative Action</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Delisting removes this food item from public browsing immediately. Any active claims will be cancelled harmlessly without penalizing the donor kitchen or volunteer courier.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Reason for delisting:
              </label>
              <textarea
                rows={3}
                value={delistReason}
                onChange={(e) => setDelistReason(e.target.value)}
                placeholder="e.g. Duplicate listing, food safety moderation, kitchen request..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-rose-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDelistTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDelisting}
                onClick={handleConfirmAdminDelist}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>{isDelisting ? 'Delisting...' : 'Confirm Delist Food'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN CANCEL CLAIM (HARMLESS) */}
      {cancelClaimTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Cancel Claim (Admin Override)</h3>
                  <p className="text-xs text-stone-500">Safely restore portions without penalties</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelClaimTarget(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-forest-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Harmless Administrative Override</span>
              </div>
              <p className="text-[11px] text-forest-900/90 leading-relaxed">
                Cancelling this claim safely restores <strong>{cancelClaimTarget.quantity_claimed} portions</strong> back to the donor kitchen inventory. <strong>Neither the restaurant nor the volunteer courier will be penalized.</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Reason for cancellation:
              </label>
              <textarea
                rows={3}
                value={cancelClaimReason}
                onChange={(e) => setCancelClaimReason(e.target.value)}
                placeholder="e.g. Recipient requested schedule change, logistics route revised..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelClaimTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Keep Claim
              </button>
              <button
                type="button"
                disabled={isCancellingClaim}
                onClick={handleConfirmAdminCancelClaim}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isCancellingClaim ? 'Cancelling...' : 'Confirm Harmless Cancel'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN DELETE CLAIM (HARMLESS PURGE) */}
      {deleteClaimTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Delete Claim Record (Admin)</h3>
                  <p className="text-xs text-stone-500">Permanent record removal from ledger</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteClaimTarget(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Harmless Administrative Removal</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Deleting this claim record removes it from the distribution ledger. If undelivered, <strong>{deleteClaimTarget.quantity_claimed} portions</strong> are safely restored to the kitchen. No penalty is assessed to restaurant or volunteer.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Reason for permanent deletion:
              </label>
              <textarea
                rows={3}
                value={deleteClaimReason}
                onChange={(e) => setDeleteClaimReason(e.target.value)}
                placeholder="e.g. Test claim cleanup, erroneous entry, audit requirement..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-rose-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteClaimTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingClaim}
                onClick={handleConfirmAdminDeleteClaim}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingClaim ? 'Deleting...' : 'Permanently Delete Claim'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
