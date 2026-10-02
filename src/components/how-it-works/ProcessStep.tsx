import React from 'react';
import { Image, Frame, CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { HowItWorksStep } from '../../data/how-it-works';

interface ProcessStepProps {
  step: HowItWorksStep;
  index: number;
  totalSteps: number;
}

export const ProcessStep: React.FC<ProcessStepProps> = ({
  step,
  index,
  totalSteps,
}) => {
  const getIcon = () => {
    switch (step.iconName) {
      case 'image':
        return <Image className="h-5 w-5 sm:h-6 sm:w-6 text-[#10100F]" aria-hidden="true" />;
      case 'frame':
        return <Frame className="h-5 w-5 sm:h-6 sm:w-6 text-[#10100F]" aria-hidden="true" />;
      case 'check-circle':
        return <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#C25E34]" aria-hidden="true" />;
      case 'package':
        return <Package className="h-5 w-5 sm:h-6 sm:w-6 text-[#10100F]" aria-hidden="true" />;
      default:
        return <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#C25E34]" aria-hidden="true" />;
    }
  };

  const isApprovalStep = step.step === '03';

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Step Card - Compact on mobile (~150-180px height max) */}
      <div
        className={`group relative flex flex-col justify-between min-h-[150px] max-h-[185px] sm:min-h-0 sm:max-h-none sm:h-full px-3.5 py-3 sm:p-7 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
          isApprovalStep
            ? 'bg-[#FCF9F3] border-[#10100F] shadow-xs'
            : 'bg-white border-[#F3F0EA] hover:border-[#10100F]/30 hover:shadow-xs'
        }`}
      >
        <div>
          {/* Card Top: <=40px Icon & 18-22px Step Number with minimal gap */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-5">
            <div
              className={`flex h-[38px] w-[38px] sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                isApprovalStep
                  ? 'bg-white shadow-2xs border border-[#F3F0EA]'
                  : 'bg-[#F3F0EA] shadow-2xs border border-[#F3F0EA]'
              }`}
            >
              {getIcon()}
            </div>

            <span
              className={`font-serif text-[19px] sm:text-2xl font-bold tabular-nums leading-none ${
                isApprovalStep ? 'text-[#C25E34]' : 'text-[#6B6258]/40 group-hover:text-[#10100F]'
              } transition-colors`}
              aria-label={`Step ${step.step}`}
            >
              {step.step}
            </span>
          </div>

          {/* Title (<=18px) & Description (13-14px) with tight vertical gap */}
          <h3 className="font-serif text-[16.5px] sm:text-xl font-bold text-[#171717] mb-1 sm:mb-2.5 leading-snug">
            {step.title}
          </h3>
          <p className="text-[13px] sm:text-sm text-[#6B6258] leading-snug sm:leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Step note / reassurance pill with minimal top gap on mobile */}
        {step.subnote && (
          <div className="mt-2 sm:mt-5 pt-1.5 sm:pt-4 border-t border-[#F3F0EA] flex items-center">
            <span
              className={`text-[11px] font-medium leading-tight ${
                isApprovalStep ? 'text-[#C25E34] font-semibold' : 'text-[#6B6258]'
              }`}
            >
              {isApprovalStep ? '★ ' : '· '}
              {step.subnote}
            </span>
          </div>
        )}
      </div>

      {/* Desktop connector arrow between steps (hidden on last step & mobile) */}
      {index < totalSteps - 1 && (
        <div
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white border border-[#F3F0EA] shadow-2xs text-[#6B6258] pointer-events-none"
          aria-hidden="true"
        >
          <ArrowRight className="h-4 w-4 text-[#10100F]" />
        </div>
      )}
    </div>
  );
};
