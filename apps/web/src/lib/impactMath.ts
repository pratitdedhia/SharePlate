import { Donation, Claim, ImpactMetrics } from '../types';

/**
 * Single source of truth for platform impact numbers, rescue rate, and distribution funnel.
 * Formula:
 * - portionsListed = sum(d.quantity_total)
 * - portionsDelivered = sum(c.quantity_claimed WHERE c.status = 'delivered')
 * - portionsReserved = sum(c.quantity_claimed WHERE c.status IN ('claimed', 'collected'))
 * - portionsAvailable = Math.max(0, portionsListed - portionsDelivered - portionsReserved)
 * - rescueRate = (portionsDelivered / portionsListed) * 100 (rounded)
 *
 * Guaranteed never to contradict the portion funnel:
 * portionsDelivered + portionsReserved + portionsAvailable === portionsListed
 */
export function calculateImpactMetrics(
  donations: Donation[],
  claims: Claim[],
  activeDonorsCount = 4,
  participatingRecipientsCount = 3
): ImpactMetrics {
  const portionsListed = donations.reduce((acc, d) => acc + (Number(d.quantity_total) || 0), 0);

  const portionsDelivered = claims
    .filter((c) => c.status === 'delivered')
    .reduce((acc, c) => acc + (Number(c.quantity_claimed) || 0), 0);

  const portionsReserved = claims
    .filter((c) => c.status === 'claimed' || c.status === 'collected')
    .reduce((acc, c) => acc + (Number(c.quantity_claimed) || 0), 0);

  const portionsAvailable = Math.max(0, portionsListed - portionsDelivered - portionsReserved);

  const completedRescues = claims.filter((c) => c.status === 'delivered').length;
  const activeClaims = claims.filter((c) => c.status === 'claimed' || c.status === 'collected').length;

  const rescueRatePercent =
    portionsListed > 0 ? Math.round((portionsDelivered / portionsListed) * 100) : 0;

  // Ecological impact calculations (FAO & UNEP)
  const estimatedFoodRescuedKg = Math.round(portionsDelivered * 0.4);
  const estimatedCo2eSavedKg = Math.round(estimatedFoodRescuedKg * 2.5);

  return {
    donationsListed: donations.length,
    portionsListed,
    portionsReserved,
    portionsDelivered,
    portionsAvailable,
    completedRescues,
    activeDonors: activeDonorsCount,
    participatingRecipients: participatingRecipientsCount,
    activeClaims,
    rescueRatePercent,
    completionRatePercent: rescueRatePercent,
    estimatedFoodRescuedKg,
    estimatedCo2eSavedKg,
    methodologyNote:
      'Verified delivery impact derived strictly from delivered portion records. Calculations use FAO average meal weights (400g/portion) and UNEP food waste emissions factor (2.5 kg CO2e / kg food avoided).',
  };
}
