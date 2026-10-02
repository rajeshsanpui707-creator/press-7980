export type StickerSize = 'Small' | 'Medium' | 'Large';

export interface CustomerDetails {
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  pincode: string;
  requirements?: string;
}

export interface OrderSummary {
  orderId: string;
  customer: CustomerDetails;
  productName: string;
  size: string;
  tier?: string;
  finish?: string;
  quantity: number;
  totalPrice: number;
  requirements?: string;
  createdAt: string;
}
