import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

const STAGES = [
  { text: 'Placing your order...', detail: 'Securing your frame specifications...' },
  { text: 'Generating your order ID...', detail: 'Registering order in Bowbazar studio queue...' },
  { text: 'Finalizing your order...', detail: 'Preparing your free WhatsApp digital proof link...' },
];

export const OrderProcessingState: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStageIndex(1), 800);
    const t2 = setTimeout(() => setStageIndex(2), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const current = STAGES[stageIndex];

  return (
    <div className="py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
      {/* Concentric Animated Spinner */}
      <div className="relative mb-6">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-[#F3F0EA] border-t-[#10100F] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#10100F] flex items-center justify-center text-white font-serif text-sm font-bold shadow-md">
            MP
          </div>
        </div>
      </div>

      {/* Polite Animated Progress Message */}
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#171717] mb-2 transition-all duration-300">
        {current.text}
      </h2>
      <p className="text-xs sm:text-sm text-[#6B6258] max-w-sm font-sans transition-all duration-300">
        {current.detail}
      </p>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mt-5">
        {[0, 1, 2].map((idx) => (
          <span
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === stageIndex
                ? 'w-6 bg-[#10100F]'
                : idx < stageIndex
                ? 'w-2 bg-[#C25E34]'
                : 'w-2 bg-[#E5DFD5]'
            }`}
          />
        ))}
      </div>

      {/* Subtle Security Footnote */}
      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-[#78716C]">
        <ShieldCheck className="h-3.5 w-3.5 text-[#C25E34]" />
        <span>Secure order submission · Handcrafted in Bowbazar, Kolkata</span>
      </div>
    </div>
  );
};
