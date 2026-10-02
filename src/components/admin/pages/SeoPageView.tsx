import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  FileCode,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';

export const SeoPageView: React.FC = () => {
  const [seo, setSeo] = useState(() => AdminService.getSeoSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setSeo(AdminService.getSeoSettings());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('SEO configuration refreshed from server.');
    } catch {
      showError('Failed to refresh SEO configuration.');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        seoTitle: seo.seoTitle.trim(),
        seoDescription: seo.seoDescription.trim(),
        seoKeywords: seo.seoKeywords.trim(),
        ogTitle: seo.ogTitle.trim(),
        ogDescription: seo.ogDescription.trim(),
        robotsDirective: seo.robotsDirective.trim() || 'index, follow, max-image-preview:large',
      };

      const res = await AdminService.saveSeoSettings(payload);
      if (res.success) {
        setSeo(payload);
        showNotice('SEO configuration saved successfully to server.');
      } else {
        showError(res.error || 'Failed to save SEO settings.');
      }
    } catch {
      showError('Network error while saving SEO settings.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Search Engine Optimization (SEO)</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure search engine metadata, OpenGraph preview cards, indexation rules, and structured data schemas.
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* SERP Search Preview & Meta Tags */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Search className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Google Search Results (SERP) Configuration</h2>
              <span className="text-xs text-gray-400">Controls how MomentPress appears in search results</span>
            </div>
          </div>

          {/* Google Preview Card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Search Preview</span>
            <div className="text-xs text-emerald-700 font-mono">https://momentpress.ai.studio</div>
            <div className="text-base font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1">
              {seo.seoTitle}
            </div>
            <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {seo.seoDescription}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Homepage Document Title (&lt;title&gt;)
              </label>
              <input
                type="text"
                required
                value={seo.seoTitle}
                onChange={(e) => setSeo({ ...seo, seoTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {seo.seoTitle.length} characters (Recommended: 50-60 characters)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Homepage Meta Description
              </label>
              <textarea
                rows={3}
                required
                value={seo.seoDescription}
                onChange={(e) => setSeo({ ...seo, seoDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {seo.seoDescription.length} characters (Recommended: 120-160 characters)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Meta Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={seo.seoKeywords}
                onChange={(e) => setSeo({ ...seo, seoKeywords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="custom photo frames, photo printing Kolkata, personalized gifts"
              />
            </div>
          </div>
        </div>

        {/* Social Media OpenGraph Cards */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center font-bold">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Social Media Share Preview (Open Graph)</h2>
              <span className="text-xs text-gray-400">Controls previews when links are shared on WhatsApp, Facebook, or Twitter</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">OG Share Title</label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">OG Share Description</label>
              <input
                type="text"
                value={seo.ogDescription}
                onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
            </div>
          </div>
        </div>

        {/* Robots & Security Directives */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Indexation Rules & Public Protection</h2>
              <span className="text-xs text-gray-400">Controls crawling instructions for search engines</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Public Homepage Robots Directive
            </label>
            <input
              type="text"
              value={seo.robotsDirective}
              onChange={(e) => setSeo({ ...seo, robotsDirective: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Default: index, follow, max-image-preview:large
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Privacy & Non-Indexation Guarantee</span>
            </div>
            <p className="text-[11px] text-amber-700">
              All Admin portal routes (including <code>/admin/2008/*</code>) are hard-coded to deliver{' '}
              <code>noindex, nofollow, noarchive</code> robots directives and are excluded in{' '}
              <code>robots.txt</code> and <code>sitemap.xml</code>. Admin credentials and sessions are strictly protected.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving SEO...' : 'Save SEO Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
