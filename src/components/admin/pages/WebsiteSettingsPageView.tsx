import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Clock,
  IndianRupee,
  Shield,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { WebsiteSettingsData } from '../../../types/admin';

export const WebsiteSettingsPageView: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettingsData>(() => AdminService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const reload = () => {
    setSettings(AdminService.getSettings());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Website settings refreshed from server.');
    } catch {
      showError('Failed to refresh website settings.');
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
      const payload: WebsiteSettingsData = {
        ...settings,
        studioName: settings.studioName.trim(),
        tagline: settings.tagline.trim(),
        deliveryPromiseHours: Number(settings.deliveryPromiseHours) || 48,
        currency: settings.currency.trim() || 'INR',
        startingFramePrice: Number(settings.startingFramePrice) || 199,
        startingStickerPrice: Number(settings.startingStickerPrice) || 99,
        googleSearchConsoleVerification: (settings.googleSearchConsoleVerification || '').trim(),
      };

      const res = await AdminService.saveWebsiteSettings(payload);
      if (res.success) {
        setSettings(payload);
        showNotice('Website settings saved successfully to server.');
      } else {
        showError(res.error || 'Failed to save website settings.');
      }
    } catch {
      showError('Network error while saving settings.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Website Settings</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              General brand configuration, delivery turnaround commitments, and web verification identifiers.
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
        {/* Brand Identity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#C25E34]/10 text-[#C25E34] flex items-center justify-center font-bold">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Brand Identity</h2>
              <span className="text-xs text-gray-400">Displayed across website header, footer, and brand titles</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Studio / Brand Name</label>
              <input
                type="text"
                required
                value={settings.studioName}
                onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
            </div>
          </div>
        </div>

        {/* Store Operational Commitments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Operations & Baseline Prices</h2>
              <span className="text-xs text-gray-400">Displayed in trust badges and hero starting price callouts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Commitment (Hours)</label>
              <input
                type="number"
                min={1}
                required
                value={settings.deliveryPromiseHours}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryPromiseHours: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="48"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Renders "{settings.deliveryPromiseHours}h Dispatch in Kolkata"</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Starting Frame Price (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={settings.startingFramePrice}
                onChange={(e) =>
                  setSettings({ ...settings, startingFramePrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="199"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Starting Sticker Price (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={settings.startingStickerPrice}
                onChange={(e) =>
                  setSettings({ ...settings, startingStickerPrice: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="99"
              />
            </div>
          </div>
        </div>

        {/* Verification Tokens */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Webmaster Verification</h2>
              <span className="text-xs text-gray-400">Search console domain ownership verification meta tags</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Google Search Console Verification Token (Optional)
            </label>
            <input
              type="text"
              value={settings.googleSearchConsoleVerification || ''}
              onChange={(e) =>
                setSettings({ ...settings, googleSearchConsoleVerification: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              placeholder="e.g. google-site-verification=abc123xyz"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Injected automatically as &lt;meta name="google-site-verification" content="..."&gt; on all public pages.
            </span>
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
            <span>{isSaving ? 'Saving Settings...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
