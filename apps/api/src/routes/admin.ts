import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

// All admin routes require admin role and authenticated JWT token
router.use(authenticateToken);
router.use(requireRoles(['admin']));

/**
 * GET /api/admin/users
 * Lists all user accounts in the platform.
 */
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching users' });
  }
});

/**
 * POST /api/admin/users
 * Creates a new user profile directly.
 */
router.post('/users', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { email, full_name, role, phone, city, organization_name, donor_type, recipient_type, availability } = req.body;

    if (!email || !full_name || !role) {
      res.status(400).json({ success: false, message: 'Email, full name, and role are required' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        email,
        full_name,
        role,
        phone,
        city: city || 'Delhi NCR',
        organization_name,
        donor_type,
        recipient_type,
        availability,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(201).json({ success: true, message: 'User created successfully', data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating user' });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Updates user profile details or toggles active status.
 */
router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Deletes a user account.
 */
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting user' });
  }
});

/**
 * GET /api/admin/reports
 * Lists all reports with reporter and donation info.
 */
router.get('/reports', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id (id, full_name, role),
        donation:donations (id, title, status)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching reports' });
  }
});

/**
 * PATCH /api/admin/reports/:id
 * Resolves or dismisses a safety report.
 */
router.patch('/reports/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    if (!['resolved', 'dismissed', 'investigating', 'open'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid report status' });
      return;
    }

    const { data, error } = await supabase
      .from('reports')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, message: `Report marked as ${status}`, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating report' });
  }
});

/**
 * GET /api/admin/activity
 * Fetches platform-wide activity logs.
 */
router.get('/activity', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      res.status(500).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({ success: true, data: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching activity logs' });
  }
});

export default router;

