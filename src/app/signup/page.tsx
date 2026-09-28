'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { authLanguages, getAuthTranslation } from '@/lib/i18n/authTranslations';

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'yahoo.ca',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.es',
  'outlook.com',
  'outlook.in',
  'live.com',
  'live.in',
  'msn.com',
  'aol.com',
  'aim.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'mail.com',
  'email.com',
  'zoho.com',
  'zohomail.com',
  'protonmail.com',
  'proton.me',
  'pm.me',
  'yandex.com',
  'yandex.ru',
  'gmx.com',
  'gmx.de',
  'gmx.net',
  'web.de',
  'mail.ru',
  'inbox.ru',
  'list.ru',
  'bk.ru',
  'rediffmail.com',
  'tutanota.com',
  'tuta.io',
  'fastmail.com',
  'tempmail.com',
  '10minutemail.com',
  'throwawaymail.com',
];

export default function SignUpPage() {
  const router = useRouter();
  const { refreshProjects, setActiveProject } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Sync language with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('seranking_lang');
    if (saved && authLanguages.some((l) => l.code === saved)) {
      setSelectedLang(saved);
    }
  }, []);

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    setIsLangOpen(false);
    localStorage.setItem('seranking_lang', code);
  };

  const tAuth = getAuthTranslation(selectedLang);
  const currentLangObj = authLanguages.find((l) => l.code === selectedLang) || authLanguages[0];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFreeEmailWarning, setIsFreeEmailWarning] = useState(false);
  const [isValidWorkEmail, setIsValidWorkEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check email domain on change - strict work email enforcement
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError(null);
    const parts = val.split('@');
    if (parts.length === 2) {
      const domain = parts[1].toLowerCase().trim();
      const isFree =
        FREE_EMAIL_DOMAINS.includes(domain) ||
        ['gmail', 'googlemail', 'yahoo', 'hotmail', 'outlook', 'live', 'msn', 'icloud', 'aol'].some(
          (prefix) => domain === prefix || domain.startsWith(`${prefix}.`)
        );

      if (isFree) {
        setIsFreeEmailWarning(true);
        setIsValidWorkEmail(false);
      } else if (domain.includes('.') && domain.split('.')[1].length >= 2) {
        setIsFreeEmailWarning(false);
        setIsValidWorkEmail(true);
      } else {
        setIsFreeEmailWarning(false);
        setIsValidWorkEmail(false);
      }
    } else {
      setIsFreeEmailWarning(false);
      setIsValidWorkEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parts = email.split('@');
    const domain = parts[1]?.toLowerCase().trim();
    if (!domain || isFreeEmailWarning || FREE_EMAIL_DOMAINS.includes(domain)) {
      setError(tAuth.freeEmailWarning);
      setIsFreeEmailWarning(true);
      return;
    }

    if (!password || password.length < 8) {
      setError(tAuth.passwordMinLength);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create trial account');
      }

      setSuccessMessage('14-Day Free Trial activated! Redirecting to studio...');
      if (typeof window !== 'undefined') {
        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        localStorage.setItem('seranking_user', JSON.stringify(data.user || { email, name: `${firstName} ${lastName}`.trim() }));
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('user_name', `${firstName} ${lastName}`.trim());
      }
      if (typeof document !== 'undefined') {
        document.cookie = `seranking_auth_status=logged_in; path=/; max-age=86400;`;
        document.cookie = `user_email=${encodeURIComponent(email.trim())}; path=/; max-age=86400;`;
        document.cookie = `user_name=${encodeURIComponent(`${firstName} ${lastName}`.trim())}; path=/; max-age=86400;`;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
      }
      await refreshProjects();

      if (data.project) {
        setActiveProject(data.project);
      }

      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/projects';
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const demoWorkEmail = 'suraj.vishwakarma@gvilab.com';
    setEmail(demoWorkEmail);
    setFirstName('Suraj');
    setLastName('Vishwakarma');
    setPassword('WorkPassword123#');
    setIsFreeEmailWarning(false);
    setIsValidWorkEmail(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between select-none font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <SeRankingLogo variant="brand" width={136} height={32} />
        </Link>

        {/* 10-Language selector matching exact user screenshot */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
              {currentLangObj.short}
            </span>
            <span className="text-gray-800 font-medium">{currentLangObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in duration-100">
              {authLanguages.map((lang) => {
                const isActive = lang.code === selectedLang;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLang(lang.code)}
                    className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-[#0B69FF] font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-[#0B69FF] text-white'
                          : 'bg-gray-100 border border-gray-200 text-gray-600'
                      }`}
                    >
                      {lang.short}
                    </span>
                    <span className="truncate">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[430px] space-y-6 text-center">
          {/* Heading matching Screenshot */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {tAuth.signupTitle}{' '}
              <span className="text-[#0B69FF]">{tAuth.signupTitleHighlight}</span>
            </h1>

            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 font-semibold">
              <CreditCard className="w-4 h-4 text-[#0B69FF]" />
              <span>{tAuth.noCardNeeded}</span>
            </div>
          </div>

          {/* Form matching Screenshot */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {/* First name & Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder={tAuth.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF] transition-all bg-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={tAuth.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF] transition-all bg-white"
                  required
                />
              </div>
            </div>

            {/* Work email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder={tAuth.workEmail}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-3.5 py-3 border rounded-lg text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden transition-all bg-white ${
                    isFreeEmailWarning
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-500'
                      : 'border-gray-300 focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF]'
                  }`}
                  required
                />
                {email && !isFreeEmailWarning && email.includes('@') && email.includes('.') && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
                )}
              </div>

              {/* Real-time Work Email Guard */}
              {isFreeEmailWarning && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-tight text-[11px]">
                    <strong className="font-bold text-rose-800">Personal email not accepted:</strong> Free mailboxes like <code>@{email.split('@')[1] || 'gmail.com'}</code> are not supported for business trials. Please enter your official corporate/work email (e.g. <code>name@company.com</code>).
                  </div>
                </div>
              )}

              {isValidWorkEmail && (
                <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Work domain verified: <strong className="font-bold">@{email.split('@')[1]}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={tAuth.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF] transition-all pr-11 bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isFreeEmailWarning || !isValidWorkEmail}
              className={`w-full py-3.5 px-4 rounded-lg text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || isFreeEmailWarning || !isValidWorkEmail
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#0B69FF] hover:bg-[#005FE0] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating trial...</span>
                </>
              ) : (
                <span>{tAuth.startTrialBtn}</span>
              )}
            </button>
          </form>

          {/* Legal disclaimer matching Screenshot */}
          <p className="text-[11px] text-gray-500 leading-relaxed text-center px-1">
            {tAuth.disclaimerPrefix}{' '}
            <a href="https://seranking.com/terms.html" target="_blank" className="text-[#0B69FF] hover:underline">
              {tAuth.termsOfService}
            </a>{' '}
            and{' '}
            <a href="https://seranking.com/privacy.html" target="_blank" className="text-[#0B69FF] hover:underline">
              {tAuth.privacyStatement}
            </a>
            .
          </p>

          {/* Bottom Row: Google sign up on left, Log in on right */}
          <div className="pt-3 flex items-center justify-between text-xs border-t border-gray-100">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-950 font-medium transition-colors cursor-pointer group"
            >
              <span>{tAuth.signInWithGoogle}</span>
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </button>

            <div className="text-gray-600">
              {tAuth.alreadyHaveAccount}{' '}
              <Link href="/login" className="text-[#0B69FF] font-semibold hover:underline">
                {tAuth.logInLink}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        © 2026 SE Ranking. All rights reserved.
      </footer>
    </div>
  );
}
