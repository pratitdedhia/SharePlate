import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { Donation } from '../types';

export interface DonationFilterParams {
  category?: string;
  city?: string;
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const donationsService = {
  async getDonations(params: DonationFilterParams = {}): Promise<{ data: Donation[]; total: number }> {
    if (isDemoMode()) {
      let results = demoStore.getDonations();
      if (params.category && params.category !== 'all') {
        results = results.filter((d) => d.category === params.category);
      }
      if (params.city && params.city !== 'all') {
        results = results.filter((d) => d.city.toLowerCase().includes(params.city!.toLowerCase()));
      }
      if (params.status && params.status !== 'all') {
        results = results.filter((d) => d.status === params.status);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
      }
      return { data: results, total: results.length };
    }

    try {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.set('category', params.category);
      if (params.city) searchParams.set('city', params.city);
      if (params.search) searchParams.set('search', params.search);
      if (params.status) searchParams.set('status', params.status);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());

      const res = await apiRequest(`/donations?${searchParams.toString()}`);
      return { data: res.data || [], total: res.total || 0 };
    } catch {
      // Fallback to local demo store if API server is offline
      const results = demoStore.getDonations();
      return { data: results, total: results.length };
    }
  },

  async getDonationById(id: string): Promise<Donation> {
    if (isDemoMode()) {
      const donation = demoStore.getDonationById(id);
      if (!donation) throw new Error('Donation not found');
      return donation;
    }

    try {
      const res = await apiRequest(`/donations/${id}`);
      const data = res?.data || res;
      if (data && data.id) return data;
      throw new Error('Donation not found in API');
    } catch {
      const donation = demoStore.getDonationById(id);
      if (!donation) throw new Error('Donation not found');
      return donation;
    }
  },

  async createDonation(data: any): Promise<Donation> {
    if (isDemoMode()) {
      return demoStore.createDonation(data);
    }

    try {
      const res = await apiRequest('/donations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    } catch {
      return demoStore.createDonation(data);
    }
  },

  async cancelDonation(id: string): Promise<void> {
    if (isDemoMode()) {
      const d = demoStore.getDonationById(id);
      if (d) d.status = 'cancelled';
      return;
    }

    try {
      await apiRequest(`/donations/${id}/cancel`, { method: 'POST' });
    } catch {
      const d = demoStore.getDonationById(id);
      if (d) d.status = 'cancelled';
    }
  },
};
