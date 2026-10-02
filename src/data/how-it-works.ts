export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  iconName: 'image' | 'frame' | 'check-circle' | 'package';
  subnote?: string;
}

export const HOW_IT_WORKS_DATA = {
  heading: 'How Handcrafted Framing Works',
  supportingText: 'From your smartphone camera roll to your living room wall in 4 simple steps.',
  steps: [
    {
      step: '01',
      title: 'Select Size & Finish',
      description: 'Choose from 5 thoughtful frame sizes and 4 solid wood finishes, plus your choice of paper finish.',
      iconName: 'frame' as const,
      subnote: 'Prices starting from just ₹199',
    },
    {
      step: '02',
      title: 'Send Photo on WhatsApp',
      description: 'Attach your high-resolution photo directly in our official WhatsApp chat with your generated Order ID.',
      iconName: 'image' as const,
      subnote: 'No clunky app downloads required',
    },
    {
      step: '03',
      title: 'Approve Free Digital Proof',
      description: 'Our color technician sends a preview showing exact crop, margins, and paper texture for your approval.',
      iconName: 'check-circle' as const,
      subnote: 'We print ONLY after you are 100% satisfied',
    },
    {
      step: '04',
      title: 'Delivered in 48 Hours',
      description: 'Carefully packaged in shock-absorbing protective layers and delivered right to your doorstep across Kolkata.',
      iconName: 'package' as const,
      subnote: 'Safe, contactless delivery guarantee',
    },
  ],
};
