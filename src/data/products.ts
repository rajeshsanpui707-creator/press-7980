import { FrameSizeConfig, FrameTierConfig, FrameFinishConfig, ProductItem, FrameSizeId, FrameTierId } from '../types';
import { AdminService } from '../lib/admin/admin-service';

export const STATIC_FRAME_SIZE_CONFIGS: FrameSizeConfig[] = [
  {
    id: '5x7',
    name: '5×7 in',
    dimensionInches: '5×7 in',
    dimensionCm: '13×18 cm',
    recommendedFor: 'Desk, Workstation & Nightstand',
    aspectRatio: 'aspect-[5/7]',
    basePrice: 199,
    prices: {
      standard: 199,
      velvet: 249,
      archival: 299,
    },
  },
  {
    id: '6x8',
    name: '6×8 in',
    dimensionInches: '6×8 in',
    dimensionCm: '15×20 cm',
    recommendedFor: 'Shelves, Bookcases & Gifting',
    aspectRatio: 'aspect-[3/4]',
    basePrice: 249,
    popular: true,
    isPopular: true,
    badge: 'Most Popular',
    prices: {
      standard: 249,
      velvet: 299,
      archival: 349,
    },
  },
  {
    id: '8x10',
    name: '8×10 in',
    dimensionInches: '8×10 in',
    dimensionCm: '20×25 cm',
    recommendedFor: 'Gallery Walls & Bedside Table',
    aspectRatio: 'aspect-[4/5]',
    basePrice: 349,
    prices: {
      standard: 349,
      velvet: 399,
      archival: 449,
    },
  },
  {
    id: '10x12',
    name: '10×12 in',
    dimensionInches: '10×12 in',
    dimensionCm: '25×30 cm',
    recommendedFor: 'Living Room Feature Walls',
    aspectRatio: 'aspect-[5/6]',
    basePrice: 449,
    prices: {
      standard: 449,
      velvet: 499,
      archival: 549,
    },
  },
  {
    id: '12x18',
    name: '12×18 in',
    dimensionInches: '12×18 in',
    dimensionCm: '30×45 cm',
    recommendedFor: 'Statement Centerpieces & Landscapes',
    aspectRatio: 'aspect-[2/3]',
    basePrice: 599,
    prices: {
      standard: 599,
      velvet: 649,
      archival: 699,
    },
  },
];

export const STATIC_FRAME_TIER_CONFIGS: FrameTierConfig[] = [
  {
    id: 'good',
    name: 'Standard Luster',
    description: 'Crisp vibrant prints on 240 GSM resin-coated photo paper with rich color fidelity.',
    paperType: '240 GSM Resin-Coated Paper',
    finish: 'Subtle Pearl Luster',
    longevity: '25+ Years Display Life',
    priceDelta: 0,
  },
  {
    id: 'better',
    name: 'Studio Velvet',
    description: 'Deep contrast and rich blacks on 280 GSM premium satin photographic paper.',
    paperType: '280 GSM Premium Satin Paper',
    finish: 'Silky Matte Finish',
    longevity: '50+ Years Display Life',
    priceDelta: 50,
    popular: true,
    badge: 'Recommended',
  },
  {
    id: 'best',
    name: 'Archival Fine Art',
    description: 'Museum-grade 310 GSM 100% cotton rag paper with pigment-based archival inks.',
    paperType: '310 GSM 100% Cotton Rag',
    finish: 'Museum Velvet Matte',
    longevity: '100+ Years Archival Quality',
    priceDelta: 100,
    badge: 'Heirloom',
  },
];

export const FRAME_FINISHES: FrameFinishConfig[] = [
  {
    id: 'natural-oak',
    name: 'Natural Oak',
    hex: '#C19A6B',
    texture: 'Warm, organic wood grain with Scandinavian simplicity',
  },
  {
    id: 'classic-black',
    name: 'Classic Black',
    hex: '#1A1A1A',
    texture: 'Matte black architectural profile with clean lines',
  },
  {
    id: 'warm-walnut',
    name: 'Warm Walnut',
    hex: '#5C4033',
    texture: 'Rich dark amber tones with traditional elegance',
  },
  {
    id: 'gallery-white',
    name: 'Gallery White',
    hex: '#F8F9FA',
    texture: 'Crisp contemporary white frame for modern spaces',
  },
];

export const STATIC_PRODUCTS: ProductItem[] = [
  {
    id: 'custom-photo-frames',
    name: 'Custom Photo Frames',
    tagline: 'Turn your favourite photo into a premium keepsake, made to be displayed—not forgotten.',
    description: 'Turn your favourite photo into a premium keepsake, made to be displayed—not forgotten.',
    priceLabel: 'Starting at ₹199',
    startingPrice: 199,
    isPrimary: true,
    features: [
      'Premium wooden frame in 4 finishes',
      'HD photo printing + protective glass',
      'Free WhatsApp proof before printing',
      'Available in 5 sizes',
    ],
    ctaLabel: 'Customize Frame',
    ctaText: 'Customize Frame',
    specsNote: 'Carefully packed and delivered across Kolkata.',
  },
  {
    id: 'photo-stickers',
    name: 'Photo Stickers',
    tagline: 'Turn your favourite moments into stickers you can keep, share and stick anywhere.',
    description: 'Turn your favourite moments into stickers you can keep, share and stick anywhere.',
    priceLabel: 'Starting at ₹99',
    startingPrice: 99,
    isPrimary: false,
    features: [
      'Vibrant high-resolution printing',
      'Durable, scratch-resistant vinyl',
      'Clean-peel adhesive',
      'Small, Medium & Large sizes',
    ],
    ctaLabel: 'Order Stickers',
    ctaText: 'Order Stickers',
    specsNote: 'Packed safely for delivery.',
  },
];

