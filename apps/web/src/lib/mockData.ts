import { Donation, Claim, UserProfile, ImpactMetrics, VolunteerTripPlan, TripStop, RescueTask, VolunteerRewardRecord, VolunteerRewardsSummary, calculateClaimPoints, REWARD_RULES } from '../types';
import { getCloudinaryUrl } from './cloudinary';
import { calculateImpactMetrics } from './impactMath';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  donor: {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Priya Sharma',
    email: 'donor@shareplate.demo',
    role: 'donor',
    organization_name: 'DTU Campus Central Canteen',
    phone: '+91 98110 12345',
    city: 'Delhi NCR',
    service_area: 'Rohini & Pitampura',
    donor_type: 'canteen',
    contact_person: 'Priya Sharma (Canteen Operations Lead)',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
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
    service_area: 'North & West Delhi',
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
    service_area: 'South Delhi & Noida',
    availability: 'evenings',
    bio: 'Dedicated food rescue cyclist and delivery coordinator with 2+ years field experience.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
  admin: {
    id: 'e0000000-0000-0000-0000-000000000001',
    full_name: 'SharePlate Platform Admin',
    email: 'admin@shareplate.org',
    role: 'admin',
    organization_name: 'SharePlate Foundation',
    phone: '+91 11 2345 6789',
    city: 'Delhi NCR',
    service_area: 'Pan-India',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    is_active: true,
  },
};

/**
 * Single constant array of Cloudinary seed public IDs.
 * Edit these IDs to point to your real Cloudinary uploaded seed assets.
 */
export const CLOUDINARY_SEED_PUBLIC_IDS = [
  'shareplate/seed/vegetable_biryani_01',
  'shareplate/seed/paneer_roti_02',
  'shareplate/seed/artisan_bread_03',
  'shareplate/seed/idli_sambar_04',
  'shareplate/seed/fresh_fruits_05',
  'shareplate/seed/dal_makhani_06',
] as const;

