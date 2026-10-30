import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore, INITIAL_DEMO_DONATIONS } from '../lib/mockData';
import { calculateClaimPoints } from '../types';

describe('Demo Claim Safety Flow', () => {
  beforeEach(() => {
    demoStore.reset();
  });

  it('allows a valid claim and deducts available portions', () => {
    const donation = demoStore.getDonationById('d0000000-0000-0000-0000-000000000001')!;
    const initialAvailable = donation.quantity_available;

    const claim = demoStore.claimDonation(
      donation.id,
      'b0000000-0000-0000-0000-000000000001',
      10,
      'Test shelter claim'
    );

    expect(claim).toBeDefined();
    expect(claim.quantity_claimed).toBe(10);
    expect(donation.quantity_available).toBe(initialAvailable - 10);
  });

  it('rejects claiming more portions than available', () => {
    const donation = demoStore.getDonationById('d0000000-0000-0000-0000-000000000001')!;
    const excessiveQuantity = donation.quantity_available + 50;

    expect(() => {
      demoStore.claimDonation(
        donation.id,
        'b0000000-0000-0000-0000-000000000001',
        excessiveQuantity
      );
    }).toThrow(/exceeds available quantity/i);
  });

  it('rejects claiming zero or negative quantities', () => {
    const donation = demoStore.getDonationById('d0000000-0000-0000-0000-000000000001')!;

    expect(() => {
      demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 0);
    }).toThrow(/must be at least 1/i);

    expect(() => {
      demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', -5);
    }).toThrow(/must be at least 1/i);
  });

  it('rejects donor claiming their own donation', () => {
    const donation = demoStore.getDonationById('d0000000-0000-0000-0000-000000000001')!;

    expect(() => {
      demoStore.claimDonation(donation.id, donation.donor_id, 5);
    }).toThrow(/donors cannot claim their own donation/i);
  });

  it('rejects claiming expired listings whose pickup deadline has passed', () => {
    // Create an expired donation
    const expiredDonation = demoStore.createDonation({
      donor_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Past Deadline Item',
      description: 'Expired test',
      category: 'cooked_meals',
      quantity_total: 20,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() - 3600000).toISOString(),
      city: 'Delhi NCR',
      location_label: 'Test Area',
    });

    expect(() => {
      demoStore.claimDonation(
        expiredDonation.id,
        'b0000000-0000-0000-0000-000000000001',
        5
      );
    }).toThrow(/pickup deadline has passed/i);
  });

  it('marks donation status as reserved when all available portions are claimed', () => {
    const donation = demoStore.getDonationById('d0000000-0000-0000-0000-000000000001')!;
    const totalAvail = donation.quantity_available;

    demoStore.claimDonation(
      donation.id,
      'b0000000-0000-0000-0000-000000000001',
      totalAvail
    );

    expect(donation.quantity_available).toBe(0);
    expect(donation.status).toBe('reserved');
  });

  it('delivering a claim that was never collected throws and leaves status "claimed"', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      5
    );
    expect(claim.status).toBe('claimed');

    expect(() => {
      demoStore.updateClaimStatus(claim.id, 'delivered');
    }).toThrow('Claim must be collected before it can be delivered');

    expect(claim.status).toBe('claimed');
  });

  it('collecting or delivering a cancelled claim throws', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      5
    );
    demoStore.cancelClaim(claim.id);
    expect(claim.status).toBe('cancelled');

    expect(() => {
      demoStore.updateClaimStatus(claim.id, 'collected');
    }).toThrow();

    expect(() => {
      demoStore.updateClaimStatus(claim.id, 'delivered');
    }).toThrow();
  });

  it('the donation is not marked "delivered" while another claim on it is still open', () => {
    const donation = demoStore.getDonationById('d0000000-0000-0000-0000-000000000001')!;
    const half = Math.floor(donation.quantity_available / 2);
    const remainder = donation.quantity_available - half;

    const claim1 = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', half);
    const claim2 = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', remainder);

    expect(donation.quantity_available).toBe(0);
    expect(donation.status).toBe('reserved');

    // Collect and deliver claim1, but claim2 is still 'claimed' (open)
    demoStore.updateClaimStatus(claim1.id, 'collected');
    demoStore.updateClaimStatus(claim1.id, 'delivered');

    expect(claim1.status).toBe('delivered');
    expect(claim2.status).toBe('claimed');
    expect(donation.status).not.toBe('delivered');

    // Now collect and deliver claim2
    demoStore.updateClaimStatus(claim2.id, 'collected');
    demoStore.updateClaimStatus(claim2.id, 'delivered');

    expect(claim2.status).toBe('delivered');
    expect(donation.status).toBe('delivered');
  });

  it('two rapid successive claims get different IDs', () => {
    const claim1 = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      2
    );
    const claim2 = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      2
    );

    expect(claim1.id).not.toBe(claim2.id);
  });
});

