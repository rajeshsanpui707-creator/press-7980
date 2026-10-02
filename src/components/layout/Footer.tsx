import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Instagram, ArrowUp } from 'lucide-react';
import { Container } from '../layout/Container';
import { PolicyModal } from '../common/PolicyModal';
import { NewsletterForm } from '../footer/NewsletterForm';
import { SITE_CONFIG } from '../../lib/config/site-config';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';

interface FooterProps {
  onNavigateHome?: (targetSection?: string) => void;
  onNavigateExistingDesigns?: () => void;
  onNavigateAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateExistingDesigns,
  onNavigateAdmin,
}) => {
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigateHome) {
      e.preventDefault();
      onNavigateHome(href.replace('#', ''));
    }
  };

  return (
    <footer id="contact" className="bg-[#080807] text-[#F3F0EA]/80 pt-8 pb-6 sm:pt-16 sm:pb-12 border-t border-[#10100F]" aria-labelledby="footer-heading">
      <Container size="wide">
        <h2 id="footer-heading" className="sr-only">Footer Information & Support</h2>
        {/* 4-Column Balanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-10 pb-6 sm:pb-12 border-b border-[#10100F]">
          {/* Column 1: Brand & Description (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateHome ? onNavigateHome() : scrollToTop()}
                className="flex items-center gap-2 text-left cursor-pointer"
              >
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-sm border-2 border-white/40 bg-[#10100F]"
                  aria-hidden="true"
                >
                  <div className="h-4 w-4 border border-[#C25E34] bg-[#080807]" />
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-[#FFFDF8]">
                  Moment<span className="font-sans font-semibold text-[#C25E34]">Press</span>
                </span>
              </button>
            </div>

            <p className="mt-3 text-sm text-[#C25E34] font-medium">
              {SITE_CONFIG.tagline}
            </p>

            <p className="mt-3 text-xs text-[#F3F0EA]/70 leading-relaxed max-w-sm">
              We turn meaningful photos into personalized frames and photo products made to be kept, gifted and remembered.
            </p>

            {/* Social quick access icons */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10100F] text-[#F3F0EA] hover:bg-[#C25E34] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Connect on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href={SITE_CONFIG.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10100F] text-[#F3F0EA] hover:bg-[#C25E34] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Follow on Instagram ${SITE_CONFIG.contact.instagramHandle}`}
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href={`tel:${SITE_CONFIG.contact.phone}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10100F] text-[#F3F0EA] hover:bg-[#C25E34] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Call direct line ${SITE_CONFIG.contact.phone}`}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore Links (2-3 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C25E34] mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateExistingDesigns ? onNavigateExistingDesigns() : (window.location.hash = '#existing-designs')}
                  className="text-[#F3F0EA]/70 hover:text-white transition-colors py-0.5 inline-block focus-visible:outline-2 focus-visible:outline-white rounded-xs cursor-pointer text-left"
                >
                  Existing Designs
                </button>
              </li>
              {SITE_CONFIG.navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-[#F3F0EA]/70 hover:text-white transition-colors py-0.5 inline-block focus-visible:outline-2 focus-visible:outline-white rounded-xs cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C25E34] mb-4">
              Contact
            </h3>
            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 text-[#C25E34] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-[#F3F0EA]/60 block font-sans">WhatsApp Orders</span>
                  <a
                    href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFFDF8] hover:text-[#C25E34] font-mono transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {SITE_CONFIG.whatsapp.displayNumber}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#C25E34] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-[#F3F0EA]/60 block font-sans">Direct Line</span>
                  <a
                    href={`tel:${SITE_CONFIG.contact.phone}`}
                    className="text-[#FFFDF8] hover:text-[#C25E34] font-mono transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {SITE_CONFIG.contact.displayPhone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#C25E34] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-[#F3F0EA]/60 block font-sans">Email Inquiries</span>
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="text-[#FFFDF8] hover:text-[#C25E34] transition-colors break-all focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {SITE_CONFIG.contact.email}
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-3">
                <Instagram className="h-4 w-4 text-[#C25E34] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[11px] text-[#F3F0EA]/60 block font-sans">Instagram</span>
                  <a
                    href={SITE_CONFIG.contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFFDF8] hover:text-[#C25E34] transition-colors focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {SITE_CONFIG.contact.instagramHandle}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Stay Connected / Newsletter (3 cols) */}
          <div className="lg:col-span-3">
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Row: Legal & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F3F0EA]/60">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span>© {new Date().getFullYear()} MomentPress. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setPolicyType('privacy')}
              className="hover:text-[#FFFDF8] transition-colors underline-offset-4 hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setPolicyType('terms')}
              className="hover:text-[#FFFDF8] transition-colors underline-offset-4 hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
            >
              Terms & Conditions
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#F3F0EA]/60 hover:text-[#FFFDF8] transition-colors cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {/* Policy Reader Modal */}
      <PolicyModal
        isOpen={policyType !== null}
        onClose={() => setPolicyType(null)}
        type={policyType}
      />
    </footer>
  );
};
