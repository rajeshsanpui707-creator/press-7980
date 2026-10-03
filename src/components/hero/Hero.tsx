import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Container } from '../layout/Container';
import { FrameMockup } from '../common/FrameMockup';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';
import { AdminService } from '../../lib/admin/admin-service';
import { HomepageHeroConfig } from '../../types/admin';

interface HeroProps {
  onOpenCustomizer?: () => void;
  onNavigateExistingDesigns?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCustomizer, onNavigateExistingDesigns }) => {
  const [heroConfig, setHeroConfig] = useState<HomepageHeroConfig>(() =>
    AdminService.getHomepageHeroConfig()
  );

  useEffect(() => {
    setHeroConfig(AdminService.getHomepageHeroConfig());
  }, []);

  const heading = heroConfig.heading || 'Your memory, beautifully framed.';
  const subheading =
    heroConfig.subheading ||
    'Turn your favorite moments into beautiful personalized frames and photo products.';
  const hookBadgeText = heroConfig.hookBadgeText || 'Starting from just ₹99';
  const ctaText = heroConfig.ctaText || 'Create Your Frame';
  const secondaryCtaText = heroConfig.secondaryCtaText || 'Existing Designs';

  return (
    <section id="home" className="relative overflow-hidden bg-[#FFFDF8] pt-4 pb-6 sm:pt-14 sm:pb-24 border-b border-[#F3F0EA]">
      <Container size="wide">
        <div className="grid grid-cols-1 items-center gap-5 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Text & Conversion Content (Left 7 Cols) */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Prominent Starting Hook Badge (Noticeable Above the Fold) */}
            <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-full bg-[#FCF9F3] border border-[#F3F0EA] px-2.5 py-1 sm:px-3.5 sm:py-1.5 mb-2 sm:mb-4 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-[#C25E34]" aria-hidden="true" />
              <span className="font-sans text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#10100F]">
                {hookBadgeText}
              </span>
              <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">|</span>
              <span className="text-[10.5px] sm:text-xs text-[#6B6258]">
                Photo Stickers from <strong className="text-[#C25E34] font-semibold">₹99</strong> · Custom Frames from <strong className="text-[#C25E34] font-semibold">₹149</strong>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.14] [text-wrap:balance]">
              {heading}
            </h1>

            {/* Supporting Copy */}
            <p className="mt-2 sm:mt-4 text-xs sm:text-lg text-[#6B6258] leading-relaxed max-w-xl [text-wrap:balance]">
              {subheading}
            </p>

            {/* AEO Quick Answer - What we do */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-white border border-[#F3F0EA] max-w-xl">
              <h2 className="font-bold text-xs sm:text-sm text-[#171717] mb-2">
                What is MomentPress?
              </h2>
              <p className="text-[10.5px] sm:text-xs text-[#6B6258] leading-relaxed">
                MomentPress handcrafts custom photo frames from your own photos. Choose from 5 sizes (5×7 to 12×18 in), 4 solid wood finishes, and 3 archival paper tiers. We print on 12-color pigment printers, send a free WhatsApp proof for approval, and deliver in Kolkata within 48 hours.
              </p>
            </div>

            {/* CTA Group */}
            <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3.5 w-full sm:w-auto">
              {/* Primary CTA: BLACK BUTTON with WHITE TEXT */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenCustomizer) {
                    onOpenCustomizer();
                  }
                  const el = document.getElementById('products');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Existing Designs Button - Prominent Real Button */}
              {onNavigateExistingDesigns && (
                <button
                  type="button"
                  onClick={onNavigateExistingDesigns}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
                  aria-label={secondaryCtaText}
                >
                  <span>{secondaryCtaText}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}

              {/* Secondary CTA */}
              <a
                href={createWhatsAppLink(WHATSAPP_MESSAGES.frame)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F3F0EA] hover:bg-[#E8E4DC] px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-medium text-[#171717] border border-[#F3F0EA] active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] min-h-[44px] sm:min-h-[48px]"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="h-4 w-4 text-[#10100F]" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Reassurances list */}
            <div className="mt-3.5 sm:mt-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-x-6 sm:gap-y-2 text-[10.5px] sm:text-xs text-[#6B6258] font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C25E34]" aria-hidden="true" />
                <span>Free digital WhatsApp proof</span>
              </div>
              <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C25E34]" aria-hidden="true" />
                <span>Anti-glare protective glass</span>
              </div>
              <span className="text-zinc-300 hidden sm:inline" aria-hidden="true">·</span>
              <span>Multi-layer safe packing</span>
            </div>
          </div>

          {/* Product Hero Visual Preview (Right 5 Cols) */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-[260px] sm:max-w-sm">
              <div className="relative rounded-2xl bg-[#FCF9F3] p-4 sm:p-7 border border-[#F3F0EA] shadow-xs">
                <FrameMockup
                  finish="natural-oak"
                  sizeLabel="8×10 in"
                  title="Your Favourite Memory"
                  category="Solid Wood Keepsake Frame"
                  aspectRatioClass="aspect-[4/5]"
                />

                <div className="mt-3 sm:mt-5 text-center">
                  <span className="block font-serif text-xs sm:text-sm font-semibold text-[#171717]">
                    Handmade in Bowbazar, Kolkata
                  </span>
                  <span className="block text-[10.5px] sm:text-xs text-[#6B6258] mt-0.5">
                    Solid wood profile · Archival 12-color print · Ready to hang
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
