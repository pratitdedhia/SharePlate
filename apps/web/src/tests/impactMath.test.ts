import { describe, it, expect } from 'vitest';
import { calculateImpactMetrics } from '../lib/impactMath';
import { Donation, Claim } from '../types';

describe('calculateImpactMetrics Single Source of Truth', () => {
  const mockDonations: Donation[] = [
    {
      id: 'd1',
      donor_id: 'donor1',
      title: 'Batch 1',
      description: 'Test 1',
      category: 'cooked_meals',
      quantity_total: 100,
      quantity_available: 20,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() + 3600000).toISOString(),
      city: 'Delhi NCR',
      location_label: 'North Delhi',
      status: 'available',
      created_at: new Date().toISOString(),
    },
    {
      id: 'd2',
      donor_id: 'donor2',
      title: 'Batch 2',
      description: 'Test 2',
      category: 'bakery',
      quantity_total: 50,
      quantity_available: 0,
      quantity_unit: 'portions',
      pickup_deadline: new Date(Date.now() + 7200000).toISOString(),
      city: 'Delhi NCR',
      location_label: 'South Delhi',
      status: 'reserved',
      created_at: new Date().toISOString(),
    },
  ];

  const mockClaims: Claim[] = [
    {
      id: 'c1',
      donation_id: 'd1',
      recipient_id: 'rec1',
      quantity_claimed: 50,
      status: 'delivered',
      claimed_at: new Date().toISOString(),
    },
    {
      id: 'c2',
      donation_id: 'd1',
      recipient_id: 'rec2',
      quantity_claimed: 30,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    },
    {
      id: 'c3',
      donation_id: 'd2',
      recipient_id: 'rec3',
      quantity_claimed: 50,
      status: 'collected',
      claimed_at: new Date().toISOString(),
    },
  ];

  it('calculates portion breakdown accurately and consistently', () => {
    const metrics = calculateImpactMetrics(mockDonations, mockClaims);

    // Total listed = 100 + 50 = 150
    expect(metrics.portionsListed).toBe(150);

    // Delivered = 50
    expect(metrics.portionsDelivered).toBe(50);

    // Reserved (claimed or collected) = 30 + 50 = 80
    expect(metrics.portionsReserved).toBe(80);

    // Available = 150 - 50 - 80 = 20
    expect(metrics.portionsAvailable).toBe(20);

    // Funnel conservation: delivered + reserved + available === listed
    expect(metrics.portionsDelivered + metrics.portionsReserved + metrics.portionsAvailable).toBe(
      metrics.portionsListed
    );
  });

  it('calculates rescue rate correctly and never exceeds 100%', () => {
    const metrics = calculateImpactMetrics(mockDonations, mockClaims);
    // 50 delivered / 150 listed = 33.333% -> rounded 33%
    expect(metrics.rescueRatePercent).toBe(33);
    expect(metrics.completionRatePercent).toBe(33);
  });

  it('handles empty data gracefully without NaN', () => {
    const emptyMetrics = calculateImpactMetrics([], []);
    expect(emptyMetrics.portionsListed).toBe(0);
    expect(emptyMetrics.portionsDelivered).toBe(0);
    expect(emptyMetrics.portionsReserved).toBe(0);
    expect(emptyMetrics.portionsAvailable).toBe(0);
    expect(emptyMetrics.rescueRatePercent).toBe(0);
    expect(emptyMetrics.completionRatePercent).toBe(0);
    expect(emptyMetrics.estimatedFoodRescuedKg).toBe(0);
    expect(emptyMetrics.estimatedCo2eSavedKg).toBe(0);
  });

  it('computes defensible carbon avoidance using UNEP factors', () => {
    const metrics = calculateImpactMetrics(mockDonations, mockClaims);
    // 50 delivered * 0.4 kg = 20 kg rescued
    // 20 kg * 2.5 kg CO2e = 50 kg CO2e saved
    expect(metrics.estimatedFoodRescuedKg).toBe(20);
    expect(metrics.estimatedCo2eSavedKg).toBe(50);
  });
});
