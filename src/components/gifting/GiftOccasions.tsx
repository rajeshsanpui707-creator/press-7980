import React from 'react';
import { Container } from '../layout/Container';
import { SectionHeading } from '../common/SectionHeading';
import { createWhatsAppLink, WHATSAPP_MESSAGES } from '../../lib/whatsapp/whatsapp';
import { Heart, Sparkles, Gift, Star, Users, MessageCircle } from 'lucide-react';

interface GiftOccasion {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  recommendedSize: string;
  recommendedFinish: string;
  recommendedPaper: string;
  whatsappMessage: string;
}

const GIFT_OCCASIONS: GiftOccasion[] = [
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Celebrate years together with a frame that preserves your journey.',
    icon: <Heart className="h-5 w-5" aria-hidden="true" />,
    recommendedSize: '8×10 in or 10×12 in',
    recommendedFinish: 'Warm Walnut or Classic Black',
    recommendedPaper: 'Archival Fine Art',
    whatsappMessage: 'Hi MomentPress! I want to order an anniversary photo frame gift. Please guide me through the options.',
  },
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Turn a favorite memory into a birthday gift they\'ll treasure forever.',
    icon: <Gift className="h-5 w-5" aria-hidden="true" />,
    recommendedSize: '6×8 in or 5×7 in',
    recommendedFinish: 'Gallery White or Natural Oak',
    recommendedPaper: 'Studio Velvet',
    whatsappMessage: 'Hi MomentPress! I want to order a birthday photo frame gift. Please share the available options.',
  },
  {
    id: 'wedding',
    name: 'Wedding Gift',
    description: 'A timeless keepsake for the newlyweds to display their first memory as a married couple.',
    icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
    recommendedSize: '10×12 in or 12×18 in',
    recommendedFinish: 'Classic Black or Warm Walnut',
    recommendedPaper: 'Archival Fine Art',
    whatsappMessage: 'Hi MomentPress! I want to order a wedding photo frame gift. Please guide me through the options.',
  },
  {
    id: 'housewarming',
    name: 'Housewarming',
    description: 'Help them make their new house a home with a personalized framed memory.',
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
    recommendedSize: '6×8 in or 8×10 in',
    recommendedFinish: 'Natural Oak or Gallery White',
    recommendedPaper: 'Studio Velvet',
    whatsappMessage: 'Hi MomentPress! I want to order a housewarming photo frame gift. Please share the available options.',
  },
  {
    id: 'parents-day',
    name: 'Parents\' Day',
    description: 'Show your parents how much they mean with a frame of the family together.',
    icon: <Heart className="h-5 w-5" aria-hidden="true" />,
    recommendedSize: '8×10 in',
    recommendedFinish: 'Warm Walnut or Natural Oak',
    recommendedPaper: 'Studio Velvet',
    whatsappMessage: 'Hi MomentPress! I want to order a Parents\' Day photo frame gift. Please share the available options.',
  },
  {
    id: 'valentines',
    name: 'Valentine\'s Day',
    description: 'Capture your love story in a frame that says more than words ever could.',
    icon: <Heart className="h-5 w-5" aria-hidden="true" />,
    recommendedSize: '6×8 in',
    recommendedFinish: 'Classic Black or Gallery White',
    recommendedPaper: 'Studio Velvet',
    whatsappMessage: 'Hi MomentPress! I want to order a Valentine\'s Day photo frame gift. Please guide me through the options.',
  },
];

