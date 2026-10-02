import React, { useState, useEffect } from 'react';
import {
  Layers,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { StickerSizeConfigItem } from '../../../types/admin';
import { formatRupees } from '../../../lib/pricing/pricing';

export const StickerSizesPageView: React.FC = () => {
  const [sizes, setSizes] = useState<StickerSizeConfigItem[]>(() => AdminService.getStickerSizes());
  const [editingSize, setEditingSize] = useState<StickerSizeConfigItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setSizes(AdminService.getStickerSizes());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Sticker sizes refreshed from server.');
    } catch {
      showError('Failed to refresh sticker sizes from server.');
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

  const handleToggleActive = async (size: StickerSizeConfigItem) => {
    const updated = sizes.map((s) => (s.id === size.id ? { ...s, active: !s.active } : s));
    setSizes(updated);
    const res = await AdminService.saveStickerSizes(updated);
    if (res.success) {
      showNotice(`Sticker size "${size.name}" is now ${!size.active ? 'active' : 'hidden'}.`);
    } else {
      showError(res.error || 'Failed to update sticker size visibility');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSize) return;

    setIsSaving(true);
    try {
      const orig = Math.max(0, Number(editingSize.originalPrice) || 0);
      const disc =
        editingSize.discountedPrice !== null && editingSize.discountedPrice !== undefined
          ? Math.max(0, Number(editingSize.discountedPrice))
          : null;

      const normalized: StickerSizeConfigItem = {
        ...editingSize,
        originalPrice: orig,
        discountedPrice: disc,
        sellingPrice: editingSize.discountActive && disc !== null ? disc : orig,
        displayOrder: Number(editingSize.displayOrder) || 1,
      };

      const updated = sizes.map((s) => (s.id === normalized.id ? normalized : s));
      const res = await AdminService.saveStickerSizes(updated);

      if (res.success) {
        setSizes(updated);
        setEditingSize(null);
        showNotice(`Sticker size "${normalized.name}" saved to server and synced with pricing engine.`);
      } else {
        showError(res.error || 'Failed to save sticker size to server.');
      }
    } catch {
      showError('Network error while saving sticker size.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Sticker Sizes & Pricing</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure waterproof photo sticker dimensions, selling prices, and order engine rates.
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

      {/* Sticker Sizes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sizes
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((size) => {
            const orig: number = size.originalPrice ?? 0;
            const effective: number = (size.discountActive && size.discountedPrice ? size.discountedPrice : orig) ?? 0;

            return (
              <div
                key={size.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-rose-50 text-[#C25E34] flex items-center justify-center font-bold">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{size.name}</h3>
                        <span className="text-[11px] text-gray-400 font-mono">id: {size.id}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        size.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {size.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-gray-400 block">Dimensions</span>
                      <span className="font-semibold text-gray-800">{size.dimensions}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <span className="text-[11px] text-gray-400">Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">{formatRupees(effective)}</span>
                        {size.discountActive && size.discountedPrice && size.discountedPrice < orig && (
                          <span className="text-xs text-gray-400 line-through">{formatRupees(orig)}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Display Order</span>
                      <span className="font-mono font-medium text-gray-700">#{size.displayOrder}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(size)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    {size.active ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingSize({ ...size })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="h-3 w-3 text-[#C25E34]" />
                    <span>Edit Size</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Edit Size Modal */}
      {editingSize && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Sticker Size: {editingSize.name}</h3>
              <button
                type="button"
                onClick={() => setEditingSize(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Size Name</label>
                  <input
                    type="text"
                    required
                    value={editingSize.name}
                    onChange={(e) => setEditingSize({ ...editingSize, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    required
                    value={editingSize.dimensions}
                    onChange={(e) => setEditingSize({ ...editingSize, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    placeholder="e.g. 5 × 5 cm (2×2 in)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingSize.originalPrice}
                    onChange={(e) =>
                      setEditingSize({ ...editingSize, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingSize.displayOrder}
                    onChange={(e) =>
                      setEditingSize({ ...editingSize, displayOrder: Number(e.target.value) })
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
                      checked={editingSize.discountActive || false}
                      onChange={(e) =>
                        setEditingSize({ ...editingSize, discountActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C25E34]"></div>
                  </label>
                </div>

                {editingSize.discountActive && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Discounted Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingSize.discountedPrice || ''}
                      onChange={(e) =>
                        setEditingSize({
                          ...editingSize,
                          discountedPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="e.g. 79"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSize(null)}
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
