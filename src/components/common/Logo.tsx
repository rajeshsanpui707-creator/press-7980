import React from 'react';
import { SITE_CONFIG } from '../../lib/config/site-config';

interface LogoProps {
  className?: string;
  variant?: 'header' | 'footer' | 'standalone';
  showTagline?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'header',
  showTagline = false,
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <a
        href="#home"
        onClick={handleClick}
        className="group inline-flex items-center gap-2 text-decoration-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10100F] cursor-pointer"
        aria-label={`${SITE_CONFIG.brandName} Home`}
      >
        {/* Minimal geometric photo frame monogram */}
        <div
          className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-sm border-2 border-[#10100F] bg-[#FFFDF8] transition-transform duration-200 group-hover:scale-105 shrink-0"
          aria-hidden="true"
        >
          <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 border border-[#C25E34] bg-[#FCF9F3]" />
        </div>

        {/* Clean text-based logo treatment */}
        <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#10100F] truncate">
          Moment<span className="font-sans font-semibold text-[#C25E34]">Press</span>
        </span>
      </a>

      {showTagline && (
        <span className="mt-1 text-xs text-[#6B6258] font-normal">
          {SITE_CONFIG.tagline}
        </span>
      )}
    </div>
  );
};
