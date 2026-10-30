import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Zap,
  Info,
  Crop,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { uploadService, UploadResult } from '../../services/uploads';
import {
  isCloudinaryConfigured,
  isUnsignedUploadConfigured,
  measureTransformedDelivery,
  getCloudinaryUrl,
  getAspectRatioPreviews,
  extractAIFoodTags,
  CLOUD_NAME,
} from '../../lib/cloudinary';
import { CLOUDINARY_SEED_PUBLIC_IDS } from '../../lib/mockData';

export interface ImageUploaderProps {
  onUploadComplete: (imageUrl: string, publicId: string, tags?: string[]) => void;
  currentImageUrl?: string;
  onTagSelected?: (tag: string) => void;
}

interface UploadSavingsData {
  originalBytes: number;
  deliveredBytes?: number;
  savingsPercent?: number;
  format?: string;
  dimensions?: string;
  uploadType: string;
  isCloudinary: boolean;
}

type AspectRatioMode = 'card' | 'banner' | 'square';

interface AspectConfig {
  id: AspectRatioMode;
  label: string;
  ratioClass: string;
  width: number;
  height: number;
  description: string;
}

const ASPECT_CONFIGS: AspectConfig[] = [
  {
    id: 'card',
    label: '4:3 Food Card',
    ratioClass: 'aspect-4/3',
    width: 800,
    height: 600,
    description: 'Standard listing card view (c_fill, g_auto)',
  },
  {
    id: 'banner',
    label: '16:9 Banner',
    ratioClass: 'aspect-16/9',
    width: 1200,
    height: 675,
    description: 'Wide desktop hero banner (c_fill, g_auto)',
  },
  {
    id: 'square',
    label: '1:1 Square',
    ratioClass: 'aspect-square',
    width: 400,
    height: 400,
    description: 'Mobile thumbnail avatar (c_fill, g_auto)',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  currentImageUrl,
  onTagSelected,
}) => {
  const [currentPublicId, setCurrentPublicId] = useState<string>('');
  const [activeAspect, setActiveAspect] = useState<AspectRatioMode>('card');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [aspectPreviews, setAspectPreviews] = useState<{ card: string; banner: string; square: string } | null>(null);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savingsInfo, setSavingsInfo] = useState<UploadSavingsData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryConfigured = isCloudinaryConfigured();
  const unsignedConfigured = isUnsignedUploadConfigured();

  const samplePresets = [
    {
      name: 'Fresh Biryani (Sample)',
      publicId: CLOUDINARY_SEED_PUBLIC_IDS[0],
      url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[0], { width: 800, height: 600, crop: 'fill', gravity: 'auto' }),
    },
    {
      name: 'Roti & Sabzi (Sample)',
      publicId: CLOUDINARY_SEED_PUBLIC_IDS[1],
      url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[1], { width: 800, height: 600, crop: 'fill', gravity: 'auto' }),
    },
    {
      name: 'Bakery Loaves (Sample)',
      publicId: CLOUDINARY_SEED_PUBLIC_IDS[2],
      url: getCloudinaryUrl(CLOUDINARY_SEED_PUBLIC_IDS[2], { width: 800, height: 600, crop: 'fill', gravity: 'auto' }),
    },
  ];

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setSavingsInfo(null);
    setCopiedTag(null);

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

    setUploading(true);
    setProgress(15);

    try {
      const result: UploadResult = await uploadService.uploadDonationImage(file, (pct) => {
        setProgress(pct);
      });

      setCurrentPublicId(result.publicId);
      setPreviewUrl(result.imageUrl);
      setAspectPreviews(result.aspectRatios || null);

      const aiTags = result.aiTags || extractAIFoodTags(result.tags || []);
      setDetectedTags(aiTags);

      onUploadComplete(result.imageUrl, result.publicId, aiTags);

      // Measure REAL delivered size if uploaded to Cloudinary
      if (result.isCloudinaryHosted) {
        const measured = await measureTransformedDelivery(
          getCloudinaryUrl(result.publicId, { width: 800, height: 600, crop: 'fill', gravity: 'auto' })
        );

        const delivered = measured?.deliveredBytes;
        const savingsPct =
          delivered && file.size > 0 && delivered < file.size
            ? Math.round(((file.size - delivered) / file.size) * 100)
            : undefined;

        setSavingsInfo({
          originalBytes: file.size,
          deliveredBytes: delivered,
          savingsPercent: savingsPct,
          format: measured?.format || result.format || 'image/webp',
          dimensions: result.width && result.height ? `${result.width}×${result.height}px` : '800×600px',
          uploadType: result.uploadType,
          isCloudinary: true,
        });
      } else {
        setSavingsInfo({
          originalBytes: file.size,
          uploadType: 'local_preview',
          isCloudinary: false,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed. You can select a sample preset below.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = (preset: (typeof samplePresets)[0]) => {
    setCurrentPublicId(preset.publicId);
    setPreviewUrl(preset.url);
    setAspectPreviews(getAspectRatioPreviews(preset.publicId));
    setDetectedTags([]);
    setErrorMsg(null);
    setCopiedTag(null);
    setSavingsInfo({
      originalBytes: 0,
      deliveredBytes: undefined,
      savingsPercent: undefined,
      format: 'image/webp',
      dimensions: '800×600px',
      uploadType: 'seed_asset',
      isCloudinary: isCloudinaryConfigured(),
    });
    onUploadComplete(preset.url, preset.publicId, []);
  };

  const handleAspectChange = (mode: AspectRatioMode) => {
    setActiveAspect(mode);
    if (aspectPreviews && aspectPreviews[mode]) {
      setPreviewUrl(aspectPreviews[mode]);
    } else if (currentPublicId && isCloudinaryConfigured()) {
      const cfg = ASPECT_CONFIGS.find((c) => c.id === mode);
      if (cfg) {
        const transformed = getCloudinaryUrl(currentPublicId, {
          width: cfg.width,
          height: cfg.height,
          crop: 'fill',
          gravity: 'auto',
          format: 'auto',
          quality: 'auto',
        });
        setPreviewUrl(transformed);
      }
    }
  };

  const handleTagClick = (tag: string) => {
    navigator.clipboard?.writeText(tag);
    setCopiedTag(tag);
    if (onTagSelected) {
      onTagSelected(tag);
    }
    setTimeout(() => {
      setCopiedTag((prev) => (prev === tag ? null : prev));
    }, 2000);
  };

  const clearImage = () => {
    setCurrentPublicId('');
    setPreviewUrl('');
    setAspectPreviews(null);
    setDetectedTags([]);
    setSavingsInfo(null);
    setCopiedTag(null);
    onUploadComplete('', '', []);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentAspectConfig = ASPECT_CONFIGS.find((c) => c.id === activeAspect) || ASPECT_CONFIGS[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-stone-700">
          Food Photograph <span className="text-emerald-700 font-semibold">(Cloudinary Hosted)</span>
        </label>
        <span className="text-[11px] text-stone-400">Auto WebP • Auto Crop • AI Tagging</span>
      </div>

      {/* Cloudinary configuration alert banner if unconfigured */}
      {!unsignedConfigured && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block">Cloudinary Live Upload Configuration Required:</strong>
            {!cloudinaryConfigured ? (
              <p className="leading-relaxed">
                Live image uploads require a Cloudinary cloud name and unsigned upload preset. Configure{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_CLOUDINARY_CLOUD_NAME</code>{' '}
                and{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_CLOUDINARY_UPLOAD_PRESET</code>{' '}
                in your <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> or deployment variables. Unsigned upload presets allow secure browser uploads without exposing API secrets. You can test live auto-crop and transformations right now via the sample seed assets below, or continue uploading locally for demo preview.
              </p>
            ) : (
              <p className="leading-relaxed">
                Cloud name configured (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">{CLOUD_NAME}</code>), but{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_CLOUDINARY_UPLOAD_PRESET</code>{' '}
                is missing. Create an unsigned upload preset in your Cloudinary Dashboard (<strong>Settings &gt; Upload &gt; Upload Presets &gt; Signing Mode: Unsigned</strong>) to enable live browser uploads.
              </p>
            )}
          </div>
        </div>
      )}

      {previewUrl ? (
        <div className="space-y-3">
          {/* Aspect Ratio Switcher Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-warm-100 border border-warm-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-stone-700">
              <Crop className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Crop (g_auto):</span>
            </div>
            <div className="flex items-center gap-1">
              {ASPECT_CONFIGS.map((config) => (
                <button
                  key={config.id}
                  type="button"
                  onClick={() => handleAspectChange(config.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeAspect === config.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-warm-200 border border-warm-300'
                  }`}
                  title={config.description}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Visual Image Preview Container */}
          <div className={`relative rounded-2xl overflow-hidden border border-warm-200 bg-stone-950 ${currentAspectConfig.ratioClass} group transition-all duration-300`}>
            <img
              src={previewUrl}
              alt="Food donation preview"
              className="w-full h-full object-cover transition duration-300"
            />

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-lg bg-white/95 text-stone-900 text-xs font-bold hover:bg-white transition cursor-pointer shadow-md"
              >
                Replace Photo
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="p-2 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700 transition cursor-pointer shadow-md"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Transformation Badges */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[85%]">
              <span className="px-2 py-0.5 rounded-md bg-forest-950/85 text-[10px] text-emerald-300 font-bold backdrop-blur-xs border border-emerald-500/20 flex items-center gap-1 shadow-xs">
                <Zap className="w-3 h-3 text-emerald-400" /> f_auto (WebP)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-forest-950/85 text-[10px] text-emerald-300 font-bold backdrop-blur-xs border border-emerald-500/20 flex items-center gap-1 shadow-xs">
                🎯 q_auto
              </span>
              <span className="px-2 py-0.5 rounded-md bg-forest-950/85 text-[10px] text-emerald-300 font-bold backdrop-blur-xs border border-emerald-500/20 flex items-center gap-1 shadow-xs">
                📐 g_auto Focus
              </span>
            </div>

            {/* Hosting Provenance Badge */}
            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-forest-950/85 text-[10px] text-emerald-300 font-semibold flex items-center gap-1.5 backdrop-blur-xs border border-emerald-500/20">
              {savingsInfo?.uploadType === 'seed_asset' ? (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Preloaded Sample Asset (Cloudinary CDN)</span>
                </>
              ) : savingsInfo?.isCloudinary ? (
                <>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Cloudinary Live ({savingsInfo.uploadType.replace('_', ' ')})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Demo preview — local object URL</span>
                </>
              )}
            </div>
          </div>

          {/* AI Food Tagging Assistant Component */}
          {detectedTags.length > 0 ? (
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Cloudinary AI Visual Tags:
                </span>
                <span className="text-[10px] font-normal text-amber-700">Click to copy tag</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detectedTags.map((tag) => {
                  const isCopied = copiedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        isCopied
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                      title="Click to copy tag"
                    >
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{tag}</span>
                      {isCopied ? (
                        <Check className="w-3 h-3 text-white ml-0.5" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-amber-500 ml-0.5 opacity-60" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-amber-800/80 italic pt-1 border-t border-amber-200/60">
                Note: AI tags are generated for image cataloging and search. They do not certify food safety or hygiene; all food safety information is donor-provided and must be inspected upon handoff.
              </p>
            </div>
          ) : savingsInfo?.isCloudinary && savingsInfo?.uploadType !== 'seed_asset' ? (
            <div className="p-2.5 rounded-xl bg-warm-50 border border-warm-200 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">AI Food Recognition:</span> No automatic tags returned by Cloudinary API (requires Google Auto-Tagging add-on). Food condition and safety must be verified in person at handoff.
            </div>
          ) : null}

          {/* Genuine Measured Savings Strip */}
          {savingsInfo && savingsInfo.isCloudinary && (
            savingsInfo.uploadType === 'seed_asset' ? (
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-forest-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preloaded Cloudinary Evaluation Asset:</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Delivered dynamically via Cloudinary CDN with automatic format transcoding (<code className="font-mono text-emerald-700">f_auto, q_auto</code>) and smart content-aware crop (<code className="font-mono text-emerald-700">g_auto</code>). Bandwidth savings percentages are calculated only on live uploaded files.
                </p>
              </div>
            ) : savingsInfo.deliveredBytes && savingsInfo.savingsPercent !== undefined ? (
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5 text-forest-950">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> Measured Cloudinary Optimization:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-forest-900 font-extrabold text-[11px]">
                    {savingsInfo.savingsPercent}% Bandwidth Saved
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-stone-600">
                  <div>
                    <span className="block text-stone-400">Original File:</span>
                    <strong className="text-stone-800">{(savingsInfo.originalBytes / 1024).toFixed(1)} KB</strong>
                  </div>
                  <div>
                    <span className="block text-stone-400">Delivered (WebP):</span>
                    <strong className="text-emerald-800 font-black">
                      {(savingsInfo.deliveredBytes / 1024).toFixed(1)} KB
                    </strong>
                  </div>
                  <div>
                    <span className="block text-stone-400">Target Format:</span>
                    <strong className="text-stone-800">{savingsInfo.format || 'image/webp'}</strong>
                  </div>
                  <div>
                    <span className="block text-stone-400">Aspect & Focus:</span>
                    <strong className="text-stone-800">{currentAspectConfig.label} (g_auto)</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-warm-100 border border-warm-200 text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Transformed delivery active:</span> Cloudinary dynamic delivery enabled (<code className="font-mono">f_auto, q_auto</code>). Bandwidth savings calculation unavailable (measurement fetch prevented by network or CORS).
              </div>
            )
          )}

          {savingsInfo && !savingsInfo.isCloudinary && (
            <div className="p-2.5 rounded-xl bg-warm-100 border border-warm-200 text-xs text-stone-600">
              <span className="font-semibold text-stone-800">Local demo preview:</span> File size is{' '}
              {(savingsInfo.originalBytes / 1024).toFixed(1)} KB. Interactive auto-crop preview demonstrates content framing before deployment.
            </div>
          )}
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
              <p className="text-xs font-semibold text-forest-950">
                {unsignedConfigured ? 'Uploading to Cloudinary CDN (c_fill, g_auto, f_auto)...' : 'Processing Photo...'} {progress}%
              </p>
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
                Cloudinary smart auto-crop (<code className="font-mono text-emerald-700">g_auto</code>), format optimization (<code className="font-mono text-emerald-700">f_auto</code>), and AI tagging
              </p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block font-semibold">Upload Error</strong>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Seed sample preset selector */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
          Or select an evaluation seed asset with Cloudinary auto-crop (g_auto) & responsive delivery:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-warm-100 hover:bg-emerald-50 hover:text-forest-900 border border-warm-200 transition cursor-pointer"
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
