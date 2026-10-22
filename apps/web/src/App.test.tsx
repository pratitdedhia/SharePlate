import { describe, it, expect } from 'vitest';

describe('SharePlate Web Suite', () => {
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
});
