import {
  AdminOnlineOrder,
  AdminOfflineSale,
  CustomerRecord,
  InventoryItem,
  StockMovement,
  ProductInventoryMapping,
  PurchaseRecord,
  ExpenseRecord,
  ActivityLogItem,
  ProductConfigItem,
  FrameSizeConfigItem,
  QualityTierConfigItem,
  StickerSizeConfigItem,
  ExistingDesignItem,
  ReviewItem,
  FaqItem,
  OfferItem,
  WhatsAppTemplateItem,
  WebsiteSettingsData,
  OrderStatus,
  HomepageSectionConfig,
  HomepageHeroConfig,
} from '../../types/admin';
import { DEFAULT_INVENTORY_ITEMS, DEFAULT_PRODUCT_MAPPINGS } from './default-inventory';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'mp_admin_token',
  AUTH_USER: 'mp_admin_user',
  ONLINE_ORDERS: 'mp_admin_online_orders_v3',
  OFFLINE_SALES: 'mp_admin_offline_sales_v3',
  CUSTOMERS: 'mp_admin_customers_v3',
  INVENTORY: 'mp_admin_inventory_v3',
  STOCK_MOVEMENTS: 'mp_admin_stock_movements_v3',
  PURCHASES: 'mp_admin_purchases_v3',
  EXPENSES: 'mp_admin_expenses_v3',
  ACTIVITY_LOG: 'mp_admin_activity_log_v3',
  PRODUCTS_CONFIG: 'mp_admin_products_config_v3',
  FRAME_SIZES: 'mp_admin_frame_sizes_v3',
  QUALITY_TIERS: 'mp_admin_quality_tiers_v3',
  STICKER_SIZES: 'mp_admin_sticker_sizes_v3',
  EXISTING_DESIGNS: 'mp_admin_existing_designs_v3',
  REVIEWS: 'mp_admin_reviews_v3',
  FAQS: 'mp_admin_faqs_v3',
  OFFERS: 'mp_admin_offers_v3',
  WHATSAPP_TEMPLATES: 'mp_admin_whatsapp_templates_v3',
  SETTINGS: 'mp_admin_settings_v3',
  PRODUCT_MAPPINGS: 'mp_admin_product_mappings_v3',
  HOMEPAGE_HERO: 'mp_admin_homepage_hero_v3',
  HOMEPAGE_SECTIONS: 'mp_admin_homepage_sections_v3',
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  { id: 'hero', name: 'Hero Banner', description: 'Main headline, tagline, starting prices & CTA buttons', visible: true, displayOrder: 1 },
  { id: 'trust', name: 'Trust Indicators', description: 'Free digital proof, anti-glare glass & 48h delivery badges', visible: true, displayOrder: 2 },
  { id: 'products', name: 'Products & Frame Customizer', description: 'Product cards and interactive sizing & customization workspace', visible: true, displayOrder: 3 },
  { id: 'how-it-works', name: 'How It Works', description: '4-step simple order guide (Select, WhatsApp, Proof, Delivery)', visible: true, displayOrder: 4 },
  { id: 'existing-designs', name: 'Existing Designs Showcase Banner', description: 'Curated gallery link banner inviting customers to explore designs', visible: true, displayOrder: 5 },
  { id: 'reviews', name: 'Customer Reviews', description: 'Verified customer feedback and testimonials across Kolkata', visible: true, displayOrder: 6 },
  { id: 'faq', name: 'Frequently Asked Questions', description: 'Answers to common framing, printing, and delivery questions', visible: true, displayOrder: 7 },
  { id: 'final-cta', name: 'Final Conversion CTA', description: 'Bottom call-to-action banner driving frame customization', visible: true, displayOrder: 8 },
];

export const DEFAULT_HOMEPAGE_HERO: HomepageHeroConfig = {
  heading: 'Your memory, beautifully framed.',
  subheading: 'Turn your favorite moments into beautiful personalized frames and photo products.',
  hookBadgeText: 'Starting from just ₹99',
  ctaText: 'Create Your Frame',
  ctaLink: '#products',
  secondaryCtaText: 'Existing Designs',
  secondaryCtaLink: '#existing-designs',
  visible: true,
};

// Initial Products Configuration with Real Structure
const DEFAULT_PRODUCTS: ProductConfigItem[] = [
  {
    id: 'custom-photo-frames',
    name: 'Custom Photo Frames',
    type: 'frame',
    description: 'Handcrafted solid wood frames with crystal protective glass and archival photo paper.',
    startingPrice: 199,
    originalStartingPrice: 199,
    discountedStartingPrice: null,
    discountPercentage: null,
    discountActive: false,
    active: true,
    displayOrder: 1,
    features: [
      'High-definition archival photo printing included',
      'Handcrafted solid wood mouldings in 4 finishes',
      'Crystal clear protective glass with anti-glare finish',
      'Dual orientation hanging hardware & desk stand',
      'Free digital WhatsApp proof before print production',
    ],
  },
  {
    id: 'photo-stickers',
    name: 'Custom Photo Stickers',
    type: 'sticker',
    description: 'Waterproof matte vinyl die-cut personal stickers for phones, laptops, and diaries.',
    startingPrice: 99,
    originalStartingPrice: 99,
    discountedStartingPrice: null,
    discountPercentage: null,
    discountActive: false,
    active: true,
    displayOrder: 2,
    features: [
      'Weatherproof & scratch-resistant vinyl lamination',
      'High-resolution vibrant pigment printing',
      'Clean peeling adhesive leaves zero sticky residue',
      'Available in Small (2×2), Medium (3×3) & Large (4×4)',
      'Delivered in protective hardboard packaging',
    ],
  },
];

// Initial Frame Sizes with Pricing and Discount Controls
const DEFAULT_FRAME_SIZES: FrameSizeConfigItem[] = [
  {
    id: '5x7',
    name: '5×7 in',
    dimensions: '13 × 18 cm (5×7 in)',
    basePrice: 199,
    originalPrice: 199,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 199,
    aspectRatio: '5:7',
    recommendedFor: 'Desk, Workstation & Nightstand',
    popular: false,
    active: true,
    displayOrder: 1,
  },
  {
    id: '6x8',
    name: '6×8 in',
    dimensions: '15 × 20 cm (6×8 in)',
    basePrice: 249,
    originalPrice: 249,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 249,
    aspectRatio: '3:4',
    recommendedFor: 'Shelves, Bookcases & Gifting',
    popular: true,
    badge: 'Most Popular',
    active: true,
    displayOrder: 2,
  },
  {
    id: '8x10',
    name: '8×10 in',
    dimensions: '20 × 25 cm (8×10 in)',
    basePrice: 349,
    originalPrice: 349,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 349,
    aspectRatio: '4:5',
    recommendedFor: 'Gallery Walls & Bedside Table',
    popular: false,
    active: true,
    displayOrder: 3,
  },
  {
    id: '10x12',
    name: '10×12 in',
    dimensions: '25 × 30 cm (10×12 in)',
    basePrice: 449,
    originalPrice: 449,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 449,
    aspectRatio: '5:6',
    recommendedFor: 'Living Room Feature Walls',
    popular: false,
    active: true,
    displayOrder: 4,
  },
  {
    id: '12x18',
    name: '12×18 in',
    dimensions: '30 × 45 cm (12×18 in)',
    basePrice: 599,
    originalPrice: 599,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 599,
    aspectRatio: '2:3',
    recommendedFor: 'Statement Centerpieces & Landscapes',
    popular: false,
    active: true,
    displayOrder: 5,
  },
];

// Initial Quality Tiers
const DEFAULT_QUALITY_TIERS: QualityTierConfigItem[] = [
  {
    id: 'good',
    name: 'Standard Luster',
    description: 'Crisp vibrant prints on 240 GSM resin-coated photo paper with rich color fidelity.',
    priceAdjustment: 0,
    originalPriceDelta: 0,
    discountedPriceDelta: null,
    discountActive: false,
    paperType: '240 GSM Resin-Coated Paper',
    finish: 'Subtle Pearl Luster',
    longevity: '25+ Years Display Life',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'better',
    name: 'Studio Velvet',
    description: 'Deep contrast and rich blacks on 280 GSM premium satin photographic paper.',
    priceAdjustment: 50,
    originalPriceDelta: 50,
    discountedPriceDelta: null,
    discountActive: false,
    paperType: '280 GSM Premium Satin Paper',
    finish: 'Silky Matte Finish',
    longevity: '50+ Years Display Life',
    popular: true,
    badge: 'Recommended',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'best',
    name: 'Archival Fine Art',
    description: 'Museum-grade 310 GSM 100% cotton rag paper with pigment-based archival inks.',
    priceAdjustment: 100,
    originalPriceDelta: 100,
    discountedPriceDelta: null,
    discountActive: false,
    paperType: '310 GSM 100% Cotton Rag',
    finish: 'Museum Velvet Matte',
    longevity: '100+ Years Archival Quality',
    badge: 'Heirloom',
    active: true,
    displayOrder: 3,
  },
];

// Initial Sticker Sizes
const DEFAULT_STICKER_SIZES: StickerSizeConfigItem[] = [
  {
    id: 'Small',
    name: 'Small (2×2 in)',
    price: 99,
    originalPrice: 99,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 99,
    description: 'Compact vinyl stickers for phone cases, earbuds & mini items',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'Medium',
    name: 'Medium (3×3 in)',
    price: 149,
    originalPrice: 149,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 149,
    description: 'Versatile size for laptops, water bottles & diaries',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'Large',
    name: 'Large (4×4 in)',
    price: 199,
    originalPrice: 199,
    discountedPrice: null,
    discountPercentage: null,
    discountActive: false,
    sellingPrice: 199,
    description: 'Statement vinyl decal for notebooks, boards & tech gear',
    active: true,
    displayOrder: 3,
  },
];

