import { describe, it, expect, beforeEach } from 'vitest';
import { demoStore, INITIAL_DEMO_DONATIONS } from '../lib/mockData';

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
