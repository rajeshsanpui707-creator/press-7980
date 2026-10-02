import React from 'react';
import { FrameSizeId, FrameFinish } from '../../types';
import { FRAME_SIZE_CONFIGS, FRAME_FINISHES } from '../../data/products';
import { Check, ArrowRight } from 'lucide-react';
import { FrameMockup } from '../common/FrameMockup';
import { getFrameDiscountInfo } from '../../lib/pricing/pricing';

interface FrameStepProps {
  selectedSize: FrameSizeId;
  selectedFinish: FrameFinish;
  onSelectSize: (size: FrameSizeId) => void;
  onSelectFinish: (finish: FrameFinish) => void;
  onContinue: () => void;
}

export const FrameStep: React.FC<FrameStepProps> = ({
  selectedSize,
  selectedFinish,
  onSelectSize,
  onSelectFinish,
  onContinue,
}) => {
  const currentSizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];

  return (
    <div className="w-full flex flex-col space-y-3.5 sm:space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-1 border-b border-[#F3F0EA] pb-2 sm:pb-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block">
            Step 1 of 4
          </span>
          <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#171717]">
            Choose your frame size
          </h3>
        </div>
        <p className="text-[11px] sm:text-xs text-[#6B6258] font-sans">
          All sizes include high-definition photo print
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-start">
        {/* Left Visual Preview on Desktop & Tablet */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-[#FCF9F3] border border-[#F3F0EA]">
          <div className="w-full max-w-[155px] sm:max-w-[210px] lg:max-w-[230px] my-0.5 sm:my-1">
            <FrameMockup
              finish={selectedFinish}
              sizeLabel={currentSizeConfig.name}
              title="Bespoke Frame"
              category={currentSizeConfig.recommendedFor}
              aspectRatioClass={currentSizeConfig.aspectRatio}
            />
          </div>

          <div className="mt-2 text-center">
            <span className="font-serif font-bold text-xs sm:text-sm text-[#171717] block leading-tight">
              {currentSizeConfig.name} {currentSizeConfig.dimensionCm && `(${currentSizeConfig.dimensionCm.split('(')[0].trim()})`}
            </span>
            <span className="text-[11px] sm:text-xs text-[#6B6258] block leading-tight mt-0.5">
              {currentSizeConfig.recommendedFor}
            </span>
          </div>

          {/* Craftsmanship Stamp */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EFE6] border border-[#E5DFD5] text-[10px] text-[#6B6258] font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C25E34]" />
            <span>Handmade in Bowbazar, Kolkata</span>
          </div>

          {/* Compact Finish Swatches (32-36px circles, 8-10px gap, compact padding) */}
          <div className="mt-3 pt-2.5 border-t border-[#F3F0EA] w-full">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#6B6258] block text-center mb-1.5 sm:mb-2">
              Frame Finish: <span className="text-[#171717] font-bold">{FRAME_FINISHES.find(f => f.id === selectedFinish)?.name}</span>
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {FRAME_FINISHES.map((finish) => {
                const isSelected = selectedFinish === finish.id;
                return (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => onSelectFinish(finish.id)}
                    className={`w-[34px] h-[34px] sm:w-8 sm:h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#10100F] ring-2 ring-[#10100F]/30 scale-105'
                        : 'border-zinc-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: finish.hex }}
                    aria-label={`Select ${finish.name} finish`}
                    title={finish.name}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white shadow-2xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Redesigned Compact Selection Cards */}
        <div className="lg:col-span-7 flex flex-col space-y-2 sm:space-y-3">
          <div
            role="radiogroup"
            aria-label="Frame size options"
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            {FRAME_SIZE_CONFIGS.map((size) => {
              const isSelected = selectedSize === size.id;
              const info = getFrameDiscountInfo(size.id);
              const cmClean = size.dimensionCm
                ? size.dimensionCm.split('(')[0].trim()
                : (size.dimensionInches || '');
              const hasBadge = Boolean(size.isPopular || size.popular || size.badge);
              const badgeText = size.badge || (size.isPopular || size.popular ? 'Most Popular' : '');

              return (
                <button
                  key={size.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectSize(size.id)}
                  className={`group relative flex flex-col justify-between p-2 sm:p-2.5 rounded-xl text-center transition-all duration-150 cursor-pointer min-h-[165px] sm:min-h-[185px] focus-visible:outline-2 focus-visible:outline-[#10100F] ${
                    isSelected
                      ? 'border-2 border-[#10100F] bg-[#F8F5EE] shadow-sm ring-1 ring-[#10100F]/20'
                      : 'border border-[#E5E0D5] bg-white hover:border-[#10100F]/40 hover:bg-[#FAF8F3]'
                  }`}
                >
                  {/* Top Bar: Badge (Dynamic from CMS) & High-contrast Radio indicator */}
                  <div className="flex items-center justify-between w-full min-h-[20px] px-0.5 mb-1">
                    <div className="min-w-[60px] text-left">
                      {hasBadge && (
                        <span className="inline-flex items-center text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-[#C25E34] bg-[#C25E34]/10 border border-[#C25E34]/25 px-1.5 py-0.5 rounded-full leading-none">
                          {badgeText}
                        </span>
                      )}
                    </div>

                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? 'border-[#10100F] bg-[#10100F] text-white shadow-2xs'
                          : 'border-zinc-300 bg-white group-hover:border-[#10100F]'
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-2.5 w-2.5 stroke-[3]" aria-hidden="true" />
                      )}
                    </div>
                  </div>

                  {/* Visual Framed Preview: Outer Frame + Inner Mat + Centered Photo Area */}
                  <div className="w-full flex items-center justify-center my-0.5 sm:my-1">
                    {/* Outer Frame: Thick dark border, depth, shadow */}
                    <div className="w-[82px] sm:w-[94px] p-[5px] sm:p-[6px] rounded-[3px] bg-[#1a1714] border border-[#2b2521] shadow-[0_3px_8px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                      {/* Inner Mat: Clean white/ivory matboard */}
                      <div className="w-full p-[4px] sm:p-[5px] bg-[#FAF8F5] rounded-[1.5px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.14)] flex items-center justify-center">
                        {/* Centered Photo Area: Soft artistic photograph representation */}
                        <div
                          className={`w-full ${size.aspectRatio || 'aspect-[3/4]'} max-h-[64px] sm:max-h-[72px] rounded-[1px] overflow-hidden bg-gradient-to-tr from-[#2d2823] via-[#524941] to-[#7d736a] relative shadow-[inset_0_0_4px_rgba(0,0,0,0.35)] flex items-center justify-center`}
                        >
                          {/* Artwork aesthetic: Subtle warm landscape / gradient vignette */}
                          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-black" />
                          <div className="relative text-[9px] text-[#EFEBE4]/75 font-serif italic select-none">
                            Photo
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Underneath: Size Label & Dimensions */}
                  <div className="w-full text-center mt-1">
                    <span className="font-serif text-[15px] sm:text-base font-bold text-[#171717] leading-tight block truncate">
                      {size.name}
                    </span>
                    <span className="text-[11px] sm:text-[11.5px] text-[#78716C] font-mono leading-tight block mt-0.5">
                      {cmClean}
                    </span>
                  </div>

                  {/* Bottom: Proportional Starting Price */}
                  <div className="flex items-baseline justify-center gap-1 pt-1.5 border-t border-[#EFECE5] mt-1.5 w-full text-center">
                    <span className="text-[10px] sm:text-[10.5px] text-[#78716C] uppercase tracking-wider leading-none font-medium">
                      Starting
                    </span>
                    {info.hasDiscount && (
                      <span className="text-[10px] sm:text-[11px] text-[#78716C] line-through font-mono leading-none">
                        ₹{info.originalPrice}
                      </span>
                    )}
                    <span className="font-serif text-[15px] sm:text-base font-bold text-[#C25E34] tabular-nums leading-tight">
                      ₹{info.sellingPrice}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue CTA (Black button with White text, ~52-56px height) */}
          <div className="pt-2 sm:pt-4 flex justify-end">
            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-6 sm:px-7 h-[52px] sm:h-[54px] min-h-[52px] text-sm sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer"
            >
              <span>Continue to Quality</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
