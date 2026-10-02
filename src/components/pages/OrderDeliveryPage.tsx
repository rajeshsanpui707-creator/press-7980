import React, { useState } from 'react';
import { CustomerDetails, FrameSizeId, FrameTierId, FrameFinish } from '../../types';
import { FRAME_SIZE_CONFIGS, FRAME_TIER_CONFIGS, FRAME_FINISHES } from '../../data/products';
import { getFramePrice, formatRupees } from '../../lib/pricing/pricing';
import { Container } from '../layout/Container';
import { OrderProgress } from '../order-flow/OrderProgress';
import { OrderProcessingState } from '../order-flow/OrderProcessingState';
import { ArrowLeft, ArrowRight, User, Phone, MapPin, Building, ShieldCheck, AlertCircle } from 'lucide-react';

interface OrderDeliveryPageProps {
  selectedSize: FrameSizeId;
  selectedTier: FrameTierId;
  selectedFinish: FrameFinish;
  quantity: number;
  initialCustomer: CustomerDetails;
  isProcessing: boolean;
  submitError?: string | null;
  onCustomerChange: (details: CustomerDetails) => void;
  onBackToReview: () => void;
  onSubmitOrder: (details: CustomerDetails) => void;
  onNavigateStep: (stepNumber: 1 | 2 | 3 | 4) => void;
}

