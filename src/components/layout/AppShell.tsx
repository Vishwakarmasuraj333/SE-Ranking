'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopHeader } from '@/components/layout/TopHeader';
import { LeftRail } from '@/components/sidebar/LeftRail';
import { SecondarySidebar } from '@/components/sidebar/SecondarySidebar';
import { MobileDrawer } from '@/components/sidebar/MobileDrawer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Auth & public landing pages have NO admin header, NO sidebar, NO trial banner, NO discount tab
  const isAuthOrPublicPage =
    pathname === '/' ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/logout');

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

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Icon Rail */}
        <div className="hidden lg:flex">
          <LeftRail />
        </div>

        {/* Desktop Secondary Navigation Sidebar (hidden on full-width SMM, Content Marketing, and Report Builder) */}
        {!pathname.startsWith('/smm') &&
          !pathname.startsWith('/content-marketing') &&
          !pathname.startsWith('/reports') &&
          !pathname.startsWith('/agency-pack') &&
          !pathname.startsWith('/settings') && (
            <div className="hidden lg:flex">
              <SecondarySidebar />
            </div>
          )}

        {/* Mobile Drawer */}
        <MobileDrawer />

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-white">
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
