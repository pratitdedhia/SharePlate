import { Request, Response, NextFunction } from 'express';
import { getSupabase, getSupabaseAdmin } from '../config/supabase.js';
import { isSupabaseConfigured } from '../config/env.js';

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

  // Dev demo bypass header for local demonstration/testing without active Supabase credentials
  if (token.startsWith('demo-user-') || !isSupabaseConfigured()) {
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

    req.user = {
      id: user.id,
      email: user.email || '',
      role: (profile?.role || user.user_metadata?.role || 'donor') as AuthenticatedUser['role'],
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
