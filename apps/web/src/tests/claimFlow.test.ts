import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore, INITIAL_DEMO_DONATIONS } from '../lib/mockData';
import { calculateClaimPoints, calculateDonorRewardPoints, DONOR_REWARD_RULES } from '../types';
import { generateGoogleMapsTripSegments, RouteStopInput } from '../lib/routing';

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

describe('Volunteer Routing & Personal Travel Segregation Regression', () => {
  beforeEach(() => {
    demoStore.reset();
  });

  it('personal route stops (start origin & destination) cannot change claim status or release points', () => {
    const volunteerId = 'c0000000-0000-0000-0000-000000000001';
    const tasks = demoStore.getRescueTasks('Delhi');
    expect(tasks.length).toBeGreaterThan(0);
    const task = tasks[0];

    const plan = demoStore.createTripPlan({
      volunteer_id: volunteerId,
      origin: 'DTU Main Campus, Rohini Sector 17',
      destination: 'Connaught Place Metro Hub, Central Delhi',
      corridor_label: 'Delhi North-West Corridor',
      task_ids: [task.id],
      stops: [
        {
          id: 'stop-start-01',
          type: 'start',
          name: 'Personal Commute Departure',
          address: 'DTU Main Campus, Rohini Sector 17',
          city: 'Delhi NCR',
          sequence: 1,
          completed: false,
        },
        {
          id: 'stop-pickup-01',
          type: 'pickup',
          name: task.pickup_location,
          address: task.pickup_address,
          city: 'Delhi NCR',
          task_id: task.id,
          portions: task.portions,
          food_title: task.title,
          sequence: 2,
          completed: false,
        },
        {
          id: 'stop-delivery-01',
          type: 'delivery',
          name: task.dropoff_location,
          address: task.dropoff_address,
          city: 'Delhi NCR',
          task_id: task.id,
          portions: task.portions,
          food_title: task.title,
          sequence: 3,
          completed: false,
        },
        {
          id: 'stop-dest-01',
          type: 'destination',
          name: 'Personal Commute Arrival',
          address: 'Connaught Place Metro Hub, Central Delhi',
          city: 'Delhi NCR',
          sequence: 4,
          completed: false,
        },
      ],
      is_demo_preview: true,
    });

    const acceptedPlan = demoStore.acceptTripPlan(plan.id);
    expect(acceptedPlan.status).toBe('accepted');

    // Retrieve corresponding claim
    const assignedClaim = demoStore.getAllClaims().find((c) => c.volunteer_id === volunteerId && c.status === 'claimed');
    expect(assignedClaim).toBeDefined();
    const initialClaimStatus = assignedClaim!.status;
    const initialVerificationStatus = assignedClaim!.verification_status;
    expect(assignedClaim!.points_released || 0).toBe(0);

    // 1. Volunteer marks personal origin departure stop as completed
    const updatedPlan1 = demoStore.completeTripStop(plan.id, 'stop-start-01');
    expect(updatedPlan1.stops.find((s) => s.id === 'stop-start-01')?.completed).toBe(true);

    // Verify claim status remains untouched!
    const claimAfterPersonalOrigin = demoStore.getAllClaims().find((c) => c.id === assignedClaim!.id)!;
    expect(claimAfterPersonalOrigin.status).toBe(initialClaimStatus);
    expect(claimAfterPersonalOrigin.verification_status).toBe(initialVerificationStatus);
    expect(claimAfterPersonalOrigin.points_released || 0).toBe(0);

    // 2. Volunteer marks personal destination arrival stop as completed
    const updatedPlan2 = demoStore.completeTripStop(plan.id, 'stop-dest-01');
    expect(updatedPlan2.stops.find((s) => s.id === 'stop-dest-01')?.completed).toBe(true);

    // Verify claim status STILL remains untouched!
    const claimAfterPersonalDest = demoStore.getAllClaims().find((c) => c.id === assignedClaim!.id)!;
    expect(claimAfterPersonalDest.status).toBe(initialClaimStatus);
    expect(claimAfterPersonalDest.verification_status).toBe(initialVerificationStatus);
    expect(claimAfterPersonalDest.points_released || 0).toBe(0);
  });

  it('assigned SharePlate pickup and delivery actions update correct claim and appear across donor, NGO, volunteer, and admin views', () => {
    const donorId = 'a0000000-0000-0000-0000-000000000001';
    const ngoId = 'b0000000-0000-0000-0000-000000000001';
    const volunteerId = 'c0000000-0000-0000-0000-000000000001';

    // 1. Donor creates listing
    const donation = demoStore.createDonation({
      donor_id: donorId,
      title: 'Nutritious Khichdi Trays',
      description: 'Prepared for community kitchen relief',
      category: 'cooked_meals',
      quantity_total: 35,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() + 86400000).toISOString(),
      city: 'Delhi NCR',
      location_label: 'Pitampura',
    });

    // 2. NGO reserves the donation
    const claim = demoStore.claimDonation(donation.id, ngoId, 35, 'Shelter dinner distribution');
    expect(claim.status).toBe('claimed');

    // 3. Volunteer assigns route to this claim
    demoStore.assignVolunteerToClaim(claim.id, volunteerId);

    // 4. Pickup Handover: donor kitchen confirms food handover
    const pickedUpClaim = demoStore.confirmPickup(claim.id, donorId);
    expect(pickedUpClaim.status).toBe('collected');
    expect(pickedUpClaim.verification_status).toBe('in_transit');
    expect(pickedUpClaim.pickup_confirmed_by).toBeDefined();

    // Verify cross-account consistency after pickup:
    // - Donor view: sees claim as collected / in transit on their donation
    const donorClaims = demoStore.getUserClaims(donorId, true);
    const donorViewClaim = donorClaims.find((c) => c.id === claim.id);
    expect(donorViewClaim?.status).toBe('collected');
    expect(donorViewClaim?.verification_status).toBe('in_transit');

    // - NGO view: sees incoming food as in transit
    const ngoClaims = demoStore.getUserClaims(ngoId, false);
    const ngoViewClaim = ngoClaims.find((c) => c.id === claim.id);
    expect(ngoViewClaim?.status).toBe('collected');
    expect(ngoViewClaim?.verification_status).toBe('in_transit');

    // - Volunteer view: sees claim as collected and in transit
    const volunteerClaims = demoStore.getUserClaims(volunteerId, 'volunteer');
    const volViewClaim = volunteerClaims.find((c) => c.id === claim.id);
    expect(volViewClaim?.status).toBe('collected');

    // - Admin view: sees claim in transit
    const allClaims = demoStore.getAllClaims();
    const adminViewClaim = allClaims.find((c) => c.id === claim.id);
    expect(adminViewClaim?.status).toBe('collected');

    // 5. Delivery Confirmation: recipient NGO confirms receipt of portions
    const { claim: deliveredClaim, pointsAwarded } = demoStore.confirmDelivery(claim.id, ngoId, 35);
    expect(deliveredClaim.status).toBe('delivered');
    expect(deliveredClaim.verification_status).toBe('verified');
    expect(deliveredClaim.portions_delivered_confirmed).toBe(35);
    expect(pointsAwarded).toBe(120); // 50 base + 35*2 = 120 pts

    // Verify cross-account consistency after delivery:
    // - Donor view: sees delivery completed
    const donorClaimsAfter = demoStore.getUserClaims(donorId, true);
    expect(donorClaimsAfter.find((c) => c.id === claim.id)?.status).toBe('delivered');

    // - NGO view: sees delivered & verified
    const ngoClaimsAfter = demoStore.getUserClaims(ngoId, false);
    expect(ngoClaimsAfter.find((c) => c.id === claim.id)?.status).toBe('delivered');

    // - Volunteer rewards ledger: sees released points
    const rewards = demoStore.getVolunteerRewards(volunteerId);
    expect(rewards.points_released).toBeGreaterThanOrEqual(120);
    expect(rewards.verified_deliveries_count).toBeGreaterThanOrEqual(1);

    // - Admin view: sees delivered
    const adminClaimsAfter = demoStore.getAllClaims();
    expect(adminClaimsAfter.find((c) => c.id === claim.id)?.status).toBe('delivered');
  });

  describe('Donor Rewards & Two-Party NGO Delivery Verification', () => {
    it('does NOT award donor rewards when a donation is created, reserved, or picked up', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';
      const initialRewards = demoStore.getDonorRewards(donorId);
      const initialPoints = initialRewards.points_balance;

      // 1. Create a new donation
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Fresh Biryani & Raita Pots',
        description: 'Hot vegetarian biryani from lunchtime event',
        category: 'cooked_meals',
        quantity_total: 50,
        quantity_unit: 'portions',
        city: 'Delhi NCR',
        location_label: 'DTU Main Campus, Rohini',
        pickup_instructions: 'Gate 2 Loading Dock',
        pickup_deadline: new Date(Date.now() + 6 * 3600000).toISOString(),
      });

      // Verify 0 points awarded on listing creation
      expect(demoStore.getDonorRewards(donorId).points_balance).toBe(initialPoints);

      // 2. NGO reserves/claims the food
      const claim = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 30);
      expect(claim.status).toBe('claimed');

      // Verify 0 points awarded on reservation
      expect(demoStore.getDonorRewards(donorId).points_balance).toBe(initialPoints);

      // 3. Mark food as collected for transit
      demoStore.updateClaimStatus(claim.id, 'collected');
      expect(demoStore.getDonorRewards(donorId).points_balance).toBe(initialPoints);
    });

    it('awards donor rewards ONLY when delivery is confirmed by recipient NGO with correct formula', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';
      const initialRewards = demoStore.getDonorRewards(donorId);
      const initialPoints = initialRewards.points_balance;
      const initialRescues = initialRewards.verified_rescues_count;

      // Create donation
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Fresh Paneer Tikka Rolls',
        description: 'Fresh rolls packaged safely',
        category: 'cooked_meals',
        quantity_total: 40,
        quantity_unit: 'portions',
        city: 'Delhi NCR',
        location_label: 'Rohini Kitchen',
        pickup_instructions: 'Dock A',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
      });

      // Claim 40 portions
      const claim = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 40);

      // Recipient NGO confirms delivery of all 40 portions
      demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 40);

      const updatedRewards = demoStore.getDonorRewards(donorId);
      // Formula: 30 base + (40 portions * 2) = 110 points
      const expectedPointsEarned = DONOR_REWARD_RULES.BASE_POINTS_PER_DELIVERY + 40 * DONOR_REWARD_RULES.POINTS_PER_PORTION;
      expect(updatedRewards.points_balance).toBe(initialPoints + expectedPointsEarned);
      expect(updatedRewards.verified_rescues_count).toBe(initialRescues + 1);

      const latestRecord = updatedRewards.history.find((r) => r.claim_id === claim.id);
      expect(latestRecord).toBeDefined();
      expect(latestRecord?.donation_title).toBe('Fresh Paneer Tikka Rolls');
      expect(latestRecord?.portions_confirmed).toBe(40);
      expect(latestRecord?.points).toBe(110);
      expect(latestRecord?.status).toBe('awarded');
      expect(latestRecord?.confirmed_at).toBeDefined();
    });

    it('calculates partial deliveries strictly on confirmed delivered portions', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';
      const initialRewards = demoStore.getDonorRewards(donorId);
      const initialPoints = initialRewards.points_balance;

      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Mixed Vegetable Pulao',
        description: 'Surplus pulao pots',
        category: 'cooked_meals',
        quantity_total: 50,
        quantity_unit: 'portions',
        city: 'Delhi NCR',
        location_label: 'Central Kitchen',
        pickup_instructions: 'Door 1',
        pickup_deadline: new Date(Date.now() + 5 * 3600000).toISOString(),
      });

      const claim = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 45);

      // Recipient NGO only confirms 25 portions (partial delivery)
      demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 25);

      const updatedRewards = demoStore.getDonorRewards(donorId);
      // Formula: 30 base + (25 confirmed portions * 2) = 80 points
      expect(updatedRewards.points_balance).toBe(initialPoints + 80);

      const record = updatedRewards.history.find((r) => r.claim_id === claim.id);
      expect(record?.portions_confirmed).toBe(25);
      expect(record?.points).toBe(80);
    });

    it('does NOT award donor rewards for cancelled claims', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';
      const initialRewards = demoStore.getDonorRewards(donorId);
      const initialPoints = initialRewards.points_balance;

      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Sambar & Rice Vats',
        description: 'Hot food',
        category: 'cooked_meals',
        quantity_total: 30,
        quantity_unit: 'portions',
        city: 'Delhi NCR',
        location_label: 'Canteen',
        pickup_instructions: 'Back entrance',
        pickup_deadline: new Date(Date.now() + 3 * 3600000).toISOString(),
      });

      const claim = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 20);

      // Cancel claim before delivery
      demoStore.cancelClaim(claim.id);

      const updatedRewards = demoStore.getDonorRewards(donorId);
      expect(updatedRewards.points_balance).toBe(initialPoints);
      expect(updatedRewards.history.some((r) => r.claim_id === claim.id)).toBe(false);
    });

    it('does NOT award points for disputed deliveries and marks record forfeited', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';
      const initialRewards = demoStore.getDonorRewards(donorId);
      const initialPoints = initialRewards.points_balance;

      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Steamed Momos & Chutney',
        description: 'Vegetable momos',
        category: 'cooked_meals',
        quantity_total: 40,
        quantity_unit: 'portions',
        city: 'Delhi NCR',
        location_label: 'Kitchen A',
        pickup_instructions: 'Side entrance',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
      });

      const claim = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 30);

      // Recipient flags a dispute for damaged container / unsealed food
      demoStore.disputeClaim(claim.id, 'b0000000-0000-0000-0000-000000000001', 'Thermal seal broken during transit, food unsafe');

      const updatedRewards = demoStore.getDonorRewards(donorId);
      expect(updatedRewards.points_balance).toBe(initialPoints);
    });

    it('prevents duplicate awards on repeat delivery confirmations', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';

      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Gulab Jamuns & Halwa',
        description: 'Festive sweets batch',
        category: 'bakery',
        quantity_total: 50,
        quantity_unit: 'portions',
        city: 'Delhi NCR',
        location_label: 'Kitchen C',
        pickup_instructions: 'Front Desk',
        pickup_deadline: new Date(Date.now() + 5 * 3600000).toISOString(),
      });

      const claim = demoStore.claimDonation(donation.id, 'b0000000-0000-0000-0000-000000000001', 30);

      // First delivery confirmation: succeeds
      demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 30);
      const balanceAfterFirst = demoStore.getDonorRewards(donorId).points_balance;

      // Second delivery confirmation (retry): throws duplicate error and does not credit points again
      expect(() => {
        demoStore.confirmDelivery(claim.id, 'b0000000-0000-0000-0000-000000000001', 30);
      }).toThrow(/already delivered|duplicate/i);

      const balanceAfterSecond = demoStore.getDonorRewards(donorId).points_balance;
      expect(balanceAfterSecond).toBe(balanceAfterFirst);

      // Verify exactly one ledger record exists for this claim
      const records = demoStore.getDonorRewards(donorId).history.filter((r) => r.claim_id === claim.id);
      expect(records.length).toBe(1);
    });

    it('enforces cross-donor isolation and rejects viewing another donor’s rewards', () => {
      const donor1Id = 'a0000000-0000-0000-0000-000000000001';
      const donor2Id = 'd0000000-0000-0000-0000-000000000002';
      const adminId = 'd0000000-0000-0000-0000-000000000001';

      // Donor 1 viewing own rewards: succeeds
      expect(() => {
        demoStore.getDonorRewards(donor1Id, donor1Id, 'donor');
      }).not.toThrow();

      // Donor 1 attempting to view Donor 2's rewards: throws Unauthorized
      expect(() => {
        demoStore.getDonorRewards(donor2Id, donor1Id, 'donor');
      }).toThrow(/unauthorized/i);

      // Admin viewing Donor 2's rewards: succeeds
      const adminView = demoStore.getDonorRewards(donor2Id, adminId, 'admin');
      expect(adminView).toBeDefined();
      expect(adminView.points_balance).toBeGreaterThanOrEqual(0);
    });

    it('keeps donor rewards strictly separate from volunteer rewards', () => {
      const donorId = 'a0000000-0000-0000-0000-000000000001';
      const volunteerId = 'c0000000-0000-0000-0000-000000000001';

      const donorRewards = demoStore.getDonorRewards(donorId);
      const volunteerRewards = demoStore.getVolunteerRewards(volunteerId);

      // Different schemas and rules
      expect(donorRewards).toHaveProperty('points_balance');
      expect(volunteerRewards).toHaveProperty('points_released');
      expect(volunteerRewards).toHaveProperty('points_pending');

      // Donor history contains donor_id; volunteer history contains volunteer_id
      expect(donorRewards.history.every((r) => r.donor_id === donorId)).toBe(true);
      expect(volunteerRewards.history.every((r) => r.volunteer_id === volunteerId)).toBe(true);
    });
  });

  describe('Two-Party Pickup and Delivery OTP Verification Across Portals', () => {
    const donorId = 'a0000000-0000-0000-0000-000000000001';
    const recipientId = 'b0000000-0000-0000-0000-000000000001';
    const volunteerId = 'c0000000-0000-0000-0000-000000000001';
    const otherDonorId = 'd0000000-0000-0000-0000-000000000002';
    const otherRecipientId = 'b0000000-0000-0000-0000-000000000002';

    it('Volunteer initiates pickup: generates 4-digit code, sets 15-minute expiry, and resets attempts', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Fresh Paneer Tikka Wraps',
        description: 'Hot wraps ready for pickup',
        category: 'cooked_meals',
        quantity_total: 25,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Connaught Place',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 25);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);

      const initiated = demoStore.initiatePickup(claim.id, volunteerId);
      expect(initiated.verification_status).toBe('pickup_pending');
      expect(initiated.pickup_code).toMatch(/^\d{4}$/);
      expect(initiated.pickup_expires_at).toBeDefined();
      expect(initiated.pickup_attempts).toBe(0);
    });

    it('Volunteer cannot self-confirm pickup on behalf of donor kitchen', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Biryani Pots',
        description: 'Steaming veg biryani',
        category: 'cooked_meals',
        quantity_total: 30,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Khan Market',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 30);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);

      expect(() => {
        demoStore.confirmPickup(claim.id, volunteerId, claim.pickup_code);
      }).toThrow(/unauthorized.*volunteer cannot confirm pickup/i);
    });

    it('Wrong donor is rejected from confirming pickup for another donor’s listing', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Dal Makhani & Roti',
        description: 'Fresh dinner batch',
        category: 'cooked_meals',
        quantity_total: 20,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Lajpat Nagar',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 20);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);

      expect(() => {
        demoStore.confirmPickup(claim.id, otherDonorId, claim.pickup_code);
      }).toThrow(/unauthorized.*only the listing donor/i);
    });

    it('Incorrect pickup code increments attempts and reports remaining tries', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Idli Sambar Batch',
        description: 'South Indian breakfast meal',
        category: 'cooked_meals',
        quantity_total: 15,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Karol Bagh',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 15);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);

      // Attempt 1 with wrong code '0000'
      expect(() => {
        demoStore.confirmPickup(claim.id, donorId, '0000');
      }).toThrow(/invalid pickup verification code.*2 attempt\(s\) remaining/i);

      expect(claim.pickup_attempts).toBe(1);

      // Attempt 2 with wrong code '1111'
      expect(() => {
        demoStore.confirmPickup(claim.id, donorId, '1111');
      }).toThrow(/invalid pickup verification code.*1 attempt\(s\) remaining/i);

      expect(claim.pickup_attempts).toBe(2);
    });

    it('Exceeding 3 pickup code attempts locks out verification until re-initiated', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Veg Pulao',
        description: 'Hot spiced pulao',
        category: 'cooked_meals',
        quantity_total: 18,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Rajouri Garden',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 18);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);

      // 3 wrong attempts
      try { demoStore.confirmPickup(claim.id, donorId, '0001'); } catch {}
      try { demoStore.confirmPickup(claim.id, donorId, '0002'); } catch {}
      expect(() => {
        demoStore.confirmPickup(claim.id, donorId, '0003');
      }).toThrow(/maximum pickup verification attempts exceeded/i);

      // Even correct code is locked out now
      expect(() => {
        demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      }).toThrow(/maximum pickup verification attempts exceeded/i);

      // Re-initiating resets attempts
      demoStore.initiatePickup(claim.id, volunteerId);
      expect(claim.pickup_attempts).toBe(0);

      // Now correct code succeeds
      const confirmed = demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      expect(confirmed.status).toBe('collected');
      expect(confirmed.verification_status).toBe('in_transit');
    });

    it('Expired pickup code is rejected with expiration error', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Samosa Platter',
        description: 'Crispy potato samosas',
        category: 'cooked_meals',
        quantity_total: 40,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Chandni Chowk',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 40);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);

      // Simulate code expiration in the past
      claim.pickup_expires_at = new Date(Date.now() - 60000).toISOString();

      expect(() => {
        demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      }).toThrow(/pickup verification code has expired/i);
    });

    it('Correct pickup code confirms handover and advances status to in_transit', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Chole Bhature Combo',
        description: 'Lunch boxes',
        category: 'cooked_meals',
        quantity_total: 20,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'South Ex',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 20);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);

      const pickedUp = demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      expect(pickedUp.status).toBe('collected');
      expect(pickedUp.verification_status).toBe('in_transit');
      expect(pickedUp.pickup_confirmed_by).toBeDefined();
      expect(pickedUp.pickup_confirmed_at).toBeDefined();
    });

    it('Volunteer initiates delivery: generates 4-digit code, sets 15-minute expiry, and resets attempts', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Vegetable Khichdi',
        description: 'Nutritious warm meal',
        category: 'cooked_meals',
        quantity_total: 35,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Dwarka',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 35);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);
      demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);

      const initiated = demoStore.initiateDelivery(claim.id, volunteerId);
      expect(initiated.verification_status).toBe('delivery_pending');
      expect(initiated.delivery_code).toMatch(/^\d{4}$/);
      expect(initiated.delivery_expires_at).toBeDefined();
      expect(initiated.delivery_attempts).toBe(0);
    });

    it('Volunteer cannot self-confirm delivery on behalf of recipient NGO', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Poori Bhaji Feast',
        description: 'Temple surplus',
        category: 'cooked_meals',
        quantity_total: 50,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Mayur Vihar',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 50);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);
      demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      demoStore.initiateDelivery(claim.id, volunteerId);

      expect(() => {
        demoStore.confirmDelivery(claim.id, volunteerId, 50, claim.delivery_code);
      }).toThrow(/unauthorized.*volunteer cannot confirm delivery/i);
    });

    it('Wrong recipient is rejected from confirming delivery for another recipient’s claim', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Mixed Sandwiches',
        description: 'Catering leftovers',
        category: 'bakery',
        quantity_total: 24,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Rohini',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 24);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);
      demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      demoStore.initiateDelivery(claim.id, volunteerId);

      expect(() => {
        demoStore.confirmDelivery(claim.id, otherRecipientId, 24, claim.delivery_code);
      }).toThrow(/unauthorized.*only the claiming recipient/i);
    });

    it('Incorrect delivery code increments attempts and reports remaining tries', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Sweet Halwa',
        description: 'Warm semolina pudding',
        category: 'bakery',
        quantity_total: 20,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Noida Sec 18',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 20);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);
      demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      demoStore.initiateDelivery(claim.id, volunteerId);

      expect(() => {
        demoStore.confirmDelivery(claim.id, recipientId, 20, '9999');
      }).toThrow(/invalid delivery verification code.*2 attempt\(s\) remaining/i);

      expect(claim.delivery_attempts).toBe(1);
    });

    it('Correct delivery code by recipient confirms receipt and atomically awards volunteer and donor rewards', () => {
      const donation = demoStore.createDonation({
        donor_id: donorId,
        title: 'Rajma Chawal Trays',
        description: 'Comfort meal for shelter',
        category: 'cooked_meals',
        quantity_total: 30,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        location_label: 'Pitampura',
        city: 'Delhi NCR',
      });

      const claim = demoStore.claimDonation(donation.id, recipientId, 30);
      demoStore.assignVolunteerToClaim(claim.id, volunteerId);
      demoStore.initiatePickup(claim.id, volunteerId);
      demoStore.confirmPickup(claim.id, donorId, claim.pickup_code);
      demoStore.initiateDelivery(claim.id, volunteerId);

      const donorBalanceBefore = demoStore.getDonorRewards(donorId).points_balance;
      const volunteerRewardsBefore = demoStore.getVolunteerRewards(volunteerId).points_released;

      const result = demoStore.confirmDelivery(claim.id, recipientId, 30, claim.delivery_code);
      expect(result.claim.status).toBe('delivered');
      expect(result.claim.verification_status).toBe('verified');
      expect(result.pointsAwarded).toBe(110); // 50 base + 30*2

      const donorBalanceAfter = demoStore.getDonorRewards(donorId).points_balance;
      const volunteerRewardsAfter = demoStore.getVolunteerRewards(volunteerId).points_released;

      expect(donorBalanceAfter).toBe(donorBalanceBefore + 90); // 30 base + 30*2
      expect(volunteerRewardsAfter).toBe(volunteerRewardsBefore + 110);
    });

    it('Generates one Google Maps link with waypoints for trips with <= 9 stops ending at destination', () => {
      const origin = 'Rohini Sector 14, Delhi';
      const destination = 'Connaught Place, New Delhi';
      const stops: RouteStopInput[] = [
        { name: 'DTU Canteen', address: 'Bawana Road, Rohini, Delhi', type: 'pickup' },
        { name: 'Prerna Shelter', address: 'Pitampura, Delhi', type: 'delivery' },
      ];

      const segments = generateGoogleMapsTripSegments(origin, destination, stops);
      expect(segments).toHaveLength(1);
      expect(segments[0].segmentNumber).toBe(1);
      expect(segments[0].totalSegments).toBe(1);
      expect(segments[0].origin).toBe(origin);
      expect(segments[0].destination).toBe(destination);
      expect(segments[0].waypoints).toEqual(['Bawana Road, Rohini, Delhi', 'Pitampura, Delhi']);
      expect(segments[0].url).toContain(encodeURIComponent(origin));
      expect(segments[0].url).toContain(encodeURIComponent(destination));
      expect(segments[0].url).toContain(encodeURIComponent('Bawana Road, Rohini, Delhi|Pitampura, Delhi'));
    });

    it('Splits trips with > 9 stops into ordered route segments respecting Google Maps waypoint limits', () => {
      const origin = 'Rohini Sector 14, Delhi';
      const destination = 'Noida Sector 62, UP';
      const stops: RouteStopInput[] = Array.from({ length: 14 }, (_, i) => ({
        name: `Stop #${i + 1}`,
        address: `Delhi Stop Address ${i + 1}`,
        type: i % 2 === 0 ? 'pickup' : 'delivery',
      }));

      const segments = generateGoogleMapsTripSegments(origin, destination, stops);
      expect(segments.length).toBe(2);
      expect(segments[0].segmentNumber).toBe(1);
      expect(segments[0].totalSegments).toBe(2);
      expect(segments[0].waypoints.length).toBeLessThanOrEqual(9);
      expect(segments[1].segmentNumber).toBe(2);
      expect(segments[1].totalSegments).toBe(2);
      // Final segment must end at the volunteer's selected destination
      expect(segments[1].destination).toBe(destination);
      expect(segments[1].url).toContain(encodeURIComponent(destination));
    });
  });

  describe('Dynamic Donor Listing to Volunteer Corridor Task Synchronization', () => {
    it('automatically generates a volunteer rescue task when a donor registers surplus food in Mumbai', () => {
      const created = demoStore.createDonation({
        donor_id: 'a0000000-0000-0000-0000-000000000001',
        title: 'Puri Bhaji',
        description: 'non jain',
        category: 'cooked_meals',
        quantity_total: 30,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        city: 'Mumbai',
        location_label: 'Andheir east station',
        dietary_type: 'veg',
      });

      expect(created).toBeDefined();
      expect(created.title).toBe('Puri Bhaji');

      // Check that the task is immediately available in the volunteer planner
      const mumbaiTasks = demoStore.getRescueTasks('Mumbai Central Transit Corridor');
      const puriBhajiTask = mumbaiTasks.find((t) => t.donation_id === created.id);

      expect(puriBhajiTask).toBeDefined();
      expect(puriBhajiTask?.title).toBe('Puri Bhaji');
      expect(puriBhajiTask?.portions).toBe(30);
      expect(puriBhajiTask?.pickup_location).toContain('Andheir east station');
      expect(puriBhajiTask?.corridor).toBe('Mumbai Central Transit Corridor');
      expect(puriBhajiTask?.dropoff_location).toBe('Snehalaya Community Kitchen (Kurla West)');
      expect(puriBhajiTask?.status).toBe('available');
    });

    it('matches corridor flexibly even when volunteer queries with regional presets or keywords', () => {
      const created = demoStore.createDonation({
        donor_id: 'a0000000-0000-0000-0000-000000000001',
        title: 'Pav Bhaji & Masala Pao',
        description: 'Fresh dinner surplus',
        category: 'cooked_meals',
        quantity_total: 25,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        city: 'Mumbai',
        location_label: 'BKC Ground, Bandra East',
        dietary_type: 'veg',
      });

      const tasksByPreset = demoStore.getRescueTasks('Mumbai: BKC → Kurla → Ghatkopar');
      const found = tasksByPreset.find((t) => t.donation_id === created.id);
      expect(found).toBeDefined();

      const allTasks = demoStore.getRescueTasks('all');
      expect(allTasks.some((t) => t.donation_id === created.id)).toBe(true);
    });

    it('allows volunteer to accept a planned route for a dynamic donor donation', () => {
      const created = demoStore.createDonation({
        donor_id: 'a0000000-0000-0000-0000-000000000001',
        title: 'Puri Bhaji Express',
        description: '30 portions ready for immediate rescue',
        category: 'cooked_meals',
        quantity_total: 30,
        quantity_unit: 'portions',
        pickup_deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        city: 'Mumbai',
        location_label: 'Andheri east station',
        dietary_type: 'veg',
      });

      const tasks = demoStore.getRescueTasks('Mumbai Central Transit Corridor');
      const task = tasks.find((t) => t.donation_id === created.id)!;
      expect(task).toBeDefined();

      const plan = demoStore.createTripPlan({
        volunteer_id: 'c0000000-0000-0000-0000-000000000001',
        origin: 'BKC Commercial Hub',
        destination: 'Ghatkopar East Terminus',
        corridor_label: 'Mumbai Central Transit Corridor',
        task_ids: [task.id],
        is_demo_preview: true,
        stops: [
          {
            id: 'stop-start',
            type: 'start',
            name: 'BKC Origin',
            address: 'BKC Commercial Hub',
            city: 'Mumbai',
            sequence: 1,
            completed: true,
          },
          {
            id: 'stop-pickup',
            type: 'pickup',
            name: task.pickup_location,
            address: task.pickup_address,
            city: 'Mumbai',
            task_id: task.id,
            portions: task.portions,
            food_title: task.title,
            sequence: 2,
            completed: false,
          },
          {
            id: 'stop-delivery',
            type: 'delivery',
            name: task.dropoff_location,
            address: task.dropoff_address,
            city: 'Mumbai',
            task_id: task.id,
            portions: task.portions,
            food_title: task.title,
            sequence: 3,
            completed: false,
          },
          {
            id: 'stop-dest',
            type: 'destination',
            name: 'Ghatkopar Arrival',
            address: 'Ghatkopar East Terminus',
            city: 'Mumbai',
            sequence: 4,
            completed: false,
          },
        ],
      });

      const accepted = demoStore.acceptTripPlan(plan.id);
      expect(accepted.status).toBe('accepted');

      // The task must be marked claimed
      const updatedTask = demoStore.getRescueTasks().find((t) => t.id === task.id);
      expect(updatedTask?.status).toBe('claimed');

      // A corresponding claim must be created for the donation
      const claims = demoStore.getAllClaims();
      const linkedClaim = claims.find((c) => c.donation_id === created.id);
      expect(linkedClaim).toBeDefined();
      expect(linkedClaim?.volunteer_id).toBe('c0000000-0000-0000-0000-000000000001');
      expect(linkedClaim?.quantity_claimed).toBe(30);
    });
  });

  describe('Restaurant Complaint & Admin Moderation Flagging Flow', () => {
    it('files a complaint against a restaurant, flags the claim to admin, and populates reports queue', () => {
      const claim = demoStore.claimDonation(
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        10
      );

      const reporter = {
        id: 'b0000000-0000-0000-0000-000000000001',
        full_name: 'Rajesh Kumar (Robin Hood Army)',
        role: 'recipient',
        phone: '+91 98110 99887',
      };

      const complaintData = {
        reason: 'Food Quality & Spoilage (Smell, stale)',
        description: 'Food arrived smelling sour and stale, unsuitable for community consumption.',
        category: 'Food Quality & Freshness',
      };

      const result = demoStore.fileClaimComplaint(claim.id, reporter, complaintData);

      expect(result.claim.is_flagged_to_admin).toBe(true);
      expect(result.claim.complaint).toBeDefined();
      expect(result.claim.complaint?.restaurant_name).toContain('DTU');
      expect(result.claim.complaint?.status).toBe('open');
      expect(result.claim.complaint?.description).toBe(complaintData.description);

      // Verify report was pushed to reports queue
      const reports = demoStore.getReports();
      const filedReport = reports.find((r) => r.claim_id === claim.id);
      expect(filedReport).toBeDefined();
      expect(filedReport?.restaurant_name).toContain('DTU');
      expect(filedReport?.status).toBe('open');
      expect(filedReport?.reporter_name).toBe(reporter.full_name);

      // Verify activity logs contain the flagged complaint
      const logs = demoStore.getActivityLogs();
      const log = logs.find((l) => l.action === 'admin_complaint_flagged');
      expect(log).toBeDefined();
      expect(log?.details.claim_id).toBe(claim.id);
    });

    it('admin investigates, resolves, or issues warning against reported restaurant', () => {
      const claim = demoStore.claimDonation(
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        5
      );

      const reporter = {
        id: 'b0000000-0000-0000-0000-000000000001',
        full_name: 'Rajesh Kumar',
        role: 'recipient',
      };

      const { report } = demoStore.fileClaimComplaint(claim.id, reporter, {
        reason: 'Handover Refusal / Kitchen Closed',
        description: 'Kitchen door was locked 30 mins before stated pickup deadline.',
      });

      // 1. Admin sets investigating
      demoStore.resolveReport(report.id, 'investigating', 'Safety officer reviewing CCTV & call logs');
      let updatedRep = demoStore.getReports().find((r) => r.id === report.id);
      expect(updatedRep?.status).toBe('investigating');
      expect(updatedRep?.admin_notes).toContain('Safety officer');

      let updatedClaim = demoStore.getAllClaims().find((c) => c.id === claim.id);
      expect(updatedClaim?.complaint?.status).toBe('investigating');
      expect(updatedClaim?.complaint?.admin_notes).toContain('Safety officer');

      // 2. Admin issues official warning to restaurant
      demoStore.issueRestaurantWarning(report.restaurant_name, 'Early kitchen closure warning', 'Platform Safety Lead');
      const logs = demoStore.getActivityLogs();
      const warningLog = logs.find((l) => l.action === 'restaurant_warning_issued');
      expect(warningLog).toBeDefined();
      expect(warningLog?.details.restaurant_name).toBe(report.restaurant_name);

      // 3. Admin resolves grievance
      demoStore.resolveReport(report.id, 'resolved', 'Restaurant apologized and committed to full pickup window');
      updatedRep = demoStore.getReports().find((r) => r.id === report.id);
      expect(updatedRep?.status).toBe('resolved');

      updatedClaim = demoStore.getAllClaims().find((c) => c.id === claim.id);
      expect(updatedClaim?.complaint?.status).toBe('resolved');
    });
  });
});
