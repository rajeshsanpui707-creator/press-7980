import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
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
  AlertTriangle,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';
import { FaqItem } from '../../../types/admin';

export const FaqPageView: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(() => AdminService.getFaqs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form fields
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState<boolean>(true);

  const reload = () => {
    setFaqs(AdminService.getFaqs());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await AdminService.syncFromServer();
      reload();
      showNotice('FAQ items refreshed from server.');
    } catch {
      showError('Failed to refresh FAQs from server.');
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
    setEditingFaq(null);
    setFormQuestion('');
    setFormAnswer('');
    setFormDisplayOrder(faqs.length + 1);
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormDisplayOrder(faq.displayOrder || 1);
    setFormActive(faq.active !== false);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (faq: FaqItem) => {
    const updated = faqs.map((f) =>
      f.id === faq.id ? { ...f, active: !f.active, visible: !f.active } : f
    );
    setFaqs(updated);
    const res = await AdminService.saveFaqs(updated);
    if (res.success) {
      showNotice(`Question is now ${!faq.active ? 'visible' : 'hidden'}.`);
    } else {
      showError(res.error || 'Failed to update FAQ visibility');
      reload();
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      showError('Please provide both a question and an answer.');
      return;
    }

    setIsSaving(true);
    try {
      const faqPayload: FaqItem = {
        id: editingFaq ? editingFaq.id : `FAQ-${Date.now().toString(36).toUpperCase()}`,
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        active: formActive,
        visible: formActive,
        displayOrder: Number(formDisplayOrder) || 1,
      };

      let updatedList: FaqItem[];
      if (editingFaq) {
        updatedList = faqs.map((f) => (f.id === editingFaq.id ? faqPayload : f));
      } else {
        updatedList = [...faqs, faqPayload];
      }

      const res = await AdminService.saveFaqs(updatedList);
      if (res.success) {
        setFaqs(updatedList);
        setIsModalOpen(false);
        showNotice('FAQ question saved successfully to server.');
      } else {
        showError(res.error || 'Failed to save FAQ to server.');
      }
    } catch {
      showError('Network error while saving FAQ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingFaq) return;
    setIsDeleting(true);
    try {
      const updatedList = faqs.filter((f) => f.id !== deletingFaq.id);
      const res = await AdminService.saveFaqs(updatedList);
      if (res.success) {
        setFaqs(updatedList);
        setDeletingFaq(null);
        showNotice('FAQ question removed successfully.');
      } else {
        showError(res.error || 'Failed to delete FAQ question.');
      }
    } catch {
      showError('Network error while deleting FAQ.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">FAQ Management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add, edit, reorder, and publish customer frequently asked questions rendered on the public website.
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
              <span>Add Question</span>
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

      {/* FAQ Items List */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <HelpCircle className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-800">No FAQ Questions Published</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Add common questions and answers regarding turnaround times, photo resolution, and delivery in Kolkata.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Question</span>
            </button>
          </div>
        ) : (
          faqs
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((faq) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  faq.active !== false ? 'border-gray-200' : 'border-gray-200/60 opacity-60 bg-gray-50'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-md bg-amber-50 text-[#C25E34] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      #{faq.displayOrder || 1}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">{faq.question}</h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed pl-8.5">{faq.answer}</p>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer shadow-2xs"
                    title={faq.active !== false ? 'Hide from public FAQ' : 'Make visible'}
                  >
                    {faq.active !== false ? (
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(faq)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer shadow-2xs"
                    title="Edit Question"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-[#C25E34]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingFaq(faq)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer shadow-2xs"
                    title="Delete Question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Add / Edit FAQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingFaq ? 'Edit FAQ Question' : 'Add New FAQ Question'}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. How do I send my photo for framing?"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide a clear, helpful answer..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200/80">
                  <span className="text-xs font-semibold text-gray-700">Visible</span>
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
                  <span>{isSaving ? 'Saving...' : 'Save Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFaq && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove the question{' '}
              <strong className="text-gray-900">"{deletingFaq.question}"</strong> from the website FAQ?
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingFaq(null)}
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
                <span>{isDeleting ? 'Deleting...' : 'Delete Question'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