function GiftOccasionCard({ occasion }: { occasion: GiftOccasion }) {
  return (
    <article key={occasion.id} className="bg-white rounded-2xl border border-[#F3F0EA] p-4 sm:p-6 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FCF9F3] border border-[#F3F0EA] flex items-center justify-center text-[#C25E34]">
          {occasion.icon}
        </div>
        <div>
          <h3 className="font-bold text-base text-[#171717]">{occasion.name}</h3>
          <p className="text-[11px] text-[#6B6258] mt-0.5">{occasion.description}</p>
        </div>
      </div>

      <dl className="space-y-2 text-[11px] text-[#6B6258] mb-4">
        <div className="flex gap-2">
          <dt className="font-medium text-[#171717] min-w-[50px]">Size:</dt>
          <dd>{occasion.recommendedSize}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-[#171717] min-w-[50px]">Finish:</dt>
          <dd>{occasion.recommendedFinish}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-[#171717] min-w-[50px]">Paper:</dt>
          <dd>{occasion.recommendedPaper}</dd>
        </div>
      </dl>

      <a
        href={createWhatsAppLink(occasion.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#10100F] px-3 py-2 text-xs font-semibold text-white hover:bg-[#080807] active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F]"
        aria-label={`Order ${occasion.name} photo frame gift on WhatsApp`}
      >
        <Gift className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Order {occasion.name} Gift</span>
      </a>
    </article>
  );
}

export const GiftOccasions: React.FC = () => (
  <section
    id="gift-occasions"
    className="py-6 sm:py-20 bg-[#FFFDF8] border-b border-[#F3F0EA]"
    aria-labelledby="gift-occasions-heading"
  >
    <Container size="wide">
      <SectionHeading
        kicker="Gifting Made Meaningful"
        title="Perfect Occasions for a Custom Frame"
        subtitle="Every milestone deserves a frame that tells the story. Handcrafted in Kolkata, delivered with care."
      />

      {/* AEO Answer Block - Gift Intent */}
      <div className="mb-8 p-4 sm:p-6 rounded-xl bg-white border border-[#F3F0EA] max-w-3xl">
        <h3 className="font-bold text-sm sm:text-base text-[#171717] mb-2">
          What occasions are custom photo frames best for?
        </h3>
        <p className="text-xs sm:text-sm text-[#6B6258] leading-relaxed mb-3">
          Custom photo frames make meaningful gifts for anniversaries, birthdays, weddings, housewarmings, Parents' Day, Valentine's Day, and any milestone worth remembering. Each frame is handcrafted in our Bowbazar, Kolkata studio with your chosen photo, wood finish, and archival paper.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Anniversary', 'Birthday', 'Wedding', 'Housewarming', 'Parents\' Day', 'Valentine\'s Day'].map((occasion) => (
            <span
              key={occasion}
              className="px-2.5 py-1 rounded-full bg-[#FCF9F3] border border-[#F3F0EA] text-[10px] sm:text-xs font-medium text-[#6B6258]"
            >
              {occasion}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {GIFT_OCCASIONS.map((occasion) => (
          <GiftOccasionCard key={occasion.id} occasion={occasion} />
        ))}
      </div>

      {/* Gift Intent Internal Links */}
      <div className="mt-8 p-4 sm:p-6 rounded-xl bg-[#FCF9F3] border border-[#F3F0EA]">
        <h3 className="font-bold text-sm text-[#171717] mb-3 text-center">
          Looking for a specific gift idea?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-center">
          <a
            href="#products"
            className="p-3 rounded-lg bg-white border border-[#F3F0EA] hover:border-[#C25E34] transition-colors"
          >
            <Star className="h-5 w-5 mx-auto text-[#C25E34] mb-1" aria-hidden="true" />
            <p className="font-semibold text-sm text-[#171717]">Custom Frames</p>
            <p className="text-[10px] text-[#6B6258]">5 sizes, 4 finishes, 3 papers</p>
          </a>
          <a
            href="#products"
            className="p-3 rounded-lg bg-white border border-[#F3F0EA] hover:border-[#C25E34] transition-colors"
          >
            <Sparkles className="h-5 w-5 mx-auto text-[#C25E34] mb-1" aria-hidden="true" />
            <p className="font-semibold text-sm text-[#171717]">Photo Stickers</p>
            <p className="text-[10px] text-[#6B6258]">Waterproof vinyl, 3 sizes</p>
          </a>
          <a
            href={createWhatsAppLink('Hi MomentPress! I need help choosing a gift frame. Can you suggest options based on the occasion?')}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-white border border-[#F3F0EA] hover:border-[#C25E34] transition-colors"
          >
            <MessageCircle className="h-5 w-5 mx-auto text-[#25D366] mb-1" aria-hidden="true" />
            <p className="font-semibold text-sm text-[#171717]">Get Gift Advice</p>
            <p className="text-[10px] text-[#6B6258]">Chat with our team on WhatsApp</p>
          </a>
        </div>
      </div>
    </Container>
  </section>
);

export const GiftOccasionsSection = GiftOccasions;