'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowLeft, Mail, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!captchaChecked) {
      setError('Please check the "I\'m not a robot" box.');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <SeRankingLogo variant="brand" width={140} height={34} />
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2.5 py-1.5 rounded-md shadow-2xs">
          <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
            EN
          </span>
          <span>English</span>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          <h1 className="text-center text-sm font-bold text-gray-800 tracking-wider uppercase mb-6">
            Password Recovery
          </h1>

          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Email Sent!</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                We have sent password recovery instructions to <strong className="text-gray-800">{email}</strong>. Please check your inbox and spam folder.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full inline-block py-2.5 bg-[#1B66FF] hover:bg-[#0B59EE] text-white font-semibold rounded-md text-sm transition-colors text-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Enter your work email address below and we will send you a link to reset your password.
              </p>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
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
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-hidden focus:border-[#1B66FF]"
                  required
                />
              </div>

              {/* reCAPTCHA Checkbox */}
              <div className="p-3 bg-[#F9F9F9] border border-[#D3D3D3] rounded flex items-center justify-between shadow-2xs">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={(e) => {
                      setCaptchaChecked(e.target.checked);
                      setError(null);
                    }}
                    className="w-6 h-6 rounded border-gray-400 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-gray-800">I'm not a robot</span>
                </label>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-6 h-6 text-[#1A73E8]" />
                  <span className="text-[8px] text-gray-400">reCAPTCHA</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-medium">{error}</p>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-xs font-semibold rounded-md transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Mail</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto py-6 text-center text-xs text-gray-400">
        © 2026 SE Ranking. All rights reserved.
      </footer>
    </div>
  );
}
