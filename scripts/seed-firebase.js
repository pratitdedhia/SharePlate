/**
 * Seed Firebase Firestore with all current SharePlate actual data:
 * - Users & Profiles (DEMO_PROFILES: Donor, Recipient, Volunteer, Admin)
 * - Donations (INITIAL_DONATIONS)
 * - Claims (INITIAL_CLAIMS)
 * - Rescue Tasks (INITIAL_TASKS)
 *
 * Usage:
 *   node scripts/seed-firebase.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCcWlUFJKndQyDVUSPpLLMmaWwomHowP_k",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "shareplate-57783.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "shareplate-57783",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "shareplate-57783.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1075617712212",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1075617712212:web:ab667a7e6b1c3652ec45c1",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-945TEWG4F3",
};

const DEMO_PROFILES = {
  donor_delhi: {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Priya Sharma',
    email: 'donor@shareplate.demo',
    role: 'donor',
    organization_name: 'DTU Campus Central Canteen',
    phone: '+91 98110 12345',
    city: 'Delhi NCR',
    state: 'Delhi',
    service_area: 'Rohini & Pitampura',
    donor_type: 'canteen',
    contact_person: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
  donor_mumbai: {
    id: 'a0000000-0000-0000-0000-000000000002',
    full_name: 'Chef Vikram Malhotra',
    email: 'dedhia.pratit@shareplate.demo',
    role: 'donor',
    organization_name: 'Annapurna Caterers & Banquets',
    phone: '+91 98110 99887',
    city: 'Mumbai',
    state: 'Maharashtra',
    service_area: 'BKC, Bandra & Andheri',
    donor_type: 'caterer',
    contact_person: 'dedhia.pratit',
    avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
  donor_pune: {
    id: 'a0000000-0000-0000-0000-000000000003',
    full_name: 'Amit Deshmukh',
    email: 'bakery@shareplate.demo',
    role: 'donor',
    organization_name: 'Green Leaf Bistro & Bakery',
    phone: '+91 98900 23456',
    city: 'Pune',
    state: 'Maharashtra',
    service_area: 'FC Road & Deccan Gymkhana',
    donor_type: 'restaurant',
    contact_person: 'Amit Deshmukh',
    avatar_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
  recipient: {
    id: 'b0000000-0000-0000-0000-000000000001',
    full_name: 'Rajesh Kumar',
    email: 'recipient@shareplate.demo',
    role: 'recipient',
    organization_name: 'Robin Hood Army - Delhi Chapter',
    phone: '+91 98711 22334',
    city: 'Delhi NCR',
    state: 'Delhi',
    service_area: 'North & West Delhi Community Shelters',
    recipient_type: 'ngo',
    contact_person: 'Rajesh Kumar (Distribution Coordinator)',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
  volunteer: {
    id: 'c0000000-0000-0000-0000-000000000001',
    full_name: 'Ananya Sen',
    email: 'volunteer@shareplate.demo',
    role: 'volunteer',
    organization_name: 'Youth For Food Relief',
    phone: '+91 98118 77665',
    city: 'Delhi NCR',
    state: 'Delhi',
    service_area: 'Delhi NCR Transit Corridor',
    availability: 'evenings',
    bio: 'Dedicated food rescue cyclist and delivery coordinator with 2+ years field experience.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
  admin: {
    id: 'd0000000-0000-0000-0000-000000000001',
    full_name: 'Platform Administrator',
    email: 'admin@shareplate.demo',
    role: 'admin',
    organization_name: 'SharePlate Governance & Safety Operations',
    phone: '+91 98111 00000',
    city: 'Delhi NCR',
    state: 'Delhi',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
};

const INITIAL_DONATIONS = [
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    donor_id: 'a0000000-0000-0000-0000-000000000002',
    title: 'Whole Wheat Roti & Paneer Bhurji Boxes',
    description: 'Freshly rolled phulkas (rotis) paired with spiced cottage cheese bhurji from corporate luncheon. Individually boxed in eco-friendly meal trays.',
    category: 'cooked_meals',
    quantity_total: 60,
    quantity_available: 20,
    quantity_unit: 'portions',
    ingredients: 'Whole wheat flour, cottage cheese (paneer), tomatoes, bell peppers, turmeric, mustard oil',
    allergens: 'Gluten, Dairy',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 2 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    consume_within_hours: 6,
    storage_note: 'Store sealed in eco-friendly foil meal trays away from direct sunlight.',
    pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    pickup_instructions: 'Behind Trade World Building, Loading Dock C. Contact Chef Vikram / Ramesh.',
    city: 'Mumbai',
    state: 'Maharashtra',
    location_label: 'BKC Commercial Hub, Bandra East',
    status: 'available',
    donor: {
      id: 'a0000000-0000-0000-0000-000000000002',
      full_name: 'Chef Vikram Malhotra',
      organization_name: 'Annapurna Caterers & Banquets',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '+91 98110 99887',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    donor_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Fresh Vegetable Biryani & Raita (Hot)',
    description: 'Surplus fragrant basmati rice biryani cooked with carrots, green peas, cauliflower, and mild aromatic spices from lunchtime batch. Packed in thermal containers.',
    category: 'cooked_meals',
    quantity_total: 45,
    quantity_available: 45,
    quantity_unit: 'portions',
    ingredients: 'Basmati rice, green peas, carrots, beans, onions, ghee, cumin, coriander',
    allergens: 'Dairy (ghee)',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 3 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    consume_within_hours: 6,
    storage_note: 'Keep insulated in thermal containers at 60°C+ until served.',
    pickup_deadline: new Date(Date.now() + 3 * 3600000).toISOString(),
    pickup_instructions: 'Report to Central Canteen loading gate. Mention SharePlate to Supervisor Priya.',
    city: 'Delhi NCR',
    state: 'Delhi',
    location_label: 'DTU Campus, Rohini Sector 17',
    status: 'available',
    donor: {
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Priya Sharma',
      organization_name: 'DTU Campus Central Canteen',
      city: 'Delhi NCR',
      state: 'Delhi',
      phone: '+91 98110 12345',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    donor_id: 'a0000000-0000-0000-0000-000000000003',
    title: 'Fresh Multigrain Bread Loaves & Dinner Rolls',
    description: 'Surplus morning bakery bake: nutritious multigrain seeded loaves and soft pav dinner rolls from premier Pune bakery.',
    category: 'bakery',
    quantity_total: 35,
    quantity_available: 35,
    quantity_unit: 'portions',
    ingredients: 'Wheat flour, oat flakes, sunflower seeds, yeast, water, olive oil',
    allergens: 'Gluten, Seeds',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 5 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    consume_within_hours: 24,
    storage_note: 'Keep sealed in paper bakery bags in cool, dry place.',
    pickup_deadline: new Date(Date.now() + 6 * 3600000).toISOString(),
    pickup_instructions: 'Bakery back entrance on FC Road, next to Goodluck Cafe.',
    city: 'Pune',
    state: 'Maharashtra',
    location_label: 'Deccan Gymkhana, FC Road',
    status: 'available',
    donor: {
      id: 'a0000000-0000-0000-0000-000000000003',
      full_name: 'Amit Deshmukh',
      organization_name: 'Green Leaf Bistro & Bakery',
      city: 'Pune',
      state: 'Maharashtra',
      phone: '+91 98900 23456',
    },
  },
];

const INITIAL_CLAIMS = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    donation_id: 'd0000000-0000-0000-0000-000000000001',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    volunteer_id: 'c0000000-0000-0000-0000-000000000001',
    quantity_claimed: 25,
    status: 'collected',
    pickup_code: '4821',
    delivery_code: '7392',
    pickup_confirmed_at: new Date(Date.now() - 30 * 60000).toISOString(),
    pickup_confirmed_by: 'Priya Sharma (DTU Campus Central Canteen)',
    notes: 'Urgent distribution for evening community dinner at Rohini Shelter.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

async function seed() {
  console.log(`Connecting to Firebase project: ${firebaseConfig.projectId}...`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT_FIRESTORE_NOT_READY')), 7000);
  });

  try {
    await Promise.race([
      (async () => {
        // 1. Seed Users
        console.log('Seeding users collection...');
        const usersBatch = writeBatch(db);
        for (const user of Object.values(DEMO_PROFILES)) {
          const userRef = doc(db, 'users', user.id);
          usersBatch.set(userRef, {
            ...user,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        await usersBatch.commit();
        console.log(`✓ Seeded ${Object.keys(DEMO_PROFILES).length} users into Firestore.`);

        // 2. Seed Donations
        console.log('Seeding donations collection...');
        const donBatch = writeBatch(db);
        for (const d of INITIAL_DONATIONS) {
          const donRef = doc(db, 'donations', d.id);
          donBatch.set(donRef, {
            ...d,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        await donBatch.commit();
        console.log(`✓ Seeded ${INITIAL_DONATIONS.length} donations into Firestore.`);

        // 3. Seed Claims
        console.log('Seeding claims collection...');
        const claimsBatch = writeBatch(db);
        for (const c of INITIAL_CLAIMS) {
          const claimRef = doc(db, 'claims', c.id);
          claimsBatch.set(claimRef, {
            ...c,
            updated_at: new Date().toISOString(),
          });
        }
        await claimsBatch.commit();
        console.log(`✓ Seeded ${INITIAL_CLAIMS.length} claims into Firestore.`);

        console.log('\n🎉 Complete! All current SharePlate actual data is now stored in Firebase Firestore.');
      })(),
      timeoutPromise,
    ]);
    process.exit(0);
  } catch (err) {
    if (err.message === 'TIMEOUT_FIRESTORE_NOT_READY' || err.message.includes('PERMISSION_DENIED') || err.message.includes('has not been used')) {
      console.warn('\n⚠️ [Firebase Notice] Cloud Firestore Database has not been provisioned yet in project "shareplate-57783".');
      console.warn('👉 Please open Firebase Console to enable Firestore:');
      console.warn('   https://console.firebase.google.com/project/shareplate-57783/firestore');
      console.warn('   Click "Create database" -> select "Start in test mode" -> click "Create".');
      console.warn('Once enabled, re-run "npm run seed:firebase" and Firestore will populate immediately!\n');
      process.exit(1);
    } else {
      console.error('Error seeding Firebase:', err.message);
      process.exit(1);
    }
  }
}

seed();
