import React from 'react';
import { Clock, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Container } from '../layout/Container';

export const TrustIndicators: React.FC = () => {
  const items = [
    {
      icon: Clock,
      title: '48-Hour Turnaround',
      description: 'Handcrafted in our Bowbazar studio and delivered fast across Kolkata.',
    },
    {
      icon: ShieldCheck,
      title: 'Free WhatsApp Proof',
      description: 'Inspect exact crop, margins, and paper finish before anything is printed.',
    },
    {
      icon: Sparkles,
      title: 'Archival Print Quality',
      description: 'Ultra-high-definition 12-color pigment printing that lasts 50+ years.',
    },
    {
      icon: Truck,
      title: 'Tamper-Proof Safe Pack',
      description: 'Multi-layer shock-absorbing box packaging with transit protection.',
    },
  ];

  return (
    <section className="py-6 sm:py-10 bg-[#FCF9F3] border-b border-[#F3F0EA]" aria-labelledby="trust-heading">
      <Container size="wide">
        <h2 id="trust-heading" className="sr-only">Why Choose MomentPress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3 sm:gap-3.5">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white border border-[#F3F0EA] shadow-2xs text-[#C25E34]">
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-[#171717]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6B6258] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
