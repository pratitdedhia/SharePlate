import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { CreateDonationSchema, UpdateDonationSchema } from '../validators/schemas.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { isSupabaseConfigured } from '../config/env.js';

const router = Router();

/**
 * GET /api/donations
 * Browses food donations with filtering, searching, and pagination.
 * Excludes private pickup instructions for non-claimants.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, city, search, status = 'available', limit = '20', offset = '0' } = req.query;

    if (!isSupabaseConfigured()) {
      // In dev fallback mode when Supabase is unconfigured, return demo dataset
      res.status(200).json({
        success: true,
        source: 'demo_fallback',
        data: [],
        total: 0,
      });
      return;
    }

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('donations')
      .select(`
        id, donor_id, title, description, category,
        quantity_total, quantity_available, quantity_unit,
        image_url, cloudinary_public_id, ingredients, allergens,
        preparation_time, pickup_deadline, city, location_label,
        status, created_at, updated_at,
        donor:profiles!donor_id (id, full_name, organization_name, city, avatar_url)
      `, { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category as string);
    }
    if (city && city !== 'all') {
      query = query.ilike('city', `%${city}%`);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location_label.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string, 10), parseInt(offset as string, 10) + parseInt(limit as string, 10) - 1);

    const { data, count, error } = await query;

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      data,
      total: count || 0,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching donations' });
  }
});

/**
 * GET /api/donations/:id
 * Retrieve a single donation by ID.
 * Exposes sensitive pickup instructions ONLY to the donor or active claim recipients.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isSupabaseConfigured()) {
      res.status(404).json({ success: false, message: 'Donation not found in demo fallback' });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data: donation, error } = await supabase
      .from('donations')
      .select(`
        *,
        donor:profiles!donor_id (id, full_name, organization_name, city, phone, avatar_url),
        claims (id, recipient_id, quantity_claimed, status, claimed_at)
      `)
      .eq('id', id)
      .single();

    if (error || !donation) {
      res.status(404).json({ success: false, message: 'Donation not found' });
      return;
    }

    // Determine authorization to view sensitive pickup instructions
    let hasAccessToPrivateDetails = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const isDonor = donation.donor_id === user.id;
        const isClaimant = donation.claims?.some((c: any) => c.recipient_id === user.id && c.status !== 'cancelled');
        hasAccessToPrivateDetails = Boolean(isDonor || isClaimant);
      }
    }

    if (!hasAccessToPrivateDetails) {
      // Redact private instructions and contact
      donation.pickup_instructions = 'Pickup instructions are revealed after an authorized recipient reserves this donation.';
      if (donation.donor) {
        delete donation.donor.phone;
      }
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error retrieving donation' });
  }
});

/**
 * POST /api/donations
 * Create a new donation listing (donors or admin only).
 */
router.post(
  '/',
  authenticateToken,
  requireRoles(['donor', 'admin']),
  validateBody(CreateDonationSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const supabase = getSupabaseAdmin();

      const donationData = {
        ...req.body,
        donor_id: user.id,
        quantity_available: req.body.quantity_total,
        status: 'available',
      };

      const { data, error } = await supabase
        .from('donations')
        .insert(donationData)
        .select()
        .single();

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        actor_id: user.id,
        donation_id: data.id,
        action: 'donation_created',
        details: { title: data.title, portions: data.quantity_total },
      });

      res.status(201).json({
        success: true,
        message: 'Donation listed successfully!',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error creating donation' });
    }
  }
);

/**
 * PATCH /api/donations/:id
 * Update an existing donation (owner only).
 */
router.patch(
  '/:id',
  authenticateToken,
  validateBody(UpdateDonationSchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id } = req.params;
      const supabase = getSupabaseAdmin();

      const { data: existing, error: fetchErr } = await supabase
        .from('donations')
        .select('donor_id, status, quantity_total, quantity_available')
        .eq('id', id)
        .single();

      if (fetchErr || !existing) {
        res.status(404).json({ success: false, message: 'Donation not found' });
        return;
      }

      if (existing.donor_id !== user.id && user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Unauthorized: You can only edit your own listings' });
        return;
      }

      if (['delivered', 'cancelled', 'expired'].includes(existing.status)) {
        res.status(400).json({ success: false, message: `Cannot modify a donation in '${existing.status}' status` });
        return;
      }

      const { data, error } = await supabase
        .from('donations')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Donation updated successfully',
        data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Error updating donation' });
    }
  }
);

/**
 * POST /api/donations/:id/cancel
 * Cancel a donation listing (owner or admin only).
 */
router.post('/:id/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    const { data: existing, error: fetchErr } = await supabase
      .from('donations')
      .select('donor_id, status')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) {
      res.status(404).json({ success: false, message: 'Donation not found' });
      return;
    }

    if (existing.donor_id !== user.id && user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { data, error } = await supabase
      .from('donations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    await supabase.from('activity_logs').insert({
      actor_id: user.id,
      donation_id: id,
      action: 'donation_cancelled',
      details: { cancelled_by: user.id },
    });

    res.status(200).json({
      success: true,
      message: 'Donation has been cancelled',
      data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error cancelling donation' });
  }
});

export default router;
