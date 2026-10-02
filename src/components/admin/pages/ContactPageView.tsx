import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Instagram,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { WebsiteSettingsData } from '../../../types/admin';

export const ContactPageView: React.FC = () => {
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
      showNotice('Contact & social details refreshed from server.');
    } catch {
      showError('Failed to refresh contact details from server.');
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
      // Validate Instagram URL formatting
      let cleanInstaUrl = settings.instagramUrl.trim();
      if (!cleanInstaUrl.startsWith('http://') && !cleanInstaUrl.startsWith('https://')) {
        cleanInstaUrl = `https://www.instagram.com/${settings.instagramHandle.replace('@', '')}/`;
      }

      const payload: WebsiteSettingsData = {
        ...settings,
        phone: settings.phone.trim(),
        whatsappNumber: settings.whatsappNumber.trim(),
        email: settings.email.trim(),
        instagramHandle: settings.instagramHandle.trim(),
        instagramUrl: cleanInstaUrl,
        address: settings.address.trim(),
        city: settings.city.trim(),
      };

      const res = await AdminService.saveSettings(payload);
      if (res.success) {
        setSettings(payload);
        showNotice('Contact & social channels saved successfully to server.');
      } else {
        showError(res.error || 'Failed to save contact channels to server.');
      }
    } catch {
      showError('Network error while saving contact settings.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Contact & Social Channels</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live customer support channels, phone numbers, WhatsApp, Instagram links, and physical studio address.
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

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Direct Customer Communication</h2>
              <span className="text-xs text-gray-400">Used for customer inquiry calls, floating badges, and order dispatch</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-gray-400" />
                <span>Call Phone Number</span>
              </label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="6291681660"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Expected studio number: 6291681660</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp Order Number</span>
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="7980855821"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Expected WhatsApp number: 7980855821</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="connect.rrstudio@gmail.com"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">connect.rrstudio@gmail.com</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5 text-pink-600" />
                <span>Instagram Handle</span>
              </label>
              <input
                type="text"
                required
                value={settings.instagramHandle}
                onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="@_rr.studio__"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">@_rr.studio__</span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                <span>Full Instagram Profile URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={settings.instagramUrl}
                  onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  placeholder="https://www.instagram.com/_rr.studio__/"
                />
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Physical Studio Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Physical Studio Location</h2>
              <span className="text-xs text-gray-400">Displayed in footer, local business schema, and proof pickup details</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Studio Address</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="Bowbazar, Central Kolkata, West Bengal 700012"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City & State</label>
              <input
                type="text"
                required
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                placeholder="Kolkata"
              />
            </div>
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
            <span>{isSaving ? 'Saving Channels...' : 'Save Contact & Social Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
