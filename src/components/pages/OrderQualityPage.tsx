import React from 'react';
import { FrameSizeId, FrameTierId, FrameFinish } from '../../types';
import { FRAME_SIZE_CONFIGS } from '../../data/products';
import { getFramePrice, formatRupees } from '../../lib/pricing/pricing';
import { Container } from '../layout/Container';
import { OrderProgress } from '../order-flow/OrderProgress';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface QualityOption {
  id: FrameTierId;
  name: string;
  badge?: string;
  detail: string;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: 'good',
    name: 'Standard',
    detail: 'Crisp vibrant prints on 240 GSM resin-coated photo paper with subtle pearl luster. 25+ years display life.',
  },
  {
    id: 'better',
    name: 'Better',
    badge: 'Recommended',
    detail: 'Deep contrast and rich blacks on 280 GSM premium satin paper with silky matte finish. 50+ years display life.',
  },
  {
    id: 'best',
    name: 'Premium',
    badge: 'Heirloom',
    detail: 'Museum-grade 310 GSM 100% cotton rag paper with pigment inks for archival longevity. 100+ years display life.',
  },
];

interface OrderQualityPageProps {
  selectedSize: FrameSizeId;
  selectedFinish: FrameFinish;
  selectedTier: FrameTierId;
  onSelectTier: (tier: FrameTierId) => void;
  onBackToSize: () => void;
  onContinueToReview: () => void;
  onNavigateStep: (stepNumber: 1 | 2 | 3 | 4) => void;
}

export const OrderQualityPage: React.FC<OrderQualityPageProps> = ({
  selectedSize,
  selectedTier,
  onSelectTier,
  onBackToSize,
  onContinueToReview,
  onNavigateStep,
}) => {
  const sizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];

  return (
    <div className="bg-[#FFFDF8] py-3 sm:py-16 min-h-[70vh]">
      <Container size="default">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-2.5 sm:mb-6">
          <button
            type="button"
            onClick={onBackToSize}
            className="inline-flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs sm:text-sm font-semibold text-[#6B6258] hover:text-[#10100F] hover:bg-[#F3F0EA] transition-colors group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
            aria-label="Back to Frame Size"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span>Back to Frame Size</span>
          </button>
        </div>

        {/* Step Progress Header */}
        <OrderProgress
          currentStep={2}
          onNavigateStep={(step) => onNavigateStep(step as 1 | 2 | 3 | 4)}
        />

        {/* Main Content Card */}
        <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3 sm:p-10 shadow-xs">
          {/* Exact Required Page Title */}
          <div className="border-b border-[#F3F0EA] pb-3 sm:pb-5 mb-3.5 sm:mb-8">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block mb-1">
              Step 2 of 4 · Print Quality
            </span>
            <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#171717] tracking-tight">
              Select your print & paper finish
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6258] mt-1 sm:mt-1.5 font-sans">
              All options are printed in-house using 12-color archival pigment inks for {sizeConfig.name} ({sizeConfig.dimensionInches}).
            </p>
          </div>

          {/* 3 Quality Options Only */}
          <div
            role="radiogroup"
            aria-label="Print & paper finish options"
            className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-6 mb-4 sm:mb-8"
          >
            {QUALITY_OPTIONS.map((option) => {
              const isSelected = selectedTier === option.id;
              const tierPrice = getFramePrice(selectedSize, option.id);

              return (
                <div
                  key={option.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onSelectTier(option.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTier(option.id);
                    }
                  }}
                  className={`relative flex flex-col justify-between p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#10100F] ${
                    isSelected
                      ? 'border-2 border-[#10100F] bg-[#FCF9F3] shadow-xs ring-2 ring-[#10100F]/10'
                      : 'border border-[#F3F0EA] bg-white hover:border-[#10100F]/40 hover:bg-[#FCF9F3]/40'
                  }`}
                >
                  <div>
                    {/* Top Row: Radio Indicator & Optional Badge */}
                    <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                      <div
                        className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'border-[#10100F] bg-[#10100F] text-white'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" aria-hidden="true" />}
                      </div>

                      {option.badge && (
                        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C25E34] bg-[#C25E34]/10 px-2 sm:px-2.5 py-0.5 rounded-full">
                          {option.badge}
                        </span>
                      )}
                    </div>

                    {/* Option Title */}
                    <h2 className="font-serif font-bold text-base sm:text-2xl text-[#171717] mb-1 sm:mb-2">
                      {option.name}
                    </h2>

                    {/* 1-2 Lines of Detail */}
                    <p className="text-xs sm:text-sm text-[#6B6258] leading-relaxed mb-2.5 sm:mb-6">
                      {option.detail}
                    </p>
                  </div>

                  {/* Pricing Footer */}
                  <div className="pt-2 sm:pt-4 border-t border-[#F3F0EA] flex items-baseline justify-between">
                    <span className="text-[10.5px] sm:text-xs text-[#6B6258] uppercase font-sans">
                      Frame Total
                    </span>
                    <span className="font-serif text-base sm:text-2xl font-bold text-[#10100F] tabular-nums">
                      {formatRupees(tierPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-3.5 sm:pt-6 border-t border-[#F3F0EA]">
            <button
              type="button"
              onClick={onBackToSize}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#F3F0EA] bg-white px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#171717] hover:bg-[#FCF9F3] transition-colors cursor-pointer min-h-[44px] sm:min-h-[48px] focus-visible:outline-2 focus-visible:outline-[#10100F]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Size</span>
            </button>

            {/* Designated Button: Continue to Review */}
            <button
              type="button"
              onClick={onContinueToReview}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors cursor-pointer min-h-[44px] sm:min-h-[48px] focus-visible:outline-2 focus-visible:outline-[#10100F]"
            >
              <span>Continue to Review</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};
