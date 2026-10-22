import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { UpdateProfileSchema } from '../validators/schemas.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/profile
 * Returns the authenticated user's profile details.
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.fullName || 'Demo User',
          organization_name: user.organizationName || 'Demo Organization',
          city: 'Delhi NCR',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching profile' });
  }
});

/**
 * PATCH /api/profile
 * Updates permitted profile fields for the authenticated user.
 */
router.patch('/', authenticateToken, validateBody(UpdateProfileSchema), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating profile' });
  }
});

export default router;
