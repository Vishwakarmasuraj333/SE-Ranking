'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TrialBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || pathname.startsWith('/api-docs')) return null;

  return (
    <div className="bg-[#00A86B] text-white py-2 px-4 flex items-center justify-between text-xs sm:text-sm font-medium z-30 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-bold">You have 11 days of free trial left.</span>
        <span className="hidden md:inline text-white/90">
          Choose your preferred subscription plan to unlock all features.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => alert('Trial pricing plans: Essential, Pro, and Business tiers available.')}
          className="bg-white text-gray-900 font-semibold px-3 py-1 rounded text-xs hover:bg-gray-100 transition-colors uppercase tracking-wider shadow-sm"
        >
          See Pricing Plans
        </button>
      </div>
    </div>
  );
}
