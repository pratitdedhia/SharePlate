/**
 * Cloudinary Frontend Integration Helpers
 * Mandatory technology for Hacktober HackDays 2026 (SheBuilds Delhi, MLH)
 */

const sanitizeEnv = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed === 'shareplate-demo' || trimmed.includes('<<FILL')) return '';
  return trimmed;
};

// Project verified Cloudinary configuration (with fallback for automated CI/GitHub Pages deployments)
export const CLOUD_NAME = sanitizeEnv(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) || 'lhdfjjdh';
export const UPLOAD_PRESET = sanitizeEnv(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) || 'Hacktober Hackathon';

export const AUTO_TAG_ENABLED = import.meta.env.VITE_CLOUDINARY_AUTO_TAG === 'true';
export const MODERATION_ENABLED = import.meta.env.VITE_CLOUDINARY_MODERATION === 'true';
export const ENHANCE_ENABLED = import.meta.env.VITE_CLOUDINARY_ENHANCE === 'true';

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'limit' | 'scale';
  gravity?: 'auto' | 'center' | 'face' | 'north' | 'south';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  enhance?: boolean;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  original_filename?: string;
  tags?: string[];
  aiTags?: string[];
  eager?: Array<{ secure_url: string; width: number; height: number; format?: string }>;
}

/**
 * Returns true if Cloudinary cloud name is configured and not a placeholder.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    CLOUD_NAME &&
      CLOUD_NAME.length > 0 &&
      CLOUD_NAME !== 'shareplate-demo' &&
      !CLOUD_NAME.includes('<<FILL')
  );
};

/**
 * Returns true if direct unsigned uploads are configured with a preset.
 */
export const isUnsignedUploadConfigured = (): boolean => {
  return (
    isCloudinaryConfigured() &&
    Boolean(
      UPLOAD_PRESET &&
        UPLOAD_PRESET.length > 0 &&
        !UPLOAD_PRESET.includes('<<FILL')
    )
  );
};

/**
 * Verifies if an image URL is genuinely served from Cloudinary CDN.
 */
export const isCloudinaryUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return url.includes('res.cloudinary.com');
};

/**
 * Builds an optimized Cloudinary delivery URL with automatic format and quality compression.
 * If Cloudinary is not configured and a public ID is passed, returns a labeled fallback image.
 */
export const getCloudinaryUrl = (
  publicIdOrUrl?: string | null,
  options: CloudinaryTransformOptions = {}
): string => {
  if (!publicIdOrUrl) return DEFAULT_FALLBACK_IMAGE;

  // If it's already a full HTTP(S) URL
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // If it is a Cloudinary URL, inject transformations
    if (publicIdOrUrl.includes('res.cloudinary.com') && !publicIdOrUrl.includes('/c_')) {
      const {
        width = 800,
        height = 600,
        crop = 'fill',
        gravity = 'auto',
        quality = 'auto',
        format = 'auto',
        enhance = ENHANCE_ENABLED,
      } = options;

      const transforms = [
        `c_${crop}`,
        `g_${gravity}`,
        `w_${width}`,
        `h_${height}`,
        `q_${quality}`,
        `f_${format}`,
        enhance ? 'e_improve' : '',
      ].filter(Boolean).join(',');

      return publicIdOrUrl.replace('/upload/', `/upload/${transforms}/`);
    }
    return publicIdOrUrl;
  }

  // If not configured with a valid cloud name, cannot build a valid res.cloudinary.com URL
  if (!isCloudinaryConfigured()) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // Build from Cloudinary public ID
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    enhance = ENHANCE_ENABLED,
  } = options;

  const transforms = [
    `c_${crop}`,
    `g_${gravity}`,
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    `f_${format}`,
    enhance ? 'e_improve' : '',
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
};

/**
 * Generates responsive srcset string for 400w, 800w, and 1200w widths.
 */
export const getCloudinarySrcSet = (
  publicIdOrUrl?: string | null,
  widths: number[] = [400, 800, 1200],
  options: Omit<CloudinaryTransformOptions, 'width' | 'height'> = {}
): string => {
  if (!publicIdOrUrl || !isCloudinaryConfigured()) return '';

  return widths
    .map((w) => {
      const h = Math.round((w * 3) / 4);
      const url = getCloudinaryUrl(publicIdOrUrl, { ...options, width: w, height: h });
      return `${url} ${w}w`;
    })
    .join(', ');
};