export const INITIAL_DEMO_DONATIONS: Donation[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    donor_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Fresh Vegetable Biryani & Raita (Hot)',
    description: 'Surplus fragrant basmati rice biryani cooked with carrots, green peas, cauliflower, and mild aromatic spices from lunchtime batch. Packed in thermal containers.',
    category: 'cooked_meals',
    quantity_total: 45,
    quantity_available: 45,
    quantity_unit: 'portions',
    cloudinary_public_id: CLOUDINARY_SEED_PUBLIC_IDS[0],
    image_url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[0]),
    fallback_unsplash_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Basmati rice, green peas, carrots, beans, onions, ghee, cumin, coriander',
    allergens: 'Dairy (ghee)',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 3 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    consume_within_hours: 6,
    storage_note: 'Keep insulated in thermal containers at 60°C+ until served.',
    pickup_deadline: new Date(Date.now() + 5 * 3600000).toISOString(),
    pickup_instructions: 'Report to Gate 2 Security; canteen staff will bring containers down to the vehicle ramp.',
    city: 'Delhi NCR',
    location_label: 'DTU Campus, Rohini Sector 17',
    status: 'available',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Priya Sharma',
      organization_name: 'DTU Campus Central Canteen',
      city: 'Delhi NCR',
      phone: '+91 98110 12345',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    donor_id: 'a0000000-0000-0000-0000-000000000002',
    title: 'Whole Wheat Roti & Paneer Bhurji Boxes',
    description: 'Freshly rolled phulkas (rotis) paired with spiced cottage cheese bhurji from corporate luncheon. Individually boxed in eco-friendly meal trays.',
    category: 'cooked_meals',
    quantity_total: 60,
    quantity_available: 20,
    quantity_unit: 'portions',
    cloudinary_public_id: CLOUDINARY_SEED_PUBLIC_IDS[1],
    image_url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[1]),
    fallback_unsplash_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Whole wheat flour, cottage cheese (paneer), tomatoes, bell peppers, turmeric, mustard oil',
    allergens: 'Gluten, Dairy',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 2 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    consume_within_hours: 6,
    storage_note: 'Store sealed in eco-friendly foil meal trays away from direct sunlight.',
    pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    pickup_instructions: 'Behind Trade World Building, Loading Dock C. Contact Security Supervisor Ramesh.',
    city: 'Mumbai',
    location_label: 'BKC Commercial Hub, Bandra East',
    status: 'available',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000002',
      full_name: 'Chef Vikram Malhotra',
      organization_name: 'Annapurna Grand Caterers',
      city: 'Mumbai',
      phone: '+91 98200 67890',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    donor_id: 'a0000000-0000-0000-0000-000000000003',
    title: 'Fresh Multigrain Bread Loaves & Dinner Rolls',
    description: 'Day-baked European-style crusty multigrain sourdough loaves and soft dinner buns. Perfectly fresh and sealed in food-grade brown kraft bags.',
    category: 'bakery',
    quantity_total: 35,
    quantity_available: 35,
    quantity_unit: 'packs',
    cloudinary_public_id: CLOUDINARY_SEED_PUBLIC_IDS[2],
    image_url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[2]),
    fallback_unsplash_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Wheat flour, rye, oats, flax seeds, active yeast, rock salt, water',
    allergens: 'Gluten (wheat, rye, oats)',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 5 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    consume_within_hours: 48,
    storage_note: 'Keep dry at ambient room temperature in kraft paper bags.',
    pickup_deadline: new Date(Date.now() + 12 * 3600000).toISOString(),
    pickup_instructions: 'Pickup from back kitchen alley entrance next to Deccan Gymkhana library.',
    city: 'Pune',
    location_label: 'Deccan Gymkhana, FC Road',
    status: 'available',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000003',
      full_name: 'Amit Deshmukh',
      organization_name: 'Green Leaf Bistro & Bakery',
      city: 'Pune',
      phone: '+91 98900 23456',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    donor_id: 'a0000000-0000-0000-0000-000000000004',
    title: 'Steamed Idlis, Medu Vada & Piping Hot Sambar',
    description: 'Morning breakfast conference catering surplus. 80 fresh soft idlis with lentil sambar and dry podi accompaniment.',
    category: 'cooked_meals',
    quantity_total: 40,
    quantity_available: 0,
    quantity_unit: 'portions',
    cloudinary_public_id: CLOUDINARY_SEED_PUBLIC_IDS[3],
    image_url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[3]),
    fallback_unsplash_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Rice, urad dal, fenugreek, toor dal, drumsticks, pumpkin, curry leaves, tamarind',
    allergens: 'Mustard, Coconut',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 24 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    consume_within_hours: 4,
    storage_note: 'Hot holding in stainless steel dispensers.',
    pickup_deadline: new Date(Date.now() - 18 * 3600000).toISOString(),
    pickup_instructions: 'Service elevator entrance at Tower B baseline lobby.',
    city: 'Noida',
    location_label: 'Sector 62 IT Hub',
    status: 'delivered',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000004',
      full_name: 'Neha Gupta',
      organization_name: 'Sector 62 Corporate Cafeteria',
      city: 'Noida',
      phone: '+91 99100 45678',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    donor_id: 'a0000000-0000-0000-0000-000000000002',
    title: 'Whole Fresh Apples, Bananas & Kinnow Oranges',
    description: 'Uncut, washed, high-grade seasonal fruits from wedding buffet setup. Stored in ventilated crates.',
    category: 'produce',
    quantity_total: 50,
    quantity_available: 50,
    quantity_unit: 'portions',
    cloudinary_public_id: CLOUDINARY_SEED_PUBLIC_IDS[4],
    image_url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[4]),
    fallback_unsplash_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Shimla apples, Robusta bananas, Kinnow oranges',
    allergens: 'None',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 4 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    consume_within_hours: 72,
    storage_note: 'Store in ventilated crates in a cool, shaded environment.',
    pickup_deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
    pickup_instructions: 'Ring service bell at Annapurna Central Kitchen, Sakinaka.',
    city: 'Mumbai',
    location_label: 'Andheri East, Sakinaka',
    status: 'available',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000002',
      full_name: 'Chef Vikram Malhotra',
      organization_name: 'Annapurna Grand Caterers',
      city: 'Mumbai',
      phone: '+91 98200 67890',
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    donor_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Rich Dal Makhani & Jeera Rice Combo',
    description: 'Slow-cooked black lentils simmered with ginger, garlic, and fresh cream, served with cumin-tempered basmati rice.',
    category: 'cooked_meals',
    quantity_total: 50,
    quantity_available: 0,
    quantity_unit: 'portions',
    cloudinary_public_id: CLOUDINARY_SEED_PUBLIC_IDS[5],
    image_url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[5]),
    fallback_unsplash_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    ingredients: 'Black urad dal, kidney beans, butter, cream, basmati rice, cumin',
    allergens: 'Dairy',
    dietary_type: 'veg',
    preparation_time: new Date(Date.now() - 48 * 3600000).toISOString(),
    prepared_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    consume_within_hours: 8,
    storage_note: 'Reheat thoroughly to 74°C before distribution.',
    pickup_deadline: new Date(Date.now() - 40 * 3600000).toISOString(),
    pickup_instructions: 'Gate 1 DTU, Administrative block portico.',
    city: 'Delhi NCR',
    location_label: 'Rohini Sector 16',
    status: 'delivered',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Priya Sharma',
      organization_name: 'DTU Campus Central Canteen',
      city: 'Delhi NCR',
      phone: '+91 98110 12345',
    },
  },
];


