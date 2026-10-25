import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../services/api';
import { uploadService } from '../services/uploads';

vi.mock('../services/api', () => ({
  apiRequest: vi.fn(),
}));

const requests: Array<{ url: string; formData: FormData }> = [];

class MockXMLHttpRequest {
  status = 200;
  statusText = 'OK';
  responseText = '';
  upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  url = '';

  open(_method: string, url: string) {
    this.url = url;
  }

  send(formData: FormData) {
    requests.push({ url: this.url, formData });
    this.responseText = JSON.stringify({
      secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/shareplate/test-image.jpg',
      public_id: 'shareplate/test-image',
      bytes: 5,
      format: 'jpg',
      width: 800,
      height: 600,
    });
    this.onload?.();
  }
}

describe('Cloudinary upload fallback order', () => {
  beforeEach(() => {
    requests.length = 0;
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['small']),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('uses signed upload when the API returns configured signature data', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      success: true,
      isConfigured: true,
      signature: 'signed-value',
      timestamp: 123,
      folder: 'shareplate/donations/test-user',
      apiKey: 'public-key',
      cloudName: 'signed-cloud',
    });

    const file = new File(['image'], 'meal.jpg', { type: 'image/jpeg' });
    const result = await uploadService.uploadDonationImage(file);

    expect(requests[0].url).toBe('https://api.cloudinary.com/v1_1/signed-cloud/image/upload');
    expect(requests[0].formData.get('signature')).toBe('signed-value');
    expect(result.mode).toBe('cloudinary');
    expect(result.publicId).toBe('shareplate/test-image');
  });

  it('uses the unsigned preset when the signature API is unavailable', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('API unavailable'));
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'test-cloud');
    vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', 'public-preset');

    const file = new File(['image'], 'meal.jpg', { type: 'image/jpeg' });
    const result = await uploadService.uploadDonationImage(file);

    expect(requests[0].url).toBe('https://api.cloudinary.com/v1_1/test-cloud/image/upload');
    expect(requests[0].formData.get('upload_preset')).toBe('public-preset');
    expect(requests[0].formData.get('tags')).toBe('shareplate,food-donation');
    expect(requests[0].formData.get('context')).toContain('source=shareplate');
    expect(result.mode).toBe('cloudinary');
  });

  it('uses a local preview when no Cloudinary upload path is configured', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('API unavailable'));
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', '');
    vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', '');
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn().mockReturnValue('blob:local-preview'),
    });

    const file = new File(['image'], 'meal.jpg', { type: 'image/jpeg' });
    const result = await uploadService.uploadDonationImage(file);

    expect(requests).toHaveLength(0);
    expect(result.mode).toBe('demo-preview');
    expect(result.imageUrl).toBe('blob:local-preview');
    expect(result.publicId).toBe('');
  });
});
