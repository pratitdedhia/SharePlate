import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.js';
import uploadRoutes from './routes/uploads.js';
import donationRoutes from './routes/donations.js';
import claimRoutes from './routes/claims.js';
import impactRoutes from './routes/impact.js';
import profileRoutes from './routes/profile.js';
import reportRoutes from './routes/reports.js';

export const createApp = (): Express => {
  const app = express();

  // Security Middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev servers)
      if (!origin) return callback(null, true);
      // In development or demo, allow localhost and configured origins
      if (
        config.nodeEnv === 'development' ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin === config.frontendOrigin
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for hackathon demo
    },
    credentials: true,
  }));

  // Body Parsing with safe size constraints
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api/impact', impactRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/reports', reportRoutes);

  // 404 handler for undefined API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found.`,
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
