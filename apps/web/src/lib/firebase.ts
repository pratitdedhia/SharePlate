/**
 * Firebase Firestore Cloud Database Client
 * Accessible from anywhere without local SQL setup
 */

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSySharePlateHacktober2026DemoKey",
  authDomain: "shareplate-2026.firebaseapp.com",
  projectId: "shareplate-hackdays-2026",
  storageBucket: "shareplate-2026.appspot.com",
};

export const getFirebaseConfig = (): FirebaseConfig => {
  const saved = localStorage.getItem('shareplate_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultFirebaseConfig;
    }
  }
  return defaultFirebaseConfig;
};
