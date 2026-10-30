import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { Donation } from '../types';
import { liveUpdatesService } from './liveUpdates';

export interface DonationFilterParams {
  category?: string;
  city?: string;
  search?: string;
  status?: string;
  donor_id?: string;
  limit?: number;
  offset?: number;
}

export const donationsService = {
  async getDonations(params: DonationFilterParams = {}): Promise<{ data: Donation[]; total: number }> {
    if (isDemoMode()) {
      let results = demoStore.getDonations({
        donor_id: params.donor_id,
        category: params.category,
        city: params.city,
        status: params.status,
      });

      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
      }
      return { data: results, total: results.length };
    }

    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.city) searchParams.set('city', params.city);
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);
    if (params.donor_id) searchParams.set('donor_id', params.donor_id);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());

    const res = await apiRequest(`/donations?${searchParams.toString()}`);
    return { data: res.data || [], total: res.total || 0 };
  },

  async getMyDonations(donorId?: string): Promise<Donation[]> {
    if (isDemoMode()) {
      return demoStore.getDonations({ donor_id: donorId, status: 'all' });
    }

    const res = await apiRequest('/donations/mine');
    return res.data || [];
  },

  async getDonationById(id: string): Promise<Donation> {
    if (isDemoMode()) {
      const donation = demoStore.getDonationById(id);
      if (!donation) throw new Error('Donation not found');
      return donation;
    }

    const res = await apiRequest(`/donations/${id}`);
    const data = res?.data || res;
    if (data && data.id) return data;
    throw new Error('Donation not found');
  },

  async createDonation(data: any): Promise<Donation> {
    if (isDemoMode()) {
      const created = demoStore.createDonation(data);
      liveUpdatesService.notifyChange('donations', 'INSERT', created);
      return created;
    }

    const res = await apiRequest('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    liveUpdatesService.notifyChange('donations', 'INSERT', res.data);
    return res.data;
  },

  async cancelDonation(id: string): Promise<void> {
    if (isDemoMode()) {
      const d = demoStore.getDonationById(id);
      if (d) d.status = 'cancelled';
      liveUpdatesService.notifyChange('donations', 'UPDATE', { id, status: 'cancelled' });
      return;
    }

    await apiRequest(`/donations/${id}/cancel`, { method: 'POST' });
    liveUpdatesService.notifyChange('donations', 'UPDATE', { id, status: 'cancelled' });
  },
};
