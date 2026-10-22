import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'shareplate/donations',
    maxFileSizeMb: parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE_MB || '5', 10),
  },
};

export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
  );
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.supabase.url && config.supabase.anonKey);
};
