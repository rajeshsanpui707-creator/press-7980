import React, { useState, useEffect } from 'react';
import { GalleryItemData } from '../../types';
import { FrameMockup } from '../common/FrameMockup';
import { ZoomIn } from 'lucide-react';
import { getFallbackImageSource } from '../../lib/drive/google-drive';

interface GalleryItemProps {
  item: GalleryItemData;
  index: number;
  onClick: () => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({
  item,
  index,
  onClick,
}) => {
  const [currentSrc, setCurrentSrc] = useState(item.src);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(!item.src);

  useEffect(() => {
    setCurrentSrc(item.src);
    setHasTriedFallback(false);
    setImgError(!item.src);
    setIsLoaded(false);
  }, [item.src]);

  const handleError = () => {
    const fallback = getFallbackImageSource(item.src);
    if (!hasTriedFallback && fallback && fallback !== currentSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(fallback);
    } else {
      setImgError(true);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Inspect ${item.title} (${item.size}) in lightbox`}
      className="group relative flex flex-col items-center justify-between rounded-2xl bg-[#FCF9F3]/60 p-3 sm:p-5 border border-[#F3F0EA] transition-all duration-300 hover:bg-white hover:border-[#10100F]/30 hover:shadow-xs hover:-translate-y-0.5 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-[#10100F]"
    >
      {/* Frame Visual / Image Container */}
      <div className="w-full flex justify-center py-2 sm:py-3">
        <div className="w-full max-w-[210px] transition-transform duration-300 group-hover:scale-105">
          {currentSrc && !imgError ? (
            <div className="relative overflow-hidden rounded-sm bg-gray-100 shadow-sm">
              {!isLoaded && (
                <div className={`absolute inset-0 bg-[#F3EFE6] animate-pulse flex items-center justify-center ${item.aspectRatioClass}`} />
              )}
              <img
                src={currentSrc}
                alt={item.alt}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className={`w-full rounded-sm object-cover transition-opacity duration-300 ${item.aspectRatioClass} ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading={index < 2 ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
              />
            </div>
          ) : (
            <FrameMockup
              finish={item.finish}
              sizeLabel={item.size}
              title={item.title}
              category={item.category}
              aspectRatioClass={item.aspectRatioClass}
            />
          )}
        </div>
      </div>

      {/* Desktop Hover Inspect Hint (No hover dependency on mobile) */}
      <div
        className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#171717] shadow-md">
          <ZoomIn className="h-3.5 w-3.5 text-[#C25E34]" />
          <span>Click to Inspect</span>
        </div>
      </div>

      {/* Item Metadata */}
      <div className="mt-3 w-full border-t border-[#F3F0EA] pt-2.5 text-center">
        <span className="block font-serif text-xs sm:text-sm font-bold text-[#171717] truncate">
          {item.title}
        </span>
        <span className="block text-[11px] text-[#6B6258] font-sans truncate">
          {item.size} · {item.category}
        </span>
      </div>
    </div>
  );
};
