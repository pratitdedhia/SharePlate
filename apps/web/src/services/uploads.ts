import { apiRequest } from './api';
import {
  uploadToCloudinary,
  uploadToCloudinaryUnsigned,
  isUnsignedUploadConfigured,
  getCloudinaryUrl,
  getAspectRatioPreviews,
  extractAIFoodTags,
  CLOUD_NAME,
  UPLOAD_PRESET,
} from '../lib/cloudinary';

export interface UploadSignatureResponse {
  success: boolean;
  isConfigured: boolean;
  signature?: string;
  timestamp?: number;
  folder?: string;
  apiKey?: string;
  cloudName?: string;
  eager?: string;
  tags?: string;
  message?: string;
}

export type UploadDestination = 'signed_cloudinary' | 'unsigned_cloudinary' | 'local_preview';

export interface UploadResult {
  imageUrl: string;
  publicId: string;
  uploadType: UploadDestination;
  originalBytes: number;
  deliveredBytes?: number;
  width?: number;
  height?: number;
  format?: string;
  isCloudinaryHosted: boolean;
  notes?: string;
  tags?: string[];
  aiTags?: string[];
  aspectRatios?: {
    card: string;
    banner: string;
    square: string;
  };
}

export const uploadService = {
  async getSignature(): Promise<UploadSignatureResponse> {
    try {
      const res = await apiRequest('/uploads/signature', { method: 'POST' });
      return res;
    } catch {
      return {
        success: false,
        isConfigured: false,
        message: 'Express backend signature endpoint unreachable (static host or backend offline).',
      };
    }
  },

  async uploadDonationImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    // 1. Client-side validation: Max 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`);
    }

    // 2. Client-side validation: Image MIME types only
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      throw new Error(`Unsupported image format: ${file.type || 'unknown'}. Only JPEG, PNG, and WebP are allowed.`);
    }

    // Attempt 1: Signed upload via Express API signature endpoint
    try {
      const signatureData = await this.getSignature();
      if (
        signatureData.isConfigured &&
        signatureData.signature &&
        signatureData.apiKey &&
        signatureData.cloudName &&
        signatureData.folder
      ) {
        const res = await uploadToCloudinary(
          file,
          {
            signature: signatureData.signature,
            timestamp: signatureData.timestamp!,
            folder: signatureData.folder,
            apiKey: signatureData.apiKey,
            cloudName: signatureData.cloudName,
            eager: signatureData.eager,
            tags: signatureData.tags,
          },
          onProgress
        );

        const targetForTransforms = res.secure_url || res.public_id;
        const aspectRatios = getAspectRatioPreviews(targetForTransforms);
        const optimizedUrl = getCloudinaryUrl(targetForTransforms, {
          crop: 'fill',
          gravity: 'auto',
          format: 'auto',
          quality: 'auto',
          width: 800,
          height: 600,
        });

        return {
          imageUrl: optimizedUrl || res.secure_url,
          publicId: res.public_id,
          uploadType: 'signed_cloudinary',
          originalBytes: file.size,
          width: res.width,
          height: res.height,
          format: res.format,
          isCloudinaryHosted: true,
          tags: res.tags || [],
          aiTags: res.aiTags || extractAIFoodTags(res.tags || []),
          aspectRatios,
          notes: 'Signed Cloudinary upload with auto-crop (g_auto) and AI food tagging.',
        };
      }
    } catch {
      // Proceed to Attempt 2
    }

    // Attempt 2: Direct unsigned upload using upload_preset
    if (isUnsignedUploadConfigured()) {
      try {
        const res = await uploadToCloudinaryUnsigned(
          file,
          {
            cloudName: CLOUD_NAME,
            uploadPreset: UPLOAD_PRESET,
            folder: 'shareplate/donations',
            tags: 'shareplate,food-donation,social-good',
            context: `app=shareplate|timestamp=${Date.now()}`,
          },
          onProgress
        );

        const targetForTransforms = res.secure_url || res.public_id;
        const aspectRatios = getAspectRatioPreviews(targetForTransforms);
        const optimizedUrl = getCloudinaryUrl(targetForTransforms, {
          crop: 'fill',
          gravity: 'auto',
          format: 'auto',
          quality: 'auto',
          width: 800,
          height: 600,
        });

        return {
          imageUrl: optimizedUrl || res.secure_url,
          publicId: res.public_id,
          uploadType: 'unsigned_cloudinary',
          originalBytes: file.size,
          width: res.width,
          height: res.height,
          format: res.format,
          isCloudinaryHosted: true,
          tags: res.tags || [],
          aiTags: res.aiTags || extractAIFoodTags(res.tags || []),
          aspectRatios,
          notes: 'Direct unsigned Cloudinary upload with auto-crop (g_auto) and format optimization (f_auto, q_auto).',
        };
      } catch (err: any) {
        const errorDetail = err?.message || 'Upload request failed';
        console.error('Cloudinary unsigned upload failed:', err);
        throw new Error(
          `Cloudinary upload failed: ${errorDetail}. Please check your VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET, and verify that the preset is set to 'Unsigned' in your Cloudinary Dashboard.`
        );
      }
    }

    // Attempt 3: Local preview fallback when Cloudinary is not configured — strictly labeled
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 25;
        if (onProgress) onProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          const localUrl = URL.createObjectURL(file);
          resolve({
            imageUrl: localUrl,
            publicId: `local-preview-${Date.now()}`,
            uploadType: 'local_preview',
            originalBytes: file.size,
            isCloudinaryHosted: false,
            tags: ['local-preview'],
            aiTags: [],
            aspectRatios: {
              card: localUrl,
              banner: localUrl,
              square: localUrl,
            },
            notes: 'Demo preview — not uploaded to Cloudinary (no cloud name or upload preset configured).',
          });
        }
      }, 80);
    });
  },
};
