import React, { useEffect } from 'react';
import { X, MessageCircle, ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '../../lib/config/site-config';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: 'home' | 'existing-designs' | 'admin';
  onNavigateHome?: (targetSection?: string) => void;
  onNavigateExistingDesigns?: () => void;
  onNavigateAdmin?: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  currentPage = 'home',
  onNavigateHome = () => {},
  onNavigateExistingDesigns = () => {},
  onNavigateAdmin = () => {},
}) => {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onClose();
    if (currentPage === 'existing-designs') {
      e.preventDefault();
      const section = href.replace('#', '');
      onNavigateHome(section || undefined);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      onClick={onClose}
    >
      {/* Sliding Drawer Container */}
      <div
        className="relative flex h-full w-full max-w-[280px] xs:max-w-xs flex-col justify-between bg-[#FFFDF8] p-4 sm:p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-[#F3F0EA]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Top Header inside drawer */}
          <div className="flex items-center justify-between border-b border-[#F3F0EA] pb-3 sm:pb-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateHome();
              }}
              className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#10100F] text-left cursor-pointer"
            >
              Moment<span className="font-sans font-semibold text-[#C25E34]">Press</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-[#6B6258] hover:bg-[#F3F0EA] hover:text-[#171717] focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Prominent "Existing Designs" button for mobile */}
          <div className="mt-3.5 mb-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateExistingDesigns();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10100F] py-2.5 sm:py-3.5 px-3.5 sm:px-4 text-xs sm:text-base font-semibold text-white shadow-sm hover:bg-[#2A2927] active:scale-[0.98] transition-colors min-h-[44px] sm:min-h-[48px] focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer"
              aria-label="Existing Designs"
            >
              <span>Existing Designs</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Canonical 5 Mobile Nav items */}
          <nav className="mt-2.5 flex flex-col space-y-0.5" aria-label="Mobile Navigation Links">
            {SITE_CONFIG.navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="flex items-center justify-between py-2.5 sm:py-3.5 px-3 text-sm sm:text-base font-semibold text-[#171717] rounded-lg transition-colors hover:bg-[#FCF9F3] hover:text-[#10100F] min-h-[42px] sm:min-h-[44px]"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 text-[#10100F]/40" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>

        {/* WhatsApp Conversion CTA in Mobile Menu */}
        <div className="pt-4 sm:pt-6 border-t border-[#F3F0EA]">
          <p className="mb-2 text-xs text-[#6B6258] font-sans">
            Ready to frame a memory? Chat with us:
          </p>
          <a
            href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10100F] py-2.5 sm:py-3.5 px-3.5 sm:px-4 text-xs sm:text-base font-semibold text-white shadow-sm hover:bg-[#080807] active:scale-[0.98] transition-colors min-h-[44px] sm:min-h-[48px] focus-visible:outline-2 focus-visible:outline-[#10100F]"
            aria-label="Order on WhatsApp (opens in new tab)"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" aria-hidden="true" />
            <span>Order on WhatsApp</span>
          </a>

          <div className="mt-4 text-center text-xs text-[#6B6258] font-mono">
            <span>{SITE_CONFIG.tagline}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
