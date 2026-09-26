'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  Bell,
  MoreHorizontal,
  Plus,
  Settings,
  User,
  CreditCard,
  LogOut,
  Menu,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';

import { appWrapData } from '@/lib/appWrapData';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

export function TopHeader() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);

  const tabs = [
    { label: 'Rankings', href: '/rankings' },
    { label: 'Website Audit (Projects)', href: '/website-audit' },
    { label: 'Competitive Research', href: '/research/ai-search' },
    { label: 'Keyword Research', href: '/research/keyword-research' },
  ];

  return (
    <header className="h-[44px] bg-[#0B69FF] text-white flex items-center justify-between px-3 z-40 select-none shrink-0">
      {/* Left: 9-dots, brand, and tabs */}
      <div className="flex items-center gap-3 h-full">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="lg:hidden p-1 rounded hover:bg-white/10 text-white"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 9-dots apps menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsAppsOpen(!isAppsOpen);
              setIsProfileOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="hidden sm:flex items-center justify-center p-1 rounded hover:bg-white/10 text-white/90 cursor-pointer"
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
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 py-2 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 font-bold text-[11px] text-gray-400 uppercase tracking-wider">
                Suites &amp; Tools
              </div>
              <Link
                href="/research/ai-search"
                onClick={() => setIsAppsOpen(false)}
                className="flex items-center justify-between px-3 py-2 hover:bg-blue-50/60 text-gray-800 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0B69FF]" />
                  <span>AI Search Suite</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                  New
                </span>
              </Link>

              <Link
                href="/"
                onClick={() => setIsAppsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 font-medium"
              >
                <Layers className="w-4 h-4 text-gray-500" />
                <span>SEO Suite</span>
              </Link>

              <Link
                href="/smm"
                onClick={() => setIsAppsOpen(false)}
                className="flex items-center justify-between px-3 py-2 hover:bg-purple-50 text-gray-700 font-medium"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>SMM Suite</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
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
        <nav className="hidden md:flex items-center h-full gap-1">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href === '/research/ai-search' && pathname.startsWith('/research')) ||
              (tab.href === '/website-audit' && pathname.startsWith('/website-audit'));

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
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

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <a
          href="https://help.seranking.com"
          target="_blank"
          rel="noreferrer"
          className="w-7 h-7 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10"
          title="Help Center"
        >
          <HelpCircle className="w-4 h-4" />
        </a>

        {/* Notification Bell matching screenshot red 1 badge */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
              setIsAppsOpen(false);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#0B69FF]">
              {appWrapData.notifications.unread_total}
            </span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 p-4 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="font-semibold text-gray-900 border-b pb-2 mb-2 flex items-center justify-between">
                <span>Notifications</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                  {appWrapData.notifications.unread_total} New
                </span>
              </div>
              <div className="p-3 bg-red-50/60 rounded-lg mb-1 border border-red-200 space-y-1">
                <div className="flex items-center gap-1.5 text-red-900 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Important message</span>
                </div>
                <p className="text-gray-700 text-[11px] leading-relaxed">
                  Your Free Trial has 12 days remaining. Upgrade now to preserve all keyword
                  rankings history and AI visibility tracker records.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile matching SV initials and appWrapData */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
              setIsAppsOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded hover:bg-white/10 text-white cursor-pointer"
            title="Account & Settings"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white border border-white/30">
              SV
            </div>
            <MoreHorizontal className="w-4 h-4 text-white/80" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 text-gray-800 z-50 py-2 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2.5 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-xs">{appWrapData.account.full_name}</p>
                <p className="text-gray-500 text-[11px] font-mono mt-0.5">{appWrapData.account.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Trial: 12 days left
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
                    className="flex items-center justify-between px-3.5 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0B69FF] transition-colors"
                  >
                    <span>{menuItem.text}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
