'use client';

import React, { useState } from 'react';
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
  Globe,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'zoho.com',
  'protonmail.com',
  'proton.me',
  'yandex.com',
  'yandex.ru',
  'gmx.com',
  'mail.ru',
];

export default function SignUpPage() {
  const router = useRouter();
  const { refreshProjects, setActiveProject } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFreeEmailWarning, setIsFreeEmailWarning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check email domain on change
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError(null);
    const domain = val.split('@')[1]?.toLowerCase();
    if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
      setIsFreeEmailWarning(true);
    } else {
      setIsFreeEmailWarning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
      setError(
        'Please use your company or work email address (e.g. name@company.com). Free email providers like Gmail or Yahoo are not supported for business trials.'
      );
      setIsFreeEmailWarning(true);
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
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
      await refreshProjects();

      if (data.project) {
        setActiveProject(data.project);
      }

      setTimeout(() => {
        router.push('/project-overview');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Quick demo work account login
    const demoWorkEmail = 'suraj.vishwakarma@gvilab.com';
    setEmail(demoWorkEmail);
    setFirstName('Suraj');
    setLastName('Vishwakarma');
    setPassword('WorkPassword123#');
    setIsFreeEmailWarning(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <SeRankingLogo variant="brand" width={140} height={34} />
        </Link>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1 py-0.2 rounded">
              EN
            </span>
            <span>{language}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs">
              {['English', 'Deutsch', 'Français', 'Español', 'Italiano'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    setIsLangOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-gray-700 hover:text-[#0B69FF]"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[440px] space-y-6">
          {/* Heading */}
          <div className="space-y-2 text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Start a free trial <br />
              with <span className="text-[#0B69FF]">your work</span> email
            </h1>

            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium pt-1">
              <CreditCard className="w-4 h-4 text-[#0B69FF]" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First name & Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden focus:border-[#0B69FF] focus:ring-2 focus:ring-[#0B69FF]/10 transition-all"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden focus:border-[#0B69FF] focus:ring-2 focus:ring-[#0B69FF]/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Work email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Work email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden transition-all ${
                    isFreeEmailWarning
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-gray-300 focus:border-[#0B69FF] focus:ring-2 focus:ring-[#0B69FF]/10'
                  }`}
                  required
                />
                {email && !isFreeEmailWarning && email.includes('@') && email.includes('.') && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3.5" />
                )}
              </div>

              {/* Real-time Work Email Guard */}
              {isFreeEmailWarning && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <strong>Work email required:</strong> Please use your company email (e.g. <code>name@company.com</code>). Personal addresses like Gmail or Yahoo are not accepted for trials.
                  </div>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder:text-gray-400 text-gray-900 focus:outline-hidden focus:border-[#0B69FF] focus:ring-2 focus:ring-[#0B69FF]/10 transition-all pr-11"
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isFreeEmailWarning}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || isFreeEmailWarning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0B69FF] hover:bg-[#005FE0] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating trial...</span>
                </>
              ) : (
                <span>Start 14-Day Free Trial</span>
              )}
            </button>
          </form>

          {/* Legal disclaimer */}
          <p className="text-xs text-gray-500 leading-relaxed text-center px-2">
            By clicking this button, you agree to SE Ranking&apos;s{' '}
            <a href="https://seranking.com/terms.html" target="_blank" className="text-[#0B69FF] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="https://seranking.com/privacy.html" target="_blank" className="text-[#0B69FF] hover:underline">
              Privacy Statement
            </a>
            .
          </p>

          <div className="pt-2 border-t border-gray-100 space-y-4">
            {/* Google work account button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Sign up with Google work account</span>
              {/* Google G SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

            {/* Login Link */}
            <div className="text-center text-xs text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0B69FF] font-bold hover:underline">
                Log in
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
