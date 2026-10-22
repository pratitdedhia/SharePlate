import { apiRequest } from './api';
import { uploadToCloudinary } from '../lib/cloudinary';

export interface UploadSignatureResponse {
  success: boolean;
  isConfigured: boolean;
  signature?: string;
  timestamp?: number;
  folder?: string;
  apiKey?: string;
  cloudName?: string;
  message?: string;
  sampleImages?: Array<{ name: string; url: string; publicId: string }>;
}

export const uploadService = {
  async getSignature(): Promise<UploadSignatureResponse> {
    try {
      const res = await apiRequest('/uploads/signature', { method: 'POST' });
      return res;
    } catch {
      return {
        success: true,
        isConfigured: false,
        sampleImages: [
          {
            name: 'Vegetable Biryani',
            url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/biryani',
          },
          {
            name: 'Fresh Chapati & Sabzi',
            url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/roti',
          },
          {
            name: 'Bakery Breads',
            url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/bread',
          },
        ],
      };
    }
  },

  async uploadDonationImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ imageUrl: string; publicId: string }> {
    const signatureData = await this.getSignature();

    if (signatureData.isConfigured && signatureData.signature && signatureData.apiKey && signatureData.cloudName && signatureData.folder) {
      // Perform genuine signed upload directly to Cloudinary
      const res = await uploadToCloudinary(
        file,
        {
          signature: signatureData.signature,
          timestamp: signatureData.timestamp!,
          folder: signatureData.folder,
          apiKey: signatureData.apiKey,
          cloudName: signatureData.cloudName,
        },
        onProgress
      );

      return {
        imageUrl: res.secure_url,
        publicId: res.public_id,
      };
    }

    // Demo/offline mode simulation: simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Create local object URL for preview and assign demo public ID
          const localUrl = URL.createObjectURL(file);
          resolve({
            imageUrl: localUrl,
            publicId: `shareplate/local/${file.name.replace(/\.[^/.]+$/, '')}`,
          });
        }
      }, 100);
    });
  },
};
