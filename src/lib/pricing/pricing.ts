import { FrameSizeId, FrameTierId, StickerSize } from '../../types';
import { AdminService } from '../admin/admin-service';

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Fallback prices in case storage is uninitialized
const FALLBACK_FRAME_PRICES: Record<FrameSizeId, number> = {
  '5x7': 199,
  '6x8': 249,
  '8x10': 349,
  '10x12': 449,
  '12x18': 599,
};

const FALLBACK_TIER_DELTAS: Record<FrameTierId, number> = {
  good: 0,
  better: 50,
  best: 100,
};

const FALLBACK_STICKER_PRICES: Record<StickerSize, number> = {
  Small: 99,
  Medium: 149,
  Large: 199,
};

// --- FRAMES PRICING ---

export function getFrameSizeConfig(sizeId: FrameSizeId) {
  const sizes = AdminService.getFrameSizes();
  return sizes.find((s) => s.id === sizeId);
}

export function getFrameTierConfig(tierId: FrameTierId = 'good') {
  const tiers = AdminService.getQualityTiers();
  return tiers.find((t) => t.id === tierId);
}

export function getFrameOriginalPrice(sizeId: FrameSizeId, tierId: FrameTierId = 'good'): number {
  const sizeConfig = getFrameSizeConfig(sizeId);
  const tierConfig = getFrameTierConfig(tierId);

  const baseOriginal = sizeConfig
    ? Number(sizeConfig.originalPrice ?? sizeConfig.basePrice) || FALLBACK_FRAME_PRICES[sizeId] || 249
    : FALLBACK_FRAME_PRICES[sizeId] || 249;

  const tierOriginalDelta = tierConfig
    ? Number(tierConfig.originalPriceDelta ?? tierConfig.priceAdjustment) || 0
    : FALLBACK_TIER_DELTAS[tierId] || 0;

  return baseOriginal + tierOriginalDelta;
}

export function getFramePrice(sizeId: FrameSizeId, tierId: FrameTierId = 'good'): number {
  const sizeConfig = getFrameSizeConfig(sizeId);
  const tierConfig = getFrameTierConfig(tierId);

  let sellingPrice = sizeConfig
    ? Number(sizeConfig.sellingPrice ?? sizeConfig.basePrice) || FALLBACK_FRAME_PRICES[sizeId] || 249
    : FALLBACK_FRAME_PRICES[sizeId] || 249;

  const tierDelta = tierConfig
    ? Number(tierConfig.priceAdjustment ?? tierConfig.originalPriceDelta) || 0
    : FALLBACK_TIER_DELTAS[tierId] || 0;

  return sellingPrice + tierDelta;
}

export function hasFrameDiscount(sizeId: FrameSizeId): boolean {
  const sizeConfig = getFrameSizeConfig(sizeId);
  if (!sizeConfig || !sizeConfig.discountActive) return false;
  const original = Number(sizeConfig.originalPrice ?? sizeConfig.basePrice) || 0;
  const selling = Number(sizeConfig.sellingPrice ?? sizeConfig.basePrice) || 0;
  return original > 0 && selling < original;
}

export function getFrameDiscountInfo(sizeId: FrameSizeId) {
  const sizeConfig = getFrameSizeConfig(sizeId);
  const original = sizeConfig ? Number(sizeConfig.originalPrice ?? sizeConfig.basePrice) || 249 : 249;
  const selling = sizeConfig ? Number(sizeConfig.sellingPrice ?? sizeConfig.basePrice) || original : original;
  const hasDiscount = Boolean(sizeConfig?.discountActive && selling < original);
  const discountAmount = hasDiscount ? original - selling : 0;
  const discountPercentage = hasDiscount ? Math.round((discountAmount / original) * 100) : 0;

  return {
    originalPrice: original,
    sellingPrice: selling,
    hasDiscount,
    discountAmount,
    discountPercentage,
  };
}

// --- STICKERS PRICING ---

export function getStickerSizeConfig(size: StickerSize) {
  const stickers = AdminService.getStickerSizes();
  return stickers.find((s) => s.id === size);
}

export function getStickerOriginalPrice(size: StickerSize): number {
  const config = getStickerSizeConfig(size);
  return config ? Number(config.originalPrice ?? config.price) || FALLBACK_STICKER_PRICES[size] || 99 : FALLBACK_STICKER_PRICES[size] || 99;
}

export function getStickerPrice(size: StickerSize): number {
  const config = getStickerSizeConfig(size);
  return config ? Number(config.sellingPrice ?? config.price) || FALLBACK_STICKER_PRICES[size] || 99 : FALLBACK_STICKER_PRICES[size] || 99;
}

export function hasStickerDiscount(size: StickerSize): boolean {
  const config = getStickerSizeConfig(size);
  if (!config || !config.discountActive) return false;
  const orig = Number(config.originalPrice ?? config.price) || 0;
  const selling = Number(config.sellingPrice ?? config.price) || 0;
  return orig > 0 && selling < orig;
}

export function getStickerDiscountInfo(size: StickerSize) {
  const config = getStickerSizeConfig(size);
  const original = config ? Number(config.originalPrice ?? config.price) || 99 : 99;
  const selling = config ? Number(config.sellingPrice ?? config.price) || original : original;
  const hasDiscount = Boolean(config?.discountActive && selling < original);
  const discountAmount = hasDiscount ? original - selling : 0;
  const discountPercentage = hasDiscount ? Math.round((discountAmount / original) * 100) : 0;

  return {
    originalPrice: original,
    sellingPrice: selling,
    hasDiscount,
    discountAmount,
    discountPercentage,
  };
}

export function getStickerTotal(size: StickerSize, quantity: number): number {
  return getStickerPrice(size) * quantity;
}
