import React, { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { ReviewCard } from './ReviewCard';
import { REVIEWS_SECTION_DATA } from '../../data/reviews';
import { AdminService } from '../../lib/admin/admin-service';
import { ReviewItem } from '../../types';
import { MessageSquareQuote } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const loadActiveReviews = (): ReviewItem[] => {
    return AdminService.getReviews()
      .filter((r) => r.active !== false && r.visible !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((r) => ({
        id: r.id,
        name: r.customerName || r.name || 'Customer',
        customerName: r.customerName || r.name || 'Customer',
        location: r.location || '',
        rating: r.rating,
        date: r.date || '',
        comment: r.reviewText || r.comment || '',
        reviewText: r.reviewText || r.comment || '',
        customerPhoto: r.customerPhoto || r.imageUrl || r.avatarUrl || '',
        imageUrl: r.imageUrl || r.customerPhoto || '',
        avatarUrl: r.avatarUrl || r.customerPhoto || '',
        featured: Boolean(r.featured),
        verified: r.verified !== false,
        productPurchased: r.productPurchased || '',
        displayOrder: r.displayOrder || 0,
      }));
  };

  const [reviews, setReviews] = useState<ReviewItem[]>(loadActiveReviews);

  useEffect(() => {
    AdminService.fetchPublicConfig().then(() => {
      setReviews(loadActiveReviews());
    });
  }, []);

  const sectionConfig = AdminService.getHomepageSections().find((s) => s.id === 'reviews');
  const title = sectionConfig?.name || REVIEWS_SECTION_DATA.heading;
  const subtitle = sectionConfig?.description || REVIEWS_SECTION_DATA.supportingText;

  return (
    <section
      id="reviews"
      className="py-6 sm:py-20 bg-[#FCF9F3]/60 border-b border-[#F3F0EA]"
      aria-labelledby="reviews-heading"
    >
      <Container size="wide">
        <SectionHeading
          kicker={REVIEWS_SECTION_DATA.kicker}
          title={title}
          subtitle={subtitle}
        />

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#F3F0EA] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FCF9F3] text-[#C25E34] mx-auto mb-3">
              <MessageSquareQuote className="h-6 w-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#171717]">
              No reviews yet
            </h3>
            <p className="text-xs text-[#6B6258] mt-1 leading-relaxed max-w-md mx-auto">
              Verified customer reviews will appear here once published by the studio.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
};
