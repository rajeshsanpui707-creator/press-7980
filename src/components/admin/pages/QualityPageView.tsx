import React, { useState, useEffect } from 'react';
import {
  Sparkles,
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
import { QualityTierConfigItem } from '../../../types/admin';
import { formatRupees } from '../../../lib/pricing/pricing';

export const QualityPageView: React.FC = () => {
  const [tiers, setTiers] = useState<QualityTierConfigItem[]>(() => AdminService.getQualityTiers());
  const [editingTier, setEditingTier] = useState<QualityTierConfigItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setTiers(AdminService.getQualityTiers());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Quality tiers refreshed from server.');
    } catch {
      showError('Failed to refresh quality tiers from server.');
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

  const handleToggleActive = async (tier: QualityTierConfigItem) => {
    const updated = tiers.map((t) => (t.id === tier.id ? { ...t, active: !t.active } : t));
    setTiers(updated);
    const res = await AdminService.saveQualityTiers(updated);
    if (res.success) {
      showNotice(`Tier "${tier.name}" is now ${!tier.active ? 'active' : 'hidden'}.`);
    } else {
      showError(res.error || 'Failed to update quality tier visibility');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    setIsSaving(true);
    try {
      const origDelta = Math.max(0, Number(editingTier.originalPriceDelta ?? editingTier.priceAdjustment) || 0);
      const discDelta =
        editingTier.discountedPriceDelta !== null && editingTier.discountedPriceDelta !== undefined
          ? Math.max(0, Number(editingTier.discountedPriceDelta))
          : null;

      const normalized: QualityTierConfigItem = {
        ...editingTier,
        originalPriceDelta: origDelta,
        discountedPriceDelta: discDelta,
        priceAdjustment: editingTier.discountActive && discDelta !== null ? discDelta : origDelta,
        displayOrder: Number(editingTier.displayOrder) || 1,
      };

      const updated = tiers.map((t) => (t.id === normalized.id ? normalized : t));
      const res = await AdminService.saveQualityTiers(updated);

      if (res.success) {
        setTiers(updated);
        setEditingTier(null);
        showNotice(`Quality tier "${normalized.name}" saved to server and synced with pricing engine.`);
      } else {
        showError(res.error || 'Failed to save quality tier to server.');
      }
    } catch {
      showError('Network error while saving quality tier.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Quality & Paper Finish Tiers
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure fine art paper stocks, texture finishes, archival longevities, and unit price adjustments.
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

      {/* Quality Tiers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((tier) => {
            const origDelta = (tier.originalPriceDelta ?? tier.priceAdjustment) ?? 0;
            const effectiveDelta: number = (tier.discountActive && tier.discountedPriceDelta !== null && tier.discountedPriceDelta !== undefined
              ? tier.discountedPriceDelta
              : origDelta) ?? 0;

            return (
              <div
                key={tier.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 text-[#C25E34] flex items-center justify-center font-bold">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{tier.name}</h3>
                        <span className="text-[10px] text-gray-400 font-mono">tier: {tier.id}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        tier.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {tier.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-gray-600 leading-relaxed min-h-[40px]">
                    {tier.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-gray-400 block">Paper Stock</span>
                      <span className="font-semibold text-gray-800">{tier.paperType}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-400 block">Surface Finish</span>
                      <span className="font-semibold text-gray-800">{tier.finish}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-400 block">Archival Longevity</span>
                      <span className="font-medium text-gray-700">{tier.longevity}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Price Surcharge</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {effectiveDelta > 0 ? `+${formatRupees(effectiveDelta)}` : 'Included (₹0)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(tier)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    {tier.active ? (
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
                    onClick={() => setEditingTier({ ...tier })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="h-3 w-3 text-[#C25E34]" />
                    <span>Edit Tier</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Quality Tier: {editingTier.name}</h3>
              <button
                type="button"
                onClick={() => setEditingTier(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tier Name</label>
                <input
                  type="text"
                  required
                  value={editingTier.name}
                  onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTier.description}
                  onChange={(e) => setEditingTier({ ...editingTier, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Paper Type / Weight</label>
                  <input
                    type="text"
                    required
                    value={editingTier.paperType}
                    onChange={(e) => setEditingTier({ ...editingTier, paperType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    placeholder="e.g. 240 GSM Resin-Coated"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Surface Finish</label>
                  <input
                    type="text"
                    required
                    value={editingTier.finish}
                    onChange={(e) => setEditingTier({ ...editingTier, finish: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    placeholder="e.g. Subtle Pearl Luster"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Longevity Claim</label>
                  <input
                    type="text"
                    required
                    value={editingTier.longevity}
                    onChange={(e) => setEditingTier({ ...editingTier, longevity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    placeholder="e.g. 25+ Years Display Life"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingTier.displayOrder}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price Surcharge (₹ added to base frame price)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editingTier.originalPriceDelta ?? editingTier.priceAdjustment}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      originalPriceDelta: Number(e.target.value),
                      priceAdjustment: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              {/* Promotional Discount */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-800">Promotional Tier Surcharge Discount</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTier.discountActive || false}
                      onChange={(e) =>
                        setEditingTier({ ...editingTier, discountActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C25E34]"></div>
                  </label>
                </div>

                {editingTier.discountActive && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Discounted Surcharge (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingTier.discountedPriceDelta || ''}
                      onChange={(e) =>
                        setEditingTier({
                          ...editingTier,
                          discountedPriceDelta: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="e.g. 30"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
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