// Initial Curated Showcase Designs
const DEFAULT_DESIGNS: ExistingDesignItem[] = [
  {
    id: 'gal-1',
    name: 'Golden Hour Portrait',
    category: 'Portraits & Milestones',
    size: '8×10 in',
    finish: 'natural-oak',
    description: 'Printed on Studio Velvet satin paper with a hand-waxed natural oak border.',
    image: '',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'gal-2',
    name: 'Darjeeling Tea Garden View',
    category: 'Landscapes & Travel',
    size: '12×18 in',
    finish: 'classic-black',
    description: 'Statement size landscape with Archival Fine Art cotton paper and anti-glare glass.',
    image: '',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'gal-3',
    name: 'Kolkata Yellow Taxi Heritage',
    category: 'Architecture & Street',
    size: '6×8 in',
    finish: 'warm-walnut',
    description: 'Warm walnut frame complementing rich amber city hues.',
    image: '',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'gal-4',
    name: 'Family Reunion Milestone',
    category: 'Family Memories',
    size: '10×12 in',
    finish: 'warm-walnut',
    description: 'Classic heirloom frame commemorating three generations together.',
    image: '',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'gal-5',
    name: 'Minimalist Botanical Study',
    category: 'Minimalist & Flora',
    size: '8×10 in',
    finish: 'gallery-white',
    description: 'Bright contemporary white profile paired with crisp 240 GSM Luster print.',
    image: '',
    active: true,
    displayOrder: 5,
  },
  {
    id: 'gal-6',
    name: 'Pet Companion Memory',
    category: 'Pets & Companions',
    size: '6×8 in',
    finish: 'classic-black',
    description: 'Compact shelf display with deep shadowline black profile.',
    image: '',
    active: true,
    displayOrder: 6,
  },
];

// Initial Real FAQs
const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How do I send my photo for custom framing or stickers?',
    answer: 'Once you configure your size and options, click "Send Photos on WhatsApp" on the confirmation screen. You can simply attach your full-resolution image directly to our chat thread. Our team inspects every image for sharpness and resolution.',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'faq-2',
    question: 'Will I see how my photo looks before it is printed?',
    answer: 'Yes, absolutely. We generate a 100% free digital mock-up preview via WhatsApp showing the exact cropping, borders, and color tone. Printing begins only after you review and explicitly approve the preview.',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'faq-3',
    question: 'What is the standard turnaround time in Kolkata?',
    answer: 'Orders in Kolkata are handcrafted in our Bowbazar studio and delivered within 24 to 48 hours of your proof approval. We use reinforced tamper-proof packaging to ensure safe arrival.',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'faq-4',
    question: 'What kind of paper and printing technology do you use?',
    answer: 'We use professional 12-color archival pigment printers with genuine pigment inks. Paper options range from 240 GSM Luster for rich contrast, to 280 GSM Studio Velvet, and 310 GSM 100% cotton museum rag that lasts over a century.',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'faq-5',
    question: 'Are the photo stickers waterproof and residue-free?',
    answer: 'Yes! Our custom photo stickers are printed on durable vinyl with a protective matte lamination that makes them resistant to water, spills, and UV sunlight. When removed, they leave zero sticky residue on laptops, phone cases, or tumblers.',
    active: true,
    displayOrder: 5,
  },
  {
    id: 'faq-6',
    question: 'What if my package arrives damaged in transit?',
    answer: 'Contact MomentPress as soon as possible with the relevant order details and photos of the package/product so the issue can be reviewed and resolved according to the applicable policy.',
    active: true,
    displayOrder: 6,
  },
];

// Initial Website Settings
const DEFAULT_SETTINGS: WebsiteSettingsData = {
  studioName: 'MomentPress',
  tagline: 'Your Photos. Your Story. Your Frame.',
  heroHeadline: 'Your memory, beautifully framed.',
  heroSubheadline: 'Handmade in Bowbazar, Kolkata using sustainably harvested solid wood mouldings, crystal glass, and archival pigment papers.',
  currency: 'INR',
  phone: '6291681660',
  whatsappNumber: '7980855821',
  email: 'connect.rrstudio@gmail.com',
  instagramHandle: '@_rr.studio__',
  instagramUrl: 'https://www.instagram.com/_rr.studio__/',
  address: 'Bowbazar, Central Kolkata, West Bengal 700012',
  city: 'Kolkata',
  deliveryPromiseHours: 48,
  startingFramePrice: 199,
  startingStickerPrice: 99,
};

// Initial WhatsApp Templates
const DEFAULT_TEMPLATES: WhatsAppTemplateItem[] = [
  {
    id: 'tmpl-order',
    title: 'New Customer Order',
    category: 'Order Request',
    templateText: 'Hello MomentPress!\n\nI have placed an order request:\nOrder ID: {orderId}\nCustomer: {customerName}\nProduct: {productName}\nSize: {sizeName}\nQuantity: {quantity}\nTotal Amount: ₹{totalPrice}\n\nI am attaching my photo(s) here for the free digital proof.',
    variables: ['orderId', 'customerName', 'productName', 'sizeName', 'quantity', 'totalPrice'],
  },
  {
    id: 'tmpl-proof',
    title: 'Proof Ready Notification',
    category: 'Design Preview',
    templateText: 'Hello {customerName}! Here is the digital proof preview for your MomentPress Order #{orderId}. Please review the crop, margins, and paper texture. Reply "APPROVED" to begin printing.',
    variables: ['customerName', 'orderId'],
  },
  {
    id: 'tmpl-dispatch',
    title: 'Order Dispatched Update',
    category: 'Delivery Update',
    templateText: 'Great news {customerName}! Your handcrafted MomentPress Order #{orderId} has been carefully packaged and is out for delivery. Estimated arrival: today.',
    variables: ['customerName', 'orderId'],
  },
];

// Helpers for localStorage caching with safe fallback
function getCached<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setCached<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or disabled
  }
}

