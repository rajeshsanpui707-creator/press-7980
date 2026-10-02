import { FaqItem } from '../types';
import { AdminService } from '../lib/admin/admin-service';

export const FAQ_SECTION_DATA = {
  heading: 'Frequently Asked Questions',
  supportingText: 'Everything you need to know about custom framing, materials, and delivery.',
};

export const STATIC_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How do I send my photo for custom framing or stickers?',
    answer: 'Once you configure your size and options, click "Send Photos on WhatsApp" on the confirmation screen. You can simply attach your full-resolution image directly to our chat thread. Our team inspects every image for sharpness and resolution.',
  },
  {
    id: 'faq-2',
    question: 'Will I see how my photo looks before it is printed?',
    answer: 'Yes, absolutely. We generate a 100% free digital mock-up preview via WhatsApp showing the exact cropping, borders, and color tone. Printing begins only after you review and explicitly approve the preview.',
  },
  {
    id: 'faq-3',
    question: 'What is the standard turnaround time in Kolkata?',
    answer: 'Orders in Kolkata are handcrafted in our Bowbazar studio and delivered within 24 to 48 hours of your proof approval. We use reinforced tamper-proof packaging to ensure safe arrival.',
  },
  {
    id: 'faq-4',
    question: 'What kind of paper and printing technology do you use?',
    answer: 'We use professional 12-color archival pigment printers with genuine pigment inks. Paper options range from 240 GSM Luster for rich contrast, to 280 GSM Studio Velvet, and 310 GSM 100% cotton museum rag that lasts over a century.',
  },
  {
    id: 'faq-5',
    question: 'Are the photo stickers waterproof and residue-free?',
    answer: 'Yes! Our custom photo stickers are printed on durable vinyl with a protective matte lamination that makes them resistant to water, spills, and UV sunlight. When removed, they leave zero sticky residue on laptops, phone cases, or tumblers.',
  },
  {
    id: 'faq-6',
    question: 'What if my package arrives damaged in transit?',
    answer: 'Contact MomentPress as soon as possible with the relevant order details and photos of the package/product so the issue can be reviewed and resolved according to the applicable policy.',
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
