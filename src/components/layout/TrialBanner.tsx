'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function GoogleUpdateAlertBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="w-full bg-[#E02E4C] text-white text-[11px] sm:text-xs font-normal py-1.5 px-4 flex items-center justify-between z-50 select-none shadow-xs">
      <div className="flex-1 text-center truncate px-2">
        <span>
          Seeing unusual ranking changes? A Google-side update is temporarily affecting some ranking results. We&apos;re already working on a fix.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function TrialBanner() {
  return null;
}
