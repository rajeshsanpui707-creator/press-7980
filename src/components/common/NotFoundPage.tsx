import React from 'react';
import { Container } from '../layout/Container';
import { ArrowLeft, Home, ShoppingBag, Image as ImageIcon } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: (targetSection?: string) => void;
  onNavigateExistingDesigns: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onNavigateExistingDesigns,
}) => {
  return (
    <div className="bg-[#FFFDF8] py-12 sm:py-24 min-h-[70vh] flex items-center">
      <Container size="narrow">
        <div className="text-center max-w-xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C25E34] bg-[#FCF9F3] border border-[#F3F0EA] px-3 py-1 rounded-full mb-4">
            Error 404 — Page Not Found
          </span>

          {/* Large Title */}
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#171717] mb-3 [text-wrap:balance]">
            This memory seems to be misplaced.
          </h1>

          {/* Subtext */}
          <p className="text-xs sm:text-base text-[#6B6258] leading-relaxed mb-8 [text-wrap:balance]">
            The page you are looking for doesn't exist, has been moved, or the link may be broken. Let's get you back to custom framing and keepsakes.
          </p>

          {/* Navigational CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigateHome()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs active:scale-[0.98] transition-colors cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Back to Homepage</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateHome('products')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-[#F3F0EA] hover:bg-[#FCF9F3] px-5 py-3 text-xs sm:text-sm font-semibold text-[#10100F] shadow-2xs active:scale-[0.98] transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 text-[#C25E34]" />
              <span>Explore Products</span>
            </button>

            <button
              type="button"
              onClick={onNavigateExistingDesigns}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-[#F3F0EA] hover:bg-[#FCF9F3] px-5 py-3 text-xs sm:text-sm font-semibold text-[#10100F] shadow-2xs active:scale-[0.98] transition-colors cursor-pointer"
            >
              <ImageIcon className="h-4 w-4 text-[#6B6258]" />
              <span>Existing Designs</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};
