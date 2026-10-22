import { Router, Request, Response } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { isSupabaseConfigured } from '../config/env.js';

const router = Router();

/**
 * GET /api/impact/summary
 * Computes live, defensible impact metrics from actual database records.
 * Distinguishes listed, reserved, and actually delivered portions.
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      // Demo fallback calculation based on sample dataset
      res.status(200).json({
        success: true,
        source: 'demo_estimate',
        metrics: {
          donationsListed: 6,
          portionsListed: 290,
          portionsReserved: 40,
          portionsDelivered: 90,
          completedRescues: 2,
          activeDonors: 4,
          participatingRecipients: 3,
          activeClaims: 1,
          completionRatePercent: 100, // 2 completed out of 2 finalized non-cancelled claims
          // Defensible Environmental Model:
          // UNEP/FAO benchmark: ~2.5 kg CO2e per 1 kg food; average portion ~0.4 kg
          // 90 delivered portions * 0.4 kg = 36 kg food rescued
          // 36 kg * 2.5 kg CO2e = ~90 kg CO2e avoided
          estimatedFoodRescuedKg: 36,
          estimatedCo2eSavedKg: 90,
          methodologyNote: 'Estimates based on FAO average meal portion (400g) and UNEP food waste emission factor (2.5 kg CO2e/kg food). Only delivered portions are counted.',
        },
      });
      return;
    }

    const supabase = getSupabaseAdmin();

    // 1. Total donations listed
    const { count: donationsCount } = await supabase
      .from('donations')
      .select('id', { count: 'exact', head: true });

    // 2. Donations data for portion aggregation
    const { data: donations } = await supabase
      .from('donations')
      .select('quantity_total, quantity_available, status');

    const portionsListed = (donations || []).reduce((acc, d) => acc + (d.quantity_total || 0), 0);

    // 3. Claims aggregations
    const { data: claims } = await supabase
      .from('claims')
      .select('quantity_claimed, status');

    const portionsDelivered = (claims || [])
      .filter((c) => c.status === 'delivered')
      .reduce((acc, c) => acc + (c.quantity_claimed || 0), 0);

    const portionsReserved = (claims || [])
      .filter((c) => c.status === 'claimed' || c.status === 'collected')
      .reduce((acc, c) => acc + (c.quantity_claimed || 0), 0);

    const completedRescues = (claims || []).filter((c) => c.status === 'delivered').length;
    const activeClaims = (claims || []).filter((c) => c.status === 'claimed' || c.status === 'collected').length;

    // 4. Unique Donors and Recipients
    const { data: profiles } = await supabase
      .from('profiles')
      .select('role');

    const activeDonors = (profiles || []).filter((p) => p.role === 'donor').length;
    const participatingRecipients = (profiles || []).filter((p) => p.role === 'recipient').length;

    // 5. Completion rate: delivered / (delivered + cancelled)
    const finalizedClaims = (claims || []).filter((c) => c.status === 'delivered' || c.status === 'cancelled').length;
    const completionRatePercent = finalizedClaims > 0
      ? Math.round((completedRescues / finalizedClaims) * 100)
      : 100;

    // Environmental calculations (FAO/UNEP standard: 0.4 kg per portion, 2.5 kg CO2e per kg food)
    const estimatedFoodRescuedKg = Math.round(portionsDelivered * 0.4);
    const estimatedCo2eSavedKg = Math.round(estimatedFoodRescuedKg * 2.5);

    res.status(200).json({
      success: true,
      source: 'database_aggregation',
      metrics: {
        donationsListed: donationsCount || 0,
        portionsListed,
        portionsReserved,
        portionsDelivered,
        completedRescues,
        activeDonors,
        participatingRecipients,
        activeClaims,
        completionRatePercent,
        estimatedFoodRescuedKg,
        estimatedCo2eSavedKg,
        methodologyNote: 'Estimates based on FAO average meal portion (400g) and UNEP food waste emission factor (2.5 kg CO2e/kg food). Only delivered portions are counted.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error calculating impact metrics' });
  }
});

/**
 * GET /api/impact/activity
 * Returns recent public safe activity feed.
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured()) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching activity' });
  }
});

export default router;
