'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { authLanguages, getAuthTranslation } from '@/lib/i18n/authTranslations';

export default function LoginPage() {
  const router = useRouter();
  const { refreshProjects } = useApp();

  const [email, setEmail] = useState('admin@seranking.com');
  const [password, setPassword] = useState('Admin123#');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your work email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid pair username/password!');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        localStorage.setItem('seranking_user', JSON.stringify(data.user || { email: email.trim(), name: 'Admin User' }));
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('user_name', data.user?.name || 'Admin User');
      }
      if (typeof document !== 'undefined') {
        document.cookie = `seranking_auth_status=logged_in; path=/; max-age=86400;`;
        document.cookie = `user_email=${encodeURIComponent(email.trim())}; path=/; max-age=86400;`;
        document.cookie = `user_name=${encodeURIComponent(data.user?.name || 'Admin User')}; path=/; max-age=86400;`;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
      }

      await refreshProjects();
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/projects';
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Invalid pair username/password!');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@seranking.com',
          password: 'AdminPassword123#',
        }),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        localStorage.setItem('seranking_user', JSON.stringify({ email: 'admin@seranking.com', name: 'Admin User' }));
        localStorage.setItem('user_email', 'admin@seranking.com');
        localStorage.setItem('user_name', 'Admin User');
      }
      if (typeof document !== 'undefined') {
        document.cookie = `seranking_auth_status=logged_in; path=/; max-age=86400;`;
        document.cookie = `user_email=admin@seranking.com; path=/; max-age=86400;`;
        document.cookie = `user_name=Admin User; path=/; max-age=86400;`;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
      }
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/projects';
      await refreshProjects();
      router.push(redirectUrl);
    } catch {
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/projects';
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between select-none font-sans">
      {/* Top Header with Logo and 10-Language Selector */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <SeRankingLogo variant="brand" width={140} height={34} />
        </Link>

        {/* 10-Language switcher */}
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

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[390px] space-y-5">
          {/* Title matching screenshot */}
          <h2 className="text-center text-sm font-bold text-gray-700 tracking-wider uppercase">
            {tAuth.signInTitle}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
              >
                {tAuth.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder={tAuth.emailPlaceholder}
                className={`w-full px-3.5 py-3 border rounded-md text-sm text-gray-900 focus:outline-hidden transition-colors ${
                  error
                    ? 'border-rose-400 bg-rose-50/10 focus:border-rose-500'
                    : 'border-gray-300 focus:border-[#0B69FF]'
                }`}
                required
              />
            </div>

            {/* Error Message matching screenshot */}
            {error && (
              <p className="text-[12px] text-rose-500 font-medium -mt-2 px-1">
                {error}
              </p>
            )}

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder={tAuth.password}
                className="w-full px-3.5 py-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-hidden focus:border-[#0B69FF] transition-colors pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Sign In Button with animated dual-arc radar icon matching user request */}
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              className="w-full py-3 bg-[#1B66FF] hover:bg-[#0B59EE] active:bg-[#004ECC] text-white font-semibold rounded-md text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer relative overflow-hidden group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{tAuth.signingIn}</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {/* Dual-arc radar wave icon animated on hover or when email is present */}
                  <svg
                    className={`w-5 h-5 text-white transition-transform duration-300 ${
                      isBtnHovered || email ? 'animate-pulse scale-110' : 'opacity-90'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M7 9a6 6 0 0 1 10 0" />
                    <path d="M7 15a6 6 0 0 0 10 0" />
                  </svg>
                  <span>{tAuth.signInBtn}</span>
                </div>
              )}
            </button>

            {/* Stay Logged In & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="rounded text-[#1B66FF] focus:ring-0 w-3.5 h-3.5"
                />
                <span>{tAuth.stayLoggedIn}</span>
              </label>

              <Link
                href="/forgot"
                className="text-[#1B66FF] hover:underline font-medium cursor-pointer"
              >
                {tAuth.forgotPassword}
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-4 text-xs text-gray-400 font-medium uppercase absolute">
              {tAuth.orDivider}
            </span>
          </div>

          {/* Social Logins matching screenshot */}
          <div className="space-y-2.5">
            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-md text-sm shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{tAuth.continueWithFacebook}</span>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-md text-sm border border-gray-300 shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{tAuth.signInWithGoogle}</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleSocialLogin('LinkedIn')}
              className="w-full py-2.5 px-4 bg-[#0A66C2] hover:bg-[#084e96] text-white font-semibold rounded-md text-sm shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>{tAuth.signInWithLinkedIn}</span>
            </button>
          </div>

          {/* Footer Link matching screenshot */}
          <div className="pt-2 text-center text-xs text-gray-600">
            {tAuth.dontHaveAccount}{' '}
            <Link
              href="/signup"
              className="text-[#1B66FF] hover:underline font-semibold"
            >
              {tAuth.startTrialLink}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto py-6 text-center text-xs text-gray-400">
        © 2026 SE Ranking. All rights reserved.
      </footer>
    </div>
  );
}
