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
});
