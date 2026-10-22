import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from './auth.js';

export const requireRoles = (allowedRoles: Array<AuthenticatedUser['role']>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};
