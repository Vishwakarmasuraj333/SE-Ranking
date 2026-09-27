'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TopHeader } from '@/components/layout/TopHeader';
import { LeftRail } from '@/components/sidebar/LeftRail';
import { SecondarySidebar } from '@/components/sidebar/SecondarySidebar';
import { MobileDrawer } from '@/components/sidebar/MobileDrawer';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Authentication check for protected dashboard and admin routes
  useEffect(() => {
    if (isAuthOrPublicPage) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = () => {
      // Check for user session cookie or localStorage
      const hasCookie =
        typeof document !== 'undefined' &&
        (document.cookie.includes('user_email=') || document.cookie.includes('user_name='));

      const hasLocalUser =
        typeof window !== 'undefined' &&
        (localStorage.getItem('seranking_user') !== null ||
          localStorage.getItem('user_email') !== null);

      if (hasCookie || hasLocalUser) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Cleanly redirect unauthenticated visitors to login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();
  }, [pathname, isAuthOrPublicPage, router]);

  if (isAuthOrPublicPage) {
    return (
      <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
        {children}
      </div>
    );
  }

  // If waiting for auth or unauthenticated, display professional loading screen without leaking dashboard
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-10 h-10 rounded-full border-3 border-[#0B69FF]/20 border-t-[#0B69FF] animate-spin mb-4" />
        <p className="text-gray-900 font-bold text-sm">Verifying session...</p>
        <p className="text-gray-500 text-xs mt-1">Please sign in to access SE Ranking Studio.</p>
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
        </div>
      </div>
    </div>
  );
}
