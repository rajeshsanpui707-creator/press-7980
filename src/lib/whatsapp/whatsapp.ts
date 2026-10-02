import { SITE_CONFIG } from '../config/site-config';
import { AdminService } from '../admin/admin-service';

export const WHATSAPP_MESSAGES = {
  general: 'Hi, I want to know more about MomentPress products.',
  frame: 'Hi, I want to create a custom photo frame with MomentPress.\n\nPlease guide me through the options.',
  sticker: 'Hi, I want to order Photo Stickers from MomentPress.\n\nPlease share the available options.',
  finalCta: 'Hi, I want to turn my photo into a handcrafted keepsake frame.\n\nPlease guide me through placing an order.',
  galleryInquiry: (title?: string, size?: string) =>
    `Hi MomentPress! I'm interested in the "${title || 'custom frame'}" design (${size || 'standard size'}) from your gallery. Could you please share more details?`,
};

export function createWhatsAppLink(message?: string, phone?: string): string {
  const targetPhone = phone || SITE_CONFIG.whatsapp.number;
  const msgText = message || WHATSAPP_MESSAGES.general;
  let cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const encodedText = encodeURIComponent(msgText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function createCustomerOrderWhatsAppMessage(params: {
  orderId: string;
  customerName: string;
  productName: string;
  sizeName: string;
  qualityName?: string;
  quantity: number;
  totalPrice: number;
}): string {
  const { orderId, customerName, productName, sizeName, qualityName, quantity, totalPrice } = params;

  try {
    const templates = AdminService.getWhatsAppTemplates();
    const orderTmpl = templates.find((t) => t.id === 'tmpl-order' || t.category === 'Order Request');
    if (orderTmpl && orderTmpl.templateText) {
      let text = orderTmpl.templateText;
      text = text.replace(/{orderId}/g, orderId);
      text = text.replace(/{customerName}/g, customerName);
      text = text.replace(/{productName}/g, productName);
      text = text.replace(/{sizeName}/g, `${sizeName}${qualityName ? ` (${qualityName})` : ''}`);
      text = text.replace(/{quantity}/g, String(quantity));
      text = text.replace(/{totalPrice}/g, String(totalPrice));
      return text;
    }
  } catch {
    // fallback
  }

  return `Hello MomentPress!

I have placed an order request:
Order ID: ${orderId}
Customer Name: ${customerName}
Product: ${productName}
Size: ${sizeName}${qualityName ? ` (${qualityName})` : ''}
Quantity: ${quantity}
Total Amount: ₹${totalPrice}

I am attaching my photo(s) here for the free digital proof. Please verify and guide me with the next steps!`;
}

