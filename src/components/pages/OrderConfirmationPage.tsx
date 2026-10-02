import React from 'react';
import { CustomerDetails, FrameSizeId, FrameTierId, FrameFinish } from '../../types';
import { FRAME_SIZE_CONFIGS, FRAME_TIER_CONFIGS, FRAME_FINISHES } from '../../data/products';
import { getFramePrice } from '../../lib/pricing/pricing';
import { Container } from '../layout/Container';
import { OrderConfirmation } from '../order-flow/OrderConfirmation';

interface OrderConfirmationPageProps {
  orderId: string;
  customer: CustomerDetails;
  selectedSize: FrameSizeId;
  selectedTier: FrameTierId;
  selectedFinish: FrameFinish;
  quantity: number;
  serverFinalAmount?: number;
  requirements?: string;
  onResetOrder: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderId,
  customer,
  selectedSize,
  selectedTier,
  selectedFinish,
  quantity,
  serverFinalAmount,
  requirements,
  onResetOrder,
}) => {
  const sizeConfig = FRAME_SIZE_CONFIGS.find((s) => s.id === selectedSize) || FRAME_SIZE_CONFIGS[1];
  const tierConfig = FRAME_TIER_CONFIGS.find((t) => t.id === selectedTier) || FRAME_TIER_CONFIGS[1];
  const finishConfig = FRAME_FINISHES.find((f) => f.id === selectedFinish) || FRAME_FINISHES[0];

  const unitPrice = getFramePrice(selectedSize, selectedTier);
  const calculatedTotal = unitPrice * quantity;
  const displayTotal = typeof serverFinalAmount === 'number' && serverFinalAmount >= 0 ? serverFinalAmount : calculatedTotal;
  const activeRequirements = requirements || customer.requirements;

  return (
    <div className="bg-[#FFFDF8] py-4 sm:py-16 min-h-[70vh]">
      <Container size="default">
        <div className="rounded-xl sm:rounded-2xl border border-[#F3F0EA] bg-white p-3.5 sm:p-10 shadow-xs max-w-2xl mx-auto">
          <OrderConfirmation
            orderId={orderId}
            customer={customer}
            productName="Custom Frame"
            selectedSize={sizeConfig.name}
            selectedTier={tierConfig.name}
            selectedFinish={finishConfig.name}
            quantity={quantity}
            totalPrice={displayTotal}
            requirements={activeRequirements}
            onResetOrder={onResetOrder}
          />
        </div>
      </Container>
    </div>
  );
};
