import React, { useState } from 'react';
import { StickerSize, CustomerDetails } from '../../types/order';
import { getStickerPrice, getStickerTotal, formatRupees, getStickerDiscountInfo } from '../../lib/pricing/pricing';
import { generateOrderId } from '../../lib/orders/order-id';
import { createWhatsAppLink, createCustomerOrderWhatsAppMessage } from '../../lib/whatsapp/whatsapp';
import { AdminService } from '../../lib/admin/admin-service';
import { OrderProcessingState } from '../order-flow/OrderProcessingState';
import {
  MessageCircle,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Minus,
  Plus,
  Copy,
  CheckCircle2,
  RotateCcw,
  User,
  Phone,
  MapPin,
  Building,
  AlertCircle,
} from 'lucide-react';

type StickerFlowStep = 'select' | 'details' | 'review' | 'confirmation';

export const StickerSelector: React.FC = () => {
  const [step, setStep] = useState<StickerFlowStep>('select');
  const [selectedSize, setSelectedSize] = useState<StickerSize>('Small');
  const [quantity, setQuantity] = useState<number>(1);
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    mobileNumber: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [requirements, setRequirements] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverFinalAmount, setServerFinalAmount] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({});

  const unitPrice = getStickerPrice(selectedSize);
  const totalPrice = getStickerTotal(selectedSize, quantity);

  const validateCustomer = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!customer.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (customer.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = customer.mobileNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.mobileNumber = 'Please enter your mobile number';
    } else if (cleanPhone.length !== 10) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!customer.address.trim()) {
      newErrors.address = 'Please enter your delivery address';
    } else if (customer.address.trim().length < 5) {
      newErrors.address = 'Please provide complete delivery address';
    }

    if (!customer.city.trim()) {
      newErrors.city = 'Please enter your city';
    }

    const cleanPin = customer.pincode.replace(/\D/g, '');
    if (!cleanPin) {
      newErrors.pincode = 'Please enter your 6-digit pincode';
    } else if (cleanPin.length !== 6) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCustomer()) {
      setSubmitError(null);
      setStep('review');
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitError(null);
    setIsProcessing(true);

    const idempotencyKey = `STK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 2400));

    try {
      const [response] = await Promise.all([
        fetch('/api/public/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idempotencyKey,
            customerName: customer.fullName.trim(),
            mobileNumber: customer.mobileNumber.trim(),
            address: customer.address.trim(),
            city: customer.city.trim() || 'Kolkata',
            pincode: customer.pincode.trim(),
            product: 'Photo Stickers',
            size: selectedSize,
            quality: 'Matte Vinyl',
            quantity,
            requirements: requirements.trim(),
          }),
        }),
        minDelayPromise,
      ]);

      const data = await response.json().catch(() => null);

      if (!response.ok || !data || !data.success || !data.order || !data.order.id) {
        const errMsg =
          (data && data.error) ||
          `Order submission failed (HTTP ${response.status}). Please check your information and try again.`;
        setSubmitError(errMsg);
        setIsProcessing(false);
        return;
      }

      const createdOrder = data.order;
      setOrderId(createdOrder.id);
      setServerFinalAmount(createdOrder.finalAmount);

      // Record in AdminService cache
      AdminService.addOnlineOrder({
        orderId: createdOrder.id,
        customerName: createdOrder.customerName,
        mobileNumber: customer.mobileNumber,
        address: customer.address,
        city: customer.city,
        pincode: customer.pincode,
        product: createdOrder.product,
        size: createdOrder.size,
        quality: createdOrder.quality,
        quantity: createdOrder.quantity,
        sellingPrice: createdOrder.finalAmount,
        unitPrice: createdOrder.unitPrice,
        discount: createdOrder.discount || 0,
        requirements: createdOrder.requirements || requirements,
      });

      setIsProcessing(false);
      setStep('confirmation');
    } catch (err: any) {
      console.error('Sticker order error:', err);
      setSubmitError('Network connection error. Please verify your connection and try again.');
      setIsProcessing(false);
    }
  };

  const handleResetOrder = () => {
    setStep('select');
    setOrderId(null);
    setServerFinalAmount(null);
    setSubmitError(null);
    setQuantity(1);
    setSelectedSize('Small');
    setRequirements('');
    setIsProcessing(false);
  };

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard?.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappMessage = orderId
    ? createCustomerOrderWhatsAppMessage({
        orderId,
        customerName: customer.fullName || 'Valued Customer',
        productName: 'Photo Stickers',
        sizeName: selectedSize,
        quantity,
        totalPrice: serverFinalAmount ?? totalPrice,
      })
    : '';

  const whatsappUrl = createWhatsAppLink(whatsappMessage);

  return (
    <div className="w-full rounded-2xl border border-[#F3F0EA] bg-[#FCF9F3] p-3.5 sm:p-8 lg:p-10 shadow-xs">
      {/* 3-Second Processing Simulation */}
      {isProcessing && (
        <div className="py-12 sm:py-16 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <div className="relative mb-5 sm:mb-6">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-[#F3F0EA] border-t-[#10100F] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#10100F]">
              MP
            </div>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171717] mb-2">
            Creating your order…
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6258] max-w-sm">
            Please wait while we prepare your order details.
          </p>
        </div>
      )}

      {/* STEP 1: Select Sticker Size & Quantity */}
      {!isProcessing && step === 'select' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
          {/* Visual Presentation (Left 5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl bg-white border border-[#F3F0EA] p-3.5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
              {/* Decorative abstract shapes around sticker section in Terracotta */}
              <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 bg-[#C25E34]/20 rounded-full blur-xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 w-24 h-24 bg-[#C25E34]/15 rounded-full blur-lg" aria-hidden="true" />

              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#C25E34] font-bold">
                  Satin Vinyl Sheet
                </span>
                <span className="text-[10px] sm:text-xs bg-[#FCF9F3] border border-[#C25E34]/30 rounded px-1.5 sm:px-2 py-0.5 font-medium text-[#C25E34]">
                  100% Waterproof
                </span>
              </div>

              {/* Sample Die-cut Stickers */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 my-auto z-10 py-2 sm:py-4">
                <div className="aspect-square rounded-full bg-[#FFFDF8] shadow-2xs border border-[#C25E34]/30 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center">
                  <span className="font-serif text-[11px] sm:text-xs font-bold text-[#10100F]">Vacation</span>
                  <span className="text-[8.5px] sm:text-[9px] text-[#6B6258]">Memories</span>
                </div>
                <div className="aspect-square rounded-xl bg-[#FFFDF8] shadow-2xs border border-[#C25E34]/50 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center">
                  <span className="font-serif text-[11px] sm:text-xs font-bold text-[#C25E34]">Moments</span>
                  <span className="text-[8.5px] sm:text-[9px] text-[#C25E34]">2026</span>
                </div>
                <div className="aspect-square rounded-full bg-[#FFFDF8] shadow-2xs border border-[#C25E34]/30 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center">
                  <span className="font-serif text-[11px] sm:text-xs font-bold text-[#171717]">Family</span>
                  <span className="text-[8.5px] sm:text-[9px] text-[#6B6258]">Keepsake</span>
                </div>
              </div>

              <div className="text-[10.5px] sm:text-[11px] text-[#6B6258] text-center z-10 font-mono">
                Selected Size: <strong className="text-[#10100F]">{selectedSize}</strong> · UV Protected
              </div>
            </div>
          </div>

          {/* Configuration Controls (Right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C25E34] mb-1">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Heavy Satin Vinyl Photo Stickers</span>
              </div>

              <h3 className="font-serif text-xl sm:text-3xl font-bold text-[#171717]">
                Photo Stickers
              </h3>

              {(() => {
                const smallInfo = getStickerDiscountInfo('Small');
                return (
                  <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
                    <span className="text-xs text-[#6B6258]">Starting at</span>
                    {smallInfo.hasDiscount ? (
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-xs sm:text-sm text-[#6B6258] line-through font-mono">
                          ₹{smallInfo.originalPrice}
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C25E34] tabular-nums">
                          ₹{smallInfo.sellingPrice}
                        </span>
                      </span>
                    ) : (
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C25E34] tabular-nums">
                        ₹{smallInfo.sellingPrice}
                      </span>
                    )}
                    <span className="text-xs text-[#6B6258]">per sticker sheet pack</span>
                  </div>
                );
              })()}

              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#6B6258] leading-relaxed">
                Precision die-cut stickers printed on heavy satin vinyl. Water-resistant, UV-proof, and designed to adhere securely to laptops, phones, journals, and water bottles without sticky residue.
              </p>

              {/* STICKER SIZE DROPDOWN (Prominently Separate from Frames) */}
              <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-5 border-t border-[#F3F0EA]">
                <label
                  htmlFor="sticker-size-dropdown"
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#10100F] mb-1.5 sm:mb-2"
                >
                  Sticker Size <span className="text-[#C25E34]">*</span>
                </label>
                <div className="relative max-w-sm">
                  <select
                    id="sticker-size-dropdown"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value as StickerSize)}
                    className="w-full appearance-none rounded-lg border border-[#F3F0EA] bg-white py-2.5 sm:py-3.5 px-3.5 sm:px-4 pr-10 text-xs sm:text-sm font-semibold text-[#171717] shadow-2xs focus:border-[#10100F] focus:outline-hidden focus:ring-1 focus:ring-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
                  >
                    <option value="Small">Small (Pocket / Phone Cut) — ₹{getStickerPrice('Small')}</option>
                    <option value="Medium">Medium (Laptop / Journal Cut) — ₹{getStickerPrice('Medium')}</option>
                    <option value="Large">Large (Bottle / Luggage Cut) — ₹{getStickerPrice('Large')}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#6B6258]">
                    ▼
                  </div>
                </div>
                <p className="mt-1 sm:mt-1.5 text-xs text-[#6B6258]">
                  Select the size of your custom die-cut sheet.
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#F3F0EA] flex items-center justify-between max-w-sm">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#10100F] block">
                    Quantity
                  </span>
                  <span className="text-[11px] text-[#6B6258]">Pack of sheets</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-[#F3F0EA] bg-white text-[#171717] hover:bg-[#F3F0EA] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
                    aria-label="Decrease sticker quantity"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <span className="font-mono text-base font-bold text-[#171717] w-6 text-center tabular-nums">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-[#F3F0EA] bg-white text-[#171717] hover:bg-[#F3F0EA] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
                    aria-label="Increase sticker quantity"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Price Calculation (Terracotta Highlight) */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#F3F0EA] flex items-baseline justify-between max-w-sm">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6258] block">
                    Total Amount
                  </span>
                  <span className="text-xs text-[#6B6258] font-mono">
                    {formatRupees(unitPrice)} × {quantity}
                  </span>
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#C25E34] tabular-nums">
                  {formatRupees(totalPrice)}
                </span>
              </div>
            </div>

            {/* BLACK BUTTON with WHITE TEXT */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
              >
                <span>Continue to Customer Details</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Customer Details Form */}
      {!isProcessing && step === 'details' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#F3F0EA] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block">
                Sticker Order Step 2 of 3
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171717]">
                Customer & Shipping Details
              </h3>
            </div>
            <span className="text-xs text-[#6B6258]">
              {selectedSize} · Qty: {quantity}
            </span>
          </div>

          <form onSubmit={handleDetailsSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="sticker-customer-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6258]">
                  <User className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="sticker-customer-name"
                  type="text"
                  value={customer.fullName}
                  onChange={(e) => {
                    setCustomer((prev) => ({ ...prev, fullName: e.target.value }));
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                  placeholder="e.g. Rajesh Sharma"
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[46px] ${
                    errors.fullName && touched.fullName
                      ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400'
                      : 'border-[#F3F0EA] focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F]'
                  }`}
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="sticker-customer-mobile"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
              >
                Mobile Number (for WhatsApp proof) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6258]">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="sticker-customer-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={customer.mobileNumber}
                  onChange={(e) => {
                    setCustomer((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value.replace(/\D/g, ''),
                    }));
                    if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, mobileNumber: true }))}
                  placeholder="10-digit mobile number"
                  className={`w-full rounded-lg border bg-white py-3 pl-10 pr-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[46px] ${
                    errors.mobileNumber && touched.mobileNumber
                      ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400'
                      : 'border-[#F3F0EA] focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F]'
                  }`}
                />
              </div>
              {errors.mobileNumber && touched.mobileNumber && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="sticker-customer-address"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
              >
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute top-3 left-3 text-[#6B6258]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <textarea
                  id="sticker-customer-address"
                  rows={2}
                  value={customer.address}
                  onChange={(e) => {
                    setCustomer((prev) => ({ ...prev, address: e.target.value }));
                    if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                  placeholder="House / Flat No., Street, Landmark"
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden resize-none ${
                    errors.address && touched.address
                      ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400'
                      : 'border-[#F3F0EA] focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F]'
                  }`}
                />
              </div>
              {errors.address && touched.address && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.address}</p>
              )}
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sticker-customer-city"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6258]">
                    <Building className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    id="sticker-customer-city"
                    type="text"
                    value={customer.city}
                    onChange={(e) => {
                      setCustomer((prev) => ({ ...prev, city: e.target.value }));
                      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                    placeholder="e.g. Kolkata"
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[46px] ${
                      errors.city && touched.city
                        ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400'
                        : 'border-[#F3F0EA] focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F]'
                    }`}
                  />
                </div>
                {errors.city && touched.city && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sticker-customer-pincode"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
                >
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  id="sticker-customer-pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={customer.pincode}
                  onChange={(e) => {
                    setCustomer((prev) => ({
                      ...prev,
                      pincode: e.target.value.replace(/\D/g, ''),
                    }));
                    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: undefined }));
                  }}
                  onBlur={() => setTouched((prev) => ({ ...prev, pincode: true }))}
                  placeholder="6-digit pincode"
                  className={`w-full rounded-lg border bg-white py-3 px-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[46px] ${
                    errors.pincode && touched.pincode
                      ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400'
                      : 'border-[#F3F0EA] focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F]'
                  }`}
                />
                {errors.pincode && touched.pincode && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.pincode}</p>
                )}
              </div>
            </div>

            {/* Special Instructions / Requirements */}
            <div>
              <label
                htmlFor="sticker-customer-requirements"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
              >
                Special Requirements or Photo Notes <span className="text-[#6B6258] font-normal lowercase">(optional)</span>
              </label>
              <textarea
                id="sticker-customer-requirements"
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. Please crop circle / white border, or specific details for your stickers"
                className="w-full rounded-lg border border-[#F3F0EA] bg-white py-2.5 px-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F] focus:outline-hidden resize-none"
              />
            </div>

            {/* Action Buttons: Back & Continue to Review (BLACK button with WHITE text) */}
            <div className="pt-3.5 sm:pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F3F0EA] hover:bg-[#E8E4DC] px-4 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#171717] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px]"
              >
                <span>Review Order</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2-3s Professional Processing State Animation */}
      {isProcessing && (
        <div className="max-w-xl mx-auto rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3.5 sm:p-7 shadow-xs">
          <OrderProcessingState />
        </div>
      )}

      {/* STEP 3: Review Order & Place Order */}
      {!isProcessing && step === 'review' && (
        <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
          <div className="border-b border-[#F3F0EA] pb-2.5 sm:pb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block">
              Sticker Order Step 3 of 3
            </span>
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#171717]">
              Review Your Sticker Order
            </h3>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3.5 sm:p-7 shadow-xs space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#F3F0EA]">
              <span className="font-serif text-base sm:text-lg font-bold text-[#171717]">
                Photo Stickers ({selectedSize})
              </span>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs font-semibold text-[#171717] hover:text-[#C25E34] underline cursor-pointer"
              >
                Edit Size
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Product:</span>
                <span className="font-semibold text-[#171717]">Photo Stickers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Sticker Size:</span>
                <span className="font-serif font-bold text-[#171717]">{selectedSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Quantity:</span>
                <span className="font-mono font-bold text-[#171717]">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Customer:</span>
                <span className="font-medium text-[#171717]">{customer.fullName} ({customer.mobileNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Delivery Address:</span>
                <span className="text-[#171717] text-right max-w-[65%] font-medium break-words">
                  {customer.address}, {customer.city} - {customer.pincode}
                </span>
              </div>
              {requirements && (
                <div className="flex justify-between">
                  <span className="text-[#6B6258]">Notes:</span>
                  <span className="text-[#171717] text-right max-w-[65%] font-medium break-words italic">
                    "{requirements}"
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2.5 sm:pt-3 border-t border-[#F3F0EA] font-bold text-sm sm:text-base">
                <span className="text-[#171717]">Total Amount:</span>
                <span className="font-serif text-xl sm:text-2xl text-[#C25E34] tabular-nums">
                  {formatRupees(totalPrice)}
                </span>
              </div>
            </div>

            {/* Submit Error Alert Banner if submission failed */}
            {submitError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to place order</p>
                  <p className="mt-0.5 text-red-700">{submitError}</p>
                </div>
              </div>
            )}

            {/* BLACK BUTTON with WHITE TEXT */}
            <div className="pt-3 sm:pt-4 flex flex-col space-y-2.5 sm:space-y-3">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] py-2.5 sm:py-4 px-4 sm:px-6 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[52px] disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={isProcessing}
                className="w-full py-2 text-xs font-semibold text-[#6B6258] hover:text-[#171717] transition-colors cursor-pointer disabled:opacity-50"
              >
                ← Back to Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Order Confirmation Screen */}
      {!isProcessing && step === 'confirmation' && orderId && (
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center animate-in fade-in duration-300">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-[#F3F0EA] text-xs font-semibold text-[#171717] mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#C25E34]" />
            <span>Order Request Created</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            Thank you for choosing MomentPress. <span className="text-red-500 inline-block">❤️</span>
          </h3>

          {/* Order ID Badge */}
          <div className="mt-5 w-full max-w-md rounded-xl bg-white border border-[#F3F0EA] p-3.5 sm:p-4 flex items-center justify-between gap-2 shadow-2xs">
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
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#F3F0EA] bg-[#FCF9F3] hover:bg-white active:scale-95 transition-all text-[#171717] cursor-pointer shadow-2xs focus-visible:outline-2 focus-visible:outline-[#10100F]"
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

          {/* STICKER ORDER DETAILS */}
          <div className="mt-6 w-full rounded-2xl border border-[#F3F0EA] bg-white p-4 sm:p-7 text-left shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F0EA]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#10100F]">
                STICKER ORDER DETAILS
              </span>
              <span className="font-mono text-xs font-semibold text-[#6B6258]">
                ID: {orderId}
              </span>
            </div>

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

            <div className="py-4 space-y-2.5 text-sm border-b border-[#F3F0EA]">
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Product:</span>
                <span className="font-semibold text-[#171717]">Photo Stickers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Sticker Size:</span>
                <span className="font-serif font-bold text-[#171717]">{selectedSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6258]">Quantity:</span>
                <span className="font-mono font-bold text-[#171717]">{quantity}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F3F0EA] font-bold text-base">
                <span className="text-[#171717]">Total Amount:</span>
                <span className="font-serif text-2xl text-[#C25E34] tabular-nums">
                  {formatRupees(serverFinalAmount ?? totalPrice)}
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

          {/* Reset Action */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleResetOrder}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6258] hover:text-[#10100F] underline cursor-pointer py-2 px-3 focus-visible:outline-2 focus-visible:outline-[#10100F]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Create Another Sticker Order</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
