import { AdminService } from '../admin/admin-service';

export const STATIC_DEFAULT_CONFIG = {
  brandName: 'MomentPress',
  tagline: 'Your Photos. Your Story. Your Frame.',
  whatsapp: {
    number: '7980855821',
    displayNumber: '7980855821',
  },
  contact: {
    phone: '6291681660',
    displayPhone: '6291681660',
    email: 'connect.rrstudio@gmail.com',
    instagramHandle: '@_rr.studio__',
    instagramUrl: 'https://www.instagram.com/_rr.studio__/',
    address: 'Bowbazar, Central Kolkata, West Bengal 700012',
    deliveryPromiseHours: 48,
  },
  navLinks: [
    { label: 'Home', href: '#home' },
    { label: 'Products', href: '#products' },
    { label: 'Gift Ideas', href: '#gift-occasions' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'FAQ', href: '#faq' },
  ],
};

export const SITE_CONFIG = {
  get brandName() {
    try {
      return AdminService.getSettings()?.studioName || STATIC_DEFAULT_CONFIG.brandName;
    } catch {
      return STATIC_DEFAULT_CONFIG.brandName;
    }
  },
  get tagline() {
    try {
      return AdminService.getSettings()?.tagline || STATIC_DEFAULT_CONFIG.tagline;
    } catch {
      return STATIC_DEFAULT_CONFIG.tagline;
    }
  },
  get whatsapp() {
    try {
      const num = AdminService.getSettings()?.whatsappNumber || STATIC_DEFAULT_CONFIG.whatsapp.number;
      return {
        number: num,
        displayNumber: num,
      };
    } catch {
      return STATIC_DEFAULT_CONFIG.whatsapp;
    }
  },
  get contact() {
    try {
      const s = AdminService.getSettings();
      return {
        phone: s?.phone || STATIC_DEFAULT_CONFIG.contact.phone,
        displayPhone: s?.phone || STATIC_DEFAULT_CONFIG.contact.displayPhone,
        email: s?.email || STATIC_DEFAULT_CONFIG.contact.email,
        instagramHandle: s?.instagramHandle || STATIC_DEFAULT_CONFIG.contact.instagramHandle,
        instagramUrl: s?.instagramUrl || STATIC_DEFAULT_CONFIG.contact.instagramUrl,
        address: s?.address || STATIC_DEFAULT_CONFIG.contact.address,
        deliveryPromiseHours: s?.deliveryPromiseHours || STATIC_DEFAULT_CONFIG.contact.deliveryPromiseHours,
      };
    } catch {
      return STATIC_DEFAULT_CONFIG.contact;
    }
  },
  navLinks: STATIC_DEFAULT_CONFIG.navLinks,
};

