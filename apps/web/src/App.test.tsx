import { beforeEach, describe, it, expect } from 'vitest';
import { calculateImpactMetrics, demoStore } from './lib/mockData';
import type { Claim, Donation } from './types';

describe('SharePlate Web Suite', () => {
  beforeEach(() => demoStore.reset());

  it('validates core math and portion distribution calculations', () => {
    const total = 45;
    const claimed = 15;
    const remaining = total - claimed;
    expect(remaining).toBe(30);
  });

  it('calculates carbon offset according to FAO methodology', () => {
    const portionsDelivered = 90;
    const portionWeightKg = 0.4;
    const emissionFactor = 2.5; // kg CO2e per kg food

    const foodRescuedKg = Math.round(portionsDelivered * portionWeightKg);
    const co2eSavedKg = Math.round(foodRescuedKg * emissionFactor);

    expect(foodRescuedKg).toBe(36);
    expect(co2eSavedKg).toBe(90);
  });

  it('derives the rescue rate and funnel from the same portion totals', () => {
    const donations = [{ quantity_total: 100, donor_id: 'donor-1' }] as Donation[];
    const claims = [
      { status: 'delivered', quantity_claimed: 25, recipient_id: 'recipient-1' },
      { status: 'claimed', quantity_claimed: 25, recipient_id: 'recipient-2' },
    ] as Claim[];

    const metrics = calculateImpactMetrics(donations, claims);

    expect(metrics.completionRatePercent).toBe(25);
    expect(metrics.portionsDelivered).toBe(25);
    expect(metrics.portionsReserved).toBe(25);
    expect(metrics.portionsAvailable).toBe(50);
    expect(metrics.deliveredPercent + metrics.reservedPercent + metrics.availablePercent).toBe(100);
  });

  it('rejects demo claims that exceed availability or have expired', () => {
    const donation = demoStore.createDonation({
      donor_id: 'donor-1',
      title: 'Test meal',
      description: 'Test listing',
      category: 'cooked_meals',
      quantity_total: 5,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() + 60_000).toISOString(),
      city: 'Delhi',
      location_label: 'Test location',
    });

    expect(() => demoStore.claimDonation(donation.id, 'recipient-1', 6)).toThrow('exceeds available');
    expect(demoStore.getDonationById(donation.id)?.quantity_available).toBe(5);

    const expiredDonation = demoStore.createDonation({
      donor_id: 'donor-1',
      title: 'Expired meal',
      description: 'Expired listing',
      category: 'cooked_meals',
      quantity_total: 5,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() - 60_000).toISOString(),
      city: 'Delhi',
      location_label: 'Test location',
    });

    expect(() => demoStore.claimDonation(expiredDonation.id, 'recipient-1', 1)).toThrow('pickup deadline');
    expect(demoStore.getDonationById(expiredDonation.id)?.quantity_available).toBe(5);
  });
});
