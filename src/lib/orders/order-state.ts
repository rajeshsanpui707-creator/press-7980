import { FrameSizeId, FrameTierId, FrameFinish, CustomerDetails } from '../../types';

export interface CustomFrameOrderState {
  selectedSize: FrameSizeId;
  selectedFinish: FrameFinish;
  selectedTier: FrameTierId;
  quantity: number;
  requirements?: string;
  customer: CustomerDetails;
  orderId: string | null;
  serverUnitPrice?: number;
  serverFinalAmount?: number;
  isProcessing: boolean;
}

const STORAGE_KEY = 'mp_custom_frame_order_v1';

export const DEFAULT_ORDER_STATE: CustomFrameOrderState = {
  selectedSize: '6x8',
  selectedFinish: 'natural-oak',
  selectedTier: 'better',
  quantity: 1,
  requirements: '',
  customer: {
    fullName: '',
    mobileNumber: '',
    address: '',
    city: '',
    pincode: '',
    requirements: '',
  },
  orderId: null,
  isProcessing: false,
};

export function getStoredOrderState(): CustomFrameOrderState {
  if (typeof window === 'undefined') return DEFAULT_ORDER_STATE;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ORDER_STATE,
      ...parsed,
      isProcessing: false, // Always reset processing on fresh load
    };
  } catch {
    return DEFAULT_ORDER_STATE;
  }
}

export function saveStoredOrderState(state: Partial<CustomFrameOrderState>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredOrderState();
    const updated = { ...current, ...state };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // quota exceeded or disabled
  }
}

export function resetStoredOrderState(): CustomFrameOrderState {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return DEFAULT_ORDER_STATE;
}
