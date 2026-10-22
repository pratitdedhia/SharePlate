import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { ImpactMetrics, ActivityLog } from '../types';

export const impactService = {
  async getImpactSummary(): Promise<ImpactMetrics> {
    if (isDemoMode()) {
      return demoStore.getImpactMetrics();
    }

    try {
      const res = await apiRequest('/impact/summary');
      return res.metrics;
    } catch {
      return demoStore.getImpactMetrics();
    }
  },

  async getActivityFeed(): Promise<ActivityLog[]> {
    if (isDemoMode()) {
      return [
        {
          id: 'log-1',
          action: 'claim_delivered',
          details: { beneficiaries: 40, location: 'Noida Sector 62' },
          created_at: new Date(Date.now() - 19 * 3600000).toISOString(),
        },
        {
          id: 'log-2',
          action: 'claim_created',
          details: { claimed_quantity: 40, remaining: 20 },
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log-3',
          action: 'donation_created',
          details: { title: 'Fresh Vegetable Biryani & Raita (Hot)', portions: 45 },
          created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
        },
      ];
    }

    try {
      const res = await apiRequest('/impact/activity');
      return res.data || [];
    } catch {
      return [];
    }
  },
};
