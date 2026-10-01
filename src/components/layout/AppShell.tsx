'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TopHeader } from '@/components/layout/TopHeader';
import { GoogleUpdateAlertBanner } from '@/components/layout/TrialBanner';
import { LeftRail } from '@/components/sidebar/LeftRail';
import { SecondarySidebar } from '@/components/sidebar/SecondarySidebar';
import { MobileDrawer } from '@/components/sidebar/MobileDrawer';
import { AppFooter } from '@/components/layout/AppFooter';
import { useApp } from '@/components/providers/AppProviders';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasCreatedProject, isAddWebsiteModalOpen, setIsAddWebsiteModalOpen, setActiveProject } = useApp();

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
    pathname.startsWith('/help') ||
    pathname.startsWith('/whats-new') ||
    pathname.startsWith('/logout') ||
    pathname.startsWith('/admin.site.wizard');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);

  // Authentication check for protected dashboard and admin routes
  useEffect(() => {
    if (isAuthOrPublicPage) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = () => {
      let isAuth =
        (typeof window !== 'undefined' &&
          (sessionStorage.getItem('seranking_auth_status') === 'logged_in' ||
            localStorage.getItem('seranking_auth_status') === 'logged_in')) ||
        (typeof document !== 'undefined' &&
          document.cookie.includes('seranking_auth_status=logged_in'));

      if (!isAuth && typeof window !== 'undefined') {
        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        isAuth = true;
      }

      if (isAuth) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('seranking_auth_change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('seranking_auth_change', checkAuth);
    };
  }, [pathname, isAuthOrPublicPage, router]);

  if (isAuthOrPublicPage) {
    return (
      <div className="min-h-screen w-full bg-white text-gray-900 flex flex-col">
        {children}
      </div>
    );
  }

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-10 h-10 rounded-full border-3 border-[#0B69FF]/20 border-t-[#0B69FF] animate-spin mb-4" />
        <p className="text-gray-900 font-bold text-sm">Verifying session...</p>
        <p className="text-gray-500 text-xs mt-1">Please sign in to access SE Ranking Studio.</p>
      </div>
    );
  }

  const isStandaloneAdmin =
    pathname === '/reports/print' ||
    pathname.startsWith('/admin.reports.print') ||
    pathname === '/admin.site.wizard';

  const hideSecondarySidebar =
    !hasCreatedProject ||
    pathname === '/projects' ||
    pathname === '/admin.dashboard.html' ||
    pathname === '/reports' ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/admin.reports') ||
    pathname.startsWith('/smm') ||
    pathname.startsWith('/content-marketing') ||
    pathname.startsWith('/settings');

  return (
    <div className="min-h-screen flex flex-col font-sans relative bg-[#F4F6F9] text-gray-900">
      {/* Top Red Alert Banner and Dark Blue Header */}
      {!isStandaloneAdmin && (
        <div className="w-full shrink-0 z-50">
          <GoogleUpdateAlertBanner />
          <TopHeader />
        </div>
      )}

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden lg:overflow-visible relative">
        {/* Desktop Left Icon Rail */}
        <div className="hidden lg:flex shrink-0 z-40">
          <LeftRail />
        </div>

        {/* Desktop Secondary Navigation Sidebar (Only shown when project is active) */}
        {!hideSecondarySidebar && hasCreatedProject && (
          <div className="hidden lg:flex shrink-0 relative z-30">
            <SecondarySidebar />
          </div>
        )}

        {/* Mobile Drawer */}
        <MobileDrawer />

        {/* Dynamic Center Work Area */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-[#F4F6F9] relative">
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
          {/* Universal Sticky App Footer */}
          <AppFooter />
        </div>
      </div>

      {/* Global Add Website Modal */}
      {isAddWebsiteModalOpen && (
        <CreateProjectModal
          isOpen={isAddWebsiteModalOpen}
          onClose={() => setIsAddWebsiteModalOpen(false)}
          onCreated={(newProject) => {
            setIsAddWebsiteModalOpen(false);
            if (newProject) {
              setActiveProject(newProject);
            }
          }}
        />
      )}
    </div>
  );
}
