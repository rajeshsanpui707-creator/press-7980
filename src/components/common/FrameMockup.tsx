import React from 'react';
import { FrameFinish } from '../../types';
import { Image as ImageIcon } from 'lucide-react';

interface FrameMockupProps {
  finish?: FrameFinish;
  sizeLabel?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  aspectRatioClass?: string;
  hasMat?: boolean;
  className?: string;
  title?: string;
  category?: string;
  imageSrc?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const FrameMockup: React.FC<FrameMockupProps> = ({
  finish = 'matte-black',
  sizeLabel = '6×8',
  aspectRatioClass,
  hasMat = true,
  className = '',
  title = 'Your Cherished Memory',
  category,
  imageSrc,
  interactive = false,
  onClick,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [imageSrc]);

  // Frame border styling based on finish
  const finishStyles: Record<FrameFinish, { outer: string; innerBevel: string; shadow: string }> = {
    'matte-black': {
      outer: 'bg-[#18181b] border-[#27272a]',
      innerBevel: 'border-zinc-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]',
      shadow: 'shadow-[0_12px_30px_rgba(0,0,0,0.18)]',
    },
    'classic-black': {
      outer: 'bg-[#18181b] border-[#27272a]',
      innerBevel: 'border-zinc-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]',
      shadow: 'shadow-[0_12px_30px_rgba(0,0,0,0.18)]',
    },
    'natural-oak': {
      outer: 'bg-[#c69d6d] border-[#b08554]',
      innerBevel: 'border-[#9e7343] shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]',
      shadow: 'shadow-[0_12px_28px_rgba(184,140,94,0.25)]',
    },
    'gallery-white': {
      outer: 'bg-[#f4f4f5] border-zinc-300',
      innerBevel: 'border-zinc-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]',
      shadow: 'shadow-[0_12px_28px_rgba(0,0,0,0.1)]',
    },
    'rich-walnut': {
      outer: 'bg-[#4a2e19] border-[#38200f]',
      innerBevel: 'border-[#2d180a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]',
      shadow: 'shadow-[0_12px_30px_rgba(74,46,25,0.3)]',
    },
    'warm-walnut': {
      outer: 'bg-[#4a2e19] border-[#38200f]',
      innerBevel: 'border-[#2d180a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]',
      shadow: 'shadow-[0_12px_30px_rgba(74,46,25,0.3)]',
    },
  };

  const currentFinish = finishStyles[finish] || finishStyles['matte-black'];

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${className}`}
    >
      {/* Outer Wooden/Moulding Bevel Frame */}
      <div
        className={`relative overflow-hidden rounded-[3px] p-2.5 sm:p-3.5 border-2 ${currentFinish.outer} ${currentFinish.shadow}`}
      >
        {/* Subtle wood grain sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/15 pointer-events-none" />

        {/* Inner Bevel Rebate */}
        <div className={`relative border ${currentFinish.innerBevel} overflow-hidden rounded-[1px]`}>
          {/* Matboard (Mount) - Clean Ivory Gallery Mount */}
          <div
            className={`${
              hasMat
                ? 'bg-[#FAF8F3] p-2.5 sm:p-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] border border-[#EBE6DC]'
                : 'bg-transparent'
            }`}
          >
            {/* Inner Print Aperture Window */}
            <div
              className={`relative overflow-hidden bg-[#F6F3EB] border border-[#DDD5C7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center ${
                aspectRatioClass || 'aspect-[4/5]'
              }`}
            >
              {/* Glass subtle light reflection diagonal sheen */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none z-10"
                style={{ transform: 'rotate(25deg) scale(1.6)' }}
              />

              {/* Render Image or Archival Canvas Placeholder */}
              {imageSrc && !imgFailed ? (
                <img
                  src={imageSrc}
                  alt={title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center w-full h-full bg-gradient-to-b from-[#FDFBF7] to-[#F4EFE6]">
                  {/* Subtle Framing Geometry Frame Mark */}
                  <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#EFE9DD] border border-[#DDD5C7] text-[#C25E34] mb-1.5 sm:mb-2 shadow-2xs">
                    <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="font-serif text-xs sm:text-sm font-bold text-[#171717] line-clamp-1 max-w-[140px]">
                    {title}
                  </span>
                  {category ? (
                    <span className="text-[9.5px] sm:text-[10px] font-semibold text-[#C25E34] uppercase tracking-wider mt-0.5 line-clamp-1 max-w-[130px]">
                      {category}
                    </span>
                  ) : (
                    <span className="text-[9px] text-[#78716C] tracking-wide uppercase mt-0.5">
                      Archival Print
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Frame dimension badge below */}
      {sizeLabel && (
        <div className="mt-1.5 text-center">
          <span className="inline-block text-[10.5px] font-mono font-medium text-[#6B6258] bg-[#F3F0EA]/80 px-2 py-0.5 rounded-sm border border-[#E8E2D6]">
            {sizeLabel}
          </span>
        </div>
      )}
    </div>
  );
};
