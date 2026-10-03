import { FaqItem } from '../types';
import { AdminService } from '../lib/admin/admin-service';

export const FAQ_SECTION_DATA = {
  heading: 'Frequently Asked Questions',
  supportingText: 'Everything you need to know about custom framing, materials, and delivery.',
};

export const STATIC_FAQ_ITEMS: FaqItem[] = [
  // Core AEO Questions - Answer-first format for AI search engines
  {
    id: 'faq-what-is-custom-photo-frame',
    question: 'What is a custom photo frame?',
    answer: 'A custom photo frame is a personalized frame created around your own photo, with the frame size, wood finish, paper type, and design customized to your specific requirements. MomentPress handcrafts each frame in our Bowbazar, Kolkata studio using solid wood mouldings, archival photo paper, and protective glass.',
  },
  {
    id: 'faq-what-is-personalized-photo-frame',
    question: 'What is a personalized photo frame?',
    answer: 'A personalized photo frame is a frame made with your own photo, where you choose the size (5×7 to 12×18 inches), wood finish (Natural Oak, Classic Black, Warm Walnut, Gallery White), paper quality (Standard Luster, Studio Velvet, Archival Fine Art), and any special design requirements. We print your photo and assemble the complete frame before delivery.',
  },
  {
    id: 'faq-how-to-order-custom-photo-frame',
    question: 'How do I order a custom photo frame online?',
    answer: 'To order a custom photo frame: 1) Select your frame size and wood finish on our website, 2) Choose your paper quality tier, 3) Enter delivery details and any special instructions, 4) Place the order to get your Order ID, 5) Send your full-resolution photo via WhatsApp using the Order ID, 6) Approve the free digital proof we send, 7) We print and deliver within 48 hours of approval.',
  },
  {
    id: 'faq-how-to-make-personalized-photo-frame',
    question: 'How to make a personalized photo frame with my own photo?',
    answer: 'Upload your photo to our WhatsApp chat after placing an order. Our design team creates a digital proof showing exact cropping, borders, and paper texture. You review and approve before we print. This ensures the final framed product matches your vision exactly.',
  },
  {
    id: 'faq-custom-photo-frame-sizes',
    question: 'What sizes are available for custom photo frames?',
    answer: 'MomentPress offers 5 standard frame sizes: 5×7 in (13×18 cm) from ₹199, 6×8 in (15×20 cm) from ₹249, 8×10 in (20×25 cm) from ₹349, 10×12 in (25×30 cm) from ₹449, and 12×18 in (30×45 cm) from ₹599. Each size supports all 4 wood finishes and 3 paper quality tiers.',
  },
  {
    id: 'faq-photo-frame-wood-finishes',
    question: 'What wood finishes can I choose for my photo frame?',
    answer: 'We offer 4 solid wood moulding finishes: Natural Oak (warm, organic grain), Classic Black (matte architectural profile), Warm Walnut (rich dark amber tones), and Gallery White (crisp contemporary white). Each finish is handcrafted and hand-waxed in our Kolkata studio.',
  },
  {
    id: 'faq-photo-frame-paper-quality',
    question: 'What paper types are available for photo printing?',
    answer: 'Three archival paper tiers: Standard Luster (240 GSM resin-coated, pearl finish, 25+ year display life), Studio Velvet (280 GSM premium satin, silky matte, 50+ year display life, most popular), and Archival Fine Art (310 GSM 100% cotton rag, museum velvet matte, 100+ year archival quality).',
  },
  {
    id: 'faq-photo-frame-turnaround-time',
    question: 'What is the turnaround time for custom photo frames in Kolkata?',
    answer: 'Orders are handcrafted in our Bowbazar studio and delivered within 24 to 48 hours after you approve the free digital proof. We use reinforced tamper-proof packaging for safe delivery across Kolkata.',
  },
  {
    id: 'faq-photo-frame-delivery',
    question: 'Do you deliver custom photo frames outside Kolkata?',
    answer: 'Currently we deliver within Kolkata and surrounding areas (Howrah, Salt Lake, New Town, Dum Dum, Barrackpore). For locations outside our delivery zone, please contact us on WhatsApp to discuss shipping options.',
  },
  {
    id: 'faq-photo-resolution-requirements',
    question: 'What photo resolution do I need for a custom photo frame?',
    answer: 'For best results, use photos with at least 300 DPI at the final print size. Minimum recommended: 1500×2100 pixels for 5×7, 1800×2400 for 6×8, 2400×3000 for 8×10, 3000×3600 for 10×12, and 3600×5400 for 12×18. Our team reviews every image and will advise if quality is insufficient.',
  },
  {
    id: 'faq-free-digital-proof',
    question: 'Do you provide a preview before printing my photo frame?',
    answer: 'Yes, absolutely. We generate a 100% free digital mock-up preview via WhatsApp showing the exact cropping, borders, and paper texture. Printing begins only after you review and explicitly approve the preview by replying "APPROVED".',
  },
  {
    id: 'faq-photo-frame-gift',
    question: 'Can I order a custom photo frame as a gift?',
    answer: 'Yes, custom photo frames make excellent gifts for birthdays, anniversaries, weddings, housewarmings, and festivals. You can place the order with the recipient\'s delivery address and we\'ll coordinate with them directly on WhatsApp for photo submission and proof approval.',
  },
  {
    id: 'faq-couple-photo-frame-gift',
    question: 'What is a good photo frame gift for a couple?',
    answer: 'For couples, popular choices include 6×8 or 8×10 frames in Warm Walnut or Natural Oak finish with Studio Velvet paper. Anniversary dates, wedding photos, or travel memories work beautifully. Add a personal note in the requirements field and we\'ll include it with the delivery.',
  },
  {
    id: 'faq-birthday-photo-frame-gift',
    question: 'What photo frame makes a good birthday gift?',
    answer: 'Birthday photo frames work well in 5×7 or 6×8 sizes with Gallery White or Natural Oak finish. Childhood photos, milestone moments, or group pictures with friends are popular choices. We deliver in gift-ready packaging with a handwritten note option.',
  },
  {
    id: 'faq-anniversary-photo-frame-gift',
    question: 'What is a good anniversary photo frame gift?',
    answer: 'Anniversary frames are often 8×10 or 10×12 in Classic Black or Warm Walnut with Archival Fine Art paper for heirloom quality. Wedding photos, timeline collages, or "then and now" comparisons are meaningful. We can accommodate multi-photo layouts in larger sizes.',
  },
  {
    id: 'faq-photo-stickers-waterproof',
    question: 'Are the photo stickers waterproof and residue-free?',
    answer: 'Yes! Our custom photo stickers are printed on durable satin vinyl with a protective matte lamination that makes them resistant to water, spills, and UV sunlight. When removed, they leave zero sticky residue on laptops, phone cases, or tumblers.',
  },
  {
    id: 'faq-photo-sticker-sizes',
    question: 'What sizes do photo stickers come in?',
    answer: 'Photo stickers come in 3 sizes: Small (2×2 in / 5×5 cm) from ₹99, Medium (3×3 in / 7.6×7.6 cm) from ₹149, and Large (4×4 in / 10×10 cm) from ₹199. All are die-cut to your photo shape with clean-peel adhesive.',
  },
  {
    id: 'faq-photo-frame-payment',
    question: 'What payment methods do you accept for photo frames?',
    answer: 'We accept UPI payments (Google Pay, PhonePe, Paytm), cash on delivery, and bank transfers. Payment is collected after you approve the digital proof and before printing begins.',
  },
  {
    id: 'faq-damaged-package',
    question: 'What if my photo frame arrives damaged?',
    answer: 'Contact MomentPress as soon as possible with the order details and photos of the damaged package/product. We review each case and resolve according to our policy, which typically includes a replacement or refund depending on the situation.',
  },
  {
    id: 'faq-photo-frame-existing-designs',
    question: 'Can I see examples of previous custom photo frames?',
    answer: 'Yes, visit our Existing Designs gallery to browse handcrafted customer keepsakes across categories like Portraits & Milestones, Landscapes & Travel, Architecture & Street, Family Memories, Minimalist & Flora, and Pets & Companions. Each shows the size, finish, and paper used.',
  },
];

function getLiveFaqs(): FaqItem[] {
  try {
    const list = AdminService.getFaqs();
    if (!list || list.length === 0) return STATIC_FAQ_ITEMS;
    return list
      .filter((f) => f.visible !== false && f.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }));
  } catch {
    return STATIC_FAQ_ITEMS;
  }
}

export const FAQ_ITEMS: FaqItem[] = new Proxy([] as FaqItem[], {
  get(target, prop, receiver) {
    const list = getLiveFaqs();
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
    const list = getLiveFaqs();
    return prop in list;
  },
  ownKeys() {
    const list = getLiveFaqs();
    return Reflect.ownKeys(list);
  },
  getOwnPropertyDescriptor(target, prop) {
    const list = getLiveFaqs();
    return Object.getOwnPropertyDescriptor(list, prop);
  },
});
