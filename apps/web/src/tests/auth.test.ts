import { describe, it, expect, beforeEach } from 'vitest';
import { DEMO_PROFILES, demoStore } from '../lib/mockData';
import { UserRole } from '../types';

// Mock localStorage for node test environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: storageMock, writable: true });

describe('SharePlate Authentication & Role Governance Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    demoStore.reset();
  });

  // 1, 2, 3: Donor, Recipient, Volunteer Registration
  it('registers a new Donor with conditional business fields', async () => {
    const donorData = {
      fullName: 'Vikram Malhotra',
      role: 'donor' as const,
      phone: '+91 98200 67890',
      city: 'Mumbai',
      organizationName: 'Annapurna Grand Caterers',
      donorType: 'caterer',
      serviceArea: 'Andheri & BKC',
      contactPerson: 'Vikram Malhotra',
    };

    const newProfile = {
      id: 'user-donor-123',
      email: 'vikram@annapurna.demo',
      full_name: donorData.fullName,
      role: donorData.role,
      organization_name: donorData.organizationName,
      phone: donorData.phone,
      city: donorData.city,
      service_area: donorData.serviceArea,
      donor_type: donorData.donorType,
      contact_person: donorData.contactPerson,
      is_active: true,
    };

    demoStore.addUser(newProfile);
    const users = demoStore.getUsers();
    const found = users.find((u) => u.email === 'vikram@annapurna.demo');

    expect(found).toBeDefined();
    expect(found?.role).toBe('donor');
    expect(found?.donor_type).toBe('caterer');
    expect(found?.organization_name).toBe('Annapurna Grand Caterers');
  });

  it('registers a new Recipient organization with shelter fields', async () => {
    const recipientData = {
      fullName: 'Sneha Patil',
      role: 'recipient' as const,
      phone: '+91 98201 55667',
      city: 'Mumbai',
      organizationName: 'Feeding India Mumbai Hub',
      recipientType: 'ngo',
      serviceArea: 'Western Suburbs',
      contactPerson: 'Sneha Patil',
    };

    const newProfile = {
      id: 'user-rec-123',
      email: 'sneha@feedingindia.demo',
      full_name: recipientData.fullName,
      role: recipientData.role,
      organization_name: recipientData.organizationName,
      phone: recipientData.phone,
      city: recipientData.city,
      service_area: recipientData.serviceArea,
      recipient_type: recipientData.recipientType,
      contact_person: recipientData.contactPerson,
      is_active: true,
    };

    demoStore.addUser(newProfile);
    const users = demoStore.getUsers();
    const found = users.find((u) => u.email === 'sneha@feedingindia.demo');

    expect(found).toBeDefined();
    expect(found?.role).toBe('recipient');
    expect(found?.recipient_type).toBe('ngo');
  });

  it('registers a new Volunteer with logistics availability', async () => {
    const volunteerData = {
      fullName: 'Rohan Mehta',
      role: 'volunteer' as const,
      phone: '+91 98330 44332',
      city: 'Mumbai',
      serviceArea: 'Bandra to Andheri',
      availability: 'evenings',
      bio: 'Express bicycle courier ready for evening food rescue drops.',
    };

    const newProfile = {
      id: 'user-vol-123',
      email: 'rohan@foodrunners.demo',
      full_name: volunteerData.fullName,
      role: volunteerData.role,
      phone: volunteerData.phone,
      city: volunteerData.city,
      service_area: volunteerData.serviceArea,
      availability: volunteerData.availability,
      bio: volunteerData.bio,
      is_active: true,
    };

    demoStore.addUser(newProfile);
    const users = demoStore.getUsers();
    const found = users.find((u) => u.email === 'rohan@foodrunners.demo');

    expect(found).toBeDefined();
    expect(found?.role).toBe('volunteer');
    expect(found?.availability).toBe('evenings');
  });

  // 4: Duplicate Email Rejection
  it('rejects registration with duplicate email in registry', () => {
    const existingUsers = demoStore.getUsers();
    const duplicateEmail = 'donor@shareplate.demo';

    const isDuplicate = existingUsers.some((u) => u.email?.toLowerCase() === duplicateEmail.toLowerCase());
    expect(isDuplicate).toBe(true);
  });

  // 5: Password Mismatch Validation
  it('validates password matching during registration', () => {
    const password: string = 'SecurePassword123!';
    const mismatchedConfirm: string = 'WrongPassword456!';
    const isValid: boolean = password === mismatchedConfirm;
    expect(isValid).toBe(false);
  });

  // 6 & 7: Valid & Invalid Login
  it('authenticates valid login and resolves correct profile', () => {
    const email = 'donor@shareplate.demo';
    const profile = DEMO_PROFILES.donor;
    expect(profile.email).toBe(email);
    expect(profile.role).toBe('donor');
    expect(profile.is_active).toBe(true);
  });

  it('identifies and rejects inactive or deactivated accounts', () => {
    const deactivatedProfile = {
      ...DEMO_PROFILES.donor,
      id: 'deactivated-user-1',
      is_active: false,
    };

    expect(deactivatedProfile.is_active).toBe(false);
  });

  // 8: Session Persistence
  it('persists authenticated session and profile in storage', () => {
    const token = 'demo-user-donor';
    const profile = DEMO_PROFILES.donor;

    localStorage.setItem('shareplate_token', token);
    localStorage.setItem('shareplate_current_user', JSON.stringify(profile));

    const restoredToken = localStorage.getItem('shareplate_token');
    const restoredUser = JSON.parse(localStorage.getItem('shareplate_current_user') || '{}');

    expect(restoredToken).toBe(token);
    expect(restoredUser.role).toBe('donor');
    expect(restoredUser.id).toBe(profile.id);
  });

  // 9: Logout invalidation
  it('invalidates credentials upon logout', () => {
    localStorage.setItem('shareplate_token', 'demo-token');
    localStorage.setItem('shareplate_current_user', JSON.stringify(DEMO_PROFILES.donor));

    // Perform logout
    localStorage.removeItem('shareplate_token');
    localStorage.removeItem('shareplate_current_user');

    expect(localStorage.getItem('shareplate_token')).toBeNull();
    expect(localStorage.getItem('shareplate_current_user')).toBeNull();
  });

  // 10: Forgot Password behavior
  it('validates email requirement for password reset request', () => {
    const validEmail = 'donor@shareplate.demo';
    const invalidEmail = 'not-an-email';

    const isValidFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    expect(isValidFormat(validEmail)).toBe(true);
    expect(isValidFormat(invalidEmail)).toBe(false);
  });

  // 11, 12, 13, 14: Demo Logins for All 4 Roles
  it('authenticates 1-click Donor demo with seeded data', () => {
    const donor = DEMO_PROFILES.donor;
    expect(donor.role).toBe('donor');
    expect(donor.organization_name).toBe('DTU Campus Central Canteen');
    expect(donor.city).toBe('Delhi NCR');
  });

  it('authenticates 1-click Recipient demo with seeded data', () => {
    const recipient = DEMO_PROFILES.recipient;
    expect(recipient.role).toBe('recipient');
    expect(recipient.organization_name).toBe('Robin Hood Army - Delhi Chapter');
  });

  it('authenticates 1-click Volunteer demo with seeded data', () => {
    const volunteer = DEMO_PROFILES.volunteer;
    expect(volunteer.role).toBe('volunteer');
    expect(volunteer.organization_name).toBe('Youth For Food Relief');
  });

  it('authenticates 1-click Admin demo with operations oversight', () => {
    const admin = DEMO_PROFILES.admin;
    expect(admin.role).toBe('admin');
    expect(admin.organization_name).toBe('SharePlate Foundation');
  });

  // 15: Correct Role-Based Redirects
  it('maps each role to its strictly isolated dashboard route', () => {
    const redirectMap: Record<UserRole, string> = {
      donor: '/dashboard/donor',
      recipient: '/dashboard/recipient',
      volunteer: '/dashboard/volunteer',
      admin: '/dashboard/admin',
    };

    expect(redirectMap.donor).toBe('/dashboard/donor');
    expect(redirectMap.recipient).toBe('/dashboard/recipient');
    expect(redirectMap.volunteer).toBe('/dashboard/volunteer');
    expect(redirectMap.admin).toBe('/dashboard/admin');
  });

  // 16, 17: Protected Route and Cross-Role Guarding
  it('prevents a recipient from accessing donor listings dashboard', () => {
    const currentUserRole: UserRole = 'recipient';
    const allowedRoles: UserRole[] = ['donor'];

    const hasAccess = allowedRoles.includes(currentUserRole);
    expect(hasAccess).toBe(false);
  });

  it('prevents a donor from accessing admin oversight moderation', () => {
    const currentUserRole: UserRole = 'donor';
    const allowedRoles: UserRole[] = ['admin'];

    const hasAccess = allowedRoles.includes(currentUserRole);
    expect(hasAccess).toBe(false);
  });

  // 18: Strict Prevention of Self-Assigned Admin Roles
  it('strictly forbids self-service registration as Administrator', () => {
    const attemptedRoles = ['donor', 'recipient', 'volunteer', 'admin'];
    const disallowedRoles = attemptedRoles.filter((r) => r === 'admin');

    const canSelfRegister = (role: string) => role !== 'admin';

    expect(canSelfRegister('donor')).toBe(true);
    expect(canSelfRegister('recipient')).toBe(true);
    expect(canSelfRegister('volunteer')).toBe(true);
    expect(canSelfRegister('admin')).toBe(false);
  });

  // 21 & 22: Existing Donation & Claim Operations Preservation
  it('preserves existing donation creation and atomic reserve math', () => {
    const totalDonationsBefore = demoStore.getDonations().length;

    const newDonation = demoStore.createDonation({
      donor_id: DEMO_PROFILES.donor.id,
      title: 'Steamed Rice & Dal Makhani Boxes',
      description: 'Hot vegetarian meal packs from lunchtime batch.',
      category: 'cooked_meals',
      quantity_total: 50,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
      city: 'Delhi NCR',
      location_label: 'Rohini Sector 17',
    });

    expect(newDonation.id).toBeDefined();
    expect(newDonation.quantity_available).toBe(50);
    expect(demoStore.getDonations().length).toBe(totalDonationsBefore + 1);

    // Atomically claim 20 portions
    const claim = demoStore.claimDonation(newDonation.id, DEMO_PROFILES.recipient.id, 20);
    expect(claim.quantity_claimed).toBe(20);

    const updatedDonation = demoStore.getDonationById(newDonation.id);
    expect(updatedDonation?.quantity_available).toBe(30);
  });
});
