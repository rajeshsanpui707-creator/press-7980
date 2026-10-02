export * from './order';

export type FrameSizeId = '5x7' | '6x8' | '8x10' | '10x12' | '12x18';
export type FrameTierId = 'good' | 'better' | 'best';
export type FrameFinish =
  | 'natural-oak'
  | 'classic-black'
  | 'matte-black'
  | 'warm-walnut'
  | 'rich-walnut'
  | 'gallery-white';

export type OrderStep = 1 | 2 | 3 | 4 | 5;

export interface FrameSizeConfig {
  id: FrameSizeId;
  name: string;
  dimensionInches: string;
  dimensionCm: string;
  recommendedFor: string;
  aspectRatio: string;
  basePrice: number;
  popular?: boolean;
  isPopular?: boolean;
  badge?: string;
  prices: {
    standard: number;
    velvet?: number;
    archival?: number;
  };
}

export interface FrameTierConfig {
  id: FrameTierId;
  name: string;
  description: string;
  paperType: string;
  finish: string;
  longevity: string;
  priceDelta: number;
  badge?: string;
  popular?: boolean;
}

export interface FrameFinishConfig {
  id: FrameFinish;
  name: string;
  hex: string;
  texture: string;
}

export interface GalleryItemData {
  id: string;
  title: string;
  category: string;
  size?: string;
  sizeLabel?: string;
  finish?: FrameFinish;
  aspectRatioClass: string;
  description?: string;
  caption?: string;
  src?: string;
  alt?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  priceLabel: string;
  startingPrice: number;
  originalStartingPrice?: number;
  isPrimary?: boolean;
  features: string[];
  ctaLabel?: string;
  ctaText?: string;
  specsNote?: string;
}

export interface ReviewItem {
  id: string;
  name?: string;
  customerName?: string;
  location?: string;
  rating: number;
  date: string;
  comment?: string;
  reviewText?: string;
  verified?: boolean;
  productPurchased?: string;
  active?: boolean;
  visible?: boolean;
  featured?: boolean;
  customerPhoto?: string;
  imageUrl?: string;
  avatarUrl?: string;
  displayOrder?: number;
}
