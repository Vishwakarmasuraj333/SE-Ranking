'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function TrialBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#179B64] via-[#1EB274] to-[#25C080] text-white px-4 py-2 flex items-center justify-between text-xs select-none shadow-2xs z-30">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white/95 text-[12.5px]">
          10 days left. Choose your preferred subscription plan to unlock all features.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/pricing"
          className="bg-white hover:bg-gray-100 text-[#171B24] font-bold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
        >
          SEE PRICING PLANS
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white p-0.5 cursor-pointer"
          title="Dismiss trial notice"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
