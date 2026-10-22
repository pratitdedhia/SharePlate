import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { CreateReportSchema } from '../validators/schemas.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * POST /api/reports
 * Submit a food-safety or community guideline concern.
 */
router.post('/', authenticateToken, validateBody(CreateReportSchema), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        donation_id: req.body.donation_id || null,
        reason: req.body.reason,
        description: req.body.description,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will inspect this immediately.',
      data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error submitting report' });
  }
});

/**
 * GET /api/reports
 * View all reports (Platform Admin only).
 */
router.get('/', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response) => {
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

export default router;
