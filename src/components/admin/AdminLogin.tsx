import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { AdminService } from '../../lib/admin/admin-service';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToWebsite,
}) => {
  const [isSetupMode, setIsSetupMode] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AdminService.checkSetupStatus().then((status) => {
      if (status.isSetupRequired) {
        setIsSetupMode(true);
      }
    });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await AdminService.login(username.trim(), password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      if (result.isSetupRequired) {
        setIsSetupMode(true);
        setError('Initial administrator setup is required. Please create your production credentials.');
      } else {
        setError(result.error || 'Invalid credentials. Access denied.');
      }
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide an administrator username or email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain both letters and numbers.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await AdminService.setupInitialCredentials(username.trim(), password);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Administrator credentials established successfully. Entering dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } else {
      setError(result.error || 'Failed to establish administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10100F] text-white shadow-sm mb-4">
            {isSetupMode ? (
              <KeyRound className="h-6 w-6 text-[#C25E34]" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-[#C25E34]" />
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
            {isSetupMode ? 'Administrator Setup' : 'MomentPress Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6258] mt-1.5">
            {isSetupMode
              ? 'Establish Secure Production Administrator Credentials'
              : 'Internal Operations, Financials & Inventory Control'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#F3F0EA] p-5 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSetupMode ? (
            /* First-Run Credential Establishment Form */
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="p-3 bg-[#FCF9F3] rounded-lg border border-[#F3F0EA] text-xs text-[#6B6258] leading-relaxed">
                <span className="font-semibold text-[#10100F]">Security Requirement: </span>
                Default credentials have been removed. Please establish a custom administrator username and a strong password (minimum 8 characters with letters and numbers).
              </div>

              <div>
                <label
                  htmlFor="setup-username"
                  className="block text-xs font-bold uppercase tracking-wider text-[#10100F] mb-1.5"
                >
                  Admin Username or Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="setup-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@momentpress.in"
                    className="w-full rounded-lg border border-[#F3F0EA] bg-[#FCF9F3]/40 py-3 pl-10 pr-4 text-sm text-[#171717] focus:border-[#10100F] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#10100F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="setup-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#10100F] mb-1.5"
                >
                  New Production Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="setup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-[#F3F0EA] bg-[#FCF9F3]/40 py-3 pl-10 pr-11 text-sm text-[#171717] focus:border-[#10100F] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#10100F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#6B6258] hover:text-[#10100F] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="setup-confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#10100F] mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="setup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-lg border border-[#F3F0EA] bg-[#FCF9F3]/40 py-3 pl-10 pr-4 text-sm text-[#171717] focus:border-[#10100F] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#10100F] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#10100F] py-3.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#2A2927] active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-3.5 w-3.5 text-[#C25E34]" />
                    <span>Save & Authorize Session</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Standard Secure Admin Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-bold uppercase tracking-wider text-[#10100F] mb-1.5"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@momentpress.in"
                    className="w-full rounded-lg border border-[#F3F0EA] bg-[#FCF9F3]/40 py-3 pl-10 pr-4 text-sm text-[#171717] focus:border-[#10100F] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#10100F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#10100F] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6B6258]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-[#F3F0EA] bg-[#FCF9F3]/40 py-3 pl-10 pr-11 text-sm text-[#171717] focus:border-[#10100F] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#10100F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#6B6258] hover:text-[#10100F] cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#10100F] py-3.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#2A2927] active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#C25E34]" />
                    <span>Authenticate Session</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#F3F0EA] text-center">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6258] hover:text-[#171717] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Customer Website</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#6B6258]/80 leading-relaxed">
          Authorized personnel only. All administrative actions and logins are cryptographically authenticated and audited.
        </p>
      </div>
    </div>
  );
};
