import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { DEFAULT_INVENTORY_ITEMS, DEFAULT_PRODUCT_MAPPINGS } from './src/lib/admin/default-inventory';
import { generateAndSaveBillPdf } from './src/lib/billing/pdf-generator';
import { uploadBillToGoogleDrive } from './src/lib/drive/google-drive-service';
import { appendOrderToSheet, updateOrderInSheet } from './src/lib/sheets/google-sheets-sync';
import type { PublicBillData } from './src/types/admin';

dotenv.config();

export const app = express();
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const cliPort = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1], 10) : null;
const PORT = cliPort || (process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const isProduction = process.env.NODE_ENV === 'production';

// Production Security Headers - Configured for AI Studio iFrame and safe assets
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https: ws: wss:; frame-ancestors *;"
  );
  if (req.path.startsWith('/admin') || req.path.startsWith('/api') || req.path.startsWith('/order')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  next();
});

// Technical SEO routes: robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsTxt = `# MomentPress Studio - Technical SEO Robots Directives
User-agent: *
Allow: /
Allow: /custom-photo-frames
Allow: /photo-stickers
Allow: /existing-designs
Allow: /faq
Allow: /contact

# Private Admin, Orders and API Routes
Disallow: /admin/
Disallow: /api/
Disallow: /order/

# XML Sitemap
Sitemap: https://momentpress.ai.studio/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(robotsTxt);
});

// Technical SEO routes: sitemap.xml
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const publicRoutes = [
    { loc: 'https://momentpress.ai.studio/', priority: '1.0' },
    { loc: 'https://momentpress.ai.studio/custom-photo-frames', priority: '0.9' },
    { loc: 'https://momentpress.ai.studio/photo-stickers', priority: '0.9' },
    { loc: 'https://momentpress.ai.studio/existing-designs', priority: '0.8' },
    { loc: 'https://momentpress.ai.studio/faq', priority: '0.7' },
    { loc: 'https://momentpress.ai.studio/contact', priority: '0.7' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const r of publicRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${r.loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
});

app.use(express.json({ limit: '10mb' }));

// Determine a writable data directory for store persistence:
// - Locally / on standard servers: ./data (if writable)
// - On Vercel Serverless / AWS Lambda / read-only filesystem: os.tmpdir()/momentpress-data
function resolveDataDir(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const localDir = path.resolve(process.cwd(), 'data');

  if (!isServerless) {
    try {
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      const testFile = path.join(localDir, `.writetest-${Date.now()}`);
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      return localDir;
    } catch (_) {
      // Local dir is not writable; fall back to temporary directory
    }
  }

  const tmpDir = path.join(os.tmpdir(), 'momentpress-data');
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (_) {
    return os.tmpdir();
  }
}

const DATA_DIR = resolveDataDir();
const DATA_FILE = path.join(DATA_DIR, 'momentpress-store.json');

// Cryptographic helpers
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// In-Memory Rate Limiting for Admin Authentication
interface LoginAttemptRecord {
  failedAttempts: number;
  blockedUntil: number;
}
const loginAttemptsMap = new Map<string, LoginAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// In-Memory Rate Limiting for Public Order Submissions
interface OrderRateRecord {
  count: number;
  resetAt: number;
}
const orderRateLimitMap = new Map<string, OrderRateRecord>();
const MAX_ORDERS_PER_WINDOW = 60; // 60 orders per 5 min window per IP
const ORDER_WINDOW_MS = 5 * 60 * 1000;

// In-Memory Rate Limiting for Public Bill Inquiries
const billRateLimitMap = new Map<string, OrderRateRecord>();
const MAX_BILLS_PER_WINDOW = 120; // 120 requests per 5 min window per IP
const BILL_WINDOW_MS = 5 * 60 * 1000;

function getClientIp(req: Request): string {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return realIp.trim();
    }
    if (req.socket && req.socket.remoteAddress) {
      return req.socket.remoteAddress;
    }
  } catch (_) {}
  return 'unknown-ip';
}

