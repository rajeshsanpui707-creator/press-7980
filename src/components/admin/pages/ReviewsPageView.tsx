import React, { useState, useEffect } from 'react';
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  AlertTriangle,
  Search,
  MessageSquareQuote,
  Sparkles,
  MapPin,
  Calendar,
  Package,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { ReviewItem } from '../../../types/admin';

export const ReviewsPageView: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => AdminService.getReviews());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [deletingReview, setDeletingReview] = useState<ReviewItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden' | 'featured'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  // Form fields
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formRating, setFormRating] = useState<number>(0); // Starts at 0, admin must explicitly choose 1..5
  const [formReviewText, setFormReviewText] = useState('');
  const [formCustomerPhoto, setFormCustomerPhoto] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formProductPurchased, setFormProductPurchased] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formVisible, setFormVisible] = useState<boolean>(true);
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formVerified, setFormVerified] = useState<boolean>(true);

  const reload = () => {
    setReviews(AdminService.getReviews());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Reviews refreshed from server.');
    } catch {
      showError('Failed to refresh reviews from server.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setErrorNotice(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorNotice(msg);
    setTimeout(() => setErrorNotice(null), 5000);
  };

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormCustomerName('');
    setFormRating(0); // Admin must explicitly select
    setFormReviewText('');
    setFormCustomerPhoto('');
    setFormLocation('Kolkata');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormProductPurchased('Custom Photo Frame (8×10 in)');
    setFormDisplayOrder(reviews.length + 1);
    setFormVisible(true);
    setFormFeatured(false);
    setFormVerified(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (review: ReviewItem) => {
    setEditingReview(review);
    setFormCustomerName(review.customerName || review.name || '');
    setFormRating(review.rating || 5);
    setFormReviewText(review.reviewText || review.comment || '');
    setFormCustomerPhoto(review.customerPhoto || review.imageUrl || review.image || '');
    setFormLocation(review.location || '');
    setFormDate(review.date || '');
    setFormProductPurchased(review.productPurchased || '');
    setFormDisplayOrder(review.displayOrder || 1);
    setFormVisible(review.visible !== false && review.active !== false);
    setFormFeatured(Boolean(review.featured));
    setFormVerified(review.verified !== false);
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (review: ReviewItem) => {
    const newVisible = review.visible === false ? true : false;
    const updated = reviews.map((r) =>
      r.id === review.id ? { ...r, visible: newVisible, active: newVisible } : r
    );
    setReviews(updated);
    const res = await AdminService.saveReviews(updated);
    if (res.success) {
      showNotice(`Review by "${review.customerName || review.name}" is now ${newVisible ? 'visible on storefront' : 'hidden from public view'}.`);
    } else {
      showError(res.error || 'Failed to update review visibility');
      reload();
    }
  };

  const handleToggleFeatured = async (review: ReviewItem) => {
    const newFeatured = !review.featured;
    const updated = reviews.map((r) =>
      r.id === review.id ? { ...r, featured: newFeatured } : r
    );
    setReviews(updated);
    const res = await AdminService.saveReviews(updated);
    if (res.success) {
      showNotice(`Review by "${review.customerName || review.name}" is now ${newFeatured ? 'marked as featured' : 'unmarked from featured'}.`);
    } else {
      showError(res.error || 'Failed to update featured status');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formCustomerName.trim();
    const trimmedText = formReviewText.trim();

    if (!trimmedName) {
      showError('Please enter the customer name.');
      return;
    }
    if (!formRating || formRating < 1 || formRating > 5) {
      showError('Please select a star rating between 1 and 5 stars.');
      return;
    }
    if (!trimmedText) {
      showError('Please enter the review text.');
      return;
    }

    setIsSaving(true);
    try {
      const reviewPayload: ReviewItem = {
        id: editingReview ? editingReview.id : `REV-${Date.now().toString(36).toUpperCase()}`,
        customerName: trimmedName,
        name: trimmedName,
        rating: Number(formRating),
        reviewText: trimmedText,
        comment: trimmedText,
        customerPhoto: formCustomerPhoto.trim() || undefined,
        imageUrl: formCustomerPhoto.trim() || undefined,
        location: formLocation.trim() || undefined,
        date: formDate.trim() || new Date().toISOString().split('T')[0],
        productPurchased: formProductPurchased.trim() || undefined,
        displayOrder: Number(formDisplayOrder) || 1,
        visible: formVisible,
        active: formVisible,
        featured: formFeatured,
        verified: formVerified,
      };

      let updatedList: ReviewItem[];
      if (editingReview) {
        updatedList = reviews.map((r) => (r.id === editingReview.id ? reviewPayload : r));
      } else {
        updatedList = [...reviews, reviewPayload];
      }

      const res = await AdminService.saveReviews(updatedList);
      if (res.success) {
        setReviews(updatedList);
        setIsModalOpen(false);
        showNotice(editingReview ? 'Review updated successfully.' : 'New review added and saved to server.');
      } else {
        showError(res.error || 'Failed to save review to server.');
      }
    } catch {
      showError('Network error while saving review.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    setIsDeleting(true);
    try {
      const updatedList = reviews.filter((r) => r.id !== deletingReview.id);
      const res = await AdminService.saveReviews(updatedList);
      if (res.success) {
        setReviews(updatedList);
        setDeletingReview(null);
        showNotice('Review deleted successfully from server.');
      } else {
        showError(res.error || 'Failed to delete review from server.');
      }
    } catch {
      showError('Network error while deleting review.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredReviews = reviews
    .filter((r) => {
      const name = (r.customerName || r.name || '').toLowerCase();
      const text = (r.reviewText || r.comment || '').toLowerCase();
      const loc = (r.location || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || name.includes(q) || text.includes(q) || loc.includes(q);

      const isVis = r.visible !== false && r.active !== false;
      let matchesStatus = true;
      if (statusFilter === 'visible') matchesStatus = isVis;
      if (statusFilter === 'hidden') matchesStatus = !isVis;
      if (statusFilter === 'featured') matchesStatus = Boolean(r.featured);

      const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;

      return matchesSearch && matchesStatus && matchesRating;
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const totalCount = reviews.length;
  const visibleCount = reviews.filter((r) => r.visible !== false && r.active !== false).length;
  const hiddenCount = reviews.filter((r) => r.visible === false || r.active === false).length;
  const featuredCount = reviews.filter((r) => Boolean(r.featured)).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#C25E34]/10 text-[#C25E34] flex items-center justify-center font-bold">
                <Star className="h-4 w-4 fill-[#C25E34]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Reviews CMS</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage verified customer reviews and ratings. Only intentional Admin-approved reviews are displayed publicly. Zero fake reviews permitted.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh from server"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Review</span>
            </button>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <span className="text-gray-500">
            Total: <strong className="text-gray-900 font-semibold">{totalCount}</strong>
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-emerald-700">
            Published: <strong className="font-semibold">{visibleCount}</strong>
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-stone-500">
            Hidden: <strong className="font-semibold">{hiddenCount}</strong>
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-amber-700">
            Featured: <strong className="font-semibold">{featuredCount}</strong>
          </span>
        </div>

        {/* Notice Banners */}
        {notice && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}
        {errorNotice && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, review, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20"
          >
            <option value="all">All Statuses</option>
            <option value="visible">Published Only</option>
            <option value="hidden">Hidden Only</option>
            <option value="featured">Featured Only</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20"
          >
            <option value="all">All Ratings</option>
            <option value={5}>5 Stars ★★★★★</option>
            <option value={4}>4 Stars ★★★★☆</option>
            <option value={3}>3 Stars ★★★☆☆</option>
            <option value={2}>2 Stars ★★☆☆☆</option>
            <option value={1}>1 Star ★☆☆☆☆</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || ratingFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRatingFilter('all');
              }}
              className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-[#FCF9F3] text-[#C25E34] flex items-center justify-center mx-auto mb-3">
            <MessageSquareQuote className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {reviews.length === 0 ? 'No Reviews in CMS' : 'No Reviews Matching Filters'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
            {reviews.length === 0
              ? 'There are currently zero reviews in the system. Click "Add Review" to add genuine customer testimonials.'
              : 'Try clearing your search query or adjusting your status and rating filters.'}
          </p>
          {reviews.length === 0 && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Review</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="py-3 px-3 w-14 text-center">Order</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-3 w-28">Rating</th>
                    <th className="py-3 px-4">Review Text</th>
                    <th className="py-3 px-3 w-24">Date</th>
                    <th className="py-3 px-3 w-24 text-center">Featured</th>
                    <th className="py-3 px-3 w-28 text-center">Visibility</th>
                    <th className="py-3 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReviews.map((review) => {
                    const isVis = review.visible !== false && review.active !== false;
                    const name = review.customerName || review.name || 'Anonymous Customer';
                    const text = review.reviewText || review.comment || '';

                    return (
                      <tr key={review.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Display Order */}
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-gray-500">
                          #{review.displayOrder || 1}
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            {review.customerPhoto || review.imageUrl ? (
                              <img
                                src={review.customerPhoto || review.imageUrl}
                                alt={name}
                                referrerPolicy="no-referrer"
                                className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-[#FCF9F3] border border-[#F3F0EA] text-[#C25E34] font-serif font-bold text-xs flex items-center justify-center shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 truncate">{name}</span>
                                {review.verified !== false && (
                                  <span title="Verified Customer">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  </span>
                                )}
                              </div>
                              {review.location && (
                                <span className="text-[11px] text-gray-400 block truncate">{review.location}</span>
                              )}
                              {review.productPurchased && (
                                <span className="text-[10px] text-[#C25E34] bg-[#FCF9F3] px-1.5 py-0.2 rounded-xs border border-[#F3F0EA] inline-block mt-0.5 truncate max-w-[180px]">
                                  {review.productPurchased}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Star Rating */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-0.5" title={`${review.rating} / 5 stars`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? 'fill-[#C25E34] text-[#C25E34]' : 'text-gray-200'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-[11px] font-bold text-gray-700">{review.rating}.0</span>
                          </div>
                        </td>

                        {/* Review Text */}
                        <td className="py-3.5 px-4 max-w-xs xl:max-w-md">
                          <p className="text-gray-700 leading-relaxed line-clamp-2 italic" title={text}>
                            "{text}"
                          </p>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-3 text-[11px] text-gray-500 font-mono">
                          {review.date || '—'}
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(review)}
                            className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                              review.featured
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'text-gray-300 hover:text-amber-600 hover:bg-gray-100'
                            }`}
                            title={review.featured ? 'Featured on storefront (click to remove)' : 'Mark as featured'}
                          >
                            <Sparkles className={`h-4 w-4 ${review.featured ? 'fill-amber-500 text-amber-600' : ''}`} />
                          </button>
                        </td>

                        {/* Visibility Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(review)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                              isVis
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                            }`}
                            title={isVis ? 'Click to hide from public site' : 'Click to publish on website'}
                          >
                            {isVis ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            <span>{isVis ? 'Visible' : 'Hidden'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(review)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                              title="Edit Review"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingReview(review)}
                              className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (< md: 320px..767px) */}
          <div className="md:hidden space-y-3">
            {filteredReviews.map((review) => {
              const isVis = review.visible !== false && review.active !== false;
              const name = review.customerName || review.name || 'Anonymous Customer';
              const text = review.reviewText || review.comment || '';

              return (
                <div
                  key={review.id}
                  className={`bg-white rounded-xl border p-4 shadow-2xs space-y-3 transition-colors ${
                    isVis ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {review.customerPhoto || review.imageUrl ? (
                        <img
                          src={review.customerPhoto || review.imageUrl}
                          alt={name}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-full object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#FCF9F3] border border-[#F3F0EA] text-[#C25E34] font-serif font-bold text-xs flex items-center justify-center shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-900 truncate">{name}</span>
                          {review.verified !== false && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        {review.location && (
                          <span className="text-[11px] text-gray-500 block truncate">{review.location}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono text-[11px] text-gray-400">#{review.displayOrder || 1}</span>
                      {review.featured && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">
                          <Sparkles className="h-2.5 w-2.5 fill-amber-500" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating ? 'fill-[#C25E34] text-[#C25E34]' : 'text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-bold text-gray-800">{review.rating}.0</span>
                    </div>

                    {review.date && (
                      <span className="text-[10px] text-gray-400 font-mono">{review.date}</span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                    "{text}"
                  </p>

                  {review.productPurchased && (
                    <div className="text-[10px] text-[#C25E34] font-medium bg-[#FCF9F3] px-2 py-1 rounded-sm border border-[#F3F0EA]">
                      Purchased: {review.productPurchased}
                    </div>
                  )}

                  {/* Actions & Toggles */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(review)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                          isVis
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {isVis ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{isVis ? 'Visible' : 'Hidden'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(review)}
                        className={`p-1 rounded-md text-xs cursor-pointer ${
                          review.featured ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title="Toggle Featured"
                      >
                        <Sparkles className={`h-4 w-4 ${review.featured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(review)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingReview(review)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full max-h-[92vh] overflow-y-auto my-auto flex flex-col font-sans">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#C25E34]/10 text-[#C25E34] flex items-center justify-center font-bold">
                  <Star className="h-4 w-4 fill-[#C25E34]" />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingReview ? 'Edit Review' : 'Add New Customer Review'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-4 sm:p-6 space-y-4 flex-1">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourav Mukherjee"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Rating <span className="text-rose-500">*</span> ({formRating ? `${formRating} of 5 stars` : 'Select rating'})
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        key={starNum}
                        type="button"
                        onClick={() => setFormRating(starNum)}
                        className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer"
                        title={`${starNum} Star${starNum > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            starNum <= formRating
                              ? 'fill-[#C25E34] text-[#C25E34]'
                              : 'text-gray-300 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-gray-700 ml-auto">
                    {formRating > 0 ? `${formRating} / 5` : 'Not Selected'}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Review Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter the authentic customer feedback..."
                  value={formReviewText}
                  onChange={(e) => setFormReviewText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              {/* Two columns: Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>Location (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bowbazar, Kolkata"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>Date (Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Product Purchased & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Package className="h-3 w-3 text-gray-400" />
                    <span>Product Purchased (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Photo Frame (8×10 in)"
                    value={formProductPurchased}
                    onChange={(e) => setFormProductPurchased(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Customer Photo / Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Customer Photo / Avatar URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://... or Google Drive image link"
                  value={formCustomerPhoto}
                  onChange={(e) => setFormCustomerPhoto(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Leave blank if customer did not provide a photo. Studio will show customer initial monogram.
                </span>
              </div>

              {/* Toggles: Visible, Featured, Verified */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                {/* Visible on Website */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Publish on Website</span>
                    <span className="text-[11px] text-gray-500 block">
                      When enabled, review appears on storefront. When disabled, kept privately in Admin.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formVisible}
                      onChange={(e) => setFormVisible(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Mark as Featured */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-900 block flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-600 fill-amber-500" />
                      <span>Featured Review</span>
                    </span>
                    <span className="text-[11px] text-amber-800/80 block">
                      Highlights this review. Note: Must also be Published=ON to appear on storefront.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Verified Customer */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Verified Purchase Badge</span>
                    <span className="text-[11px] text-gray-500 block">
                      Displays a green verified customer checkmark next to the name.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#10100F]"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#10100F] hover:bg-[#2A2927] text-white text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-sm w-full p-5 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete Review?</h3>
                <span className="text-xs text-gray-500">This action cannot be undone.</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              Are you sure you want to permanently remove the review by{' '}
              <strong className="text-gray-900">
                {deletingReview.customerName || deletingReview.name}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
