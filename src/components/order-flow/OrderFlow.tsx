import React, { useState, useEffect } from 'react';
import { FrameSizeId, FrameTierId, FrameFinish, OrderStep, CustomerDetails } from '../../types';
import { OrderProgress } from './OrderProgress';
import { FrameStep } from './FrameStep';
import { QualityStep } from './QualityStep';
import { OrderReviewStep } from './OrderReviewStep';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { OrderConfirmation } from './OrderConfirmation';
import { OrderProcessingState } from './OrderProcessingState';
import { generateOrderId } from '../../lib/orders/order-id';
import { FRAME_SIZE_CONFIGS, FRAME_TIER_CONFIGS, FRAME_FINISHES } from '../../data/products';
import { getFramePrice, formatRupees } from '../../lib/pricing/pricing';

interface OrderFlowProps {
  initialSize?: FrameSizeId;
  initialTier?: FrameTierId;
  initialFinish?: FrameFinish;
  resetSignal?: number;
  selectedSize?: FrameSizeId;
  selectedFinish?: FrameFinish;
  onSelectSize?: (size: FrameSizeId) => void;
  onSelectFinish?: (finish: FrameFinish) => void;
  onContinueToQuality?: () => void;
}

export const OrderFlow: React.FC<OrderFlowProps> = ({
  initialSize = '6x8',
  initialTier = 'better',
  initialFinish = 'natural-oak',
  resetSignal,
  selectedSize: controlledSize,
  selectedFinish: controlledFinish,
  onSelectSize: controlledOnSelectSize,
  onSelectFinish: controlledOnSelectFinish,
  onContinueToQuality,
}) => {
  const [step, setStep] = useState<OrderStep>(1);
  const [internalSize, setInternalSize] = useState<FrameSizeId>(controlledSize || initialSize);
  const [selectedTier, setSelectedTier] = useState<FrameTierId>(initialTier);
  const [internalFinish, setInternalFinish] = useState<FrameFinish>(controlledFinish || initialFinish);
  const [quantity, setQuantity] = useState<number>(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    mobileNumber: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const selectedSize = controlledSize || internalSize;
  const selectedFinish = controlledFinish || internalFinish;

  const handleSelectSize = (size: FrameSizeId) => {
    setInternalSize(size);
    if (controlledOnSelectSize) {
      controlledOnSelectSize(size);
    }
  };

  const handleSelectFinish = (finish: FrameFinish) => {
    setInternalFinish(finish);
    if (controlledOnSelectFinish) {
      controlledOnSelectFinish(finish);
    }
  };

  // If a reset signal is received, reset to Step 1
  useEffect(() => {
    if (resetSignal && resetSignal > 0) {
      setStep(1);
      setIsProcessing(false);
    }
  }, [resetSignal]);

  const sizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];
  const tierConfig = FRAME_TIER_CONFIGS.find((t) => t.id === selectedTier) || FRAME_TIER_CONFIGS[1];
  const finishConfig = FRAME_FINISHES.find((f) => f.id === selectedFinish) || FRAME_FINISHES[0];
  const unitPrice = getFramePrice(selectedSize, selectedTier);
  const totalPrice = unitPrice * quantity;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverFinalAmount, setServerFinalAmount] = useState<number | null>(null);

  // Handle final submission from Customer Details form
  const handleCustomerSubmit = async (details: CustomerDetails) => {
    setCustomer(details);
    setSubmitError(null);
    setIsProcessing(true);

    const idempotencyKey = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 2400));

    try {
      const [response] = await Promise.all([
        fetch('/api/public/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idempotencyKey,
            customerName: details.fullName.trim(),
            mobileNumber: details.mobileNumber.trim(),
            address: details.address.trim(),
            city: details.city.trim() || 'Kolkata',
            pincode: details.pincode.trim(),
            product: 'Custom Photo Frames',
            size: sizeConfig.name,
            quality: tierConfig.name,
            quantity,
            requirements: details.requirements || '',
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

      setOrderId(data.order.id);
      setServerFinalAmount(data.order.finalAmount);
      setIsProcessing(false);
      setStep(5);
    } catch (err: any) {
      console.error('Frame order submission error:', err);
      setSubmitError('Network connection error. Please verify your connection and try again.');
      setIsProcessing(false);
    }
  };

  const handleResetOrder = () => {
    setStep(1);
    setOrderId(null);
    setServerFinalAmount(null);
    setSubmitError(null);
    setQuantity(1);
    setIsProcessing(false);
  };

  return (
    <div className="w-full">
      {/* Step Progress Header */}
      {!isProcessing && (
        <OrderProgress
          currentStep={step}
          onNavigateStep={(targetStep) => {
            if (targetStep < step && step < 5) {
              setStep(targetStep);
            }
          }}
        />
      )}

      {/* Main Order Card */}
      <div className="rounded-2xl border border-[#F3F0EA] bg-white p-3 sm:p-8 shadow-xs">
        {/* 3-Second Processing Simulation Animation */}
        {isProcessing && (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-[#F3F0EA] border-t-[#10100F] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#10100F]">
                MP
              </div>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#171717] mb-2">
              Creating your order…
            </h3>
            <p className="text-sm text-[#6B6258] max-w-sm">
              Please wait while we prepare your order details.
            </p>
          </div>
        )}

        {/* Step 1: Choose Frame Size & Finish */}
        {!isProcessing && step === 1 && (
          <FrameStep
            selectedSize={selectedSize}
            selectedFinish={selectedFinish}
            onSelectSize={handleSelectSize}
            onSelectFinish={handleSelectFinish}
            onContinue={onContinueToQuality || (() => setStep(2))}
          />
        )}

        {/* Step 2: Choose Quality Tier */}
        {!isProcessing && step === 2 && (
          <QualityStep
            selectedSize={selectedSize}
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {/* Step 3: Review Specs & Adjust Quantity */}
        {!isProcessing && step === 3 && (
          <OrderReviewStep
            selectedSize={selectedSize}
            selectedTier={selectedTier}
            selectedFinish={selectedFinish}
            quantity={quantity}
            onChangeQuantity={setQuantity}
            onEditOrder={() => setStep(1)}
            onContinueToDetails={() => setStep(4)}
          />
        )}

        {/* Processing State Animation */}
        {isProcessing && (
          <OrderProcessingState />
        )}

        {/* Step 4: Customer Details Form */}
        {!isProcessing && step === 4 && (
          <CustomerDetailsForm
            initialDetails={customer}
            productSummary={{
              productName: 'Custom Frame',
              specs: `${sizeConfig.name} · ${tierConfig.name} · ${finishConfig.name}`,
              quantity,
              totalFormatted: formatRupees(serverFinalAmount ?? totalPrice),
            }}
            onBack={() => setStep(3)}
            onSubmit={handleCustomerSubmit}
            isProcessing={isProcessing}
            submitError={submitError}
          />
        )}

        {/* Step 5: Order Confirmation Screen (with generated Order ID & WhatsApp CTA) */}
        {!isProcessing && step === 5 && orderId && (
          <OrderConfirmation
            orderId={orderId}
            customer={customer}
            productName="Custom Frame"
            selectedSize={sizeConfig.name}
            selectedTier={tierConfig.name}
            selectedFinish={finishConfig.name}
            quantity={quantity}
            totalPrice={serverFinalAmount ?? totalPrice}
            requirements={customer.requirements}
            onResetOrder={handleResetOrder}
          />
        )}
      </div>
    </div>
  );
};
