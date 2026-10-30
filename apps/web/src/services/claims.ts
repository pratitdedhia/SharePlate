import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { Claim, RescueTask, VolunteerTripPlan, VolunteerRewardsSummary, DonorRewardsSummary } from '../types';
import { liveUpdatesService } from './liveUpdates';

export const claimsService = {
  async claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.claimDonation(donationId, recipientId, quantity, notes);
      liveUpdatesService.notifyChange('claims', 'INSERT', claim);
      liveUpdatesService.notifyChange('donations', 'UPDATE', { id: donationId });
      return claim;
    }

    const res = await apiRequest(`/donations/${donationId}/claims`, {
      method: 'POST',
      body: JSON.stringify({ quantity, notes }),
    });
    liveUpdatesService.notifyChange('claims', 'INSERT', res.data);
    liveUpdatesService.notifyChange('donations', 'UPDATE', { id: donationId });
    return res.data;
  },

  async getMyClaims(userId: string, isDonor: boolean): Promise<Claim[]> {
    if (isDemoMode()) {
      return demoStore.getUserClaims(userId, isDonor);
    }

    const res = await apiRequest('/claims/mine');
    return res.data || [];
  },

  async getAllClaims(params: { status?: string; donation_id?: string } = {}): Promise<Claim[]> {
    if (isDemoMode()) {
      let claims = demoStore.getAllClaims();
      if (params.status && params.status !== 'all') {
        claims = claims.filter((c) => c.status === params.status);
      }
      if (params.donation_id) {
        claims = claims.filter((c) => c.donation_id === params.donation_id);
      }
      return claims;
    }

    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params.donation_id) searchParams.set('donation_id', params.donation_id);

    const res = await apiRequest(`/claims?${searchParams.toString()}`);
    return res.data || [];
  },

  async cancelClaim(claimId: string, reason?: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.cancelClaim(claimId);
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async markCollected(claimId: string, notes?: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.updateClaimStatus(claimId, 'collected');
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/collect`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async markDelivered(claimId: string, notes?: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.updateClaimStatus(claimId, 'delivered');
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async updateClaimStatus(claimId: string, status: 'collected' | 'delivered', notes?: string): Promise<Claim> {
    if (status === 'collected') {
      return this.markCollected(claimId, notes);
    }
    return this.markDelivered(claimId, notes);
  },

  async assignVolunteerToClaim(claimId: string, volunteerId: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.assignVolunteerToClaim(claimId, volunteerId);
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/assign-volunteer`, {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async initiatePickup(claimId: string, volunteerId: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.initiatePickup(claimId, volunteerId);
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/pickup-initiate`, {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async confirmPickup(claimId: string, confirmedByUserId: string, enteredCode?: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.confirmPickup(claimId, confirmedByUserId, enteredCode);
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/pickup-confirm`, {
      method: 'POST',
      body: JSON.stringify({ code: enteredCode, user_id: confirmedByUserId }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async initiateDelivery(claimId: string, volunteerId: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.initiateDelivery(claimId, volunteerId);
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/delivery-initiate`, {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async confirmDelivery(
    claimId: string,
    confirmedByUserId: string,
    portionsReceived: number,
    enteredCode?: string
  ): Promise<{ claim: Claim; pointsAwarded: number }> {
    if (isDemoMode()) {
      const result = demoStore.confirmDelivery(claimId, confirmedByUserId, portionsReceived, enteredCode);
      liveUpdatesService.notifyChange('claims', 'UPDATE', result.claim);
      return result;
    }

    const res = await apiRequest(`/claims/${claimId}/delivery-confirm`, {
      method: 'POST',
      body: JSON.stringify({
        portions_received: portionsReceived,
        code: enteredCode,
        user_id: confirmedByUserId,
      }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data?.claim || res.data);
    return res.data;
  },

  async disputeClaim(claimId: string, disputedByUserId: string, reason: string): Promise<Claim> {
    if (isDemoMode()) {
      const claim = demoStore.disputeClaim(claimId, disputedByUserId, reason);
      liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
      return claim;
    }

    const res = await apiRequest(`/claims/${claimId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ user_id: disputedByUserId, reason }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },

  async getVolunteerRewards(volunteerId: string): Promise<VolunteerRewardsSummary> {
    if (isDemoMode()) {
      return demoStore.getVolunteerRewards(volunteerId);
    }

    const res = await apiRequest(`/claims/volunteer/rewards?volunteer_id=${volunteerId}`);
    return res.data;
  },

  async getDonorRewards(donorId?: string): Promise<DonorRewardsSummary> {
    if (isDemoMode()) {
      const effectiveDonorId = donorId || 'a0000000-0000-0000-0000-000000000001';
      return demoStore.getDonorRewards(effectiveDonorId);
    }

    const query = donorId ? `?donor_id=${encodeURIComponent(donorId)}` : '';
    const res = await apiRequest(`/claims/donor/rewards${query}`);
    return res.data;
  },

  async getRescueTasks(corridor?: string): Promise<RescueTask[]> {
    if (isDemoMode()) {
      return demoStore.getRescueTasks(corridor);
    }

    try {
      const res = await apiRequest(`/volunteer/tasks${corridor ? `?corridor=${encodeURIComponent(corridor)}` : ''}`);
      return res.data || [];
    } catch {
      return demoStore.getRescueTasks(corridor);
    }
  },

  async getVolunteerTripPlan(volunteerId: string): Promise<VolunteerTripPlan | null> {
    if (isDemoMode()) {
      return demoStore.getVolunteerTripPlan(volunteerId);
    }

    try {
      const res = await apiRequest('/volunteer/trip-plan/active');
      return res.data || null;
    } catch {
      return demoStore.getVolunteerTripPlan(volunteerId);
    }
  },

  async createTripPlan(plan: Omit<VolunteerTripPlan, 'id' | 'created_at' | 'status'>): Promise<VolunteerTripPlan> {
    if (isDemoMode()) {
      const created = demoStore.createTripPlan(plan);
      liveUpdatesService.notifyChange('claims', 'INSERT', created);
      return created;
    }

    const res = await apiRequest('/volunteer/trip-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
    liveUpdatesService.notifyChange('claims', 'INSERT', res.data);
    return res.data;
  },

  async acceptTripPlan(planId: string): Promise<VolunteerTripPlan> {
    if (isDemoMode()) {
      const accepted = demoStore.acceptTripPlan(planId);
      liveUpdatesService.notifyChange('claims', 'UPDATE', accepted);
      return accepted;
    }

    // In backend, creating or accepting sets active status
    const plan = await this.getVolunteerTripPlan('');
    liveUpdatesService.notifyChange('claims', 'UPDATE', plan);
    return plan!;
  },

  async completeTripStop(planId: string, stopId: string): Promise<VolunteerTripPlan> {
    if (isDemoMode()) {
      const updated = demoStore.completeTripStop(planId, stopId);
      liveUpdatesService.notifyChange('claims', 'UPDATE', updated);
      return updated;
    }

    const res = await apiRequest(`/volunteer/trip-plans/${planId}/stops/${stopId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    });
    liveUpdatesService.notifyChange('claims', 'UPDATE', res.data);
    return res.data;
  },
};
