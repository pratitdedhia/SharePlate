import { Router, Request, Response } from 'express';
import { isCloudinaryConfigured, isSupabaseConfigured } from '../config/env.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'SharePlate API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    integrations: {
      supabase: isSupabaseConfigured() ? 'connected' : 'unconfigured (demo mode active)',
      cloudinary: isCloudinaryConfigured() ? 'ready' : 'unconfigured (sample images active)',
    },
    event: 'Hacktober HackDays 2026',
    organizer: 'SheBuilds Delhi Chapter',
  });
});

export default router;