// Data Store Interface
interface Session {
  token: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

interface StoreData {
  adminCredentials: {
    username: string;
    passwordSalt: string;
    passwordHash: string;
    needsSetup?: boolean;
    updatedAt: string;
  };
  sessions: Session[];
  nextOrderNumber?: number;
  onlineOrders: any[];
  offlineSales: any[];
  customers: any[];
  inventory: any[];
  stockMovements: any[];
  purchases: any[];
  expenses: any[];
  activityLog: any[];
  reviews: any[];
  products: any[];
  frameSizes: any[];
  qualityTiers: any[];
  stickerSizes: any[];
  existingDesigns: any[];
  faqs: any[];
  offers: any[];
  websiteSettings: any;
  whatsappTemplates: any[];
  productMappings: any[];
  homepageHero?: any;
  homepageSections?: any[];
}

// Initial Clean Production Schema (Zero Demo Orders, Zero Demo Customers)
// With Full Real Inventory and Product Mapping Automation Schema
function createInitialStore(): StoreData {
  const initialUsername = process.env.ADMIN_USERNAME || 'admin@momentpress.in';
  const envPassword = process.env.ADMIN_PASSWORD;

  const hasEnvPassword = Boolean(envPassword && envPassword.trim());
  const salt = hasEnvPassword ? generateSalt() : '';
  const hash = hasEnvPassword ? hashPassword(envPassword!.trim(), salt) : '';

  return {
    adminCredentials: {
      username: initialUsername,
      passwordSalt: salt,
      passwordHash: hash,
      needsSetup: !hasEnvPassword,
      updatedAt: new Date().toISOString(),
    },
    sessions: [],
    nextOrderNumber: 1,
    onlineOrders: [],
    offlineSales: [],
    customers: [],
    inventory: [...DEFAULT_INVENTORY_ITEMS],
    productMappings: [...DEFAULT_PRODUCT_MAPPINGS],
    stockMovements: [],
    purchases: [],
    expenses: [],
    activityLog: [],
    reviews: [],
    products: [
      {
        id: 'custom-photo-frames',
        name: 'Custom Photo Frames',
        type: 'frame',
        description: 'Handcrafted solid wood frames with crystal protective glass and archival photo paper.',
        originalStartingPrice: 199,
        discountedStartingPrice: null,
        discountPercentage: null,
        discountActive: false,
        startingPrice: 199,
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
        originalStartingPrice: 99,
        discountedStartingPrice: null,
        discountPercentage: null,
        discountActive: false,
        startingPrice: 99,
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
    ],
    frameSizes: [
      {
        id: '5x7',
        name: '5×7 in',
        dimensions: '13 × 18 cm (5×7 in)',
        originalPrice: 199,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 199,
        aspectRatio: '5:7',
        recommendedFor: 'Desk, Workstation & Nightstand',
        active: true,
        displayOrder: 1,
        popular: false,
      },
      {
        id: '6x8',
        name: '6×8 in',
        dimensions: '15 × 20 cm (6×8 in)',
        originalPrice: 249,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 249,
        aspectRatio: '3:4',
        recommendedFor: 'Shelves, Bookcases & Gifting',
        active: true,
        displayOrder: 2,
        popular: true,
        badge: 'Most Popular',
      },
      {
        id: '8x10',
        name: '8×10 in',
        dimensions: '20 × 25 cm (8×10 in)',
        originalPrice: 349,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 349,
        aspectRatio: '4:5',
        recommendedFor: 'Gallery Walls & Bedside Table',
        active: true,
        displayOrder: 3,
        popular: false,
      },
      {
        id: '10x12',
        name: '10×12 in',
        dimensions: '25 × 30 cm (10×12 in)',
        originalPrice: 449,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 449,
        aspectRatio: '5:6',
        recommendedFor: 'Living Room Feature Walls',
        active: true,
        displayOrder: 4,
        popular: false,
      },
      {
        id: '12x18',
        name: '12×18 in',
        dimensions: '30 × 45 cm (12×18 in)',
        originalPrice: 599,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        basePrice: 599,
        aspectRatio: '2:3',
        recommendedFor: 'Statement Centerpieces & Landscapes',
        active: true,
        displayOrder: 5,
        popular: false,
      },
    ],
    qualityTiers: [
      {
        id: 'good',
        name: 'Standard Luster',
        description: 'Crisp vibrant prints on 240 GSM resin-coated photo paper with rich color fidelity.',
        paperType: '240 GSM Resin-Coated Paper',
        finish: 'Subtle Pearl Luster',
        longevity: '25+ Years Display Life',
        originalPriceDelta: 0,
        discountedPriceDelta: null,
        discountActive: false,
        priceAdjustment: 0,
        active: true,
        displayOrder: 1,
      },
      {
        id: 'better',
        name: 'Studio Velvet',
        description: 'Deep contrast and rich blacks on 280 GSM premium satin photographic paper.',
        paperType: '280 GSM Premium Satin Paper',
        finish: 'Silky Matte Finish',
        longevity: '50+ Years Display Life',
        originalPriceDelta: 50,
        discountedPriceDelta: null,
        discountActive: false,
        priceAdjustment: 50,
        active: true,
        displayOrder: 2,
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
        originalPriceDelta: 100,
        discountedPriceDelta: null,
        discountActive: false,
        priceAdjustment: 100,
        active: true,
        displayOrder: 3,
        badge: 'Heirloom',
      },
    ],
    stickerSizes: [
      {
        id: 'Small',
        name: 'Small (2×2 in)',
        description: 'Compact vinyl stickers for phone cases, earbuds & mini items',
        originalPrice: 99,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        price: 99,
        active: true,
        displayOrder: 1,
      },
      {
        id: 'Medium',
        name: 'Medium (3×3 in)',
        description: 'Versatile size for laptops, water bottles & diaries',
        originalPrice: 149,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        price: 149,
        active: true,
        displayOrder: 2,
      },
      {
        id: 'Large',
        name: 'Large (4×4 in)',
        description: 'Statement vinyl decal for notebooks, boards & tech gear',
        originalPrice: 199,
        discountedPrice: null,
        discountPercentage: null,
        discountActive: false,
        price: 199,
        active: true,
        displayOrder: 3,
      },
    ],
    existingDesigns: [
      {
        id: 'gal-1',
        title: 'Golden Hour Portrait',
        name: 'Golden Hour Portrait',
        category: 'Portraits & Milestones',
        size: '8×10 in',
        finish: 'natural-oak',
        description: 'Printed on Studio Velvet satin paper with a hand-waxed natural oak border.',
        active: true,
        displayOrder: 1,
      },
      {
        id: 'gal-2',
        title: 'Darjeeling Tea Garden View',
        name: 'Darjeeling Tea Garden View',
        category: 'Landscapes & Travel',
        size: '12×18 in',
        finish: 'classic-black',
        description: 'Statement size landscape with Archival Fine Art cotton paper and anti-glare glass.',
        active: true,
        displayOrder: 2,
      },
      {
        id: 'gal-3',
        title: 'Kolkata Yellow Taxi Heritage',
        name: 'Kolkata Yellow Taxi Heritage',
        category: 'Architecture & Street',
        size: '6×8 in',
        finish: 'warm-walnut',
        description: 'Warm walnut frame complementing rich amber city hues.',
        active: true,
        displayOrder: 3,
      },
      {
        id: 'gal-4',
        title: 'Family Reunion Milestone',
        name: 'Family Reunion Milestone',
        category: 'Family Memories',
        size: '10×12 in',
        finish: 'warm-walnut',
        description: 'Classic heirloom frame commemorating three generations together.',
        active: true,
        displayOrder: 4,
      },
      {
        id: 'gal-5',
        title: 'Minimalist Botanical Study',
        name: 'Minimalist Botanical Study',
        category: 'Minimalist & Flora',
        size: '8×10 in',
        finish: 'gallery-white',
        description: 'Bright contemporary white profile paired with crisp 240 GSM Luster print.',
        active: true,
        displayOrder: 5,
      },
      {
        id: 'gal-6',
        title: 'Pet Companion Memory',
        name: 'Pet Companion Memory',
        category: 'Pets & Companions',
        size: '6×8 in',
        finish: 'classic-black',
        description: 'Compact shelf display with deep shadowline black profile.',
        active: true,
        displayOrder: 6,
      },
    ],
    faqs: [
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
    ],
    offers: [],
    websiteSettings: {
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
    },
    whatsappTemplates: [
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
    ],
    homepageHero: {
      heading: 'Your memory, beautifully framed.',
      subheading: 'Turn your favorite moments into beautiful personalized frames and photo products.',
      hookBadgeText: 'Starting from just ₹99',
      ctaText: 'Create Your Frame',
      ctaLink: '#products',
      secondaryCtaText: 'Existing Designs',
      secondaryCtaLink: '#existing-designs',
      visible: true,
    },
    homepageSections: [
      { id: 'hero', name: 'Hero Banner', description: 'Main headline, tagline, starting prices & CTA buttons', visible: true, displayOrder: 1 },
      { id: 'trust', name: 'Trust Indicators', description: 'Free digital proof, anti-glare glass & 48h delivery badges', visible: true, displayOrder: 2 },
      { id: 'products', name: 'Products & Frame Customizer', description: 'Product cards and interactive sizing & customization workspace', visible: true, displayOrder: 3 },
      { id: 'how-it-works', name: 'How It Works', description: '4-step simple order guide (Select, WhatsApp, Proof, Delivery)', visible: true, displayOrder: 4 },
      { id: 'existing-designs', name: 'Existing Designs Showcase Banner', description: 'Curated gallery link banner inviting customers to explore designs', visible: true, displayOrder: 5 },
      { id: 'reviews', name: 'Customer Reviews', description: 'Verified customer feedback and testimonials across Kolkata', visible: true, displayOrder: 6 },
      { id: 'faq', name: 'Frequently Asked Questions', description: 'Answers to common framing, printing, and delivery questions', visible: true, displayOrder: 7 },
      { id: 'final-cta', name: 'Final Conversion CTA', description: 'Bottom call-to-action banner driving frame customization', visible: true, displayOrder: 8 },
    ],
  };
}

const BACKUP_FILE = path.join(DATA_DIR, 'momentpress-store.json.backup');

// Persistent Store Handler
let store: StoreData = (function loadStore(): StoreData {
  const tryParse = (filePath: string): StoreData | null => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content && content.trim()) {
          return JSON.parse(content);
        }
      }
    } catch (e) {
      console.warn(`Failed reading store from ${filePath}:`, e);
    }
    return null;
  };

  let parsed: StoreData | null = tryParse(DATA_FILE);
  if (!parsed && fs.existsSync(BACKUP_FILE)) {
    console.warn(`Attempting recovery from backup store: ${BACKUP_FILE}`);
    parsed = tryParse(BACKUP_FILE);
  }
  // Check if a seed store exists in the project root if DATA_DIR is tmpdir
  if (!parsed) {
    const seedFile = path.resolve(process.cwd(), 'data', 'momentpress-store.json');
    if (fs.existsSync(seedFile)) {
      parsed = tryParse(seedFile);
    }
  }

  if (parsed) {
    const now = Date.now();
    // Clean up expired sessions (older than 24h)
    parsed.sessions = (parsed.sessions || []).filter((s: Session) => s.expiresAt > now);

    // Credential Hardening: Zero hardcoded password fallbacks
    if (!parsed.adminCredentials || !parsed.adminCredentials.passwordHash) {
      if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
        const envPassword = process.env.ADMIN_PASSWORD.trim();
        const salt = generateSalt();
        parsed.adminCredentials = {
          username: process.env.ADMIN_USERNAME || parsed.adminCredentials?.username || 'admin',
          passwordSalt: salt,
          passwordHash: hashPassword(envPassword, salt),
          needsSetup: false,
          updatedAt: new Date().toISOString(),
        };
      } else {
        parsed.adminCredentials = {
          username: process.env.ADMIN_USERNAME || parsed.adminCredentials?.username || 'admin',
          passwordSalt: '',
          passwordHash: '',
          needsSetup: true,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    // Initialize productMappings and inventory defaults if missing
    if (!parsed.productMappings || !Array.isArray(parsed.productMappings) || parsed.productMappings.length === 0) {
      parsed.productMappings = [...DEFAULT_PRODUCT_MAPPINGS];
    }
    if (!parsed.inventory || !Array.isArray(parsed.inventory) || parsed.inventory.length === 0) {
      parsed.inventory = [...DEFAULT_INVENTORY_ITEMS];
    }
    if (!parsed.homepageHero) {
      parsed.homepageHero = {
        heading: 'Your memory, beautifully framed.',
        subheading: 'Turn your favorite moments into beautiful personalized frames and photo products.',
        hookBadgeText: 'Starting from just ₹99',
        ctaText: 'Create Your Frame',
        ctaLink: '#products',
        secondaryCtaText: 'Existing Designs',
        secondaryCtaLink: '#existing-designs',
        visible: true,
      };
    } else if (parsed.homepageHero.heading === 'Handcrafted Keepsake Frames Made for Your Memories') {
      parsed.homepageHero.heading = 'Your memory, beautifully framed.';
    }

    if (parsed.websiteSettings && parsed.websiteSettings.heroHeadline === 'Handcrafted Keepsake Frames Made for Your Memories') {
      parsed.websiteSettings.heroHeadline = 'Your memory, beautifully framed.';
    }
    if (!parsed.homepageSections || !Array.isArray(parsed.homepageSections) || parsed.homepageSections.length === 0) {
      parsed.homepageSections = [
        { id: 'hero', name: 'Hero Banner', description: 'Main headline, tagline, starting prices & CTA buttons', visible: true, displayOrder: 1 },
        { id: 'trust', name: 'Trust Indicators', description: 'Free digital proof, anti-glare glass & 48h delivery badges', visible: true, displayOrder: 2 },
        { id: 'products', name: 'Products & Frame Customizer', description: 'Product cards and interactive sizing & customization workspace', visible: true, displayOrder: 3 },
        { id: 'how-it-works', name: 'How It Works', description: '4-step simple order guide (Select, WhatsApp, Proof, Delivery)', visible: true, displayOrder: 4 },
        { id: 'existing-designs', name: 'Existing Designs Showcase Banner', description: 'Curated gallery link banner inviting customers to explore designs', visible: true, displayOrder: 5 },
        { id: 'reviews', name: 'Customer Reviews', description: 'Verified customer feedback and testimonials across Kolkata', visible: true, displayOrder: 6 },
        { id: 'faq', name: 'Frequently Asked Questions', description: 'Answers to common framing, printing, and delivery questions', visible: true, displayOrder: 7 },
        { id: 'final-cta', name: 'Final Conversion CTA', description: 'Bottom call-to-action banner driving frame customization', visible: true, displayOrder: 8 },
      ];
    }

    if (typeof parsed.nextOrderNumber !== 'number') {
      let maxExisting = 0;
      const allOrders = [
        ...(Array.isArray(parsed.onlineOrders) ? parsed.onlineOrders : []),
        ...(Array.isArray(parsed.offlineSales) ? parsed.offlineSales : []),
      ];
      for (const o of allOrders) {
        if (o && typeof o.id === 'string') {
          const match = o.id.match(/^MP-(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxExisting) maxExisting = num;
          }
        }
      }
      parsed.nextOrderNumber = Math.max(1, maxExisting + 1);
    }

    // Save initial backup copy
    try {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (_) {}

    return parsed;
  }

  const initial = createInitialStore();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    try {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (_) {}
  } catch (writeErr) {
    console.warn('Could not write initial store to disk (ephemeral memory in use):', writeErr);
  }
  return initial;
})();

function saveStore(): void {
  try {
    const dataStr = JSON.stringify(store, null, 2);
    const tmpFile = path.join(DATA_DIR, `momentpress-store.json.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`);
    fs.writeFileSync(tmpFile, dataStr, 'utf-8');
    try {
      fs.renameSync(tmpFile, DATA_FILE);
    } catch (renameErr) {
      fs.copyFileSync(tmpFile, DATA_FILE);
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    // Maintain reliable backup copy
    try {
      fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    } catch (_) {}
  } catch (err) {
    console.warn('Failed saving store to disk (continuing with in-memory store):', err);
  }
}

function getBillsDir(): string {
  const dir = path.join(DATA_DIR, 'bills');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  } catch (err) {
    const fallback = path.join(os.tmpdir(), 'momentpress-bills');
    try {
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true });
      }
    } catch (_) {}
    return fallback;
  }
}

// Security Middleware: Require Valid Admin Session
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  } else if (typeof req.query.auth === 'string' && req.query.auth.trim()) {
    token = req.query.auth.trim();
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    return;
  }

  const now = Date.now();
  const session = store.sessions.find((s) => s.token === token && s.expiresAt > now);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }

  // Attach session info
  (req as any).adminSession = session;
  next();
}

// ==========================================
// AUTHENTICATION ROUTES (PRODUCTION SECURE)
// ==========================================

// Check whether initial setup is required
app.get('/api/auth/status', (req: Request, res: Response) => {
  res.json({
    isSetupRequired: Boolean(store.adminCredentials.needsSetup),
  });
});

