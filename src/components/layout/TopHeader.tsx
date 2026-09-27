'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  Bell,
  MoreHorizontal,
  Menu,
  Sparkles,
  Layers,
  CreditCard,
  Compass,
  Bug,
  BookOpen,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { appWrapData } from '@/lib/appWrapData';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { GlobalShadowGuide } from '@/components/ui/GlobalShadowGuide';

export function TopHeader() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useApp();

  // Dropdown states
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Dropdown container refs to detect clicks outside accurately
  const appsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (appsRef.current && !appsRef.current.contains(target)) {
        setIsAppsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(target)) {
        setIsHelpOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Header navigation tabs with 'Start Free Trial' button in place of 'All Projects'
  const tabs = [
    { label: 'Rankings', href: '/rankings' },
    { label: 'Website Audit (Projects)', href: '/website-audit' },
    { label: 'All Locations', href: '/local-marketing' },
    { label: 'Start Free Trial', href: '/signup', isButton: true },
    { label: 'Backlink Gap Analyzer', href: '/backlinks' },
    { label: 'Local Rankings', href: '/local-marketing' },
    { label: 'Reviews', href: '/local-marketing/reviews' },
  ];

  return (
    <header className="h-[44px] bg-[#0B69FF] text-white flex items-center justify-between px-3 z-40 select-none shrink-0 relative">
      {/* ==================== LEFT SECTION: Mobile Toggle, Apps Menu, Logo, Main Tabs ==================== */}
      <div className="flex items-center gap-2.5 h-full">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="lg:hidden p-1 rounded hover:bg-white/10 text-white cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 9-dots Apps Menu */}
        <div ref={appsRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsAppsOpen(!isAppsOpen);
              setIsHelpOpen(false);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors cursor-pointer ${
              isAppsOpen ? 'bg-white/20 text-white shadow-xs' : 'text-white/90 hover:bg-white/10'
            }`}
            title="SE Ranking Apps"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
              <circle cx="2.5" cy="2.5" r="1.5" />
              <circle cx="8" cy="2.5" r="1.5" />
              <circle cx="13.5" cy="2.5" r="1.5" />
              <circle cx="2.5" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13.5" cy="8" r="1.5" />
              <circle cx="2.5" cy="13.5" r="1.5" />
              <circle cx="8" cy="13.5" r="1.5" />
              <circle cx="13.5" cy="13.5" r="1.5" />
            </svg>
          </button>

          {isAppsOpen && (
            <div className="absolute left-0 top-[calc(100%+2px)] w-60 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 py-2 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="px-3.5 py-1.5 font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                Suites &amp; Tools
              </div>

              <Link
                href="/research/ai-search"
                onClick={() => setIsAppsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 hover:bg-blue-50/70 text-gray-800 font-semibold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#0B69FF]" />
                  <span>AI Search Suite</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  New
                </span>
              </Link>

              <Link
                href="/"
                onClick={() => setIsAppsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <Layers className="w-4 h-4 text-gray-500" />
                <span>SEO Suite</span>
              </Link>

              <Link
                href="/smm"
                onClick={() => setIsAppsOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 hover:bg-purple-50 text-gray-700 font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>SMM Suite</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                  -20%
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Official Real SE Ranking Logo */}
        <Link href="/" className="flex items-center hover:opacity-95 mr-2">
          <SeRankingLogo variant="white" width={110} height={26} />
        </Link>

        {/* Top Navigation Tabs */}
        <nav className="hidden md:flex items-center h-full gap-0.5">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href === '/website-audit' && pathname.startsWith('/website-audit')) ||
              (tab.href === '/local-marketing' && pathname.startsWith('/local-marketing') && !pathname.includes('/reviews')) ||
              (tab.href === '/local-marketing/reviews' && pathname.includes('/reviews'));

            if ((tab as any).isButton) {
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="mx-1 px-3 py-1 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-md text-xs shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Start your 14-day free trial"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current text-yellow-300" />
                  <span>Start Free Trial</span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ==================== RIGHT SECTION: Help, Notifications, User SV Profile ==================== */}
      <div className="flex items-center gap-1.5 h-full">
        {/* Help Menu Dropdown */}
        <div ref={helpRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsHelpOpen(!isHelpOpen);
              setIsAppsOpen(false);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              isHelpOpen ? 'bg-white/20 text-white shadow-xs' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Help & Support"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 top-[calc(100%+2px)] w-56 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 py-1.5 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                Help &amp; Guidance
              </div>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsGuideModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-blue-50/70 hover:text-[#0B69FF] font-medium transition-colors text-left cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#0B69FF]" />
                <span>Quick-start guide</span>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsBugModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-red-50/70 hover:text-red-600 font-medium transition-colors text-left cursor-pointer"
              >
                <Bug className="w-4 h-4 text-red-500" />
                <span>Report a bug</span>
              </button>

              <a
                href="https://help.seranking.com/hc/en-us"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsHelpOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0B69FF] font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>Help Center</span>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>

              <a
                href="https://seranking.com/whats-new.html"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsHelpOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0B69FF] font-medium transition-colors cursor-pointer border-t border-gray-100 mt-1 pt-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>What&apos;s new</span>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          )}
        </div>

        {/* Notification Bell matching screenshot red 1 badge */}
        <div ref={notificationsRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsAppsOpen(false);
              setIsHelpOpen(false);
              setIsProfileOpen(false);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-full relative transition-colors cursor-pointer ${
              isNotificationsOpen ? 'bg-white/20 text-white shadow-xs' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#0B69FF]">
              {appWrapData.notifications.unread_total}
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+2px)] w-80 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 p-4 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="font-semibold text-gray-900 border-b pb-2 mb-2.5 flex items-center justify-between">
                <span>Notifications</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  {appWrapData.notifications.unread_total} New
                </span>
              </div>
              <div className="p-3 bg-red-50/60 rounded-lg border border-red-200 space-y-1">
                <div className="flex items-center gap-1.5 text-red-900 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Important message</span>
                </div>
                <p className="text-gray-700 text-[11px] leading-relaxed">
                  Your Free Trial has 10 days remaining. Upgrade now to preserve all keyword
                  rankings history and AI visibility tracker records.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile matching SV initials and appWrapData */}
        <div ref={profileRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsAppsOpen(false);
              setIsHelpOpen(false);
              setIsNotificationsOpen(false);
            }}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded transition-colors cursor-pointer ${
              isProfileOpen ? 'bg-white/20 text-white shadow-xs' : 'hover:bg-white/10 text-white'
            }`}
            title="Account & Settings"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white border border-white/30">
              SV
            </div>
            <MoreHorizontal className="w-3.5 h-3.5 text-white/80" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+2px)] w-64 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 py-2 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="px-3.5 py-2.5 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-xs">{appWrapData.account.full_name}</p>
                <p className="text-gray-500 text-[11px] font-mono mt-0.5">{appWrapData.account.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Trial: 10 days left
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {appWrapData.account.id}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {appWrapData.navigation.user_menu.map((menuItem) => (
                  <Link
                    key={menuItem.text}
                    href={menuItem.href}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0B69FF] font-medium transition-colors"
                  >
                    <span>{menuItem.text}</span>
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsBugModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium transition-colors border-t border-gray-100 mt-1 pt-1.5 cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <Bug className="w-3.5 h-3.5 text-red-500" />
                    <span>Report a bug</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals triggered from TopHeader */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      <GlobalShadowGuide
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </header>
  );
}
