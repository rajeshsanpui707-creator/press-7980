import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  ShieldCheck,
  Cpu,
  Key,
} from 'lucide-react';
import { AdminService } from '../../../lib/admin/admin-service';

export const SecurityPageView: React.FC = () => {
  const currentAuthUser = AdminService.getAuthUser() || 'admin';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentAuthUser);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setErrorNotice(null);
    setTimeout(() => setNotice(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorNotice(msg);
    setTimeout(() => setErrorNotice(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showError('Current password is required to authorize credential changes.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        showError('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        showError('New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const result = await AdminService.changeCredentials(
        currentPassword,
        newPassword || undefined,
        newUsername.trim() || undefined
      );

      if (result.success) {
        showNotice('Administrative credentials updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showError(result.error || 'Failed to update administrative credentials.');
      }
    } catch {
      showError('Network error while updating credentials.');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Security & Authentication</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage administrative login credentials and inspect server-side cryptographic protection systems.
            </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credential Update Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#C25E34]/10 text-[#C25E34] flex items-center justify-center font-bold">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Change Admin Credentials</h2>
              <span className="text-xs text-gray-400">Requires your current password to authorize updates</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span>Administrator Username</span>
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-gray-400" />
                <span>Current Password (Required)</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to authorize changes"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-gray-400" />
                  <span>New Password (Optional)</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-gray-400" />
                  <span>Confirm New Password</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#C25E34]/20 focus:border-[#C25E34]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C25E34] text-white text-xs font-semibold hover:bg-[#A94C24] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? 'Updating...' : 'Update Credentials'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Architecture Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Security Controls</h3>
            </div>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="font-semibold text-emerald-900 block">Cryptographic Hash</span>
                <span className="text-[11px] text-emerald-700">
                  PBKDF2 with SHA-256 + 10,000 iterations and unique random salts. Passwords are never stored in plaintext.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="font-semibold text-blue-900 block">256-Bit Session Tokens</span>
                <span className="text-[11px] text-blue-700">
                  Cryptographically secure random hexadecimal tokens validated per request.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-100">
                <span className="font-semibold text-purple-900 block">Brute-Force Rate Limiting</span>
                <span className="text-[11px] text-purple-700">
                  Admin login routes enforce strict 5-attempt limits with automated cooldown.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="font-semibold text-amber-900 block">Data Isolation</span>
                <span className="text-[11px] text-amber-700">
                  Orders, customer details, and sessions are stripped from public configuration endpoints.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
