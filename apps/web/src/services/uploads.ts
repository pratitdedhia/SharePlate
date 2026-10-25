import { apiRequest } from './api';
import { getCloudinaryUrl, uploadToCloudinary, uploadUnsignedToCloudinary } from '../lib/cloudinary';

export interface UploadSignatureResponse {
  success: boolean;
  isConfigured: boolean;
  signature?: string;
  timestamp?: number;
  folder?: string;
  apiKey?: string;
  cloudName?: string;
  message?: string;
}

export interface DonationImageUploadResult {
  imageUrl: string;
  publicId: string;
  mode: 'cloudinary' | 'demo-preview';
  originalBytes: number;
  deliveredBytes?: number;
  format?: string;
  width?: number;
  height?: number;
}

export const uploadService = {
  async getSignature(): Promise<UploadSignatureResponse> {
    try {
      const res = await apiRequest('/uploads/signature', { method: 'POST' });
      return res;
    } catch {
      return { success: false, isConfigured: false };
    }
  },

  async uploadDonationImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<DonationImageUploadResult> {
    const signatureData = await this.getSignature();

    if (signatureData.isConfigured && signatureData.signature && signatureData.apiKey && signatureData.cloudName && signatureData.folder) {
      try {
        const response = await uploadToCloudinary(file, {
          signature: signatureData.signature,
          timestamp: signatureData.timestamp!,
          folder: signatureData.folder,
          apiKey: signatureData.apiKey,
          cloudName: signatureData.cloudName,
        }, onProgress);
        return this.buildResult(file, response);
      } catch {
        if (!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) throw new Error('Signed Cloudinary upload failed.');
      }
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (cloudName && uploadPreset) {
      const response = await uploadUnsignedToCloudinary(file, cloudName, uploadPreset, onProgress);
      return this.buildResult(file, response);
    }

    onProgress?.(100);
    return {
      imageUrl: URL.createObjectURL(file),
      publicId: '',
      mode: 'demo-preview',
      originalBytes: file.size,
    };
  },

  async buildResult(file: File, response: Awaited<ReturnType<typeof uploadToCloudinary>>): Promise<DonationImageUploadResult> {
    const transformedUrl = getCloudinaryUrl(response.secure_url, { width: 800, height: 600 });
    let deliveredBytes: number | undefined;
    try {
      const delivery = await fetch(transformedUrl);
      if (delivery.ok) deliveredBytes = (await delivery.blob()).size;
    } catch {
      deliveredBytes = undefined;
    }

    return {
      imageUrl: response.secure_url,
      publicId: response.public_id,
      mode: 'cloudinary',
      originalBytes: file.size,
      deliveredBytes,
      format: response.format,
      width: response.width,
      height: response.height,
    };
  },
};
