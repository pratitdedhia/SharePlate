import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { Claim } from '../types';

export const claimsService = {
  async claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Promise<Claim> {
    if (isDemoMode()) {
      return demoStore.claimDonation(donationId, recipientId, quantity, notes);
    }

    try {
      const res = await apiRequest(`/donations/${donationId}/claims`, {
        method: 'POST',
        body: JSON.stringify({ quantity, notes }),
      });
      return res.data;
    } catch {
      return demoStore.claimDonation(donationId, recipientId, quantity, notes);
    }
  },

  async getMyClaims(userId: string, isDonor: boolean): Promise<Claim[]> {
    if (isDemoMode()) {
      return demoStore.getUserClaims(userId, isDonor);
    }

    try {
      const res = await apiRequest('/claims/mine');
      return res.data || [];
    } catch {
      return demoStore.getUserClaims(userId, isDonor);
    }
  },

  async cancelClaim(claimId: string, reason?: string): Promise<Claim> {
    if (isDemoMode()) {
      return demoStore.cancelClaim(claimId);
    }

    try {
      const res = await apiRequest(`/claims/${claimId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      return res.data;
    } catch {
      return demoStore.cancelClaim(claimId);
    }
  },

  async markCollected(claimId: string, notes?: string): Promise<Claim> {
    if (isDemoMode()) {
      return demoStore.updateClaimStatus(claimId, 'collected');
    }

    try {
      const res = await apiRequest(`/claims/${claimId}/collect`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      return res.data;
    } catch {
      return demoStore.updateClaimStatus(claimId, 'collected');
    }
  },

  async markDelivered(claimId: string, notes?: string): Promise<Claim> {
    if (isDemoMode()) {
      return demoStore.updateClaimStatus(claimId, 'delivered');
    }

    try {
      const res = await apiRequest(`/claims/${claimId}/deliver`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      return res.data;
    } catch {
      return demoStore.updateClaimStatus(claimId, 'delivered');
    }
  },

  async updateClaimStatus(claimId: string, status: 'collected' | 'delivered', notes?: string): Promise<Claim> {
    if (status === 'collected') {
      return this.markCollected(claimId, notes);
    }
    return this.markDelivered(claimId, notes);
  },

  async getAllClaims(): Promise<Claim[]> {
    if (isDemoMode()) {
      return demoStore.getAllClaims();
    }

    try {
      const res = await apiRequest('/claims');
      return res.data || [];
    } catch {
      return demoStore.getAllClaims();
    }
  },
};
