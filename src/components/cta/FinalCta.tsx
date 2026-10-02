import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Container } from '../layout/Container';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';

interface FinalCtaProps {
  onOpenCustomizer?: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenCustomizer }) => {
  const handleScrollToConfigurator = () => {
    if (onOpenCustomizer) {
      onOpenCustomizer();
    }
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-[#10100F] text-[#FFFDF8] py-8 sm:py-24 border-t border-[#080807]"
      aria-labelledby="final-cta-heading"
    >
      {/* Subtle ambient light accents in warm terracotta */}
      <div
        className="pointer-events-none absolute -top-28 -right-28 h-96 w-96 rounded-full bg-[#C25E34]/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-[#C25E34]/15 blur-3xl"
        aria-hidden="true"
      />

      <Container size="narrow">
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Subtle minimal badge */}
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 sm:px-4 sm:py-1.5 text-[10.5px] sm:text-xs font-semibold text-[#C25E34] mb-3 sm:mb-6 border border-[#C25E34]/30">
            <span>Made to be Kept, Gifted and Remembered</span>
          </div>

          {/* Heading */}
          <h2
            id="final-cta-heading"
            className="font-serif text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight [text-wrap:balance]"
          >
            Ready to turn a memory into something you can keep?
          </h2>

          {/* Supporting Copy */}
          <p className="mt-2 sm:mt-4 text-xs sm:text-base md:text-lg text-[#F3F0EA]/80 max-w-xl leading-relaxed [text-wrap:balance]">
            Choose your frame, share your photo, and let MomentPress turn the moment into something tangible.
          </p>

          {/* Action CTAs */}
          <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 w-full sm:w-auto">
            {/* Primary CTA (Black Button with White Text) */}
            <button
              type="button"
              onClick={handleScrollToConfigurator}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-black text-white hover:bg-zinc-900 border border-white/20 px-4 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold shadow-md active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-white cursor-pointer min-h-[44px] sm:min-h-[48px]"
            >
              <span>Create Your Frame</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Secondary CTA */}
            <a
              href={createWhatsAppLink(WHATSAPP_MESSAGES.finalCta)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-base font-medium text-white hover:bg-white/20 border border-white/20 active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-white min-h-[44px] sm:min-h-[48px]"
              aria-label="Chat on WhatsApp about custom frame options"
            >
              <MessageCircle className="h-4 w-4 text-white" aria-hidden="true" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Reassurance text */}
          <p className="mt-4 sm:mt-6 text-[11px] sm:text-xs text-[#F3F0EA]/60">
            Free digital proof before printing · Anti-glare protective glass · Delivery in 48 hours
          </p>
        </div>
      </Container>
    </section>
  );
};

export const FinalCTA = FinalCta;
