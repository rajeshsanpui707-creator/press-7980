import React, { useState, useEffect } from 'react';
import {
  Home,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { HomepageHeroConfig, HomepageSectionConfig } from '../../../types/admin';

export const HomepagePageView: React.FC = () => {
  const [heroConfig, setHeroConfig] = useState<HomepageHeroConfig>(() =>
    AdminService.getHomepageHeroConfig()
  );
  const [sections, setSections] = useState<HomepageSectionConfig[]>(() =>
    AdminService.getHomepageSections()
  );
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingSections, setIsSavingSections] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setHeroConfig(AdminService.getHomepageHeroConfig());
    setSections(AdminService.getHomepageSections());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Homepage content refreshed from server.');
    } catch {
      showError('Failed to refresh homepage content from server.');
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

  // Save Hero Config
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    try {
      const res = await AdminService.saveHomepageHeroConfig(heroConfig);
      if (res.success) {
        showNotice('Homepage Hero Banner updated successfully.');
      } else {
        showError(res.error || 'Failed to save Hero Banner to server.');
      }
    } catch {
      showError('Network error while saving Hero Banner.');
    } finally {
      setIsSavingHero(false);
    }
  };

  // Toggle Section Visibility
  const handleToggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, visible: s.visible === false ? true : false } : s))
    );
  };

  // Move Section Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setSections((prev) => {
      const copy = [...prev].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      const current = copy[index];
      const previous = copy[index - 1];
      const tempOrder = current.displayOrder;
      current.displayOrder = previous.displayOrder;
      previous.displayOrder = tempOrder;
      return [...copy].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });
  };

  // Move Section Down
  const handleMoveDown = (index: number) => {
    const sorted = [...sections].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (index >= sorted.length - 1) return;
    setSections(() => {
      const copy = [...sorted];
      const current = copy[index];
      const next = copy[index + 1];
      const tempOrder = current.displayOrder;
      current.displayOrder = next.displayOrder;
      next.displayOrder = tempOrder;
      return [...copy].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });
  };

  // Save Sections Order & Visibility
  const handleSaveSections = async () => {
    setIsSavingSections(true);
    try {
      // Re-index displayOrder sequentially 1..N
      const sorted = [...sections].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      const sequential = sorted.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
      setSections(sequential);

      const res = await AdminService.saveHomepageSections(sequential);
      if (res.success) {
        showNotice('Homepage sections order and visibility saved to server.');
      } else {
        showError(res.error || 'Failed to save sections configuration.');
      }
    } catch {
      showError('Network error while saving sections order.');
    } finally {
      setIsSavingSections(false);
    }
  };

  const sortedSections = [...sections].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Homepage CMS</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Customize the public storefront hero headline, promotional hook badge, and section display ordering.
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

      {/* Part 1: Hero Banner Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#C25E34]/10 text-[#C25E34] flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Hero Banner Content</h2>
              <span className="text-xs text-gray-400">Controls the main welcome section at the top of the homepage</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveHero} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hero Main Heading</label>
              <input
                type="text"
                required
                value={heroConfig.heading}
                onChange={(e) => setHeroConfig({ ...heroConfig, heading: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="e.g. Your memory, beautifully framed."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subheading / Description</label>
              <textarea
                rows={2}
                required
                value={heroConfig.subheading}
                onChange={(e) => setHeroConfig({ ...heroConfig, subheading: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="e.g. Turn your favorite moments into beautiful personalized frames..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hook Badge Text</label>
              <input
                type="text"
                value={heroConfig.hookBadgeText || ''}
                onChange={(e) => setHeroConfig({ ...heroConfig, hookBadgeText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="e.g. Starting from just ₹99"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary CTA Text</label>
                <input
                  type="text"
                  value={heroConfig.ctaText}
                  onChange={(e) => setHeroConfig({ ...heroConfig, ctaText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary CTA Link</label>
                <input
                  type="text"
                  value={heroConfig.ctaLink}
                  onChange={(e) => setHeroConfig({ ...heroConfig, ctaLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSavingHero}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingHero ? 'Saving Hero...' : 'Save Hero Banner'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Part 2: Homepage Sections Order & Visibility */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Homepage Sections Order & Visibility</h2>
              <span className="text-xs text-gray-400">
                Reorder sections using arrows and toggle visibility. Public website renders in this exact order.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSections}
            disabled={isSavingSections}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSavingSections ? 'Saving Order...' : 'Save Section Order'}</span>
          </button>
        </div>

        <div className="space-y-2">
          {sortedSections.map((section, index) => {
            const isVisible = section.visible !== false;

            return (
              <div
                key={section.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isVisible ? 'bg-white border-gray-200 shadow-2xs' : 'bg-gray-50 border-gray-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg bg-gray-100 font-mono text-xs font-bold text-gray-700 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">{section.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">id: {section.id}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{section.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  {/* Reorder Buttons */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200" />
                    <button
                      type="button"
                      disabled={index === sortedSections.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSection(section.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                      isVisible
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
