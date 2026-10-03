export type OrderStatus = 'New' | 'Pending' | 'Processing' | 'Ready' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Cash on Delivery';
export type PhotoStatus = 'Pending Upload' | 'Photos Received' | 'Proof Prepared' | 'Proof Approved';

export interface HomepageSectionConfig {
  id: 'hero' | 'trust' | 'products' | 'how-it-works' | 'gift-occasions' | 'existing-designs' | 'reviews' | 'faq' | 'final-cta';
  name: string;
  description: string;
  visible: boolean;
  displayOrder: number;
}

export interface HomepageHeroConfig {
  heading: string;
  subheading: string;
  hookBadgeText: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  visible: boolean;
}

export interface AdminOnlineOrder {
  id: string; // e.g. MP-849201
  customerName: string;
  mobileNumber: string;
  address: string;
  city: string;
  pincode: string;
  product: string;
  size: string;
  quality: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  requirements: string;
  photoStatus: PhotoStatus;
  orderStatus: OrderStatus;
  // Costs
  productCost: number;
  printingCost: number;
  packagingCost: number;
  deliveryCost: number;
  otherCost: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  // Dates
  createdDate: string; // YYYY-MM-DD
  expectedDeliveryDate: string;
  deliveryDate?: string;
  paymentDate?: string;
  notes?: string;
  // Stock automation
  stockDeducted: boolean;
  stockDeductedAt?: string;
  deductedItems?: {
    itemId: string;
    itemName: string;
    quantity: number;
  }[];
  // Bill / Invoice Metadata
  billNumber?: string;
  billGenerated?: boolean;
  billGeneratedAt?: string;
  billToken?: string;
  billPdfPath?: string;
  billFileName?: string;
  billDriveFileId?: string;
  billDriveUrl?: string;
  billDriveDownloadUrl?: string;
  billDriveStatus?: string;
  billDriveMessage?: string;
  billUploadedAt?: string;
}

export interface AdminOfflineSale {
  id: string; // e.g. MP-OFF-1001
  // Customer
  customerName: string;
  mobileNumber: string;
  alternateMobile?: string;
  address: string;
  city: string;
  pincode: string;
  // Order
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  paymentDate?: string;
  product: string;
  size: string;
  quality: string;
  quantity: number;
  requirements?: string;
  notes?: string;
  // Payment
  sellingPrice: number;
  discount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  // Costs
  productCost: number;
  printingCost: number;
  packagingCost: number;
  deliveryCost: number;
  otherCost: number;
  totalCost: number;
  // Profit
  profit: number;
  profitMargin: number;
  // Status
  orderStatus: OrderStatus;
  // Stock automation
  stockDeducted: boolean;
  stockDeductedAt?: string;
  deductedItems?: {
    itemId: string;
    itemName: string;
    quantity: number;
  }[];
  // Bill / Invoice Metadata
  billNumber?: string;
  billGenerated?: boolean;
  billGeneratedAt?: string;
  billToken?: string;
  billPdfPath?: string;
  billFileName?: string;
  billDriveFileId?: string;
  billDriveUrl?: string;
  billDriveDownloadUrl?: string;
  billDriveStatus?: string;
  billDriveMessage?: string;
  billUploadedAt?: string;
}

export interface PublicBillData {
  orderId: string;
  billNumber: string;
  billGeneratedAt: string;
  createdDate: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  billPdfUrl?: string;
  billDriveUrl?: string;
  billDriveDownloadUrl?: string;
  billDriveStatus?: string;
  customer: {
    name: string;
    mobileNumber: string;
    address: string;
    city: string;
    pincode: string;
  };
  item: {
    product: string;
    size: string;
    finish?: string;
    quality: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    finalAmount: number;
    requirements?: string;
  };
  studio: {
    name: string;
    tagline: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    instagramHandle: string;
    instagramUrl: string;
    address: string;
    city: string;
  };
}

export interface CustomerRecord {
  id: string; // e.g. CUST-1001
  name: string;
  mobile: string;
  alternateMobile?: string;
  address: string;
  city: string;
  pincode: string;
  totalOrders: number;
  totalSpending: number;
  lastOrderDate: string;
  notes?: string;
}

export interface InventoryItem {
  id: string; // e.g. INV-FRM-01
  name: string;
  category: 'Frames' | 'Photo Paper' | 'Sticker Paper' | 'Packaging' | 'Printing Material' | 'Marketing' | 'General';
  unit: string; // 'pcs', 'sheets', 'rolls', 'boxes'
  currentStock: number;
  minimumStock: number; // configurable low-stock threshold
  purchaseCost: number; // Unit cost
  supplier: string;
  active: boolean;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  type:
    | 'Deduction (Order)'
    | 'Deduction (Online Order)'
    | 'Deduction (Offline Sale)'
    | 'Addition (Purchase)'
    | 'Restoration (Cancelled Order)'
    | 'Manual Adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId: string; // Order ID or Purchase ID
  notes?: string;
}