export const SAMPLE_RESCUE_TASKS: RescueTask[] = [
  {
    id: 'task-delhi-01',
    donation_id: 'd0000000-0000-0000-0000-000000000001',
    title: 'Fresh Vegetable Biryani & Raita (Hot)',
    category: 'cooked_meals',
    dietary_type: 'veg',
    portions: 45,
    pickup_location: 'DTU Campus Canteen (Rohini)',
    pickup_address: 'Gate 2 Loading Bay, DTU, Shahbad Daulatpur, Rohini Sector 17, Delhi 110042',
    pickup_deadline: new Date(Date.now() + 5 * 3600000).toISOString(),
    pickup_instructions: 'Thermal containers ready on loading pallet. Check temperature seal with canteen supervisor.',
    donor_name: 'Priya Sharma (DTU Canteen)',
    donor_phone: '+91 98110 12345',
    dropoff_location: 'Robin Hood Army Food Hub (Shalimar Bagh)',
    dropoff_address: 'Community Center, Block BF, Shalimar Bagh, Delhi 110088',
    recipient_name: 'Rajesh Kumar (Robin Hood Army)',
    recipient_phone: '+91 98711 22334',
    corridor: 'Delhi North-West Corridor',
    status: 'available',
  },
  {
    id: 'task-delhi-02',
    donation_id: 'd0000000-0000-0000-0000-000000000003',
    title: 'Whole Wheat Roti & Bread Crates',
    category: 'bakery',
    dietary_type: 'veg',
    portions: 30,
    pickup_location: 'Golden Crust Bakery (Pitampura)',
    pickup_address: 'Plot 14, Commercial Complex, Rani Bagh, Pitampura, Delhi 110034',
    pickup_deadline: new Date(Date.now() + 8 * 3600000).toISOString(),
    pickup_instructions: 'Stack bread crates upright in vehicle boot. Do not compress loaves.',
    donor_name: 'Sunil Verma (Bakery Manager)',
    donor_phone: '+91 98100 55443',
    dropoff_location: 'Wazirpur Slum Community Kitchen',
    dropoff_address: 'C-Block Jhuggi Cluster, Wazirpur Industrial Area, Delhi 110052',
    recipient_name: 'Meena Devi (Kitchen Coordinator)',
    recipient_phone: '+91 98911 33221',
    corridor: 'Delhi North-West Corridor',
    status: 'available',
  },
  {
    id: 'task-delhi-03',
    donation_id: 'd0000000-0000-0000-0000-000000000006',
    title: 'Hot Dal Makhani & Jeera Rice Trays',
    category: 'cooked_meals',
    dietary_type: 'veg',
    portions: 35,
    pickup_location: 'Dilli Haat Food Corner (Netaji Subhash Place)',
    pickup_address: 'Food Stall 12, NSP Complex, Pitampura, Delhi 110034',
    pickup_deadline: new Date(Date.now() + 3 * 3600000).toISOString(),
    pickup_instructions: 'Hot foil trays require insulated carrying thermal bag.',
    donor_name: 'Chef Harjeet Singh',
    donor_phone: '+91 98733 99887',
    dropoff_location: 'Bal Sahyog Children Shelter (Connaught Place)',
    dropoff_address: 'Opposite Shivaji Stadium Bus Terminal, Connaught Place, New Delhi 110001',
    recipient_name: 'Anita Roy (Shelter Administrator)',
    recipient_phone: '+91 98112 66554',
    corridor: 'Delhi North-West Corridor',
    status: 'available',
  },
  {
    id: 'task-mumbai-01',
    donation_id: 'd0000000-0000-0000-0000-000000000002',
    title: 'Whole Wheat Roti & Paneer Bhurji Boxes',
    category: 'cooked_meals',
    dietary_type: 'veg',
    portions: 40,
    pickup_location: 'Annapurna Grand Caterers (BKC)',
    pickup_address: 'Trade World Building, Loading Dock C, Bandra Kurla Complex, Mumbai 400051',
    pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    pickup_instructions: 'Report to Dock C supervisor Ramesh. Food pre-packed in 40 individual boxes.',
    donor_name: 'Chef Vikram Malhotra',
    donor_phone: '+91 98200 67890',
    dropoff_location: 'Snehalaya Community Kitchen (Kurla West)',
    dropoff_address: 'Near Kurla Railway Station West, LBS Marg, Mumbai 400070',
    recipient_name: 'Fr. Thomas D Souza',
    recipient_phone: '+91 98210 11223',
    corridor: 'Mumbai Central Transit Corridor',
    status: 'available',
  },
  {
    id: 'task-mumbai-02',
    donation_id: 'd0000000-0000-0000-0000-000000000005',
    title: 'Whole Fresh Apples, Bananas & Oranges',
    category: 'produce',
    dietary_type: 'veg',
    portions: 50,
    pickup_location: 'Annapurna Kitchen (Sakinaka, Andheri)',
    pickup_address: 'Andheri-Ghatkopar Link Road, Sakinaka, Mumbai 400072',
    pickup_deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
    pickup_instructions: 'Ventilated fruit crates. Clean and dry.',
    donor_name: 'Chef Vikram Malhotra',
    donor_phone: '+91 98200 67890',
    dropoff_location: 'Mission Feed Foundation (Ghatkopar)',
    dropoff_address: 'Near Pant Nagar Market, Ghatkopar East, Mumbai 400077',
    recipient_name: 'Kavita Joshi',
    recipient_phone: '+91 98201 44556',
    corridor: 'Mumbai Central Transit Corridor',
    status: 'available',
  },
  {
    id: 'task-pune-01',
    donation_id: 'd0000000-0000-0000-0000-000000000003',
    title: 'Fresh Multigrain Bread Loaves & Buns',
    category: 'bakery',
    dietary_type: 'veg',
    portions: 35,
    pickup_location: 'Green Leaf Bistro (Deccan Gymkhana, FC Road)',
    pickup_address: '1205/3 Fergusson College Road, Shivajinagar, Pune 411004',
    pickup_deadline: new Date(Date.now() + 12 * 3600000).toISOString(),
    pickup_instructions: 'Back alley bakery dock. Brown paper wrapped loaves.',
    donor_name: 'Amit Deshmukh',
    donor_phone: '+91 98900 23456',
    dropoff_location: 'Aasra Seva Ashram (Shivajinagar)',
    dropoff_address: 'Near Shivajinagar Bus Stand, Pune 411005',
    recipient_name: 'Shankar Patil',
    recipient_phone: '+91 98905 88990',
    corridor: 'Pune University Corridor',
    status: 'available',
  },
];

