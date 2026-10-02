import React from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { ProcessStep } from './ProcessStep';
import { HOW_IT_WORKS_DATA } from '../../data/how-it-works';
import { ShieldCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="py-6 sm:py-20 bg-[#FFFDF8] border-b border-[#F3F0EA]"
      aria-labelledby="how-it-works-title"
    >
      <Container size="wide">
        <SectionHeading
          kicker="Simple & Transparent"
          title={HOW_IT_WORKS_DATA.heading}
          subtitle={HOW_IT_WORKS_DATA.supportingText}
        />

        {/* 4 Steps Horizontal / Vertical progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative">
          {HOW_IT_WORKS_DATA.steps.map((step, index) => (
            <ProcessStep
              key={step.step}
              step={step}
              index={index}
              totalSteps={HOW_IT_WORKS_DATA.steps.length}
            />
          ))}
        </div>

        {/* Visual Business Flow Callout Bar (Emphasizes customer approval before printing) */}
        <div className="mt-5 sm:mt-12 rounded-xl sm:rounded-2xl bg-[#FCF9F3] border border-[#F3F0EA] p-3 sm:p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10100F] text-[#C25E34]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C25E34] block">
                  The MomentPress Promise
                </span>
                <p className="text-sm font-medium text-[#171717]">
                  No surprises: Every frame goes through our verified WhatsApp preview approval before printing starts.
                </p>
              </div>
            </div>

            {/* Step flow pill */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#6B6258] font-mono bg-white px-3.5 py-2 rounded-lg border border-[#F3F0EA]">
              <span className="font-semibold text-[#171717]">Photo</span>
              <span className="text-[#6B6258]/60">→</span>
              <span>Design</span>
              <span className="text-[#6B6258]/60">→</span>
              <span className="text-[#C25E34] font-bold">Your Preview Approval</span>
              <span className="text-[#6B6258]/60">→</span>
              <span>Print</span>
              <span className="text-[#6B6258]/60">→</span>
              <span className="font-semibold text-emerald-800">Delivered</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
