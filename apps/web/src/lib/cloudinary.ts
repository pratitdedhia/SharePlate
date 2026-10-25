/**
 * Cloudinary Frontend Integration Helpers
 * Mandatory technology for Hacktober HackDays 2026
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'limit';
  gravity?: 'auto' | 'center' | 'face';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
}

export const isCloudinaryAsset = (url?: string | null): boolean =>
  Boolean(url?.includes('res.cloudinary.com/'));

/**
 * Builds an optimized Cloudinary delivery URL with automatic format and quality compression.
 */
export const getCloudinaryUrl = (
  publicIdOrUrl?: string | null,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!publicIdOrUrl) return DEFAULT_FALLBACK_IMAGE;

  const { width = 800, height = 600, crop = 'fill', gravity = 'auto', quality = 'auto', format = 'auto' } = options;
  const transformPart = `c_${crop},w_${width},h_${height},g_${gravity},q_${quality},f_${format}/`;

  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    if (isCloudinaryAsset(publicIdOrUrl)) return publicIdOrUrl.replace('/upload/', `/upload/${transformPart}`);
    return publicIdOrUrl;
  }

  if (!CLOUD_NAME) return DEFAULT_FALLBACK_IMAGE;

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformPart}${publicIdOrUrl}`;
};

export const getCloudinarySrcSet = (
  publicIdOrUrl?: string | null,
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string | undefined => {
  if (!publicIdOrUrl || (!isCloudinaryAsset(publicIdOrUrl) && !CLOUD_NAME)) return undefined;
  if (publicIdOrUrl.startsWith('http') && !isCloudinaryAsset(publicIdOrUrl)) return undefined;
  return [400, 800, 1200]
    .map((width) => `${getCloudinaryUrl(publicIdOrUrl, { ...options, width })} ${width}w`)
    .join(', ');
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
): Promise<CloudinaryUploadResponse> => {
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
          resolve(response);
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

export const uploadUnsignedToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'shareplate/donations');
  formData.append('tags', 'shareplate,food-donation');
  formData.append('context', `source=shareplate|category=food-donation|filename=${file.name}`);

  const xhr = new XMLHttpRequest();
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    xhr.open('POST', url);
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
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