export const INITIAL_DEMO_CLAIMS: Claim[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    donation_id: 'd0000000-0000-0000-0000-000000000002',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    volunteer_id: 'c0000000-0000-0000-0000-000000000001',
    volunteer: DEMO_PROFILES.volunteer,
    quantity_claimed: 40,
    status: 'claimed',
    verification_status: 'pickup_pending',
    claimed_at: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Reserved for evening shelter distribution in Bandra.',
    pickup_code: '4821',
    delivery_code: '7392',
    points_pending: 130, // 50 base + (40 portions * 2) = 130
    points_released: 0,
    donation: INITIAL_DEMO_DONATIONS[1],
    recipient: DEMO_PROFILES.recipient,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    donation_id: 'd0000000-0000-0000-0000-000000000004',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    volunteer_id: 'c0000000-0000-0000-0000-000000000001',
    volunteer: DEMO_PROFILES.volunteer,
    quantity_claimed: 40,
    status: 'delivered',
    verification_status: 'verified',
    claimed_at: new Date(Date.now() - 23 * 3600000).toISOString(),
    collected_at: new Date(Date.now() - 21 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 19 * 3600000).toISOString(),
    pickup_code: '3150',
    pickup_confirmed_by: 'Neha Gupta (Sector 62 Corporate Cafeteria)',
    pickup_confirmed_at: new Date(Date.now() - 21 * 3600000).toISOString(),
    delivery_code: '8204',
    delivery_confirmed_by: 'Rajesh Kumar (Robin Hood Army)',
    delivery_confirmed_at: new Date(Date.now() - 19 * 3600000).toISOString(),
    portions_delivered_confirmed: 40,
    points_pending: 0,
    points_released: 130,
    notes: 'Distributed to children and elderly residents near Sector 62 transit camp.',
    donation: INITIAL_DEMO_DONATIONS[3],
    recipient: DEMO_PROFILES.recipient,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    donation_id: 'd0000000-0000-0000-0000-000000000006',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    volunteer_id: 'c0000000-0000-0000-0000-000000000001',
    volunteer: DEMO_PROFILES.volunteer,
    quantity_claimed: 50,
    status: 'delivered',
    verification_status: 'verified',
    claimed_at: new Date(Date.now() - 47 * 3600000).toISOString(),
    collected_at: new Date(Date.now() - 45 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 42 * 3600000).toISOString(),
    pickup_code: '6741',
    pickup_confirmed_by: 'Priya Sharma (DTU Campus Canteen)',
    pickup_confirmed_at: new Date(Date.now() - 45 * 3600000).toISOString(),
    delivery_code: '9012',
    delivery_confirmed_by: 'Rajesh Kumar (Robin Hood Army)',
    delivery_confirmed_at: new Date(Date.now() - 42 * 3600000).toISOString(),
    portions_delivered_confirmed: 50,
    points_pending: 0,
    points_released: 150, // Capped at 150 max
    notes: 'Served at Rohini community shelter.',
    donation: INITIAL_DEMO_DONATIONS[5],
    recipient: DEMO_PROFILES.recipient,
  },
];

/**
 * In-Memory Demo Storage Engine
 * Keeps state reactive during user interactions in browser demo mode.
 * Enforces atomic quantity safety and expired deadline rejection client-side.
 */
class DemoStore {
  private static seed(): { donations: Donation[]; claims: Claim[] } {
    const donations: Donation[] = JSON.parse(JSON.stringify(INITIAL_DEMO_DONATIONS));
    const claims: Claim[] = JSON.parse(JSON.stringify(INITIAL_DEMO_CLAIMS));

    for (const claim of claims) {
      const donation = donations.find((d) => d.id === claim.donation_id);
      if (donation) {
        claim.donation = donation;
      }
    }

    return { donations, claims };
  }

  private initialSeed = DemoStore.seed();
  private donations: Donation[] = this.initialSeed.donations;
  private claims: Claim[] = this.initialSeed.claims;

  /**
   * Helper that evaluates and updates status for expired pickup deadlines.
   */
  private checkExpiredDonations() {
    const now = Date.now();
    for (const d of this.donations) {
      if (
        (d.status === 'available' || d.status === 'reserved') &&
        new Date(d.pickup_deadline).getTime() < now
      ) {
        d.status = 'expired';
      }
    }
  }

  getDonations(params?: { category?: string; city?: string; search?: string; status?: string; donor_id?: string }): Donation[] {
    this.checkExpiredDonations();
    let results = [...this.donations];
    if (params?.donor_id) {
      results = results.filter((d) => d.donor_id === params.donor_id);
    }
    if (params?.category && params.category !== 'all') {
      results = results.filter((d) => d.category === params.category);
    }
    if (params?.city && params.city !== 'all') {
      results = results.filter((d) => d.city.toLowerCase().includes(params.city!.toLowerCase()));
    }
    // Only filter status if explicitly requested or if browsing public catalog (no donor_id)
    const effectiveStatus = params?.status !== undefined ? params.status : (params?.donor_id ? 'all' : undefined);
    if (effectiveStatus && effectiveStatus !== 'all') {
      results = results.filter((d) => d.status === effectiveStatus);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    return results;
  }

  getDonationById(id: string): Donation | undefined {
    this.checkExpiredDonations();
    return this.donations.find((d) => d.id === id);
  }

  createDonation(donation: Omit<Donation, 'id' | 'created_at' | 'quantity_available' | 'status'>): Donation {
    const newDonation: Donation = {
      ...donation,
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      quantity_available: donation.quantity_total,
      status: 'available',
    };
    this.donations.unshift(newDonation);
    return newDonation;
  }

  claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Claim {
    this.checkExpiredDonations();
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) throw new Error('Donation not found');

    if (donation.donor_id === recipientId) {
      throw new Error('Donors cannot claim their own donation');
    }

    if (!quantity || quantity <= 0) {
      throw new Error('Requested quantity must be at least 1 portion');
    }

    if (new Date(donation.pickup_deadline).getTime() < Date.now()) {
      donation.status = 'expired';
      throw new Error('Donation pickup deadline has passed and this batch is expired');
    }

    if (donation.status !== 'available' && donation.status !== 'reserved') {
      throw new Error(`Donation is not available for claiming (current status: ${donation.status})`);
    }

    if (donation.quantity_available < quantity) {
      throw new Error(
        `Requested quantity (${quantity}) exceeds available quantity (${donation.quantity_available})`
      );
    }

    // Atomic deduction in memory
    donation.quantity_available -= quantity;
    if (donation.quantity_available === 0) {
      donation.status = 'reserved';
    }

    const recipientUser = this.users.find((u) => u.id === recipientId) || DEMO_PROFILES.recipient;
    const newClaim: Claim = {
      id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      donation_id: donationId,
      recipient_id: recipientId,
      quantity_claimed: quantity,
      status: 'claimed',
      verification_status: 'accepted',
      pickup_code: Math.floor(1000 + Math.random() * 9000).toString(),
      delivery_code: Math.floor(1000 + Math.random() * 9000).toString(),
      points_pending: calculateClaimPoints(quantity, false),
      points_released: 0,
      claimed_at: new Date().toISOString(),
      notes,
      donation,
      recipient: recipientUser,
    };

    this.claims.unshift(newClaim);
    return newClaim;
  }

