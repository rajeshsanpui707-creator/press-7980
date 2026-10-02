import React from 'react';
import { Star, CheckCircle, Sparkles } from 'lucide-react';
import { ReviewItem } from '../../types';

interface ReviewCardProps {
  review: ReviewItem;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const customerName = review.customerName || review.name || 'MomentPress Customer';
  const commentText = review.reviewText || review.comment || '';
  const photoUrl = review.customerPhoto || review.imageUrl || review.avatarUrl;
  const initial = customerName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col justify-between rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-4 sm:p-7 shadow-xs hover:border-[#10100F]/20 transition-all duration-200 relative font-sans">
      <div>
        {/* Top Meta: Star Rating + Featured Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
          <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                  i < review.rating ? 'fill-[#C25E34] text-[#C25E34]' : 'text-[#E8E4DC]'
                }`}
              />
            ))}
            <span className="text-[11px] sm:text-xs font-bold text-[#6B6258] ml-1">
              {review.rating}.0
            </span>
          </div>

          {review.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-semibold">
              <Sparkles className="h-2.5 w-2.5 fill-amber-500 text-amber-600" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Comment Text */}
        <p className="text-xs sm:text-[15px] text-[#171717] leading-relaxed mb-3 sm:mb-6 font-sans italic [text-wrap:pretty]">
          "{commentText}"
        </p>
      </div>

      {/* Customer Footer */}
      <div className="pt-3 sm:pt-4 border-t border-[#F3F0EA]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={customerName}
                referrerPolicy="no-referrer"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-[#F3F0EA] shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#FCF9F3] border border-[#F3F0EA] text-[#C25E34] font-serif font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                {initial}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs sm:text-sm text-[#171717] truncate">
                  {customerName}
                </span>
                {review.verified !== false && (
                  <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" aria-label="Verified Customer" />
                )}
              </div>

              {review.location && (
                <span className="text-[11px] sm:text-xs text-[#6B6258] block truncate">
                  {review.location}
                </span>
              )}
            </div>
          </div>

          {review.date && (
            <span className="text-[10px] sm:text-[11px] text-[#6B6258]/60 font-mono shrink-0">
              {review.date}
            </span>
          )}
        </div>

        {review.productPurchased && (
          <span className="mt-2.5 inline-block text-[10px] sm:text-[11px] font-medium text-[#C25E34] bg-[#FCF9F3] px-2 py-0.5 rounded-sm border border-[#F3F0EA] truncate max-w-full">
            {review.productPurchased}
          </span>
        )}
      </div>
    </div>
  );
};