// Initial Credential Setup (Only allowed if needsSetup is true)
app.post('/api/auth/setup', (req: Request, res: Response) => {
  if (!store.adminCredentials.needsSetup) {
    res.status(403).json({ error: 'Administrator credentials already established. Setup is locked.' });
    return;
  }

  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || !username.trim()) {
    res.status(400).json({ error: 'Valid administrator username or email is required' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  // Password complexity: must contain letters and numbers
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    res.status(400).json({ error: 'Password must contain both letters and numbers' });
    return;
  }

  const salt = generateSalt();
  store.adminCredentials = {
    username: username.trim(),
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
    needsSetup: false,
    updatedAt: new Date().toISOString(),
  };

  // Generate authenticated session
  const token = generateSecureToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  store.sessions = [
    {
      token,
      username: store.adminCredentials.username,
      createdAt: Date.now(),
      expiresAt,
    },
  ];

  saveStore();

  res.json({
    success: true,
    message: 'Production administrator credentials established successfully.',
    token,
    username: store.adminCredentials.username,
    expiresAt,
  });
});

// Login endpoint with rate limiting & generic failure
app.post('/api/auth/login', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const attempt = loginAttemptsMap.get(ip) || { failedAttempts: 0, blockedUntil: 0 };

  // Check rate limit lockout
  if (attempt.blockedUntil > now) {
    const remainingMinutes = Math.ceil((attempt.blockedUntil - now) / 60000);
    res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${remainingMinutes} minute(s).`,
    });
    return;
  }

  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const normalizedInputUser = String(username).trim().toLowerCase();
  const storedUser = store.adminCredentials.username.trim().toLowerCase();

  const userMatches =
    normalizedInputUser === storedUser ||
    (storedUser === 'admin' && normalizedInputUser === 'admin@momentpress.in') ||
    (storedUser === 'admin@momentpress.in' && normalizedInputUser === 'admin');
  const inputHash = store.adminCredentials.passwordSalt
    ? hashPassword(String(password), store.adminCredentials.passwordSalt)
    : '';
  const passwordMatches = inputHash === store.adminCredentials.passwordHash;

  if (!userMatches || !passwordMatches) {
    // Increment failed attempts
    attempt.failedAttempts += 1;
    if (attempt.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      attempt.blockedUntil = now + BLOCK_DURATION_MS;
      attempt.failedAttempts = 0;
    }
    loginAttemptsMap.set(ip, attempt);

    // Generic response: do NOT reveal whether username or password was wrong
    res.status(401).json({ error: 'Invalid credentials. Access denied.' });
    return;
  }

  // Successful login: reset failed attempts for this IP
  loginAttemptsMap.delete(ip);

  // Clean expired sessions
  store.sessions = (store.sessions || []).filter((s) => s.expiresAt > now);

  const token = generateSecureToken();
  const expiresAt = now + 24 * 60 * 60 * 1000;

  store.sessions.push({
    token,
    username: store.adminCredentials.username,
    createdAt: now,
    expiresAt,
  });

  saveStore();

  res.json({
    success: true,
    token,
    username: store.adminCredentials.username,
    expiresAt,
  });
});

// Check Session Status
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const token = authHeader.substring(7).trim();
  const now = Date.now();
  const session = store.sessions.find((s) => s.token === token && s.expiresAt > now);

  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    username: session.username,
    expiresAt: session.expiresAt,
  });
});

// Logout (invalidate session)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    store.sessions = store.sessions.filter((s) => s.token !== token);
    saveStore();
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change Admin Credentials (Password / Username)
app.post('/api/auth/change-credentials', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  const currentToken = (req as any).adminSession?.token;

  if (!currentPassword) {
    res.status(400).json({ error: 'Current password is required' });
    return;
  }

  const currentHash = hashPassword(String(currentPassword), store.adminCredentials.passwordSalt);
  if (currentHash !== store.adminCredentials.passwordHash) {
    res.status(403).json({ error: 'Current password is incorrect' });
    return;
  }

  if (newUsername && typeof newUsername === 'string' && newUsername.trim()) {
    store.adminCredentials.username = newUsername.trim();
  }

  if (newPassword && typeof newPassword === 'string') {
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      res.status(400).json({ error: 'New password must contain both letters and numbers' });
      return;
    }
    const newSalt = generateSalt();
    store.adminCredentials.passwordSalt = newSalt;
    store.adminCredentials.passwordHash = hashPassword(newPassword, newSalt);

    // Invalidate all other sessions for security
    store.sessions = store.sessions.filter((s) => s.token === currentToken);
  }

  store.adminCredentials.updatedAt = new Date().toISOString();
  saveStore();

  res.json({
    success: true,
    message: 'Admin credentials successfully updated',
    username: store.adminCredentials.username,
  });
});

// ==========================================
// PUBLIC ROUTES FOR CUSTOMER WEBSITE
// (NEVER EXPOSE PASSWORDS, SENSITIVE COSTS)
// ==========================================

// Get active public website configuration (Products, Sizes, Discounts, FAQs, Reviews)
app.get('/api/public/config', (req: Request, res: Response) => {
  // Compute dynamic selling prices and discounts
  const frameSizes = store.frameSizes
    .filter((f) => f.active)
    .map((f) => {
      let finalPrice = f.originalPrice;
      if (f.discountActive) {
        if (typeof f.discountedPrice === 'number' && f.discountedPrice > 0) {
          finalPrice = f.discountedPrice;
        } else if (typeof f.discountPercentage === 'number' && f.discountPercentage > 0) {
          finalPrice = Math.round(f.originalPrice * (1 - f.discountPercentage / 100));
        }
      }
      return {
        ...f,
        sellingPrice: finalPrice,
        hasDiscount: f.discountActive && finalPrice < f.originalPrice,
      };
    });

  const qualityTiers = store.qualityTiers
    .filter((q) => q.active)
    .map((q) => {
      let finalDelta = q.originalPriceDelta;
      if (q.discountActive && typeof q.discountedPriceDelta === 'number') {
        finalDelta = q.discountedPriceDelta;
      }
      return {
        ...q,
        priceAdjustment: finalDelta,
        hasDiscount: q.discountActive && finalDelta < q.originalPriceDelta,
      };
    });

  const stickerSizes = store.stickerSizes
    .filter((s) => s.active)
    .map((s) => {
      let finalPrice = s.originalPrice;
      if (s.discountActive) {
        if (typeof s.discountedPrice === 'number' && s.discountedPrice > 0) {
          finalPrice = s.discountedPrice;
        } else if (typeof s.discountPercentage === 'number' && s.discountPercentage > 0) {
          finalPrice = Math.round(s.originalPrice * (1 - s.discountPercentage / 100));
        }
      }
      return {
        ...s,
        sellingPrice: finalPrice,
        hasDiscount: s.discountActive && finalPrice < s.originalPrice,
      };
    });

  const products = store.products
    .filter((p) => p.active)
    .map((p) => {
      let finalStarting = p.originalStartingPrice;
      if (p.discountActive && typeof p.discountedStartingPrice === 'number' && p.discountedStartingPrice > 0) {
        finalStarting = p.discountedStartingPrice;
      }
      return {
        ...p,
        startingPrice: finalStarting,
        hasDiscount: p.discountActive && finalStarting < p.originalStartingPrice,
      };
    });

  res.json({
    products,
    frameSizes,
    qualityTiers,
    stickerSizes,
    existingDesigns: (store.existingDesigns || [])
      .filter((d: any) => d.active !== false && d.visible !== false)
      .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    reviews: (store.reviews || [])
      .filter((r: any) => r.active !== false && r.visible !== false)
      .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((r: any) => ({
        id: r.id,
        customerName: r.customerName || r.name || '',
        name: r.customerName || r.name || '',
        reviewText: r.reviewText || r.comment || '',
        comment: r.reviewText || r.comment || '',
        rating: r.rating,
        date: r.date || '',
        location: r.location || '',
        imageUrl: r.imageUrl || r.customerPhoto || '',
        customerPhoto: r.customerPhoto || r.imageUrl || '',
        featured: Boolean(r.featured),
        displayOrder: r.displayOrder || 0,
        verified: r.verified !== false,
        productPurchased: r.productPurchased || '',
      })),
    faqs: (store.faqs || [])
      .filter((f: any) => f.active !== false && f.visible !== false)
      .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    offers: (store.offers || [])
      .filter((o: any) => o.active !== false && o.visible !== false),
    homepageHero: store.homepageHero,
    homepageSections: store.homepageSections,
    settings: {
      ...store.websiteSettings,
      whatsapp: store.websiteSettings.whatsappNumber,
    },
    whatsappTemplates: store.whatsappTemplates,
  });
});

// ==========================================
// AUTHORITATIVE SERVER-SIDE PRICING & ORDER VALIDATION
// ==========================================

interface ServerPricingResult {
  valid: boolean;
  status: number;
  error?: string;
  productName: string;
  sizeName: string;
  qualityName: string;
  quantity: number;
  unitOriginalPrice: number;
  unitPrice: number;
  unitDiscount: number;
  totalOriginalPrice: number;
  totalDiscount: number;
  finalAmount: number;
}

function calculateServerOrderPrice(params: {
  product: any;
  size: any;
  quality?: any;
  quantity: any;
}): ServerPricingResult {
  // 1. Quantity validation
  if (params.quantity === undefined || params.quantity === null || typeof params.quantity === 'boolean') {
    return {
      valid: false,
      status: 400,
      error: 'Quantity is required',
      productName: '',
      sizeName: '',
      qualityName: '',
      quantity: 0,
      unitOriginalPrice: 0,
      unitPrice: 0,
      unitDiscount: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      finalAmount: 0,
    };
  }

  const numQty = Number(params.quantity);
  if (isNaN(numQty) || !Number.isInteger(numQty) || numQty < 1 || numQty > 100) {
    return {
      valid: false,
      status: 400,
      error: 'Quantity must be a whole number between 1 and 100',
      productName: '',
      sizeName: '',
      qualityName: '',
      quantity: 0,
      unitOriginalPrice: 0,
      unitPrice: 0,
      unitDiscount: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      finalAmount: 0,
    };
  }
  const qty = numQty;

  // 2. Product validation
  const rawProduct = String(params.product || '').trim();
  const lowerProduct = rawProduct.toLowerCase();
  const isFrame = lowerProduct.includes('frame') || lowerProduct === 'custom-photo-frames';
  const isSticker = lowerProduct.includes('sticker') || lowerProduct === 'photo-stickers';

  if (!isFrame && !isSticker) {
    return {
      valid: false,
      status: 400,
      error: `Invalid product: "${rawProduct}". Must be "Custom Photo Frames" or "Photo Stickers".`,
      productName: '',
      sizeName: '',
      qualityName: '',
      quantity: qty,
      unitOriginalPrice: 0,
      unitPrice: 0,
      unitDiscount: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      finalAmount: 0,
    };
  }

  if (isFrame) {
    // Validate Frame Size
    const rawSize = String(params.size || '').trim();
    if (!rawSize) {
      return {
        valid: false,
        status: 400,
        error: 'Frame size is required',
        productName: 'Custom Photo Frames',
        sizeName: '',
        qualityName: '',
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0,
      };
    }

    const normalize = (s: string) => s.toLowerCase().replace(/[\s×x\-in\.]/g, '');
    const normSize = normalize(rawSize);

    const frameSize = store.frameSizes.find(
      (f: any) =>
        f.active !== false &&
        (f.id.toLowerCase() === rawSize.toLowerCase() ||
          f.name.toLowerCase() === rawSize.toLowerCase() ||
          normalize(f.id) === normSize ||
          normalize(f.name) === normSize)
    );

    if (!frameSize) {
      const available = store.frameSizes
        .filter((f: any) => f.active !== false)
        .map((f: any) => f.name)
        .join(', ');
      return {
        valid: false,
        status: 400,
        error: `Invalid frame size: "${rawSize}". Available sizes: ${available}`,
        productName: 'Custom Photo Frames',
        sizeName: '',
        qualityName: '',
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0,
      };
    }

    // Validate Frame Quality Tier
    const rawQuality = String(params.quality || '').trim();
    if (!rawQuality) {
      return {
        valid: false,
        status: 400,
        error: 'Frame quality tier is required',
        productName: 'Custom Photo Frames',
        sizeName: frameSize.name,
        qualityName: '',
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0,
      };
    }

    const lowerQuality = rawQuality.toLowerCase();
    const qualityTier = store.qualityTiers.find(
      (q: any) =>
        q.active !== false &&
        (q.id.toLowerCase() === lowerQuality ||
          q.name.toLowerCase() === lowerQuality ||
          (lowerQuality.includes('standard') && (q.id === 'good' || q.name.toLowerCase().includes('luster'))) ||
          (lowerQuality.includes('luster') && q.id === 'good') ||
          (lowerQuality.includes('velvet') && q.id === 'better') ||
          (lowerQuality.includes('archival') && q.id === 'best') ||
          (lowerQuality.includes('fine art') && q.id === 'best'))
    );

    if (!qualityTier) {
      const available = store.qualityTiers
        .filter((q: any) => q.active !== false)
        .map((q: any) => q.name)
        .join(', ');
      return {
        valid: false,
        status: 400,
        error: `Invalid quality tier: "${rawQuality}". Available tiers: ${available}`,
        productName: 'Custom Photo Frames',
        sizeName: frameSize.name,
        qualityName: '',
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0,
      };
    }

    // Authoritative Server Calculation (Reads directly from store - matches CMS changes)
    const origSizePrice = Math.max(0, Number(frameSize.originalPrice ?? frameSize.basePrice) || 0);
    let sizeSellingPrice = origSizePrice;
    if (frameSize.discountActive) {
      if (typeof frameSize.discountedPrice === 'number' && frameSize.discountedPrice > 0 && frameSize.discountedPrice <= origSizePrice) {
        sizeSellingPrice = frameSize.discountedPrice;
      } else if (typeof frameSize.discountPercentage === 'number' && frameSize.discountPercentage > 0 && frameSize.discountPercentage <= 100) {
        sizeSellingPrice = Math.round(origSizePrice * (1 - frameSize.discountPercentage / 100));
      }
    }

    const origTierDelta = Math.max(0, Number(qualityTier.originalPriceDelta ?? qualityTier.priceAdjustment) || 0);
    let tierDelta = origTierDelta;
    if (qualityTier.discountActive && typeof qualityTier.discountedPriceDelta === 'number' && qualityTier.discountedPriceDelta >= 0) {
      tierDelta = qualityTier.discountedPriceDelta;
    }

    const unitOriginalPrice = origSizePrice + origTierDelta;
    const unitPrice = sizeSellingPrice + tierDelta;
    const unitDiscount = Math.max(0, unitOriginalPrice - unitPrice);
    const totalOriginalPrice = unitOriginalPrice * qty;
    const finalAmount = Math.max(0, unitPrice * qty);
    const totalDiscount = Math.max(0, totalOriginalPrice - finalAmount);

    return {
      valid: true,
      status: 200,
      productName: 'Custom Photo Frames',
      sizeName: frameSize.name,
      qualityName: qualityTier.name,
      quantity: qty,
      unitOriginalPrice,
      unitPrice,
      unitDiscount,
      totalOriginalPrice,
      totalDiscount,
      finalAmount,
    };
  } else {
    // Photo Stickers Validation & Calculation
    const rawSize = String(params.size || '').trim();
    if (!rawSize) {
      return {
        valid: false,
        status: 400,
        error: 'Sticker size is required',
        productName: 'Photo Stickers',
        sizeName: '',
        qualityName: 'Matte Vinyl',
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0,
      };
    }

    const lowerSize = rawSize.toLowerCase();
    const stickerSize = store.stickerSizes.find(
      (s: any) =>
        s.active !== false &&
        (s.id.toLowerCase() === lowerSize ||
          s.name.toLowerCase() === lowerSize ||
          s.name.toLowerCase().startsWith(lowerSize) ||
          lowerSize.startsWith(s.id.toLowerCase()))
    );

    if (!stickerSize) {
      const available = store.stickerSizes
        .filter((s: any) => s.active !== false)
        .map((s: any) => s.name)
        .join(', ');
      return {
        valid: false,
        status: 400,
        error: `Invalid sticker size: "${rawSize}". Available sizes: ${available}`,
        productName: 'Photo Stickers',
        sizeName: '',
        qualityName: 'Matte Vinyl',
        quantity: qty,
        unitOriginalPrice: 0,
        unitPrice: 0,
        unitDiscount: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        finalAmount: 0,
      };
    }

    const origPrice = Math.max(0, Number(stickerSize.originalPrice ?? stickerSize.price) || 0);
    let stickerSellingPrice = origPrice;
    if (stickerSize.discountActive) {
      if (typeof stickerSize.discountedPrice === 'number' && stickerSize.discountedPrice > 0 && stickerSize.discountedPrice <= origPrice) {
        stickerSellingPrice = stickerSize.discountedPrice;
      } else if (typeof stickerSize.discountPercentage === 'number' && stickerSize.discountPercentage > 0 && stickerSize.discountPercentage <= 100) {
        stickerSellingPrice = Math.round(origPrice * (1 - stickerSize.discountPercentage / 100));
      }
    }

    const unitOriginalPrice = origPrice;
    const unitPrice = stickerSellingPrice;
    const unitDiscount = Math.max(0, unitOriginalPrice - unitPrice);
    const totalOriginalPrice = unitOriginalPrice * qty;
    const finalAmount = Math.max(0, unitPrice * qty);
    const totalDiscount = Math.max(0, totalOriginalPrice - finalAmount);

    return {
      valid: true,
      status: 200,
      productName: 'Photo Stickers',
      sizeName: stickerSize.name,
      qualityName: 'Matte Vinyl',
      quantity: qty,
      unitOriginalPrice,
      unitPrice,
      unitDiscount,
      totalOriginalPrice,
      totalDiscount,
      finalAmount,
    };
  }
}

function getNextSequentialOrderNumber(): number {
  let maxExisting = 0;
  const allOrders = [
    ...(Array.isArray(store.onlineOrders) ? store.onlineOrders : []),
    ...(Array.isArray(store.offlineSales) ? store.offlineSales : []),
  ];
  for (const o of allOrders) {
    if (o && typeof o.id === 'string') {
      const match = o.id.match(/^MP-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxExisting) {
          maxExisting = num;
        }
      }
    }
  }

  const currentNext =
    typeof store.nextOrderNumber === 'number' && store.nextOrderNumber > 0
      ? store.nextOrderNumber
      : 1;

  const assignedNumber = Math.max(currentNext, maxExisting + 1);
  store.nextOrderNumber = assignedNumber + 1;
  saveStore();
  return assignedNumber;
}

function generateServerOrderId(): string {
  const num = getNextSequentialOrderNumber();
  return `MP-${num}`;
}

// Submit Online Order from Customer Site
app.post('/api/public/orders', (req: Request, res: Response) => {
  // Rate Limiting: protect order endpoint from automated flooding
  const ip = getClientIp(req);
  const now = Date.now();
  let rateRecord = orderRateLimitMap.get(ip);
  if (!rateRecord || rateRecord.resetAt < now) {
    rateRecord = { count: 0, resetAt: now + ORDER_WINDOW_MS };
  }
  if (rateRecord.count >= MAX_ORDERS_PER_WINDOW) {
    res.status(429).json({ error: 'Too many order requests. Please wait a few moments before trying again.' });
    return;
  }
  rateRecord.count++;
  orderRateLimitMap.set(ip, rateRecord);

  const {
    customerName,
    mobileNumber,
    address,
    city,
    pincode,
    product,
    size,
    quality,
    quantity,
    requirements,
    idempotencyKey,
    orderId: clientOrderId,
  } = req.body;

  // 1. Customer Input Validation & Sanitization
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    res.status(400).json({ error: 'Valid customer name is required (minimum 2 characters)' });
    return;
  }
  const cleanCustomerName = customerName.trim().slice(0, 100);

  if (!mobileNumber || (typeof mobileNumber !== 'string' && typeof mobileNumber !== 'number')) {
    res.status(400).json({ error: 'Valid mobile number is required' });
    return;
  }
  const phoneDigits = String(mobileNumber).replace(/\D/g, '');
  let cleanMobile = phoneDigits;
  if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
    cleanMobile = cleanMobile.slice(2);
  } else if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) {
    cleanMobile = cleanMobile.slice(1);
  }
  if (cleanMobile.length !== 10) {
    res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
    return;
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    res.status(400).json({ error: 'Complete delivery address is required (minimum 5 characters)' });
    return;
  }
  const cleanAddress = address.trim().slice(0, 300);

  const cleanCity = typeof city === 'string' && city.trim().length > 0 ? city.trim().slice(0, 60) : 'Kolkata';

  if (!pincode || (typeof pincode !== 'string' && typeof pincode !== 'number')) {
    res.status(400).json({ error: 'Valid 6-digit pincode is required' });
    return;
  }
  const cleanPincode = String(pincode).replace(/\D/g, '');
  if (cleanPincode.length !== 6) {
    res.status(400).json({ error: 'Pincode must be exactly 6 digits' });
    return;
  }

  const cleanRequirements = typeof requirements === 'string' ? requirements.trim().slice(0, 500) : '';

  // 2. Authoritative Server-Side Pricing (NEVER trusts client sellingPrice or unitPrice)
  const pricingResult = calculateServerOrderPrice({
    product,
    size,
    quality,
    quantity,
  });

  if (!pricingResult.valid) {
    res.status(pricingResult.status).json({ error: pricingResult.error });
    return;
  }

  // 3. Duplicate Submission / Idempotency Protection
  const activeIdempotencyKey =
    typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0
      ? idempotencyKey.trim().slice(0, 100)
      : typeof clientOrderId === 'string' && clientOrderId.trim().length > 0
      ? clientOrderId.trim().slice(0, 100)
      : null;

  if (activeIdempotencyKey) {
    const existingOrder = store.onlineOrders.find(
      (o: any) =>
        o.idempotencyKey === activeIdempotencyKey ||
        (activeIdempotencyKey.startsWith('MP-') && o.id === activeIdempotencyKey)
    );

    if (existingOrder) {
      // Idempotent duplicate: return the already created order
      res.status(200).json({
        success: true,
        duplicate: true,
        order: {
          id: existingOrder.id,
          customerName: existingOrder.customerName,
          mobileNumber: existingOrder.mobileNumber,
          address: existingOrder.address,
          city: existingOrder.city,
          pincode: existingOrder.pincode,
          product: existingOrder.product,
          size: existingOrder.size,
          quality: existingOrder.quality,
          quantity: existingOrder.quantity,
          unitPrice: existingOrder.unitPrice,
          discount: existingOrder.discount,
          finalAmount: existingOrder.finalAmount,
          requirements: existingOrder.requirements,
          orderStatus: existingOrder.orderStatus,
          paymentStatus: existingOrder.paymentStatus,
          createdDate: existingOrder.createdDate,
        },
      });
      return;
    }
  }

  // 4. Generate Authoritative Server Order ID
  const newOrderId = generateServerOrderId();
  const createdDate = new Date().toISOString().split('T')[0];

  // 5. Build Whitelisted & Sanitized Order Object
  const newOrder = {
    id: newOrderId,
    customerName: cleanCustomerName,
    mobileNumber: cleanMobile,
    address: cleanAddress,
    city: cleanCity,
    pincode: cleanPincode,
    product: pricingResult.productName,
    size: pricingResult.sizeName,
    quality: pricingResult.qualityName,
    quantity: pricingResult.quantity,
    unitPrice: pricingResult.unitPrice,
    discount: pricingResult.totalDiscount,
    finalAmount: pricingResult.finalAmount,
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
    requirements: cleanRequirements,
    photoStatus: 'Pending Upload',
    orderStatus: 'Pending',
    productCost: 0,
    printingCost: 0,
    packagingCost: 0,
    deliveryCost: 0,
    otherCost: 0,
    totalCost: 0,
    profit: pricingResult.finalAmount,
    profitMargin: 100,
    createdDate,
    expectedDeliveryDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
    stockDeducted: false,
    idempotencyKey: activeIdempotencyKey || undefined,
  };

  store.onlineOrders.unshift(newOrder);

  // Sync Internal Customer Record
  let customer = store.customers.find((c: any) => c.mobile === cleanMobile);
  if (!customer) {
    customer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanCustomerName,
      mobile: cleanMobile,
      address: newOrder.address,
      city: newOrder.city,
      pincode: newOrder.pincode,
      totalOrders: 1,
      totalSpending: pricingResult.finalAmount,
      lastOrderDate: newOrder.createdDate,
    };
    store.customers.push(customer);
  } else {
    customer.totalOrders += 1;
    customer.totalSpending += pricingResult.finalAmount;
    customer.lastOrderDate = newOrder.createdDate;
  }

  saveStore();

  // Secondary Asynchronous Sync to Google Sheets (Non-blocking)
  void appendOrderToSheet(newOrder, store.frameSizes).catch((syncErr) => {
    console.warn(`[Google Sheets] Async sync error for ${newOrder.id}:`, syncErr?.message || syncErr);
  });

  // Return Public Customer Confirmation Data
  res.status(201).json({
    success: true,
    order: {
      id: newOrder.id,
      customerName: newOrder.customerName,
      mobileNumber: newOrder.mobileNumber,
      address: newOrder.address,
      city: newOrder.city,
      pincode: newOrder.pincode,
      product: newOrder.product,
      size: newOrder.size,
      quality: newOrder.quality,
      quantity: newOrder.quantity,
      unitPrice: newOrder.unitPrice,
      discount: newOrder.discount,
      finalAmount: newOrder.finalAmount,
      requirements: newOrder.requirements,
      orderStatus: newOrder.orderStatus,
      paymentStatus: newOrder.paymentStatus,
      createdDate: newOrder.createdDate,
    },
  });
});

function buildPublicBillData(order: any): PublicBillData {
  const numericSuffix = (order.id || '').replace(/^MP-/i, '');
  const billNumber = order.billNumber || `MP-BILL-${numericSuffix || Date.now()}`;
  const billGeneratedAt = order.billGeneratedAt || new Date().toISOString();

  return {
    orderId: order.id,
    billNumber,
    billGeneratedAt,
    createdDate: order.createdDate || order.orderDate || new Date().toISOString().split('T')[0],
    orderStatus: order.orderStatus || 'Pending',
    paymentStatus: order.paymentStatus || 'Pending',
    paymentMethod: order.paymentMethod || 'UPI',
    billPdfUrl: order.billToken ? `/api/public/bills/${order.billToken}/pdf` : undefined,
    billDriveUrl: order.billDriveUrl,
    billDriveDownloadUrl: order.billDriveDownloadUrl,
    billDriveStatus: order.billDriveStatus,
    customer: {
      name: order.customerName || 'Valued Customer',
      mobileNumber: order.mobileNumber || '',
      address: order.address || '',
      city: order.city || 'Kolkata',
      pincode: order.pincode || '',
    },
    item: {
      product: order.product || 'Custom Photo Frames',
      size: order.size || '',
      finish: order.finish || (order.product?.toLowerCase().includes('sticker') ? 'N/A' : 'Standard'),
      quality: order.quality || '',
      quantity: Number(order.quantity) || 1,
      unitPrice: Number(order.unitPrice ?? order.sellingPrice ?? order.finalAmount) || 0,
      discount: Number(order.discount) || 0,
      finalAmount: Number(order.finalAmount) || 0,
      requirements: order.requirements || '',
    },
    studio: {
      name: store.websiteSettings?.studioName || 'MomentPress',
      tagline: store.websiteSettings?.tagline || 'Your Photos. Your Story. Your Frame.',
      phone: store.websiteSettings?.phone || '6291681660',
      whatsappNumber: store.websiteSettings?.whatsappNumber || '7980855821',
      email: store.websiteSettings?.email || 'connect.rrstudio@gmail.com',
      instagramHandle: store.websiteSettings?.instagramHandle || '@_rr.studio__',
      instagramUrl: store.websiteSettings?.instagramUrl || 'https://www.instagram.com/_rr.studio__/',
      address: store.websiteSettings?.address || 'Bowbazar, Central Kolkata, West Bengal 700012',
      city: store.websiteSettings?.city || 'Kolkata',
    },
  };
}

// ==========================================
// PUBLIC BILL / INVOICE VIEW (SECURE TOKEN ACCESSIBLE)
// ==========================================
app.get('/api/public/bills/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token || typeof token !== 'string' || token.trim().length < 16 || token.trim().length > 128) {
    res.status(404).json({ error: 'Bill not found' });
    return;
  }

  // Rate Limiting
  const ip = getClientIp(req);
  const now = Date.now();
  let rateRecord = billRateLimitMap.get(ip);
  if (!rateRecord || rateRecord.resetAt < now) {
    rateRecord = { count: 0, resetAt: now + BILL_WINDOW_MS };
  }
  if (rateRecord.count >= MAX_BILLS_PER_WINDOW) {
    res.status(429).json({ error: 'Too many requests. Please wait a few moments.' });
    return;
  }
  rateRecord.count++;
  billRateLimitMap.set(ip, rateRecord);

  const cleanToken = token.trim();
  let order = store.onlineOrders.find((o) => o.billToken === cleanToken);
  if (!order) {
    order = store.offlineSales.find((s) => s.billToken === cleanToken);
  }

  if (!order) {
    res.status(404).json({ error: 'Bill not found' });
    return;
  }

  // Authoritative sanitization: Never leak internal margins, costs, admin tokens, or credentials
  res.json({
    success: true,
    bill: buildPublicBillData(order),
  });
});

// Public PDF Download Route (Direct A4 Vector PDF download for customers)
app.get('/api/public/bills/:token/pdf', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token || typeof token !== 'string' || token.trim().length < 16 || token.trim().length > 128) {
    res.status(404).json({ error: 'Bill not found' });
    return;
  }

  // Rate Limiting
  const ip = getClientIp(req);
  const now = Date.now();
  let rateRecord = billRateLimitMap.get(ip);
  if (!rateRecord || rateRecord.resetAt < now) {
    rateRecord = { count: 0, resetAt: now + BILL_WINDOW_MS };
  }
  if (rateRecord.count >= MAX_BILLS_PER_WINDOW) {
    res.status(429).json({ error: 'Too many requests. Please wait a few moments.' });
    return;
  }
  rateRecord.count++;
  billRateLimitMap.set(ip, rateRecord);

  const cleanToken = token.trim();
  let order = store.onlineOrders.find((o) => o.billToken === cleanToken);
  if (!order) {
    order = store.offlineSales.find((s) => s.billToken === cleanToken);
  }

  if (!order) {
    res.status(404).json({ error: 'Bill not found' });
    return;
  }

  try {
    const billData = buildPublicBillData(order);
    const billsDir = getBillsDir();
    const filePath = order.billPdfPath && fs.existsSync(order.billPdfPath)
      ? order.billPdfPath
      : path.join(billsDir, `MomentPress-Bill-${order.id}.pdf`);

    if (!fs.existsSync(filePath)) {
      const generated = await generateAndSaveBillPdf(billData, billsDir);
      order.billPdfPath = generated.filePath;
      order.billFileName = generated.fileName;
      saveStore();
    }

    const fileName = `MomentPress-Bill-${order.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    console.error('Error streaming public bill PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ==========================================
// PROTECTED ADMIN ROUTES (REQUIRE AUTH TOKEN)
// ==========================================

// Get All Admin Data (Orders, Sales, Inventory, Purchases, Expenses, Config)
app.get('/api/admin/all-data', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    onlineOrders: store.onlineOrders,
    offlineSales: store.offlineSales,
    customers: store.customers,
    inventory: store.inventory,
    stockMovements: store.stockMovements,
    purchases: store.purchases,
    expenses: store.expenses,
    activityLog: store.activityLog,
    reviews: store.reviews,
    products: store.products,
    frameSizes: store.frameSizes,
    qualityTiers: store.qualityTiers,
    stickerSizes: store.stickerSizes,
    existingDesigns: store.existingDesigns,
    faqs: store.faqs,
    offers: store.offers,
    websiteSettings: store.websiteSettings,
    whatsappTemplates: store.whatsappTemplates,
    homepageHero: store.homepageHero,
    homepageSections: store.homepageSections,
    productMappings: store.productMappings,
  });
});

// Dedicated orders endpoints for admin
app.get('/api/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
  res.json({ success: true, orders: store.onlineOrders });
});

app.patch('/api/admin/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = store.onlineOrders.findIndex((o) => o.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  store.onlineOrders[idx] = { ...store.onlineOrders[idx], ...updates };
  saveStore();

  // Secondary Asynchronous Sync to Google Sheets (Non-blocking)
  void updateOrderInSheet(id, updates).catch((syncErr) => {
    console.warn(`[Google Sheets] Async update error for ${id}:`, syncErr?.message || syncErr);
  });

  res.json({ success: true, order: store.onlineOrders[idx] });
});

