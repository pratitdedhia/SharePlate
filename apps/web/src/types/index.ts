export type UserRole = 'donor' | 'recipient' | 'volunteer' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  role: UserRole;
  organization_name?: string | null;
  phone?: string | null;
  city?: string | null;
  service_area?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  donor_type?: 'restaurant' | 'canteen' | 'caterer' | 'event_organizer' | 'bakery' | 'other' | string | null;
  recipient_type?: 'ngo' | 'shelter' | 'community_kitchen' | 'food_bank' | 'orphanage' | 'other' | string | null;
  availability?: 'weekdays' | 'weekends' | 'evenings' | 'flexible' | string | null;
  contact_person?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DonationCategory =
  | 'cooked_meals'
  | 'bakery'
  | 'produce'
  | 'packaged'
  | 'dairy'
  | 'beverages'
  | 'other';

export type DonationStatus =
  | 'available'
  | 'reserved'
  | 'claimed'
  | 'collected'
  | 'delivered'
  | 'expired'
  | 'cancelled';

export interface Donation {
  id: string;
  donor_id: string;
  title: string;
  description: string;
  category: DonationCategory;
  quantity_total: number;
  quantity_available: number;
  quantity_unit: string;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  preparation_time?: string | null;
  prepared_at?: string | null;
  consume_within_hours?: number | null;
  storage_note?: string | null;
  dietary_type?: 'veg' | 'non-veg' | string | null;
  fallback_unsplash_url?: string | null;
  pickup_deadline: string;
  pickup_instructions?: string | null;
  city: string;
  location_label: string;
  latitude?: number | null;
  longitude?: number | null;
  status: DonationStatus;
  created_at: string;
  updated_at?: string;
  donor?: {
    id: string;
    full_name: string;
    organization_name?: string | null;
    city?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
  };
}

export type ClaimStatus = 'claimed' | 'collected' | 'delivered' | 'cancelled';

export interface Claim {
  id: string;
  donation_id: string;
  recipient_id: string;
  quantity_claimed: number;
  status: ClaimStatus;
  claimed_at: string;
  collected_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  notes?: string | null;
  donation?: Donation;
  recipient?: UserProfile;
}

export interface ImpactMetrics {
  donationsListed: number;
  portionsListed: number;
  portionsReserved: number;
  portionsDelivered: number;
  portionsAvailable: number;
  completedRescues: number;
  activeDonors: number;
  participatingRecipients: number;
  activeClaims: number;
  rescueRatePercent: number;
  completionRatePercent: number;
  estimatedFoodRescuedKg: number;
  estimatedCo2eSavedKg: number;
  methodologyNote: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  donation_id?: string | null;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  donation?: Donation;
}

export interface RegistrationData {
  fullName: string;
  role: 'donor' | 'recipient' | 'volunteer';
  phone: string;
  city: string;
  serviceArea?: string;
  organizationName?: string;
  donorType?: string;
  recipientType?: string;
  contactPerson?: string;
  availability?: string;
  bio?: string;
  avatarUrl?: string;
}

