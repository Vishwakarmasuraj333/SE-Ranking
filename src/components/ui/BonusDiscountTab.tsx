'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, Clock } from 'lucide-react';
import { appWrapData } from '@/lib/appWrapData';

export function BonusDiscountTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(appWrapData.trial_bonus_popup?.seconds_left || 244980);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(secondsLeft / (3600 * 24));
  const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const couponCode = appWrapData.trial_bonus_popup?.coupon || 'ABT10NK';

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Side Vertical Tab pinned to right edge (Exact match to SE Ranking screenshots) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF4D6A] hover:bg-[#F43F5E] text-white text-[11px] font-bold py-3.5 px-2 rounded-l-lg shadow-lg flex items-center justify-center transition-all cursor-pointer group"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          title="10% discount just for you"
        >
          <span className="tracking-wide">10% discount just for you</span>
        </button>
      </div>

      {/* Bonus Discount Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Offer details */}
            <div className="bg-linear-to-b from-rose-50 to-white pt-6 pb-4 px-6 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                Special Bonus
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">
                Get your personal <span className="text-[#FF4D6A]">10%</span> discount
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Unlock all enterprise SEO tools, AI visibility metrics, and historical rankings tracking.
              </p>
            </div>

            {/* Timer Box */}
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>Offer expires in</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="text-lg font-black text-gray-900 block leading-tight">{days}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold">Days</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="text-lg font-black text-gray-900 block leading-tight">
                      {String(hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold">Hours</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="text-lg font-black text-gray-900 block leading-tight">
                      {String(minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold">Mins</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="text-lg font-black text-gray-900 block leading-tight">
                      {String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold">Secs</span>
                  </div>
                </div>
              </div>

              {/* Coupon Box */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                  Coupon Promo Code:
                </label>
                <div
                  onClick={handleCopy}
                  className="bg-gray-100 hover:bg-gray-200/80 border-2 border-dashed border-rose-300 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <span className="font-mono text-base font-black text-gray-900 tracking-wider">
                    {couponCode}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-rose-600 font-bold">
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Click to copy</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <div className="pt-2 space-y-2">
                <a
                  href={appWrapData.trial_bonus_popup?.learn_more_url || 'https://seranking.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#FF4D6A] hover:bg-[#F43F5E] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Claim 10% Discount</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium py-1 cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
