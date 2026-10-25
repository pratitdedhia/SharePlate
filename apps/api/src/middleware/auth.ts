import { Request, Response, NextFunction } from 'express';
import { getSupabase, getSupabaseAdmin } from '../config/supabase.js';
import { config, isSupabaseConfigured } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'donor' | 'recipient' | 'volunteer' | 'admin';
  fullName?: string;
  organizationName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Missing Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  // In production with Supabase not configured, respond 503
  if (config.nodeEnv === 'production') {
    if (!isSupabaseConfigured()) {
      res.status(503).json({
        success: false,
        message: 'Authentication service unavailable.',
      });
      return;
    }
    // Demo bypass is disabled entirely when config.nodeEnv === 'production'
  } else {
    // Outside production, allow it only if Supabase is not configured OR process.env.ALLOW_DEMO_AUTH === 'true'
    const allowDemoAuth = !isSupabaseConfigured() || process.env.ALLOW_DEMO_AUTH === 'true';
    if (allowDemoAuth && (token.startsWith('demo-user-') || !isSupabaseConfigured())) {
      const roleMatch = token.match(/demo-user-(donor|recipient|volunteer|admin)/);
      const role = (roleMatch ? roleMatch[1] : 'donor') as AuthenticatedUser['role'];
      const demoIds: Record<string, string> = {
        donor: 'a0000000-0000-0000-0000-000000000001',
        recipient: 'b0000000-0000-0000-0000-000000000001',
        volunteer: 'c0000000-0000-0000-0000-000000000001',
        admin: 'e0000000-0000-0000-0000-000000000001',
      };

      req.user = {
        id: demoIds[role] || 'a0000000-0000-0000-0000-000000000001',
        email: `${role}@shareplate.demo`,
        role,
        fullName: `Demo ${role.toUpperCase()}`,
        organizationName: role === 'donor' ? 'DTU Campus Canteen' : 'Robin Hood Army Delhi',
      };
      return next();
    }
  }

  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session token.',
      });
      return;
    }

    // Retrieve user profile to establish authoritative role
    const adminClient = getSupabaseAdmin();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, full_name, role, organization_name')
      .eq('id', user.id)
      .single();

    let resolvedRole: AuthenticatedUser['role'] = 'donor';
    if (profile?.role) {
      resolvedRole = profile.role as AuthenticatedUser['role'];
    } else {
      const metaRole = user.user_metadata?.role;
      if (metaRole === 'donor' || metaRole === 'recipient' || metaRole === 'volunteer') {
        resolvedRole = metaRole;
      } else {
        resolvedRole = 'donor';
      }
    }

    req.user = {
      id: user.id,
      email: user.email || '',
      role: resolvedRole,
      fullName: profile?.full_name || user.user_metadata?.full_name,
      organizationName: profile?.organization_name || user.user_metadata?.organization_name,
    };

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};