describe('Two-Party Verification & Volunteer Rewards Flow', () => {
  beforeEach(() => {
    demoStore.reset();
  });

  it('points are NOT released merely upon task acceptance or volunteer pickup initiation', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      25
    );

    const assigned = demoStore.assignVolunteerToClaim(claim.id, 'c0000000-0000-0000-0000-000000000001');
    expect(assigned.verification_status).toBe('accepted');
    expect(assigned.points_pending).toBe(100); // 50 base + 25*2 = 100
    expect(assigned.points_released || 0).toBe(0);

    // Volunteer initiates pickup
    const initiated = demoStore.initiatePickup(claim.id, 'c0000000-0000-0000-0000-000000000001');
    expect(initiated.verification_status).toBe('pickup_pending');
    expect(initiated.points_released || 0).toBe(0);
  });

  it('releases points ONLY after both donor confirms pickup and recipient confirms delivery', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      30
    );

    demoStore.assignVolunteerToClaim(claim.id, 'c0000000-0000-0000-0000-000000000001');
    demoStore.initiatePickup(claim.id, 'c0000000-0000-0000-0000-000000000001');

    // 1. Donor confirms pickup
    const pickedUp = demoStore.confirmPickup(claim.id, 'a0000000-0000-0000-0000-000000000001');
    expect(pickedUp.verification_status).toBe('in_transit');
    expect(pickedUp.pickup_confirmed_by).toBeDefined();
    expect(pickedUp.pickup_confirmed_at).toBeDefined();
    // Points must still be 0! Not released yet!
    expect(pickedUp.points_released || 0).toBe(0);

    // 2. Recipient confirms delivery
    const { claim: deliveredClaim, pointsAwarded } = demoStore.confirmDelivery(
      claim.id,
      'b0000000-0000-0000-0000-000000000001',
      30
    );

    expect(deliveredClaim.verification_status).toBe('verified');
    expect(deliveredClaim.status).toBe('delivered');
    expect(deliveredClaim.delivery_confirmed_by).toBeDefined();
    expect(deliveredClaim.delivery_confirmed_at).toBeDefined();
    expect(pointsAwarded).toBe(110); // 50 base + 30*2 = 110 pts
    expect(deliveredClaim.points_released).toBe(110);
    expect(deliveredClaim.points_pending).toBe(0);
  });

  it('caps points at 150 maximum per delivery according to documented rules', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      45
    );

    demoStore.assignVolunteerToClaim(claim.id, 'c0000000-0000-0000-0000-000000000001');
    demoStore.confirmPickup(claim.id, 'a0000000-0000-0000-0000-000000000001');

    // 50 base + 45*2 = 140
    const res1 = demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 45);
    expect(res1.pointsAwarded).toBe(140);

    // Test cap with large quantity (e.g. 70 portions: 50 + 140 = 190 -> capped at 150)
    expect(calculateClaimPoints(70, false)).toBe(150);
  });

  it('awards points based on actual confirmed portions during partial deliveries', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      40
    );

    demoStore.assignVolunteerToClaim(claim.id, 'c0000000-0000-0000-0000-000000000001');
    demoStore.confirmPickup(claim.id, 'a0000000-0000-0000-0000-000000000001');

    // NGO confirms only 25 portions received (15 missing/damaged)
    const { claim: delivered, pointsAwarded } = demoStore.confirmDelivery(
      claim.id,
      'b0000000-0000-0000-0000-000000000001',
      25
    );

    expect(delivered.portions_delivered_confirmed).toBe(25);
    expect(pointsAwarded).toBe(100); // 50 base + 25*2 = 100
    expect(delivered.points_released).toBe(100);
  });

  it('disputing a claim flags it, awards 0 points, and holds pending points', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      30
    );

    demoStore.assignVolunteerToClaim(claim.id, 'c0000000-0000-0000-0000-000000000001');
    demoStore.confirmPickup(claim.id, 'a0000000-0000-0000-0000-000000000001');

    const disputed = demoStore.disputeClaim(
      claim.id,
      'b0000000-0000-0000-0000-000000000001',
      'Container leaked during transit; food spoiled.'
    );

    expect(disputed.is_disputed).toBe(true);
    expect(disputed.verification_status).toBe('disputed');
    expect(disputed.points_pending).toBe(0);
    expect(disputed.points_released).toBe(0);

    // Confirming a disputed delivery throws error
    expect(() => {
      demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 30);
    }).toThrow(/disputed claim/i);
  });

  it('manages volunteer trip plans with sequential stops and corridor tasks', () => {
    const tasks = demoStore.getRescueTasks('Delhi');
    expect(tasks.length).toBeGreaterThan(0);

    const plan = demoStore.createTripPlan({
      volunteer_id: 'c0000000-0000-0000-0000-000000000001',
      origin: 'Rohini Metro Station',
      destination: 'Central Secretariat',
      corridor_label: 'Delhi North-West Corridor',
      task_ids: [tasks[0].id],
      stops: [
        {
          id: 's-1',
          type: 'start',
          name: 'Origin',
          address: 'Rohini',
          city: 'Delhi NCR',
          sequence: 1,
          completed: true,
        },
        {
          id: 's-2',
          type: 'pickup',
          name: tasks[0].pickup_location,
          address: tasks[0].pickup_address,
          city: 'Delhi NCR',
          sequence: 2,
          completed: false,
        },
        {
          id: 's-3',
          type: 'delivery',
          name: tasks[0].dropoff_location,
          address: tasks[0].dropoff_address,
          city: 'Delhi NCR',
          sequence: 3,
          completed: false,
        },
        {
          id: 's-4',
          type: 'destination',
          name: 'Destination',
          address: 'Central Secretariat',
          city: 'Delhi NCR',
          sequence: 4,
          completed: false,
        },
      ],
      is_demo_preview: true,
    });

    const accepted = demoStore.acceptTripPlan(plan.id);
    expect(accepted.status).toBe('accepted');
    expect(accepted.accepted_at).toBeDefined();

    const stopCompleted = demoStore.completeTripStop(plan.id, 's-2');
    expect(stopCompleted.stops.find((s) => s.id === 's-2')?.completed).toBe(true);
  });
});

