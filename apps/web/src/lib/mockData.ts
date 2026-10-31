import {
  Donation,
  Claim,
  UserProfile,
  ImpactMetrics,
  VolunteerTripPlan,
  TripStop,
  RescueTask,
  VolunteerRewardRecord,
  VolunteerRewardsSummary,
  DonorRewardRecord,
  DonorRewardsSummary,
  calculateClaimPoints,
  REWARD_RULES,
  calculateDonorRewardPoints,
  DONOR_REWARD_RULES,
} from '../types';
import { getCloudinaryUrl } from './cloudinary';
import { calculateImpactMetrics } from './impactMath';
import { areStatesCompatible, inferStateFromCity } from './utils';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  donor: {
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
    state: 'Delhi',
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
    state: 'Delhi',
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
    state: 'Delhi',
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
    state: 'Delhi',
    location_label: 'DTU Campus, Rohini Sector 17',
    status: 'available',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
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
    state: 'Maharashtra',
    location_label: 'BKC Commercial Hub, Bandra East',
    status: 'available',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000002',
      full_name: 'Chef Vikram Malhotra',
      organization_name: 'Annapurna Grand Caterers',
      city: 'Mumbai',
      state: 'Maharashtra',
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
    state: 'Maharashtra',
    location_label: 'Deccan Gymkhana, FC Road',
    status: 'available',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000003',
      full_name: 'Amit Deshmukh',
      organization_name: 'Green Leaf Bistro & Bakery',
      city: 'Pune',
      state: 'Maharashtra',
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
    state: 'Uttar Pradesh',
    location_label: 'Sector 62 IT Hub',
    status: 'delivered',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000004',
      full_name: 'Neha Gupta',
      organization_name: 'Sector 62 Corporate Cafeteria',
      city: 'Noida',
      state: 'Uttar Pradesh',
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
    state: 'Maharashtra',
    location_label: 'Andheri East, Sakinaka',
    status: 'available',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000002',
      full_name: 'Chef Vikram Malhotra',
      organization_name: 'Annapurna Grand Caterers',
      city: 'Mumbai',
      state: 'Maharashtra',
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
    state: 'Delhi',
    location_label: 'Rohini Sector 16',
    status: 'delivered',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    donor: {
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Priya Sharma',
      organization_name: 'DTU Campus Central Canteen',
      city: 'Delhi NCR',
      state: 'Delhi',
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
    city: 'Delhi NCR',
    state: 'Delhi',
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
    city: 'Delhi NCR',
    state: 'Delhi',
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
    city: 'Delhi NCR',
    state: 'Delhi',
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
    city: 'Mumbai',
    state: 'Maharashtra',
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
    city: 'Mumbai',
    state: 'Maharashtra',
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
    city: 'Pune',
    state: 'Maharashtra',
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
    recipient_id: 'b0000000-0000-0000-0000-000000000002',
    volunteer_id: 'c0000000-0000-0000-0000-000000000002',
    volunteer: {
      id: 'c0000000-0000-0000-0000-000000000002',
      full_name: 'Rahul Varma',
      role: 'volunteer',
      city: 'Mumbai',
    },
    quantity_claimed: 40,
    status: 'claimed',
    verification_status: 'pickup_pending',
    claimed_at: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Reserved for evening shelter distribution in Kurla/Bandra, Mumbai.',
    pickup_code: '4821',
    delivery_code: '7392',
    points_pending: 130, // 50 base + (40 portions * 2) = 130
    points_released: 0,
    donation: INITIAL_DEMO_DONATIONS[1],
    recipient: {
      id: 'b0000000-0000-0000-0000-000000000002',
      full_name: 'Fr. Thomas D Souza',
      organization_name: 'Snehalaya Community Kitchen',
      phone: '+91 98210 11223',
      city: 'Mumbai',
      role: 'recipient',
      recipient_type: 'community_kitchen',
    },
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

export const INITIAL_DEMO_REWARD_RECORDS: VolunteerRewardRecord[] = [
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

export const INITIAL_DEMO_DONOR_REWARD_RECORDS: DonorRewardRecord[] = [
  {
    id: 'drew-001',
    donor_id: 'a0000000-0000-0000-0000-000000000001',
    donation_id: 'd0000000-0000-0000-0000-000000000006',
    claim_id: 'f0000000-0000-0000-0000-000000000003',
    donation_title: 'Rich Dal Makhani & Jeera Rice Combo',
    recipient_name: 'Robin Hood Army - Delhi Chapter',
    points: 130, // 30 base + (50 portions * 2) = 130
    status: 'awarded',
    portions_confirmed: 50,
    confirmed_at: new Date(Date.now() - 42 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 42 * 3600000).toISOString(),
    reason: 'Delivered & confirmed rescue: 50 portions delivered (30 base + 100 portion bonus = 130 pts)',
  },
  {
    id: 'drew-002',
    donor_id: 'd0000000-0000-0000-0000-000000000002',
    donation_id: 'd0000000-0000-0000-0000-000000000004',
    claim_id: 'f0000000-0000-0000-0000-000000000002',
    donation_title: 'Steamed Idlis, Medu Vada & Hot Sambar',
    recipient_name: 'Robin Hood Army - Delhi Chapter',
    points: 110, // 30 base + (40 portions * 2) = 110
    status: 'awarded',
    portions_confirmed: 40,
    confirmed_at: new Date(Date.now() - 19 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 19 * 3600000).toISOString(),
    reason: 'Delivered & confirmed rescue: 40 portions delivered (30 base + 80 portion bonus = 110 pts)',
  },
];

const DEMO_STORAGE_KEYS = {
  DONATIONS: 'shareplate_demo_donations_v3',
  CLAIMS: 'shareplate_demo_claims_v3',
  TASKS: 'shareplate_demo_tasks_v3',
  TRIP_PLANS: 'shareplate_demo_trip_plans_v3',
  VOL_REWARDS: 'shareplate_demo_rewards_vol_v3',
  DONOR_REWARDS: 'shareplate_demo_rewards_donor_v3',
  USERS: 'shareplate_demo_users_v3',
  REPORTS: 'shareplate_demo_reports_v3',
};

function loadDemoStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveDemoStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota or private browsing errors
  }
}

/**
 * Intelligent regional transit corridor and drop-off shelter resolver.
 * Handles common Indian metropolitan cities, neighborhoods, and common spelling typos (e.g. Andheir -> Andheri).
 */
export function determineCorridor(city?: string, location?: string): {
  corridor: string;
  dropoff_location: string;
  dropoff_address: string;
  recipient_name: string;
  recipient_phone: string;
} {
  const combined = `${city || ''} ${location || ''}`.toLowerCase();

  // Mumbai transit corridor (includes common typo "andheir" and western suburbs)
  if (
    combined.includes('mumbai') ||
    combined.includes('bombay') ||
    combined.includes('andheri') ||
    combined.includes('andheir') ||
    combined.includes('bkc') ||
    combined.includes('kurla') ||
    combined.includes('bandra') ||
    combined.includes('ghatkopar') ||
    combined.includes('sakinaka') ||
    combined.includes('powai') ||
    combined.includes('dadar') ||
    combined.includes('thane') ||
    combined.includes('borivali') ||
    combined.includes('malad') ||
    combined.includes('kandivali') ||
    combined.includes('goregaon') ||
    combined.includes('vile parle') ||
    combined.includes('santacruz') ||
    combined.includes('worli') ||
    combined.includes('colaba') ||
    combined.includes('chembur') ||
    combined.includes('juhu')
  ) {
    return {
      corridor: 'Mumbai Central Transit Corridor',
      dropoff_location: 'Snehalaya Community Kitchen (Kurla West)',
      dropoff_address: 'Near Kurla Railway Station West, LBS Marg, Mumbai 400070',
      recipient_name: 'Fr. Thomas D Souza',
      recipient_phone: '+91 98210 11223',
    };
  }

  // Pune transit corridor
  if (
    combined.includes('pune') ||
    combined.includes('shivajinagar') ||
    combined.includes('fc road') ||
    combined.includes('deccan') ||
    combined.includes('kothrud') ||
    combined.includes('hinjewadi') ||
    combined.includes('viman nagar') ||
    combined.includes('wakad') ||
    combined.includes('hadapsar') ||
    combined.includes('magarpatta') ||
    combined.includes('baner') ||
    combined.includes('aundh') ||
    combined.includes('swargate')
  ) {
    return {
      corridor: 'Pune University Corridor',
      dropoff_location: 'Aasra Seva Ashram (Shivajinagar)',
      dropoff_address: 'Near Shivajinagar Bus Stand, Pune 411005',
      recipient_name: 'Shankar Patil',
      recipient_phone: '+91 98905 88990',
    };
  }

  // Delhi NCR transit corridor
  return {
    corridor: 'Delhi North-West Corridor',
    dropoff_location: 'Bal Sahyog Children Shelter (Connaught Place)',
    dropoff_address: 'Opposite Shivaji Stadium Bus Terminal, Connaught Place, New Delhi 110001',
    recipient_name: 'Anita Roy (Shelter Administrator)',
    recipient_phone: '+91 98112 66554',
  };
}

/**
 * In-Memory & LocalStorage Demo Storage Engine
 * Keeps state reactive during user interactions in browser demo mode.
 * Enforces atomic quantity safety and expired deadline rejection client-side.
 * Persists changes across browser tabs and role switches.
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
  private donations: Donation[] = loadDemoStorage(DEMO_STORAGE_KEYS.DONATIONS, this.initialSeed.donations);
  private claims: Claim[] = loadDemoStorage(DEMO_STORAGE_KEYS.CLAIMS, this.initialSeed.claims);
  private rescueTasks: RescueTask[] = loadDemoStorage(
    DEMO_STORAGE_KEYS.TASKS,
    JSON.parse(JSON.stringify(SAMPLE_RESCUE_TASKS))
  );
  private tripPlans: VolunteerTripPlan[] = loadDemoStorage(DEMO_STORAGE_KEYS.TRIP_PLANS, []);
  private rewardRecords: VolunteerRewardRecord[] = loadDemoStorage(
    DEMO_STORAGE_KEYS.VOL_REWARDS,
    JSON.parse(JSON.stringify(INITIAL_DEMO_REWARD_RECORDS))
  );
  private donorRewardRecords: DonorRewardRecord[] = loadDemoStorage(
    DEMO_STORAGE_KEYS.DONOR_REWARDS,
    JSON.parse(JSON.stringify(INITIAL_DEMO_DONOR_REWARD_RECORDS))
  );

  private persist() {
    saveDemoStorage(DEMO_STORAGE_KEYS.DONATIONS, this.donations);
    saveDemoStorage(DEMO_STORAGE_KEYS.CLAIMS, this.claims);
    saveDemoStorage(DEMO_STORAGE_KEYS.TASKS, this.rescueTasks);
    saveDemoStorage(DEMO_STORAGE_KEYS.TRIP_PLANS, this.tripPlans);
    saveDemoStorage(DEMO_STORAGE_KEYS.VOL_REWARDS, this.rewardRecords);
    saveDemoStorage(DEMO_STORAGE_KEYS.DONOR_REWARDS, this.donorRewardRecords);
    saveDemoStorage(DEMO_STORAGE_KEYS.USERS, this.users);
    saveDemoStorage(DEMO_STORAGE_KEYS.REPORTS, this.reports);
  }

  private reloadFromStorage() {
    this.donations = loadDemoStorage(DEMO_STORAGE_KEYS.DONATIONS, this.donations);
    this.claims = loadDemoStorage(DEMO_STORAGE_KEYS.CLAIMS, this.claims);
    this.rescueTasks = loadDemoStorage(DEMO_STORAGE_KEYS.TASKS, this.rescueTasks);
    this.tripPlans = loadDemoStorage(DEMO_STORAGE_KEYS.TRIP_PLANS, this.tripPlans);
    this.rewardRecords = loadDemoStorage(DEMO_STORAGE_KEYS.VOL_REWARDS, this.rewardRecords);
    this.donorRewardRecords = loadDemoStorage(DEMO_STORAGE_KEYS.DONOR_REWARDS, this.donorRewardRecords);
    this.users = loadDemoStorage(DEMO_STORAGE_KEYS.USERS, this.users);
    this.reports = loadDemoStorage(DEMO_STORAGE_KEYS.REPORTS, this.reports);

    // Sanitize any legacy cross-state claims (e.g. Delhi recipient claiming Pune/Mumbai food)
    let claimsMutated = false;
    this.claims = this.claims.filter((c) => {
      const rec = c.recipient || this.users.find((u) => u.id === c.recipient_id);
      const don = c.donation || this.donations.find((d) => d.id === c.donation_id);
      if (!rec || !don) return true;
      const rState = rec.state || inferStateFromCity(rec.city);
      const dState = don.state || inferStateFromCity(don.city);
      if (!areStatesCompatible(rState, dState)) {
        claimsMutated = true;
        return false;
      }
      return true;
    });
    if (claimsMutated) {
      saveDemoStorage(DEMO_STORAGE_KEYS.CLAIMS, this.claims);
    }
  }

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

  getDonations(params?: { category?: string; city?: string; state?: string; search?: string; status?: string; donor_id?: string }): Donation[] {
    this.reloadFromStorage();
    this.checkExpiredDonations();
    let results = [...this.donations];
    if (params?.donor_id) {
      results = results.filter((d) => d.donor_id === params.donor_id);
    }
    if (params?.category && params.category !== 'all') {
      results = results.filter((d) => d.category === params.category);
    }
    if (params?.state && params.state !== 'all') {
      const qState = params.state.toLowerCase().trim();
      results = results.filter((d) => {
        const dState = (d.state || inferStateFromCity(d.city) || '').toLowerCase().trim();
        return areStatesCompatible(dState, qState);
      });
    }
    if (params?.city && params.city !== 'all') {
      const qCity = params.city.toLowerCase().trim();
      results = results.filter((d) => {
        const dCity = (d.city || '').toLowerCase().trim();
        return (
          dCity.includes(qCity) ||
          qCity.includes(dCity) ||
          (qCity.includes('delhi') && dCity.includes('delhi')) ||
          (qCity.includes('mumbai') && dCity.includes('mumbai')) ||
          (qCity.includes('pune') && dCity.includes('pune')) ||
          (qCity.includes('noida') && (dCity.includes('noida') || dCity.includes('delhi')))
        );
      });
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
    this.reloadFromStorage();
    this.checkExpiredDonations();
    return this.donations.find((d) => d.id === id);
  }

  createDonation(donation: Omit<Donation, 'id' | 'created_at' | 'quantity_available' | 'status'>): Donation {
    this.reloadFromStorage();
    const donorUser = this.users.find((u) => u.id === donation.donor_id) || DEMO_PROFILES.donor;
    const donor_name =
      donation.donor?.organization_name ||
      donation.donor?.full_name ||
      donorUser?.organization_name ||
      donorUser?.full_name ||
      'Registered Donor Kitchen';
    const donor_phone = donation.donor?.phone || donorUser?.phone || '+91 98110 12345';
    const donor_city = donation.city || donorUser?.city || 'Delhi NCR';
    const donor_state = donation.state || donorUser?.state || inferStateFromCity(donor_city);

    const newDonation: Donation = {
      ...donation,
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      quantity_available: donation.quantity_total,
      status: 'available',
      city: donor_city,
      state: donor_state,
      donor: {
        id: donation.donor_id || donorUser.id,
        full_name: donorUser.full_name || donor_name,
        organization_name: donorUser.organization_name || donor_name,
        city: donor_city,
        state: donor_state,
        phone: donor_phone,
      },
    };
    this.donations.unshift(newDonation);

    // Automatically create a corresponding RescueTask for the volunteer route planner
    const corridorInfo = determineCorridor(newDonation.city, newDonation.location_label);

    const rescueTask: RescueTask = {
      id: `task-${newDonation.id}`,
      donation_id: newDonation.id,
      title: newDonation.title,
      category: newDonation.category,
      dietary_type: newDonation.dietary_type || 'veg',
      portions: newDonation.quantity_total,
      pickup_location: newDonation.location_label || newDonation.city || 'Pickup Location',
      pickup_address: `${newDonation.location_label || ''}${newDonation.location_label && newDonation.city ? ', ' : ''}${newDonation.city || ''}`.trim() || 'Specified pickup location',
      pickup_deadline: newDonation.pickup_deadline,
      pickup_instructions:
        newDonation.pickup_instructions ||
        newDonation.storage_note ||
        'Report to pickup coordinator with SharePlate verification code.',
      donor_name,
      donor_phone,
      dropoff_location: corridorInfo.dropoff_location,
      dropoff_address: corridorInfo.dropoff_address,
      recipient_name: corridorInfo.recipient_name,
      recipient_phone: corridorInfo.recipient_phone,
      corridor: corridorInfo.corridor,
      status: 'available',
    };

    this.rescueTasks.unshift(rescueTask);
    this.persist();
    return newDonation;
  }

  claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Claim {
    this.reloadFromStorage();
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

    const recipientUser = this.users.find((u) => u.id === recipientId) || DEMO_PROFILES.recipient;

    // Enforce strict state-level compatibility for perishable food rescues
    const recipientState = recipientUser.state || inferStateFromCity(recipientUser.city);
    const donationState = donation.state || inferStateFromCity(donation.city);
    if (!areStatesCompatible(recipientState, donationState)) {
      throw new Error(
        `State mismatch: You are registered in ${recipientState || recipientUser.city}, but this food donation is located in ${donationState || donation.city}. Perishable food rescues must remain within the same state.`
      );
    }

    // Atomic deduction in memory
    donation.quantity_available -= quantity;
    if (donation.quantity_available === 0) {
      donation.status = 'reserved';
    }

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

    const matchingTask = this.rescueTasks.find((t) => t.donation_id === donationId);
    if (matchingTask) {
      matchingTask.claim_id = newClaim.id;
      if (donation.quantity_available === 0) {
        matchingTask.status = 'claimed';
      }
    }

    this.persist();
    return newClaim;
  }

  cancelClaim(claimId: string): Claim {
    this.reloadFromStorage();
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

    const matchingTask = this.rescueTasks.find((t) => t.claim_id === claimId);
    if (matchingTask) {
      matchingTask.status = 'available';
      matchingTask.claim_id = undefined;
    }

    this.persist();
    return claim;
  }

  updateClaimStatus(claimId: string, newStatus: 'collected' | 'delivered'): Claim {
    this.reloadFromStorage();
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

    const matchingTask = this.rescueTasks.find((t) => t.claim_id === claimId);
    if (matchingTask) {
      if (newStatus === 'collected') {
        matchingTask.status = 'in_transit';
      } else if (newStatus === 'delivered') {
        matchingTask.status = 'verified';
      }
    }

    this.persist();
    return claim;
  }

  getUserClaims(userId: string, roleOrIsDonor: boolean | string = false): Claim[] {
    this.reloadFromStorage();
    const user = this.users.find((u) => u.id === userId);
    const detectedRole = typeof roleOrIsDonor === 'string' ? roleOrIsDonor : user?.role;
    const isDonor = roleOrIsDonor === true || detectedRole === 'donor';
    const isVolunteer = detectedRole === 'volunteer';
    const isAdmin = detectedRole === 'admin';

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
      // Donors strictly see claims placed on their own donations (multi-account isolation)
      return this.claims.filter((c) => {
        const d = this.donations.find((don) => don.id === c.donation_id) || c.donation;
        return d && d.donor_id === userId;
      });
    }

    if (isVolunteer) {
      // Volunteers see claims assigned to them
      return this.claims.filter((c) => c.volunteer_id === userId);
    }

    // Default: recipient sees only claims they placed (multi-account isolation)
    return this.claims.filter((c) => c.recipient_id === userId);
  }

  getImpactMetrics(): ImpactMetrics {
    this.reloadFromStorage();
    this.checkExpiredDonations();
    return calculateImpactMetrics(this.donations, this.claims, 4, 3);
  }

  // Users & Admin Moderation
  private users: UserProfile[] = JSON.parse(JSON.stringify(Object.values(DEMO_PROFILES)));
  private reports: any[] = loadDemoStorage(DEMO_STORAGE_KEYS.REPORTS, [
    {
      id: 'rep-001',
      reporter_id: 'b0000000-0000-0000-0000-000000000001',
      reporter_name: 'Rajesh Kumar (Robin Hood Army)',
      reporter_role: 'recipient',
      restaurant_name: 'DTU Central Canteen',
      donation_id: 'd0000000-0000-0000-0000-000000000001',
      reason: 'Incorrect allergen label',
      description: 'Listed as dairy only, but contains mustard seeds in seasoning.',
      status: 'open',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'rep-002',
      reporter_id: 'c0000000-0000-0000-0000-000000000001',
      reporter_name: 'Ananya Sen (Volunteer)',
      reporter_role: 'volunteer',
      restaurant_name: 'Haldiram Sweets & Savouries',
      donation_id: 'd0000000-0000-0000-0000-000000000002',
      reason: 'Gate security delay during pickup',
      description: 'Security guard was uninformed about SharePlate pickup schedule.',
      status: 'investigating',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ]);

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
    this.reloadFromStorage();
    this.users.unshift(user);
    this.addActivityLog('admin_user_created', {
      user: user.full_name,
      role: user.role,
      email: user.email,
    });
    this.persist();
  }

  updateUser(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    this.reloadFromStorage();
    let userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      const demoUser = Object.values(DEMO_PROFILES).find((p) => p.id === userId);
      const newUser: UserProfile = {
        ...(demoUser || {
          id: userId,
          full_name: 'User',
          email: 'user@example.com',
          role: 'donor',
          city: 'Delhi NCR',
          is_active: true,
        }),
        ...updates,
      };
      this.users.push(newUser);
      userIndex = this.users.length - 1;
    } else {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
    }
    this.persist();
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
    this.reloadFromStorage();
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
    this.reloadFromStorage();
    return [...this.reports];
  }

  resolveReport(reportId: string, status: 'resolved' | 'dismissed' | 'investigating', adminNotes?: string) {
    this.reloadFromStorage();
    const rep = this.reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      if (adminNotes) rep.admin_notes = adminNotes;
      if (rep.claim_id) {
        const claim = this.claims.find((c) => c.id === rep.claim_id);
        if (claim && claim.complaint) {
          claim.complaint.status = status;
          if (adminNotes) claim.complaint.admin_notes = adminNotes;
        }
      }
      this.addActivityLog('admin_report_updated', {
        report_id: reportId,
        new_status: status,
        restaurant_name: rep.restaurant_name,
        admin_notes: adminNotes,
      });
      this.persist();
    }
  }

  issueRestaurantWarning(restaurantName: string, reason: string, adminUser?: string) {
    this.reloadFromStorage();
    this.addActivityLog('restaurant_warning_issued', {
      restaurant_name: restaurantName,
      reason,
      issued_by: adminUser || 'Admin Safety Team',
      timestamp: new Date().toISOString(),
    });
    this.persist();
  }

  fileClaimComplaint(
    claimId: string,
    reporterUser: { id: string; full_name?: string; role?: string; phone?: string },
    complaintData: {
      reason: string;
      description: string;
      category?: string;
    }
  ) {
    this.reloadFromStorage();
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');

    const donation = claim.donation || this.donations.find((d) => d.id === claim.donation_id);
    const restaurantName =
      donation?.donor?.organization_name ||
      donation?.donor?.full_name ||
      (donation as any)?.donor_name ||
      'Registered Donor Kitchen';

    const now = new Date().toISOString();
    const complaintId = `complaint-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const complaintRecord = {
      id: complaintId,
      reason: complaintData.reason,
      description: complaintData.description,
      category: complaintData.category || 'Quality / Safety Concern',
      reported_by: reporterUser.id,
      reporter_name: reporterUser.full_name || 'Verified Community User',
      reporter_role: reporterUser.role || 'recipient',
      reported_at: now,
      restaurant_name: restaurantName,
      status: 'open' as const,
    };

    claim.is_flagged_to_admin = true;
    claim.complaint = complaintRecord;

    const reportId = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const reportItem: any = {
      id: reportId,
      reporter_id: reporterUser.id,
      reporter_name: reporterUser.full_name || 'Verified Community Partner',
      reporter_role: reporterUser.role || 'recipient',
      reporter_phone: reporterUser.phone || '',
      donation_id: claim.donation_id,
      claim_id: claim.id,
      restaurant_name: restaurantName,
      reason: complaintData.reason,
      description: complaintData.description,
      status: 'open',
      created_at: now,
      donation: donation,
      claim: claim,
    };

    this.reports.unshift(reportItem);

    this.addActivityLog('admin_complaint_flagged', {
      claim_id: claim.id,
      restaurant_name: restaurantName,
      reported_by: reporterUser.full_name || reporterUser.id,
      reason: complaintData.reason,
      description: complaintData.description,
    });

    this.persist();
    return { claim, report: reportItem };
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

  private ensureRescueTasksForDonations(): void {
    for (const d of this.donations) {
      if (d.status === 'available' || d.status === 'reserved' || d.status === 'claimed') {
        const existingTask = this.rescueTasks.find((t) => t.donation_id === d.id);
        if (!existingTask) {
          const corridorInfo = determineCorridor(d.city, d.location_label);
          const donorUser = this.users.find((u) => u.id === d.donor_id) || DEMO_PROFILES.donor;
          const donor_name =
            d.donor?.organization_name ||
            d.donor?.full_name ||
            donorUser?.organization_name ||
            donorUser?.full_name ||
            'Registered Donor Kitchen';
          const donor_phone = d.donor?.phone || donorUser?.phone || '+91 98110 12345';
          const rescueTask: RescueTask = {
            id: `task-${d.id}`,
            donation_id: d.id,
            title: d.title,
            category: d.category,
            dietary_type: d.dietary_type || 'veg',
            portions: d.quantity_total,
            pickup_location: d.location_label || d.city || 'Pickup Location',
            pickup_address: `${d.location_label || ''}${d.location_label && d.city ? ', ' : ''}${d.city || ''}`.trim() || 'Specified pickup location',
            city: d.city,
            state: d.state || inferStateFromCity(d.city),
            pickup_deadline: d.pickup_deadline,
            pickup_instructions:
              d.pickup_instructions ||
              d.storage_note ||
              'Report to pickup coordinator with SharePlate verification code.',
            donor_name,
            donor_phone,
            dropoff_location: corridorInfo.dropoff_location,
            dropoff_address: corridorInfo.dropoff_address,
            recipient_name: corridorInfo.recipient_name,
            recipient_phone: corridorInfo.recipient_phone,
            corridor: corridorInfo.corridor,
            status: d.status === 'claimed' ? 'claimed' : 'available',
          };
          this.rescueTasks.unshift(rescueTask);
        }
      }
    }
  }

  getRescueTasks(corridor?: string, city?: string | null, activeOrdersOnly: boolean = false): RescueTask[] {
    this.reloadFromStorage();
    this.checkExpiredDonations();

    let tasks: RescueTask[] = [];

    if (activeOrdersOnly) {
      // Find active claims: recipient has reserved the surplus food, awaiting volunteer pickup or in-transit
      const activeClaims = this.claims.filter(
        (c) => c.status === 'claimed' || c.status === 'collected'
      );

      // If no active claims/orders exist, return empty list immediately so volunteer view displays 0 tasks
      if (activeClaims.length === 0) {
        return [];
      }

      for (const claim of activeClaims) {
        const donation = claim.donation || this.donations.find((d) => d.id === claim.donation_id);
        if (!donation) continue;

        const recipient = claim.recipient || this.users.find((u) => u.id === claim.recipient_id);
        const donor = donation.donor || this.users.find((u) => u.id === donation.donor_id);
        const corridorInfo = determineCorridor(donation.city, donation.location_label);

        const donor_name =
          donation.donor?.organization_name ||
          donation.donor?.full_name ||
          donor?.organization_name ||
          donor?.full_name ||
          'Registered Donor Kitchen';
        const donor_phone = donation.donor?.phone || donor?.phone || '+91 98110 12345';

        const recipient_name =
          recipient?.organization_name ||
          recipient?.full_name ||
          corridorInfo.recipient_name ||
          'Recipient Shelter';
        const recipient_phone = recipient?.phone || corridorInfo.recipient_phone || '+91 98711 22334';

        const dropoff_location =
          recipient?.organization_name ||
          corridorInfo.dropoff_location;
        const dropoff_address =
          recipient?.address ||
          (recipient?.city ? `${recipient.organization_name || 'Shelter Hub'}, ${recipient.city}` : corridorInfo.dropoff_address);

        const existingTask = this.rescueTasks.find(
          (t) => t.claim_id === claim.id || t.donation_id === donation.id
        );

        const task: RescueTask = {
          id: existingTask ? existingTask.id : `task-claim-${claim.id}`,
          donation_id: donation.id,
          claim_id: claim.id,
          title: donation.title,
          category: donation.category,
          dietary_type: donation.dietary_type || 'veg',
          portions: claim.quantity_claimed,
          pickup_location: donation.location_label || donation.city || 'Pickup Location',
          pickup_address: `${donation.location_label || ''}${donation.location_label && donation.city ? ', ' : ''}${donation.city || ''}`.trim() || 'Specified pickup location',
          city: donation.city,
          state: donation.state || inferStateFromCity(donation.city),
          pickup_deadline: donation.pickup_deadline,
          pickup_instructions:
            donation.pickup_instructions ||
            donation.storage_note ||
            'Report to pickup coordinator with SharePlate verification code.',
          donor_name,
          donor_phone,
          dropoff_location,
          dropoff_address,
          recipient_name,
          recipient_phone,
          corridor: existingTask?.corridor || corridorInfo.corridor,
          status: claim.status === 'collected' ? 'in_transit' : 'claimed',
        };

        tasks.push(task);
      }
    } else {
      this.ensureRescueTasksForDonations();
      tasks = [...this.rescueTasks];
    }

    // Strict State and City isolation
    // The pickup origin defines where physical food is situated.
    if (city && city !== 'all') {
      const c = city.toLowerCase().trim();
      const targetState = inferStateFromCity(c);

      tasks = tasks.filter((t) => {
        const taskPickupState = t.state || inferStateFromCity(t.city || t.pickup_address || t.pickup_location);

        // 1. Strict state compatibility (e.g. Delhi volunteer CANNOT be shown Pune/Mumbai pickups)
        if (!areStatesCompatible(targetState, taskPickupState)) {
          return false;
        }

        // 2. City / regional filter strictly on PICKUP origin (never check recipient dropoff)
        const pickupInfo = `${t.city || ''} ${t.pickup_location} ${t.pickup_address}`.toLowerCase();

        if (c.includes('delhi') || c.includes('noida')) {
          if (
            pickupInfo.includes('pune') ||
            pickupInfo.includes('mumbai') ||
            pickupInfo.includes('bkc') ||
            pickupInfo.includes('kurla') ||
            pickupInfo.includes('fc road') ||
            pickupInfo.includes('deccan')
          ) {
            return false;
          }
          return (
            pickupInfo.includes('delhi') ||
            pickupInfo.includes('noida') ||
            pickupInfo.includes('rohini') ||
            pickupInfo.includes('connaught') ||
            pickupInfo.includes('pitampura') ||
            t.corridor.toLowerCase().includes('delhi')
          );
        }

        if (c.includes('pune')) {
          if (pickupInfo.includes('delhi') || pickupInfo.includes('mumbai') || pickupInfo.includes('bkc')) {
            return false;
          }
          return (
            pickupInfo.includes('pune') ||
            pickupInfo.includes('shivajinagar') ||
            pickupInfo.includes('fc road') ||
            pickupInfo.includes('deccan') ||
            t.corridor.toLowerCase().includes('pune')
          );
        }

        if (c.includes('mumbai') || c.includes('maharashtra')) {
          if (pickupInfo.includes('delhi')) return false;
          if (
            c.includes('mumbai') &&
            (pickupInfo.includes('pune') || pickupInfo.includes('fc road') || pickupInfo.includes('deccan'))
          ) {
            return false;
          }
          return (
            pickupInfo.includes('mumbai') ||
            pickupInfo.includes('bkc') ||
            pickupInfo.includes('kurla') ||
            pickupInfo.includes('andheri') ||
            pickupInfo.includes('andheir') ||
            pickupInfo.includes('ghatkopar') ||
            t.corridor.toLowerCase().includes('mumbai')
          );
        }

        return pickupInfo.includes(c);
      });
    }

    if (!corridor || corridor === 'all') {
      return tasks;
    }
    const q = corridor.toLowerCase().trim();

    return tasks.filter((t) => {
      // 1. Direct corridor substring match
      if (t.corridor.toLowerCase().includes(q)) return true;

      // 2. City / Transit corridor cross matching on PICKUP origin
      const isMumbaiQuery =
        q.includes('mumbai') ||
        q.includes('bkc') ||
        q.includes('kurla') ||
        q.includes('andheri') ||
        q.includes('andheir') ||
        q.includes('ghatkopar');
      const isMumbaiPickup =
        t.corridor.toLowerCase().includes('mumbai') ||
        t.pickup_location.toLowerCase().includes('andheir') ||
        t.pickup_location.toLowerCase().includes('andheri') ||
        t.pickup_location.toLowerCase().includes('mumbai') ||
        t.pickup_address.toLowerCase().includes('mumbai') ||
        t.pickup_address.toLowerCase().includes('andheri') ||
        t.pickup_address.toLowerCase().includes('andheir') ||
        Boolean(t.city && t.city.toLowerCase().includes('mumbai'));

      if (isMumbaiQuery && isMumbaiPickup) return true;

      const isPuneQuery =
        q.includes('pune') ||
        q.includes('shivajinagar') ||
        q.includes('fc road') ||
        q.includes('deccan');
      const isPunePickup =
        t.corridor.toLowerCase().includes('pune') ||
        t.pickup_location.toLowerCase().includes('pune') ||
        t.pickup_address.toLowerCase().includes('pune') ||
        Boolean(t.city && t.city.toLowerCase().includes('pune'));

      if (isPuneQuery && isPunePickup) return true;

      const isDelhiQuery =
        q.includes('delhi') ||
        q.includes('rohini') ||
        q.includes('connaught') ||
        q.includes('pitampura') ||
        q.includes('noida');
      const isDelhiPickup =
        t.corridor.toLowerCase().includes('delhi') ||
        t.pickup_location.toLowerCase().includes('delhi') ||
        t.pickup_address.toLowerCase().includes('delhi') ||
        t.pickup_location.toLowerCase().includes('rohini') ||
        Boolean(t.city && t.city.toLowerCase().includes('delhi'));

      if (isDelhiQuery && isDelhiPickup) return true;

      // 3. Fallback strictly to pickup location, address, or title matches (NEVER dropoff location!)
      return (
        t.pickup_location.toLowerCase().includes(q) ||
        t.pickup_address.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q)
      );
    });
  }

  getVolunteerTripPlan(volunteerId: string): VolunteerTripPlan | null {
    this.reloadFromStorage();
    const plan = this.tripPlans.find(
      (p) => p.volunteer_id === volunteerId && (p.status === 'accepted' || p.status === 'in_progress')
    );
    return plan ? JSON.parse(JSON.stringify(plan)) : null;
  }

  createTripPlan(plan: Omit<VolunteerTripPlan, 'id' | 'created_at' | 'status'>): VolunteerTripPlan {
    this.reloadFromStorage();
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
    this.persist();
    return newPlan;
  }

  acceptTripPlan(planId: string): VolunteerTripPlan {
    this.reloadFromStorage();
    const plan = this.tripPlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Trip plan not found');
    plan.status = 'accepted';
    plan.accepted_at = new Date().toISOString();

    // Assign volunteer to corresponding claims
    for (const taskId of plan.task_ids) {
      const stop = plan.stops.find((s) => s.task_id === taskId && s.claim_id);
      let claim: Claim | undefined;
      if (stop?.claim_id) {
        claim = this.claims.find((c) => c.id === stop.claim_id);
      }
      const task = this.rescueTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = 'claimed';
        if (!claim) {
          claim = this.claims.find((c) => c.id === task.claim_id || c.donation_id === task.donation_id);
        }
      }
      if (!claim && task) {
        const donation = this.donations.find((d) => d.id === task.donation_id);
        if (donation) {
          donation.quantity_available = Math.max(0, donation.quantity_available - task.portions);
          if (donation.quantity_available === 0) {
            donation.status = 'reserved';
          }
        }
        claim = {
          id: `claim-${task.id}`,
          donation_id: task.donation_id,
          recipient_id: DEMO_PROFILES.recipient.id,
          volunteer_id: plan.volunteer_id,
          volunteer: DEMO_PROFILES.volunteer,
          quantity_claimed: task.portions,
          status: 'claimed',
          verification_status: 'accepted',
          claimed_at: new Date().toISOString(),
          notes: `Claim for corridor task: ${task.title}`,
          pickup_code: '4821',
          delivery_code: '7392',
          points_pending: calculateClaimPoints(task.portions),
          points_released: 0,
          donation: donation || INITIAL_DEMO_DONATIONS[0],
          recipient: DEMO_PROFILES.recipient,
        };
        this.claims.unshift(claim);
      } else if (claim) {
        claim.volunteer_id = plan.volunteer_id;
        claim.volunteer = this.users.find((u) => u.id === plan.volunteer_id) || DEMO_PROFILES.volunteer;
        claim.verification_status = 'accepted';
        if (!claim.pickup_code) claim.pickup_code = '4821';
        if (!claim.delivery_code) claim.delivery_code = '7392';
        claim.points_pending = calculateClaimPoints(claim.quantity_claimed);
      }
      if (task && claim) {
        task.claim_id = claim.id;
      }

      if (claim) {
        for (const s of plan.stops) {
          if (s.task_id === taskId) {
            s.claim_id = claim.id;
          }
        }
      }
    }

    this.addActivityLog('volunteer_trip_accepted', {
      volunteer_id: plan.volunteer_id,
      stops: plan.stops.length,
      tasks: plan.task_ids.length,
      corridor: plan.corridor_label,
    });

    this.persist();
    return plan;
  }

  cancelVolunteerTripPlan(volunteerId: string, planId?: string): boolean {
    this.reloadFromStorage();
    let cancelledAny = false;
    for (const plan of this.tripPlans) {
      if (
        plan.volunteer_id === volunteerId &&
        (!planId || plan.id === planId) &&
        (plan.status === 'accepted' || plan.status === 'in_progress' || plan.status === 'draft')
      ) {
        plan.status = 'cancelled';
        plan.cancelled_at = new Date().toISOString();
        cancelledAny = true;

        // Release any associated uncompleted claims and rescue tasks
        for (const taskId of (plan.task_ids || [])) {
          const task = this.rescueTasks.find((t) => t.id === taskId);
          if (task && task.status === 'claimed') {
            task.status = 'available';
            task.claim_id = undefined;
          }
          const claim = this.claims.find(
            (c) =>
              c.id === task?.claim_id ||
              c.donation_id === task?.donation_id ||
              (plan.stops && plan.stops.some((s) => s.claim_id === c.id))
          );
          if (
            claim &&
            claim.volunteer_id === volunteerId &&
            claim.status !== 'delivered' &&
            claim.verification_status !== 'verified'
          ) {
            claim.volunteer_id = undefined;
            claim.volunteer = undefined;
            if (claim.verification_status === 'accepted' || claim.verification_status === 'pickup_pending') {
              claim.status = 'claimed';
              claim.verification_status = 'unassigned';
            }
          }
        }
      }
    }

    if (cancelledAny) {
      this.addActivityLog('volunteer_trip_cancelled', {
        volunteer_id: volunteerId,
        plan_id: planId || 'all_active',
      });
      this.persist();
    }
    return cancelledAny;
  }

  simulateDonorPickupConfirmation(claimId: string): Claim {
    this.reloadFromStorage();
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    const donation = this.donations.find((d) => d.id === claim.donation_id) || claim.donation;
    const donorId = donation?.donor_id || DEMO_PROFILES.donor.id;
    return this.confirmPickup(claimId, donorId, claim.pickup_code);
  }

  simulateRecipientDeliveryConfirmation(claimId: string, portions?: number): { claim: Claim; pointsAwarded: number } {
    this.reloadFromStorage();
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    const recipientId = claim.recipient_id || DEMO_PROFILES.recipient.id;
    const count = portions || claim.quantity_claimed || 10;
    return this.confirmDelivery(claimId, recipientId, count, claim.delivery_code);
  }

  completeTripStop(planId: string, stopId: string): VolunteerTripPlan {
    this.reloadFromStorage();
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

    this.persist();
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

    this.persist();
    return claim;
  }

  initiatePickup(claimId: string, volunteerId: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.is_disputed) throw new Error('Cannot initiate pickup on a disputed claim');
    claim.verification_status = 'pickup_pending';
    if (!claim.pickup_code) {
      claim.pickup_code = Math.floor(1000 + Math.random() * 9000).toString();
    }
    claim.pickup_expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    claim.pickup_attempts = 0;

    this.addActivityLog('pickup_handoff_initiated', {
      claim_id: claimId,
      volunteer_id: volunteerId,
      status: 'awaiting_donor_confirmation',
    });

    this.persist();
    return claim;
  }

  confirmPickup(claimId: string, confirmedByUserId: string, enteredCode?: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.status === 'collected' || claim.status === 'delivered') {
      return claim;
    }
    if (claim.is_disputed) throw new Error('Disputed claim cannot be confirmed for pickup');
    if (claim.volunteer_id && confirmedByUserId === claim.volunteer_id) {
      throw new Error('Unauthorized: Volunteer cannot confirm pickup on behalf of donor');
    }
    const confirmingUser =
      this.users.find((u) => u.id === confirmedByUserId) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('shareplate_current_user')
        ? JSON.parse(localStorage.getItem('shareplate_current_user')!)
        : null);
    const donation = this.donations.find((d) => d.id === claim.donation_id) || claim.donation;
    const isOwner = donation && donation.donor_id === confirmedByUserId;
    const isDemoDonorOrAdmin = confirmingUser && (confirmingUser.role === 'donor' || confirmingUser.role === 'admin');
    if (!isOwner && !isDemoDonorOrAdmin) {
      throw new Error('Unauthorized: Only the listing donor or an admin can confirm pickup');
    }
    if (confirmingUser && confirmingUser.role !== 'donor' && confirmingUser.role !== 'admin') {
      throw new Error('Unauthorized: Only a donor or admin can confirm pickup');
    }

    // Expiration check
    if (claim.pickup_expires_at && new Date() > new Date(claim.pickup_expires_at)) {
      throw new Error('Pickup verification code has expired. Volunteer must re-initiate handover.');
    }

    // Attempt limit check
    claim.pickup_attempts = claim.pickup_attempts || 0;
    if (claim.pickup_attempts >= 3) {
      throw new Error('Maximum pickup verification attempts exceeded. Volunteer must re-initiate handover.');
    }

    // Code verification
    if (enteredCode !== undefined) {
      if (!claim.pickup_code || enteredCode.trim() !== claim.pickup_code.trim()) {
        claim.pickup_attempts += 1;
        const remaining = 3 - claim.pickup_attempts;
        throw new Error(
          remaining > 0
            ? `Invalid pickup verification code. ${remaining} attempt(s) remaining.`
            : 'Maximum pickup verification attempts exceeded. Volunteer must re-initiate handover.'
        );
      }
    }

    const donorProfile =
      this.users.find((u) => u.id === confirmedByUserId) ||
      confirmingUser ||
      DEMO_PROFILES.donor;
    claim.pickup_confirmed_by = donorProfile.full_name + (donorProfile.organization_name ? ` (${donorProfile.organization_name})` : '');
    claim.pickup_confirmed_at = new Date().toISOString();
    claim.collected_at = claim.pickup_confirmed_at;
    claim.status = 'collected';
    claim.verification_status = 'in_transit';

    // Synchronize underlying donation status
    if (donation && (donation.quantity_available === 0 || donation.status === 'reserved')) {
      donation.status = 'collected';
    }

    // Synchronize stops in trip plans
    for (const p of this.tripPlans) {
      if (p.status === 'accepted' || p.status === 'in_progress') {
        for (const s of p.stops) {
          if ((s.claim_id === claimId || (claim.donation_id && s.task_id === `task-${claim.donation_id}`)) && s.type === 'pickup') {
            s.completed = true;
            s.completed_at = claim.pickup_confirmed_at;
          }
        }
      }
    }

    this.addActivityLog('donor_pickup_confirmed', {
      claim_id: claimId,
      confirmed_by: claim.pickup_confirmed_by,
      pickup_time: claim.pickup_confirmed_at,
    });

    this.persist();
    return claim;
  }

  initiateDelivery(claimId: string, volunteerId: string): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.is_disputed) throw new Error('Cannot initiate delivery on a disputed claim');
    if (claim.verification_status !== 'in_transit' && claim.status !== 'collected') {
      throw new Error('Claim must be collected and in transit before delivery can be initiated');
    }
    claim.verification_status = 'delivery_pending';
    if (!claim.delivery_code) {
      claim.delivery_code = Math.floor(1000 + Math.random() * 9000).toString();
    }
    claim.delivery_expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    claim.delivery_attempts = 0;

    this.addActivityLog('delivery_handoff_initiated', {
      claim_id: claimId,
      volunteer_id: volunteerId,
      status: 'awaiting_recipient_confirmation',
    });

    this.persist();
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
    const confirmingUser =
      this.users.find((u) => u.id === confirmedByUserId) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('shareplate_current_user')
        ? JSON.parse(localStorage.getItem('shareplate_current_user')!)
        : null);
    const isRecipientOwner = claim.recipient_id === confirmedByUserId;
    const isDemoRecipientOrAdmin = confirmingUser && (confirmingUser.role === 'recipient' || confirmingUser.role === 'admin');
    if (!isRecipientOwner && !isDemoRecipientOrAdmin) {
      throw new Error('Unauthorized: Only the claiming recipient NGO or an admin can confirm delivery');
    }
    if (confirmingUser && confirmingUser.role !== 'recipient' && confirmingUser.role !== 'admin') {
      throw new Error('Unauthorized: Only a recipient NGO or admin can confirm delivery');
    }

    // Expiration check
    if (claim.delivery_expires_at && new Date() > new Date(claim.delivery_expires_at)) {
      throw new Error('Delivery verification code has expired. Volunteer must re-initiate handoff.');
    }

    // Attempt limit check
    claim.delivery_attempts = claim.delivery_attempts || 0;
    if (claim.delivery_attempts >= 3) {
      throw new Error('Maximum delivery verification attempts exceeded. Volunteer must re-initiate handoff.');
    }

    // Code verification
    if (enteredCode !== undefined) {
      if (!claim.delivery_code || enteredCode.trim() !== claim.delivery_code.trim()) {
        claim.delivery_attempts += 1;
        const remaining = 3 - claim.delivery_attempts;
        throw new Error(
          remaining > 0
            ? `Invalid delivery verification code. ${remaining} attempt(s) remaining.`
            : 'Maximum delivery verification attempts exceeded. Volunteer must re-initiate handoff.'
        );
      }
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

    // Synchronize stops in trip plans
    for (const p of this.tripPlans) {
      if (p.status === 'accepted' || p.status === 'in_progress') {
        for (const s of p.stops) {
          if ((s.claim_id === claimId || (claim.donation_id && s.task_id === `task-${claim.donation_id}`)) && s.type === 'delivery') {
            s.completed = true;
            s.completed_at = claim.delivery_confirmed_at;
          }
        }
        if (p.stops.every((s) => s.completed)) {
          p.status = 'completed';
          p.completed_at = new Date().toISOString();
        }
      }
    }

    // Record in donor rewards ledger ONLY upon verified NGO delivery
    const donation = this.donations.find((d) => d.id === claim.donation_id) || claim.donation;
    const donorId = donation?.donor_id;
    if (donorId) {
      const existingDonorReward = this.donorRewardRecords.find((r) => r.claim_id === claim.id);
      if (!existingDonorReward) {
        const donorPoints = calculateDonorRewardPoints(claim.portions_delivered_confirmed, false);
        this.donorRewardRecords.unshift({
          id: `drew-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          donor_id: donorId,
          donation_id: claim.donation_id,
          claim_id: claim.id,
          donation_title: donation?.title || 'Rescued Food Batch',
          recipient_name: claim.delivery_confirmed_by || recipientProfile.organization_name || 'Community Recipient',
          points: donorPoints,
          status: 'awarded',
          portions_confirmed: claim.portions_delivered_confirmed,
          confirmed_at: claim.delivery_confirmed_at,
          created_at: new Date().toISOString(),
          reason: `Delivered & confirmed rescue: ${claim.portions_delivered_confirmed} portions delivered (${DONOR_REWARD_RULES.BASE_POINTS_PER_DELIVERY} base + ${claim.portions_delivered_confirmed * DONOR_REWARD_RULES.POINTS_PER_PORTION} portion bonus, capped at ${DONOR_REWARD_RULES.MAX_POINTS_PER_DELIVERY} pts)`,
        });
      }
      if (donation && (donation.quantity_available === 0 || donation.status === 'collected')) {
        donation.status = 'delivered';
      }
    }

    this.addActivityLog('recipient_delivery_verified', {
      claim_id: claimId,
      confirmed_by: claim.delivery_confirmed_by,
      portions_received: claim.portions_delivered_confirmed,
      points_released: pointsAwarded,
    });

    this.persist();
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

    // Forfeit any donor reward for this claim
    const donorReward = this.donorRewardRecords.find((r) => r.claim_id === claimId);
    if (donorReward) {
      donorReward.status = 'forfeited';
      donorReward.points = 0;
      donorReward.reason = `Disputed delivery: ${reason} (0 points awarded)`;
    }

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

    this.persist();
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

  getDonorRewards(donorId: string, requestedByUserId?: string, userRole?: string): DonorRewardsSummary {
    if (requestedByUserId && userRole !== 'admin' && requestedByUserId !== donorId) {
      throw new Error("Unauthorized: You cannot view another donor's rewards");
    }

    const records = this.donorRewardRecords.filter((r) => r.donor_id === donorId);
    const awardedRecords = records.filter((r) => r.status === 'awarded');
    const pointsBalance = awardedRecords.reduce((sum, r) => sum + r.points, 0);
    const verifiedRescuesCount = awardedRecords.length;
    const portionsDonatedCount = awardedRecords.reduce((sum, r) => sum + r.portions_confirmed, 0);

    let currentTier = 'Bronze Community Kitchen';
    let nextTierThreshold = 300;
    if (pointsBalance >= 600) {
      currentTier = 'Gold Zero-Waste Champion';
      nextTierThreshold = 1000;
    } else if (pointsBalance >= 300) {
      currentTier = 'Silver Food Guardian';
      nextTierThreshold = 600;
    }

    return {
      points_balance: pointsBalance,
      verified_rescues_count: verifiedRescuesCount,
      portions_donated_count: portionsDonatedCount,
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
    this.rewardRecords = [
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
    this.donorRewardRecords = [
      {
        id: 'drew-001',
        donor_id: 'a0000000-0000-0000-0000-000000000001',
        donation_id: 'd0000000-0000-0000-0000-000000000006',
        claim_id: 'f0000000-0000-0000-0000-000000000003',
        donation_title: 'Rich Dal Makhani & Jeera Rice Combo',
        recipient_name: 'Robin Hood Army - Delhi Chapter',
        points: 130,
        status: 'awarded',
        portions_confirmed: 50,
        confirmed_at: new Date(Date.now() - 42 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 42 * 3600000).toISOString(),
        reason: 'Delivered & confirmed rescue: 50 portions delivered (30 base + 100 portion bonus = 130 pts)',
      },
      {
        id: 'drew-002',
        donor_id: 'd0000000-0000-0000-0000-000000000002',
        donation_id: 'd0000000-0000-0000-0000-000000000004',
        claim_id: 'f0000000-0000-0000-0000-000000000002',
        donation_title: 'Steamed Idlis, Medu Vada & Hot Sambar',
        recipient_name: 'Robin Hood Army - Delhi Chapter',
        points: 110,
        status: 'awarded',
        portions_confirmed: 40,
        confirmed_at: new Date(Date.now() - 19 * 3600000).toISOString(),
        created_at: new Date(Date.now() - 19 * 3600000).toISOString(),
        reason: 'Delivered & confirmed rescue: 40 portions delivered (30 base + 80 portion bonus = 110 pts)',
      },
    ];
    this.rescueTasks = JSON.parse(JSON.stringify(SAMPLE_RESCUE_TASKS));
    this.tripPlans = [];
    this.persist();
  }
}

export const demoStore = new DemoStore();
