import React, { useState, useEffect } from 'react';
import { ArrowLeft, Instagram, ExternalLink, ArrowRight, MessageCircle } from 'lucide-react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { GalleryItem } from '../gallery/GalleryItem';
import { GalleryLightbox } from '../gallery/GalleryLightbox';
import { GALLERY_ITEMS } from '../../data/gallery';
import { SITE_CONFIG } from '../../lib/config/site-config';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';
import { AdminService } from '../../lib/admin/admin-service';
import { getSafeImageSource } from '../../lib/drive/google-drive';
import { GalleryItemData, FrameFinish } from '../../types';

interface ExistingDesignsPageProps {
  onNavigateHome: (targetSection?: string) => void;
  onOpenCustomizer?: () => void;
}

export const ExistingDesignsPage: React.FC<ExistingDesignsPageProps> = ({
  onNavigateHome,
  onOpenCustomizer,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const getLiveGalleryItems = (): GalleryItemData[] => {
    try {
      const cmsDesigns = AdminService.getExistingDesigns();
      if (Array.isArray(cmsDesigns)) {
        const activeDesigns = cmsDesigns
          .filter((d) => d.active !== false && d.visible !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        return activeDesigns.map((d) => {
          const safeSrc = getSafeImageSource(d.driveUrl || d.googleDriveLink || d.image);
          return {
            id: d.id,
            title: d.title || d.name,
            category: d.category || 'Curated Design',
            size: d.size || '8×10 in',
            sizeLabel: d.size || '8×10 in',
            finish: (d.finish as FrameFinish) || 'natural-oak',
            aspectRatioClass: 'aspect-[3/4]',
            caption: d.shortDescription || d.description,
            description: d.description,
            alt: d.title || d.name,
            src: safeSrc || undefined,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  };

  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(getLiveGalleryItems);

  useEffect(() => {
    AdminService.fetchPublicConfig().then(() => {
      setGalleryItems(getLiveGalleryItems());
    });
  }, []);

  const handleOpenLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const handleStartCustomizing = () => {
    if (onOpenCustomizer) {
      onOpenCustomizer();
    }
    onNavigateHome('products');
  };

  return (
    <div className="bg-[#FFFDF8] py-4 sm:py-16 min-h-[70vh]">
      <Container size="wide">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-3 sm:mb-8">
          <button
            type="button"
            onClick={() => onNavigateHome()}
            className="inline-flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs sm:text-sm font-semibold text-[#6B6258] hover:text-[#10100F] hover:bg-[#F3F0EA] transition-colors group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
            aria-label="Back to Homepage"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Required Exact Page Heading */}
        <SectionHeading
          asHeading="h1"
          kicker="Tangible Memories"
          title="Moments, made tangible."
          subtitle="A few memories brought to life through MomentPress."
          className="mb-4 sm:mb-14"
        />

        {/* Existing Designs Showcase Grid: 2 columns on mobile, 3 columns on desktop */}
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 lg:gap-8 mb-6 sm:mb-14">
            {galleryItems.map((item, index) => (
              <GalleryItem
                key={item.id}
                item={item}
                index={index}
                onClick={() => handleOpenLightbox(index)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center bg-[#FCF9F3] border border-[#F3F0EA] rounded-2xl mb-8 sm:mb-14">
            <p className="font-serif text-base sm:text-lg text-[#171717] font-semibold mb-2">
              No designs are currently displayed
            </p>
            <p className="text-xs sm:text-sm text-[#6B6258] max-w-md mx-auto">
              Our studio gallery is being updated. You can still create your bespoke custom frame or contact our team directly on WhatsApp.
            </p>
          </div>
        )}

        {/* Inspiration & Action Banner */}
        <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-[#FCF9F3] p-3.5 sm:p-10 mb-5 sm:mb-12 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-6 text-center md:text-left">
            <div>
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#C25E34]">
                Customized for you
              </span>
              <h2 className="font-serif text-base sm:text-2xl font-bold text-[#171717] mt-0.5 sm:mt-1">
                Inspired by these designs?
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6258] mt-1 sm:mt-1.5 max-w-xl">
                Every frame shown above is handcrafted using solid moldings, archival paper, and anti-glare protective glass. Customize yours in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
              {/* Black button with White text */}
              <button
                type="button"
                onClick={handleStartCustomizing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xs active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[46px]"
              >
                <span>Customize Your Frame</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <a
                href={createWhatsAppLink(WHATSAPP_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-[#F3F0EA] border border-[#F3F0EA] px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#171717] shadow-2xs active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] min-h-[44px] sm:min-h-[46px]"
                aria-label="Ask about existing designs on WhatsApp"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                <span>WhatsApp Query</span>
              </a>
            </div>
          </div>
        </div>

        {/* Instagram Visual Showcase Under Gallery */}
        <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-[#FCF9F3] border border-[#F3F0EA] max-w-xl mx-auto">
          <h2 className="text-xs sm:text-sm font-serif font-bold text-[#171717] mb-1">
            See more moments on Instagram
          </h2>
          <p className="text-[11px] sm:text-xs text-[#6B6258] mb-3.5 sm:mb-5 max-w-sm">
            Explore daily customer frame unveilings, sticker sheets, and behind-the-scenes framing at our Kolkata studio.
          </p>
          <a
            href={SITE_CONFIG.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#2A2927] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[#10100F] max-w-full text-center flex-wrap"
            aria-label={`Follow us on Instagram ${SITE_CONFIG.contact.instagramHandle} (opens in new tab)`}
          >
            <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Follow us on Instagram ({SITE_CONFIG.contact.instagramHandle})</span>
            <ExternalLink className="h-3.5 w-3.5 text-white/60 shrink-0" aria-hidden="true" />
          </a>
        </div>

        {/* Accessible Lightbox Modal */}
        <GalleryLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          items={galleryItems}
          currentIndex={activeIndex}
          onSelectIndex={setActiveIndex}
        />
      </Container>
    </div>
  );
};
