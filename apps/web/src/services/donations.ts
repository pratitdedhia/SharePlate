import { apiRequest, isDemoMode } from './api';
import { demoStore } from '../lib/mockData';
import { Donation } from '../types';
import { liveUpdatesService } from './liveUpdates';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { areStatesCompatible, inferStateFromCity } from '../lib/utils';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export interface DonationFilterParams {
  category?: string;
  city?: string;
  state?: string;
  search?: string;
  status?: string;
  donor_id?: string;
  limit?: number;
  offset?: number;
}

export const donationsService = {
  async getDonations(params: DonationFilterParams = {}): Promise<{ data: Donation[]; total: number }> {
    // If Firebase Firestore is configured, query Firestore collection
    if (db && isFirebaseConfigured && !isDemoMode()) {
      try {
        const snap = await getDocs(collection(db, 'donations'));
        if (!snap.empty) {
          let list: Donation[] = snap.docs.map((d) => d.data() as Donation);
          if (params.donor_id) list = list.filter((d) => d.donor_id === params.donor_id);
          if (params.category && params.category !== 'all') list = list.filter((d) => d.category === params.category);
          if (params.state && params.state !== 'all') {
            list = list.filter((d) =>
              areStatesCompatible(d.state || inferStateFromCity(d.city), params.state)
            );
          }
          if (params.city && params.city !== 'all') {
            list = list.filter((d) => (d.city || '').toLowerCase() === params.city!.toLowerCase());
          }
          if (params.status && params.status !== 'all') list = list.filter((d) => d.status === params.status);
          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter(
              (d) =>
                (d.title || '').toLowerCase().includes(q) ||
                (d.description || '').toLowerCase().includes(q)
            );
          }
          return { data: list, total: list.length };
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore read query fallback:', err.message);
      }
    }

    // Local in-memory / localStorage fallback (used for tests, offline & demo mode)
    let results = demoStore.getDonations({
      donor_id: params.donor_id,
      category: params.category,
      city: params.city,
      state: params.state,
      status: params.status,
    });

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    return { data: results, total: results.length };
  },

  async getMyDonations(donorId?: string): Promise<Donation[]> {
    if (db && isFirebaseConfigured && !isDemoMode()) {
      try {
        const snap = await getDocs(collection(db, 'donations'));
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Donation);
          return donorId ? list.filter((d) => d.donor_id === donorId) : list;
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore getMyDonations fallback:', err.message);
      }
    }

    return demoStore.getDonations({ donor_id: donorId, status: 'all' });
  },

  async getDonationById(id: string): Promise<Donation> {
    if (db && isFirebaseConfigured && !isDemoMode()) {
      try {
        const snap = await getDoc(doc(db, 'donations', id));
        if (snap.exists()) {
          return snap.data() as Donation;
        }
      } catch (err: any) {
        console.warn('[Firebase] Firestore getDonationById fallback:', err.message);
      }
    }

    const donation = demoStore.getDonationById(id);
    if (!donation) throw new Error('Donation not found');
    return donation;
  },

  async createDonation(data: any): Promise<Donation> {
    // 1. Maintain in-memory / localStorage demoStore for immediate zero-latency feedback
    const created = demoStore.createDonation(data);

    // 2. Synchronize to Firebase Firestore
    if (db && isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'donations', created.id), created);
        console.info(`[Firebase] Donation ${created.id} saved to Firestore.`);
      } catch (err: any) {
        console.warn('[Firebase] Firestore createDonation notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('donations', 'INSERT', created);
    return created;
  },

  async cancelDonation(
    id: string,
    cancelledByUserId?: string,
    userRole?: string
  ): Promise<{ donation: Donation; penaltyApplied: boolean; penaltyPoints: number }> {
    const res = demoStore.cancelDonation(id, cancelledByUserId, userRole);

    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'donations', id), {
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('[Firebase] Firestore cancelDonation notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('donations', 'UPDATE', { id, status: 'cancelled' });
    return res;
  },

  async delistDonation(
    id: string,
    reason = 'Administrative moderation',
    adminUserId?: string
  ): Promise<Donation> {
    const delisted = demoStore.adminDelistDonation(id, reason, adminUserId);

    if (db && isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'donations', id), {
          status: 'delisted',
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('[Firebase] Firestore delistDonation notice:', err.message);
      }
    }

    liveUpdatesService.notifyChange('donations', 'UPDATE', { id, status: 'delisted' });
    return delisted;
  },
};
