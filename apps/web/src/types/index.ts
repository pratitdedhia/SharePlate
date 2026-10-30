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

export type VerificationStatus =
  | 'unassigned'
  | 'accepted'
  | 'pickup_pending'
  | 'in_transit'
  | 'delivery_pending'
  | 'verified'
  | 'disputed';

export interface Claim {
  id: string;
  donation_id: string;
  recipient_id: string;
  volunteer_id?: string | null;
  quantity_claimed: number;
  status: ClaimStatus;
  verification_status?: VerificationStatus;
  claimed_at: string;
  collected_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  notes?: string | null;
  donation?: Donation;
  recipient?: UserProfile;
  volunteer?: UserProfile | null;
  // Two-party verification fields
  pickup_code?: string;
  pickup_expires_at?: string | null;
  pickup_attempts?: number;
  pickup_confirmed_by?: string | null;
  pickup_confirmed_at?: string | null;
  delivery_code?: string;
  delivery_expires_at?: string | null;
  delivery_attempts?: number;
  delivery_confirmed_by?: string | null;
  delivery_confirmed_at?: string | null;
  portions_delivered_confirmed?: number | null;
  is_disputed?: boolean;
  dispute_reason?: string | null;
  disputed_by?: string | null;
  disputed_at?: string | null;
  points_pending?: number;
  points_released?: number;
}

export interface TripStop {
  id: string;
  type: 'start' | 'pickup' | 'delivery' | 'destination';
  name: string;
  address: string;
  city: string;
  contact_person?: string;
  phone?: string;
  instructions?: string;
  task_id?: string;
  claim_id?: string;
  portions?: number;
  food_title?: string;
  dietary_type?: string;
  deadline?: string;
  completed: boolean;
  completed_at?: string;
  sequence: number;
}

export interface VolunteerTripPlan {
  id: string;
  volunteer_id: string;
  origin: string;
  destination: string;
  corridor_label: string;
  task_ids: string[];
  stops: TripStop[];
  status: 'draft' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  is_demo_preview?: boolean;
  routing_provider_note?: string;
}

export interface RescueTask {
  id: string;
  donation_id: string;
  claim_id?: string;
  title: string;
  category: DonationCategory | string;
  dietary_type?: string;
  portions: number;
  pickup_location: string;
  pickup_address: string;
  pickup_deadline: string;
  pickup_instructions?: string;
  donor_name: string;
  donor_phone?: string;
  dropoff_location: string;
  dropoff_address: string;
  recipient_name: string;
  recipient_phone?: string;
  corridor: string;
  status: 'available' | 'claimed' | 'in_transit' | 'verified';
}

export interface VolunteerRewardRecord {
  id: string;
  volunteer_id: string;
  claim_id: string;
  donation_title: string;
  recipient_name: string;
  points: number;
  status: 'pending' | 'released' | 'forfeited';
  portions_confirmed: number;
  verified_at?: string;
  created_at: string;
  reason: string;
}

export interface VolunteerRewardsSummary {
  points_pending: number;
  points_released: number;
  verified_deliveries_count: number;
  portions_transported_count: number;
  current_tier: string;
  next_tier_threshold: number;
  history: VolunteerRewardRecord[];
}

export const REWARD_RULES = {
  BASE_POINTS_PER_DELIVERY: 50,
  POINTS_PER_PORTION: 2,
  MAX_POINTS_PER_DELIVERY: 150,
} as const;

export function calculateClaimPoints(portionsDelivered: number, isDisputed = false): number {
  if (isDisputed || portionsDelivered <= 0) return 0;
  return Math.min(
    REWARD_RULES.MAX_POINTS_PER_DELIVERY,
    REWARD_RULES.BASE_POINTS_PER_DELIVERY + portionsDelivered * REWARD_RULES.POINTS_PER_PORTION
  );
}

export interface DonorRewardRecord {
  id: string;
  donor_id: string;
  donation_id?: string;
  claim_id: string;
  donation_title: string;
  recipient_name: string;
  points: number;
  status: 'awarded' | 'pending' | 'forfeited';
  portions_confirmed: number;
  confirmed_at: string;
  created_at: string;
  reason: string;
}

export interface DonorRewardsSummary {
  points_balance: number;
  verified_rescues_count: number;
  portions_donated_count: number;
  current_tier: string;
  next_tier_threshold: number;
  history: DonorRewardRecord[];
}

export const DONOR_REWARD_RULES = {
  BASE_POINTS_PER_DELIVERY: 30,
  POINTS_PER_PORTION: 2,
  MAX_POINTS_PER_DELIVERY: 200,
} as const;

export function calculateDonorRewardPoints(portionsConfirmed: number, isDisputed = false): number {
  if (isDisputed || portionsConfirmed <= 0) return 0;
  return Math.min(
    DONOR_REWARD_RULES.MAX_POINTS_PER_DELIVERY,
    DONOR_REWARD_RULES.BASE_POINTS_PER_DELIVERY + portionsConfirmed * DONOR_REWARD_RULES.POINTS_PER_PORTION
  );
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

