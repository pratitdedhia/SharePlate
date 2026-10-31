import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { Claim, RescueTask, VolunteerTripPlan, VolunteerRewardsSummary, DonorRewardsSummary } from '../types';
import { liveUpdatesService } from './liveUpdates';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export const claimsService = {
  async claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Promise<Claim> {
    const claim = demoStore.claimDonation(donationId, recipientId, quantity, notes);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', claim.id), claim);
        const donation = demoStore.getDonationById(donationId);
        if (donation) {
          await updateDoc(doc(db, 'donations', donationId), {
            quantity_available: donation.quantity_available,
            status: donation.status,
            updated_at: new Date().toISOString(),
          });
        }
        console.info(`[Firebase] Claim ${claim.id} saved to Firestore.`);
      } catch (err: any) {
        console.warn('[Firebase] Firestore claimDonation sync notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'INSERT', claim);
    liveUpdatesService.notifyChange('donations', 'UPDATE', { id: donationId });
    return claim;
  },

  async getMyClaims(userId: string, isDonor: boolean): Promise<Claim[]> {
    if (db && isFirebaseConfigured && !isDemoMode()) {
      try {
        const snap = await getDocs(collection(db, 'claims'));
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Claim);
          if (isDonor) {
            return list.filter((c) => c.donation?.donor_id === userId);
          }
          return list.filter((c) => c.recipient_id === userId || c.volunteer_id === userId);
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore getMyClaims fallback:', err.message);
      }
    }

    return demoStore.getUserClaims(userId, isDonor);
  },

  async getAllClaims(params: { status?: string; donation_id?: string } = {}): Promise<Claim[]> {
    if (db && isFirebaseConfigured && !isDemoMode()) {
      try {
        const snap = await getDocs(collection(db, 'claims'));
        if (!snap.empty) {
          let list = snap.docs.map((d) => d.data() as Claim);
          if (params.status && params.status !== 'all') {
            list = list.filter((c) => c.status === params.status);
          }
          if (params.donation_id) {
            list = list.filter((c) => c.donation_id === params.donation_id);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore getAllClaims fallback:', err.message);
      }
    }

    let claims = demoStore.getAllClaims();
    if (params.status && params.status !== 'all') {
      claims = claims.filter((c) => c.status === params.status);
    }
    if (params.donation_id) {
      claims = claims.filter((c) => c.donation_id === params.donation_id);
    }
    return claims;
  },

  async cancelClaim(claimId: string, reason?: string): Promise<Claim> {
    const claim = demoStore.cancelClaim(claimId);

    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'claims', claimId), {
          status: 'cancelled',
          cancellation_reason: reason || null,
          updated_at: new Date().toISOString(),
        });
        if (claim.donation_id) {
          const donation = demoStore.getDonationById(claim.donation_id);
          if (donation) {
            await updateDoc(doc(db, 'donations', claim.donation_id), {
              quantity_available: donation.quantity_available,
              status: donation.status,
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore cancelClaim sync notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async markCollected(claimId: string, notes?: string): Promise<Claim> {
    const claim = demoStore.updateClaimStatus(claimId, 'collected');

    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'claims', claimId), {
          status: 'collected',
          pickup_notes: notes || null,
          updated_at: new Date().toISOString(),
        });
        if (claim.donation_id) {
          await updateDoc(doc(db, 'donations', claim.donation_id), {
            status: 'collected',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore markCollected notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async markDelivered(claimId: string, notes?: string): Promise<Claim> {
    const claim = demoStore.updateClaimStatus(claimId, 'delivered');

    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'claims', claimId), {
          status: 'delivered',
          delivery_notes: notes || null,
          updated_at: new Date().toISOString(),
        });
        if (claim.donation_id) {
          await updateDoc(doc(db, 'donations', claim.donation_id), {
            status: 'delivered',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore markDelivered notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async updateClaimStatus(claimId: string, status: 'collected' | 'delivered', notes?: string): Promise<Claim> {
    if (status === 'collected') {
      return this.markCollected(claimId, notes);
    }
    return this.markDelivered(claimId, notes);
  },

  async assignVolunteerToClaim(claimId: string, volunteerId: string): Promise<Claim> {
    const claim = demoStore.assignVolunteerToClaim(claimId, volunteerId);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', claim.id), claim, { merge: true });
      } catch (err: any) {
        console.warn('[Firebase] Firestore assignVolunteer notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async initiatePickup(claimId: string, volunteerId: string): Promise<Claim> {
    const claim = demoStore.initiatePickup(claimId, volunteerId);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', claim.id), claim, { merge: true });
      } catch (err: any) {
        console.warn('[Firebase] Firestore initiatePickup notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async confirmPickup(claimId: string, confirmedByUserId: string, enteredCode?: string): Promise<Claim> {
    const claim = demoStore.confirmPickup(claimId, confirmedByUserId, enteredCode);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', claim.id), claim, { merge: true });
        if (claim.donation_id) {
          await updateDoc(doc(db, 'donations', claim.donation_id), {
            status: 'collected',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore confirmPickup notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    liveUpdatesService.notifyChange('donations', 'UPDATE', { id: claim.donation_id, status: 'collected' });
    return claim;
  },

  async initiateDelivery(claimId: string, volunteerId: string): Promise<Claim> {
    const claim = demoStore.initiateDelivery(claimId, volunteerId);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', claim.id), claim, { merge: true });
      } catch (err: any) {
        console.warn('[Firebase] Firestore initiateDelivery notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async confirmDelivery(
    claimId: string,
    confirmedByUserId: string,
    portionsReceived: number,
    enteredCode?: string
  ): Promise<{ claim: Claim; pointsAwarded: number }> {
    const result = demoStore.confirmDelivery(claimId, confirmedByUserId, portionsReceived, enteredCode);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', result.claim.id), result.claim, { merge: true });
        if (result.claim.donation_id) {
          await updateDoc(doc(db, 'donations', result.claim.donation_id), {
            status: 'delivered',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore confirmDelivery notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', result.claim);
    liveUpdatesService.notifyChange('donations', 'UPDATE', { id: result.claim.donation_id, status: 'delivered' });
    return result;
  },

  async disputeClaim(claimId: string, disputedByUserId: string, reason: string): Promise<Claim> {
    const claim = demoStore.disputeClaim(claimId, disputedByUserId, reason);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', claim.id), claim, { merge: true });
      } catch (err: any) {
        console.warn('[Firebase] Firestore disputeClaim notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async fileRestaurantComplaint(
    claimId: string,
    reporterUser: { id: string; full_name?: string; role?: string; phone?: string },
    data: { reason: string; description: string; category?: string }
  ): Promise<{ claim: Claim; report: any }> {
    const result = demoStore.fileClaimComplaint(claimId, reporterUser, data);

    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'claims', result.claim.id), result.claim, { merge: true });
        await setDoc(doc(db, 'reports', result.report.id), result.report);
      } catch (err: any) {
        console.warn('[Firebase] Firestore fileRestaurantComplaint notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('claims', 'UPDATE', result.claim);
    liveUpdatesService.notifyChange('reports', 'INSERT', result.report);
    return result;
  },

  async getVolunteerRewards(volunteerId: string): Promise<VolunteerRewardsSummary> {
    return demoStore.getVolunteerRewards(volunteerId);
  },

  async getDonorRewards(donorId?: string): Promise<DonorRewardsSummary> {
    const effectiveDonorId = donorId || 'a0000000-0000-0000-0000-000000000001';
    return demoStore.getDonorRewards(effectiveDonorId);
  },

  async getRescueTasks(corridor?: string, city?: string | null, activeOrdersOnly: boolean = false): Promise<RescueTask[]> {
    if (db && isFirebaseConfigured && !isDemoMode()) {
      try {
        const snap = await getDocs(collection(db, 'rescue_tasks'));
        if (!snap.empty) {
          let tasks = snap.docs.map((d) => d.data() as RescueTask);
          if (activeOrdersOnly) {
            tasks = tasks.filter((t) => t.status === 'claimed' || t.status === 'in_transit');
          }
          if (city && city !== 'all') {
            const c = city.toLowerCase();
            tasks = tasks.filter((t) => {
              const fullInfo = `${t.corridor} ${t.pickup_location} ${t.pickup_address} ${t.dropoff_location} ${t.dropoff_address}`.toLowerCase();
              return fullInfo.includes(c);
            });
          }
          if (corridor && corridor !== 'all') {
            tasks = tasks.filter((t) => (t.corridor || '').toLowerCase().includes(corridor.toLowerCase()));
          }
          return tasks;
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore getRescueTasks fallback:', err.message);
      }
    }

    return demoStore.getRescueTasks(corridor, city, activeOrdersOnly);
  },

  async getVolunteerTripPlan(volunteerId: string): Promise<VolunteerTripPlan | null> {
    return demoStore.getVolunteerTripPlan(volunteerId);
  },

  async createTripPlan(plan: Omit<VolunteerTripPlan, 'id' | 'created_at' | 'status'>): Promise<VolunteerTripPlan> {
    const created = demoStore.createTripPlan(plan);
    liveUpdatesService.notifyChange('claims', 'INSERT', created);
    return created;
  },

  async acceptTripPlan(planId: string): Promise<VolunteerTripPlan> {
    const accepted = demoStore.acceptTripPlan(planId);
    liveUpdatesService.notifyChange('claims', 'UPDATE', accepted);
    return accepted;
  },

  async completeTripStop(planId: string, stopId: string): Promise<VolunteerTripPlan> {
    const updated = demoStore.completeTripStop(planId, stopId);
    liveUpdatesService.notifyChange('claims', 'UPDATE', updated);
    return updated;
  },

  async cancelVolunteerTripPlan(
    volunteerId: string,
    planId?: string,
    isHarmlessAdminOverride = false
  ): Promise<{ success: boolean; cancelled: boolean; penaltyApplied: boolean; penaltyPoints: number }> {
    const res = demoStore.cancelVolunteerTripPlan(volunteerId, planId, isHarmlessAdminOverride);
    liveUpdatesService.notifyChange('claims', 'UPDATE', { volunteer_id: volunteerId });
    return res;
  },

  async adminCancelClaim(claimId: string, reason?: string, adminUserId?: string): Promise<Claim> {
    const claim = demoStore.adminCancelClaim(claimId, reason, adminUserId);
    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'claims', claimId), {
          status: 'cancelled',
          notes: claim.notes,
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('[Firebase] Firestore adminCancelClaim notice:', err.message);
      }
    }
    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async adminDeleteClaim(claimId: string, reason?: string, adminUserId?: string): Promise<void> {
    demoStore.adminDeleteClaim(claimId, reason, adminUserId);
    liveUpdatesService.notifyChange('claims', 'DELETE', { id: claimId });
  },

  async simulateDonorPickup(claimId: string): Promise<Claim> {
    const claim = demoStore.simulateDonorPickupConfirmation(claimId);
    liveUpdatesService.notifyChange('claims', 'UPDATE', claim);
    return claim;
  },

  async simulateRecipientDelivery(claimId: string, portions?: number): Promise<{ claim: Claim; pointsAwarded: number }> {
    const result = demoStore.simulateRecipientDeliveryConfirmation(claimId, portions);
    liveUpdatesService.notifyChange('claims', 'UPDATE', result.claim);
    return result;
  },
};
