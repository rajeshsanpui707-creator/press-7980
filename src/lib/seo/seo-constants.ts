/**
 * Production Domain & Canonical URL Constants
 */
export const PRODUCTION_DOMAIN = 'https://momentpress.ai.studio';

/**
 * Standard MomentPress Page SEO Configurations
 */
export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  ogType: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; path: string }>;
}

export const SEO_PRESETS: Record<string, PageSeoConfig> = {
  home: {
    title: 'MomentPress — Custom Photo Frames & Personalized Gifts in Kolkata',
    description:
      'Handcrafted custom photo frames & waterproof photo stickers in Kolkata. Archival 12-color pigment printing with free WhatsApp proof preview.',
    canonicalPath: '/',
    robots: 'index, follow, max-image-preview:large',
    ogType: 'website',
    keywords: [
      'custom photo frames',
      'personalized photo frames',
      'photo gifts',
      'custom photo printing',
      'personalized gifts Kolkata',
    ],
    breadcrumbs: [{ name: 'Home', path: '/' }],
  },
  'custom-photo-frames': {
    title: 'Custom Photo Frames — Handcrafted Solid Wood & Archival Prints | MomentPress',
    description:
      'Turn cherished moments into framed keepsakes. 5 display sizes, solid wood mouldings, crystal protective glass, and free digital preview before printing.',
    canonicalPath: '/custom-photo-frames',
    robots: 'index, follow, max-image-preview:large',
    ogType: 'product',
    keywords: [
      'custom photo frames Kolkata',
      'wooden photo frames',
      'personalized frame printing',
      'archival photo frame',
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Custom Photo Frames', path: '/custom-photo-frames' },
    ],
  },
  'photo-stickers': {
    title: 'Waterproof Custom Photo Stickers — Satin Vinyl & Clean Peel | MomentPress',
    description:
      'Turn your favorite photos into vibrant, durable photo stickers. Scratch-resistant, waterproof satin vinyl with residue-free peel in 3 versatile sizes.',
    canonicalPath: '/photo-stickers',
    robots: 'index, follow, max-image-preview:large',
    ogType: 'product',
    keywords: [
      'custom photo stickers',
      'waterproof stickers Kolkata',
      'vinyl photo prints',
      'photo gifts',
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Photo Stickers', path: '/photo-stickers' },
    ],
  },
  'existing-designs': {
    title: 'Existing Designs Showcase — Handcrafted Frame Gallery | MomentPress',
    description:
      'Browse our curated gallery of handcrafted customer keepsakes, framing finishes, and archival print milestones from our Bowbazar Kolkata studio.',
    canonicalPath: '/existing-designs',
    robots: 'index, follow, max-image-preview:large',
    ogType: 'website',
    keywords: [
      'photo frame gallery',
      'custom framing inspiration',
      'keepsake design portfolio',
      'Kolkata photo studio showcase',
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Existing Designs', path: '/existing-designs' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions — Printing, Proofing & Delivery | MomentPress',
    description:
      'Got questions about photo resolution, digital proofs, turnaround times, or delivery in Kolkata? Find clear answers from the MomentPress team.',
    canonicalPath: '/faq',
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ],
  },
  contact: {
    title: 'Contact MomentPress — Studio & WhatsApp Orders | Bowbazar, Kolkata',
    description:
      'Connect directly with our Kolkata studio team on WhatsApp or phone for custom photo frame inquiries, proof approvals, and bulk orders.',
    canonicalPath: '/contact',
    robots: 'index, follow',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ],
  },
  'order-quality': {
    title: 'Select Paper & Print Quality | MomentPress Order',
    description: 'Choose your paper finish: Standard Luster, Studio Velvet, or Archival Rag.',
    canonicalPath: '/order/quality',
    robots: 'noindex, follow', // Step in active checkout
    ogType: 'website',
  },
  'order-review': {
    title: 'Review Your Custom Frame Order | MomentPress',
    description: 'Verify dimensions, selected finish, and quantity before delivery details.',
    canonicalPath: '/order/review',
    robots: 'noindex, follow',
    ogType: 'website',
  },
  'order-delivery': {
    title: 'Delivery & Shipping Details | MomentPress Order',
    description: 'Provide customer name, contact phone number, and delivery address.',
    canonicalPath: '/order/delivery',
    robots: 'noindex, follow',
    ogType: 'website',
  },
  'order-confirmation': {
    title: 'Order Confirmed — Send Photos on WhatsApp | MomentPress',
    description: 'Your order has been registered. Connect on WhatsApp to share full-resolution photos.',
    canonicalPath: '/order/confirmation',
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
  admin: {
    title: 'MomentPress Studio — Management Portal',
    description: 'MomentPress administration login and management gateway.',
    canonicalPath: '/admin/2008',
    robots: 'noindex, nofollow, noarchive',
    ogType: 'website',
  },
  'not-found': {
    title: 'Page Not Found (404) | MomentPress',
    description: 'The requested page could not be found. Return to MomentPress home.',
    canonicalPath: '/404',
    robots: 'noindex, nofollow',
    ogType: 'website',
  },
};