describe('Multi-Account Isolation & Role-Based Authorization Regression', () => {
  beforeEach(() => {
    demoStore.reset();
  });

  it('regression: NGO reserves part of donor listing; NGO sees claim, donor sees claim + recipient details, unrelated donors cannot see it', () => {
    const donorAId = 'a0000000-0000-0000-0000-000000000001';
    const donorBId = 'a0000000-0000-0000-0000-000000000002'; // Unrelated donor
    const ngoId = 'b0000000-0000-0000-0000-000000000001'; // Recipient NGO

    // 1. Donor A creates a donation of 50 portions
    const donation = demoStore.createDonation({
      donor_id: donorAId,
      title: 'Fresh Biryani Batch',
      description: '50 portions prepared for evening distribution',
      category: 'cooked_meals',
      quantity_total: 50,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() + 86400000).toISOString(),
      city: 'Delhi NCR',
      location_label: 'Connaught Place',
    });

    expect(donation.quantity_available).toBe(50);
    expect(donation.quantity_total).toBe(50);

    // 2. NGO reserves 20 portions
    const claim = demoStore.claimDonation(donation.id, ngoId, 20, 'For homeless shelter evening meal');
    expect(claim.quantity_claimed).toBe(20);

    // Check inventory update
    const updatedDonation = demoStore.getDonationById(donation.id)!;
    expect(updatedDonation.quantity_available).toBe(30);

    // 3. NGO checks its claims
    const ngoClaims = demoStore.getUserClaims(ngoId, false);
    const ngoClaim = ngoClaims.find((c) => c.id === claim.id);
    expect(ngoClaim).toBeDefined();
    expect(ngoClaim?.quantity_claimed).toBe(20);
    expect(ngoClaim?.donation?.title).toBe('Fresh Biryani Batch');

    // 4. Donor A checks its incoming claims
    const donorAClaims = demoStore.getUserClaims(donorAId, true);
    const donorAClaim = donorAClaims.find((c) => c.id === claim.id);
    expect(donorAClaim).toBeDefined();
    expect(donorAClaim?.recipient).toBeDefined();
    expect(donorAClaim?.recipient?.id).toBe(ngoId);
    expect(donorAClaim?.recipient?.organization_name).toBeDefined();

    // 5. Unrelated Donor B queries incoming claims -> MUST NOT SEE Donor A's claim!
    const donorBClaims = demoStore.getUserClaims(donorBId, true);
    const donorBFoundClaim = donorBClaims.find((c) => c.id === claim.id);
    expect(donorBFoundClaim).toBeUndefined();

    // Donor B also checks their own donations list
    const donorBDonations = demoStore.getDonations({ donor_id: donorBId, status: 'all' });
    expect(donorBDonations.some((d) => d.id === donation.id)).toBe(false);
  });

  it('donor donation loading includes all statuses (available, reserved, delivered, etc.)', () => {
    const donorId = 'a0000000-0000-0000-0000-000000000001';
    const allDonorDonations = demoStore.getDonations({ donor_id: donorId, status: 'all' });
    expect(allDonorDonations.length).toBeGreaterThan(0);

    // Verify all returned donations belong to this donor
    for (const d of allDonorDonations) {
      expect(d.donor_id).toBe(donorId);
    }
  });

  it('rejects unauthorized volunteer pickup confirmation on behalf of donor', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      10
    );
    const volunteerId = 'c0000000-0000-0000-0000-000000000001';
    demoStore.assignVolunteerToClaim(claim.id, volunteerId);
    demoStore.initiatePickup(claim.id, volunteerId);

    // Volunteer attempts to confirm pickup on behalf of donor
    expect(() => {
      demoStore.confirmPickup(claim.id, volunteerId);
    }).toThrow(/unauthorized/i);
  });

  it('rejects unauthorized volunteer delivery confirmation on behalf of recipient', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      10
    );
    const volunteerId = 'c0000000-0000-0000-0000-000000000001';
    demoStore.assignVolunteerToClaim(claim.id, volunteerId);
    demoStore.confirmPickup(claim.id, 'a0000000-0000-0000-0000-000000000001');

    // Volunteer attempts to confirm delivery on behalf of recipient NGO
    expect(() => {
      demoStore.confirmDelivery(claim.id, volunteerId, 10);
    }).toThrow(/unauthorized/i);
  });

  it('rejects duplicate delivery confirmations', () => {
    const claim = demoStore.claimDonation(
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      10
    );
    const volunteerId = 'c0000000-0000-0000-0000-000000000001';
    demoStore.assignVolunteerToClaim(claim.id, volunteerId);
    demoStore.confirmPickup(claim.id, 'a0000000-0000-0000-0000-000000000001');
    demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 10);

    // Attempting second delivery confirmation throws
    expect(() => {
      demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 10);
    }).toThrow(/already delivered/i);
  });
});