  cancelClaim(claimId: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.status !== 'claimed') throw new Error('Only active claims can be cancelled');

    claim.status = 'cancelled';
    claim.cancelled_at = new Date().toISOString();

    const donation = this.donations.find((d) => d.id === claim.donation_id);
    if (donation) {
      donation.quantity_available += claim.quantity_claimed;
      if (donation.status === 'reserved') {
        donation.status = 'available';
      }
    }

    return claim;
  }

  updateClaimStatus(claimId: string, newStatus: 'collected' | 'delivered'): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');

    if (newStatus === 'collected') {
      if (claim.status !== 'claimed') {
        throw new Error(`Claim cannot be marked collected from status: ${claim.status}`);
      }
      claim.status = 'collected';
      claim.collected_at = new Date().toISOString();
    } else if (newStatus === 'delivered') {
      if (claim.status !== 'collected') {
        throw new Error('Claim must be collected before it can be delivered');
      }
      claim.status = 'delivered';
      claim.delivered_at = new Date().toISOString();

      const donation = this.donations.find((d) => d.id === claim.donation_id);
      if (donation && donation.quantity_available === 0) {
        const hasOpenClaims = this.claims.some(
          (c) => c.donation_id === donation.id && c.status !== 'delivered' && c.status !== 'cancelled'
        );
        if (!hasOpenClaims) {
          donation.status = 'delivered';
        }
      }
    }

    return claim;
  }

  getUserClaims(userId: string, roleOrIsDonor: boolean | string = false): Claim[] {
    const isDonor = roleOrIsDonor === true || roleOrIsDonor === 'donor';
    const isVolunteer = roleOrIsDonor === 'volunteer';
    const isAdmin = roleOrIsDonor === 'admin';

    // Ensure all claims have fresh embedded donation and recipient references
    for (const c of this.claims) {
      if (!c.donation || c.donation.id !== c.donation_id) {
        c.donation = this.donations.find((d) => d.id === c.donation_id);
      }
      if (!c.recipient || c.recipient.id !== c.recipient_id) {
        c.recipient = this.users.find((u) => u.id === c.recipient_id) || DEMO_PROFILES.recipient;
      }
    }

    if (isAdmin) {
      return [...this.claims];
    }

    if (isDonor) {
      // Donors see ONLY claims on donations that belong to them
      return this.claims.filter((c) => {
        const d = this.donations.find((don) => don.id === c.donation_id) || c.donation;
        return d && d.donor_id === userId;
      });
    }

    if (isVolunteer) {
      // Volunteers see claims assigned to them
      return this.claims.filter((c) => c.volunteer_id === userId);
    }

    // Default: recipient sees only claims they placed
    return this.claims.filter((c) => c.recipient_id === userId);
  }

  getImpactMetrics(): ImpactMetrics {
    this.checkExpiredDonations();
    return calculateImpactMetrics(this.donations, this.claims, 4, 3);
  }

  // Users & Admin Moderation
  private users: UserProfile[] = JSON.parse(JSON.stringify(Object.values(DEMO_PROFILES)));
  private reports: any[] = [
    {
      id: 'rep-001',
      reporter_id: 'b0000000-0000-0000-0000-000000000001',
      donation_id: 'd0000000-0000-0000-0000-000000000001',
      reason: 'Incorrect allergen label',
      description: 'Listed as dairy only, but contains mustard seeds in seasoning.',
      status: 'open',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'rep-002',
      reporter_id: 'c0000000-0000-0000-0000-000000000001',
      donation_id: 'd0000000-0000-0000-0000-000000000002',
      reason: 'Gate security delay during pickup',
      description: 'Security guard was uninformed about SharePlate pickup schedule.',
      status: 'investigating',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  private activityLogs: any[] = [
    {
      id: 'act-1',
      action: 'donation_listed',
      details: { title: 'Fresh Vegetable Biryani & Raita (Hot)', donor: 'DTU Central Canteen', portions: 45 },
      created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: 'act-2',
      action: 'claim_reserved',
      details: { claim_id: 'claim-01', recipient: 'Robin Hood Army Delhi', portions: 25 },
      created_at: new Date(Date.now() - 65 * 60000).toISOString(),
    },
    {
      id: 'act-3',
      action: 'volunteer_dispatched',
      details: { volunteer: 'Ananya Sen', route: 'DTU Rohini -> Shalimar Bagh Community Shelter' },
      created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    },
    {
      id: 'act-4',
      action: 'rescue_completed',
      details: { portions: 50, co2eSavedKg: 50, location: 'Rohini Shelter' },
      created_at: new Date(Date.now() - 360 * 60000).toISOString(),
    },
  ];

  getUsers(): UserProfile[] {
    return [...this.users];
  }

  addUser(user: UserProfile) {
    this.users.unshift(user);
    this.addActivityLog('admin_user_created', {
      user: user.full_name,
      role: user.role,
      email: user.email,
    });
  }

  updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.addActivityLog('admin_user_updated', {
      user_id: userId,
      updates,
    });
    return this.users[userIndex];
  }

  deleteUser(userId: string): boolean {
    const initialLength = this.users.length;
    const deletedUser = this.users.find((u) => u.id === userId);
    this.users = this.users.filter((u) => u.id !== userId);
    if (this.users.length < initialLength) {
      this.addActivityLog('admin_user_deleted', {
        user_id: userId,
        name: deletedUser?.full_name,
      });
      return true;
    }
    return false;
  }

  getAllClaims(): Claim[] {
    return [...this.claims];
  }

  toggleUserStatus(userId: string): boolean {
    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.is_active = !u.is_active;
      this.addActivityLog('admin_user_status_toggled', {
        user_id: userId,
        new_status: u.is_active ? 'active' : 'deactivated',
      });
      return u.is_active;
    }
    return false;
  }

  getReports(): any[] {
    return [...this.reports];
  }

  resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
    const rep = this.reports.find((r) => r.id === reportId);
    if (rep) rep.status = status;
  }

  getActivityLogs(): any[] {
    return [...this.activityLogs];
  }

  addActivityLog(action: string, details: Record<string, any>) {
    this.activityLogs.unshift({
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      details,
      created_at: new Date().toISOString(),
    });
  }


  // --- TRIP PLANNING & RESCUE TASKS ---
  private rescueTasks: RescueTask[] = JSON.parse(JSON.stringify(SAMPLE_RESCUE_TASKS));
  private tripPlans: VolunteerTripPlan[] = [
    {
      id: 'trip-seed-01',
      volunteer_id: 'c0000000-0000-0000-0000-000000000001',
      origin: 'DTU Main Campus, Rohini Sector 17',
      destination: 'Connaught Place Metro Hub, Central Delhi',
      corridor_label: 'Delhi North-West Corridor',
      task_ids: ['task-delhi-01'],
      status: 'accepted',
      created_at: new Date(Date.now() - 40 * 60000).toISOString(),
      accepted_at: new Date(Date.now() - 35 * 60000).toISOString(),
      is_demo_preview: true,
      routing_provider_note: 'Demo route preview using corridor stops. Live turn-by-turn routing requires Mapbox/Google Maps Directions API key.',
      stops: [
        {
          id: 'stop-0',
          type: 'start',
          name: 'Origin Departure',
          address: 'DTU Main Campus, Rohini Sector 17',
          city: 'Delhi NCR',
          sequence: 1,
          completed: true,
          completed_at: new Date(Date.now() - 30 * 60000).toISOString(),
        },
        {
          id: 'stop-1',
          type: 'pickup',
          name: 'DTU Campus Canteen (Rohini)',
          address: 'Gate 2 Loading Bay, DTU, Rohini Sector 17',
          city: 'Delhi NCR',
          contact_person: 'Priya Sharma (Canteen Lead)',
          phone: '+91 98110 12345',
          instructions: 'Thermal containers ready on loading pallet. Verify temperature seal.',
          task_id: 'task-delhi-01',
          portions: 45,
          food_title: 'Fresh Vegetable Biryani & Raita (Hot)',
          dietary_type: 'veg',
          sequence: 2,
          completed: false,
        },
        {
          id: 'stop-2',
          type: 'delivery',
          name: 'Robin Hood Army Food Hub (Shalimar Bagh)',
          address: 'Community Center, Block BF, Shalimar Bagh, Delhi',
          city: 'Delhi NCR',
          contact_person: 'Rajesh Kumar (Distribution Coordinator)',
          phone: '+91 98711 22334',
          instructions: 'Hand over insulated containers to distribution volunteer on site.',
          task_id: 'task-delhi-01',
          portions: 45,
          food_title: 'Fresh Vegetable Biryani & Raita (Hot)',
          dietary_type: 'veg',
          sequence: 3,
          completed: false,
        },
        {
          id: 'stop-3',
          type: 'destination',
          name: 'Final Destination Arrival',
          address: 'Connaught Place Metro Hub, Central Delhi',
          city: 'Delhi NCR',
          sequence: 4,
          completed: false,
        },
      ],
    },
  ];

  private rewardRecords: VolunteerRewardRecord[] = [
    {
      id: 'rew-001',
      volunteer_id: 'c0000000-0000-0000-0000-000000000001',
      claim_id: 'f0000000-0000-0000-0000-000000000003',
      donation_title: 'Rich Dal Makhani & Jeera Rice Combo',
      recipient_name: 'Robin Hood Army - Delhi Chapter',
      points: 150,
      status: 'released',
      portions_confirmed: 50,
      verified_at: new Date(Date.now() - 42 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 47 * 3600000).toISOString(),
      reason: 'Two-party verified rescue: 50 portions delivered (50 base + 50x2 capped at 150 pts)',
    },
    {
      id: 'rew-002',
      volunteer_id: 'c0000000-0000-0000-0000-000000000001',
      claim_id: 'f0000000-0000-0000-0000-000000000002',
      donation_title: 'Steamed Idlis, Medu Vada & Hot Sambar',
      recipient_name: 'Robin Hood Army - Delhi Chapter',
      points: 130,
      status: 'released',
      portions_confirmed: 40,
      verified_at: new Date(Date.now() - 19 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 23 * 3600000).toISOString(),
      reason: 'Two-party verified rescue: 40 portions delivered (50 base + 40x2 = 130 pts)',
    },
  ];

  getRescueTasks(corridor?: string): RescueTask[] {
    if (!corridor) return [...this.rescueTasks];
    return this.rescueTasks.filter((t) => t.corridor.toLowerCase().includes(corridor.toLowerCase()));
  }

  getVolunteerTripPlan(volunteerId: string): VolunteerTripPlan | null {
    const plan = this.tripPlans.find(
      (p) => p.volunteer_id === volunteerId && (p.status === 'accepted' || p.status === 'in_progress')
    );
    return plan ? JSON.parse(JSON.stringify(plan)) : null;
  }

  createTripPlan(plan: Omit<VolunteerTripPlan, 'id' | 'created_at' | 'status'>): VolunteerTripPlan {
    const newPlan: VolunteerTripPlan = {
      ...plan,
      id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      status: 'draft',
      is_demo_preview: true,
      routing_provider_note:
        plan.routing_provider_note ||
        'Demo route preview using corridor sequence. Live turn-by-turn routing requires Mapbox/Google Maps Directions API credentials.',
    };
    this.tripPlans.unshift(newPlan);
    return newPlan;
  }

  acceptTripPlan(planId: string): VolunteerTripPlan {
    const plan = this.tripPlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Trip plan not found');
    plan.status = 'accepted';
    plan.accepted_at = new Date().toISOString();

    // Assign volunteer to corresponding claims
    for (const taskId of plan.task_ids) {
      const task = this.rescueTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = 'claimed';
        const claim = this.claims.find((c) => c.donation_id === task.donation_id);
        if (claim) {
          claim.volunteer_id = plan.volunteer_id;
          claim.verification_status = 'accepted';
          if (!claim.pickup_code) claim.pickup_code = Math.floor(1000 + Math.random() * 9000).toString();
          if (!claim.delivery_code) claim.delivery_code = Math.floor(1000 + Math.random() * 9000).toString();
          claim.points_pending = calculateClaimPoints(claim.quantity_claimed);
        }
      }
    }

    this.addActivityLog('volunteer_trip_accepted', {
      volunteer_id: plan.volunteer_id,
      stops: plan.stops.length,
      tasks: plan.task_ids.length,
      corridor: plan.corridor_label,
    });

    return plan;
  }

  completeTripStop(planId: string, stopId: string): VolunteerTripPlan {
    const plan = this.tripPlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Trip plan not found');
    const stop = plan.stops.find((s) => s.id === stopId);
    if (!stop) throw new Error('Stop not found');
    stop.completed = true;
    stop.completed_at = new Date().toISOString();

    const allCompleted = plan.stops.every((s) => s.completed);
    if (allCompleted) {
      plan.status = 'completed';
      plan.completed_at = new Date().toISOString();
    } else {
      plan.status = 'in_progress';
    }

    return plan;
  }

  // --- TWO-PARTY VERIFICATION & REWARDS ---

  assignVolunteerToClaim(claimId: string, volunteerId: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    claim.volunteer_id = volunteerId;
    claim.verification_status = 'accepted';
    if (!claim.pickup_code) claim.pickup_code = Math.floor(1000 + Math.random() * 9000).toString();
    if (!claim.delivery_code) claim.delivery_code = Math.floor(1000 + Math.random() * 9000).toString();
    claim.points_pending = calculateClaimPoints(claim.quantity_claimed);

    this.addActivityLog('volunteer_assigned', {
      claim_id: claimId,
      volunteer_id: volunteerId,
      points_pending: claim.points_pending,
    });

    return claim;
  }

  initiatePickup(claimId: string, volunteerId: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    claim.verification_status = 'pickup_pending';

    this.addActivityLog('pickup_handoff_initiated', {
      claim_id: claimId,
      volunteer_id: volunteerId,
      status: 'awaiting_donor_confirmation',
    });

    return claim;
  }

  confirmPickup(claimId: string, confirmedByUserId: string, enteredCode?: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.is_disputed) throw new Error('Disputed claim cannot be confirmed for pickup');
    if (claim.volunteer_id && confirmedByUserId === claim.volunteer_id) {
      throw new Error('Unauthorized: Volunteer cannot confirm pickup on behalf of donor');
    }
    const confirmingUser = this.users.find((u) => u.id === confirmedByUserId);
    if (confirmingUser && confirmingUser.role !== 'donor' && confirmingUser.role !== 'admin') {
      throw new Error('Unauthorized: Only a donor or admin can confirm pickup');
    }

    const donorProfile = this.users.find((u) => u.id === confirmedByUserId) || DEMO_PROFILES.donor;
    claim.pickup_confirmed_by = donorProfile.full_name + (donorProfile.organization_name ? ` (${donorProfile.organization_name})` : '');
    claim.pickup_confirmed_at = new Date().toISOString();
    claim.collected_at = claim.pickup_confirmed_at;
    claim.status = 'collected';
    claim.verification_status = 'in_transit';

    this.addActivityLog('donor_pickup_confirmed', {
      claim_id: claimId,
      confirmed_by: claim.pickup_confirmed_by,
      pickup_time: claim.pickup_confirmed_at,
    });

    return claim;
  }

  initiateDelivery(claimId: string, volunteerId: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.verification_status !== 'in_transit' && claim.status !== 'collected') {
      throw new Error('Claim must be collected and in transit before delivery can be initiated');
    }
    claim.verification_status = 'delivery_pending';

    this.addActivityLog('delivery_handoff_initiated', {
      claim_id: claimId,
      volunteer_id: volunteerId,
      status: 'awaiting_recipient_confirmation',
    });

    return claim;
  }

  confirmDelivery(
    claimId: string,
    confirmedByUserId: string,
    portionsReceived: number,
    enteredCode?: string
  ): { claim: Claim; pointsAwarded: number } {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.status === 'delivered' || claim.verification_status === 'verified') {
      throw new Error('Claim is already delivered. Duplicate delivery confirmation rejected.');
    }
    if (claim.is_disputed) throw new Error('Disputed claim cannot release points');
    if (claim.volunteer_id && confirmedByUserId === claim.volunteer_id) {
      throw new Error('Unauthorized: Volunteer cannot confirm delivery on behalf of recipient');
    }
    const confirmingUser = this.users.find((u) => u.id === confirmedByUserId);
    if (confirmingUser && confirmingUser.role !== 'recipient' && confirmingUser.role !== 'admin') {
      throw new Error('Unauthorized: Only a recipient NGO or admin can confirm delivery');
    }

    if (!portionsReceived || portionsReceived <= 0) {
      throw new Error('Confirmed portions must be at least 1 portion');
    }

    const recipientProfile = this.users.find((u) => u.id === confirmedByUserId) || DEMO_PROFILES.recipient;
    claim.delivery_confirmed_by =
      recipientProfile.full_name + (recipientProfile.organization_name ? ` (${recipientProfile.organization_name})` : '');
    claim.delivery_confirmed_at = new Date().toISOString();
    claim.delivered_at = claim.delivery_confirmed_at;
    claim.portions_delivered_confirmed = Math.min(portionsReceived, claim.quantity_claimed);
    claim.status = 'delivered';
    claim.verification_status = 'verified';

    // Strict rule: Points release ONLY after two-party confirmation!
    const pointsAwarded = calculateClaimPoints(claim.portions_delivered_confirmed, false);
    claim.points_pending = 0;
    claim.points_released = pointsAwarded;

    // Record in rewards ledger
    if (claim.volunteer_id) {
      this.rewardRecords.unshift({
        id: `rew-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        volunteer_id: claim.volunteer_id,
        claim_id: claim.id,
        donation_title: claim.donation?.title || 'Rescued Food Batch',
        recipient_name: claim.delivery_confirmed_by,
        points: pointsAwarded,
        status: 'released',
        portions_confirmed: claim.portions_delivered_confirmed,
        verified_at: claim.delivery_confirmed_at,
        created_at: new Date().toISOString(),
        reason: `Two-party verified rescue: ${claim.portions_delivered_confirmed} portions delivered (${REWARD_RULES.BASE_POINTS_PER_DELIVERY} base + ${claim.portions_delivered_confirmed * REWARD_RULES.POINTS_PER_PORTION} pts, capped at ${REWARD_RULES.MAX_POINTS_PER_DELIVERY})`,
      });
    }

    this.addActivityLog('recipient_delivery_verified', {
      claim_id: claimId,
      confirmed_by: claim.delivery_confirmed_by,
      portions_received: claim.portions_delivered_confirmed,
      points_released: pointsAwarded,
    });

    return { claim, pointsAwarded };
  }

  disputeClaim(claimId: string, disputedByUserId: string, reason: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');

    const reporter = this.users.find((u) => u.id === disputedByUserId) || DEMO_PROFILES.recipient;
    claim.is_disputed = true;
    claim.dispute_reason = reason;
    claim.disputed_by = reporter.full_name;
    claim.disputed_at = new Date().toISOString();
    claim.verification_status = 'disputed';

    // Strict rule: Points forfeited / 0 for disputed deliveries
    const forfeitedPending = claim.points_pending || 0;
    claim.points_pending = 0;
    claim.points_released = 0;

    if (claim.volunteer_id && forfeitedPending > 0) {
      this.rewardRecords.unshift({
        id: `rew-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        volunteer_id: claim.volunteer_id,
        claim_id: claim.id,
        donation_title: claim.donation?.title || 'Rescued Food Batch',
        recipient_name: reporter.full_name,
        points: 0,
        status: 'forfeited',
        portions_confirmed: 0,
        created_at: new Date().toISOString(),
        reason: `Disputed delivery: "${reason}". 0 points awarded pending operational review.`,
      });
    }

    this.addActivityLog('claim_disputed', {
      claim_id: claimId,
      disputed_by: claim.disputed_by,
      reason,
      points_forfeited: forfeitedPending,
    });

    return claim;
  }

  getVolunteerRewards(volunteerId: string): VolunteerRewardsSummary {
    const records = this.rewardRecords.filter((r) => r.volunteer_id === volunteerId);
    const releasedPoints = records
      .filter((r) => r.status === 'released')
      .reduce((sum, r) => sum + r.points, 0);

    const pendingClaims = this.claims.filter(
      (c) => c.volunteer_id === volunteerId && c.verification_status !== 'verified' && !c.is_disputed
    );
    const pendingPoints = pendingClaims.reduce((sum, c) => sum + (c.points_pending || 0), 0);

    const verifiedDeliveriesCount = records.filter((r) => r.status === 'released').length;
    const portionsTransportedCount = records
      .filter((r) => r.status === 'released')
      .reduce((sum, r) => sum + r.portions_confirmed, 0);

    let currentTier = 'Bronze Courier';
    let nextTierThreshold = 300;
    if (releasedPoints >= 600) {
      currentTier = 'Gold Rescue Champion';
      nextTierThreshold = 1000;
    } else if (releasedPoints >= 300) {
      currentTier = 'Silver Rescue Specialist';
      nextTierThreshold = 600;
    }

    return {
      points_pending: pendingPoints,
      points_released: releasedPoints,
      verified_deliveries_count: verifiedDeliveriesCount,
      portions_transported_count: portionsTransportedCount,
      current_tier: currentTier,
      next_tier_threshold: nextTierThreshold,
      history: records,
    };
  }

  reset() {
    const { donations, claims } = DemoStore.seed();
    this.donations = donations;
    this.claims = claims;
    this.users = JSON.parse(JSON.stringify(Object.values(DEMO_PROFILES)));
  }
}

export const demoStore = new DemoStore();