function createDynamicArrayProxy<T extends object>(getLiveArray: () => T[]): T[] {
  return new Proxy([] as T[], {
    get(target, prop, receiver) {
      const list = getLiveArray();
      if (prop === 'length') return list.length;
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        return list[Number(prop)];
      }
      const val = Reflect.get(list, prop, receiver);
      if (typeof val === 'function') {
        return val.bind(list);
      }
      return val;
    },
    has(target, prop) {
      const list = getLiveArray();
      return prop in list;
    },
    ownKeys() {
      const list = getLiveArray();
      return Reflect.ownKeys(list);
    },
    getOwnPropertyDescriptor(target, prop) {
      const list = getLiveArray();
      return Object.getOwnPropertyDescriptor(list, prop);
    },
  });
}

function getLiveFrameSizes(): FrameSizeConfig[] {
  try {
    const list = AdminService.getFrameSizes();
    if (!list || list.length === 0) return STATIC_FRAME_SIZE_CONFIGS;
    return list
      .filter((s) => s.visible !== false && s.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((s) => {
        const base = Number(s.sellingPrice ?? s.basePrice) || 199;
        return {
          id: s.id as FrameSizeId,
          name: s.name,
          dimensionInches: s.dimensions || s.name,
          dimensionCm: s.dimensions || '',
          recommendedFor: s.recommendedFor || 'Living Room & Bedroom',
          aspectRatio: s.aspectRatio
            ? s.aspectRatio.startsWith('aspect-')
              ? s.aspectRatio
              : `aspect-[${s.aspectRatio.replace(':', '/')}]`
            : 'aspect-[3/4]',
          basePrice: base,
          popular: Boolean(s.popular),
          isPopular: Boolean(s.popular),
          badge: s.badge || (s.popular ? 'Most Popular' : undefined),
          prices: {
            standard: base,
            velvet: base + 50,
            archival: base + 100,
          },
        };
      });
  } catch {
    return STATIC_FRAME_SIZE_CONFIGS;
  }
}

function getLiveFrameTiers(): FrameTierConfig[] {
  try {
    const list = AdminService.getQualityTiers();
    if (!list || list.length === 0) return STATIC_FRAME_TIER_CONFIGS;
    return list
      .filter((t) => t.visible !== false && t.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((t) => {
        const delta = Number(t.priceAdjustment ?? t.originalPriceDelta) || 0;
        return {
          id: t.id as FrameTierId,
          name: t.name,
          description: t.description || t.shortDescription || '',
          paperType: t.paperType || '240 GSM Resin-Coated Paper',
          finish: t.finish || 'Pearl Luster',
          longevity: t.longevity || '25+ Years Display Life',
          priceDelta: delta,
          popular: Boolean(t.popular),
          badge: t.badge || (t.popular ? 'Recommended' : undefined),
        };
      });
  } catch {
    return STATIC_FRAME_TIER_CONFIGS;
  }
}

function getLiveProducts(): ProductItem[] {
  try {
    const list = AdminService.getProductsConfig();
    if (!list || list.length === 0) return STATIC_PRODUCTS;
    return list
      .filter((p) => p.visible !== false && p.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((p, index) => {
        const price = Number(p.startingPrice ?? p.actualPrice) || (p.id === 'photo-stickers' ? 99 : 199);
        const isPrimary = p.id === 'custom-photo-frames' || index === 0;
        return {
          id: p.id,
          name: p.name,
          tagline: p.shortDescription || p.description,
          description: p.fullDescription || p.description,
          priceLabel: `Starting at ₹${price}`,
          startingPrice: price,
          isPrimary,
          features: p.benefits && p.benefits.length > 0 ? p.benefits : (p.features || []),
          ctaLabel: p.id === 'photo-stickers' ? 'Order Stickers' : 'Customize Frame',
          ctaText: p.id === 'photo-stickers' ? 'Order Stickers' : 'Customize Frame',
          specsNote: p.specifications || p.specificationsNote || (p.id === 'photo-stickers' ? 'Packed safely for delivery.' : 'Carefully packed and delivered across Kolkata.'),
        };
      });
  } catch {
    return STATIC_PRODUCTS;
  }
}

export const FRAME_SIZE_CONFIGS: FrameSizeConfig[] = createDynamicArrayProxy(getLiveFrameSizes);
export const FRAME_TIER_CONFIGS: FrameTierConfig[] = createDynamicArrayProxy(getLiveFrameTiers);
export const PRODUCTS: ProductItem[] = createDynamicArrayProxy(getLiveProducts);

