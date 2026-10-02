'use client';

import React, { useState } from 'react';
import { getCleanDomain } from '@/lib/projectUtils';

interface ProjectFaviconProps {
  domain?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

const BADGE_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-teal-600',
  'bg-fuchsia-600',
];

export function ProjectFavicon({
  domain,
  name,
  size = 16,
  className = 'w-4 h-4 rounded-xs shrink-0 object-contain',
  fallbackClassName,
  alt,
}: ProjectFaviconProps) {
  const [errorCount, setErrorCount] = useState(0);
  const cleanDomain = getCleanDomain(domain || name || '');

  // Generate deterministic color based on domain
  const colorIndex = cleanDomain
    ? cleanDomain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % BADGE_COLORS.length
    : 0;
  const badgeColor = BADGE_COLORS[colorIndex];
  const initial = (cleanDomain[0] || name?.[0] || 'P').toUpperCase();

  if (!cleanDomain || errorCount >= 2) {
    return (
      <div
        className={
          fallbackClassName ||
          `w-4 h-4 rounded-[3px] ${badgeColor} text-white flex items-center justify-center font-bold text-[9px] shrink-0 select-none shadow-2xs`
        }
      >
        {initial}
      </div>
    );
  }

  const src =
    errorCount === 0
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=64`
      : `https://icons.duckduckgo.com/ip2/${encodeURIComponent(cleanDomain)}.ico`;

  return (
    <img
      src={src}
      alt={alt || cleanDomain}
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrorCount((c) => c + 1)}
      className={className}
    />
  );
}
