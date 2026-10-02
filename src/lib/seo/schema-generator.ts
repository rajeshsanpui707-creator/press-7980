import { PRODUCTION_DOMAIN } from './seo-constants';
import { AdminService } from '../admin/admin-service';
import { SITE_CONFIG } from '../config/site-config';

/**
 * Builds Schema.org Organization + WebSite JSON-LD
 */
export function generateOrganizationSchema(): object {
  const settings = AdminService.getSettings();
  const brandName = settings?.studioName || SITE_CONFIG.brandName || 'MomentPress';
  const tagline = settings?.tagline || SITE_CONFIG.tagline;
  const phone = settings?.phone || SITE_CONFIG.contact.phone;
  const email = settings?.email || SITE_CONFIG.contact.email;
  const address = settings?.address || SITE_CONFIG.contact.address;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${PRODUCTION_DOMAIN}/#organization`,
        name: brandName,
        url: PRODUCTION_DOMAIN,
        logo: `${PRODUCTION_DOMAIN}/favicon.ico`,
        description: tagline,
        email: email,
        telephone: phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Kolkata',
          addressRegion: 'West Bengal',
          postalCode: '700012',
          addressCountry: 'IN',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: phone,
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Bengali', 'Hindi'],
          },
        ],
        sameAs: [
          SITE_CONFIG.contact.instagramUrl,
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${PRODUCTION_DOMAIN}/#website`,
        url: PRODUCTION_DOMAIN,
        name: brandName,
        description: tagline,
        publisher: {
          '@id': `${PRODUCTION_DOMAIN}/#organization`,
        },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${PRODUCTION_DOMAIN}/#localbusiness`,
        name: `${brandName} Studio`,
        image: `${PRODUCTION_DOMAIN}/favicon.ico`,
        telephone: phone,
        priceRange: '₹99 - ₹1,499',
        address: {
          '@type': 'PostalAddress',
          streetAddress: address,
          addressLocality: 'Kolkata',
          addressRegion: 'West Bengal',
          postalCode: '700012',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 22.5697,
          longitude: 88.3615,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '20:00',
          },
        ],
      },
    ],
  };
}

/**
 * Builds Schema.org Product JSON-LD for Custom Photo Frames using real CMS pricing
 */
export function generateProductSchema(productId: 'custom-photo-frames' | 'photo-stickers'): object {
  const brandName = SITE_CONFIG.brandName;
  const isFrame = productId === 'custom-photo-frames';

  let name = isFrame ? 'Custom Photo Frames' : 'Photo Stickers';
  let description = isFrame
    ? 'Handcrafted solid wood frames with crystal protective glass and archival photo paper.'
    : 'Waterproof satin vinyl photo stickers with clean-peel adhesive in multiple sizes.';
  let lowPrice = isFrame ? 199 : 99;

  try {
    const products = AdminService.getProductsConfig();
    const found = products.find((p) => p.id === productId);
    if (found) {
      name = found.name;
      description = found.description || found.shortDescription || description;
      lowPrice = found.startingPrice || lowPrice;
    }
  } catch {
    // fallback to sensible defaults
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brandName} ${name}`,
    description: description,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    category: isFrame ? 'Home & Living > Wall Decor > Picture Frames' : 'Stationery & Crafts > Stickers',
    offers: {
      '@type': 'Offer',
      price: lowPrice.toString(),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${PRODUCTION_DOMAIN}/${productId}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: brandName,
      },
    },
  };
}

/**
 * Builds Schema.org FAQPage JSON-LD using live published FAQs from AdminService
 */
export function generateFaqSchema(): object | null {
  try {
    const rawFaqs = AdminService.getFaqs();
    const activeFaqs = (rawFaqs || []).filter((f) => f.visible !== false && f.active !== false);

    if (activeFaqs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: activeFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Builds Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; path: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${PRODUCTION_DOMAIN}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
