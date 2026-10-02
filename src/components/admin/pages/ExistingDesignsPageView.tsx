import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { ExistingDesignItem } from '../../../types/admin';
import { getSafeImageSource, getFallbackImageSource, parseGoogleDriveUrl } from '../../../lib/drive/google-drive';

interface AdminDesignCardImageProps {
  design: ExistingDesignItem;
}

const AdminDesignCardImage: React.FC<AdminDesignCardImageProps> = ({ design }) => {
  const rawUrl = design.driveUrl || design.googleDriveLink || design.image || '';
  const primarySrc = getSafeImageSource(rawUrl);
  const fallbackSrc = getFallbackImageSource(rawUrl);

  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(primarySrc ? 'loading' : 'error');
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    const src = getSafeImageSource(rawUrl);
    setCurrentSrc(src);
    setLoadState(src ? 'loading' : 'error');
    setHasTriedFallback(false);
  }, [rawUrl]);

  const handleError = () => {
    if (!hasTriedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setLoadState('error');
    }
  };

  return (
    <div className="relative aspect-4/3 bg-gray-100 overflow-hidden border-b border-gray-100 group/img">
      {/* Loading Shimmer */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin text-[#C25E34]" />
            <span className="text-[10px] font-medium">Resolving Drive image...</span>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {currentSrc && loadState !== 'error' && (
        <img
          src={currentSrc}
          alt={design.title || design.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setLoadState('loaded')}
          onError={handleError}
        />
      )}

      {/* Error / Private Fallback State (No fake "Your Photo Here") */}
      {loadState === 'error' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gray-50 border border-gray-200/50">
          <AlertTriangle className="h-5 w-5 text-amber-500 mb-1" />
          <span className="text-xs font-bold text-gray-800">Preview unavailable</span>
          <span className="text-[10px] text-gray-500 mt-0.5 max-w-[190px] leading-tight">
            Make this Drive file accessible to "Anyone with the link can view".
          </span>
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-gray-200 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
            >
              <span>Open in Drive</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </a>
          )}
        </div>
      )}

      {/* Direct Open Drive Link Hover Button */}
      {rawUrl && loadState === 'loaded' && (
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original Drive link in new tab"
          className="absolute top-2.5 left-2.5 z-20 p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-opacity opacity-0 group-hover/img:opacity-100 cursor-pointer shadow-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {/* Active Status Badge */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-xs ${
            design.active !== false
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-700 text-gray-200'
          }`}
        >
          {design.active !== false ? 'Live' : 'Hidden'}
        </span>
      </div>

      {/* Display Order Badge */}
      <div className="absolute bottom-2.5 left-2.5 z-20">
        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
          Order #{design.displayOrder}
        </span>
      </div>
    </div>
  );
};

const AdminModalDrivePreview: React.FC<{ url: string }> = ({ url }) => {
  const parsed = parseGoogleDriveUrl(url);
  const primarySrc = getSafeImageSource(url);
  const fallbackSrc = getFallbackImageSource(url);

  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(primarySrc ? 'loading' : 'error');
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  useEffect(() => {
    const src = getSafeImageSource(url);
    setCurrentSrc(src);
    setLoadState(src ? 'loading' : 'error');
    setHasTriedFallback(false);
  }, [url]);

  const handleError = () => {
    if (!hasTriedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setLoadState('error');
    }
  };

  if (!url.trim()) return null;

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
      <div className="flex items-center justify-between">
        {parsed.isValid ? (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {parsed.id ? 'Valid Google Drive Link Detected' : 'Standard Web Image URL'}
          </span>
        ) : (
          <span className="text-rose-600 font-medium flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> Invalid or unrecognized URL
          </span>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#C25E34] hover:underline flex items-center gap-1 font-medium"
        >
          <span>Test link</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {parsed.id && (
        <span className="text-[11px] text-gray-500 block font-mono">
          Extracted File ID: {parsed.id}
        </span>
      )}

      {/* Live Render Box */}
      <div className="relative aspect-16/9 max-w-[240px] rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
        {loadState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <RefreshCw className="h-4 w-4 animate-spin text-[#C25E34]" />
          </div>
        )}

        {currentSrc && loadState !== 'error' && (
          <img
            src={currentSrc}
            alt="Drive Preview"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setLoadState('loaded')}
            onError={handleError}
          />
        )}

        {loadState === 'error' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gray-50">
            <AlertTriangle className="h-4 w-4 text-amber-500 mb-1" />
            <span className="text-[11px] font-semibold text-gray-800">Preview unavailable</span>
            <span className="text-[10px] text-gray-500 mt-0.5 leading-tight">
              Ensure Google Drive file permission is set to "Anyone with the link can view".
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ExistingDesignsPageView: React.FC = () => {
  const [designs, setDesigns] = useState<ExistingDesignItem[]>(() => AdminService.getExistingDesigns());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<ExistingDesignItem | null>(null);
  const [deletingDesign, setDeletingDesign] = useState<ExistingDesignItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Portrait');
  const [formGoogleDriveLink, setFormGoogleDriveLink] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formSize, setFormSize] = useState('8×10 in');
  const [formFinish, setFormFinish] = useState('Studio Velvet');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState<boolean>(true);

  const reload = () => {
    setDesigns(AdminService.getExistingDesigns());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('Existing designs refreshed from server.');
    } catch {
      showError('Failed to refresh designs from server.');
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

  const handleOpenAdd = () => {
    setEditingDesign(null);
    setFormTitle('');
    setFormCategory('Portrait');
    setFormGoogleDriveLink('');
    setFormShortDescription('');
    setFormSize('8×10 in');
    setFormFinish('Studio Velvet');
    setFormDisplayOrder(designs.length + 1);
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (design: ExistingDesignItem) => {
    setEditingDesign(design);
    setFormTitle(design.title || design.name);
    setFormCategory(design.category || 'Portrait');
    setFormGoogleDriveLink(design.driveUrl || design.googleDriveLink || design.image || '');
    setFormShortDescription(design.shortDescription || design.description || '');
    setFormSize(design.size || '8×10 in');
    setFormFinish(design.finish || 'Studio Velvet');
    setFormDisplayOrder(design.displayOrder || 1);
    setFormActive(design.active !== false);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (design: ExistingDesignItem) => {
    const updated = designs.map((d) =>
      d.id === design.id ? { ...d, active: !d.active, visible: !d.active } : d
    );
    setDesigns(updated);
    const res = await AdminService.saveExistingDesigns(updated);
    if (res.success) {
      showNotice(`Design "${design.title || design.name}" is now ${!design.active ? 'visible' : 'hidden'}.`);
    } else {
      showError(res.error || 'Failed to update visibility.');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showError('Please provide a title for the design.');
      return;
    }

    setIsSaving(true);
    try {
      const designPayload: ExistingDesignItem = {
        id: editingDesign ? editingDesign.id : `DSG-${Date.now().toString(36).toUpperCase()}`,
        name: formTitle.trim(),
        title: formTitle.trim(),
        category: formCategory,
        googleDriveLink: formGoogleDriveLink.trim(),
        driveUrl: formGoogleDriveLink.trim(),
        image: formGoogleDriveLink.trim(),
        shortDescription: formShortDescription.trim(),
        description: formShortDescription.trim() || `${formSize} frame with ${formFinish} finish.`,
        size: formSize,
        finish: formFinish,
        active: formActive,
        visible: formActive,
        displayOrder: Number(formDisplayOrder) || 1,
      };

      let updatedList: ExistingDesignItem[];
      if (editingDesign) {
        updatedList = designs.map((d) => (d.id === editingDesign.id ? designPayload : d));
      } else {
        updatedList = [...designs, designPayload];
      }

      const res = await AdminService.saveExistingDesigns(updatedList);
      if (res.success) {
        setDesigns(updatedList);
        setIsModalOpen(false);
        showNotice(`Design "${designPayload.title}" saved successfully to server.`);
      } else {
        showError(res.error || 'Failed to save design to server.');
      }
    } catch {
      showError('Network error while saving design.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDesign) return;
    setIsDeleting(true);
    try {
      const updatedList = designs.filter((d) => d.id !== deletingDesign.id);
      const res = await AdminService.saveExistingDesigns(updatedList);
      if (res.success) {
        setDesigns(updatedList);
        setDeletingDesign(null);
        showNotice(`Design "${deletingDesign.title || deletingDesign.name}" deleted successfully.`);
      } else {
        showError(res.error || 'Failed to delete design from server.');
      }
    } catch {
      showError('Network error while deleting design.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Live validator for Google Drive link in modal
  const driveParseResult = formGoogleDriveLink.trim()
    ? parseGoogleDriveUrl(formGoogleDriveLink.trim())
    : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Existing Designs CMS</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Curate customer portfolio pieces, gallery samples, and Google Drive image links for public showcase.
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
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Design</span>
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

      {/* Designs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {designs.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ImageIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No Existing Designs in Gallery</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Add your first design with a Google Drive shareable link to showcase framed memories on the website.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Design</span>
            </button>
          </div>
        ) : (
          designs
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((design) => {
              return (
                <div
                  key={design.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Image Preview Container */}
                    <AdminDesignCardImage design={design} />

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{design.title || design.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 font-semibold text-gray-600 shrink-0">
                          {design.category}
                        </span>
                      </div>

                      {design.shortDescription && (
                        <p className="text-xs text-gray-500 line-clamp-2">{design.shortDescription}</p>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>
                          {design.size} • {design.finish}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(design)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      {design.active !== false ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Show</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(design)}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer shadow-2xs"
                        title="Edit Design"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-[#C25E34]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingDesign(design)}
                        className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer shadow-2xs"
                        title="Delete Design"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Add / Edit Design Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDesign ? 'Edit Existing Design' : 'Add New Existing Design'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Design Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Wedding Keepsake — Sarat Bose Rd"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              {/* Google Drive Link Input & Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Drive Shareable Link (or image URL)
                </label>
                <input
                  type="url"
                  required
                  value={formGoogleDriveLink}
                  onChange={(e) => setFormGoogleDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Paste any Google Drive public sharing link. File ID is automatically extracted.
                </span>

                {/* Live Validation Indicator */}
                <AdminModalDrivePreview url={formGoogleDriveLink} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                  placeholder="e.g. Natural teak wood finish with archival matting"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Family">Family</option>
                    <option value="Travel">Travel</option>
                    <option value="Landscape">Landscape</option>
                    <option value="Keepsake">Keepsake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Frame Size</label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Paper Finish</label>
                  <input
                    type="text"
                    value={formFinish}
                    onChange={(e) => setFormFinish(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/80">
                <span className="text-xs font-semibold text-gray-700">Display in Public Gallery</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C25E34]"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDesign && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-gray-900">{deletingDesign.title || deletingDesign.name}</strong> from
              the Existing Designs gallery? This will immediately remove it from the public website.
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingDesign(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Design'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
