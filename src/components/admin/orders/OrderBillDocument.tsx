import React from 'react';
import { PublicBillData } from '../../../types/admin';

interface OrderBillDocumentProps {
  billData: PublicBillData;
  showPrintStyles?: boolean;
}

export const OrderBillDocument: React.FC<OrderBillDocumentProps> = ({ billData, showPrintStyles = true }) => {
  const {
    orderId,
    billNumber,
    billGeneratedAt,
    createdDate,
    orderStatus,
    paymentStatus,
    paymentMethod,
    customer,
    item,
    studio,
  } = billData;

  const formattedBillDate = billGeneratedAt
    ? new Date(billGeneratedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : createdDate;

  const formattedOrderDate = createdDate
    ? new Date(createdDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : formattedBillDate;

  const unitPrice = Number(item.unitPrice) || 0;
  const quantity = Number(item.quantity) || 1;
  const subtotal = unitPrice * quantity;
  const discount = Number(item.discount) || 0;
  const finalAmount = Number(item.finalAmount) || subtotal - discount;

  return (
    <div className="momentpress-bill-root bg-white text-[#171717] p-8 sm:p-12 font-sans max-w-3xl mx-auto shadow-sm border border-neutral-200 rounded-xl print:shadow-none print:border-none print:p-0 print:max-w-none">
      {showPrintStyles && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 14mm;
            }
            @media print {
              body {
                background: #ffffff !important;
                color: #171717 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .momentpress-bill-root {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `
        }} />
      )}

      {/* Top Header: Brand & Invoice Meta */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neutral-200 pb-6 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-neutral-950">
            {studio.name || 'MOMENTPRESS'}
          </h1>
          <p className="text-xs sm:text-sm text-[#C25E34] font-medium mt-1">
            {studio.tagline || 'Your Photos. Your Story. Your Frame.'}
          </p>
          <div className="text-[11px] text-neutral-500 mt-2 space-y-0.5 font-sans leading-relaxed">
            <p>{studio.address || 'Bowbazar, Central Kolkata, West Bengal 700012'}</p>
            <p>
              WhatsApp: <span className="font-semibold text-neutral-700">+91 {studio.whatsappNumber || '7980855821'}</span>
              {' '}• Call: <span className="font-semibold text-neutral-700">+91 {studio.phone || '6291681660'}</span>
            </p>
            <p>
              Email: {studio.email || 'connect.rrstudio@gmail.com'} • IG: {studio.instagramHandle || '@_rr.studio__'}
            </p>
          </div>
        </div>

        <div className="sm:text-right bg-neutral-50 p-4 rounded-lg border border-neutral-200/80 sm:min-w-[210px] w-full sm:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C25E34] block">
            Official Invoice / Bill
          </span>
          <div className="text-base sm:text-lg font-mono font-bold text-neutral-900 mt-0.5">
            {billNumber}
          </div>
          <div className="mt-2 text-xs text-neutral-600 space-y-1 font-sans">
            <p className="flex sm:justify-end gap-2">
              <span className="text-neutral-400">Order ID:</span>
              <strong className="text-neutral-900 font-mono">{orderId}</strong>
            </p>
            <p className="flex sm:justify-end gap-2">
              <span className="text-neutral-400">Order Date:</span>
              <span className="text-neutral-800 font-medium">{formattedOrderDate}</span>
            </p>
            {billGeneratedAt && formattedBillDate !== formattedOrderDate && (
              <p className="flex sm:justify-end gap-2 text-[11px]">
                <span className="text-neutral-400">Bill Date:</span>
                <span className="text-neutral-700">{formattedBillDate}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bill To & Order Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs font-sans">
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200/70">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
            BILL TO:
          </h4>
          <p className="text-sm font-bold text-neutral-900">{customer.name || 'Valued Customer'}</p>
          <p className="text-neutral-700 font-medium mt-1">Phone: +91 {customer.mobileNumber}</p>
          <div className="text-neutral-600 mt-2 leading-relaxed">
            <p className="text-[11px] font-medium text-neutral-500">Delivery Address:</p>
            <p className="text-neutral-800">{customer.address || 'Address provided on order'}</p>
            <p className="text-neutral-800">{customer.city || 'Kolkata'} - {customer.pincode}</p>
          </div>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200/70 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              ORDER & PAYMENT STATUS
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Order Status:</span>
                <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                  {orderStatus || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Payment Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {paymentStatus || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Payment Method:</span>
                <span className="font-medium text-neutral-800">{paymentMethod || 'UPI on Delivery'}</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-200/60 mt-3 italic">
            Free digital proof verification on WhatsApp before print production.
          </div>
        </div>
      </div>

      {/* Item Summary Table */}
      <div className="my-6">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
          ORDER SUMMARY
        </h4>
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-4">Item & Description</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-neutral-900 text-sm">{item.product}</div>
                  <div className="text-neutral-600 mt-1 space-y-0.5 text-[11px]">
                    <p>• Size: <span className="font-semibold text-neutral-800">{item.size}</span></p>
                    {item.finish && item.finish !== 'N/A' && (
                      <p>• Moulding Finish: <span className="font-semibold text-neutral-800">{item.finish}</span></p>
                    )}
                    {item.quality && (
                      <p>• Paper Quality: <span className="font-semibold text-neutral-800">{item.quality}</span></p>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-neutral-800">{quantity}</td>
                <td className="py-3.5 px-4 text-right font-mono font-medium text-neutral-800">₹{unitPrice}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">₹{subtotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Customer Requirements / Notes (Only if present) */}
        {item.requirements && item.requirements.trim() && (
          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs">
            <span className="font-bold text-amber-900 block mb-0.5">Notes / Requirements:</span>
            <p className="text-amber-800 font-medium">{item.requirements}</p>
          </div>
        )}
      </div>

      {/* Pricing Breakdown (Right-aligned) */}
      <div className="flex justify-end my-6">
        <div className="w-full sm:w-72 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-neutral-800">₹{subtotal}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Promotional Discount</span>
              <span className="font-mono">-₹{discount}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-500 text-[11px]">
            <span>Delivery & Packaging</span>
            <span className="font-semibold text-emerald-600">Included / Free</span>
          </div>

          <div className="pt-2 border-t-2 border-neutral-900 flex justify-between items-baseline">
            <span className="text-sm font-extrabold text-neutral-900">TOTAL PAYABLE</span>
            <span className="text-xl font-bold font-serif text-[#C25E34]">₹{finalAmount}</span>
          </div>
        </div>
      </div>

      {/* Footer / Branding */}
      <div className="border-t border-neutral-200 pt-6 mt-8 text-center text-xs text-neutral-500 space-y-1.5 font-sans">
        <p className="font-bold text-neutral-800">Thank you for your order!</p>
        <p className="text-[11px] max-w-md mx-auto leading-relaxed">
          Handcrafted with care by MomentPress • Bowbazar, Central Kolkata, West Bengal 700012
        </p>
        <p className="text-[11px] text-[#C25E34] font-medium pt-0.5">
          WhatsApp Support: +91 {studio.whatsappNumber || '7980855821'} • Instagram: {studio.instagramHandle || '@_rr.studio__'}
        </p>
      </div>
    </div>
  );
};
