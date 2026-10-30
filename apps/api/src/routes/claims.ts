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
 * Retrieves claims scoped to the authenticated user's role:
 * - Donors: only claims on their own donations, with related donation and recipient profile
 * - Volunteers: claims assigned to them
 * - Recipients: claims placed by them
 * - Admins: all claims
 */
router.get('/mine', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    let query: any = supabase.from('claims');

    if (user.role === 'donor') {
      // Donors see claims on their own donations. Uses !inner to filter the parent claims table.
      query = query
        .select(`
          id, donation_id, recipient_id, volunteer_id, quantity_claimed, status,
          verification_status, pickup_code, pickup_confirmed_at, pickup_confirmed_by,
          delivery_code, delivery_confirmed_at, delivery_confirmed_by,
          portions_delivered_confirmed, is_disputed, dispute_reason, points_awarded,
          claimed_at, collected_at, delivered_at, cancelled_at, notes,
          donation:donations!inner (
            id, donor_id, title, category, quantity_total, quantity_available, quantity_unit,
            image_url, pickup_deadline, pickup_instructions, city, location_label, status,
            donor:profiles!donor_id (id, full_name, organization_name, phone, city)
          ),
          recipient:profiles!recipient_id (id, full_name, organization_name, phone, city)
        `)
        .eq('donation.donor_id', user.id);
    } else if (user.role === 'volunteer') {
      // Volunteers see claims assigned to them
      query = query
        .select(`
          id, donation_id, recipient_id, volunteer_id, quantity_claimed, status,
          verification_status, pickup_code, pickup_confirmed_at, pickup_confirmed_by,
          delivery_code, delivery_confirmed_at, delivery_confirmed_by,
          portions_delivered_confirmed, is_disputed, dispute_reason, points_awarded,
          claimed_at, collected_at, delivered_at, cancelled_at, notes,
          donation:donations (
            id, donor_id, title, category, quantity_total, quantity_available, quantity_unit,
            image_url, pickup_deadline, pickup_instructions, city, location_label, status,
            donor:profiles!donor_id (id, full_name, organization_name, phone, city)
          ),
          recipient:profiles!recipient_id (id, full_name, organization_name, phone, city)
        `)
        .eq('volunteer_id', user.id);
    } else if (user.role === 'admin') {
      // Admins see all claims
      query = query.select(`
        id, donation_id, recipient_id, volunteer_id, quantity_claimed, status,
        verification_status, pickup_code, pickup_confirmed_at, pickup_confirmed_by,
        delivery_code, delivery_confirmed_at, delivery_confirmed_by,
        portions_delivered_confirmed, is_disputed, dispute_reason, points_awarded,
        claimed_at, collected_at, delivered_at, cancelled_at, notes,
        donation:donations (
          id, donor_id, title, category, quantity_total, quantity_available, quantity_unit,
          image_url, pickup_deadline, pickup_instructions, city, location_label, status,
          donor:profiles!donor_id (id, full_name, organization_name, phone, city)
        ),
        recipient:profiles!recipient_id (id, full_name, organization_name, phone, city)
      `);
    } else {
      // Recipients see claims they placed
      query = query
        .select(`
          id, donation_id, recipient_id, volunteer_id, quantity_claimed, status,
          verification_status, pickup_code, pickup_confirmed_at, pickup_confirmed_by,
          delivery_code, delivery_confirmed_at, delivery_confirmed_by,
          portions_delivered_confirmed, is_disputed, dispute_reason, points_awarded,
          claimed_at, collected_at, delivered_at, cancelled_at, notes,
          donation:donations (
            id, donor_id, title, category, quantity_total, quantity_available, quantity_unit,
            image_url, pickup_deadline, pickup_instructions, city, location_label, status,
            donor:profiles!donor_id (id, full_name, organization_name, phone, city)
          ),
          recipient:profiles!recipient_id (id, full_name, organization_name, phone, city)
        `)
        .eq('recipient_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
 * GET /api/claims
 * Authorized claims listing endpoint.
 * - Admin: all claims
 * - Volunteer: claims assigned to them OR available for volunteer transport
 * - Donor: claims on their donations
 * - Recipient: claims by recipient
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();
    const { status, donation_id } = req.query;

    let query: any = supabase.from('claims');

    if (user.role === 'admin') {
      query = query.select(`
        *,
        donation:donations (id, donor_id, title, category, quantity_total, quantity_available, quantity_unit, image_url, pickup_deadline, city, location_label, status, donor:profiles!donor_id (id, full_name, organization_name, phone)),
        recipient:profiles!recipient_id (id, full_name, organization_name, phone)
      `);
    } else if (user.role === 'volunteer') {
      // Volunteers can view claims assigned to them OR claimed/collected needing delivery
      query = query.select(`
        *,
        donation:donations (id, donor_id, title, category, quantity_total, quantity_available, quantity_unit, image_url, pickup_deadline, city, location_label, status, donor:profiles!donor_id (id, full_name, organization_name, phone)),
        recipient:profiles!recipient_id (id, full_name, organization_name, phone)
      `);
      query = query.or(`volunteer_id.eq.${user.id},and(status.in.(claimed,collected),volunteer_id.is.null)`);
    } else if (user.role === 'donor') {
      query = query
        .select(`
          *,
          donation:donations!inner (id, donor_id, title, category, quantity_total, quantity_available, quantity_unit, image_url, pickup_deadline, city, location_label, status, donor:profiles!donor_id (id, full_name, organization_name, phone)),
          recipient:profiles!recipient_id (id, full_name, organization_name, phone)
        `)
        .eq('donation.donor_id', user.id);
    } else {
      query = query
        .select(`
          *,
          donation:donations (id, donor_id, title, category, quantity_total, quantity_available, quantity_unit, image_url, pickup_deadline, city, location_label, status, donor:profiles!donor_id (id, full_name, organization_name, phone)),
          recipient:profiles!recipient_id (id, full_name, organization_name, phone)
        `)
        .eq('recipient_id', user.id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }
    if (donation_id) {
      query = query.eq('donation_id', donation_id as string);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error listing claims' });
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


/**
 * POST /api/claims/:id/assign-volunteer
 * Assigns a volunteer to transport an accepted claim.
 */
router.post(
  '/:id/assign-volunteer',
  authenticateToken,
  requireRoles(['volunteer', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const claimId = req.params.id;
      // Enforce authenticated identity: volunteers can only assign themselves; only admins can assign another volunteer
      const volunteerId = (user.role === 'admin' && req.body.volunteer_id) ? req.body.volunteer_id : user.id;
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.rpc('assign_claim_volunteer', {
        p_claim_id: claimId,
        p_volunteer_id: volunteerId,
      });

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Volunteer assigned successfully to claim route.',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error assigning volunteer' });
    }
  }
);

/**
 * POST /api/claims/:id/pickup-initiate
 * Volunteer records arrival at donor loading dock.
 */
router.post(
  '/:id/pickup-initiate',
  authenticateToken,
  requireRoles(['volunteer', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const claimId = req.params.id;
      const supabase = getSupabaseAdmin();

      const { data: claim, error: fetchErr } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      if (fetchErr || !claim) {
        res.status(404).json({ success: false, message: 'Claim not found' });
        return;
      }

      if (claim.volunteer_id && claim.volunteer_id !== user.id && user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized: Claim is assigned to another volunteer' });
        return;
      }

      if (claim.is_disputed) {
        res.status(400).json({ success: false, message: 'Cannot initiate pickup on a disputed claim' });
        return;
      }

      const pickupCode = claim.pickup_code || Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('claims')
        .update({
          volunteer_id: user.role === 'volunteer' ? user.id : (claim.volunteer_id || user.id),
          verification_status: 'pickup_pending',
          pickup_code: pickupCode,
          pickup_expires_at: expiresAt,
          pickup_attempts: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Pickup arrival recorded. Awaiting donor handover confirmation.',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error initiating pickup' });
    }
  }
);

/**
 * POST /api/claims/:id/delivery-initiate
 * Volunteer records arrival at recipient NGO delivery destination.
 */
router.post(
  '/:id/delivery-initiate',
  authenticateToken,
  requireRoles(['volunteer', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const claimId = req.params.id;
      const supabase = getSupabaseAdmin();

      const { data: claim, error: fetchErr } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .single();

      if (fetchErr || !claim) {
        res.status(404).json({ success: false, message: 'Claim not found' });
        return;
      }

      if (claim.volunteer_id && claim.volunteer_id !== user.id && user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized: Claim is assigned to another volunteer' });
        return;
      }

      if (!claim.pickup_confirmed_at && claim.status !== 'collected') {
        res.status(400).json({ success: false, message: 'Cannot initiate delivery before donor pickup has been confirmed' });
        return;
      }

      if (claim.is_disputed) {
        res.status(400).json({ success: false, message: 'Cannot initiate delivery on a disputed claim' });
        return;
      }

      const deliveryCode = claim.delivery_code || Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('claims')
        .update({
          verification_status: 'delivery_pending',
          delivery_code: deliveryCode,
          delivery_expires_at: expiresAt,
          delivery_attempts: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Delivery arrival recorded. Awaiting recipient confirmation.',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error initiating delivery' });
    }
  }
);

/**
 * POST /api/claims/:id/pickup-confirm
 * Two-party verification: donor kitchen confirms food handover.
 */
router.post(
  '/:id/pickup-confirm',
  authenticateToken,
  requireRoles(['donor', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const claimId = req.params.id;
      const { code, notes } = req.body || {};
      const supabase = getSupabaseAdmin();

      const { data: claim, error: fetchErr } = await supabase
        .from('claims')
        .select('*, donation:donations (donor_id, title)')
        .eq('id', claimId)
        .single();

      if (fetchErr || !claim) {
        res.status(404).json({ success: false, message: 'Claim not found' });
        return;
      }

      // Idempotency check: if already collected or delivered, return success
      if (claim.status === 'collected' || claim.status === 'delivered') {
        res.status(200).json({
          success: true,
          message: 'Pickup already confirmed.',
          data: claim,
        });
        return;
      }

      // Disputed check
      if (claim.is_disputed) {
        res.status(400).json({ success: false, message: 'Disputed claim cannot be confirmed for pickup' });
        return;
      }

      // Role & ownership check: volunteer cannot confirm pickup
      if (claim.volunteer_id && claim.volunteer_id === user.id) {
        res.status(403).json({ success: false, message: 'Unauthorized: Volunteer cannot confirm pickup on behalf of donor' });
        return;
      }

      // Only listing donor or admin can confirm
      const donationDonorId = (claim as any).donation?.donor_id;
      if (user.role !== 'admin' && donationDonorId && donationDonorId !== user.id) {
        res.status(403).json({ success: false, message: 'Unauthorized: Only the listing donor or an admin can confirm pickup' });
        return;
      }

      // Expiration check
      if (claim.pickup_expires_at && new Date() > new Date(claim.pickup_expires_at)) {
        res.status(400).json({ success: false, message: 'Pickup verification code has expired. Volunteer must re-initiate handover.' });
        return;
      }

      // Attempt limit check
      const currentAttempts = claim.pickup_attempts || 0;
      if (currentAttempts >= 3) {
        res.status(400).json({ success: false, message: 'Maximum pickup verification attempts exceeded. Volunteer must re-initiate handover.' });
        return;
      }

      // Code verification
      if (claim.pickup_code) {
        if (!code || code.trim() !== claim.pickup_code.trim()) {
          const nextAttempts = currentAttempts + 1;
          await supabase.from('claims').update({ pickup_attempts: nextAttempts }).eq('id', claimId);
          const rem = 3 - nextAttempts;
          res.status(400).json({
            success: false,
            message:
              rem > 0
                ? `Invalid pickup verification code. ${rem} attempt(s) remaining.`
                : 'Maximum pickup verification attempts exceeded. Volunteer must re-initiate handover.',
          });
          return;
        }
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('claims')
        .update({
          status: 'collected',
          verification_status: 'in_transit',
          pickup_confirmed_by: user.id,
          pickup_confirmed_at: now,
          collected_at: now,
          notes: notes || claim.notes,
          updated_at: now,
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Donor pickup confirmed! Food is now in transit.',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error confirming pickup' });
    }
  }
);

/**
 * POST /api/claims/:id/delivery-confirm
 * Two-party verification: recipient NGO confirms food receipt and releases points.
 */
router.post(
  '/:id/delivery-confirm',
  authenticateToken,
  requireRoles(['recipient', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const claimId = req.params.id;
      const { portions_received, code, notes } = req.body || {};
      const supabase = getSupabaseAdmin();

      const { data: claim, error: fetchErr } = await supabase
        .from('claims')
        .select('*, donation:donations (id, donor_id, title)')
        .eq('id', claimId)
        .single();

      if (fetchErr || !claim) {
        res.status(404).json({ success: false, message: 'Claim not found' });
        return;
      }

      // Idempotency check: if already delivered, return success without duplicate rewards
      if (claim.status === 'delivered' || claim.verification_status === 'verified') {
        res.status(200).json({
          success: true,
          message: 'Delivery already confirmed.',
          data: claim,
        });
        return;
      }

      // Disputed check
      if (claim.is_disputed) {
        res.status(400).json({ success: false, message: 'Disputed claim cannot release points' });
        return;
      }

      // Role & ownership check: volunteer cannot confirm delivery
      if (claim.volunteer_id && claim.volunteer_id === user.id) {
        res.status(403).json({ success: false, message: 'Unauthorized: Volunteer cannot confirm delivery on behalf of recipient' });
        return;
      }

      // Only claiming recipient NGO or admin can confirm
      if (user.role !== 'admin' && claim.recipient_id !== user.id) {
        res.status(403).json({ success: false, message: 'Unauthorized: Only the claiming recipient NGO or an admin can confirm delivery' });
        return;
      }

      // Expiration check
      if (claim.delivery_expires_at && new Date() > new Date(claim.delivery_expires_at)) {
        res.status(400).json({ success: false, message: 'Delivery verification code has expired. Volunteer must re-initiate handoff.' });
        return;
      }

      // Attempt limit check
      const currentAttempts = claim.delivery_attempts || 0;
      if (currentAttempts >= 3) {
        res.status(400).json({ success: false, message: 'Maximum delivery verification attempts exceeded. Volunteer must re-initiate handoff.' });
        return;
      }

      // Code verification
      if (claim.delivery_code) {
        if (!code || code.trim() !== claim.delivery_code.trim()) {
          const nextAttempts = currentAttempts + 1;
          await supabase.from('claims').update({ delivery_attempts: nextAttempts }).eq('id', claimId);
          const rem = 3 - nextAttempts;
          res.status(400).json({
            success: false,
            message:
              rem > 0
                ? `Invalid delivery verification code. ${rem} attempt(s) remaining.`
                : 'Maximum delivery verification attempts exceeded. Volunteer must re-initiate handoff.',
          });
          return;
        }
      }

      const confirmedPortions = portions_received
        ? Math.min(parseInt(portions_received), claim.quantity_claimed)
        : claim.quantity_claimed;

      if (!confirmedPortions || confirmedPortions <= 0) {
        res.status(400).json({ success: false, message: 'Confirmed portions must be at least 1 portion' });
        return;
      }

      const now = new Date().toISOString();

      // Volunteer reward points calculation (50 base + 2 per portion, cap 150)
      const volunteerPoints = Math.min(150, 50 + confirmedPortions * 2);

      const { data, error } = await supabase
        .from('claims')
        .update({
          status: 'delivered',
          verification_status: 'verified',
          delivery_confirmed_by: user.id,
          delivery_confirmed_at: now,
          delivered_at: now,
          portions_delivered_confirmed: confirmedPortions,
          points_awarded: volunteerPoints,
          notes: notes || claim.notes,
          updated_at: now,
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      // Record in volunteer rewards ledger
      if (claim.volunteer_id) {
        const { data: existingVolunteerReward } = await supabase
          .from('volunteer_rewards')
          .select('id')
          .eq('claim_id', claimId)
          .maybeSingle();

        if (!existingVolunteerReward) {
          await supabase.from('volunteer_rewards').insert({
            volunteer_id: claim.volunteer_id,
            claim_id: claimId,
            points: volunteerPoints,
            status: 'released',
            portions_confirmed: confirmedPortions,
            reason: `Two-party verified rescue: ${confirmedPortions} portions delivered (50 base + ${confirmedPortions * 2} pts, capped at 150)`,
          });
        }
      }

      // Calculate and persist donor rewards on the server upon verified NGO delivery
      try {
        if ((claim as any).donation?.donor_id) {
          const donationInfo = (claim as any).donation;
          const { data: existingReward } = await supabase
            .from('donor_rewards')
            .select('id')
            .eq('claim_id', claimId)
            .maybeSingle();

          if (!existingReward) {
            // Donor reward formula: 30 base + portions * 2, capped at 200 pts
            const donorPoints = Math.min(200, 30 + Math.max(0, confirmedPortions) * 2);
            await supabase.from('donor_rewards').insert({
              donor_id: donationInfo.donor_id,
              donation_id: donationInfo.id,
              claim_id: claimId,
              points: donorPoints,
              status: 'awarded',
              portions_confirmed: confirmedPortions,
              donation_title: donationInfo.title || 'Rescued Meal Donation',
              recipient_name: (user as any).fullName || (user as any).full_name || 'Recipient NGO',
              reason: `Delivered & confirmed rescue: ${confirmedPortions} portions delivered (30 base + ${confirmedPortions * 2} portion bonus, capped at 200 pts)`,
            });
          }
        }
      } catch (rewardErr: any) {
        console.warn('Could not record donor reward on server:', rewardErr?.message);
      }

      res.status(200).json({
        success: true,
        message: 'Delivery verified by recipient NGO! Volunteer and donor reward points released.',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error confirming delivery' });
    }
  }
);

/**
 * POST /api/claims/:id/dispute
 * Flags a delivery issue or damaged packaging (holds points at 0).
 */
router.post('/:id/dispute', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const claimId = req.params.id;
    const { reason } = req.body;
    const supabase = getSupabaseAdmin();

    if (!reason) {
      res.status(400).json({ success: false, message: 'Dispute reason is required' });
      return;
    }

    const { data, error } = await supabase.rpc('dispute_claim_two_party', {
      p_claim_id: claimId,
      p_user_id: user.id,
      p_reason: reason,
    });

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    // Forfeit any donor reward for this claim
    try {
      await supabase
        .from('donor_rewards')
        .update({ status: 'forfeited', points: 0, reason: `Dispute flagged: ${reason}` })
        .eq('claim_id', claimId);
    } catch (err: any) {
      console.warn('Could not update donor reward on dispute:', err?.message);
    }

    res.status(200).json({
      success: true,
      message: 'Claim flagged as disputed. 0 points awarded pending operational review.',
      data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error recording dispute' });
  }
});

/**
 * GET /api/claims/volunteer/rewards
 * Fetches volunteer reward points summary and ledger history.
 */
router.get(
  '/volunteer/rewards',
  authenticateToken,
  requireRoles(['volunteer', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const volunteerId = (req.query.volunteer_id as string) || user.id;
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from('volunteer_rewards')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      const records = data || [];
      const releasedPoints = records
        .filter((r) => r.status === 'released')
        .reduce((sum, r) => sum + r.points, 0);

      res.status(200).json({
        success: true,
        data: {
          points_released: releasedPoints,
          verified_deliveries_count: records.filter((r) => r.status === 'released').length,
          history: records,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching volunteer rewards' });
    }
  }
);

/**
 * GET /api/claims/donor/rewards
 * Fetches donor reward points summary and ledger history.
 * Enforces role and cross-donor authorization: donors can only see their own rewards; admins can view any donor's rewards.
 */
router.get(
  '/donor/rewards',
  authenticateToken,
  requireRoles(['donor', 'admin']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const requestedDonorId = (req.query.donor_id as string) || user.id;

      // Cross-account isolation: Donors can only view their own rewards
      if (user.role !== 'admin' && requestedDonorId !== user.id) {
        res.status(403).json({
          success: false,
          message: "Unauthorized: You cannot view another donor's rewards",
        });
        return;
      }

      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('donor_rewards')
        .select('*')
        .eq('donor_id', requestedDonorId)
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      const records = data || [];
      const awardedRecords = records.filter((r) => r.status === 'awarded');
      const pointsBalance = awardedRecords.reduce((sum, r) => sum + r.points, 0);
      const portionsDonated = awardedRecords.reduce((sum, r) => sum + (r.portions_confirmed || 0), 0);

      let currentTier = 'Bronze Community Kitchen';
      let nextTierThreshold = 300;
      if (pointsBalance >= 600) {
        currentTier = 'Gold Zero-Waste Champion';
        nextTierThreshold = 1000;
      } else if (pointsBalance >= 300) {
        currentTier = 'Silver Food Guardian';
        nextTierThreshold = 600;
      }

      res.status(200).json({
        success: true,
        data: {
          points_balance: pointsBalance,
          verified_rescues_count: awardedRecords.length,
          portions_donated_count: portionsDonated,
          current_tier: currentTier,
          next_tier_threshold: nextTierThreshold,
          history: records,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error fetching donor rewards' });
    }
  }
);

export default router;

