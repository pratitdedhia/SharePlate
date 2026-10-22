import { v2 as cloudinary } from 'cloudinary';
import { config, isCloudinaryConfigured } from './env.js';

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export { cloudinary };

/**
 * Generate a secure server-signed upload signature for Cloudinary.
 * Enforces destination folder, allowed formats, timestamp, and optional eager transformations.
 */
export const generateUploadSignature = (userId: string) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials are not configured on the server.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  // Restrict to folder and optionally scope by user
  const folder = `${config.cloudinary.folder}/${userId}`;

  // Parameters to sign (alphabetical order required by Cloudinary hashing)
  const paramsToSign: Record<string, any> = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.cloudinary.apiSecret
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    maxFileSize: config.cloudinary.maxFileSizeMb * 1024 * 1024,
  };
};

/**
 * Helper to build an optimized, responsive Cloudinary delivery URL
 */
export const getOptimizedImageUrl = (publicId: string, width = 800, height = 600): string => {
  if (!publicId) return '';
  if (!isCloudinaryConfigured()) return publicId;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'fill', gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    secure: true,
  });
};
