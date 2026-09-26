'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

export default function LoginPage() {
  const router = useRouter();
  const { refreshProjects } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Invalid pair username/password!');
      return;
    }

    setIsLoading(true);

    // Simulate login verification
    setTimeout(async () => {
      // If wrong password entered (for demo test)
      if (password === 'wrong') {
        setError('Invalid pair username/password!');
        setIsLoading(false);
        return;
      }

      await refreshProjects();
      router.push('/project-overview');
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setEmail('suraj.vishwakarma@gvilab.com');
    setPassword('WorkPassword123#');
    setTimeout(async () => {
      await refreshProjects();
      router.push('/project-overview');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="w-full max-w-md mx-auto pt-8 px-6 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <SeRankingLogo variant="brand" width={140} height={34} />
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[390px] space-y-5">
          {/* Title matching screenshot */}
          <h2 className="text-center text-sm font-bold text-gray-700 tracking-wider uppercase">
            SIGN IN TO YOUR ACCOUNT
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="name@company.com"
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
                placeholder="Password"
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1B66FF] hover:bg-[#0B59EE] active:bg-[#004ECC] text-white font-semibold rounded-md text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
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
                <span>Stay Logged In</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset instructions sent to your email')}
                className="text-[#1B66FF] hover:underline font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-4 text-xs text-gray-400 font-medium uppercase absolute">
              or
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
              {/* Facebook Icon */}
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-md text-sm border border-gray-300 shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              {/* Google G Icon */}
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
              <span>Sign in with Google</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleSocialLogin('LinkedIn')}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-md text-sm border border-gray-300 shadow-2xs transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              {/* LinkedIn Icon */}
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>Sign in with LinkedIn</span>
            </button>
          </div>

          {/* Footer Text */}
          <div className="pt-4 text-center space-y-3">
            <p className="text-xs text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#1B66FF] font-bold hover:underline">
                Sign Up
              </Link>
            </p>

            <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs mx-auto">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" className="text-gray-500 underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" target="_blank" className="text-gray-500 underline">
                Terms of Service
              </a>{' '}
              apply.
            </p>
          </div>
        </div>
      </main>

      {/* Language bottom selector */}
      <footer className="w-full py-4 text-center">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <span>🇬🇧</span>
            <span>{language}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {isLangOpen && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs">
              {['English', 'Deutsch', 'Français', 'Español'].map((lang) => (
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
      </footer>
    </div>
  );
}
