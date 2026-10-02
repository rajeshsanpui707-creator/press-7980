import React, { useState } from 'react';
import { CustomerDetails } from '../../types/order';
import { ArrowLeft, ArrowRight, User, Phone, MapPin, Building, ShieldCheck, AlertCircle } from 'lucide-react';

interface CustomerDetailsFormProps {
  initialDetails?: CustomerDetails;
  productSummary: {
    productName: string;
    specs: string;
    quantity: number;
    totalFormatted: string;
  };
  onBack: () => void;
  onSubmit: (details: CustomerDetails) => void;
  isProcessing?: boolean;
  submitError?: string | null;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  initialDetails,
  productSummary,
  onBack,
  onSubmit,
  isProcessing = false,
  submitError,
}) => {
  const [details, setDetails] = useState<CustomerDetails>(
    initialDetails || {
      fullName: '',
      mobileNumber: '',
      address: '',
      city: '',
      pincode: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({});

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
      onSubmit(details);
    }
  };

  const handleChange = (field: keyof CustomerDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof CustomerDetails) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F3F0EA] pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C25E34] block">
            Step 4 of 4
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171717]">
            Delivery & Customer Details
          </h3>
        </div>
        <p className="text-xs text-[#6B6258] font-sans">
          Required to dispatch your preview & order
        </p>
      </div>

      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Order Quick Summary Card */}
        <div className="rounded-xl bg-[#FCF9F3] border border-[#F3F0EA] p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6258] block">
              Order Summary
            </span>
            <span className="font-serif font-bold text-sm text-[#171717] block mt-0.5 truncate">
              {productSummary.productName} ({productSummary.specs})
            </span>
            <span className="text-xs text-[#6B6258]">
              Qty: {productSummary.quantity}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-[#6B6258] uppercase block">Total</span>
            <span className="font-serif text-xl font-bold text-[#C25E34] tabular-nums">
              {productSummary.totalFormatted}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="customer-full-name"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6258]">
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
              htmlFor="customer-mobile"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
            >
              Mobile Number (for WhatsApp proof) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6258]">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </div>
              <input
                id="customer-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={details.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('mobileNumber')}
                placeholder="10-digit mobile number"
                disabled={isProcessing}
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
              htmlFor="customer-address"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
            >
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute top-3 left-3 text-[#6B6258]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </div>
              <textarea
                id="customer-address"
                rows={2}
                value={details.address}
                onChange={(e) => handleChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                placeholder="House / Flat No., Street, Landmark"
                disabled={isProcessing}
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

          {/* City & Pincode Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label
                htmlFor="customer-city"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
              >
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6258]">
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

            {/* Pincode */}
            <div>
              <label
                htmlFor="customer-pincode"
                className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
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

          {/* Special Requirements / Notes */}
          <div>
            <label
              htmlFor="form-customer-requirements"
              className="block text-xs font-semibold uppercase tracking-wider text-[#171717] mb-1.5"
            >
              Special Requirements or Photo Notes <span className="text-[#6B6258] font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="form-customer-requirements"
              rows={2}
              value={details.requirements || ''}
              onChange={(e) => handleChange('requirements', e.target.value)}
              placeholder="e.g. Photo orientation preferences, crop instructions, gift note..."
              disabled={isProcessing}
              className="w-full rounded-lg border border-[#F3F0EA] bg-white py-2.5 px-3 text-sm text-[#171717] placeholder:text-[#6B6258]/60 transition-colors focus:border-[#10100F] focus:ring-1 focus:ring-[#10100F] focus:outline-hidden resize-none"
            />
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to place order</p>
                <p className="mt-0.5 text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="pt-2 flex items-center gap-2 text-xs text-[#6B6258]">
            <ShieldCheck className="h-4 w-4 text-[#C25E34] shrink-0" aria-hidden="true" />
            <span>Your contact details are strictly kept private for order & delivery.</span>
          </div>

          {/* Action Buttons: Back & Place Order (BLACK button with WHITE text) */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F3F0EA] hover:bg-[#E8E4DC] px-5 py-3.5 text-sm font-semibold text-[#171717] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[48px] disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>

            {/* BLACK BUTTON with WHITE TEXT */}
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#10100F] hover:bg-[#080807] px-7 py-3.5 text-base font-semibold text-white shadow-sm active:scale-[0.98] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F] cursor-pointer min-h-[48px] disabled:opacity-70"
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
      </div>
    </div>
  );
};
