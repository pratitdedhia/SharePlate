import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadService } from '../services/uploads';
import * as cloudinaryModule from '../lib/cloudinary';

describe('Upload Service Fallback Order & Safety Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects files exceeding 5MB client-side limit', async () => {
    const hugeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'huge.jpg', {
      type: 'image/jpeg',
    });

    await expect(uploadService.uploadDonationImage(hugeFile)).rejects.toThrow(
      /exceeds the 5 MB limit/i
    );
  });

  it('rejects unapproved file MIME types', async () => {
    const textFile = new File(['hello'], 'document.txt', {
      type: 'text/plain',
    });

    await expect(uploadService.uploadDonationImage(textFile)).rejects.toThrow(
      /unsupported image format/i
    );
  });

  it('prefers signed upload when backend signature endpoint is configured', async () => {
    const validFile = new File(['valid'], 'meal.jpg', { type: 'image/jpeg' });

    vi.spyOn(uploadService, 'getSignature').mockResolvedValue({
      success: true,
      isConfigured: true,
      signature: 'mock_sig_123',
      timestamp: 1700000000,
      folder: 'shareplate/donations',
      apiKey: 'mock_api_key',
      cloudName: 'test-cloud',
    });

    vi.spyOn(cloudinaryModule, 'uploadToCloudinary').mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/mock.jpg',
      public_id: 'shareplate/donations/mock_signed',
      format: 'jpg',
      bytes: 12345,
      width: 800,
      height: 600,
    });

    const result = await uploadService.uploadDonationImage(validFile);

    expect(result.uploadType).toBe('signed_cloudinary');
    expect(result.isCloudinaryHosted).toBe(true);
    expect(result.publicId).toBe('shareplate/donations/mock_signed');
    expect(result.imageUrl).toContain('res.cloudinary.com');
    expect(result.aspectRatios).toBeDefined();
    expect(result.aspectRatios?.card).toContain('c_fill');
    expect(result.aspectRatios?.card).toContain('g_auto');
    expect(result.aiTags).toBeDefined();
  });

  it('falls back to unsigned upload preset when backend is unreachable but preset is configured', async () => {
    const validFile = new File(['valid'], 'meal.jpg', { type: 'image/jpeg' });

    // Backend endpoint unreachable
    vi.spyOn(uploadService, 'getSignature').mockResolvedValue({
      success: false,
      isConfigured: false,
    });

    vi.spyOn(cloudinaryModule, 'isUnsignedUploadConfigured').mockReturnValue(true);

    vi.spyOn(cloudinaryModule, 'uploadToCloudinaryUnsigned').mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/unsigned_mock.webp',
      public_id: 'shareplate/donations/mock_unsigned',
      format: 'webp',
      bytes: 8400,
      width: 800,
      height: 600,
    });

    const result = await uploadService.uploadDonationImage(validFile);

    expect(result.uploadType).toBe('unsigned_cloudinary');
    expect(result.isCloudinaryHosted).toBe(true);
    expect(result.publicId).toBe('shareplate/donations/mock_unsigned');
  });

  it('falls back to labeled local preview when neither signed nor unsigned is configured', async () => {
    const validFile = new File(['valid'], 'meal.jpg', { type: 'image/jpeg' });

    vi.spyOn(uploadService, 'getSignature').mockResolvedValue({
      success: false,
      isConfigured: false,
    });

    vi.spyOn(cloudinaryModule, 'isUnsignedUploadConfigured').mockReturnValue(false);

    // Mock createObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');

    const result = await uploadService.uploadDonationImage(validFile);

    expect(result.uploadType).toBe('local_preview');
    expect(result.isCloudinaryHosted).toBe(false);
    expect(result.notes).toContain('not uploaded to Cloudinary');
    expect(result.imageUrl).toBe('blob:http://localhost/mock-uuid');
  });
});
