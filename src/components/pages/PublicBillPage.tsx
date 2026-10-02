import React, { useEffect, useState } from 'react';
import { PublicBillData } from '../../types/admin';
import { AdminService } from '../../lib/admin/admin-service';
import { OrderBillDocument } from '../admin/orders/OrderBillDocument';
import { Printer, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

interface PublicBillPageProps {
  token: string;
  onNavigateHome?: () => void;
}

export const PublicBillPage: React.FC<PublicBillPageProps> = ({ token, onNavigateHome }) => {
  const [bill, setBill] = useState<PublicBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invoice token is missing.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    AdminService.fetchPublicBill(token)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.bill) {
          setBill(res.bill);
        } else {
          setError(res.error || 'Invoice not found or expired.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load invoice.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handlePrint = () => {
    if (!bill) return;
    const prevTitle = document.title;
    document.title = `MomentPress-Bill-${bill.orderId}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#C25E34] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-600">Retrieving official invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-gray-200 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Invoice Not Available</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {error || 'The requested invoice could not be located. Please verify the link or contact MomentPress support.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
            >
              Return to MomentPress Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-10 px-4">
      {/* Top Floating Action Bar (Hidden during Print) */}
      <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-gray-200 shadow-xs">
        <button
          onClick={() => (onNavigateHome ? onNavigateHome() : (window.location.href = '/'))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>MomentPress Home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Main A4 Document */}
      <OrderBillDocument billData={bill} />
    </div>
  );
};
