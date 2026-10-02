import React from 'react';
import { FaqItem } from '../../types';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

export const FAQItem: React.FC<FAQItemProps> = ({
  item,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border-b border-[#F3F0EA] transition-colors">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${item.id}`}
          id={`faq-trigger-${item.id}`}
          className="flex w-full items-center justify-between py-3 sm:py-5 text-left transition-colors group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F] focus-visible:outline-offset-2 rounded-sm"
        >
          <span className="font-serif text-sm sm:text-lg font-bold text-[#171717] group-hover:text-[#10100F] transition-colors pr-2.5 sm:pr-4">
            {item.question}
          </span>
          <span
            className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
              isOpen
                ? 'border-[#10100F] bg-[#10100F] text-white'
                : 'border-[#F3F0EA] bg-white text-[#6B6258] group-hover:border-[#10100F] group-hover:text-[#171717]'
            }`}
            aria-hidden="true"
          >
            {isOpen ? (
              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
            ) : (
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
            )}
          </span>
        </button>
      </h3>

      <div
        id={`faq-panel-${item.id}`}
        role="region"
        aria-labelledby={`faq-trigger-${item.id}`}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-3 sm:pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
        }`}
      >
        <p className="text-xs sm:text-base text-[#6B6258] leading-relaxed max-w-2xl">
          {item.answer}
        </p>
      </div>
    </div>
  );
};
