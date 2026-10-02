import React, { useState, useEffect } from 'react';
import {
  Package,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { ProductConfigItem } from '../../../types/admin';
import { formatRupees } from '../../../lib/pricing/pricing';

export const ProductsPageView: React.FC = () => {
  const [products, setProducts] = useState<ProductConfigItem[]>(() => AdminService.getProductsConfig());
  const [editingProduct, setEditingProduct] = useState<ProductConfigItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setProducts(AdminService.getProductsConfig());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Products refreshed from server.');
    } catch {
      showError('Failed to refresh products from server.');
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

  const handleToggleActive = async (product: ProductConfigItem) => {
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, active: !p.active, visible: !p.active } : p
    );
    setProducts(updated);
    const res = await AdminService.saveProductsConfig(updated);
    if (res.success) {
      showNotice(`Product "${product.name}" is now ${!product.active ? 'visible' : 'hidden'}.`);
    } else {
      showError(res.error || 'Failed to update product visibility');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const orig = Math.max(0, Number(editingProduct.originalStartingPrice ?? editingProduct.startingPrice) || 0);
      const disc =
        editingProduct.discountedStartingPrice !== null && editingProduct.discountedStartingPrice !== undefined
          ? Math.max(0, Number(editingProduct.discountedStartingPrice))
          : null;

      const normalized: ProductConfigItem = {
        ...editingProduct,
        startingPrice: editingProduct.discountActive && disc !== null ? disc : orig,
        originalStartingPrice: orig,
        discountedStartingPrice: disc,
        displayOrder: Number(editingProduct.displayOrder) || 1,
      };

      const updated = products.map((p) => (p.id === normalized.id ? normalized : p));
      const res = await AdminService.saveProductsConfig(updated);

      if (res.success) {
        setProducts(updated);
        setEditingProduct(null);
        showNotice(`Product "${normalized.name}" updated successfully.`);
      } else {
        showError(res.error || 'Failed to save product to server.');
      }
    } catch {
      showError('An unexpected network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Products Catalog</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage product names, descriptions, display order, and baseline starting prices.
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
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((product) => {
          const startingPrice = product.discountActive && product.discountedStartingPrice
            ? product.discountedStartingPrice
            : product.originalStartingPrice || product.startingPrice;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-[#C25E34]/10 text-[#C25E34] flex items-center justify-center font-bold">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                      <span className="text-[11px] text-gray-400 font-mono">ID: {product.id}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      product.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {product.active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Starting Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">{formatRupees(startingPrice)}</span>
                      {product.discountActive && product.originalStartingPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatRupees(product.originalStartingPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Display Order</span>
                    <span className="text-sm font-semibold text-gray-800">#{product.displayOrder}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(product)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  {product.active ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                      <span>Hide from Store</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Make Visible</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingProduct({ ...product })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 cursor-pointer shadow-2xs"
                >
                  <Edit2 className="h-3.5 w-3.5 text-[#C25E34]" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Product: {editingProduct.name}</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  placeholder="Appears in badges and product cards"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingProduct.originalStartingPrice ?? editingProduct.startingPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalStartingPrice: Number(e.target.value),
                        startingPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingProduct.displayOrder}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Promotional Discount */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Promotional Discount</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.discountActive || false}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, discountActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C25E34]"></div>
                  </label>
                </div>

                {editingProduct.discountActive && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Discounted Starting Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingProduct.discountedStartingPrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          discountedStartingPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="e.g. 179"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
