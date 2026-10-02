import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageCircle,
  Eye,
  X,
  Clock,
  Truck,
  XCircle,
  Package,
  Save,
  FileText,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { AdminOnlineOrder, OrderStatus, PaymentStatus, PublicBillData } from '../../../types/admin';
import { formatRupees } from '../../../lib/pricing/pricing';
import { exportToCSV } from '../../../lib/admin/export-utils';
import { OrderBillDocument } from '../orders/OrderBillDocument';

const STUDIO_PHONES = ['917980855821', '916291681660', '7980855821', '6291681660'];

function normalizeCustomerPhone(phone: string | number | undefined | null): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10 && digits.length <= 15) {
    return digits;
  }
  return null;
}

export const OrdersPageView: React.FC = () => {
  const [orders, setOrders] = useState<AdminOnlineOrder[]>(() => AdminService.getOnlineOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<AdminOnlineOrder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [previewBillData, setPreviewBillData] = useState<PublicBillData | null>(null);

  const reload = () => {
    setOrders(AdminService.getOnlineOrders());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Orders synchronized from server.');
    } catch {
      showError('Failed to refresh orders from server.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setErrorNotice(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorNotice(msg);
    setTimeout(() => setErrorNotice(null), 5000);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await AdminService.updateOrderStatus({
        orderId,
        isOffline: false,
        newStatus,
      });

      if (res.success) {
        showNotice(`Order ${orderId} status updated to ${newStatus}`);
        reload();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
      } else {
        showError(res.error || 'Failed to update order status');
      }
    } catch {
      showError('Network error while updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, newPaymentStatus: PaymentStatus) => {
    AdminService.updateOnlineOrder(orderId, { paymentStatus: newPaymentStatus });
    showNotice(`Payment status for ${orderId} updated to ${newPaymentStatus}`);
    reload();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
    }
  };

  const handleGenerateBill = async (orderId: string, regenerate = false) => {
    setIsGeneratingBill(true);
    try {
      const res = await AdminService.generateOrderBill(orderId, { regenerate });
      if (res.success && res.order) {
        setSelectedOrder(res.order);
        reload();
        showNotice(
          `Bill ${res.order.billNumber} ${regenerate ? 'regenerated' : 'generated'} successfully.`
        );
      } else {
        showError(res.error || 'Failed to generate bill.');
      }
    } catch (err: any) {
      showError(err.message || 'Error generating bill.');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const handlePreviewPdf = (order: AdminOnlineOrder) => {
    const token = AdminService.getAuthToken();
    const url = `/api/admin/orders/${encodeURIComponent(order.id)}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = async (order: AdminOnlineOrder) => {
    const token = AdminService.getAuthToken();
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/pdf?download=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        const numericSuffix = (order.id || '').replace(/^MP-/i, '');
        a.download = `MomentPress-Bill-MP-${numericSuffix || order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        return;
      }
    } catch {
      // Fallback
    }

    const fallbackUrl = `/api/admin/orders/${encodeURIComponent(order.id)}/pdf?download=true${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    window.open(fallbackUrl, '_blank');
  };

  const handleOpenDrive = (order: AdminOnlineOrder) => {
    if (order.billDriveUrl) {
      window.open(order.billDriveUrl, '_blank');
    } else {
      alert(
        order.billDriveMessage ||
          'Google Drive integration: BLOCKED — deployment/configuration required.\nLocal vector PDF has been generated and is available for preview or download.'
      );
    }
  };

  const handlePreviewBill = (order: AdminOnlineOrder) => {
    const settings = AdminService.getSettings();
    const billData: PublicBillData = {
      orderId: order.id,
      billNumber: order.billNumber || `MP-BILL-${order.id.replace(/^MP-/i, '')}`,
      billGeneratedAt: order.billGeneratedAt || new Date().toISOString(),
      createdDate: order.createdDate,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: {
        name: order.customerName,
        mobileNumber: order.mobileNumber,
        address: order.address,
        city: order.city || 'Kolkata',
        pincode: order.pincode,
      },
      item: {
        product: order.product,
        size: order.size,
        finish: (order as any).finish || (order.product?.toLowerCase().includes('sticker') ? 'N/A' : 'Standard'),
        quality: order.quality,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        discount: order.discount,
        finalAmount: order.finalAmount,
        requirements: order.requirements,
      },
      studio: {
        name: settings?.studioName || 'MomentPress',
        tagline: settings?.tagline || 'Your Photos. Your Story. Your Frame.',
        phone: settings?.phone || '6291681660',
        whatsappNumber: settings?.whatsappNumber || '7980855821',
        email: settings?.email || 'connect.rrstudio@gmail.com',
        instagramHandle: settings?.instagramHandle || '@_rr.studio__',
        instagramUrl: settings?.instagramUrl || 'https://www.instagram.com/_rr.studio__/',
        address: settings?.address || 'Bowbazar, Central Kolkata, West Bengal 700012',
        city: settings?.city || 'Kolkata',
      },
    };
    setPreviewBillData(billData);
  };

  const handleDownloadBill = (order: AdminOnlineOrder) => {
    handlePreviewBill(order);
    setTimeout(() => {
      const prevTitle = document.title;
      document.title = `MomentPress-Bill-${order.id}`;
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1500);
    }, 150);
  };

  const handleWhatsAppBill = (order: AdminOnlineOrder) => {
    const cleanPhone = normalizeCustomerPhone(order.mobileNumber);
    if (!cleanPhone || STUDIO_PHONES.includes(cleanPhone)) {
      alert('Customer phone number is missing or invalid. Please update the order contact details first.');
      return;
    }

    const billDeliveryUrl = order.billDriveUrl || `${window.location.origin}/bill/${order.billToken}`;
    const message = `Hello ${order.customerName || 'Customer'}!

Thank you for your order with MomentPress.

Here is your official bill for Order ${order.id}:

Bill No: ${order.billNumber}
Total Amount: ₹${order.finalAmount}

View / Download your Bill:
${billDeliveryUrl}

Your order is being handcrafted in our Bowbazar, Kolkata studio.

If you have any questions or need to send your photos, please reply to this chat.

Warm regards,
MomentPress Studio`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Mobile',
      'Address',
      'City',
      'Pincode',
      'Product',
      'Size',
      'Quality',
      'Quantity',
      'Unit Price (₹)',
      'Discount (₹)',
      'Final Amount (₹)',
      'Requirements',
      'Payment Method',
      'Payment Status',
      'Order Status',
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      o.createdDate || '',
      o.customerName,
      o.mobileNumber,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      o.city || 'Kolkata',
      o.pincode || '',
      o.product,
      o.size,
      o.quality,
      o.quantity,
      o.unitPrice || 0,
      o.discount || 0,
      o.finalAmount || 0,
      `"${(o.requirements || '').replace(/"/g, '""')}"`,
      o.paymentMethod || 'UPI',
      o.paymentStatus || 'Pending',
      o.orderStatus || 'Pending',
    ]);

    exportToCSV(`MomentPress-Orders-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showNotice('Orders exported successfully.');
  };

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      o.id.toLowerCase().includes(s) ||
      o.customerName.toLowerCase().includes(s) ||
      o.mobileNumber.toLowerCase().includes(s) ||
      (o.city && o.city.toLowerCase().includes(s)) ||
      o.product.toLowerCase().includes(s);

    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="h-3 w-3" /> Ready
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Processing
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <Package className="h-3 w-3" /> {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Website Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Authoritative online customer orders submitted through the public website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Notices */}
        {notice && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{notice}</span>
          </div>
        )}
        {errorNotice && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name, mobile, city..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-hidden focus:ring-1 focus:ring-[#C25E34]"
              >
                <option value="All">All Payments</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Mobile Responsive Order Cards (<md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 p-4">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-gray-500">No orders found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {search || statusFilter !== 'All' || paymentFilter !== 'All'
                  ? 'Try adjusting your search or filters.'
                  : 'Customer orders submitted on the website will appear here in real-time.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const whatsappClean = (order.mobileNumber || '').replace(/[^0-9]/g, '');
              const waUrl = `https://wa.me/91${whatsappClean}?text=${encodeURIComponent(
                `Hello ${order.customerName}, regarding your MomentPress Order #${order.id} for ${order.product} (${order.size}):`
              )}`;

              return (
                <div key={order.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-gray-900 text-xs block">{order.id}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {order.createdDate || 'Today'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {getStatusBadge(order.orderStatus)}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.paymentStatus === 'Partial'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.paymentStatus || 'Pending'}
                      </span>
                      {order.billGenerated && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {order.billNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900 block truncate">{order.customerName}</span>
                      <span className="text-[11px] text-gray-500 font-mono block">{order.mobileNumber}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-gray-900 text-sm block">
                        {formatRupees(order.finalAmount || 0)}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-sans">Qty: {order.quantity}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-600 bg-gray-50/80 rounded-lg p-2 flex items-center justify-between">
                    <span className="truncate">{order.product} · {order.size} ({order.quality})</span>
                    <span className="text-gray-400 font-normal shrink-0 ml-2">{order.city || 'Kolkata'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg ml-auto cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table Container (>=md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Product & Specs</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Bill</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-gray-500">No orders found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {search || statusFilter !== 'All' || paymentFilter !== 'All'
                        ? 'Try adjusting your search or filters.'
                        : 'Customer orders submitted on the website will appear here in real-time.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const whatsappClean = (order.mobileNumber || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/91${whatsappClean}?text=${encodeURIComponent(
                    `Hello ${order.customerName}, regarding your MomentPress Order #${order.id} for ${order.product} (${order.size}):`
                  )}`;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-900 block">{order.id}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {order.createdDate || 'Today'}
                        </span>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <span className="font-semibold text-gray-900 block">{order.customerName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-500 font-mono">{order.mobileNumber}</span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Open WhatsApp Chat"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <span className="text-[11px] text-gray-400 block truncate max-w-[200px]">
                          {order.city || 'Kolkata'}, {order.pincode}
                        </span>
                      </td>

                      {/* Product & Specs */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <span className="font-medium text-gray-900 block">{order.product}</span>
                        <span className="text-[11px] text-gray-500 block">
                          Size: <strong className="text-gray-700">{order.size}</strong> • Finish:{' '}
                          <strong className="text-gray-700">{order.quality}</strong>
                        </span>
                        {order.requirements && (
                          <span className="inline-block mt-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 truncate max-w-[220px]">
                            Req: {order.requirements}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-800 whitespace-nowrap">
                        {order.quantity}
                      </td>

                      {/* Final Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-sm block">
                          {formatRupees(order.finalAmount || 0)}
                        </span>
                        {order.discount ? (
                          <span className="text-[10px] text-emerald-600 block">
                            Disc: {formatRupees(order.discount)}
                          </span>
                        ) : null}
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(order.orderStatus)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      {/* Bill Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {order.billGenerated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{order.billNumber}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not Generated</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-gray-500" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-[#C25E34] uppercase tracking-wider">Order Details</span>
                <h3 className="text-lg font-bold text-gray-900">{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer & Delivery Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Customer Name</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Mobile / WhatsApp</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.mobileNumber}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block">Delivery Address</span>
                  <span className="font-medium text-gray-800">
                    {selectedOrder.address}, {selectedOrder.city || 'Kolkata'} - {selectedOrder.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Product & Specifications */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Item Specifications</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Product</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.product}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Frame Size</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.size}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Paper / Finish Quality</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.quality}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Quantity</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.quantity} units</span>
                </div>
              </div>

              {/* Requirements Box */}
              {selectedOrder.requirements && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500 font-semibold block text-xs mb-1">Customer Special Instructions:</span>
                  <div className="bg-amber-50/80 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs font-medium">
                    {selectedOrder.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">Final Order Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatRupees(selectedOrder.finalAmount || 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Payment Method</span>
                <span className="text-xs font-semibold text-gray-800">
                  {selectedOrder.paymentMethod || 'UPI on Delivery'}
                </span>
              </div>
            </div>

            {/* BILL / INVOICE SECTION */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C25E34]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Bill / Invoice
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Status:</span>
                  {selectedOrder.billGenerated ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Generated ({selectedOrder.billNumber})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-300">
                      Not Generated
                    </span>
                  )}
                </div>
              </div>

              {!selectedOrder.billGenerated ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-gray-600">
                    Generate an official MomentPress A4 bill with unique Bill Number, PDF download, and WhatsApp customer sharing link.
                  </p>
                  <button
                    type="button"
                    disabled={isGeneratingBill}
                    onClick={() => handleGenerateBill(selectedOrder.id, false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C25E34] text-white text-xs font-semibold rounded-lg hover:bg-[#a94f2a] transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isGeneratingBill ? 'Generating...' : 'Generate Bill'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-lg border border-amber-100">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Bill Number</span>
                      <span className="font-bold text-gray-900">{selectedOrder.billNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Generated Date</span>
                      <span className="font-medium text-gray-700">
                        {selectedOrder.billGeneratedAt
                          ? new Date(selectedOrder.billGeneratedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Google Drive</span>
                      <span className="text-[11px] font-semibold block truncate" title={selectedOrder.billDriveMessage || selectedOrder.billDriveStatus}>
                        {selectedOrder.billDriveStatus === 'VERIFIED' ? (
                          <span className="text-emerald-700">Connected & Synced</span>
                        ) : (
                          <span className="text-amber-700">BLOCKED — config required</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handlePreviewPdf(selectedOrder)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
                      title="Preview vector PDF"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>Preview PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDrive(selectedOrder)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs ${
                        selectedOrder.billDriveUrl
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                      title={selectedOrder.billDriveUrl ? 'Open PDF in Google Drive' : 'Google Drive integration required'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(selectedOrder)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
                      title="Direct download PDF file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppBill(selectedOrder)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                      title="Send bill to customer on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Bill</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGeneratingBill}
                      onClick={() => handleGenerateBill(selectedOrder.id, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      title="Regenerate PDF and update bill"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-neutral-600 ${isGeneratingBill ? 'animate-spin' : ''}`} />
                      <span>Regenerate Bill</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Modification Controls */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Update Order Status</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    disabled={isUpdatingStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]"
                  >
                    <option value="New">New</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready">Ready</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Update Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus || 'Pending'}
                    onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <a
                href={`https://wa.me/91${(selectedOrder.mobileNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi ${selectedOrder.customerName}, this is MomentPress regarding your order #${selectedOrder.id}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Preview Modal Overlay */}
      {previewBillData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Top Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs p-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C25E34]" />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Invoice Preview: {previewBillData.billNumber}</h3>
                  <p className="text-[11px] text-gray-500">Order #{previewBillData.orderId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prevTitle = document.title;
                    document.title = `MomentPress-Bill-${previewBillData.orderId}`;
                    window.print();
                    setTimeout(() => {
                      document.title = prevTitle;
                    }, 1500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>

                {selectedOrder && (
                  <button
                    type="button"
                    onClick={() => handleWhatsAppBill(selectedOrder)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp to Customer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewBillData(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bill Document View */}
            <div className="p-4 sm:p-8 bg-gray-50">
              <OrderBillDocument billData={previewBillData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
