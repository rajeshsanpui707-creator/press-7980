import React from 'react';
import { FrameSizeId, FrameTierId, FrameFinish } from '../../types';
import { FRAME_SIZE_CONFIGS, FRAME_TIER_CONFIGS, FRAME_FINISHES } from '../../data/products';
import { getFramePrice, formatRupees } from '../../lib/pricing/pricing';
import { Container } from '../layout/Container';
import { OrderProgress } from '../order-flow/OrderProgress';
import { ArrowLeft, ArrowRight, Minus, Plus, Edit2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OrderReviewPageProps {
  selectedSize: FrameSizeId;
  selectedTier: FrameTierId;
  selectedFinish: FrameFinish;
  quantity: number;
  requirements?: string;
  onChangeQuantity: (qty: number) => void;
  onChangeRequirements?: (req: string) => void;
  onBackToQuality: () => void;
  onModifySpecs: () => void;
  onContinueToDelivery: () => void;
  onNavigateStep: (stepNumber: 1 | 2 | 3 | 4) => void;
}

export const OrderReviewPage: React.FC<OrderReviewPageProps> = ({
  selectedSize,
  selectedTier,
  selectedFinish,
  quantity,
  requirements,
  onChangeQuantity,
  onChangeRequirements,
  onBackToQuality,
  onModifySpecs,
  onContinueToDelivery,
  onNavigateStep,
}) => {
  const sizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];
  const tierConfig = FRAME_TIER_CONFIGS.find((t) => t.id === selectedTier) || FRAME_TIER_CONFIGS[1];
  const finishConfig = FRAME_FINISHES.find((f) => f.id === selectedFinish) || FRAME_FINISHES[0];

  const unitPrice = getFramePrice(selectedSize, selectedTier);
  const totalPrice = unitPrice * quantity;

  return (
    <div className="bg-[#FFFDF8] py-3 sm:py-16 min-h-[70vh]">
      <Container size="default">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-2.5 sm:mb-6">
          <button
            type="button"
            onClick={onBackToQuality}
            className="inline-flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs sm:text-sm font-semibold text-[#6B6258] hover:text-[#10100F] hover:bg-[#F3F0EA] transition-colors group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
            aria-label="Back to Paper Finish"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span>Back to Paper Finish</span>
          </button>
        </div>

        {/* Step Progress Header */}
        <OrderProgress
          currentStep={3}
          onNavigateStep={(step) => onNavigateStep(step as 1 | 2 | 3 | 4)}
        />

        {/* Main Content Card */}
        <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3 sm:p-10 shadow-xs">
          {/* Header */}
          <div className="border-b border-[#F3F0EA] pb-3 sm:pb-5 mb-3.5 sm:mb-8">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block mb-1">
              Step 3 of 4 · Order Summary
            </span>
            <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-[#171717] tracking-tight">
              Review your frame specifications
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6258] mt-1 sm:mt-1.5 font-sans">
              Review your custom frame dimensions, paper quality, moulding and quantity before entering delivery details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 mb-3.5 sm:mb-8">
            {/* Specs Summary Card */}
            <div className="lg:col-span-7 rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-[#FCF9F3] p-3 sm:p-7 flex flex-col justify-between space-y-3 sm:space-y-5">
              <div>
                <div className="flex items-center justify-between pb-2.5 sm:pb-3.5 border-b border-[#F3F0EA]">
                  <div>
                    <span className="font-serif font-bold text-sm sm:text-xl text-[#171717] block">
                      Custom Photo Frame
                    </span>
                    <span className="text-xs sm:text-sm text-[#6B6258]">
                      {sizeConfig.name} ({sizeConfig.dimensionInches})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onModifySpecs}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] hover:text-[#C25E34] underline cursor-pointer p-1"
                    title="Change Frame Size or Finish"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Modify</span>
                  </button>
                </div>

                <div className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm pt-2.5 sm:pt-4">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6B6258]">Frame Moulding:</span>
                    <span className="font-semibold text-[#171717]">{finishConfig.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6B6258]">Paper Quality:</span>
                    <span className="font-semibold text-[#171717]">{tierConfig.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6B6258]">Dimensions:</span>
                    <span className="font-mono text-[#171717]">{sizeConfig.dimensionInches} ({sizeConfig.dimensionCm})</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6B6258]">Protective Glass:</span>
                    <span className="font-medium text-[#171717]">Anti-glare crystal glass included</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-[#6B6258]">Orientation:</span>
                    <span className="font-medium text-[#171717]">Portrait & Landscape dual hanging</span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-3">
                  <label htmlFor="frame-review-requirements" className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1">
                    Special Requirements or Notes <span className="text-[#6B6258] font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    id="frame-review-requirements"
                    rows={2}
                    value={requirements || ''}
                    onChange={(e) => onChangeRequirements?.(e.target.value)}
                    placeholder="e.g. Photo orientation preference, custom border margin, text overlay..."
                    className="w-full rounded-lg border border-[#F3F0EA] bg-white py-2 px-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F] resize-none"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#F3F0EA] flex items-center gap-2 text-[10.5px] sm:text-xs text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600" />
                <span>Includes 100% free digital WhatsApp preview prior to print production.</span>
              </div>
            </div>

            {/* Pricing & Quantity Card */}
            <div className="lg:col-span-5 rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3 sm:p-7 flex flex-col justify-between space-y-3.5 sm:space-y-6">
              <div className="space-y-2.5 sm:space-y-4">
                <span className="font-serif font-bold text-sm sm:text-lg text-[#171717] block">
                  Select Order Quantity
                </span>

                <div className="flex items-center justify-between p-2 sm:p-3.5 rounded-xl border border-[#F3F0EA] bg-[#FCF9F3]/60">
                  <span className="text-xs sm:text-sm font-medium text-[#6B6258]">Quantity</span>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
                      className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-[#F3F0EA] bg-white text-[#171717] hover:bg-[#F3F0EA] disabled:opacity-40 cursor-pointer transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <span className="font-mono font-bold text-sm sm:text-base text-[#171717] w-6 sm:w-7 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(quantity + 1)}
                      className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-[#F3F0EA] bg-white text-[#171717] hover:bg-[#F3F0EA] cursor-pointer transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#6B6258]">
                    <span>Unit Price:</span>
                    <span className="font-mono font-medium text-[#171717]">{formatRupees(unitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B6258]">
                    <span>Shipping in Kolkata:</span>
                    <span className="font-semibold text-emerald-700">Free / Included</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 sm:pt-4 border-t border-[#F3F0EA]">
                <div className="flex items-baseline justify-between mb-3 sm:mb-5">
                  <span className="font-serif font-bold text-sm sm:text-base text-[#171717]">Total Amount:</span>
                  <span className="font-serif text-lg sm:text-3xl font-bold text-[#C25E34] tabular-nums">
                    {formatRupees(totalPrice)}
                  </span>
                </div>

                {/* Designated Button: Enter Delivery Details */}
                <button
                  type="button"
                  onClick={onContinueToDelivery}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] py-2.5 sm:py-3.5 px-4 sm:px-5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors cursor-pointer min-h-[44px] sm:min-h-[48px] focus-visible:outline-2 focus-visible:outline-[#10100F]"
                >
                  <span>Enter Delivery Details</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-3.5 border-t border-[#F3F0EA]">
            <button
              type="button"
              onClick={onBackToQuality}
              className="inline-flex items-center gap-2 rounded-lg border border-[#F3F0EA] bg-white px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-[#171717] hover:bg-[#FCF9F3] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Paper Finish</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};