/**
 * Generates aspect ratio preview URLs using Cloudinary content-aware auto-cropping (g_auto)
 * and dynamic modern format delivery (f_auto, q_auto).
 */
export const getAspectRatioPreviews = (
  publicIdOrUrl?: string | null
): { card: string; banner: string; square: string } => {
  return {
    card: getCloudinaryUrl(publicIdOrUrl, {
      width: 800,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
    }),
    banner: getCloudinaryUrl(publicIdOrUrl, {
      width: 1200,
      height: 675,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
    }),
    square: getCloudinaryUrl(publicIdOrUrl, {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
    }),
  };
};

/**
 * Extracts and cleans AI food tags from raw Cloudinary tags and categorizations.
 */
export const extractAIFoodTags = (rawTags: string[] = []): string[] => {
  const internalFilter = new Set(['shareplate', 'food-donation', 'social-good', 'local-preview']);
  const cleaned: string[] = [];

  for (const t of rawTags) {
    const trimmed = t.trim();
    if (!trimmed || internalFilter.has(trimmed.toLowerCase())) continue;
    // Capitalize words
    const formatted = trimmed
      .split(/[-_ ]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    if (!cleaned.includes(formatted)) {
      cleaned.push(formatted);
    }
  }

  return cleaned;
};

/**
 * Genuine measurement of delivered asset payload by fetching the URL as a blob.
 */
export const measureTransformedDelivery = async (
  url: string
): Promise<{ deliveredBytes: number; format: string } | null> => {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return {
      deliveredBytes: blob.size,
      format: blob.type || 'image/webp',
    };
  } catch {
    return null;
  }
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
    eager?: string;
    tags?: string;
  },
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', signatureData.timestamp.toString());
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);
  if (signatureData.eager) formData.append('eager', signatureData.eager);
  if (signatureData.tags) formData.append('tags', signatureData.tags);

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
          let rawTags: string[] = [];
          if (Array.isArray(response.tags)) {
            rawTags = response.tags;
          } else if (typeof response.tags === 'string') {
            rawTags = response.tags.split(',').map((t: string) => t.trim());
          }
          if (response.info?.categorization?.google_tagging?.data) {
            const gTags = response.info.categorization.google_tagging.data.map((item: any) => item.tag);
            rawTags = Array.from(new Set([...rawTags, ...gTags]));
          }

          const aiTags = extractAIFoodTags(rawTags);

          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            format: response.format,
            bytes: response.bytes,
            width: response.width,
            height: response.height,
            original_filename: response.original_filename,
            tags: rawTags,
            aiTags,
            eager: response.eager,
          });
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

/**
 * Direct unsigned upload to Cloudinary using an upload preset.
 * Safe for client-side execution on static hosts like GitHub Pages.
 */
export const uploadToCloudinaryUnsigned = async (
  file: File,
  config: {
    cloudName: string;
    uploadPreset: string;
    folder?: string;
    tags?: string;
    context?: string;
  },
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  if (config.folder) formData.append('folder', config.folder);
  if (config.tags) formData.append('tags', config.tags);
  if (config.context) formData.append('context', config.context);

  if (AUTO_TAG_ENABLED) {
    formData.append('auto_tagging', '0.7');
  }

  const xhr = new XMLHttpRequest();
  const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

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
          let rawTags: string[] = [];
          if (Array.isArray(response.tags)) {
            rawTags = response.tags;
          } else if (typeof response.tags === 'string') {
            rawTags = response.tags.split(',').map((t: string) => t.trim());
          }
          if (response.info?.categorization?.google_tagging?.data) {
            const gTags = response.info.categorization.google_tagging.data.map((item: any) => item.tag);
            rawTags = Array.from(new Set([...rawTags, ...gTags]));
          }

          const aiTags = extractAIFoodTags(rawTags);

          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            format: response.format,
            bytes: response.bytes,
            width: response.width,
            height: response.height,
            original_filename: response.original_filename,
            tags: rawTags,
            aiTags,
            eager: response.eager,
          });
        } catch {
          reject(new Error('Invalid JSON response from Cloudinary unsigned upload'));
        }
      } else {
        reject(new Error(`Cloudinary unsigned upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during Cloudinary unsigned upload'));
    xhr.send(formData);
  });
};
