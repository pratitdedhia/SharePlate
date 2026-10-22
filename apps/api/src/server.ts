import { createApp } from './app.js';
import { config, isCloudinaryConfigured, isSupabaseConfigured } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SharePlate API Server running on port ${config.port}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📦 Supabase Status: ${isSupabaseConfigured() ? '✅ Configured' : '⚠️ Unconfigured (Demo fallback mode)'}`);
  console.log(`📸 Cloudinary Status: ${isCloudinaryConfigured() ? '✅ Ready (Signed uploads active)' : '⚠️ Unconfigured (Sample fallback active)'}`);
  console.log(`🎯 SheBuilds Hacktober HackDays 2026`);
  console.log(`======================================================\n`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
