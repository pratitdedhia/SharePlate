import { Donation, Claim, UserProfile, ImpactMetrics } from '../types';

export const DEMO_SEED_IMAGES = [
  { name: 'Vegetable biryani', publicId: 'shareplate/seed/vegetable-biryani' },
  { name: 'Roti and paneer', publicId: 'shareplate/seed/roti-paneer' },
  { name: 'Multigrain bread', publicId: 'shareplate/seed/multigrain-bread' },
  { name: 'Idli and sambar', publicId: 'shareplate/seed/idli-sambar' },
  { name: 'Seasonal fruit', publicId: 'shareplate/seed/seasonal-fruit' },
  { name: 'Dal and rice', publicId: 'shareplate/seed/dal-rice' },
] as const;

export const calculateImpactMetrics = (donations: Donation[], claims: Claim[]): ImpactMetrics => {
  const portionsListed = donations.reduce((total, donation) => total + donation.quantity_total, 0);
  const portionsDelivered = claims
    .filter((claim) => claim.status === 'delivered')
    .reduce((total, claim) => total + claim.quantity_claimed, 0);
  const portionsReserved = claims
    .filter((claim) => claim.status === 'claimed' || claim.status === 'collected')
    .reduce((total, claim) => total + claim.quantity_claimed, 0);
  const portionsAvailable = Math.max(0, portionsListed - portionsDelivered - portionsReserved);
  const deliveredPercent = portionsListed === 0 ? 0 : Math.round((portionsDelivered / portionsListed) * 100);
  const reservedPercent = portionsListed === 0 ? 0 : Math.round((portionsReserved / portionsListed) * 100);
  const availablePercent = Math.max(0, 100 - deliveredPercent - reservedPercent);
  const estimatedFoodRescuedKg = Math.round(portionsDelivered * 0.4);

  return {
    donationsListed: donations.length,
    portionsListed,
    portionsReserved,
    portionsDelivered,
    portionsAvailable,
    deliveredPercent,
    reservedPercent,
    availablePercent,
    completedRescues: claims.filter((claim) => claim.status === 'delivered').length,
    activeDonors: new Set(donations.map((donation) => donation.donor_id)).size,
    participatingRecipients: new Set(claims.map((claim) => claim.recipient_id)).size,
    activeClaims: claims.filter((claim) => claim.status === 'claimed' || claim.status === 'collected').length,
    completionRatePercent: deliveredPercent,
    estimatedFoodRescuedKg,
    estimatedCo2eSavedKg: Math.round(estimatedFoodRescuedKg * 2.5),
    methodologyNote: 'Rescue rate is delivered portions divided by listed portions. Environmental values are estimates based on 400 g per portion and 2.5 kg CO2e per kg of food.',
  };
};

const DEMO_STORAGE_KEY = 'shareplate_demo_store';

const loadDemoState = (): { donations: Donation[]; claims: Claim[] } | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.donations) && Array.isArray(parsed.claims)) return parsed;
  } catch {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }
  return null;
};

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
    is_active: true,
  },
};

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
    cloudinary_public_id: DEMO_SEED_IMAGES[0].publicId,
    ingredients: 'Basmati rice, green peas, carrots, beans, onions, ghee, cumin, coriander',
    allergens: 'Dairy (ghee)',
    preparation_time: new Date(Date.now() - 3 * 3600000).toISOString(),
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
    cloudinary_public_id: DEMO_SEED_IMAGES[1].publicId,
    ingredients: 'Whole wheat flour, cottage cheese (paneer), tomatoes, bell peppers, turmeric, mustard oil',
    allergens: 'Gluten, Dairy',
    preparation_time: new Date(Date.now() - 2 * 3600000).toISOString(),
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
    cloudinary_public_id: DEMO_SEED_IMAGES[2].publicId,
    ingredients: 'Wheat flour, rye, oats, flax seeds, active yeast, rock salt, water',
    allergens: 'Gluten (wheat, rye, oats)',
    preparation_time: new Date(Date.now() - 5 * 3600000).toISOString(),
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
    cloudinary_public_id: DEMO_SEED_IMAGES[3].publicId,
    ingredients: 'Rice, urad dal, fenugreek, toor dal, drumsticks, pumpkin, curry leaves, tamarind',
    allergens: 'Mustard, Coconut',
    preparation_time: new Date(Date.now() - 24 * 3600000).toISOString(),
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
    cloudinary_public_id: DEMO_SEED_IMAGES[4].publicId,
    ingredients: 'Shimla apples, Robusta bananas, Kinnow oranges',
    allergens: 'None',
    preparation_time: new Date(Date.now() - 4 * 3600000).toISOString(),
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
    cloudinary_public_id: DEMO_SEED_IMAGES[5].publicId,
    ingredients: 'Black urad dal, kidney beans, butter, cream, basmati rice, cumin',
    allergens: 'Dairy',
    preparation_time: new Date(Date.now() - 48 * 3600000).toISOString(),
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