export interface ProductInventoryMapping {
  id: string; // e.g. MAP-FRM-5X7
  productType: 'custom-photo-frames' | 'photo-stickers' | string;
  productName: string;
  sizeName?: string;
  qualityName?: string;
  consumes: {
    inventoryItemId: string;
    quantityPerUnit: number;
  }[];
}

export interface PurchaseRecord {
  id: string; // e.g. PUR-2026-001
  purchaseDate: string;
  item: string;
  inventoryItemId?: string; // Linked inventory item
  category: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  stockAdded: boolean;
  stockAddedAt?: string;
}

export interface ExpenseRecord {
  id: string; // e.g. EXP-2026-001
  date: string;
  expenseName: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: 'Order' | 'Offline Sale' | 'Inventory' | 'Purchase' | 'Expense' | 'Product' | 'Content';
  entityId: string;
  description: string;
}

export interface ProductConfigItem {
  id: string;
  name: string;
  type: string;
  shortDescription?: string;
  description: string;
  fullDescription?: string;
  startingPrice: number;
  actualPrice?: number;
  originalStartingPrice?: number;
  discountedStartingPrice?: number | null;
  discount?: number;
  discountPercentage?: number | null;
  discountActive?: boolean;
  image?: string;
  imageUrl?: string;
  benefits?: string[];
  features?: string[];
  specifications?: string;
  specificationsNote?: string;
  active: boolean;
  visible?: boolean;
  featured?: boolean;
  popular?: boolean;
  displayOrder: number;
}

export interface FrameSizeConfigItem {
  id: string;
  name: string;
  dimensions: string;
  basePrice: number;
  price?: number;
  originalPrice?: number;
  discount?: number;
  discountedPrice?: number | null;
  discountPercentage?: number | null;
  discountActive?: boolean;
  sellingPrice?: number;
  aspectRatio?: string;
  recommendedFor?: string;
  popular?: boolean;
  badge?: string;
  active: boolean;
  visible?: boolean;
  isAvailable?: boolean;
  displayOrder: number;
  inventoryItemId?: string;
}

export interface QualityTierConfigItem {
  id: string;
  name: string;
  shortDescription?: string;
  description: string;
  fullDescription?: string;
  priceAdjustment: number;
  additionalPrice?: number;
  originalPriceDelta?: number;
  discountedPriceDelta?: number | null;
  discountActive?: boolean;
  paperType?: string;
  finish?: string;
  longevity?: string;
  popular?: boolean;
  badge?: string;
  active: boolean;
  visible?: boolean;
  isAvailable?: boolean;
  displayOrder: number;
}

export interface StickerSizeConfigItem {
  id: string;
  name: string;
  dimensions?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountedPrice?: number | null;
  discountPercentage?: number | null;
  discountActive?: boolean;
  sellingPrice?: number;
  description: string;
  active: boolean;
  visible?: boolean;
  isAvailable?: boolean;
  displayOrder: number;
}

export interface AdminSessionInfo {
  authenticated: boolean;
  username?: string;
  expiresAt?: number;
}

export interface ExistingDesignItem {
  id: string;
  title?: string;
  name: string;
  shortDescription?: string;
  description: string;
  googleDriveLink?: string;
  driveUrl?: string;
  category: string;
  size: string;
  finish: string;
  image: string;
  active: boolean;
  visible?: boolean;
  featured?: boolean;
  displayOrder: number;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  name?: string;
  reviewText: string;
  comment?: string;
  image?: string;
  imageUrl?: string;
  customerPhoto?: string;
  avatarUrl?: string;
  location?: string;
  rating: number;
  date: string;
  verified: boolean;
  active: boolean;
  visible?: boolean;
  featured?: boolean;
  displayOrder: number;
  productPurchased?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  visible?: boolean;
  displayOrder: number;
}

export interface OfferItem {
  id: string;
  title?: string;
  name: string;
  description?: string;
  discount?: string | number;
  discountPercentage?: number;
  flatDiscount?: number;
  discountText?: string;
  couponCode: string;
  minOrderValue?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  visible?: boolean;
  ctaText?: string;
  displayOrder?: number;
}

export interface WhatsAppTemplateItem {
  id: string;
  title: string;
  category: 'Order Request' | 'Order Confirmation' | 'Photo Request' | 'Design Preview' | 'Delivery Update';
  templateText: string;
  variables: string[];
}

export interface WebsiteSettingsData {
  studioName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  currency: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  address: string;
  city: string;
  deliveryPromiseHours: number;
  startingFramePrice: number;
  startingStickerPrice: number;
  googleSearchConsoleVerification?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  robotsDirective?: string;
}
