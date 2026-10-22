import { Donation, Claim, UserProfile, ImpactMetrics } from '../types';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  donor: {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Priya Sharma',
    role: 'donor',
    organization_name: 'DTU Campus Central Canteen',
    phone: '+91 98110 12345',
    city: 'Delhi NCR',
    service_area: 'Rohini & Pitampura',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  },
  recipient: {
    id: 'b0000000-0000-0000-0000-000000000001',
    full_name: 'Rajesh Kumar',
    role: 'recipient',
    organization_name: 'Robin Hood Army - Delhi Chapter',
    phone: '+91 98711 22334',
    city: 'Delhi NCR',
    service_area: 'North & West Delhi',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  },
  volunteer: {
    id: 'c0000000-0000-0000-0000-000000000001',
    full_name: 'Ananya Sen',
    role: 'volunteer',
    organization_name: 'Youth For Food Relief',
    phone: '+91 98118 77665',
    city: 'Delhi NCR',
    service_area: 'South Delhi & Noida',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  },
  admin: {
    id: 'e0000000-0000-0000-0000-000000000001',
    full_name: 'SharePlate Platform Admin',
    role: 'admin',
    organization_name: 'SharePlate Foundation',
    phone: '+91 11 2345 6789',
    city: 'Delhi NCR',
    service_area: 'Pan-India',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
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
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'shareplate/demo/vegetable_biryani_01',
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
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'shareplate/demo/paneer_roti_02',
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
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'shareplate/demo/artisan_bread_03',
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
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'shareplate/demo/idli_sambar_04',
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
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'shareplate/demo/fresh_fruits_05',
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
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    cloudinary_public_id: 'shareplate/demo/dal_makhani_06',
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
  private donations: Donation[] = [...INITIAL_DEMO_DONATIONS];
  private claims: Claim[] = [...INITIAL_DEMO_CLAIMS];

  getDonations(): Donation[] {
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
    return newDonation;
  }

  claimDonation(donationId: string, recipientId: string, quantity: number, notes?: string): Claim {
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) throw new Error('Donation not found');
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
    const portionsListed = this.donations.reduce((acc, d) => acc + d.quantity_total, 0);
    const portionsDelivered = this.claims
      .filter((c) => c.status === 'delivered')
      .reduce((acc, c) => acc + c.quantity_claimed, 0);
    const portionsReserved = this.claims
      .filter((c) => c.status === 'claimed' || c.status === 'collected')
      .reduce((acc, c) => acc + c.quantity_claimed, 0);
    const completedRescues = this.claims.filter((c) => c.status === 'delivered').length;
    const activeClaims = this.claims.filter((c) => c.status === 'claimed' || c.status === 'collected').length;

    const estimatedFoodRescuedKg = Math.round(portionsDelivered * 0.4);
    const estimatedCo2eSavedKg = Math.round(estimatedFoodRescuedKg * 2.5);

    return {
      donationsListed: this.donations.length,
      portionsListed,
      portionsReserved,
      portionsDelivered,
      completedRescues,
      activeDonors: 4,
      participatingRecipients: 3,
      activeClaims,
      completionRatePercent: 100,
      estimatedFoodRescuedKg,
      estimatedCo2eSavedKg,
      methodologyNote: 'Estimates based on FAO average meal portion (400g) and UNEP food waste emission factor (2.5 kg CO2e/kg food). Only delivered portions are counted.',
    };
  }
}

export const demoStore = new DemoStore();
