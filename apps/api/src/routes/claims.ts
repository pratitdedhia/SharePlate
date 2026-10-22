import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { CreateClaimSchema, UpdateClaimStatusSchema, CancelClaimSchema } from '../validators/schemas.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * POST /api/donations/:id/claims
 * Atomically claim food portions using the concurrency-safe PostgreSQL RPC function.
 */
router.post(
  '/:id/claims',
  authenticateToken,
  requireRoles(['recipient', 'volunteer', 'admin']),
  validateBody(CreateClaimSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const donationId = req.params.id;
      const { quantity, notes } = req.body;
      const supabase = getSupabaseAdmin();

      // Call the atomic database RPC function to avoid concurrency race conditions
      const { data, error } = await supabase.rpc('claim_donation_atomic', {
        p_donation_id: donationId,
        p_recipient_id: user.id,
        p_quantity: quantity,
        p_notes: notes || null,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: `Successfully reserved ${quantity} portions!`,
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error processing reservation' });
    }
  }
);

/**
 * GET /api/claims/mine
 * Retrieves claims associated with the authenticated user (as recipient, volunteer, or donor).
 */
router.get('/mine', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('claims')
      .select(`
        id, donation_id, recipient_id, quantity_claimed, status,
        claimed_at, collected_at, delivered_at, cancelled_at, notes,
        donation:donations (
          id, title, category, quantity_total, quantity_unit,
          image_url, pickup_deadline, pickup_instructions, city, location_label, status,
          donor:profiles!donor_id (id, full_name, organization_name, phone, city)
        ),
        recipient:profiles!recipient_id (id, full_name, organization_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (user.role === 'donor') {
      // Donors see claims on their own donations
      query = query.eq('donation.donor_id', user.id);
    } else {
      // Recipients / volunteers see their claims
      query = query.eq('recipient_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching user claims' });
  }
});

/**
 * PATCH /api/claims/:id/cancel
 * Cancels an active claim and atomically restores reserved portions to the donation.
 */
router.patch(
  '/:id/cancel',
  authenticateToken,
  validateBody(CancelClaimSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const claimId = req.params.id;
      const { reason } = req.body;
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.rpc('cancel_claim_atomic', {
        p_claim_id: claimId,
        p_user_id: user.id,
        p_reason: reason || null,
      });

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Claim cancelled successfully and portions released.',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error cancelling claim' });
    }
  }
);

/**
 * POST /api/claims/:id/collect
 * Marks food as picked up / collected.
 */
router.post('/:id/collect', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const claimId = req.params.id;
    const { notes } = req.body || {};
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc('update_claim_status', {
      p_claim_id: claimId,
      p_new_status: 'collected',
      p_user_id: user.id,
      p_notes: notes || null,
    });

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Collection verified! Status updated to collected.',
      data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating collection status' });
  }
});

/**
 * POST /api/claims/:id/deliver
 * Confirms final delivery of rescued food to community beneficiaries.
 */
router.post('/:id/deliver', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const claimId = req.params.id;
    const { notes } = req.body || {};
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc('update_claim_status', {
      p_claim_id: claimId,
      p_new_status: 'delivered',
      p_user_id: user.id,
      p_notes: notes || null,
    });

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Rescue complete! Delivery confirmed and recorded in impact statistics.',
      data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating delivery status' });
  }
});

export default router;