// Stream or Download Order Bill PDF (Admin)
app.get('/api/admin/orders/:id/pdf', requireAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  let order = store.onlineOrders.find((o) => o.id === id);
  if (!order) {
    order = store.offlineSales.find((s) => s.id === id);
  }

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  try {
    const billsDir = getBillsDir();
    let filePath = order.billPdfPath;

    if (!filePath || !fs.existsSync(filePath)) {
      const numericSuffix = (order.id || '').replace(/^MP-/i, '');
      order.billNumber = order.billNumber || `MP-BILL-${numericSuffix || Date.now()}`;
      order.billToken = order.billToken || crypto.randomBytes(24).toString('hex');
      order.billGeneratedAt = order.billGeneratedAt || new Date().toISOString();
      order.billGenerated = true;

      const billData = buildPublicBillData(order);
      const generated = await generateAndSaveBillPdf(billData, billsDir);
      order.billPdfPath = generated.filePath;
      order.billFileName = generated.fileName;
      saveStore();
      filePath = generated.filePath;
    }

    const isDownload = req.query.download === 'true';
    const disposition = isDownload ? 'attachment' : 'inline';
    const numericSuffix = (order.id || '').replace(/^MP-/i, '');
    const fileName = `MomentPress-Bill-MP-${numericSuffix || order.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    console.error('Error generating or streaming PDF:', err);
    res.status(500).json({ error: 'Failed to stream PDF' });
  }
});

// Generate or Regenerate Bill / Invoice for Order with PDF & Google Drive Integration
app.post('/api/admin/orders/:id/bill', requireAdminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const isRegenerate = Boolean(req.body && req.body.regenerate);

  let order = store.onlineOrders.find((o) => o.id === id);
  if (!order) {
    order = store.offlineSales.find((s) => s.id === id);
  }

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Idempotency: If bill already generated and file exists, unless regenerate is requested, return existing
  if (!isRegenerate && order.billGenerated && order.billNumber && order.billToken && order.billPdfPath && fs.existsSync(order.billPdfPath)) {
    res.json({
      success: true,
      alreadyGenerated: true,
      order,
    });
    return;
  }

  try {
    const numericSuffix = (order.id || '').replace(/^MP-/i, '');
    const billNumber = order.billNumber || `MP-BILL-${numericSuffix || Date.now()}`;
    const billToken = order.billToken || crypto.randomBytes(24).toString('hex');
    const billGeneratedAt = order.billGeneratedAt || new Date().toISOString();

    order.billNumber = billNumber;
    order.billToken = billToken;
    order.billGeneratedAt = billGeneratedAt;
    order.billGenerated = true;

    // 1. Generate local vector PDF
    const billsDir = getBillsDir();
    const billData = buildPublicBillData(order);
    const generated = await generateAndSaveBillPdf(billData, billsDir);

    order.billPdfPath = generated.filePath;
    order.billFileName = generated.fileName;

    // 2. Upload to Google Drive (with duplicate prevention & target folder)
    const driveResult = await uploadBillToGoogleDrive({
      orderId: order.id,
      pdfBuffer: generated.buffer,
      fileName: generated.fileName,
      existingFileId: order.billDriveFileId,
      existingDriveUrl: order.billDriveUrl,
      existingDownloadUrl: order.billDriveDownloadUrl,
      existingUploadedAt: order.billUploadedAt,
      forceReupload: isRegenerate,
    });

    order.billDriveStatus = driveResult.status;
    order.billDriveMessage = driveResult.message;
    if (driveResult.status === 'VERIFIED') {
      order.billDriveFileId = driveResult.fileId;
      order.billDriveUrl = driveResult.webViewLink;
      order.billDriveDownloadUrl = driveResult.webContentLink;
      order.billUploadedAt = driveResult.uploadedAt;
    }

    saveStore();

    // Secondary Asynchronous Sync to Google Sheets (Non-blocking)
    void updateOrderInSheet(order.id, {
      'Bill Number': order.billNumber,
      'Bill Drive Link': order.billDriveUrl || '',
      'Bill Generated At': order.billGeneratedAt || '',
    }).catch((syncErr) => {
      console.warn(`[Google Sheets] Async bill update error for ${order.id}:`, syncErr?.message || syncErr);
    });

    res.json({
      success: true,
      regenerated: isRegenerate,
      order,
      driveResult,
    });
  } catch (err: any) {
    console.error('Error generating bill:', err);
    res.status(500).json({ error: `Failed to generate bill: ${err?.message || err}` });
  }
});

// ==========================================
// INVENTORY & PRODUCT MAPPING AUTOMATION HELPERS
// ==========================================

function findOrderMapping(order: { product: string; size?: string; quality?: string }) {
  const prodName = String(order.product || '').toLowerCase();
  const isFrame = prodName.includes('frame');
  const isSticker = prodName.includes('sticker');

  const mappings = Array.isArray(store.productMappings) ? store.productMappings : [];

  return mappings.find((m: any) => {
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
    return false;
  });
}

function checkStockForOrder(order: { product: string; size?: string; quality?: string; quantity: number }) {
  const qty = Math.max(1, Number(order.quantity) || 1);
  const mapping = findOrderMapping(order);

  if (!mapping || !Array.isArray(mapping.consumes) || mapping.consumes.length === 0) {
    return { available: true, missingItems: [], requiredItems: [] };
  }

  const requiredItems = mapping.consumes.map((c: any) => {
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

    const inv = store.inventory.find((i: any) => i.id === itemId);
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

  const missingItems = requiredItems.filter((r: any) => !r.sufficient);
  return {
    available: missingItems.length === 0,
    missingItems,
    requiredItems,
  };
}

function executeStockDeduction(order: { id: string; product: string; size?: string; quality?: string; quantity: number; isOffline?: boolean }) {
  const stockCheck = checkStockForOrder(order);
  if (!stockCheck.available) {
    const missingDesc = stockCheck.missingItems
      .map((m: any) => `${m.itemName} (Required: ${m.requiredQty}, Available: ${m.availableQty})`)
      .join(', ');
    return { success: false, error: `Insufficient Stock: ${missingDesc}`, missingItems: stockCheck.missingItems };
  }

  const deductedItems: any[] = [];
  const now = new Date().toISOString();

  for (const req of stockCheck.requiredItems) {
    const inv = store.inventory.find((i: any) => i.id === req.itemId);
    if (inv) {
      const prev = Number(inv.currentStock || 0);
      inv.currentStock = Math.max(0, prev - req.requiredQty);
      inv.lastUpdated = now.split('T')[0];

      store.stockMovements.unshift({
        id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: now,
        itemId: inv.id,
        itemName: inv.name,
        type: order.isOffline ? 'Deduction (Offline Sale)' : 'Deduction (Online Order)',
        quantity: req.requiredQty,
        previousStock: prev,
        newStock: inv.currentStock,
        referenceId: order.id,
        notes: `Deducted for ${order.isOffline ? 'offline sale' : 'online order'} ${order.id} (${order.product} ${order.size || ''})`,
      });

      deductedItems.push({
        itemId: inv.id,
        itemName: inv.name,
        quantity: req.requiredQty,
      });
    }
  }

  return { success: true, deductedItems };
}

function executeStockRestoration(order: { id: string; isOffline?: boolean; deductedItems?: any[] }) {
  if (!order.deductedItems || !Array.isArray(order.deductedItems) || order.deductedItems.length === 0) {
    return { success: true, restoredItems: [] };
  }

  const restoredItems: any[] = [];
  const now = new Date().toISOString();

  for (const item of order.deductedItems) {
    const inv = store.inventory.find((i: any) => i.id === item.itemId);
    if (inv) {
      const prev = Number(inv.currentStock || 0);
      const qty = Number(item.quantity || 1);
      inv.currentStock = prev + qty;
      inv.lastUpdated = now.split('T')[0];

      store.stockMovements.unshift({
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

      restoredItems.push({
        itemId: inv.id,
        itemName: inv.name,
        quantity: qty,
      });
    }
  }

  return { success: true, restoredItems };
}

// Get Product Inventory Mappings
app.get('/api/admin/mappings', requireAdminAuth, (req: Request, res: Response) => {
  res.json({ success: true, mappings: store.productMappings || [] });
});

// Save or Update Product Inventory Mappings
app.post('/api/admin/mappings', requireAdminAuth, (req: Request, res: Response) => {
  const { mappings } = req.body;
  if (!Array.isArray(mappings)) {
    res.status(400).json({ error: 'Mappings must be an array' });
    return;
  }
  store.productMappings = mappings;
  saveStore();
  res.json({ success: true, mappings: store.productMappings });
});

// Update or Create Online Order (Admin)
app.post('/api/admin/orders/online', requireAdminAuth, (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData || !orderData.id) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }

  const idx = store.onlineOrders.findIndex((o) => o.id === orderData.id);
  if (idx >= 0) {
    store.onlineOrders[idx] = { ...store.onlineOrders[idx], ...orderData };
  } else {
    store.onlineOrders.unshift(orderData);
  }

  saveStore();

  // Secondary Asynchronous Sync to Google Sheets (Non-blocking)
  if (idx >= 0) {
    void updateOrderInSheet(orderData.id, orderData).catch((syncErr) => {
      console.warn(`[Google Sheets] Async update error for ${orderData.id}:`, syncErr?.message || syncErr);
    });
  } else {
    void appendOrderToSheet(orderData, store.frameSizes).catch((syncErr) => {
      console.warn(`[Google Sheets] Async sync error for ${orderData.id}:`, syncErr?.message || syncErr);
    });
  }

  res.json({ success: true, order: idx >= 0 ? store.onlineOrders[idx] : orderData });
});

// Update or Create Offline Sale (Admin)
app.post('/api/admin/orders/offline', requireAdminAuth, (req: Request, res: Response) => {
  const saleData = req.body;
  if (!saleData || !saleData.id) {
    res.status(400).json({ error: 'Sale ID is required' });
    return;
  }

  // Calculate costs & profit
  const selling = Number(saleData.sellingPrice) || Number(saleData.finalAmount) || 0;
  const prodCost = Number(saleData.productCost) || 0;
  const printCost = Number(saleData.printingCost) || 0;
  const packCost = Number(saleData.packagingCost) || 0;
  const delCost = Number(saleData.deliveryCost) || 0;
  const othCost = Number(saleData.otherCost) || 0;
  const totalCost = prodCost + printCost + packCost + delCost + othCost;
  const profit = selling - totalCost;
  const margin = selling > 0 ? parseFloat(((profit / selling) * 100).toFixed(1)) : 0;

  const idx = store.offlineSales.findIndex((s) => s.id === saleData.id);
  const existing = idx >= 0 ? store.offlineSales[idx] : null;

  const enrichedSale = {
    ...saleData,
    productCost: prodCost,
    printingCost: printCost,
    packagingCost: packCost,
    deliveryCost: delCost,
    otherCost: othCost,
    totalCost,
    profit,
    profitMargin: margin,
    stockDeducted: existing ? existing.stockDeducted : false,
    deductedItems: existing ? existing.deductedItems : undefined,
  };

  // Stock Automation for Offline Sale:
  // If moving to Cancelled and was deducted -> restore
  if (enrichedSale.orderStatus === 'Cancelled' && enrichedSale.stockDeducted) {
    executeStockRestoration(enrichedSale);
    enrichedSale.stockDeducted = false;
    enrichedSale.deductedItems = [];
  } else if (!enrichedSale.stockDeducted && enrichedSale.orderStatus !== 'Cancelled') {
    // Attempt stock deduction if active order
    const deductRes = executeStockDeduction({
      id: enrichedSale.id,
      product: enrichedSale.product,
      size: enrichedSale.size,
      quality: enrichedSale.quality,
      quantity: enrichedSale.quantity,
      isOffline: true,
    });
    if (deductRes.success) {
      enrichedSale.stockDeducted = true;
      enrichedSale.stockDeductedAt = new Date().toISOString();
      enrichedSale.deductedItems = deductRes.deductedItems;
    }
  }

  if (idx >= 0) {
    store.offlineSales[idx] = enrichedSale;
  } else {
    store.offlineSales.unshift(enrichedSale);
  }

  saveStore();
  res.json({ success: true, sale: enrichedSale });
});

// Update Order Costs (Product, Printing, Packaging, Delivery, Other)
app.post('/api/admin/orders/costs', requireAdminAuth, (req: Request, res: Response) => {
  const { orderId, isOffline, costs } = req.body;
  if (!orderId || !costs) {
    res.status(400).json({ error: 'Order ID and costs are required' });
    return;
  }

  const list = isOffline ? store.offlineSales : store.onlineOrders;
  const order = list.find((o) => o.id === orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  order.productCost = Number(costs.productCost) || 0;
  order.printingCost = Number(costs.printingCost) || 0;
  order.packagingCost = Number(costs.packagingCost) || 0;
  order.deliveryCost = Number(costs.deliveryCost) || 0;
  order.otherCost = Number(costs.otherCost) || 0;
  order.totalCost =
    order.productCost + order.printingCost + order.packagingCost + order.deliveryCost + order.otherCost;

  const selling = Number(order.finalAmount || order.sellingPrice) || 0;
  order.profit = selling - order.totalCost;
  order.profitMargin = selling > 0 ? parseFloat(((order.profit / selling) * 100).toFixed(1)) : 0;

  saveStore();
  res.json({ success: true, order });
});

// Update Order Status (With Full Multi-Item Inventory Auto-Deduction and Cancellation Restoration)
app.post(['/api/admin/orders/status', '/api/admin/orders/update-status'], requireAdminAuth, (req: Request, res: Response) => {
  const { orderId, isOffline, newStatus, autoDeductStock } = req.body;
  const list = isOffline ? store.offlineSales : store.onlineOrders;
  const order = list.find((o) => o.id === orderId);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const prevStatus = order.orderStatus;
  order.orderStatus = newStatus;

  // Auto-Restoration: if cancelling an order that already had stock deducted
  if (newStatus === 'Cancelled' && order.stockDeducted) {
    executeStockRestoration(order);
    order.stockDeducted = false;
    order.deductedItems = [];
    saveStore();

    if (!isOffline) {
      void updateOrderInSheet(order.id, {
        'Order Status': 'Cancelled',
      }).catch((syncErr) => {
        console.warn(`[Google Sheets] Async status update error for ${order.id}:`, syncErr?.message || syncErr);
      });
    }

    res.json({ success: true, order, restored: true, message: `Stock restored for cancelled order ${order.id}` });
    return;
  }

  // Auto-Deduction: if activating an order (Processing / Ready / Delivered) and not yet deducted
  if (
    !order.stockDeducted &&
    (newStatus === 'Processing' || newStatus === 'Ready' || newStatus === 'Delivered')
  ) {
    const deductRes = executeStockDeduction({
      id: order.id,
      product: order.product,
      size: order.size,
      quality: order.quality,
      quantity: order.quantity,
      isOffline,
    });

    if (!deductRes.success) {
      if (isOffline) {
        // Stock is unavailable for offline physical sale - return 400 with exact missing items
        order.orderStatus = prevStatus;
        res.status(400).json({ error: deductRes.error, missingItems: deductRes.missingItems });
        return;
      }
    } else {
      order.stockDeducted = true;
      order.stockDeductedAt = new Date().toISOString();
      order.deductedItems = deductRes.deductedItems;
    }
  }

  saveStore();

  if (!isOffline) {
    void updateOrderInSheet(order.id, {
      'Order Status': order.orderStatus,
    }).catch((syncErr) => {
      console.warn(`[Google Sheets] Async status update error for ${order.id}:`, syncErr?.message || syncErr);
    });
  }

  res.json({ success: true, order });
});

// Inventory CRUD
app.post('/api/admin/inventory', requireAdminAuth, (req: Request, res: Response) => {
  const item = req.body;
  if (!item || !item.name) {
    res.status(400).json({ error: 'Item name is required' });
    return;
  }

  const itemId = item.id || `INV-${Date.now().toString(36).toUpperCase()}`;
  const idx = store.inventory.findIndex((i) => i.id === itemId);

  const inventoryRecord = {
    id: itemId,
    name: item.name,
    category: item.category || 'Frames',
    unit: item.unit || 'pcs',
    currentStock: Math.max(0, Number(item.currentStock) || 0),
    minimumStock: Math.max(0, Number(item.minimumStock) || 5),
    purchaseCost: Math.max(0, Number(item.purchaseCost) || 0),
    supplier: item.supplier || 'Local Supplier',
    active: item.active !== false,
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  if (idx >= 0) {
    store.inventory[idx] = inventoryRecord;
  } else {
    store.inventory.push(inventoryRecord);
  }

  saveStore();
  res.json({ success: true, item: inventoryRecord });
});

// Purchases CRUD (Auto-Adds Stock to linked inventory item and updates unit purchase cost)
app.post('/api/admin/purchases', requireAdminAuth, (req: Request, res: Response) => {
  const purchase = req.body;
  if (!purchase || !purchase.item) {
    res.status(400).json({ error: 'Item name is required' });
    return;
  }

  const purchaseId = purchase.id || `PUR-${Date.now().toString(36).toUpperCase()}`;
  const qty = Math.max(1, Number(purchase.quantity) || 1);
  const unitCost = Math.max(0, Number(purchase.unitCost) || 0);
  const totalCost = unitCost * qty;

  const record = {
    id: purchaseId,
    purchaseDate: purchase.purchaseDate || new Date().toISOString().split('T')[0],
    item: purchase.item,
    inventoryItemId: purchase.inventoryItemId || undefined,
    category: purchase.category || 'Frames',
    quantity: qty,
    unitCost,
    totalCost,
    supplier: purchase.supplier || 'Local Vendor',
    paymentMethod: purchase.paymentMethod || 'UPI',
    notes: purchase.notes || '',
    stockAdded: true,
    stockAddedAt: new Date().toISOString(),
  };

  // Find linked or matching inventory item
  let invItem = purchase.inventoryItemId
    ? store.inventory.find((i: any) => i.id === purchase.inventoryItemId)
    : store.inventory.find((i: any) => i.name.toLowerCase().trim() === purchase.item.toLowerCase().trim());

  if (invItem) {
    const prevStock = Number(invItem.currentStock || 0);
    invItem.currentStock = prevStock + qty;
    invItem.purchaseCost = unitCost;
    invItem.lastUpdated = record.purchaseDate;
    record.inventoryItemId = invItem.id;

    store.stockMovements.unshift({
      id: `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      itemId: invItem.id,
      itemName: invItem.name,
      type: 'Addition (Purchase)',
      quantity: qty,
      previousStock: prevStock,
      newStock: invItem.currentStock,
      referenceId: purchaseId,
      notes: `Stock auto-added from purchase ${purchaseId}`,
    });
  }

  store.purchases.unshift(record);
  saveStore();
  res.json({ success: true, purchase: record });
});

