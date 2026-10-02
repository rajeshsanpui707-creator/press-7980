import React, { useState } from 'react';
import { CustomerDetails } from '../../types/order';
import { formatRupees } from '../../lib/pricing/pricing';
import { createWhatsAppLink, createCustomerOrderWhatsAppMessage } from '../../lib/whatsapp/whatsapp';
import { CheckCircle2, MessageCircle, Copy, Check, RotateCcw, ArrowRight } from 'lucide-react';

interface OrderConfirmationProps {
  orderId: string;
  customer: CustomerDetails;
  productName?: string;
  selectedSize: string;
  selectedTier?: string;
  selectedFinish?: string;
  quantity: number;
  totalPrice: number;
  requirements?: string;
  onResetOrder: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  customer,
  productName = 'Custom Frame',
  selectedSize,
  selectedTier,
  selectedFinish,
  quantity,
  totalPrice,
  requirements,
  onResetOrder,
}) => {
  const [copied, setCopied] = useState(false);

  // Exact WhatsApp pre-filled message as requested in Part 8
  const whatsappMessage = createCustomerOrderWhatsAppMessage({
    orderId,
    customerName: customer.fullName || 'Valued Customer',
    productName,
    sizeName: selectedSize,
    qualityName: selectedTier,
    quantity,
    totalPrice,
  });

  const whatsappUrl = createWhatsAppLink(whatsappMessage);

  const handleCopyOrderId = () => {
    navigator.clipboard?.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timelineSteps = [
    { title: 'Order Request Created', desc: 'Your details and specifications have been noted', active: true },
    { title: 'Send Photos on WhatsApp', desc: 'Click the button below to share your high-res photos', active: false },
    { title: 'Free Digital Preview', desc: 'Our design team prepares a mock-up for your review', active: false },
    { title: 'Customer Approval', desc: 'We only begin physical production once you approve', active: false },
    { title: 'Printing & Packaging', desc: 'High-definition archival print & multi-layer protection', active: false },
    { title: 'Doorstep Delivery', desc: 'Dispatched safely to your address in 48 hours', active: false },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Status Pill */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCF9F3] border border-[#F3F0EA] text-xs font-semibold text-[#171717] mb-4">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#C25E34]" />
        <span>Order Request Created</span>
      </div>

      {/* Main Headline */}
      <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717]">
        Thank you for choosing MomentPress. <span className="text-red-500 inline-block">❤️</span>
      </h3>

      {/* Your Order ID Badge */}
      <div className="mt-5 w-full max-w-md rounded-xl bg-[#FCF9F3] border border-[#F3F0EA] p-3.5 sm:p-4 flex items-center justify-between gap-2 shadow-2xs">
        <div className="text-left min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6258] block">
            Your Order ID
          </span>
          <span className="font-mono text-lg sm:text-2xl font-bold text-[#10100F] tracking-wider block mt-0.5 break-all sm:break-normal">
            {orderId}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyOrderId}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#F3F0EA] bg-white hover:bg-[#FFFDF8] active:scale-95 transition-all text-[#171717] cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-[#10100F]"
          aria-label="Copy Order ID to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#C25E34]" />
              <span className="text-[#C25E34]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-[#6B6258]" />
              <span>Copy ID</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-2 text-xs text-[#6B6258]">
        Keep this Order ID for future reference.
      </p>

      {/* COMPLETE ORDER DETAILS Card */}
      <div className="mt-6 w-full rounded-2xl border border-[#F3F0EA] bg-white p-4 sm:p-7 text-left shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F3F0EA]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#10100F]">
            ORDER DETAILS
          </span>
          <span className="font-mono text-xs font-semibold text-[#6B6258]">
            ID: {orderId}
          </span>
        </div>

        {/* Customer Information Block */}
        <div className="py-3 border-b border-[#F3F0EA] text-xs sm:text-sm space-y-1.5 bg-[#FCF9F3]/60 -mx-4 sm:-mx-7 px-4 sm:px-7">
          <div className="flex justify-between">
            <span className="text-[#6B6258]">Customer Name:</span>
            <span className="font-semibold text-[#171717]">{customer.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6258]">Mobile Number:</span>
            <span className="font-mono font-medium text-[#171717]">{customer.mobileNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6258]">Delivery Address:</span>
            <span className="text-[#171717] text-right max-w-[65%] font-medium break-words">{customer.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6258]">City & Pincode:</span>
            <span className="font-medium text-[#171717]">{customer.city} — {customer.pincode}</span>
          </div>
        </div>

        {/* Product Specifications Block */}
        <div className="py-4 space-y-2.5 text-sm border-b border-[#F3F0EA]">
          <div className="flex justify-between">
            <span className="text-[#6B6258]">Product:</span>
            <span className="font-semibold text-[#171717]">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6258]">Size:</span>
            <span className="font-serif font-bold text-[#171717]">{selectedSize}</span>
          </div>
          {selectedTier && (
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Quality:</span>
              <span className="font-medium text-[#171717]">{selectedTier}</span>
            </div>
          )}
          {selectedFinish && (
            <div className="flex justify-between">
              <span className="text-[#6B6258]">Finish:</span>
              <span className="text-[#171717]">{selectedFinish}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#6B6258]">Quantity:</span>
            <span className="font-mono font-bold text-[#171717]">{quantity}</span>
          </div>
          {requirements && (
            <div className="flex justify-between py-1 border-t border-[#F3F0EA]/60 text-xs sm:text-sm">
              <span className="text-[#6B6258]">Special Notes:</span>
              <span className="text-[#171717] font-medium text-right max-w-[65%] italic">"{requirements}"</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#F3F0EA] font-bold text-base">
            <span className="text-[#171717]">Total Amount:</span>
            <span className="font-serif text-2xl text-[#C25E34] tabular-nums">
              {formatRupees(totalPrice)}
            </span>
          </div>
        </div>

        {/* Primary CTA: BLACK BUTTON with WHITE TEXT (Send Photos on WhatsApp) */}
        <div className="mt-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-[#10100F] hover:bg-[#080807] py-4 px-6 text-base font-semibold text-white shadow-md active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10100F] min-h-[52px]"
          >
            <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Send Photos on WhatsApp</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>

          <p className="mt-2.5 text-center text-xs text-[#6B6258]">
            Click to send your photos and requirements for order {orderId} on WhatsApp.
          </p>
        </div>
      </div>

      {/* WHAT HAPPENS NEXT Timeline */}
      <div className="mt-6 w-full rounded-2xl bg-[#FCF9F3] border border-[#F3F0EA] p-5 sm:p-6 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-[#10100F] block mb-4">
          What Happens Next
        </span>

        <div className="space-y-3">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${step.active ? '' : 'opacity-65'}`}>
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5 ${
                  step.active
                    ? 'bg-[#10100F] text-white shadow-xs'
                    : 'bg-[#F3F0EA] text-[#6B6258]'
                }`}
              >
                {step.active ? '✓' : idx + 1}
              </div>
              <div className="text-xs">
                <span className={`font-bold block ${step.active ? 'text-[#10100F]' : 'text-[#171717]'}`}>
                  {step.title}
                  {step.active && (
                    <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-[#C25E34] bg-[#FFFDF8] px-1.5 py-0.5 rounded border border-[#F3F0EA]">
                      Done
                    </span>
                  )}
                </span>
                <span className="text-[#6B6258] mt-0.5 block">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Another Order Reset CTA */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onResetOrder}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6258] hover:text-[#10100F] underline cursor-pointer py-2 px-3 focus-visible:outline-2 focus-visible:outline-[#10100F]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Create Another Order</span>
        </button>
      </div>
    </div>
  );
};
