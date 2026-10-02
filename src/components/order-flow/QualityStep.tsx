import React from 'react';
import { FrameSizeId, FrameTierId } from '../../types';
import { FRAME_TIER_CONFIGS } from '../../data/products';
import { getFramePrice, formatRupees } from '../../lib/pricing/pricing';
import { Check, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface QualityStepProps {
  selectedSize: FrameSizeId;
  selectedTier: FrameTierId;
  onSelectTier: (tier: FrameTierId) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const QualityStep: React.FC<QualityStepProps> = ({
  selectedSize,
  selectedTier,
  onSelectTier,
  onBack,
  onContinue,
}) => {
  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F3F0EA] pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block">
            Step 2 of 4
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171717]">
            Select your print & paper finish
          </h3>
        </div>
        <p className="text-xs text-[#6B6258] font-sans">
          All papers printed with 12-color archival pigment inks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FRAME_TIER_CONFIGS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          const tierPrice = getFramePrice(selectedSize, tier.id);

          return (
            <div
              key={tier.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTier(tier.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTier(tier.id);
                }
              }}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? 'border-2 border-[#10100F] bg-[#FCF9F3] shadow-xs'
                  : 'border border-[#F3F0EA] bg-white hover:border-[#10100F]/30 hover:bg-[#FCF9F3]/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-[#10100F] bg-[#10100F] text-white'
                        : 'border-zinc-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  {tier.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C25E34] bg-[#C25E34]/10 px-2 py-0.5 rounded-full">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-lg text-[#171717] mb-1">
                  {tier.name}
                </h4>

                <p className="text-xs text-[#6B6258] leading-relaxed mb-4">
                  {tier.description}
                </p>

                <div className="space-y-1.5 text-xs text-[#171717] pt-3 border-t border-[#F3F0EA]">
                  <div className="flex justify-between">
                    <span className="text-[#6B6258]">Paper Stock:</span>
                    <span className="font-medium">{tier.paperType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6258]">Surface:</span>
                    <span className="font-medium">{tier.finish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6258]">Longevity:</span>
                    <span className="font-medium text-[#C25E34]">{tier.longevity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#F3F0EA] flex items-center justify-between">
                <span className="text-xs text-[#6B6258]">Frame Total</span>
                <span className="font-serif text-lg font-bold text-[#10100F]">
                  {formatRupees(tierPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F3F0EA]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-[#F3F0EA] bg-white px-5 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#FCF9F3] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Size</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-[#10100F] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#2A2927] shadow-xs transition-colors cursor-pointer"
        >
          <span>Continue to Review</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
