import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Star,
  Check,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { FrameSizeConfigItem } from '../../../types/admin';
import { formatRupees } from '../../../lib/pricing/pricing';

export const FrameSizesPageView: React.FC = () => {
  const [sizes, setSizes] = useState<FrameSizeConfigItem[]>(() => AdminService.getFrameSizes());
  const [editingSize, setEditingSize] = useState<FrameSizeConfigItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setSizes(AdminService.getFrameSizes());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Frame sizes refreshed from server.');
    } catch {
      showError('Failed to refresh frame sizes from server.');
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

  const handleToggleActive = async (size: FrameSizeConfigItem) => {
    const updated = sizes.map((s) => (s.id === size.id ? { ...s, active: !s.active } : s));
    setSizes(updated);
    const res = await AdminService.saveFrameSizes(updated);
    if (res.success) {
      showNotice(`Size "${size.name}" is now ${!size.active ? 'active' : 'hidden'}.`);
    } else {
      showError(res.error || 'Failed to update frame size visibility');
      reload();
    }
  };

  const handleTogglePopular = async (targetSize: FrameSizeConfigItem) => {
    const willBePopular = !targetSize.popular;
    const updated = sizes.map((s) => {
      if (s.id === targetSize.id) {
        return {
          ...s,
          popular: willBePopular,
          badge: willBePopular ? (s.badge || 'Most Popular') : (s.badge === 'Most Popular' ? undefined : s.badge),
        };
      }
      // If marking this size as Most Popular, clear Popular flag on others to keep single Most Popular
      if (willBePopular) {
        return {
          ...s,
          popular: false,
          badge: s.badge === 'Most Popular' ? undefined : s.badge,
        };
      }
      return s;
    });

    setSizes(updated);
    const res = await AdminService.saveFrameSizes(updated);
    if (res.success) {
      showNotice(
        willBePopular
          ? `Size "${targetSize.name}" is now designated as Most Popular on public website.`
          : `Removed Most Popular badge from "${targetSize.name}".`
      );
    } else {
      showError(res.error || 'Failed to update Most Popular badge');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSize) return;

    setIsSaving(true);
    try {
      const orig = Math.max(0, Number(editingSize.originalPrice ?? editingSize.basePrice) || 0);
      const disc =
        editingSize.discountedPrice !== null && editingSize.discountedPrice !== undefined
          ? Math.max(0, Number(editingSize.discountedPrice))
          : null;

      const normalized: FrameSizeConfigItem = {
        ...editingSize,
        basePrice: orig,
        originalPrice: orig,
        discountedPrice: disc,
        sellingPrice: editingSize.discountActive && disc !== null ? disc : orig,
        displayOrder: Number(editingSize.displayOrder) || 1,
      };

      let updated: FrameSizeConfigItem[];
      if (normalized.popular) {
        updated = sizes.map((s) =>
          s.id === normalized.id
            ? normalized
            : {
                ...s,
                popular: false,
                badge: s.badge === 'Most Popular' ? undefined : s.badge,
              }
        );
      } else {
        updated = sizes.map((s) => (s.id === normalized.id ? normalized : s));
      }

      const res = await AdminService.saveFrameSizes(updated);

      if (res.success) {
        setSizes(updated);
        setEditingSize(null);
        showNotice(`Frame size "${normalized.name}" saved to server and synced with pricing engine.`);
      } else {
        showError(res.error || 'Failed to save frame size to server.');
      }
    } catch {
      showError('Network error while saving frame size.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Frame Sizes & Pricing</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Single source of truth for photo frame dimensions, base prices, discounts, and order engine calculations.
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

      {/* Frame Sizes Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Size Name & ID</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Effective Price</th>
                <th className="py-3 px-4">Badge / Highlight</th>
                <th className="py-3 px-4 text-center">Order</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
              {sizes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Maximize2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-gray-500">No frame sizes configured</p>
                  </td>
                </tr>
              ) : (
                sizes
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map((size) => {
                    const orig = size.originalPrice ?? size.basePrice;
                    const effective = size.discountActive && size.discountedPrice ? size.discountedPrice : orig;

                    return (
                      <tr key={size.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Size Name & ID */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900 text-sm block">{size.name}</span>
                          <span className="text-[11px] text-gray-400 font-mono">id: {size.id}</span>
                        </td>

                        {/* Dimensions */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-medium text-gray-800 block">{size.dimensions}</span>
                          {size.aspectRatio && (
                            <span className="text-[10px] text-gray-400">Ratio: {size.aspectRatio}</span>
                          )}
                        </td>

                        {/* Base Price */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">{formatRupees(orig)}</span>
                        </td>

                        {/* Effective Price */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm">{formatRupees(effective)}</span>
                            {size.discountActive && size.discountedPrice && size.discountedPrice < orig && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Sale
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Badge / Popular Highlight */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePopular(size)}
                            title={size.popular || size.badge === 'Most Popular' ? 'Click to unmark as Most Popular' : 'Click to set as Most Popular size'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                              size.popular || size.badge === 'Most Popular'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-2xs'
                                : size.badge
                                ? 'bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200'
                                : 'bg-gray-50 text-gray-400 border border-dashed border-gray-200 hover:border-gray-400 hover:text-gray-700'
                            }`}
                          >
                            <Star
                              className={`h-3 w-3 ${
                                size.popular || size.badge === 'Most Popular'
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-gray-400'
                              }`}
                            />
                            <span>{size.badge || (size.popular ? 'Most Popular' : 'Set Popular')}</span>
                          </button>
                        </td>

                        {/* Order */}
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-700 whitespace-nowrap">
                          #{size.displayOrder}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              size.active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {size.active ? 'Active' : 'Hidden'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(size)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer"
                              title={size.active ? 'Hide from Store' : 'Make Active'}
                            >
                              {size.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-emerald-600" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSize({ ...size })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold cursor-pointer shadow-2xs"
                            >
                              <Edit2 className="h-3 w-3 text-[#C25E34]" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Size Modal */}
      {editingSize && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Frame Size: {editingSize.name}</h3>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingSize.name}
                    onChange={(e) => setEditingSize({ ...editingSize, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Dimensions Label</label>
                  <input
                    type="text"
                    required
                    value={editingSize.dimensions}
                    onChange={(e) => setEditingSize({ ...editingSize, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    placeholder="e.g. 13 × 18 cm (5×7 in)"
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
                    value={editingSize.originalPrice ?? editingSize.basePrice}
                    onChange={(e) =>
                      setEditingSize({
                        ...editingSize,
                        originalPrice: Number(e.target.value),
                        basePrice: Number(e.target.value),
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
                    value={editingSize.displayOrder}
                    onChange={(e) =>
                      setEditingSize({ ...editingSize, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={editingSize.badge || ''}
                    onChange={(e) => setEditingSize({ ...editingSize, badge: e.target.value || undefined })}
                    placeholder="e.g. Most Popular"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recommended For</label>
                  <input
                    type="text"
                    value={editingSize.recommendedFor || ''}
                    onChange={(e) => setEditingSize({ ...editingSize, recommendedFor: e.target.value })}
                    placeholder="e.g. Desk & Nightstand"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>
              {/* Most Popular Highlight Toggle */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>Designate as "Most Popular" Size</span>
                  </span>
                  <span className="text-[11px] text-amber-700 block mt-0.5">
                    Displays the prominent "Most Popular" badge above the size title in the customer frame customizer.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={editingSize.popular || false}
                    onChange={(e) => {
                      const isPop = e.target.checked;
                      setEditingSize({
                        ...editingSize,
                        popular: isPop,
                        badge: isPop
                          ? (editingSize.badge || 'Most Popular')
                          : (editingSize.badge === 'Most Popular' ? undefined : editingSize.badge),
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
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
                      Discounted Selling Price (₹)
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
