import React, { useState } from 'react';
import {
  getCloudinaryUrl,
  getCloudinarySrcSet,
  isCloudinaryUrl,
  DEFAULT_FALLBACK_IMAGE,
  CloudinaryTransformOptions,
} from '../../lib/cloudinary';
import { Sparkles } from 'lucide-react';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  publicId?: string | null;
  src?: string;
  alt: string;
  fallbackSrc?: string;
  transformOptions?: CloudinaryTransformOptions;
  showBadge?: boolean;
  containerClassName?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  publicId,
  src: propSrc,
  alt,
  fallbackSrc,
  transformOptions = {},
  showBadge = false,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden',
  loading = 'lazy',
  ...rest
}) => {
  const targetIdOrUrl = publicId || propSrc;
  const isSeedAsset = typeof targetIdOrUrl === 'string' && targetIdOrUrl.startsWith('shareplate/seed/');
  const targetFallback = fallbackSrc || (typeof propSrc === 'string' && propSrc.startsWith('http') ? propSrc : DEFAULT_FALLBACK_IMAGE);

  // For unseeded demo environments, mock seed IDs only exist via fallback Unsplash imagery
  const initialUrl = isSeedAsset
    ? targetFallback
    : getCloudinaryUrl(targetIdOrUrl, {
        width: 800,
        height: 600,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        format: 'auto',
        ...transformOptions,
      });

  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [hasError, setHasError] = useState<boolean>(false);

  const srcSet = !hasError && !isSeedAsset
    ? getCloudinarySrcSet(targetIdOrUrl, [400, 800, 1200], transformOptions)
    : undefined;
  const isCdnServed = !isSeedAsset && isCloudinaryUrl(currentSrc);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(targetFallback);
    }
  };

  return (
    <div className={containerClassName}>
      <img
        key={hasError ? 'fallback' : 'primary'}
        src={currentSrc}
        srcSet={srcSet || undefined}
        sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
        alt={alt}
        loading={loading}
        onError={handleError}
        className={className}
        {...rest}
      />

      {/* Cloudinary Badge: Strictly shown ONLY when genuinely served from res.cloudinary.com */}
      {showBadge && isCdnServed && (
        <div className="absolute bottom-3 left-3 bg-forest-950/85 text-emerald-300 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-emerald-500/20">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Cloudinary Optimized</span>
        </div>
      )}
    </div>
  );
};
