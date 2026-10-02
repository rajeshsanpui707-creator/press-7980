import React from 'react';
import { Check, MessageCircle, ArrowRight, Star } from 'lucide-react';
import { ProductItem } from '../../types';
import { FrameMockup } from '../common/FrameMockup';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';

interface ProductCardProps {
  product: ProductItem;
  onOpenFrameConfig?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenFrameConfig,
}) => {
  const isFrame = product.id === 'custom-photo-frames';

  const handleAction = () => {
    if (isFrame && onOpenFrameConfig) {
      onOpenFrameConfig();
    } else {
      const msg = isFrame ? WHATSAPP_MESSAGES.frame : WHATSAPP_MESSAGES.sticker;
      window.open(createWhatsAppLink(msg), '_blank');
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl bg-white transition-all duration-300 ${
        product.isPrimary
          ? 'border-2 border-[#10100F] shadow-lg'
          : 'border border-[#F3F0EA] shadow-sm hover:shadow-md'
      } overflow-hidden`}
    >
      {/* Featured ribbon for primary product */}
      {product.isPrimary && (
        <div className="bg-[#10100F] py-1.5 px-4 text-center text-xs font-semibold text-[#C25E34] tracking-wide uppercase">
          ★ Primary Product · Most Popular Keepsake
        </div>
      )}

      {/* Visual Image Area */}
      <div className="relative bg-[#FCF9F3] p-3 sm:p-8 flex items-center justify-center border-b border-[#F3F0EA] min-h-[160px] sm:min-h-[260px]">
        {isFrame ? (
          <div className="w-full max-w-[150px] sm:max-w-[200px]">
            <FrameMockup
              finish="matte-black"
              sizeLabel="6×8 in"
              title="Classic Portrait"
              category="Archival Matte Finish"
              aspectRatioClass="aspect-[3/4]"
              interactive
              onClick={handleAction}
            />
          </div>
        ) : (
          /* High quality tactile visual illustration for Photo Stickers */
          <div className="w-full max-w-[180px] sm:max-w-[240px] flex flex-col items-center">
            <div className="relative w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-[#FFFDF8] to-[#FCF9F3] border border-[#F3F0EA] p-2.5 sm:p-4 shadow-sm flex flex-col justify-between overflow-hidden">
              {/* Decorative abstract shapes around sticker section in Terracotta */}
              <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 bg-[#C25E34]/20 rounded-full blur-md" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 w-20 h-20 bg-[#C25E34]/15 rounded-full blur-md" />

              <div className="flex items-center justify-between z-10">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#C25E34] font-bold">
                  Satin Vinyl Sheet
                </span>
                <span className="text-[9px] sm:text-[10px] bg-white/90 border border-[#C25E34]/30 rounded px-1.5 py-0.5 font-medium text-[#C25E34]">
                  Waterproof
                </span>
              </div>

              {/* Sample die-cut sticker mock badges with Terracotta accents */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-auto z-10">
                <div className="aspect-square rounded-full bg-white shadow-2xs border border-[#C25E34]/30 flex items-center justify-center text-[9px] sm:text-[10px] font-serif font-bold text-[#10100F]">
                  Trip '26
                </div>
                <div className="aspect-square rounded-md bg-white shadow-2xs border border-[#C25E34]/50 flex items-center justify-center text-[9px] sm:text-[10px] font-serif font-bold text-[#C25E34]">
                  Memory
                </div>
                <div className="aspect-square rounded-full bg-white shadow-2xs border border-[#C25E34]/30 flex items-center justify-center text-[9px] sm:text-[10px] font-serif font-bold text-[#171717]">
                  Smile
                </div>
              </div>

              <div className="text-[9px] sm:text-[10px] text-[#6B6258] text-center z-10 font-mono">
                Die-cut precision · No residue
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details & Copy */}
      <div className="p-3.5 sm:p-8 flex flex-1 flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5 sm:mb-2 flex-wrap sm:flex-nowrap">
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#171717]">
              {product.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="text-[10.5px] sm:text-xs text-[#6B6258] font-sans block">Starting at</span>
              {product.originalStartingPrice && product.originalStartingPrice > product.startingPrice ? (
                <div className="flex flex-col items-end">
                  <span className="text-[10.5px] sm:text-xs text-[#6B6258] line-through font-mono">
                    ₹{product.originalStartingPrice}
                  </span>
                  <span className="font-serif text-lg sm:text-2xl font-bold text-[#C25E34] tabular-nums">
                    ₹{product.startingPrice}
                  </span>
                </div>
              ) : (
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#C25E34] tabular-nums">
                  ₹{product.startingPrice}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6258] leading-relaxed mb-3 sm:mb-6">
            {product.description}
          </p>

          {/* Feature List */}
          <ul className="space-y-1.5 sm:space-y-2 mb-3.5 sm:mb-8 border-t border-[#F3F0EA] pt-3 sm:pt-5">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-start text-xs sm:text-sm text-[#171717]">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#10100F] mr-2 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button (Black button with White text) */}
        <div>
          {product.isPrimary ? (
            <button
              type="button"
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#10100F] hover:bg-[#080807] py-2.5 px-4 sm:py-3.5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
            >
              <span>{product.ctaText}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#10100F] hover:bg-[#080807] py-2.5 px-4 sm:py-3.5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>{product.ctaText}</span>
            </button>
          )}

          {product.specsNote && (
            <p className="mt-2.5 text-center text-xs text-[#6B6258]">
              {product.specsNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
