/**
 * Cloudinary Frontend Integration Helpers
 * Mandatory technology for Hacktober HackDays 2026
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'shareplate-demo';
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'limit';
  gravity?: 'auto' | 'center' | 'face';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

/**
 * Builds an optimized Cloudinary delivery URL with automatic format and quality compression.
 */
export const getCloudinaryUrl = (
  publicIdOrUrl?: string | null,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!publicIdOrUrl) return DEFAULT_FALLBACK_IMAGE;

  // If it's already a full HTTP(S) URL (e.g. Unsplash sample or existing Cloudinary URL)
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // If it is a Cloudinary URL, inject transformations
    if (publicIdOrUrl.includes('res.cloudinary.com') && !publicIdOrUrl.includes('/c_')) {
      const { width = 800, height = 600, crop = 'fill', quality = 'auto', format = 'auto' } = options;
      const transformPart = `c_${crop},w_${width},h_${height},q_${quality},f_${format}/`;
      return publicIdOrUrl.replace('/upload/', `/upload/${transformPart}`);
    }
    return publicIdOrUrl;
  }

  // Build from Cloudinary public ID
  const { width = 800, height = 600, crop = 'fill', gravity = 'auto', quality = 'auto', format = 'auto' } = options;
  const transforms = [
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
    `g_${gravity}`,
    `q_${quality}`,
    `f_${format}`,
  ].join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
};

/**
 * Direct browser upload to Cloudinary using server-issued cryptographic signature.
 */
export const uploadToCloudinary = async (
  file: File,
  signatureData: {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    cloudName: string;
  },
  onProgress?: (percent: number) => void
): Promise<{ secure_url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);

  const xhr = new XMLHttpRequest();
  const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    xhr.open('POST', url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
          });
        } catch (e) {
          reject(new Error('Invalid JSON response from Cloudinary'));
        }
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText || xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during Cloudinary image upload'));
    xhr.send(formData);
  });
};
