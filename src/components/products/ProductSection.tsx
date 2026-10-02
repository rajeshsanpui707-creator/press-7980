import React, { useState } from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { ProductCard } from './ProductCard';
import { OrderFlow } from '../order-flow/OrderFlow';
import { StickerSelector } from './StickerSelector';
import { PRODUCTS } from '../../data/products';
import { FrameSizeId, FrameFinish } from '../../types';
import { Frame, Sparkles } from 'lucide-react';

interface ProductSectionProps {
  customizerOpen: boolean;
  setCustomizerOpen: (open: boolean) => void;
  resetSignal?: number;
  selectedSize?: FrameSizeId;
  selectedFinish?: FrameFinish;
  onSelectSize?: (size: FrameSizeId) => void;
  onSelectFinish?: (finish: FrameFinish) => void;
  onContinueToQuality?: () => void;
  initialTab?: 'frames' | 'stickers';
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  customizerOpen,
  setCustomizerOpen,
  resetSignal,
  selectedSize,
  selectedFinish,
  onSelectSize,
  onSelectFinish,
  onContinueToQuality,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'frames' | 'stickers'>(initialTab || 'frames');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleOpenFrames = () => {
    setActiveTab('frames');
    setCustomizerOpen(true);
  };

  const handleOpenStickers = () => {
    setActiveTab('stickers');
    setCustomizerOpen(true);
  };

  return (
    <section
      id="products"
      className="py-6 sm:py-20 bg-[#FFFDF8] border-b border-[#F3F0EA]"
      aria-labelledby="products-heading"
    >
      <Container size="wide">
        <SectionHeading
          kicker="Bespoke Collection"
          title="Choose Your Product & Format"
          subtitle="Handcrafted wooden frames and waterproof photo stickers created with archival quality materials."
        />

        {/* Product Cards Grid when customizer is collapsed */}
        {!customizerOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-8 mb-5 sm:mb-12">
            <ProductCard
              product={PRODUCTS[0]}
              onOpenFrameConfig={handleOpenFrames}
            />
            <ProductCard
              product={PRODUCTS[1]}
              onOpenFrameConfig={handleOpenStickers}
            />
          </div>
        )}

        {/* Customizer Tabs & Workspace */}
        <div className="rounded-2xl border border-[#F3F0EA] bg-[#FCF9F3]/60 p-2 sm:p-8">
          {/* Tab Selector Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-8 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('frames');
                setCustomizerOpen(true);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] text-white hover:bg-[#2A2927] px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px] ${
                activeTab === 'frames' && customizerOpen
                  ? 'ring-2 ring-offset-2 ring-[#10100F] ring-offset-[#FCF9F3] shadow-md'
                  : 'shadow-sm opacity-90 hover:opacity-100'
              }`}
            >
              <Frame className="h-4 w-4 shrink-0" />
              <span>{PRODUCTS[0]?.name || 'Custom Photo Frames'} (from ₹{PRODUCTS[0]?.startingPrice ?? 199})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('stickers');
                setCustomizerOpen(true);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] text-white hover:bg-[#2A2927] px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px] ${
                activeTab === 'stickers' && customizerOpen
                  ? 'ring-2 ring-offset-2 ring-[#10100F] ring-offset-[#FCF9F3] shadow-md'
                  : 'shadow-sm opacity-90 hover:opacity-100'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{PRODUCTS[1]?.name || 'Photo Stickers'} (from ₹{PRODUCTS[1]?.startingPrice ?? 99})</span>
            </button>
          </div>

          {/* Active Customizer View */}
          {activeTab === 'frames' ? (
            <OrderFlow
              resetSignal={resetSignal}
              selectedSize={selectedSize}
              selectedFinish={selectedFinish}
              onSelectSize={onSelectSize}
              onSelectFinish={onSelectFinish}
              onContinueToQuality={onContinueToQuality}
            />
          ) : (
            <StickerSelector />
          )}
        </div>
      </Container>
    </section>
  );
};
