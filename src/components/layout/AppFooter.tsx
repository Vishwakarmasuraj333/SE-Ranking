'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <>
      <footer
        className={`border-t border-gray-200 bg-white py-3.5 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 select-none ${className}`}
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:opacity-90 flex items-center">
            <SeRankingLogo variant="brand" width={105} height={24} />
          </Link>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <button
            type="button"
            onClick={() => setIsBugModalOpen(true)}
            className="hover:text-gray-900 transition-colors cursor-pointer"
          >
            Report a bug
          </button>
          <Link
            href="/affiliate"
            className="hover:text-gray-900 transition-colors"
          >
            Affiliates
          </Link>
          <Link
            href="/api-docs"
            className="hover:text-gray-900 transition-colors"
          >
            API
          </Link>
          <Link
            href="/whats-new"
            className="hover:text-gray-900 transition-colors"
          >
            What&apos;s new
          </Link>
          <Link
            href="/help"
            className="hover:text-gray-900 transition-colors"
          >
            Help
          </Link>
        </div>
      </footer>

      {/* Internal Report a Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </>
  );
}