export const AdminService = {
  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getAuthUser(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAuthToken());
  },

  async checkSetupStatus(): Promise<{ isSetupRequired: boolean }> {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        return { isSetupRequired: Boolean(data.isSetupRequired) };
      }
    } catch {
      // ignore
    }
    return { isSetupRequired: false };
  },

  async setupInitialCredentials(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to establish administrator credentials' };
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, data.username);
      }
      this.syncFromServer();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to setup server' };
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; error?: string; isSetupRequired?: boolean }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed',
          isSetupRequired: Boolean(data.isSetupRequired),
        };
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, data.username);
      }

      // Sync data right after login
      this.syncFromServer();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to authentication server' };
    }
  },

  async checkAuth(): Promise<boolean> {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.logout();
        return false;
      }
      const data = await res.json();
      return Boolean(data.authenticated);
    } catch {
      // In offline/transient state, rely on active session token
      return Boolean(token);
    }
  },

  async logout(): Promise<void> {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore network error on logout
      }
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  async changeCredentials(
    currentPassword: string,
    newPassword?: string,
    newUsername?: string
  ): Promise<{ success: boolean; error?: string }> {
    const token = this.getAuthToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin session required' };

    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, newUsername }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update credentials' };
      }

      if (data.username && typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, data.username);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating credentials' };
    }
  },

  // ==========================================
  // INITIALIZATION & SERVER SYNC
  // ==========================================
  init(): void {
    // If not seeded locally, set defaults
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS_CONFIG)) {
        setCached(STORAGE_KEYS.PRODUCTS_CONFIG, DEFAULT_PRODUCTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.FRAME_SIZES)) {
        setCached(STORAGE_KEYS.FRAME_SIZES, DEFAULT_FRAME_SIZES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.QUALITY_TIERS)) {
        setCached(STORAGE_KEYS.QUALITY_TIERS, DEFAULT_QUALITY_TIERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.STICKER_SIZES)) {
        setCached(STORAGE_KEYS.STICKER_SIZES, DEFAULT_STICKER_SIZES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.EXISTING_DESIGNS)) {
        setCached(STORAGE_KEYS.EXISTING_DESIGNS, DEFAULT_DESIGNS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
        setCached(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        setCached(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.WHATSAPP_TEMPLATES)) {
        setCached(STORAGE_KEYS.WHATSAPP_TEMPLATES, DEFAULT_TEMPLATES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.HOMEPAGE_HERO)) {
        setCached(STORAGE_KEYS.HOMEPAGE_HERO, DEFAULT_HOMEPAGE_HERO);
      }
      if (!localStorage.getItem(STORAGE_KEYS.HOMEPAGE_SECTIONS)) {
        setCached(STORAGE_KEYS.HOMEPAGE_SECTIONS, DEFAULT_HOMEPAGE_SECTIONS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
        setCached(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY_ITEMS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCT_MAPPINGS)) {
        setCached(STORAGE_KEYS.PRODUCT_MAPPINGS, DEFAULT_PRODUCT_MAPPINGS);
      }

      // Sync public config from server (if reachable)
      this.fetchPublicConfig();

      // If admin authenticated, sync full administrative store
      if (this.isAuthenticated()) {
        this.syncFromServer();
      }
    }
  },

  async fetchPublicConfig(): Promise<void> {
    try {
      const res = await fetch('/api/public/config');
      if (res.ok) {
        const data = await res.json();
        if (data.frameSizes) setCached(STORAGE_KEYS.FRAME_SIZES, data.frameSizes);
        if (data.qualityTiers) setCached(STORAGE_KEYS.QUALITY_TIERS, data.qualityTiers);
        if (data.stickerSizes) setCached(STORAGE_KEYS.STICKER_SIZES, data.stickerSizes);
        if (data.products) setCached(STORAGE_KEYS.PRODUCTS_CONFIG, data.products);
        if (data.reviews) setCached(STORAGE_KEYS.REVIEWS, data.reviews);
        if (data.faqs) setCached(STORAGE_KEYS.FAQS, data.faqs);
        if (data.existingDesigns) setCached(STORAGE_KEYS.EXISTING_DESIGNS, data.existingDesigns);
        if (data.offers) setCached(STORAGE_KEYS.OFFERS, data.offers);
        if (data.homepageHero) setCached(STORAGE_KEYS.HOMEPAGE_HERO, data.homepageHero);
        if (data.homepageSections) setCached(STORAGE_KEYS.HOMEPAGE_SECTIONS, data.homepageSections);
        if (data.settings) setCached(STORAGE_KEYS.SETTINGS, data.settings);
        if (data.whatsappTemplates) setCached(STORAGE_KEYS.WHATSAPP_TEMPLATES, data.whatsappTemplates);
      }
    } catch {
      // Offline fallback: continue using cached configurations
    }
  },

  async syncFromServer(): Promise<void> {
    const token = this.getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/all-data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCached(STORAGE_KEYS.ONLINE_ORDERS, data.onlineOrders || []);
        setCached(STORAGE_KEYS.OFFLINE_SALES, data.offlineSales || []);
        setCached(STORAGE_KEYS.CUSTOMERS, data.customers || []);
        setCached(STORAGE_KEYS.INVENTORY, data.inventory && data.inventory.length > 0 ? data.inventory : DEFAULT_INVENTORY_ITEMS);
        setCached(STORAGE_KEYS.STOCK_MOVEMENTS, data.stockMovements || []);
        setCached(STORAGE_KEYS.PURCHASES, data.purchases || []);
        setCached(STORAGE_KEYS.EXPENSES, data.expenses || []);
        setCached(STORAGE_KEYS.REVIEWS, data.reviews || []);
        setCached(STORAGE_KEYS.ACTIVITY_LOG, data.activityLog || []);
        if (data.frameSizes) setCached(STORAGE_KEYS.FRAME_SIZES, data.frameSizes);
        if (data.qualityTiers) setCached(STORAGE_KEYS.QUALITY_TIERS, data.qualityTiers);
        if (data.stickerSizes) setCached(STORAGE_KEYS.STICKER_SIZES, data.stickerSizes);
        if (data.products) setCached(STORAGE_KEYS.PRODUCTS_CONFIG, data.products);
        if (data.existingDesigns) setCached(STORAGE_KEYS.EXISTING_DESIGNS, data.existingDesigns);
        if (data.faqs) setCached(STORAGE_KEYS.FAQS, data.faqs);
        if (data.offers) setCached(STORAGE_KEYS.OFFERS, data.offers);
        if (data.homepageHero) setCached(STORAGE_KEYS.HOMEPAGE_HERO, data.homepageHero);
        if (data.homepageSections) setCached(STORAGE_KEYS.HOMEPAGE_SECTIONS, data.homepageSections);
        if (data.websiteSettings) setCached(STORAGE_KEYS.SETTINGS, data.websiteSettings);
        if (data.whatsappTemplates) setCached(STORAGE_KEYS.WHATSAPP_TEMPLATES, data.whatsappTemplates);
        if (data.productMappings && data.productMappings.length > 0) {
          setCached(STORAGE_KEYS.PRODUCT_MAPPINGS, data.productMappings);
        }
      }
    } catch {
      // Network unreachable, use cache
    }
  },

  // ==========================================
  // ONLINE ORDERS MANAGEMENT
  // ==========================================
  getOnlineOrders(): AdminOnlineOrder[] {
    return getCached<AdminOnlineOrder[]>(STORAGE_KEYS.ONLINE_ORDERS, []);
  },

  saveOnlineOrders(orders: AdminOnlineOrder[]): void {
    setCached(STORAGE_KEYS.ONLINE_ORDERS, orders);
  },

  updateOnlineOrder(id: string, updates: Partial<AdminOnlineOrder>): AdminOnlineOrder | null {
    const orders = this.getOnlineOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    const updated = { ...orders[idx], ...updates };
    orders[idx] = updated;
    this.saveOnlineOrders(orders);

    // Sync to server if authenticated
    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/orders/online', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }

    return updated;
  },

  async generateOrderBill(
    orderId: string,
    options?: { regenerate?: boolean }
  ): Promise<{ success: boolean; order?: AdminOnlineOrder; driveResult?: any; error?: string }> {
    const token = this.getAuthToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin session required' };

    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ regenerate: Boolean(options?.regenerate) }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to generate bill' };
      }

      if (data.order) {
        const orders = this.getOnlineOrders();
        const idx = orders.findIndex((o) => o.id === data.order.id);
        if (idx !== -1) {
          orders[idx] = data.order;
          this.saveOnlineOrders(orders);
        }
      }
      return { success: true, order: data.order };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error generating bill' };
    }
  },

  async fetchPublicBill(billToken: string): Promise<{ success: boolean; bill?: any; error?: string }> {
    try {
      const res = await fetch(`/api/public/bills/${encodeURIComponent(billToken)}`);
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Bill not found' };
      }
      return { success: true, bill: data.bill };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to fetch bill' };
    }
  },

  async submitPublicOrder(orderData: any): Promise<any> {
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const data = await res.json();
        return data.order;
      }
    } catch {
      // Local fallback
    }

    const localOrder: AdminOnlineOrder = {
      id: orderData.orderId,
      customerName: orderData.customerName,
      mobileNumber: orderData.mobileNumber,
      address: orderData.address || '',
      city: orderData.city || 'Kolkata',
      pincode: orderData.pincode || '',
      product: orderData.product || 'Custom Photo Frames',
      size: orderData.size || '6×8 in',
      quality: orderData.quality || 'Standard',
      quantity: Number(orderData.quantity) || 1,
      unitPrice: Number(orderData.unitPrice) || 249,
      discount: 0,
      finalAmount: Number(orderData.sellingPrice) || 249,
      paymentMethod: 'UPI',
      paymentStatus: 'Pending',
      requirements: orderData.requirements || '',
      photoStatus: 'Pending Upload',
      orderStatus: 'Pending',
      productCost: 0,
      printingCost: 0,
      packagingCost: 0,
      deliveryCost: 0,
      otherCost: 0,
      totalCost: 0,
      profit: Number(orderData.sellingPrice) || 249,
      profitMargin: 100,
      createdDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      stockDeducted: false,
    };

    const currentOrders = this.getOnlineOrders();
    currentOrders.unshift(localOrder);
    this.saveOnlineOrders(currentOrders);

    // Sync Customer Profile immediately
    this.syncCustomerFromOrder({
      customerName: localOrder.customerName,
      mobileNumber: localOrder.mobileNumber,
      address: localOrder.address,
      city: localOrder.city,
      pincode: localOrder.pincode,
      amount: localOrder.finalAmount,
      date: localOrder.createdDate,
    });

    return localOrder;
  },

  addOnlineOrder(orderData: any): AdminOnlineOrder {
    const localOrder: AdminOnlineOrder = {
      id: orderData.orderId || orderData.id || `MP-${Date.now().toString().slice(-6)}`,
      customerName: orderData.customerName || 'Valued Customer',
      mobileNumber: orderData.mobileNumber || '',
      address: orderData.address || '',
      city: orderData.city || 'Kolkata',
      pincode: orderData.pincode || '',
      product: orderData.product || 'Photo Stickers',
      size: orderData.size || 'Small',
      quality: orderData.quality || 'Matte Vinyl',
      quantity: Number(orderData.quantity) || 1,
      unitPrice: Number(orderData.unitPrice) || 0,
      discount: Number(orderData.discount) || 0,
      finalAmount: Number(orderData.sellingPrice || orderData.finalAmount) || 0,
      paymentMethod: orderData.paymentMethod || 'UPI',
      paymentStatus: orderData.paymentStatus || 'Pending',
      requirements: orderData.requirements || '',
      photoStatus: orderData.photoStatus || 'Pending Upload',
      orderStatus: orderData.orderStatus || 'Pending',
      productCost: orderData.productCost || 0,
      printingCost: orderData.printingCost || 0,
      packagingCost: orderData.packagingCost || 0,
      deliveryCost: orderData.deliveryCost || 0,
      otherCost: orderData.otherCost || 0,
      totalCost: orderData.totalCost || 0,
      profit: orderData.profit || Number(orderData.sellingPrice) || 0,
      profitMargin: 100,
      createdDate: orderData.createdDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate:
        orderData.expectedDeliveryDate ||
        new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      stockDeducted: false,
    };

    const currentOrders = this.getOnlineOrders();
    const existingIndex = currentOrders.findIndex((o) => o.id === localOrder.id);
    if (existingIndex >= 0) {
      currentOrders[existingIndex] = { ...currentOrders[existingIndex], ...localOrder };
    } else {
      currentOrders.unshift(localOrder);
    }
    this.saveOnlineOrders(currentOrders);

    this.syncCustomerFromOrder({
      customerName: localOrder.customerName,
      mobileNumber: localOrder.mobileNumber,
      address: localOrder.address,
      city: localOrder.city,
      pincode: localOrder.pincode,
      amount: localOrder.finalAmount,
      date: localOrder.createdDate,
    });

    return localOrder;
  },

  // ==========================================
  // OFFLINE SALES MANAGEMENT
  // ==========================================
  getOfflineSales(): AdminOfflineSale[] {
    return getCached<AdminOfflineSale[]>(STORAGE_KEYS.OFFLINE_SALES, []);
  },

  saveOfflineSales(sales: AdminOfflineSale[]): void {
    setCached(STORAGE_KEYS.OFFLINE_SALES, sales);
  },

  addOfflineSale(sale: Omit<AdminOfflineSale, 'id' | 'profit' | 'profitMargin' | 'totalCost'>): AdminOfflineSale {
    const id = `MP-OFF-${Date.now().toString().slice(-4)}`;
    const selling = Number(sale.sellingPrice) || Number(sale.finalAmount) || 0;
    const prodCost = Number(sale.productCost) || 0;
    const printCost = Number(sale.printingCost) || 0;
    const packCost = Number(sale.packagingCost) || 0;
    const delCost = Number(sale.deliveryCost) || 0;
    const othCost = Number(sale.otherCost) || 0;
    const totalCost = prodCost + printCost + packCost + delCost + othCost;
    const profit = selling - totalCost;
    const margin = selling > 0 ? parseFloat(((profit / selling) * 100).toFixed(1)) : 0;

    const newSale: AdminOfflineSale = {
      ...sale,
      id,
      productCost: prodCost,
      printingCost: printCost,
      packagingCost: packCost,
      deliveryCost: delCost,
      otherCost: othCost,
      totalCost,
      profit,
      profitMargin: margin,
      stockDeducted: false,
    };

    // Automatic Inventory Deduction for Active Offline Orders
    if (newSale.orderStatus !== 'Cancelled') {
      const deductRes = this.deductStockForOrder({
        id: newSale.id,
        product: newSale.product,
        size: newSale.size,
        quality: newSale.quality,
        quantity: newSale.quantity,
        isOffline: true,
      });
      if (deductRes.success) {
        newSale.stockDeducted = true;
        newSale.stockDeductedAt = new Date().toISOString();
        newSale.deductedItems = deductRes.deductedItems;
      }
    }

    const current = this.getOfflineSales();
    current.unshift(newSale);
    this.saveOfflineSales(current);

    // Sync Customer Profile
    this.syncCustomerFromOrder({
      customerName: newSale.customerName,
      mobileNumber: newSale.mobileNumber,
      alternateMobile: newSale.alternateMobile,
      address: newSale.address,
      city: newSale.city,
      pincode: newSale.pincode,
      amount: selling,
      date: newSale.orderDate || new Date().toISOString().split('T')[0],
    });

    this.logActivity(
      'Offline Sale Created',
      'Offline Sale',
      id,
      `Recorded offline sale for ${newSale.customerName} (₹${selling})`
    );

    // Sync to server
    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/orders/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSale),
      }).catch(() => {});
    }

    return newSale;
  },

  updateOfflineSale(id: string, updates: Partial<AdminOfflineSale>): AdminOfflineSale | null {
    const sales = this.getOfflineSales();
    const idx = sales.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const existing = sales[idx];
    const selling = updates.sellingPrice ?? updates.finalAmount ?? existing.sellingPrice ?? existing.finalAmount;
    const prodCost = updates.productCost ?? existing.productCost;
    const printCost = updates.printingCost ?? existing.printingCost;
    const packCost = updates.packagingCost ?? existing.packagingCost;
    const delCost = updates.deliveryCost ?? existing.deliveryCost;
    const othCost = updates.otherCost ?? existing.otherCost;
    const totalCost = prodCost + printCost + packCost + delCost + othCost;
    const profit = selling - totalCost;
    const margin = selling > 0 ? parseFloat(((profit / selling) * 100).toFixed(1)) : 0;

    let stockDeducted = existing.stockDeducted;
    let stockDeductedAt = existing.stockDeductedAt;
    let deductedItems = existing.deductedItems;

    // Cancellation: restore stock automatically
    if (updates.orderStatus === 'Cancelled' && existing.stockDeducted) {
      this.restoreStockForOrder(existing);
      stockDeducted = false;
      stockDeductedAt = undefined;
      deductedItems = [];
    } else if (
      !existing.stockDeducted &&
      updates.orderStatus &&
      updates.orderStatus !== 'Cancelled'
    ) {
      // Activating an un-deducted order: deduct stock automatically
      const deductRes = this.deductStockForOrder({
        id: existing.id,
        product: updates.product || existing.product,
        size: updates.size || existing.size,
        quality: updates.quality || existing.quality,
        quantity: updates.quantity || existing.quantity,
        isOffline: true,
      });
      if (deductRes.success) {
        stockDeducted = true;
        stockDeductedAt = new Date().toISOString();
        deductedItems = deductRes.deductedItems;
      }
    }

    const updated: AdminOfflineSale = {
      ...existing,
      ...updates,
      totalCost,
      profit,
      profitMargin: margin,
      stockDeducted,
      stockDeductedAt,
      deductedItems,
    };

    sales[idx] = updated;
    this.saveOfflineSales(sales);

    // Sync Customer Profile if relevant fields changed
    if (updates.customerName || updates.sellingPrice || updates.finalAmount || updates.address) {
      this.syncCustomerFromOrder({
        customerName: updated.customerName,
        mobileNumber: updated.mobileNumber,
        alternateMobile: updated.alternateMobile,
        address: updated.address,
        city: updated.city,
        pincode: updated.pincode,
        amount: Number(updated.sellingPrice || updated.finalAmount || 0),
        date: updated.orderDate,
      });
    }

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/orders/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }

    return updated;
  },

  deleteOfflineSale(id: string): boolean {
    const sales = this.getOfflineSales().filter((s) => s.id !== id);
    this.saveOfflineSales(sales);
    return true;
  },

  saveOfflineSale(sale: any): AdminOfflineSale {
    if (sale.id && this.getOfflineSales().some((s) => s.id === sale.id)) {
      return this.updateOfflineSale(sale.id, sale) || (sale as AdminOfflineSale);
    }
    return this.addOfflineSale(sale);
  },

  // ==========================================
  // INVENTORY & STOCK AUTOMATION
  // ==========================================
  getInventory(): InventoryItem[] {
    const items = getCached<InventoryItem[]>(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY_ITEMS);
    if (!items || items.length === 0) {
      return DEFAULT_INVENTORY_ITEMS;
    }
    return items;
  },

  saveInventory(items: InventoryItem[]): void {
    setCached(STORAGE_KEYS.INVENTORY, items);
  },

  addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem {
    const id = `INV-${Date.now().toString(36).toUpperCase()}`;
    const newItem: InventoryItem = {
      ...item,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const current = this.getInventory();
    current.push(newItem);
    this.saveInventory(current);

    this.logActivity('Inventory Added', 'Inventory', id, `Added inventory item: ${newItem.name}`);

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      }).catch(() => {});
    }

    return newItem;
  },

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const items = this.getInventory();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    const updated: InventoryItem = {
      ...items[idx],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    items[idx] = updated;
    this.saveInventory(items);

    this.logActivity('Inventory Updated', 'Inventory', id, `Updated inventory item: ${updated.name}`);

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }

    return updated;
  },

  deleteInventoryItem(id: string): boolean {
    const items = this.getInventory().filter((i) => i.id !== id);
    this.saveInventory(items);
    this.logActivity('Inventory Deleted', 'Inventory', id, `Deleted inventory item ${id}`);
    return true;
  },

  saveInventoryItem(itemData: Partial<InventoryItem> & { name: string; category: InventoryItem['category']; unit: string }): InventoryItem {
    if (itemData.id) {
      return this.updateInventoryItem(itemData.id, itemData) || (itemData as InventoryItem);
    }
    return this.addInventoryItem({
      name: itemData.name,
      category: itemData.category,
      unit: itemData.unit,
      currentStock: itemData.currentStock ?? 0,
      minimumStock: itemData.minimumStock ?? 10,
      purchaseCost: itemData.purchaseCost ?? 0,
      supplier: itemData.supplier ?? '',
      active: itemData.active ?? true,
    });
  },

  // ==========================================
  // PRODUCT -> INVENTORY MAPPING (CONFIGURABLE)
  // ==========================================
  getProductMappings(): ProductInventoryMapping[] {
    const mappings = getCached<ProductInventoryMapping[]>(STORAGE_KEYS.PRODUCT_MAPPINGS, DEFAULT_PRODUCT_MAPPINGS);
    if (!mappings || mappings.length === 0) {
      return DEFAULT_PRODUCT_MAPPINGS;
    }
    return mappings;
  },

  saveProductMappings(mappings: ProductInventoryMapping[]): void {
    setCached(STORAGE_KEYS.PRODUCT_MAPPINGS, mappings);
    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mappings }),
      }).catch(() => {});
    }
  },

  addProductMapping(mapping: Omit<ProductInventoryMapping, 'id'>): ProductInventoryMapping {
    const id = `MAP-${Date.now().toString(36).toUpperCase()}`;
    const newMapping: ProductInventoryMapping = { ...mapping, id };
    const current = this.getProductMappings();
    current.push(newMapping);
    this.saveProductMappings(current);
    this.logActivity('Mapping Created', 'Inventory', id, `Configured product mapping for ${mapping.productName} (${mapping.sizeName || ''})`);
    return newMapping;
  },

  updateProductMapping(id: string, updates: Partial<ProductInventoryMapping>): ProductInventoryMapping | null {
    const current = this.getProductMappings();
    const idx = current.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    current[idx] = { ...current[idx], ...updates };
    this.saveProductMappings(current);
    this.logActivity('Mapping Updated', 'Inventory', id, `Updated product mapping for ${current[idx].productName}`);
    return current[idx];
  },

  deleteProductMapping(id: string): boolean {
    const current = this.getProductMappings().filter((m) => m.id !== id);
    this.saveProductMappings(current);
    this.logActivity('Mapping Deleted', 'Inventory', id, `Deleted product mapping ${id}`);
    return true;
  },

  findOrderMapping(order: { product: string; size?: string; quality?: string }): ProductInventoryMapping | undefined {
    const prodName = String(order.product || '').toLowerCase();
    const isFrame = prodName.includes('frame');
    const isSticker = prodName.includes('sticker');
    const mappings = this.getProductMappings();

    return mappings.find((m) => {
      if (isFrame && m.productType === 'custom-photo-frames') {
        if (order.size && m.sizeName) {
          return m.sizeName.toLowerCase().replace(/\s+/g, '') === order.size.toLowerCase().replace(/\s+/g, '');
        }
        return true;
      }
      if (isSticker && m.productType === 'photo-stickers') {
        if (order.size && m.sizeName) {
          return m.sizeName.toLowerCase().includes(order.size.toLowerCase().trim());
        }
        return true;
      }
      if (m.productName && prodName.includes(m.productName.toLowerCase())) {
        if (order.size && m.sizeName) {
          return m.sizeName.toLowerCase().replace(/\s+/g, '') === order.size.toLowerCase().replace(/\s+/g, '');
        }
        return true;
      }
      return false;
    });
  },

  getStockMovements(): StockMovement[] {
    return getCached<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
  },

  // Stock Availability Checker
  checkStockForOrder(order: { product: string; size?: string; quality?: string; quantity: number }): {
    available: boolean;
    missingItems: { itemId: string; itemName: string; requiredQty: number; availableQty: number }[];
    requiredItems: { itemId: string; itemName: string; requiredQty: number; availableQty: number; sufficient: boolean }[];
    mappingFound: boolean;
  } {
    const qty = Math.max(1, Number(order.quantity) || 1);
    const mapping = this.findOrderMapping(order);
    const inventory = this.getInventory();

    if (!mapping || !Array.isArray(mapping.consumes) || mapping.consumes.length === 0) {
      return { available: true, missingItems: [], requiredItems: [], mappingFound: false };
    }

    const requiredItems = mapping.consumes.map((c) => {
      let itemId = c.inventoryItemId;

      // Quality tier adjustment for photo paper
      if (order.quality) {
        const q = order.quality.toLowerCase();
        if (q.includes('velvet') || q.includes('better')) {
          if (itemId === 'INV-PPR-LUSTER') itemId = 'INV-PPR-VELVET';
        } else if (q.includes('archival') || q.includes('best') || q.includes('cotton')) {
          if (itemId === 'INV-PPR-LUSTER') itemId = 'INV-PPR-ARCHIVAL';
        }
      }

      const inv = inventory.find((i) => i.id === itemId);
      const requiredQty = Number(c.quantityPerUnit || 1) * qty;
      const availableQty = inv ? Number(inv.currentStock || 0) : 0;
      return {
        itemId,
        itemName: inv ? inv.name : itemId,
        requiredQty,
        availableQty,
        sufficient: availableQty >= requiredQty,
      };
    });

    const missingItems = requiredItems.filter((r) => !r.sufficient);
    return {
      available: missingItems.length === 0,
      missingItems,
      requiredItems,
      mappingFound: true,
    };
  },

  // Deduct stock for order (Supports Multi-Item Mapping & Duplicate Prevention)
  deductStockForOrder(params: {
    id: string;
    product: string;
    size?: string;
    quality?: string;
    quantity: number;
    isOffline?: boolean;
  }): {
    success: boolean;
    message: string;
    missingItems?: { itemId: string; itemName: string; requiredQty: number; availableQty: number }[];
    deductedItems?: { itemId: string; itemName: string; quantity: number }[];
  } {
    const stockCheck = this.checkStockForOrder(params);

    if (!stockCheck.available) {
      const missingDesc = stockCheck.missingItems
        .map((m) => `${m.itemName} — Required: ${m.requiredQty} — Available: ${m.availableQty}`)
        .join('\n');
      return {
        success: false,
        message: `Insufficient Stock:\n${missingDesc}`,
        missingItems: stockCheck.missingItems,
      };
    }

    // If mapping found, deduct ALL mapped items
    if (stockCheck.mappingFound && stockCheck.requiredItems.length > 0) {
      const inventory = this.getInventory();
      const movements = this.getStockMovements();
      const deductedItems: { itemId: string; itemName: string; quantity: number }[] = [];
      const now = new Date().toISOString();

      for (const req of stockCheck.requiredItems) {
        const inv = inventory.find((i) => i.id === req.itemId);
        if (inv) {
          const prev = Number(inv.currentStock || 0);
          inv.currentStock = Math.max(0, prev - req.requiredQty);
          inv.lastUpdated = now.split('T')[0];

          movements.unshift({
            id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: now,
            itemId: inv.id,
            itemName: inv.name,
            type: params.isOffline ? 'Deduction (Offline Sale)' : 'Deduction (Online Order)',
            quantity: req.requiredQty,
            previousStock: prev,
            newStock: inv.currentStock,
            referenceId: params.id,
            notes: `Deducted for ${params.isOffline ? 'offline sale' : 'online order'} ${params.id} (${params.product} ${params.size || ''})`,
          });

          deductedItems.push({
            itemId: inv.id,
            itemName: inv.name,
            quantity: req.requiredQty,
          });
        }
      }

      this.saveInventory(inventory);
      setCached(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

      return {
        success: true,
        message: `Successfully deducted ${deductedItems.length} inventory material(s) for order ${params.id}`,
        deductedItems,
      };
    }

    // Fallback: match by size name if no mapping configured
    const items = this.getInventory();
    const qty = Math.max(1, params.quantity || 1);
    let matchedItem: InventoryItem | null = null;

    for (const item of items) {
      if (item.active && params.size && item.name.toLowerCase().includes(params.size.toLowerCase().replace(' in', ''))) {
        matchedItem = item;
        break;
      }
    }

    if (!matchedItem) {
      return { success: false, message: `No inventory mapping or stock item found matching "${params.product} ${params.size || ''}".` };
    }

    if (matchedItem.currentStock < qty) {
      return {
        success: false,
        message: `Insufficient Stock: ${matchedItem.name} — Required: ${qty} — Available: ${matchedItem.currentStock}`,
        missingItems: [{ itemId: matchedItem.id, itemName: matchedItem.name, requiredQty: qty, availableQty: matchedItem.currentStock }],
      };
    }

    const prevStock = matchedItem.currentStock;
    matchedItem.currentStock = Math.max(0, matchedItem.currentStock - qty);
    matchedItem.lastUpdated = new Date().toISOString().split('T')[0];
    this.saveInventory(items);

    const movements = this.getStockMovements();
    movements.unshift({
      id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      itemId: matchedItem.id,
      itemName: matchedItem.name,
      type: params.isOffline ? 'Deduction (Offline Sale)' : 'Deduction (Online Order)',
      quantity: qty,
      previousStock: prevStock,
      newStock: matchedItem.currentStock,
      referenceId: params.id,
      notes: `Order ${params.id} stock deduction (${params.product})`,
    });
    setCached(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

    return {
      success: true,
      message: `Successfully deducted ${qty} units of ${matchedItem.name}`,
      deductedItems: [{ itemId: matchedItem.id, itemName: matchedItem.name, quantity: qty }],
    };
  },

  // Restore inventory items when order is cancelled
  restoreStockForOrder(order: { id: string; deductedItems?: { itemId: string; itemName: string; quantity: number }[] }): {
    success: boolean;
    restoredCount: number;
  } {
    if (!order.deductedItems || !Array.isArray(order.deductedItems) || order.deductedItems.length === 0) {
      return { success: true, restoredCount: 0 };
    }

    const inventory = this.getInventory();
    const movements = this.getStockMovements();
    const now = new Date().toISOString();
    let count = 0;

    for (const item of order.deductedItems) {
      const inv = inventory.find((i) => i.id === item.itemId);
      if (inv) {
        const prev = Number(inv.currentStock || 0);
        const qty = Number(item.quantity || 1);
        inv.currentStock = prev + qty;
        inv.lastUpdated = now.split('T')[0];

        movements.unshift({
          id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: now,
          itemId: inv.id,
          itemName: inv.name,
          type: 'Restoration (Cancelled Order)',
          quantity: qty,
          previousStock: prev,
          newStock: inv.currentStock,
          referenceId: order.id,
          notes: `Restored stock from cancelled order ${order.id}`,
        });
        count++;
      }
    }

    this.saveInventory(inventory);
    setCached(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

    return { success: true, restoredCount: count };
  },

  // Central Order Status Updater with Automated Stock Checking, Deduction & Cancellation Restoration
  async updateOrderStatus(params: {
    orderId: string;
    isOffline: boolean;
    newStatus: OrderStatus;
  }): Promise<{ success: boolean; error?: string; order?: any }> {
    const { orderId, isOffline, newStatus } = params;

    if (isOffline) {
      const sales = this.getOfflineSales();
      const idx = sales.findIndex((s) => s.id === orderId);
      if (idx === -1) return { success: false, error: 'Offline sale not found' };
      const sale = sales[idx];

      // Cancellation: restore stock if previously deducted
      if (newStatus === 'Cancelled' && sale.stockDeducted) {
        this.restoreStockForOrder(sale);
        sale.stockDeducted = false;
        sale.deductedItems = [];
        sale.orderStatus = newStatus;
        sales[idx] = sale;
        this.saveOfflineSales(sales);
        this.syncOrderStatusToServer(orderId, isOffline, newStatus);
        this.logActivity('Status Updated', 'Offline Sale', orderId, `Cancelled sale ${orderId}; stock restored`);
        return { success: true, order: sale };
      }

      // Activating an un-deducted order (Processing / Ready / Delivered)
      if (!sale.stockDeducted && (newStatus === 'Processing' || newStatus === 'Ready' || newStatus === 'Delivered')) {
        const deductRes = this.deductStockForOrder({
          id: sale.id,
          product: sale.product,
          size: sale.size,
          quality: sale.quality,
          quantity: sale.quantity,
          isOffline: true,
        });

        if (!deductRes.success) {
          return { success: false, error: deductRes.message };
        }

        sale.stockDeducted = true;
        sale.stockDeductedAt = new Date().toISOString();
        sale.deductedItems = deductRes.deductedItems;
      }

      sale.orderStatus = newStatus;
      sales[idx] = sale;
      this.saveOfflineSales(sales);
      this.syncOrderStatusToServer(orderId, isOffline, newStatus);
      this.logActivity('Status Updated', 'Offline Sale', orderId, `Sale ${orderId} status set to ${newStatus}`);
      return { success: true, order: sale };
    } else {
      const orders = this.getOnlineOrders();
      const idx = orders.findIndex((o) => o.id === orderId);
      if (idx === -1) return { success: false, error: 'Online order not found' };
      const order = orders[idx];

      // Cancellation: restore stock if previously deducted
      if (newStatus === 'Cancelled' && order.stockDeducted) {
        this.restoreStockForOrder(order);
        order.stockDeducted = false;
        order.deductedItems = [];
        order.orderStatus = newStatus;
        orders[idx] = order;
        this.saveOnlineOrders(orders);
        this.syncOrderStatusToServer(orderId, isOffline, newStatus);
        this.logActivity('Status Updated', 'Order', orderId, `Cancelled order ${orderId}; stock restored`);
        return { success: true, order };
      }

      // Activating an un-deducted order (Processing / Ready / Delivered)
      if (!order.stockDeducted && (newStatus === 'Processing' || newStatus === 'Ready' || newStatus === 'Delivered')) {
        const deductRes = this.deductStockForOrder({
          id: order.id,
          product: order.product,
          size: order.size,
          quality: order.quality,
          quantity: order.quantity,
          isOffline: false,
        });

        if (!deductRes.success) {
          return { success: false, error: deductRes.message };
        }

        order.stockDeducted = true;
        order.stockDeductedAt = new Date().toISOString();
        order.deductedItems = deductRes.deductedItems;
      }

      order.orderStatus = newStatus;
      orders[idx] = order;
      this.saveOnlineOrders(orders);
      this.syncOrderStatusToServer(orderId, isOffline, newStatus);
      this.logActivity('Status Updated', 'Order', orderId, `Order ${orderId} status set to ${newStatus}`);
      return { success: true, order };
    }
  },

  syncOrderStatusToServer(orderId: string, isOffline: boolean, newStatus: OrderStatus): void {
    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, isOffline, newStatus }),
      }).catch(() => {});
    }
  },

  // ==========================================
  // PURCHASES (AUTO-ADDS STOCK TO INVENTORY)
  // ==========================================
  getPurchases(): PurchaseRecord[] {
    return getCached<PurchaseRecord[]>(STORAGE_KEYS.PURCHASES, []);
  },

  savePurchases(purchases: PurchaseRecord[]): void {
    setCached(STORAGE_KEYS.PURCHASES, purchases);
  },

  addPurchase(purchase: Omit<PurchaseRecord, 'id' | 'totalCost' | 'stockAdded' | 'stockAddedAt'>): PurchaseRecord {
    const id = `PUR-${Date.now().toString(36).toUpperCase()}`;
    const qty = Math.max(1, Number(purchase.quantity) || 1);
    const unitCost = Math.max(0, Number(purchase.unitCost) || 0);
    const totalCost = qty * unitCost;

    const record: PurchaseRecord = {
      ...purchase,
      id,
      quantity: qty,
      unitCost,
      totalCost,
      stockAdded: true,
      stockAddedAt: new Date().toISOString(),
    };

    // Auto-increment linked inventory stock
    if (record.inventoryItemId) {
      const inventory = this.getInventory();
      const invItem = inventory.find((i) => i.id === record.inventoryItemId);
      if (invItem) {
        const prev = invItem.currentStock;
        invItem.currentStock += qty;
        invItem.purchaseCost = unitCost;
        invItem.lastUpdated = record.purchaseDate;
        this.saveInventory(inventory);

        const movements = this.getStockMovements();
        movements.unshift({
          id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          itemId: invItem.id,
          itemName: invItem.name,
          type: 'Addition (Purchase)',
          quantity: qty,
          previousStock: prev,
          newStock: invItem.currentStock,
          referenceId: id,
          notes: `Stock auto-added from purchase ${id}`,
        });
        setCached(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
      }
    }

    const current = this.getPurchases();
    current.unshift(record);
    this.savePurchases(current);

    this.logActivity('Purchase Created', 'Purchase', id, `Recorded purchase of ${record.item} (₹${totalCost})`);

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(record),
      }).catch(() => {});
    }

    return record;
  },

  updatePurchase(id: string, updates: Partial<PurchaseRecord>): PurchaseRecord | null {
    const current = this.getPurchases();
    const idx = current.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const prev = current[idx];
    const qty = updates.quantity !== undefined ? Math.max(1, Number(updates.quantity)) : prev.quantity;
    const unitCost = updates.unitCost !== undefined ? Math.max(0, Number(updates.unitCost)) : prev.unitCost;
    const totalCost = qty * unitCost;

    const updated: PurchaseRecord = {
      ...prev,
      ...updates,
      quantity: qty,
      unitCost,
      totalCost,
    };

    current[idx] = updated;
    this.savePurchases(current);
    this.logActivity('Purchase Updated', 'Purchase', id, `Updated purchase for ${updated.item}`);
    return updated;
  },

  deletePurchase(id: string): boolean {
    const current = this.getPurchases().filter((p) => p.id !== id);
    this.savePurchases(current);
    this.logActivity('Purchase Deleted', 'Purchase', id, `Deleted purchase ${id}`);
    return true;
  },

  savePurchase(purchase: any): PurchaseRecord {
    if (purchase.id && this.getPurchases().some((p) => p.id === purchase.id)) {
      return this.updatePurchase(purchase.id, purchase) || (purchase as PurchaseRecord);
    }
    return this.addPurchase(purchase);
  },

  // ==========================================
  // EXPENSES
  // ==========================================
  getExpenses(): ExpenseRecord[] {
    return getCached<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, []);
  },

  saveExpenses(expenses: ExpenseRecord[]): void {
    setCached(STORAGE_KEYS.EXPENSES, expenses);
  },

  addExpense(expense: Omit<ExpenseRecord, 'id'>): ExpenseRecord {
    const id = `EXP-${Date.now().toString(36).toUpperCase()}`;
    const record: ExpenseRecord = {
      ...expense,
      id,
      amount: Math.max(0, Number(expense.amount) || 0),
    };

    const current = this.getExpenses();
    current.unshift(record);
    this.saveExpenses(current);

    this.logActivity('Expense Created', 'Expense', id, `Recorded expense ${record.expenseName} (₹${record.amount})`);

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(record),
      }).catch(() => {});
    }

    return record;
  },

  updateExpense(id: string, updates: Partial<ExpenseRecord>): ExpenseRecord | null {
    const current = this.getExpenses();
    const idx = current.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const updated: ExpenseRecord = {
      ...current[idx],
      ...updates,
      amount: updates.amount !== undefined ? Math.max(0, Number(updates.amount)) : current[idx].amount,
    };

    current[idx] = updated;
    this.saveExpenses(current);
    this.logActivity('Expense Updated', 'Expense', id, `Updated expense ${updated.expenseName}`);
    return updated;
  },

  deleteExpense(id: string): boolean {
    const current = this.getExpenses().filter((e) => e.id !== id);
    this.saveExpenses(current);
    this.logActivity('Expense Deleted', 'Expense', id, `Deleted expense ${id}`);
    return true;
  },

  saveExpense(expense: any): ExpenseRecord {
    if (expense.id && this.getExpenses().some((e) => e.id === expense.id)) {
      return this.updateExpense(expense.id, expense) || (expense as ExpenseRecord);
    }
    return this.addExpense(expense);
  },

  // ==========================================
  // CUSTOMERS & CRM
  // ==========================================
  getCustomers(): CustomerRecord[] {
    return getCached<CustomerRecord[]>(STORAGE_KEYS.CUSTOMERS, []);
  },

  saveCustomers(customers: CustomerRecord[]): void {
    setCached(STORAGE_KEYS.CUSTOMERS, customers);
  },

  updateCustomer(id: string, updates: Partial<CustomerRecord>): CustomerRecord | null {
    const current = this.getCustomers();
    const idx = current.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const updated = { ...current[idx], ...updates };
    current[idx] = updated;
    this.saveCustomers(current);
    return updated;
  },

  syncCustomerFromOrder(order: {
    customerName: string;
    mobileNumber: string;
    alternateMobile?: string;
    address?: string;
    city?: string;
    pincode?: string;
    amount: number;
    date: string;
  }): void {
    const customers = this.getCustomers();
    const cleanMobile = (order.mobileNumber || '').trim().replace(/[^0-9+]/g, '');
    if (!cleanMobile) return;

    let cust = customers.find((c) => c.mobile === cleanMobile);

    if (!cust) {
      cust = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: order.customerName.trim(),
        mobile: cleanMobile,
        alternateMobile: order.alternateMobile || '',
        address: order.address || '',
        city: order.city || 'Kolkata',
        pincode: order.pincode || '',
        totalOrders: 1,
        totalSpending: Math.max(0, order.amount),
        lastOrderDate: order.date || new Date().toISOString().split('T')[0],
        notes: '',
      };
      customers.push(cust);
    } else {
      cust.totalOrders += 1;
      cust.totalSpending += Math.max(0, order.amount);
      cust.lastOrderDate = order.date || new Date().toISOString().split('T')[0];
      if (order.address && !cust.address) cust.address = order.address;
      if (order.city && (!cust.city || cust.city === 'Kolkata')) cust.city = order.city;
      if (order.pincode && !cust.pincode) cust.pincode = order.pincode;
      if (order.alternateMobile && !cust.alternateMobile) cust.alternateMobile = order.alternateMobile;
    }

    this.saveCustomers(customers);
  },

  // ==========================================
  // ADMIN-CONTROLLED PRICING & DISCOUNTS
  // ==========================================
  getFrameSizes(): FrameSizeConfigItem[] {
    const sizes = getCached<FrameSizeConfigItem[]>(STORAGE_KEYS.FRAME_SIZES, DEFAULT_FRAME_SIZES);
    return sizes.map((s) => {
      const orig = Number(s.originalPrice ?? s.basePrice) || 0;
      let finalPrice = orig;
      if (s.discountActive) {
        if (typeof s.discountedPrice === 'number' && s.discountedPrice > 0) {
          finalPrice = s.discountedPrice;
        } else if (typeof s.discountPercentage === 'number' && s.discountPercentage > 0) {
          finalPrice = Math.round(orig * (1 - s.discountPercentage / 100));
        }
      }
      return {
        ...s,
        originalPrice: orig,
        sellingPrice: finalPrice,
        basePrice: finalPrice,
      };
    });
  },

  // Helper for pricing config POST
  async postConfigPricing(type: string, items: any[]): Promise<{ success: boolean; error?: string }> {
    const token = this.getAuthToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin session required' };
    try {
      const res = await fetch('/api/admin/config/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to save pricing configuration' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving pricing configuration' };
    }
  },

  // Helper for content config POST
  async postConfigContent(type: string, data: any): Promise<{ success: boolean; error?: string }> {
    const token = this.getAuthToken();
    if (!token) return { success: false, error: 'Unauthorized: Admin session required' };
    try {
      const res = await fetch('/api/admin/config/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, data }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to save website content' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving website content' };
    }
  },

  async saveFrameSizes(sizes: FrameSizeConfigItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.FRAME_SIZES, sizes);
    return this.postConfigPricing('frameSizes', sizes);
  },

  getQualityTiers(): QualityTierConfigItem[] {
    const tiers = getCached<QualityTierConfigItem[]>(STORAGE_KEYS.QUALITY_TIERS, DEFAULT_QUALITY_TIERS);
    return tiers.map((t) => {
      const orig = Number(t.originalPriceDelta ?? t.priceAdjustment) || 0;
      let finalDelta = orig;
      if (t.discountActive && typeof t.discountedPriceDelta === 'number') {
        finalDelta = t.discountedPriceDelta;
      }
      return {
        ...t,
        originalPriceDelta: orig,
        priceAdjustment: finalDelta,
      };
    });
  },

  async saveQualityTiers(tiers: QualityTierConfigItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.QUALITY_TIERS, tiers);
    return this.postConfigPricing('qualityTiers', tiers);
  },

  getStickerSizes(): StickerSizeConfigItem[] {
    const stickers = getCached<StickerSizeConfigItem[]>(STORAGE_KEYS.STICKER_SIZES, DEFAULT_STICKER_SIZES);
    return stickers.map((s) => {
      const orig = Number(s.originalPrice ?? s.price) || 0;
      let finalPrice = orig;
      if (s.discountActive) {
        if (typeof s.discountedPrice === 'number' && s.discountedPrice > 0) {
          finalPrice = s.discountedPrice;
        } else if (typeof s.discountPercentage === 'number' && s.discountPercentage > 0) {
          finalPrice = Math.round(orig * (1 - s.discountPercentage / 100));
        }
      }
      return {
        ...s,
        originalPrice: orig,
        sellingPrice: finalPrice,
        price: finalPrice,
      };
    });
  },

  async saveStickerSizes(stickers: StickerSizeConfigItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.STICKER_SIZES, stickers);
    return this.postConfigPricing('stickerSizes', stickers);
  },

  getProductsConfig(): ProductConfigItem[] {
    return getCached<ProductConfigItem[]>(STORAGE_KEYS.PRODUCTS_CONFIG, DEFAULT_PRODUCTS);
  },

  async saveProductsConfig(products: ProductConfigItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.PRODUCTS_CONFIG, products);
    return this.postConfigPricing('products', products);
  },

  // ==========================================
  // WEBSITE CONTENT & TEMPLATES
  // ==========================================
  getExistingDesigns(): ExistingDesignItem[] {
    return getCached<ExistingDesignItem[]>(STORAGE_KEYS.EXISTING_DESIGNS, DEFAULT_DESIGNS);
  },

  async saveExistingDesigns(designs: ExistingDesignItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.EXISTING_DESIGNS, designs);
    return this.postConfigContent('existingDesigns', designs);
  },

  getReviews(): ReviewItem[] {
    return getCached<ReviewItem[]>(STORAGE_KEYS.REVIEWS, []);
  },

  async saveReviews(reviews: ReviewItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.REVIEWS, reviews);
    return this.postConfigContent('reviews', reviews);
  },

  getFaqs(): FaqItem[] {
    return getCached<FaqItem[]>(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
  },

  async saveFaqs(faqs: FaqItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.FAQS, faqs);
    return this.postConfigContent('faqs', faqs);
  },

  getOffers(): OfferItem[] {
    return getCached<OfferItem[]>(STORAGE_KEYS.OFFERS, []);
  },

  async saveOffers(offers: OfferItem[]): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.OFFERS, offers);
    return this.postConfigContent('offers', offers);
  },

  getSettings(): WebsiteSettingsData {
    return getCached<WebsiteSettingsData>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  getWebsiteSettings(): WebsiteSettingsData {
    return this.getSettings();
  },

  async saveSettings(settings: WebsiteSettingsData): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.SETTINGS, settings);
    return this.postConfigContent('websiteSettings', settings);
  },

  async saveWebsiteSettings(settings: WebsiteSettingsData): Promise<{ success: boolean; error?: string }> {
    return this.saveSettings(settings);
  },

  getSeoSettings(): {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    ogTitle: string;
    ogDescription: string;
    robotsDirective: string;
  } {
    const s = this.getSettings();
    return {
      seoTitle: s.seoTitle || 'MomentPress — Custom Photo Frames & Personalized Gifts in Kolkata',
      seoDescription: s.seoDescription || 'Handcrafted custom photo frames & waterproof photo stickers in Kolkata. Archival 12-color pigment printing with free WhatsApp proof preview.',
      seoKeywords: s.seoKeywords || 'custom photo frames, personalized photo frames, photo gifts, custom photo printing, personalized gifts Kolkata',
      ogTitle: s.ogTitle || 'MomentPress — Custom Photo Frames & Personalized Gifts in Kolkata',
      ogDescription: s.ogDescription || 'Handcrafted custom photo frames & waterproof photo stickers in Kolkata. Archival 12-color pigment printing with free WhatsApp proof preview.',
      robotsDirective: s.robotsDirective || 'index, follow, max-image-preview:large',
    };
  },

  async saveSeoSettings(seo: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    robotsDirective?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const s = this.getSettings();
    const updated = { ...s, ...seo };
    return this.saveSettings(updated);
  },

  getWhatsAppTemplates(): WhatsAppTemplateItem[] {
    return getCached<WhatsAppTemplateItem[]>(STORAGE_KEYS.WHATSAPP_TEMPLATES, DEFAULT_TEMPLATES);
  },

  async saveWhatsAppTemplate(template: WhatsAppTemplateItem): Promise<{ success: boolean; error?: string }> {
    const list = this.getWhatsAppTemplates();
    const idx = list.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      list[idx] = template;
    } else {
      list.push(template);
    }
    setCached(STORAGE_KEYS.WHATSAPP_TEMPLATES, list);
    return this.postConfigContent('whatsappTemplates', list);
  },

  async deleteWhatsAppTemplate(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getWhatsAppTemplates().filter((t) => t.id !== id);
    setCached(STORAGE_KEYS.WHATSAPP_TEMPLATES, list);
    return this.postConfigContent('whatsappTemplates', list);
  },

  // ==========================================
  // HOMEPAGE HERO & SECTIONS CMS
  // ==========================================
  getHomepageHeroConfig(): HomepageHeroConfig {
    return getCached<HomepageHeroConfig>(STORAGE_KEYS.HOMEPAGE_HERO, DEFAULT_HOMEPAGE_HERO);
  },

  async saveHomepageHeroConfig(hero: HomepageHeroConfig): Promise<{ success: boolean; error?: string }> {
    setCached(STORAGE_KEYS.HOMEPAGE_HERO, hero);
    return this.postConfigContent('homepageHero', hero);
  },

  getHomepageSections(): HomepageSectionConfig[] {
    const sections = getCached<HomepageSectionConfig[]>(STORAGE_KEYS.HOMEPAGE_SECTIONS, DEFAULT_HOMEPAGE_SECTIONS);
    return sections.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async saveHomepageSections(sections: HomepageSectionConfig[]): Promise<{ success: boolean; error?: string }> {
    const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
    setCached(STORAGE_KEYS.HOMEPAGE_SECTIONS, sorted);
    return this.postConfigContent('homepageSections', sorted);
  },

  // ==========================================
  // INDIVIDUAL ITEM CRUD HELPERS FOR CMS
  // ==========================================
  async saveProductConfigItem(product: ProductConfigItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getProductsConfig();
    const idx = current.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      current[idx] = product;
    } else {
      current.push(product);
    }
    return this.saveProductsConfig(current);
  },

  async deleteProductConfig(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getProductsConfig().filter((p) => p.id !== id);
    return this.saveProductsConfig(filtered);
  },

  async saveFrameSizeItem(size: FrameSizeConfigItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getFrameSizes();
    const idx = current.findIndex((s) => s.id === size.id);
    if (idx >= 0) {
      current[idx] = size;
    } else {
      current.push(size);
    }
    return this.saveFrameSizes(current);
  },

  async deleteFrameSize(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getFrameSizes().filter((s) => s.id !== id);
    return this.saveFrameSizes(filtered);
  },

  async saveQualityTierItem(tier: QualityTierConfigItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getQualityTiers();
    const idx = current.findIndex((t) => t.id === tier.id);
    if (idx >= 0) {
      current[idx] = tier;
    } else {
      current.push(tier);
    }
    return this.saveQualityTiers(current);
  },

  async deleteQualityTier(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getQualityTiers().filter((t) => t.id !== id);
    return this.saveQualityTiers(filtered);
  },

  async saveStickerSizeItem(sticker: StickerSizeConfigItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getStickerSizes();
    const idx = current.findIndex((s) => s.id === sticker.id);
    if (idx >= 0) {
      current[idx] = sticker;
    } else {
      current.push(sticker);
    }
    return this.saveStickerSizes(current);
  },

  async deleteStickerSize(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getStickerSizes().filter((s) => s.id !== id);
    return this.saveStickerSizes(filtered);
  },

  async saveExistingDesignItem(design: ExistingDesignItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getExistingDesigns();
    const idx = current.findIndex((d) => d.id === design.id);
    if (idx >= 0) {
      current[idx] = design;
    } else {
      current.push(design);
    }
    return this.saveExistingDesigns(current);
  },

  async deleteExistingDesign(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getExistingDesigns().filter((d) => d.id !== id);
    return this.saveExistingDesigns(filtered);
  },

  async saveReviewItem(review: ReviewItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getReviews();
    const idx = current.findIndex((r) => r.id === review.id);
    if (idx >= 0) {
      current[idx] = review;
    } else {
      current.push(review);
    }
    return this.saveReviews(current);
  },

  async deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getReviews().filter((r) => r.id !== id);
    return this.saveReviews(filtered);
  },

  async toggleReviewVisibility(id: string): Promise<{ success: boolean; error?: string }> {
    const current = this.getReviews();
    const updated = current.map((r) =>
      r.id === id ? { ...r, visible: r.visible === false ? true : false, active: r.visible === false ? true : false } : r
    );
    return this.saveReviews(updated);
  },

  async toggleReviewFeatured(id: string): Promise<{ success: boolean; error?: string }> {
    const current = this.getReviews();
    const updated = current.map((r) =>
      r.id === id ? { ...r, featured: !r.featured } : r
    );
    return this.saveReviews(updated);
  },

  async saveFaqItem(faq: FaqItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getFaqs();
    const idx = current.findIndex((f) => f.id === faq.id);
    if (idx >= 0) {
      current[idx] = faq;
    } else {
      current.push(faq);
    }
    return this.saveFaqs(current);
  },

  async deleteFaq(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getFaqs().filter((f) => f.id !== id);
    return this.saveFaqs(filtered);
  },

  async saveOfferItem(offer: OfferItem): Promise<{ success: boolean; error?: string }> {
    const current = this.getOffers();
    const idx = current.findIndex((o) => o.id === offer.id);
    if (idx >= 0) {
      current[idx] = offer;
    } else {
      current.push(offer);
    }
    return this.saveOffers(current);
  },

  async deleteOffer(id: string): Promise<{ success: boolean; error?: string }> {
    const filtered = this.getOffers().filter((o) => o.id !== id);
    return this.saveOffers(filtered);
  },

  deleteOnlineOrder(id: string): boolean {
    const orders = this.getOnlineOrders().filter((o) => o.id !== id);
    this.saveOnlineOrders(orders);
    const token = this.getAuthToken();
    if (token) {
      fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    return true;
  },

  getActivityLogs(): ActivityLogItem[] {
    return getCached<ActivityLogItem[]>(STORAGE_KEYS.ACTIVITY_LOG, []);
  },

  logActivity(action: string, entityType: string, entityId: string, description: string): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLogItem = {
      id: `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user: this.getAuthUser() || 'Admin',
      action,
      entityType: entityType as any,
      entityId,
      description,
    };
    logs.unshift(newLog);
    setCached(STORAGE_KEYS.ACTIVITY_LOG, logs);

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/activity-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLog),
      }).catch(() => {});
    }
  },

  // ==========================================
  // REAL FINANCIAL ANALYTICS (ZERO DEMO NUMBERS)
  // ==========================================
  getDashboardMetrics(): {
    todayOrdersCount: number;
    todaySales: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    lowStockItems: InventoryItem[];
    lowStockItemsCount: number;
    monthlySales: number;
    thisMonthSales: number;
    monthlyProfit: number;
    thisMonthProfit: number;
    thisMonthCost: number;
    totalOnlineSales: number;
    totalOfflineSales: number;
    totalOnlineOrdersCount: number;
    totalOfflineSalesCount: number;
    pendingPaymentsAmount: number;
    pendingPaymentsCount: number;
    totalActiveCustomers: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const online = this.getOnlineOrders();
    const offline = this.getOfflineSales();
    const inventory = this.getInventory();

    const todayOnline = online.filter((o) => o.createdDate === today);
    const todayOffline = offline.filter((o) => o.orderDate === today);

    const todaySales =
      todayOnline.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0) +
      todayOffline.reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);

    const pendingOrders =
      online.filter((o) => o.orderStatus === 'Pending').length +
      offline.filter((o) => o.orderStatus === 'Pending').length;

    const processingOrders =
      online.filter((o) => o.orderStatus === 'Processing').length +
      offline.filter((o) => o.orderStatus === 'Processing').length;

    const deliveredOrders =
      online.filter((o) => o.orderStatus === 'Delivered').length +
      offline.filter((o) => o.orderStatus === 'Delivered').length;

    const lowStockItems = inventory.filter((i) => i.active && i.currentStock <= i.minimumStock);
    const lowStockCount = lowStockItems.length;

    const monthOnline = online.filter((o) => o.createdDate?.startsWith(currentMonth));
    const monthOffline = offline.filter((o) => o.orderDate?.startsWith(currentMonth));

    const totalOnlineSales = online
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

    const totalOfflineSales = offline
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);

    const thisMonthSales =
      monthOnline.filter((o) => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0) +
      monthOffline.filter((o) => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);

    const thisMonthOrderCosts =
      monthOnline.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0) +
      monthOffline.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);

    const thisMonthExpenses = this.getExpenses()
      .filter((e) => e.date?.startsWith(currentMonth))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const thisMonthCost = thisMonthOrderCosts + thisMonthExpenses;
    const thisMonthProfit = thisMonthSales - thisMonthCost;

    const pendingOffline = offline.filter((s) => s.paymentStatus !== 'Paid' && s.orderStatus !== 'Cancelled');
    const pendingPaymentsAmount = pendingOffline.reduce((sum, s) => sum + (Number(s.amountDue) || 0), 0);
    const pendingPaymentsCount = pendingOffline.length;

    return {
      todayOrdersCount: todayOnline.length + todayOffline.length,
      todaySales,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      lowStockItems,
      lowStockItemsCount: lowStockCount,
      monthlySales: thisMonthSales,
      thisMonthSales,
      monthlyProfit: thisMonthProfit,
      thisMonthProfit,
      thisMonthCost,
      totalOnlineSales,
      totalOfflineSales,
      totalOnlineOrdersCount: online.length,
      totalOfflineSalesCount: offline.length,
      pendingPaymentsAmount,
      pendingPaymentsCount,
      totalActiveCustomers: this.getCustomers().length,
    };
  },

  getMonthlyReport(monthStr: string) {
    const online = this.getOnlineOrders().filter((o) => o.createdDate?.startsWith(monthStr));
    const offline = this.getOfflineSales().filter((o) => o.orderDate?.startsWith(monthStr));
    const purchases = this.getPurchases().filter((p) => p.purchaseDate?.startsWith(monthStr));
    const expenses = this.getExpenses().filter((e) => e.date?.startsWith(monthStr));

    const activeOnline = online.filter((o) => o.orderStatus !== 'Cancelled');
    const activeOffline = offline.filter((o) => o.orderStatus !== 'Cancelled');

    const onlineSales = activeOnline.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
    const offlineSales = activeOffline.reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);
    const totalSales = onlineSales + offlineSales;

    const totalDiscounts =
      activeOnline.reduce((sum, o) => sum + (Number(o.discount) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);

    const totalUnitsSold =
      activeOnline.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);

    const totalOrderCosts =
      activeOnline.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);

    const totalPurchases = purchases.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalProductCost =
      activeOnline.reduce((sum, o) => sum + (Number(o.productCost) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.productCost) || 0), 0);
    const totalPrintingCost =
      activeOnline.reduce((sum, o) => sum + (Number(o.printingCost) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.printingCost) || 0), 0);
    const totalPackagingCost =
      activeOnline.reduce((sum, o) => sum + (Number(o.packagingCost) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.packagingCost) || 0), 0);
    const totalDeliveryCost =
      activeOnline.reduce((sum, o) => sum + (Number(o.deliveryCost) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.deliveryCost) || 0), 0);
    const totalOtherCosts =
      activeOnline.reduce((sum, o) => sum + (Number(o.otherCost) || 0), 0) +
      activeOffline.reduce((sum, o) => sum + (Number(o.otherCost) || 0), 0);

    const grossProfit = totalSales - totalOrderCosts;
    const netProfit = totalSales - (totalOrderCosts + totalExpenses);
    const profitMargin = totalSales > 0 ? parseFloat(((netProfit / totalSales) * 100).toFixed(1)) : 0;
    const grossMargin = totalSales > 0 ? parseFloat(((grossProfit / totalSales) * 100).toFixed(1)) : 0;

    const completedOrdersCount = activeOnline.length + activeOffline.length;
    const averageOrderValue = completedOrdersCount > 0 ? Math.round(totalSales / completedOrdersCount) : 0;

    return {
      month: monthStr,
      totalSales,
      onlineSales,
      totalOnlineSales: onlineSales,
      offlineSales,
      totalOfflineSales: offlineSales,
      totalDiscounts,
      totalUnitsSold,
      averageOrderValue,
      totalOrders: online.length + offline.length,
      activeOrdersCount: completedOrdersCount,
      deliveredOrders:
        online.filter((o) => o.orderStatus === 'Delivered').length +
        offline.filter((o) => o.orderStatus === 'Delivered').length,
      pendingOrders:
        online.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing' || o.orderStatus === 'Ready').length +
        offline.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing' || o.orderStatus === 'Ready').length,
      cancelledOrders:
        online.filter((o) => o.orderStatus === 'Cancelled').length +
        offline.filter((o) => o.orderStatus === 'Cancelled').length,
      purchasesCost: totalPurchases,
      totalPurchases,
      expensesCost: totalExpenses,
      totalExpenses,
      totalCosts: totalOrderCosts + totalExpenses,
      totalDirectCosts: totalOrderCosts,
      totalProductCost,
      totalPrintingCost,
      totalPackagingCost,
      totalDeliveryCost,
      totalOtherCosts,
      grossProfit,
      netProfit,
      profitMargin,
      grossMargin,
    };
  },

  getProductWiseSales(monthStr?: string): { product: string; unitsSold: number; revenue: number; cost: number; profit: number; margin: number }[] {
    const online = this.getOnlineOrders().filter((o) => o.orderStatus !== 'Cancelled' && (!monthStr || o.createdDate?.startsWith(monthStr)));
    const offline = this.getOfflineSales().filter((s) => s.orderStatus !== 'Cancelled' && (!monthStr || s.orderDate?.startsWith(monthStr)));

    const map = new Map<string, { unitsSold: number; revenue: number; cost: number; profit: number }>();

    for (const o of online) {
      const key = o.product || 'Custom Photo Frames';
      const cur = map.get(key) || { unitsSold: 0, revenue: 0, cost: 0, profit: 0 };
      cur.unitsSold += Number(o.quantity) || 1;
      cur.revenue += Number(o.finalAmount) || 0;
      cur.cost += Number(o.totalCost) || 0;
      cur.profit += Number(o.profit) || (Number(o.finalAmount) || 0) - (Number(o.totalCost) || 0);
      map.set(key, cur);
    }

    for (const s of offline) {
      const key = s.product || 'Custom Photo Frames';
      const cur = map.get(key) || { unitsSold: 0, revenue: 0, cost: 0, profit: 0 };
      const rev = Number(s.sellingPrice || s.finalAmount || 0);
      cur.unitsSold += Number(s.quantity) || 1;
      cur.revenue += rev;
      cur.cost += Number(s.totalCost) || 0;
      cur.profit += Number(s.profit) || (rev - (Number(s.totalCost) || 0));
      map.set(key, cur);
    }

    return Array.from(map.entries()).map(([product, data]) => ({
      product,
      unitsSold: data.unitsSold,
      revenue: data.revenue,
      cost: data.cost,
      profit: data.profit,
      margin: data.revenue > 0 ? parseFloat(((data.profit / data.revenue) * 100).toFixed(1)) : 0,
    }));
  },

  getSizeWiseSales(monthStr?: string): { size: string; unitsSold: number; revenue: number }[] {
    const online = this.getOnlineOrders().filter((o) => o.orderStatus !== 'Cancelled' && (!monthStr || o.createdDate?.startsWith(monthStr)));
    const offline = this.getOfflineSales().filter((s) => s.orderStatus !== 'Cancelled' && (!monthStr || s.orderDate?.startsWith(monthStr)));

    const map = new Map<string, { unitsSold: number; revenue: number }>();

    for (const o of online) {
      const key = o.size || 'Standard';
      const cur = map.get(key) || { unitsSold: 0, revenue: 0 };
      cur.unitsSold += Number(o.quantity) || 1;
      cur.revenue += Number(o.finalAmount) || 0;
      map.set(key, cur);
    }

    for (const s of offline) {
      const key = s.size || 'Standard';
      const cur = map.get(key) || { unitsSold: 0, revenue: 0 };
      cur.unitsSold += Number(s.quantity) || 1;
      cur.revenue += Number(s.sellingPrice || s.finalAmount || 0);
      map.set(key, cur);
    }

    return Array.from(map.entries()).map(([size, data]) => ({
      size,
      unitsSold: data.unitsSold,
      revenue: data.revenue,
    }));
  },

  getQualityWiseSales(monthStr?: string): { quality: string; unitsSold: number; revenue: number }[] {
    const online = this.getOnlineOrders().filter((o) => o.orderStatus !== 'Cancelled' && (!monthStr || o.createdDate?.startsWith(monthStr)));
    const offline = this.getOfflineSales().filter((s) => s.orderStatus !== 'Cancelled' && (!monthStr || s.orderDate?.startsWith(monthStr)));

    const map = new Map<string, { unitsSold: number; revenue: number }>();

    for (const o of online) {
      const key = o.quality || 'Standard';
      const cur = map.get(key) || { unitsSold: 0, revenue: 0 };
      cur.unitsSold += Number(o.quantity) || 1;
      cur.revenue += Number(o.finalAmount) || 0;
      map.set(key, cur);
    }

    for (const s of offline) {
      const key = s.quality || 'Standard';
      const cur = map.get(key) || { unitsSold: 0, revenue: 0 };
      cur.unitsSold += Number(s.quantity) || 1;
      cur.revenue += Number(s.sellingPrice || s.finalAmount || 0);
      map.set(key, cur);
    }

    return Array.from(map.entries()).map(([quality, data]) => ({
      quality,
      unitsSold: data.unitsSold,
      revenue: data.revenue,
    }));
  },

  // ==========================================
  // SAFE MAINTENANCE
  // ==========================================
  clearAllData(): void {
    setCached(STORAGE_KEYS.ONLINE_ORDERS, []);
    setCached(STORAGE_KEYS.OFFLINE_SALES, []);
    setCached(STORAGE_KEYS.CUSTOMERS, []);
    setCached(STORAGE_KEYS.INVENTORY, []);
    setCached(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    setCached(STORAGE_KEYS.PURCHASES, []);
    setCached(STORAGE_KEYS.EXPENSES, []);
    setCached(STORAGE_KEYS.ACTIVITY_LOG, []);

    const token = this.getAuthToken();
    if (token) {
      fetch('/api/admin/clear-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  },
};