// Expenses CRUD
app.post('/api/admin/expenses', requireAdminAuth, (req: Request, res: Response) => {
  const expense = req.body;
  if (!expense || !expense.expenseName) {
    res.status(400).json({ error: 'Expense name is required' });
    return;
  }

  const expenseId = expense.id || `EXP-${Date.now().toString(36).toUpperCase()}`;
  const record = {
    id: expenseId,
    date: expense.date || new Date().toISOString().split('T')[0],
    expenseName: expense.expenseName,
    category: expense.category || 'Operational',
    amount: Math.max(0, Number(expense.amount) || 0),
    paymentMethod: expense.paymentMethod || 'UPI',
    notes: expense.notes || '',
  };

  const idx = store.expenses.findIndex((e) => e.id === expenseId);
  if (idx >= 0) {
    store.expenses[idx] = record;
  } else {
    store.expenses.unshift(record);
  }

  saveStore();
  res.json({ success: true, expense: record });
});

// Admin-Controlled Pricing & Discounts
app.post('/api/admin/config/pricing', requireAdminAuth, (req: Request, res: Response) => {
  let { type, items, frameSizes, qualityTiers, stickerSizes, products } = req.body;

  if (!type) {
    if (Array.isArray(frameSizes)) { type = 'frameSizes'; items = frameSizes; }
    else if (Array.isArray(qualityTiers)) { type = 'qualityTiers'; items = qualityTiers; }
    else if (Array.isArray(stickerSizes)) { type = 'stickerSizes'; items = stickerSizes; }
    else if (Array.isArray(products)) { type = 'products'; items = products; }
  }

  if (type === 'frameSizes' && Array.isArray(items)) {
    store.frameSizes = items.map((item) => {
      const orig = Math.max(0, Number(item.originalPrice ?? item.basePrice) || 0);
      let discPrice = item.discountedPrice !== null && item.discountedPrice !== undefined ? Math.max(0, Number(item.discountedPrice)) : null;
      let discPercent = item.discountPercentage !== null && item.discountPercentage !== undefined ? Math.max(0, Math.min(100, Number(item.discountPercentage))) : null;

      // Calculate missing discount representation
      if (item.discountActive) {
        if (discPrice !== null && discPercent === null && orig > 0) {
          discPercent = Math.round(((orig - discPrice) / orig) * 100);
        } else if (discPercent !== null && discPrice === null && orig > 0) {
          discPrice = Math.round(orig * (1 - discPercent / 100));
        }
      }

      return {
        ...item,
        originalPrice: orig,
        discountedPrice: discPrice,
        discountPercentage: discPercent,
        discountActive: Boolean(item.discountActive),
        basePrice: discPrice !== null && item.discountActive ? discPrice : orig,
      };
    });
  } else if (type === 'qualityTiers' && Array.isArray(items)) {
    store.qualityTiers = items.map((item) => ({
      ...item,
      originalPriceDelta: Math.max(0, Number(item.originalPriceDelta ?? item.priceAdjustment) || 0),
      discountedPriceDelta: item.discountedPriceDelta !== null && item.discountedPriceDelta !== undefined ? Math.max(0, Number(item.discountedPriceDelta)) : null,
      discountActive: Boolean(item.discountActive),
      priceAdjustment: item.discountActive && item.discountedPriceDelta !== null ? Number(item.discountedPriceDelta) : Number(item.originalPriceDelta || 0),
    }));
  } else if (type === 'stickerSizes' && Array.isArray(items)) {
    store.stickerSizes = items.map((item) => {
      const orig = Math.max(0, Number(item.originalPrice ?? item.price) || 0);
      let discPrice = item.discountedPrice !== null && item.discountedPrice !== undefined ? Math.max(0, Number(item.discountedPrice)) : null;
      let discPercent = item.discountPercentage !== null && item.discountPercentage !== undefined ? Math.max(0, Math.min(100, Number(item.discountPercentage))) : null;

      if (item.discountActive) {
        if (discPrice !== null && discPercent === null && orig > 0) {
          discPercent = Math.round(((orig - discPrice) / orig) * 100);
        } else if (discPercent !== null && discPrice === null && orig > 0) {
          discPrice = Math.round(orig * (1 - discPercent / 100));
        }
      }

      return {
        ...item,
        originalPrice: orig,
        discountedPrice: discPrice,
        discountPercentage: discPercent,
        discountActive: Boolean(item.discountActive),
        price: discPrice !== null && item.discountActive ? discPrice : orig,
      };
    });
  } else if (type === 'products' && Array.isArray(items)) {
    store.products = items.map((item) => ({
      ...item,
      originalStartingPrice: Math.max(0, Number(item.originalStartingPrice ?? item.startingPrice) || 0),
      discountedStartingPrice: item.discountedStartingPrice !== null && item.discountedStartingPrice !== undefined ? Math.max(0, Number(item.discountedStartingPrice)) : null,
      discountActive: Boolean(item.discountActive),
      startingPrice: item.discountActive && item.discountedStartingPrice !== null ? Number(item.discountedStartingPrice) : Number(item.originalStartingPrice || 0),
    }));
  }

  saveStore();
  res.json({ success: true, message: 'Pricing configuration updated' });
});

