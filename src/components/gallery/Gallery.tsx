import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { GalleryItem } from './GalleryItem';
import { GalleryLightbox } from './GalleryLightbox';
import { GALLERY_SECTION_DATA } from '../../data/gallery';
import { SITE_CONFIG } from '../../lib/config/site-config';
import { Instagram, ExternalLink } from 'lucide-react';
import { AdminService } from '../../lib/admin/admin-service';
import { getSafeImageSource } from '../../lib/drive/google-drive';
import { GalleryItemData, FrameFinish } from '../../types';

export const Gallery: React.FC = () => {
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

  return (
    <section
      id="gallery"
      className="py-6 sm:py-20 bg-[#FFFDF8] border-b border-[#F3F0EA]"
      aria-labelledby="gallery-heading"
    >
      <Container size="wide">
        <SectionHeading
          kicker="Tangible Memories"
          title={GALLERY_SECTION_DATA.heading}
          subtitle={GALLERY_SECTION_DATA.supportingText}
        />

        {/* Gallery Grid: Mobile 2 columns, Desktop 3 columns */}
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8 mb-6 sm:mb-14">
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

        {/* Instagram Visual Showcase Under Gallery */}
        <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-[#FCF9F3] border border-[#F3F0EA] max-w-xl mx-auto">
          <p className="text-xs sm:text-sm font-serif font-bold text-[#171717] mb-1">
            See more moments on Instagram
          </p>
          <p className="text-[11px] sm:text-xs text-[#6B6258] mb-3.5 sm:mb-5 max-w-sm">
            Explore daily customer frame unveilings, sticker sheets, and behind-the-scenes framing at our Kolkata studio.
          </p>
          <a
            href={SITE_CONFIG.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#080807] active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-[#10100F] max-w-full text-center flex-wrap"
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
    </section>
  );
};

export const GallerySection = Gallery;
