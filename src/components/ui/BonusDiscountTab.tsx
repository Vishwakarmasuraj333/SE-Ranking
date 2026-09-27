'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

export function BonusDiscountTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Initial seconds from live SE Ranking DOM payload: 67817 seconds (~18h 50m)
  const [secondsRemaining, setSecondsRemaining] = useState(67817);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(secondsRemaining / (3600 * 24));
  const hours = Math.floor((secondsRemaining % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const handleCopy = () => {
    navigator.clipboard.writeText('ABT10NK');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* ==================== FLOATING VERTICAL RIGHT TAB ==================== */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF4D6D] hover:bg-[#F43F5E] text-white px-2.5 py-4 rounded-l-xl font-bold text-xs shadow-lg transition-transform hover:-translate-x-1 cursor-pointer select-none [writing-mode:vertical-rl] rotate-180 flex items-center justify-center tracking-wide"
          title="10% discount just for you"
        >
          10% discount just for you
        </button>
      </div>

      {/* ==================== BONUS POPUP MODAL (Exact match to SE Ranking HTML & CSS) ==================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header with Close */}
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-2 text-center">
              {/* Countdown Timer Block */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Offer expires
                </div>

                <div className="inline-flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2.5 rounded-xl shadow-2xs">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-extrabold text-[#1E293B] font-mono leading-none">
                      {days}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 mt-1">DAYS</span>
                  </div>
                  <span className="text-gray-300 font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-extrabold text-[#1E293B] font-mono leading-none">
                      {pad(hours)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 mt-1">HOURS</span>
                  </div>
                  <span className="text-gray-300 font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-extrabold text-[#1E293B] font-mono leading-none">
                      {pad(minutes)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 mt-1">MINUTES</span>
                  </div>
                  <span className="text-gray-300 font-bold">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-extrabold text-[#1E293B] font-mono leading-none">
                      {pad(seconds)}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 mt-1">SECONDS</span>
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <h3 className="text-lg font-bold text-[#1E293B] mb-1">
                Get your personal <span className="text-[#FF4D6D]">10%</span> discount
              </h3>
              <p className="text-xs text-gray-500 mb-5">
                Special limited-time bonus for your account trial period.
              </p>

              {/* Interactive Coupon Box */}
              <div className="relative mb-5">
                <div
                  onClick={handleCopy}
                  className="group relative cursor-pointer border-2 border-dashed border-[#FF4D6D]/40 hover:border-[#FF4D6D] bg-[#FFF5F7] rounded-xl p-3.5 flex items-center justify-between transition-all"
                  title="Click to copy coupon code"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#FF4D6D]" />
                    <span className="font-mono text-xl font-black tracking-widest text-[#FF4D6D]">
                      ABT10NK
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF4D6D] bg-white px-3 py-1.5 rounded-lg shadow-2xs border border-[#FF4D6D]/20 group-hover:bg-[#FF4D6D] group-hover:text-white transition-colors">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </div>
                </div>

                {copied && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] px-2.5 py-1 rounded shadow-md animate-in fade-in duration-150">
                    Copied to the clipboard
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Link
                  href="/pricing?coupon=ABT10NK"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-[#FF4D6D] hover:bg-[#F43F5E] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Apply discount to plan
                </Link>

                <div>
                  <a
                    href="https://seranking.com/personal-se-ranking-discount-10.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0B69FF] font-medium transition-colors"
                  >
                    <span>Learn more</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
