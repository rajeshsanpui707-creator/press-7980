import React from 'react';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  asHeading?: 'h1' | 'h2' | 'h3';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  kicker,
  title,
  subtitle,
  align = 'center',
  className = '',
  asHeading = 'h2',
}) => {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
  };

  const HeadingTag = asHeading;

  return (
    <div className={`flex flex-col max-w-2xl ${alignmentClasses[align]} mb-4 sm:mb-14 ${className}`}>
      {kicker && (
        <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#C25E34] mb-1 sm:mb-2">
          {kicker}
        </span>
      )}
      <HeadingTag className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717] [text-wrap:balance]">
        {title}
      </HeadingTag>
      {subtitle && (
        <p className="mt-1.5 sm:mt-3 text-xs sm:text-base text-[#6B6258] leading-relaxed [text-wrap:balance]">
          {subtitle}
        </p>
      )}
    </div>
  );
};
