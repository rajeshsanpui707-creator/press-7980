import React from 'react';
import { X } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | null;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  if (!isOpen || !type) return null;

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F3F0EA] px-6 py-4">
          <div id="policy-modal-title" role="heading" aria-level={2} className="font-serif text-xl font-bold text-[#171717]">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#6B6258] hover:bg-[#F3F0EA] hover:text-[#171717] focus-visible:outline-2 focus-visible:outline-[#10100F]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-zinc-600 leading-relaxed">
          {isPrivacy ? (
            <>
              <p className="font-semibold text-zinc-900">
                MomentPress Customer Photo & Privacy Commitment
              </p>
              <p>
                At MomentPress, we deeply respect the personal and intimate nature of your photographs. We follow strict privacy protocols:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Photo Confidentiality:</strong> Your uploaded images are used exclusively to generate your digital proof and produce your requested physical print and frame.
                </li>
                <li>
                  <strong>No Public Sharing:</strong> We never share, publish, or use your private photos on social media or marketing materials without your explicit, written consent.
                </li>
                <li>
                  <strong>Contact Information:</strong> Your WhatsApp phone number and delivery address are used solely for order confirmation, preview proofing, and courier dispatch.
                </li>
                <li>
                  <strong>Photo Retention:</strong> Print files are purged from our working storage after order fulfillment and confirmation of safe delivery.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold text-zinc-900">
                MomentPress Service Terms & Guarantee
              </p>
              <p>
                By placing a custom order with MomentPress, you agree to the following terms:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Digital Preview Approval:</strong> All customized frames require your WhatsApp preview approval before printing starts. Once approved, custom photo cuts cannot be canceled.
                </li>
                <li>
                  <strong>Photo Quality:</strong> The print resolution reflects the original file quality provided. Our team will advise on WhatsApp if an image resolution appears insufficient.
                </li>
                <li>
                  <strong>Transit Damage Protection:</strong> In the rare event of damage in transit, report within 24 hours of delivery with photos/video to receive an expedited replacement at no extra charge.
                </li>
                <li>
                  <strong>Delivery Timelines:</strong> Standard orders dispatch within 24–48 hours of preview approval.
                </li>
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#F3F0EA] px-6 py-3 bg-[#FCF9F3] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#10100F] px-4 py-2 text-xs font-semibold text-[#FFFDF8] hover:bg-[#080807] transition-colors focus-visible:outline-2 focus-visible:outline-[#10100F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