export const INITIAL_DEMO_CLAIMS: Claim[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    donation_id: 'd0000000-0000-0000-0000-000000000002',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    quantity_claimed: 40,
    status: 'claimed',
    claimed_at: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Reserved for evening shelter distribution in Bandra.',
    donation: INITIAL_DEMO_DONATIONS[1],
    recipient: DEMO_PROFILES.recipient,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    donation_id: 'd0000000-0000-0000-0000-000000000004',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    quantity_claimed: 40,
    status: 'delivered',
    claimed_at: new Date(Date.now() - 23 * 3600000).toISOString(),
    collected_at: new Date(Date.now() - 21 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 19 * 3600000).toISOString(),
    notes: 'Distributed to children and elderly residents near Sector 62 transit camp.',
    donation: INITIAL_DEMO_DONATIONS[3],
    recipient: DEMO_PROFILES.recipient,
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    donation_id: 'd0000000-0000-0000-0000-000000000006',
    recipient_id: 'b0000000-0000-0000-0000-000000000001',
    quantity_claimed: 50,
    status: 'delivered',
    claimed_at: new Date(Date.now() - 47 * 3600000).toISOString(),
    collected_at: new Date(Date.now() - 45 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 42 * 3600000).toISOString(),
    notes: 'Served at Rohini community shelter.',
    donation: INITIAL_DEMO_DONATIONS[5],
    recipient: DEMO_PROFILES.recipient,
  },
];

/**
 * In-Memory Demo Storage Engine
 * Keeps state reactive during user interactions in demo mode.
 */
class DemoStore {
  private savedState = loadDemoState();
  private donations: Donation[] = this.savedState?.donations || [...INITIAL_DEMO_DONATIONS];
  private claims: Claim[] = this.savedState?.claims || [...INITIAL_DEMO_CLAIMS];

  private persist() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ donations: this.donations, claims: this.claims }));
    }
  }

  private expirePastDonations() {
    const now = Date.now();
    let changed = false;
    this.donations.forEach((donation) => {
      if (donation.status === 'available' && new Date(donation.pickup_deadline).getTime() <= now) {
        donation.status = 'expired';
        changed = true;
      }
    });
    if (changed) this.persist();
  }

  getDonations(): Donation[] {
    this.expirePastDonations();
    return [...this.donations];
  }

  getDonationById(id: string): Donation | undefined {
    return this.donations.find((d) => d.id === id);
  }

  createDonation(donation: Omit<Donation, 'id' | 'created_at' | 'quantity_available' | 'status'>): Donation {
    const newDonation: Donation = {
      ...donation,
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      quantity_available: donation.quantity_total,
      status: 'available',
    };
    this.donations.unshift(newDonation);
    this.persist();
    return newDonation;
  }

  claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Claim {
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) throw new Error('Donation not found');
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Requested quantity must be a positive whole number');
    if (new Date(donation.pickup_deadline).getTime() <= Date.now()) {
      donation.status = 'expired';
      this.persist();
      throw new Error('This donation has passed its pickup deadline');
    }
    if (donation.status !== 'available') throw new Error('Donation is no longer available');
    if (donation.quantity_available < quantity) throw new Error('Requested quantity exceeds available');

    donation.quantity_available -= quantity;
    if (donation.quantity_available === 0) {
      donation.status = 'reserved';
    }

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      donation_id: donationId,
      recipient_id: recipientId,
      quantity_claimed: quantity,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      notes,
      donation,
      recipient: DEMO_PROFILES.recipient,
    };

    this.claims.unshift(newClaim);
    this.persist();
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

    this.persist();
    return claim;
  }

  updateClaimStatus(claimId: string, newStatus: 'collected' | 'delivered'): Claim {
    const claim = this.claims.find((c) => c.id === claimId);
    if (!claim) throw new Error('Claim not found');

    if (newStatus === 'collected') {
      claim.status = 'collected';
      claim.collected_at = new Date().toISOString();
    } else if (newStatus === 'delivered') {
      claim.status = 'delivered';
      claim.delivered_at = new Date().toISOString();

      const donation = this.donations.find((d) => d.id === claim.donation_id);
      if (donation && donation.quantity_available === 0) {
        donation.status = 'delivered';
      }
    }

    this.persist();
    return claim;
  }

  getUserClaims(userId: string, isDonor: boolean): Claim[] {
    if (isDonor) {
      return this.claims.filter((c) => c.donation?.donor_id === userId);
    }
    return this.claims.filter((c) => c.recipient_id === userId);
  }

  getImpactMetrics(): ImpactMetrics {
    return calculateImpactMetrics(this.donations, this.claims);
  }

  // Users & Admin Moderation
  private users: UserProfile[] = Object.values(DEMO_PROFILES);
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
  }

  toggleUserStatus(userId: string): boolean {
    const u = this.users.find((user) => user.id === userId);
    if (u) {
      u.is_active = !u.is_active;
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
      id: `act-${Date.now()}`,
      action,
      details,
      created_at: new Date().toISOString(),
    });
  }

  reset() {
    this.donations = [...INITIAL_DEMO_DONATIONS];
    this.claims = [...INITIAL_DEMO_CLAIMS];
    this.users = Object.values(DEMO_PROFILES);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(DEMO_STORAGE_KEY);
  }
}

export const demoStore = new DemoStore();
