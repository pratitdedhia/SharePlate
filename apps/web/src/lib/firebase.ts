import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import {
  INITIAL_DEMO_DONATIONS,
  INITIAL_DEMO_CLAIMS,
  DEMO_PROFILES,
  SAMPLE_RESCUE_TASKS,
  demoStore,
} from './mockData';
import { Donation, Claim, UserProfile, RescueTask } from '../types';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCcWlUFJKndQyDVUSPpLLMmaWwomHowP_k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shareplate-57783.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shareplate-57783',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shareplate-57783.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1075617712212',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1075617712212:web:ab667a7e6b1c3652ec45c1',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-945TEWG4F3',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('<<FILL') &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('<<FILL')
);

// Initialize Firebase App singleton safely
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Initialize analytics if supported in current browser environment
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {
      // Analytics unsupported in headless or non-browser environments
    });
  } catch (err) {
    console.warn('[Firebase] Initialization notice:', err);
  }
}

export { app, auth, db, storage, analytics };

let cachedFirestoreHealth: { reachable: boolean; checkedAt: number } | null = null;

/**
 * Checks if Cloud Firestore API is active and database is provisioned.
 * Prevents continuous retries or unhandled promise rejections if the user
 * has not yet clicked "Create Database" in Firebase Console.
 */
export async function isFirestoreOnline(): Promise<boolean> {
  if (!db || !isFirebaseConfigured) return false;

  const now = Date.now();
  if (cachedFirestoreHealth && (now - cachedFirestoreHealth.checkedAt < 30000)) {
    return cachedFirestoreHealth.reachable;
  }

  try {
    const probeTimeout = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 2500);
    });

    const checkPromise = (async () => {
      const probeDoc = doc(db!, '_health', 'probe');
      await getDoc(probeDoc);
      return true;
    })();

    const result = await Promise.race([checkPromise, probeTimeout]);
    cachedFirestoreHealth = { reachable: result, checkedAt: now };
    return result;
  } catch (err: any) {
    cachedFirestoreHealth = { reachable: false, checkedAt: now };
    return false;
  }
}

/**
 * Seed & Store all current actual data into Firestore.
 * Ensures the collections (users, donations, claims, rescue_tasks) exist and are populated.
 */
export async function seedActualDataToFirestore(): Promise<{
  usersCount: number;
  donationsCount: number;
  claimsCount: number;
  tasksCount: number;
}> {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized.');
  }

  const firestore = db;
  let usersCount = 0;
  let donationsCount = 0;
  let claimsCount = 0;
  let tasksCount = 0;

  try {
    // 1. Seed Users / Profiles (including active profile from localStorage if any)
    const usersCollection = collection(firestore, 'users');
    const existingUsers = await getDocs(usersCollection);
    if (existingUsers.empty) {
      const batch = writeBatch(firestore);
      const profilesMap = { ...DEMO_PROFILES };
      
      if (typeof localStorage !== 'undefined') {
        const rawUser = localStorage.getItem('shareplate_current_user');
        if (rawUser) {
          try {
            const activeUser = JSON.parse(rawUser);
            if (activeUser?.id) {
              profilesMap[activeUser.role || 'donor'] = {
                ...profilesMap[activeUser.role || 'donor'],
                ...activeUser,
              };
            }
          } catch {}
        }
      }

      for (const profile of Object.values(profilesMap)) {
        const userRef = doc(firestore, 'users', profile.id);
        batch.set(userRef, {
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        usersCount++;
      }
      await batch.commit();
    } else {
      usersCount = existingUsers.size;
    }

    // 2. Seed Donations (from demoStore to capture all actual donations)
    const donationsCollection = collection(firestore, 'donations');
    const existingDonations = await getDocs(donationsCollection);
    if (existingDonations.empty) {
      const batch = writeBatch(firestore);
      const donationsToSeed = demoStore ? demoStore.getDonations({ status: 'all' }) : INITIAL_DEMO_DONATIONS;
      for (const donation of donationsToSeed) {
        const donationRef = doc(firestore, 'donations', donation.id);
        batch.set(donationRef, {
          ...donation,
          created_at: donation.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        donationsCount++;
      }
      await batch.commit();
    } else {
      donationsCount = existingDonations.size;
    }

    // 3. Seed Claims
    const claimsCollection = collection(firestore, 'claims');
    const existingClaims = await getDocs(claimsCollection);
    if (existingClaims.empty) {
      const batch = writeBatch(firestore);
      const claimsToSeed = demoStore ? demoStore.getAllClaims() : INITIAL_DEMO_CLAIMS;
      for (const claim of claimsToSeed) {
        const claimRef = doc(firestore, 'claims', claim.id);
        batch.set(claimRef, {
          ...claim,
          updated_at: new Date().toISOString(),
        });
        claimsCount++;
      }
      await batch.commit();
    } else {
      claimsCount = existingClaims.size;
    }

    // 4. Seed Rescue Tasks
    const tasksCollection = collection(firestore, 'rescue_tasks');
    const existingTasks = await getDocs(tasksCollection);
    if (existingTasks.empty) {
      const batch = writeBatch(firestore);
      const tasksToSeed = demoStore ? demoStore.getRescueTasks() : SAMPLE_RESCUE_TASKS;
      for (const task of tasksToSeed) {
        const taskRef = doc(firestore, 'rescue_tasks', task.id);
        batch.set(taskRef, {
          ...task,
          updated_at: new Date().toISOString(),
        });
        tasksCount++;
      }
      await batch.commit();
    } else {
      tasksCount = existingTasks.size;
    }

    console.info(`[Firebase] Firestore populated successfully: ${usersCount} users, ${donationsCount} donations, ${claimsCount} claims, ${tasksCount} tasks.`);
    return { usersCount, donationsCount, claimsCount, tasksCount };
  } catch (err: any) {
    console.error('[Firebase] Failed to seed actual data to Firestore:', err);
    throw err;
  }
}
