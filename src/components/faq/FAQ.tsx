import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { FAQItem } from './FAQItem';
import { FAQ_SECTION_DATA, STATIC_FAQ_ITEMS } from '../../data/faq';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';
import { AdminService } from '../../lib/admin/admin-service';
import { FaqItem } from '../../types';

export const FAQ: React.FC = () => {
  const getFaqs = (): FaqItem[] => {
    try {
      const list = AdminService.getFaqs();
      if (Array.isArray(list) && list.length > 0) {
        return list
          .filter((f) => f.visible !== false && f.active !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((f) => ({ id: f.id, question: f.question, answer: f.answer }));
      }
      return STATIC_FAQ_ITEMS;
    } catch {
      return STATIC_FAQ_ITEMS;
    }
  };

  const [items, setItems] = useState<FaqItem[]>(getFaqs);
  const [openIds, setOpenIds] = useState<string[]>(() => [items[0]?.id || 'faq-1']);

  useEffect(() => {
    AdminService.fetchPublicConfig().then(() => {
      const live = getFaqs();
      setItems(live);
    });
  }, []);

  const handleToggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section
      id="faq"
      className="py-6 sm:py-20 bg-[#FFFDF8] border-b border-[#F3F0EA]"
      aria-labelledby="faq-section-heading"
    >
      <Container size="narrow">
        <SectionHeading
          kicker="Clear Answers"
          title={FAQ_SECTION_DATA.heading}
          subtitle={FAQ_SECTION_DATA.supportingText}
        />

        {/* Minimal border-divided FAQ list */}
        <div className="border-t border-[#F3F0EA] divide-y divide-[#F3F0EA]">
          {items.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openIds.includes(item.id)}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </div>

        {/* Concise WhatsApp Inquiry Box */}
        <div className="mt-4 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-[#FCF9F3] border border-[#F3F0EA]">
          <div>
            <span className="font-serif font-bold text-sm sm:text-base text-[#171717] block">
              Still have a specific question about your photo?
            </span>
            <span className="text-xs text-[#6B6258] block mt-0.5">
              Chat directly with our team on WhatsApp before ordering.
            </span>
          </div>

          <a
            href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#10100F] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#080807] active:scale-[0.98] transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#10100F]"
            aria-label="Ask questions on WhatsApp"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </Container>
    </section>
  );
};

export const FaqSection = FAQ;
