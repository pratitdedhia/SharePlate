import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { UserProfile } from '../types';
import { liveUpdatesService } from './liveUpdates';

export interface AdminReport {
  id: string;
  claim_id?: string;
  donation_id?: string;
  reported_by: string;
  reporter_name?: string;
  reporter_phone?: string;
  restaurant_name?: string;
  description?: string;
  reason: string;
  status: 'pending' | 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_id: string;
  user_name: string;
  details: string;
  timestamp: string;
}

export const adminService = {
  async getUsers(): Promise<UserProfile[]> {
    if (isDemoMode()) {
      return demoStore.getUsers();
    }
    const res = await apiRequest('/admin/users');
    return res.data || [];
  },

  async createUser(userData: {
    full_name: string;
    email: string;
    role: 'donor' | 'recipient' | 'volunteer' | 'admin';
    organization_name?: string;
    city?: string;
    phone?: string;
  }): Promise<UserProfile> {
    if (isDemoMode()) {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        organization_name: userData.organization_name,
        city: userData.city || 'Delhi NCR',
        phone: userData.phone,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      demoStore.addUser(newUser);
      liveUpdatesService.notifyChange('profiles', 'INSERT', newUser);
      return newUser;
    }

    const res = await apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    liveUpdatesService.notifyChange('profiles', 'INSERT', res.data);
    return res.data;
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isDemoMode()) {
      const updated = demoStore.updateUser(userId, updates);
      if (!updated) throw new Error('User not found');
      liveUpdatesService.notifyChange('profiles', 'UPDATE', updated);
      return updated;
    }

    const res = await apiRequest(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    liveUpdatesService.notifyChange('profiles', 'UPDATE', res.data);
    return res.data;
  },

  async toggleUserStatus(userId: string, currentActive: boolean): Promise<boolean> {
    if (isDemoMode()) {
      const newStatus = demoStore.toggleUserStatus(userId);
      liveUpdatesService.notifyChange('profiles', 'UPDATE', { id: userId, is_active: newStatus });
      return newStatus;
    }

    const res = await apiRequest(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: !currentActive }),
    });
    liveUpdatesService.notifyChange('profiles', 'UPDATE', res.data);
    return res.data?.is_active ?? !currentActive;
  },

  async deleteUser(userId: string): Promise<void> {
    if (isDemoMode()) {
      demoStore.deleteUser(userId);
      liveUpdatesService.notifyChange('profiles', 'DELETE', { id: userId });
      return;
    }

    await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
    liveUpdatesService.notifyChange('profiles', 'DELETE', { id: userId });
  },

  async getReports(): Promise<AdminReport[]> {
    if (isDemoMode()) {
      return demoStore.getReports();
    }
    const res = await apiRequest('/admin/reports');
    return res.data || [];
  },

  async updateReport(
    reportId: string,
    status: 'resolved' | 'dismissed' | 'investigating',
    resolution_notes?: string
  ): Promise<AdminReport> {
    if (isDemoMode()) {
      demoStore.resolveReport(reportId, status, resolution_notes);
      const r = demoStore.getReports().find((x) => x.id === reportId) || {
        id: reportId,
        reported_by: '',
        reason: '',
        status: status,
        created_at: new Date().toISOString(),
      };
      liveUpdatesService.notifyChange('claims', 'UPDATE', { report_id: reportId });
      return r as AdminReport;
    }

    const res = await apiRequest(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution_notes }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', { report_id: reportId });
    return res.data;
  },

  async issueRestaurantWarning(
    restaurantName: string,
    reason: string,
    adminUser?: string
  ): Promise<void> {
    demoStore.issueRestaurantWarning(restaurantName, reason, adminUser);
    liveUpdatesService.notifyChange('claims', 'UPDATE', { restaurant_name: restaurantName });
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (isDemoMode()) {
      return demoStore.getActivityLogs();
    }
    const res = await apiRequest('/admin/activity');
    return res.data || [];
  },
};