export const OrderDeliveryPage: React.FC<OrderDeliveryPageProps> = ({
  selectedSize,
  selectedTier,
  selectedFinish,
  quantity,
  initialCustomer,
  isProcessing,
  submitError,
  onCustomerChange,
  onBackToReview,
  onSubmitOrder,
  onNavigateStep,
}) => {
  const [details, setDetails] = useState<CustomerDetails>(initialCustomer);

  // Synchronize when initialCustomer updates from review/other steps
  React.useEffect(() => {
    setDetails(initialCustomer);
  }, [initialCustomer]);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({});

  const sizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];
  const tierConfig = FRAME_TIER_CONFIGS.find((t) => t.id === selectedTier) || FRAME_TIER_CONFIGS[1];
  const finishConfig = FRAME_FINISHES.find((f) => f.id === selectedFinish) || FRAME_FINISHES[0];

  const unitPrice = getFramePrice(selectedSize, selectedTier);
  const totalPrice = unitPrice * quantity;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!details.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (details.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = details.mobileNumber.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.mobileNumber = 'Please enter your mobile number';
    } else if (cleanPhone.length !== 10) {
      newErrors.mobileNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!details.address.trim()) {
      newErrors.address = 'Please enter your delivery address';
    } else if (details.address.trim().length < 5) {
      newErrors.address = 'Please provide complete delivery address';
    }

    if (!details.city.trim()) {
      newErrors.city = 'Please enter your city';
    }

    const cleanPin = details.pincode.replace(/\D/g, '');
    if (!cleanPin) {
      newErrors.pincode = 'Please enter your 6-digit pincode';
    } else if (cleanPin.length !== 6) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmitOrder(details);
    }
  };

  const handleChange = (field: keyof CustomerDetails, value: string) => {
    const updated = { ...details, [field]: value };
    setDetails(updated);
    onCustomerChange(updated);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof CustomerDetails) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="bg-[#FFFDF8] py-3 sm:py-16 min-h-[70vh]">
      <Container size="default">
        {/* Navigation Breadcrumb / Back button */}
        {!isProcessing && (
          <div className="mb-2.5 sm:mb-6">
            <button
              type="button"
              onClick={onBackToReview}
              className="inline-flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs sm:text-sm font-semibold text-[#6B6258] hover:text-[#10100F] hover:bg-[#F3F0EA] transition-colors group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#10100F]"
              aria-label="Back to Order Review"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <span>Back to Order Review</span>
            </button>
          </div>
        )}

        {/* Step Progress Header */}
        {!isProcessing && (
          <OrderProgress
            currentStep={4}
            onNavigateStep={(step) => onNavigateStep(step as 1 | 2 | 3 | 4)}
          />
        )}

        {/* Main Content Card */}
        <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3.5 sm:p-10 shadow-xs max-w-2xl mx-auto">
          {/* 2-3 Second Professional Processing State */}
          {isProcessing ? (
            <OrderProcessingState />
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-[#F3F0EA] pb-3 sm:pb-5 mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block mb-1">
                  Step 4 of 4 · Delivery
                </span>
                <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#171717] tracking-tight">
                  Enter Delivery Details
                </h1>
                <p className="text-xs sm:text-sm text-[#6B6258] mt-1 sm:mt-1.5 font-sans">
                  Provide your delivery address in Kolkata and contact details for the free WhatsApp digital proof.
                </p>
              </div>

              {/* Order Quick Summary Card */}
              <div className="rounded-xl bg-[#FCF9F3] border border-[#F3F0EA] p-3 sm:p-4 flex items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6258] block">
                    Order Summary
                  </span>
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#171717] block mt-0.5 truncate">
                    Custom Frame ({sizeConfig.name} · {tierConfig.name} · {finishConfig.name})
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#6B6258]">
                    Qty: {quantity} · Free Delivery in Kolkata
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#6B6258] uppercase block">Total</span>
                  <span className="font-serif text-lg sm:text-2xl font-bold text-[#C25E34] tabular-nums">
                    {formatRupees(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="customer-full-name"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                      <User className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <input
                      id="customer-full-name"
                      type="text"
                      value={details.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="e.g. Rajesh Sharma"
                      disabled={isProcessing}
                      className={`w-full rounded-lg border bg-white py-2.5 sm:py-3 pl-10 pr-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[42px] sm:min-h-[46px] ${
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
                    htmlFor="customer-mobile"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1"
                  >
                    WhatsApp Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <input
                      id="customer-mobile"
                      type="tel"
                      inputMode="numeric"
                      value={details.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('mobileNumber')}
                      placeholder="10-digit number for WhatsApp proof"
                      maxLength={10}
                      disabled={isProcessing}
                      className={`w-full rounded-lg border bg-white py-2.5 sm:py-3 pl-10 pr-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[42px] sm:min-h-[46px] ${
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

                {/* Delivery Address */}
                <div>
                  <label
                    htmlFor="customer-address"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1"
                  >
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute top-3 left-3.5 text-[#6B6258]">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <textarea
                      id="customer-address"
                      rows={2}
                      value={details.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      onBlur={() => handleBlur('address')}
                      placeholder="Flat/House No., Street, Landmark, Kolkata"
                      disabled={isProcessing}
                      className={`w-full rounded-lg border bg-white py-2.5 sm:py-3 pl-10 pr-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden ${
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

                {/* City & Pincode Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* City */}
                  <div>
                    <label
                      htmlFor="customer-city"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1"
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                        <Building className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <input
                        id="customer-city"
                        type="text"
                        value={details.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        placeholder="e.g. Kolkata"
                        disabled={isProcessing}
                        className={`w-full rounded-lg border bg-white py-2.5 sm:py-3 pl-10 pr-3 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[42px] sm:min-h-[46px] ${
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

                  {/* Pincode */}
                  <div>
                    <label
                      htmlFor="customer-pincode"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1"
                    >
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="customer-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={details.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('pincode')}
                      placeholder="6-digit pincode"
                      disabled={isProcessing}
                      className={`w-full rounded-lg border bg-white py-2.5 sm:py-3 px-3.5 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:outline-hidden min-h-[42px] sm:min-h-[46px] ${
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

                {/* Special Requirements / Photo Notes */}
                <div>
                  <label
                    htmlFor="customer-requirements"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1"
                  >
                    Special Requirements or Photo Notes <span className="text-[#6B6258] font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    id="customer-requirements"
                    rows={2}
                    value={details.requirements || ''}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    placeholder="e.g. Photo orientation preferences, crop instructions, gift note..."
                    disabled={isProcessing}
                    className="w-full rounded-lg border border-[#F3F0EA] bg-white py-2.5 sm:py-3 px-3.5 text-xs sm:text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F] focus:outline-hidden resize-none"
                  />
                </div>

                {/* Submit Error Banner if submission failed */}
                {submitError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Unable to place order</p>
                      <p className="mt-0.5 text-red-700">{submitError}</p>
                    </div>
                  </div>
                )}

                {/* Privacy Guarantee Note */}
                <div className="pt-1.5 flex items-center gap-2 text-xs text-[#6B6258]">
                  <ShieldCheck className="h-4 w-4 text-[#C25E34] shrink-0" aria-hidden="true" />
                  <span>Your contact details are strictly kept private for order proofing and delivery.</span>
                </div>

                {/* Action Buttons: Back & Place Order */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#F3F0EA]">
                  <button
                    type="button"
                    onClick={onBackToReview}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F3F0EA] hover:bg-[#E8E4DC] px-4 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#171717] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px] disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Back</span>
                  </button>

                  {/* Designated Button: Place Order */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[44px] sm:min-h-[48px] disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </Container>
    </div>
  );
};
