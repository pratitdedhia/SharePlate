import { Donation, Claim, UserProfile, ImpactMetrics } from '../types';
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
 * Keeps state reactive during user interactions in browser demo mode.
 * Enforces atomic quantity safety and expired deadline rejection client-side.
 */
class DemoStore {
  private donations: Donation[] = [...INITIAL_DEMO_DONATIONS];
  private claims: Claim[] = [...INITIAL_DEMO_CLAIMS];

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

  getDonations(): Donation[] {
    this.checkExpiredDonations();
    return [...this.donations];
  }

  getDonationById(id: string): Donation | undefined {
    this.checkExpiredDonations();
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

    return claim;
  }

  getUserClaims(userId: string, isDonor: boolean): Claim[] {
    if (isDonor) {
      return this.claims.filter((c) => c.donation?.donor_id === userId);
    }
    return this.claims.filter((c) => c.recipient_id === userId);
  }

  getImpactMetrics(): ImpactMetrics {
    this.checkExpiredDonations();
    return calculateImpactMetrics(this.donations, this.claims, 4, 3);
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
  }
}

export const demoStore = new DemoStore();
