import React from 'react';
import { FrameSizeId, FrameTierId, FrameFinish } from '../../types';
import { FRAME_SIZE_CONFIGS, FRAME_TIER_CONFIGS, FRAME_FINISHES } from '../../data/products';
import { getFramePrice, formatRupees } from '../../lib/pricing/pricing';
import { ArrowLeft, ArrowRight, Minus, Plus, Edit2, ShieldCheck } from 'lucide-react';

interface OrderReviewStepProps {
  selectedSize: FrameSizeId;
  selectedTier: FrameTierId;
  selectedFinish: FrameFinish;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  onEditOrder: () => void;
  onContinueToDetails: () => void;
}

export const OrderReviewStep: React.FC<OrderReviewStepProps> = ({
  selectedSize,
  selectedTier,
  selectedFinish,
  quantity,
  onChangeQuantity,
  onEditOrder,
  onContinueToDetails,
}) => {
  const sizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];
  const tierConfig = FRAME_TIER_CONFIGS.find((t) => t.id === selectedTier) || FRAME_TIER_CONFIGS[1];
  const finishConfig = FRAME_FINISHES.find((f) => f.id === selectedFinish) || FRAME_FINISHES[0];

  const unitPrice = getFramePrice(selectedSize, selectedTier);
  const totalPrice = unitPrice * quantity;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F3F0EA] pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block">
            Step 3 of 4
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171717]">
            Review your frame specifications
          </h3>
        </div>
        <p className="text-xs text-[#6B6258] font-sans">
          You will upload your photo via WhatsApp on the next step
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Specs Card */}
        <div className="lg:col-span-7 rounded-2xl border border-[#F3F0EA] bg-[#FCF9F3] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F3F0EA]">
            <div>
              <span className="font-serif font-bold text-lg text-[#171717] block">
                Custom Photo Frame
              </span>
              <span className="text-xs text-[#6B6258]">
                {sizeConfig.name} ({sizeConfig.dimensionInches})
              </span>
            </div>

            <button
              type="button"
              onClick={onEditOrder}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] hover:text-[#C25E34] underline cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Modify</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Frame Moulding:</span>
              <span className="font-medium text-[#171717]">{finishConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Paper Quality:</span>
              <span className="font-medium text-[#171717]">{tierConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Dimensions:</span>
              <span className="font-mono text-[#171717]">{sizeConfig.dimensionInches} ({sizeConfig.dimensionCm})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Protective Glass:</span>
              <span className="font-medium text-[#171717]">Anti-glare crystal glass included</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Orientation:</span>
              <span className="font-medium text-[#171717]">Portrait & Landscape dual hanging</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F0EA] flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Includes 100% free digital WhatsApp preview prior to production.</span>
          </div>
        </div>

        {/* Pricing & Quantity Card */}
        <div className="lg:col-span-5 rounded-2xl border border-[#F3F0EA] bg-white p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="font-serif font-bold text-base text-[#171717] block">
              Order Quantity
            </span>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#F3F0EA] bg-[#FCF9F3]/60">
              <span className="text-xs text-[#6B6258]">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F3F0EA] bg-white text-[#171717] hover:bg-[#F3F0EA] disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono font-bold text-base text-[#171717] w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeQuantity(quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F3F0EA] bg-white text-[#171717] hover:bg-[#F3F0EA] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between text-[#6B6258]">
                <span>Unit Price:</span>
                <span className="font-mono">{formatRupees(unitPrice)}</span>
              </div>
              <div className="flex justify-between text-[#6B6258]">
                <span>Shipping in Kolkata:</span>
                <span className="font-medium text-emerald-700">Free / Included</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F3F0EA]">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-serif font-bold text-sm text-[#171717]">Total Amount:</span>
              <span className="font-serif text-2xl font-bold text-[#C25E34]">
                {formatRupees(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={onContinueToDetails}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] py-3.5 px-5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>Enter Delivery Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onEditOrder}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6258] hover:text-[#171717] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Paper Finish</span>
        </button>
      </div>
    </div>
  );
};
