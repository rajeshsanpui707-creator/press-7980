import React, { useState, useEffect } from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Container } from './Container';
import { MobileNavigation } from './MobileNavigation';
import { SITE_CONFIG } from '../../lib/config/site-config';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';

interface HeaderProps {
  currentPage?: 'home' | 'existing-designs' | 'admin';
  onNavigateHome?: (targetSection?: string) => void;
  onNavigateExistingDesigns?: () => void;
  onNavigateAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage = 'home',
  onNavigateHome = () => {},
  onNavigateExistingDesigns = () => {},
  onNavigateAdmin = () => {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (currentPage === 'existing-designs') {
      e.preventDefault();
      const section = href.replace('#', '');
      onNavigateHome(section || undefined);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-[#FFFDF8]/95 backdrop-blur-md shadow-2xs border-b border-[#F3F0EA] py-2 sm:py-3'
            : 'bg-[#FFFDF8] border-b border-[#F3F0EA]/80 py-2 sm:py-4'
        }`}
      >
        <Container size="wide">
          <div className="flex items-center justify-between gap-2">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center shrink-0">
              <Logo
                variant="header"
                onClick={() => onNavigateHome()}
              />
            </div>

            {/* Zone 2: Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center space-x-7 text-sm font-medium text-[#6B6258]"
              aria-label="Main Navigation"
            >
              {SITE_CONFIG.navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className={`transition-colors hover:text-[#10100F] focus-visible:outline-2 focus-visible:outline-[#10100F] py-1 ${
                    currentPage === 'home' && link.href === '#home' ? 'text-[#10100F] font-semibold' : ''
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Zone 3: Action Buttons & Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* "Existing Designs" Button - Real button in website UI */}
              <button
                type="button"
                onClick={onNavigateExistingDesigns}
                className="inline-flex items-center justify-center rounded-lg bg-[#10100F] px-2 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-white shadow-xs hover:bg-[#2A2927] active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer"
                aria-label="Existing Designs"
              >
                Existing Designs
              </button>

              {/* WhatsApp Button on Desktop & Tablet */}
              <a
                href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2A2927] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F]"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-[#171717] hover:bg-[#F3F0EA] focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        onNavigateHome={onNavigateHome}
        onNavigateExistingDesigns={onNavigateExistingDesigns}
        onNavigateAdmin={onNavigateAdmin}
      />
    </>
  );
};
