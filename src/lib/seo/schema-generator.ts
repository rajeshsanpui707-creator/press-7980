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
          postalCode: '700156',
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
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${PRODUCTION_DOMAIN}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
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
          postalCode: '700156',
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
        areaServed: {
          '@type': 'City',
          name: 'Kolkata',
        },
        serviceType: 'Custom photo framing and personalized photo printing',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${PRODUCTION_DOMAIN}/contact`,
          servicePhone: phone,
          availableLanguage: ['English', 'Bengali', 'Hindi'],
        },
      },
    ],
  };
}

/**
 * Builds Schema.org Service JSON-LD for custom framing services
 */
export function generateServiceSchema(): object {
  const brandName = SITE_CONFIG.brandName;
  const phone = SITE_CONFIG.contact.phone;
  const address = SITE_CONFIG.contact.address;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${PRODUCTION_DOMAIN}/#custom-framing-service`,
    name: 'Custom Photo Framing Service',
    description: 'Handcrafted custom photo frames made from your photos with solid wood mouldings, archival photo paper, and protective glass. Free digital proof via WhatsApp before printing.',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${PRODUCTION_DOMAIN}/#localbusiness`,
      name: `${brandName} Studio`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Kolkata',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
      servicePhone: phone,
      availableLanguage: ['English', 'Bengali', 'Hindi'],
    },
    offers: [
      {
        '@type': 'Offer',
        name: '5×7 in Custom Frame',
        price: '199',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
      },
      {
        '@type': 'Offer',
        name: '6×8 in Custom Frame',
        price: '249',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
      },
      {
        '@type': 'Offer',
        name: '8×10 in Custom Frame',
        price: '349',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
      },
      {
        '@type': 'Offer',
        name: '10×12 in Custom Frame',
        price: '449',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
      },
      {
        '@type': 'Offer',
        name: '12×18 in Custom Frame',
        price: '599',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
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
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: lowPrice.toString(),
      highPrice: isFrame ? '599' : '199',
      availability: 'https://schema.org/InStock',
      url: `${PRODUCTION_DOMAIN}/${productId}`,
      seller: {
        '@type': 'Organization',
        name: brandName,
      },
    },
  };
}

/**
 * Builds Schema.org Product JSON-LD for individual frame sizes
 */
export function generateFrameSizeProductSchemas(): object[] {
  const brandName = SITE_CONFIG.brandName;
  const sizes = [
    { id: '5x7', name: '5×7 in', dimensions: '13 × 18 cm', price: 199 },
    { id: '6x8', name: '6×8 in', dimensions: '15 × 20 cm', price: 249 },
    { id: '8x10', name: '8×10 in', dimensions: '20 × 25 cm', price: 349 },
    { id: '10x12', name: '10×12 in', dimensions: '25 × 30 cm', price: 449 },
    { id: '12x18', name: '12×18 in', dimensions: '30 × 45 cm', price: 599 },
  ];

  return sizes.map((size) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${PRODUCTION_DOMAIN}/custom-photo-frames#${size.id}`,
    name: `${brandName} Custom Photo Frame — ${size.name}`,
    description: `Handcrafted ${size.name} solid wood frame with crystal protective glass and your choice of archival photo paper. Made in New Town, Kolkata.`,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    category: 'Home & Living > Wall Decor > Picture Frames',
    offers: {
      '@type': 'Offer',
      price: size.price.toString(),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${PRODUCTION_DOMAIN}/custom-photo-frames`,
      seller: {
        '@type': 'Organization',
        name: brandName,
      },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Dimensions', value: size.dimensions },
      { '@type': 'PropertyValue', name: 'Frame Size', value: size.name },
      { '@type': 'PropertyValue', name: 'Wood Finishes', value: 'Natural Oak, Classic Black, Warm Walnut, Gallery White' },
      { '@type': 'PropertyValue', name: 'Paper Tiers', value: 'Standard Luster, Studio Velvet, Archival Fine Art' },
    ],
  }));
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

/**
 * Builds Schema.org ItemList for frame sizes
 */
export function generateFrameSizeItemList(): object {
  const sizes = [
    { name: '5×7 in', url: `${PRODUCTION_DOMAIN}/custom-photo-frames#5x7` },
    { name: '6×8 in', url: `${PRODUCTION_DOMAIN}/custom-photo-frames#6x8` },
    { name: '8×10 in', url: `${PRODUCTION_DOMAIN}/custom-photo-frames#8x10` },
    { name: '10×12 in', url: `${PRODUCTION_DOMAIN}/custom-photo-frames#10x12` },
    { name: '12×18 in', url: `${PRODUCTION_DOMAIN}/custom-photo-frames#12x18` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Custom Photo Frame Sizes',
    description: 'Available display sizes for MomentPress custom photo frames',
    numberOfItems: sizes.length,
    itemListElement: sizes.map((size, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: size.name,
      url: size.url,
    })),
  };
}

/**
 * Builds Schema.org ItemList for paper quality tiers
 */
export function generateQualityTierItemList(): object {
  const tiers = [
    { name: 'Standard Luster', description: '240 GSM resin-coated photo paper with subtle pearl luster finish, 25+ years display life' },
    { name: 'Studio Velvet', description: '280 GSM premium satin photographic paper with silky matte finish, 50+ years display life' },
    { name: 'Archival Fine Art', description: '310 GSM 100% cotton rag museum-grade paper with museum velvet matte finish, 100+ years archival quality' },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Photo Paper Quality Tiers',
    description: 'Available archival paper tiers for MomentPress custom frames',
    numberOfItems: tiers.length,
    itemListElement: tiers.map((tier, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tier.name,
      description: tier.description,
    })),
  };
}