// ==========================================
// REVIEW SANITIZATION & VALIDATION HELPER
// ==========================================
function sanitizeReviewInput(r: any): { valid: boolean; error?: string; review?: any } {
  if (!r || typeof r !== 'object') {
    return { valid: false, error: 'Review payload must be a valid object' };
  }
  const customerName = typeof r.customerName === 'string'
    ? r.customerName.trim()
    : typeof r.name === 'string'
    ? r.name.trim()
    : '';
  if (!customerName) {
    return { valid: false, error: 'Customer Name is required and cannot be empty' };
  }

  const reviewText = typeof r.reviewText === 'string'
    ? r.reviewText.trim()
    : typeof r.comment === 'string'
    ? r.comment.trim()
    : '';
  if (!reviewText) {
    return { valid: false, error: 'Review Text is required and cannot be empty' };
  }

  const rating = Number(r.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be an integer between 1 and 5' };
  }

  // Display order
  let displayOrder = Number(r.displayOrder);
  if (isNaN(displayOrder) || displayOrder < 1) {
    displayOrder = 1;
  }

  // Sanitize image/avatar URL (block dangerous URI schemes)
  let customerPhoto = '';
  const rawUrl = r.customerPhoto || r.imageUrl || r.image || r.avatarUrl;
  if (typeof rawUrl === 'string') {
    const trimmed = rawUrl.trim();
    const lower = trimmed.toLowerCase();
    if (
      !lower.startsWith('javascript:') &&
      !lower.startsWith('data:') &&
      !lower.startsWith('file:') &&
      !lower.startsWith('vbscript:')
    ) {
      customerPhoto = trimmed;
    }
  }

  // Optional string fields (sanitized/trimmed)
  const location = typeof r.location === 'string' ? r.location.trim().substring(0, 100) : '';
  const date = typeof r.date === 'string' ? r.date.trim().substring(0, 50) : '';
  const productPurchased = typeof r.productPurchased === 'string' ? r.productPurchased.trim().substring(0, 100) : '';

  // Boolean flags
  const visible = r.visible !== false && r.active !== false;
  const active = visible;
  const featured = Boolean(r.featured);
  const verified = r.verified !== false;

  const id = typeof r.id === 'string' && r.id.trim()
    ? r.id.trim()
    : `REV-${Date.now().toString(36).toUpperCase()}`;

  return {
    valid: true,
    review: {
      id,
      customerName,
      name: customerName,
      reviewText,
      comment: reviewText,
      rating,
      customerPhoto,
      imageUrl: customerPhoto,
      avatarUrl: customerPhoto,
      location,
      date,
      productPurchased,
      visible,
      active,
      featured,
      displayOrder,
      verified,
    },
  };
}

