import { PRODUCTION_DOMAIN, SEO_PRESETS, PageSeoConfig } from './seo-constants';
import {
  generateOrganizationSchema,
  generateProductSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateFrameSizeProductSchemas,
  generateFrameSizeItemList,
  generateQualityTierItemList,
} from './schema-generator';
import { AdminService } from '../admin/admin-service';
import { SITE_CONFIG } from '../config/site-config';

/**
 * Updates DOM <head> tags for SEO:
 * - document.title
 * - meta name="description"
 * - meta name="robots"
 * - link rel="canonical"
 * - Open Graph (og:title, og:description, og:url, og:type, og:site_name)
 * - Twitter (twitter:card, twitter:title, twitter:description)
 * - Structured Data (JSON-LD)
 */
export function updatePageSeo(pageKey: string, dynamicOverrides?: Partial<PageSeoConfig>): void {
  if (typeof document === 'undefined') return;

  const baseConfig: PageSeoConfig = SEO_PRESETS[pageKey] || SEO_PRESETS.home;
  const config: PageSeoConfig = {
    ...baseConfig,
    ...dynamicOverrides,
  };

  // Sync brand name and CMS SEO from settings dynamically if available
  let brandName = SITE_CONFIG.brandName;
  try {
    const s = AdminService.getSettings();
    if (s?.studioName) brandName = s.studioName;
    if (pageKey === 'home') {
      if (s?.seoTitle?.trim()) config.title = s.seoTitle.trim();
      if (s?.seoDescription?.trim()) config.description = s.seoDescription.trim();
      if (s?.robotsDirective?.trim()) config.robots = s.robotsDirective.trim();
    }
  } catch {}

  // 1. Title
  document.title = config.title;

  // 2. Meta description
  setMetaTag('name', 'description', config.description);

  // 3. Robots
  setMetaTag('name', 'robots', config.robots);

  // 4. Canonical URL
  const canonicalUrl = `${PRODUCTION_DOMAIN}${config.canonicalPath}`;
  setCanonicalLink(canonicalUrl);

  // 5. Open Graph tags
  setMetaTag('property', 'og:title', config.title);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:type', config.ogType || 'website');
  setMetaTag('property', 'og:site_name', brandName);

  // 6. Twitter / X Card tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', config.title);
  setMetaTag('name', 'twitter:description', config.description);

  // 7. Google Search Console Verification (if configured via CMS or env)
  let gscToken: string | undefined = undefined;
  try {
    const s = AdminService.getSettings();
    if (s?.googleSearchConsoleVerification?.trim()) {
      gscToken = s.googleSearchConsoleVerification.trim();
    }
  } catch {}
  if (!gscToken && typeof import.meta !== 'undefined' && import.meta.env?.VITE_GSC_VERIFICATION_TOKEN) {
    gscToken = import.meta.env.VITE_GSC_VERIFICATION_TOKEN;
  }
  if (gscToken) {
    setMetaTag('name', 'google-site-verification', gscToken);
  }

  // 8. Structured Data (JSON-LD)
  updateJsonLdScripts(pageKey, config);
}

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalLink(href: string): void {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function updateJsonLdScripts(pageKey: string, config: PageSeoConfig): void {
  // Remove existing JSON-LD scripts managed by MomentPress SEO
  const existing = document.head.querySelectorAll('script[data-mp-seo="true"]');
  existing.forEach((node) => node.remove());

  // 1. Organization & LocalBusiness Schema on all public indexable pages
  if (!config.robots.includes('noindex')) {
    const orgSchema = generateOrganizationSchema();
    injectJsonLd(orgSchema);
  }

  // 2. Service Schema on all public indexable pages (describes the custom framing service)
  if (!config.robots.includes('noindex')) {
    const serviceSchema = generateServiceSchema();
    injectJsonLd(serviceSchema);
  }

  // 3. Product Schema on Homepage or Product Pages
  if (pageKey === 'home' || pageKey === 'custom-photo-frames') {
    const frameProductSchema = generateProductSchema('custom-photo-frames');
    injectJsonLd(frameProductSchema);
  }

  if (pageKey === 'home' || pageKey === 'photo-stickers') {
    const stickerProductSchema = generateProductSchema('photo-stickers');
    injectJsonLd(stickerProductSchema);
  }

  // 4. Individual Frame Size Product Schemas on custom-photo-frames page
  if (pageKey === 'custom-photo-frames') {
    const frameSizeSchemas = generateFrameSizeProductSchemas();
    frameSizeSchemas.forEach((schema) => injectJsonLd(schema));
    // Also inject ItemList for frame sizes
    const frameSizeItemList = generateFrameSizeItemList();
    injectJsonLd(frameSizeItemList);
    // And ItemList for quality tiers
    const qualityTierItemList = generateQualityTierItemList();
    injectJsonLd(qualityTierItemList);
  }

  // 5. FAQ Schema if relevant
  if (pageKey === 'home' || pageKey === 'faq') {
    const faqSchema = generateFaqSchema();
    if (faqSchema) {
      injectJsonLd(faqSchema);
    }
  }

  // 6. Breadcrumbs Schema if provided
  if (config.breadcrumbs && config.breadcrumbs.length > 1) {
    const breadcrumbSchema = generateBreadcrumbSchema(config.breadcrumbs);
    injectJsonLd(breadcrumbSchema);
  }
}

function injectJsonLd(schemaObj: object): void {
  try {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-mp-seo', 'true');
    script.textContent = JSON.stringify(schemaObj);
    document.head.appendChild(script);
  } catch (err) {
    console.error('Error injecting JSON-LD:', err);
  }
}
