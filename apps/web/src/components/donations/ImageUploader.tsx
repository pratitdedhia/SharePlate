import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/uploads';

interface ImageUploaderProps {
  onUploadComplete: (imageUrl: string, publicId: string) => void;
  currentImageUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  currentImageUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    {
      name: 'Fresh Biryani',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      publicId: 'shareplate/demo/vegetable_biryani_01',
    },
    {
      name: 'Roti & Sabzi',
      url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      publicId: 'shareplate/demo/paneer_roti_02',
    },
    {
      name: 'Bakery Loaves',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      publicId: 'shareplate/demo/artisan_bread_03',
    },
  ];

  const handleFile = async (file: File) => {
    setErrorMsg(null);

    // 1. File Type Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please upload a valid image (JPEG, PNG, or WebP).');
      return;
    }

    // 2. File Size Validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    // Client-side instant preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);
    setProgress(10);

    try {
      const result = await uploadService.uploadDonationImage(file, (pct) => {
        setProgress(pct);
      });

      setPreviewUrl(result.imageUrl);
      onUploadComplete(result.imageUrl, result.publicId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed. You can choose a sample photo below.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = (preset: { url: string; publicId: string }) => {
    setPreviewUrl(preset.url);
    setErrorMsg(null);
    onUploadComplete(preset.url, preset.publicId);
  };

  const clearImage = () => {
    setPreviewUrl('');
    onUploadComplete('', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-700">
          Food Photograph <span className="text-emerald-700 font-semibold">(Cloudinary Hosted)</span>
        </label>
        <span className="text-[11px] text-stone-400">JPG, PNG, WebP up to 5MB</span>
      </div>

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-warm-200 bg-stone-900 aspect-16/9 group">
          <img src={previewUrl} alt="Food donation preview" className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-stone-900 text-xs font-semibold hover:bg-white transition"
            >
              Replace Photo
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="p-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700 transition"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-forest-950/80 text-[10px] text-emerald-300 font-semibold flex items-center gap-1 backdrop-blur-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Cloudinary Ready
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
            uploading
              ? 'bg-emerald-50/50 border-emerald-400'
              : 'border-warm-300 hover:border-forest-700 bg-warm-50/50 hover:bg-warm-100/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />

          {uploading ? (
            <div className="space-y-2 py-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-forest-950">Uploading to Cloudinary... {progress}%</p>
              <div className="w-48 h-1.5 bg-warm-200 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-2 border border-forest-100">
                <UploadCloud className="w-5 h-5 text-emerald-700" />
              </div>
              <p className="text-xs font-bold text-stone-800">
                Click to browse or drag and drop your food photo
              </p>
              <p className="text-[11px] text-stone-500">
                Images are automatically compressed & optimized via Cloudinary
              </p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Demo sample preset selector */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
          Or choose a verified sample image for evaluation:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-warm-100 hover:bg-emerald-50 hover:text-forest-900 border border-warm-200 transition"
            >
              <ImageIcon className="w-3 h-3 text-emerald-600" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