// Admin-Controlled Website Content (FAQs, Reviews, Offers, Designs, Settings, WhatsApp Templates)
app.post('/api/admin/config/content', requireAdminAuth, (req: Request, res: Response) => {
  let { type, data, faqs, reviews, offers, existingDesigns, homepageHero, homepageSections, websiteSettings, whatsappTemplates } = req.body;

  if (!type) {
    if (Array.isArray(faqs)) { type = 'faqs'; data = faqs; }
    else if (Array.isArray(reviews)) { type = 'reviews'; data = reviews; }
    else if (Array.isArray(offers)) { type = 'offers'; data = offers; }
    else if (Array.isArray(existingDesigns)) { type = 'existingDesigns'; data = existingDesigns; }
    else if (homepageHero && typeof homepageHero === 'object') { type = 'homepageHero'; data = homepageHero; }
    else if (Array.isArray(homepageSections)) { type = 'homepageSections'; data = homepageSections; }
    else if (websiteSettings && typeof websiteSettings === 'object') { type = 'websiteSettings'; data = websiteSettings; }
    else if (Array.isArray(whatsappTemplates)) { type = 'whatsappTemplates'; data = whatsappTemplates; }
  }

  if (type === 'faqs' && Array.isArray(data)) {
    store.faqs = data;
  } else if (type === 'reviews' && Array.isArray(data)) {
    const validatedReviews: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const v = sanitizeReviewInput(data[i]);
      if (!v.valid) {
        return res.status(400).json({ success: false, error: `Review #${i + 1} validation failed: ${v.error}` });
      }
      validatedReviews.push(v.review);
    }
    store.reviews = validatedReviews;
  } else if (type === 'offers' && Array.isArray(data)) {
    store.offers = data;
  } else if (type === 'existingDesigns' && Array.isArray(data)) {
    store.existingDesigns = data.map((d: any) => {
      let driveUrl = typeof d.driveUrl === 'string' ? d.driveUrl.trim() : '';
      const lower = driveUrl.toLowerCase();
      if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:') || lower.startsWith('vbscript:')) {
        driveUrl = '';
      }
      return { ...d, driveUrl };
    });
  } else if (type === 'homepageHero' && data && typeof data === 'object') {
    store.homepageHero = data;
  } else if (type === 'homepageSections' && Array.isArray(data)) {
    store.homepageSections = data;
  } else if (type === 'websiteSettings' && data && typeof data === 'object') {
    store.websiteSettings = { ...store.websiteSettings, ...data };
  } else if (type === 'whatsappTemplates' && Array.isArray(data)) {
    store.whatsappTemplates = data;
  }

  saveStore();
  res.json({ success: true, message: 'Content configuration updated' });
});

