import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle, Instagram } from 'lucide-react';
import { GalleryItemData } from '../../types';
import { FrameMockup } from '../common/FrameMockup';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';
import { getFallbackImageSource } from '../../lib/drive/google-drive';

interface GalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItemData[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onSelectIndex,
}) => {
  const currentItem = items[currentIndex];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Manage body scroll lock & keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelectIndex((currentIndex - 1 + items.length) % items.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelectIndex((currentIndex + 1) % items.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, items.length, onClose, onSelectIndex]);

  const [currentSrc, setCurrentSrc] = React.useState(currentItem?.src);
  const [hasTriedFallback, setHasTriedFallback] = React.useState(false);
  const [imgError, setImgError] = React.useState(!currentItem?.src);

  React.useEffect(() => {
    if (currentItem) {
      setCurrentSrc(currentItem.src);
      setHasTriedFallback(false);
      setImgError(!currentItem.src);
    }
  }, [currentItem, currentIndex]);

  const handleImgError = () => {
    const fallback = getFallbackImageSource(currentItem?.src);
    if (!hasTriedFallback && fallback && fallback !== currentSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(fallback);
    } else {
      setImgError(true);
    }
  };

  if (!isOpen || !currentItem) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex + 1) % items.length);
  };

  const whatsappMessage = WHATSAPP_MESSAGES.galleryInquiry(
    currentItem.title,
    currentItem.size
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onClick={onClose}
    >
      {/* Accessible Close Button */}
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
        aria-label="Close image"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Accessible Previous button */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-1 sm:left-6 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      {/* Accessible Next button */}
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-1 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </button>

      {/* Dialog content card (stops click propagation so clicking backdrop closes) */}
      <div
        className="relative max-w-lg w-full rounded-2xl bg-white p-4 sm:p-8 shadow-2xl overflow-hidden my-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          {/* Framed Mockup with Zoom */}
          <div className="w-full max-w-[270px] sm:max-w-[300px] transition-transform duration-300">
            {currentSrc && !imgError ? (
              <img
                src={currentSrc}
                alt={currentItem.alt}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className={`w-full rounded-md object-cover ${currentItem.aspectRatioClass}`}
                onError={handleImgError}
              />
            ) : (
              <FrameMockup
                finish={currentItem.finish}
                sizeLabel={currentItem.size}
                title={currentItem.title}
                category={currentItem.category}
                aspectRatioClass={currentItem.aspectRatioClass}
              />
            )}
          </div>

          {/* Details & Copy */}
          <div className="mt-6 text-center w-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C25E34]">
              {currentItem.category} · {currentItem.size}
            </span>
            <h3 id="lightbox-title" className="font-serif text-2xl font-bold text-[#171717] mt-1">
              {currentItem.title}
            </h3>
            <p className="mt-2 text-sm text-[#6B6258] leading-relaxed max-w-md mx-auto">
              {currentItem.caption}
            </p>

            {/* Studio Craftsmanship Note */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#6B6258] font-sans">
              <span>Handmade in Bowbazar, Kolkata</span>
              <span aria-hidden="true">·</span>
              <span>Archival Art Print</span>
            </div>

            {/* Direct Conversion Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={createWhatsAppLink(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-5 py-3 text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Order Similar on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="mt-4 text-center text-xs text-zinc-400 font-mono">
          {currentIndex + 1} of {items.length}
        </div>
      </div>
    </div>
  );
};

// Backward-compatibility export
export const LightboxModal = GalleryLightbox;
