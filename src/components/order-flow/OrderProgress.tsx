import React from 'react';
import { OrderStep } from '../../types';
import { Check } from 'lucide-react';

interface OrderProgressProps {
  currentStep: OrderStep;
  onNavigateStep: (step: OrderStep) => void;
}

export const OrderProgress: React.FC<OrderProgressProps> = ({
  currentStep,
  onNavigateStep,
}) => {
  const steps: { number: OrderStep; label: string; shortLabel: string; fullTitle: string }[] = [
    { number: 1, label: 'Size & Finish', shortLabel: 'Size', fullTitle: '1 — Size & Finish' },
    { number: 2, label: 'Paper Quality', shortLabel: 'Quality', fullTitle: '2 — Paper Quality' },
    { number: 3, label: 'Review Specs', shortLabel: 'Review', fullTitle: '3 — Review Specs' },
    { number: 4, label: 'Delivery Details', shortLabel: 'Delivery', fullTitle: '4 — Delivery Details' },
  ];

  if (currentStep === 5) return null;

  return (
    <nav className="mb-3 sm:mb-8 w-full max-w-2xl mx-auto rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-[#FCF9F3]/60 px-2 sm:px-6 py-2 sm:py-4 shadow-2xs" aria-label="Order progress">
      <ol className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const isCompleted = currentStep > s.number;
          const isCurrent = currentStep === s.number;
          const isClickable = isCompleted;

          return (
            <li key={s.number} className="flex-1 flex items-center last:flex-none">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onNavigateStep(s.number)}
                className={`group flex flex-col items-center gap-1 focus:outline-hidden w-full ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                aria-label={s.fullTitle + (isCurrent ? ' (current step)' : isCompleted ? ' (completed)' : '')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Number Badge */}
                <div
                  className={`relative flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#10100F] text-white shadow-2xs'
                      : isCurrent
                      ? 'bg-[#10100F] text-white shadow-xs ring-4 ring-[#10100F]/15'
                      : 'border-2 border-[#E8E4DC] bg-white text-[#6B6258]/60'
                  }`}
                >
                  <span>{s.number}</span>
                  {isCompleted && (
                    <span
                      className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C25E34] text-white shadow-2xs"
                      aria-hidden="true"
                    >
                      <Check className="h-2 w-2 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Step Label: 1 — Size on mobile, 1 — Size & Finish on desktop */}
                <span
                  className={`text-[9.5px] xs:text-[10px] sm:text-xs text-center leading-tight transition-colors px-0.5 whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#10100F] font-bold'
                      : isCompleted
                      ? 'text-[#171717] font-semibold group-hover:text-[#C25E34]'
                      : 'text-[#6B6258]/60 font-medium'
                  }`}
                >
                  <span className="sm:hidden">{s.number} — {s.shortLabel}</span>
                  <span className="hidden sm:inline">{s.number} — {s.label}</span>
                </span>
              </button>

              {/* Connecting line between steps */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-0.5 sm:mx-2 -mt-4.5 sm:-mt-5 transition-colors duration-200 ${
                    currentStep > s.number ? 'bg-[#10100F]' : 'bg-[#E8E4DC]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