// ==========================================
// REVIEWS API (AUTHENTICATED ADMIN & PUBLIC)
// ==========================================

// 1. GET /api/admin/reviews (All reviews including hidden, requires admin auth)
app.get('/api/admin/reviews', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    success: true,
    reviews: (store.reviews || []).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)),
  });
});

// 2. POST /api/admin/reviews (Create review, requires admin auth)
app.post('/api/admin/reviews', requireAdminAuth, (req: Request, res: Response) => {
  const v = sanitizeReviewInput(req.body);
  if (!v.valid) {
    return res.status(400).json({ success: false, error: v.error });
  }

  if (!store.reviews) store.reviews = [];
  store.reviews.push(v.review);
  saveStore();

  res.status(201).json({ success: true, review: v.review, message: 'Review created successfully' });
});

// 3. PUT /api/admin/reviews/:id (Update review, requires admin auth)
app.put('/api/admin/reviews/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  if (!store.reviews) store.reviews = [];
  const idx = store.reviews.findIndex((r: any) => r.id === id);
  if (idx < 0) {
    return res.status(404).json({ success: false, error: `Review with ID "${id}" not found` });
  }

  const v = sanitizeReviewInput({ ...store.reviews[idx], ...req.body, id });
  if (!v.valid) {
    return res.status(400).json({ success: false, error: v.error });
  }

  store.reviews[idx] = v.review;
  saveStore();

  res.json({ success: true, review: v.review, message: 'Review updated successfully' });
});

// 4. DELETE /api/admin/reviews/:id (Delete review, requires admin auth)
app.delete('/api/admin/reviews/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  if (!store.reviews) store.reviews = [];
  const initialLength = store.reviews.length;
  store.reviews = store.reviews.filter((r: any) => r.id !== id);

  if (store.reviews.length === initialLength) {
    return res.status(404).json({ success: false, error: `Review with ID "${id}" not found` });
  }

  saveStore();
  res.json({ success: true, message: 'Review deleted successfully' });
});

// 5. GET /api/public/reviews (Public: only visible & active reviews)
app.get('/api/public/reviews', (_req: Request, res: Response) => {
  const publicReviews = (store.reviews || [])
    .filter((r: any) => r.active !== false && r.visible !== false)
    .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((r: any) => ({
      id: r.id,
      customerName: r.customerName || r.name,
      name: r.customerName || r.name,
      reviewText: r.reviewText || r.comment,
      comment: r.reviewText || r.comment,
      rating: r.rating,
      date: r.date || '',
      location: r.location || '',
      imageUrl: r.imageUrl || r.customerPhoto || '',
      customerPhoto: r.customerPhoto || r.imageUrl || '',
      featured: Boolean(r.featured),
      displayOrder: r.displayOrder || 0,
      verified: r.verified !== false,
      productPurchased: r.productPurchased || '',
    }));

  res.json({
    success: true,
    reviews: publicReviews,
  });
});

// Real Calculated Financial Analytics (No Demo Numbers)
app.get('/api/admin/analytics', requireAdminAuth, (req: Request, res: Response) => {
  const month = (req.query.month as string) || new Date().toISOString().substring(0, 7); // YYYY-MM
  const today = new Date().toISOString().split('T')[0];

  const onlineInMonth = store.onlineOrders.filter((o) => o.createdDate?.startsWith(month));
  const offlineInMonth = store.offlineSales.filter((o) => o.orderDate?.startsWith(month));
  const purchasesInMonth = store.purchases.filter((p) => p.purchaseDate?.startsWith(month));
  const expensesInMonth = store.expenses.filter((e) => e.date?.startsWith(month));

  const onlineSales = onlineInMonth
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

  const offlineSales = offlineInMonth
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);

  const totalMonthlySales = onlineSales + offlineSales;

  const totalOrderCosts =
    onlineInMonth.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0) +
    offlineInMonth.reduce((sum, o) => sum + (Number(o.totalCost) || 0), 0);

  const totalPurchases = purchasesInMonth.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
  const totalExpenses = expensesInMonth.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const grossProfit = totalMonthlySales - totalOrderCosts;
  const netProfit = totalMonthlySales - (totalOrderCosts + totalExpenses);
  const profitMargin = totalMonthlySales > 0 ? parseFloat(((netProfit / totalMonthlySales) * 100).toFixed(1)) : 0;

  // Today's metrics
  const todayOnline = store.onlineOrders.filter((o) => o.createdDate === today);
  const todayOffline = store.offlineSales.filter((o) => o.orderDate === today);
  const todaySales =
    todayOnline.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0) +
    todayOffline.reduce((sum, o) => sum + (Number(o.sellingPrice || o.finalAmount) || 0), 0);

  const lowStockCount = store.inventory.filter((i) => i.active && i.currentStock <= i.minimumStock).length;
  const pendingOrders =
    store.onlineOrders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length +
    store.offlineSales.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;

  res.json({
    month,
    todayOrdersCount: todayOnline.length + todayOffline.length,
    todaySales,
    pendingOrders,
    lowStockItemsCount: lowStockCount,
    monthlySales: totalMonthlySales,
    onlineSales,
    offlineSales,
    totalMonthlyOrders: onlineInMonth.length + offlineInMonth.length,
    deliveredOrders:
      onlineInMonth.filter((o) => o.orderStatus === 'Delivered').length +
      offlineInMonth.filter((o) => o.orderStatus === 'Delivered').length,
    cancelledOrders:
      onlineInMonth.filter((o) => o.orderStatus === 'Cancelled').length +
      offlineInMonth.filter((o) => o.orderStatus === 'Cancelled').length,
    purchases: totalPurchases,
    expenses: totalExpenses,
    totalCosts: totalOrderCosts + totalExpenses,
    grossProfit,
    netProfit,
    profitMargin,
  });
});

// Clear All Business Data (Safe fresh start)
app.post('/api/admin/clear-all', requireAdminAuth, (req: Request, res: Response) => {
  store.onlineOrders = [];
  store.offlineSales = [];
  store.customers = [];
  store.inventory = [];
  store.stockMovements = [];
  store.purchases = [];
  store.expenses = [];
  store.activityLog = [];
  saveStore();
  res.json({ success: true, message: 'All business records cleared.' });
});

// Explicit JSON 404 handler for unmatched API routes
app.all(['/api', '/api/*'], (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Global Express Error Handler: Guarantee JSON response for all API errors
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Server Error]', err);
  if (!res.headersSent) {
    const status =
      typeof err?.status === 'number' && err.status >= 400 && err.status < 600
        ? err.status
        : typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
        ? err.statusCode
        : 500;
    res.setHeader('Content-Type', 'application/json');
    res.status(status).json({
      error: err?.message || 'An internal server error occurred',
      success: false,
    });
  }
});

// ==========================================
// VITE DEV MIDDLEWARE OR PRODUCTION STATIC
// ==========================================
async function startServer() {
  if (!isProduction) {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  MomentPress Studio Ready:\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    try {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`  ➜  Network: http://${net.address}:${PORT}/ (${name})`);
          }
        }
      }
    } catch (_) {}
    console.log(`  ➜  Admin:   http://localhost:${PORT}/admin/2008\n`);
  });
}

// Only listen when executed directly, not when imported (e.g. by Vercel serverless api/index.ts)
const isDirectExecution = Boolean(
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()
);

if (isDirectExecution && !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { startServer };
export default app;

