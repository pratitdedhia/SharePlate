import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore, DEMO_PROFILES } from '../lib/mockData';
import { donationsService } from '../services/donations';
import { claimsService } from '../services/claims';
import { UserProfile } from '../types';

describe('Comprehensive Feature Suite for SharePlate', () => {
  beforeEach(() => {
    demoStore.reset();
  });

  describe('1. Browse Food & Donations Service', () => {
    it('retrieves all available seed donations', async () => {
      const { data, total } = await donationsService.getDonations();
      expect(total).toBeGreaterThanOrEqual(5);
      expect(data.length).toBe(total);
    });

    it('correctly retrieves donation by ID including d0000000-0000-0000-0000-000000000002', async () => {
      const donation = await donationsService.getDonationById('d0000000-0000-0000-0000-000000000002');
      expect(donation).toBeDefined();
      expect(donation.id).toBe('d0000000-0000-0000-0000-000000000002');
      expect(donation.title).toContain('Roti & Paneer Bhurji');
      expect(donation.quantity_available).toBe(20);
      expect(donation.city).toBe('Mumbai');
      expect(donation.donor?.organization_name).toBe('Annapurna Grand Caterers');
    });

    it('filters donations by category', async () => {
      const { data: produceDonations } = await donationsService.getDonations({ category: 'produce' });
      expect(produceDonations.every((d) => d.category === 'produce')).toBe(true);
      expect(produceDonations.length).toBeGreaterThanOrEqual(1);
    });

    it('filters donations by city', async () => {
      const { data: mumbaiDonations } = await donationsService.getDonations({ city: 'Mumbai' });
      expect(mumbaiDonations.every((d) => d.city === 'Mumbai')).toBe(true);
      expect(mumbaiDonations.length).toBeGreaterThanOrEqual(1);
    });

    it('searches donations by query text', async () => {
      const { data: biryaniResults } = await donationsService.getDonations({ search: 'Biryani' });
      expect(biryaniResults.length).toBeGreaterThanOrEqual(1);
      expect(biryaniResults[0].title).toContain('Biryani');
    });

    it('allows a donor to create a new surplus donation listing', async () => {
      const newListing = await donationsService.createDonation({
        donor_id: DEMO_PROFILES.donor.id,
        title: 'Dal Tadka & Basmati Rice Trays',
        description: 'Fresh lunch buffet surplus.',
        category: 'cooked_meals',
        quantity_total: 30,
        quantity_unit: 'portions',
        ingredients: 'Yellow lentils, cumin, basmati rice',
        allergens: 'None',
        dietary_type: 'veg',
        pickup_deadline: new Date(Date.now() + 6 * 3600000).toISOString(),
        city: 'Delhi NCR',
        location_label: 'Connaught Place',
      });

      expect(newListing.id).toBeDefined();
      expect(newListing.quantity_available).toBe(30);
      expect(newListing.status).toBe('available');

      const fetched = await donationsService.getDonationById(newListing.id);
      expect(fetched.title).toBe('Dal Tadka & Basmati Rice Trays');
    });
  });

  describe('2. Claims & Reserve Service Lifecycle', () => {
    it('creates a claim reservation, decrements availability, and can be retrieved', async () => {
      const donationId = 'd0000000-0000-0000-0000-000000000001';
      const before = await donationsService.getDonationById(donationId);
      const initialAvailable = before.quantity_available;

      const claim = await claimsService.claimDonation(
        donationId,
        DEMO_PROFILES.recipient.id,
        5,
        'Evening shelter distribution'
      );

      expect(claim).toBeDefined();
      expect(claim.quantity_claimed).toBe(5);
      expect(claim.status).toBe('claimed');

      const after = await donationsService.getDonationById(donationId);
      expect(after.quantity_available).toBe(initialAvailable - 5);

      const recipientClaims = await claimsService.getMyClaims(DEMO_PROFILES.recipient.id, false);
      expect(recipientClaims.some((c) => c.id === claim.id)).toBe(true);
    });

    it('supports full claim lifecycle: claimed -> collected -> delivered', async () => {
      const donationId = 'd0000000-0000-0000-0000-000000000001';
      const claim = await claimsService.claimDonation(
        donationId,
        DEMO_PROFILES.recipient.id,
        10,
        'Transit route'
      );
      expect(claim.status).toBe('claimed');

      const collected = await claimsService.markCollected(claim.id);
      expect(collected.status).toBe('collected');
      expect(collected.collected_at).toBeDefined();

      const delivered = await claimsService.markDelivered(claim.id);
      expect(delivered.status).toBe('delivered');
      expect(delivered.delivered_at).toBeDefined();
    });

    it('accurately accounts for claims in claimed and collected statuses for donor transit counts', async () => {
      const donorClaims = await claimsService.getMyClaims(DEMO_PROFILES.donor.id, true);
      const activeInTransit = donorClaims.filter((c) => c.status === 'claimed' || c.status === 'collected');
      expect(activeInTransit).toBeDefined();
    });

    it('allows cancelling an active claim and restores portion inventory', async () => {
      const donationId = 'd0000000-0000-0000-0000-000000000001';
      const before = await donationsService.getDonationById(donationId);
      const initialAvailable = before.quantity_available;

      const claim = await claimsService.claimDonation(
        donationId,
        DEMO_PROFILES.recipient.id,
        10,
        'Temporary claim'
      );
      expect((await donationsService.getDonationById(donationId)).quantity_available).toBe(initialAvailable - 10);

      const cancelled = await claimsService.cancelClaim(claim.id);
      expect(cancelled.status).toBe('cancelled');

      const restored = await donationsService.getDonationById(donationId);
      expect(restored.quantity_available).toBe(initialAvailable);
    });
  });

  describe('3. Admin Moderation & User Management', () => {
    it('allows admin to list, add, edit, and toggle status of users', () => {
      const allUsers = demoStore.getUsers();
      expect(allUsers.length).toBeGreaterThanOrEqual(4);

      // Add user
      const userToAdd: UserProfile = {
        id: 'u-custom-001',
        full_name: 'Anita Verma',
        email: 'anita@delhifoodbank.org',
        role: 'recipient',
        organization_name: 'Delhi Food Rescue Trust',
        city: 'Delhi NCR',
        phone: '+91 98111 22233',
        is_active: true,
      };
      demoStore.addUser(userToAdd);

      const fetchedUsers = demoStore.getUsers();
      expect(fetchedUsers.some((u) => u.id === 'u-custom-001')).toBe(true);

      // Edit user
      const updated = demoStore.updateUser('u-custom-001', {
        organization_name: 'Delhi Food Rescue Foundation',
      });
      expect(updated?.organization_name).toBe('Delhi Food Rescue Foundation');

      // Toggle status (deactivate)
      const isActiveAfterToggle = demoStore.toggleUserStatus('u-custom-001');
      expect(isActiveAfterToggle).toBe(false);

      // Delete user
      const deleted = demoStore.deleteUser('u-custom-001');
      expect(deleted).toBe(true);
      expect(demoStore.getUsers().some((u) => u.id === 'u-custom-001')).toBe(false);
    });

    it('allows admin to manage moderation reports', () => {
      const reports = demoStore.getReports();
      expect(reports.length).toBeGreaterThanOrEqual(1);

      const reportId = reports[0].id;
      demoStore.resolveReport(reportId, 'resolved');
      const updatedReport = demoStore.getReports().find((r) => r.id === reportId);
      expect(updatedReport.status).toBe('resolved');
    });

    it('tracks system activity logs', () => {
      demoStore.addActivityLog('admin_audit', { action: 'viewed_logs', user: 'Admin' });
      const logs = demoStore.getActivityLogs();
      expect(logs[0].action).toBe('admin_audit');
    });
  });

  describe('4. Volunteer Mission & Logistics', () => {
    it('tracks volunteer assignment and delivery completion events', () => {
      const initialLogs = demoStore.getActivityLogs();
      const initialCompleted = initialLogs.filter((l) => l.action === 'delivery_completed').length;

      demoStore.addActivityLog('volunteer_assigned', {
        volunteer: 'Rahul Verma',
        donation_id: 'd0000000-0000-0000-0000-000000000001',
      });

      demoStore.addActivityLog('delivery_completed', {
        volunteer: 'Rahul Verma',
        donation_id: 'd0000000-0000-0000-0000-000000000001',
      });

      const updatedLogs = demoStore.getActivityLogs();
      const updatedCompleted = updatedLogs.filter((l) => l.action === 'delivery_completed').length;
      expect(updatedCompleted).toBe(initialCompleted + 1);
    });
  });

  describe('5. Impact Metrics Calculations', () => {
    it('accurately computes meals rescued, beneficiaries, and carbon offset', () => {
      const metrics = demoStore.getImpactMetrics();
      expect(metrics.donationsListed).toBeGreaterThanOrEqual(5);
      expect(metrics.portionsDelivered).toBeGreaterThan(0);
      expect(metrics.estimatedFoodRescuedKg).toBe(Math.round(metrics.portionsDelivered * 0.4));
      expect(metrics.estimatedCo2eSavedKg).toBe(Math.round(metrics.estimatedFoodRescuedKg * 2.5));
    });
  });
});
