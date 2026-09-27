'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopHeader } from '@/components/layout/TopHeader';
import { TrialBanner } from '@/components/layout/TrialBanner';
import { LeftRail } from '@/components/sidebar/LeftRail';
import { SecondarySidebar } from '@/components/sidebar/SecondarySidebar';
import { MobileDrawer } from '@/components/sidebar/MobileDrawer';
import { BonusDiscountTab } from '@/components/ui/BonusDiscountTab';
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Auth, public landing pages, and standalone Project Settings Wizard have NO admin header, NO sidebar
  const isAuthOrPublicPage =
    pathname === '/' ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/for-agencies') ||
    pathname.startsWith('/agencies') ||
    pathname.startsWith('/enterprise') ||
    pathname.startsWith('/growing-business') ||
    pathname.startsWith('/small-business') ||
    pathname.startsWith('/keyword-rank-tracker') ||
    pathname.startsWith('/rank-tracker') ||
    pathname.startsWith('/keyword-tool') ||
    pathname.startsWith('/keyword-research') ||
    pathname.startsWith('/on-page-seo-checker') ||
    pathname.startsWith('/website-audit-tool') ||
    pathname.startsWith('/competitor-analysis-tool') ||
    pathname.startsWith('/competitor-analysis') ||
    pathname.startsWith('/backlink-checker') ||
    pathname.startsWith('/backlinks-checker') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/podcast') ||
    pathname.startsWith('/academy') ||
    pathname === '/api-docs/keywords' ||
    pathname === '/api-docs/backlinks' ||
    pathname === '/api-docs/domains' ||
    pathname.startsWith('/logout') ||
    pathname.startsWith('/admin.site.wizard') ||
    pathname === '/settings';

  if (isAuthOrPublicPage) {
    return (
      <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-[#F4F6F9] text-gray-900">
      {/* Top Blue Header */}
      <TopHeader />

      {/* Trial Green Gradient Banner */}
      <TrialBanner />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Icon Rail */}
        <div className="hidden lg:flex">
          <LeftRail />
        </div>

        {/* Desktop Secondary Navigation Sidebar (visible on projects, reports, api, agency pack, etc.) */}
        {!pathname.startsWith('/smm') &&
          !pathname.startsWith('/content-marketing') &&
          !pathname.startsWith('/settings') && (
            <div className="hidden lg:flex">
              <SecondarySidebar />
            </div>
          )}

        {/* Mobile Drawer */}
        <MobileDrawer />

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-white relative">
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>

          {/* Floating Vertical 10% Discount Tab & Interactive Modal */}
          <BonusDiscountTab />
        </div>
      </div>
    </div>
  );
}
