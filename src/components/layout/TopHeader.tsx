'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HelpCircle,
  Bell,
  MoreHorizontal,
  Menu,
  Sparkles,
  CreditCard,
  Compass,
  Bug,
  BookOpen,
  Gift,
  ExternalLink,
  X,
  Plus,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { appWrapData } from '@/lib/appWrapData';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { GlobalShadowGuide } from '@/components/ui/GlobalShadowGuide';
import { AppsDropdown } from '@/components/layout/AppsDropdown';

export interface HeaderTab {
  id: string;
  label: string;
  href: string;
}

const ALL_AVAILABLE_TOOLS: HeaderTab[] = [
  { id: 'rankings', label: 'Rankings', href: '/rankings' },
  { id: 'website-audit', label: 'Website Audit (Projects)', href: '/audit' },
  { id: 'all-locations', label: 'All Locations', href: '/local-marketing?tab=all-locations' },
  { id: 'all-projects', label: 'All Projects', href: '/projects' },
  { id: 'backlink-gap', label: 'Backlink Gap Analyzer', href: '/backlinks' },
  { id: 'local-rankings', label: 'Local Rankings', href: '/local-marketing?tab=overview' },
  { id: 'reviews', label: 'Reviews', href: '/local-marketing?tab=reviews' },
  { id: 'competitive-research', label: 'Competitive Research', href: '/research' },
  { id: 'ai-search', label: 'AI Search', href: '/research/ai-search' },
  { id: 'keyword-research', label: 'Keyword Research', href: '/research?tab=keywords' },
  { id: 'content-marketing', label: 'Content Marketing', href: '/content-marketing' },
  { id: 'report-builder', label: 'Report Builder', href: '/admin.reports.list.html' },
  { id: 'agency-pack', label: 'Agency Pack (White Label)', href: '/agency-pack' },
];

const DEFAULT_TABS: HeaderTab[] = [
  { id: 'rankings', label: 'Rankings', href: '/rankings' },
  { id: 'website-audit', label: 'Website Audit (Projects)', href: '/audit' },
  { id: 'all-locations', label: 'All Locations', href: '/local-marketing?tab=all-locations' },
  { id: 'all-projects', label: 'All Projects', href: '/projects' },
  { id: 'backlink-gap', label: 'Backlink Gap Analyzer', href: '/backlinks' },
  { id: 'local-rankings', label: 'Local Rankings', href: '/local-marketing?tab=overview' },
  { id: 'reviews', label: 'Reviews', href: '/local-marketing?tab=reviews' },
];

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useApp();

  // Dynamic User Profile state
  const [userProfile, setUserProfile] = useState({
    name: appWrapData.account.full_name || 'Suraj Vishwakarma',
    email: appWrapData.account.email || 'suraj.vishwakarma@gvilab.com',
    id: appWrapData.account.id || 5269343,
    initials: 'SV',
  });

  // Read user profile dynamically from session / localStorage / cookies
  useEffect(() => {
    try {
      let name = '';
      let email = '';
      let id = 5269343;

      const storedUser = localStorage.getItem('seranking_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.name) name = parsed.name;
          if (parsed.email) email = parsed.email;
          if (parsed.id) id = parsed.id;
        } catch {
          // ignore
        }
      }

      if (!name) {
        const storedName = localStorage.getItem('user_name');
        if (storedName) name = storedName;
      }
      if (!email) {
        const storedEmail = localStorage.getItem('user_email');
        if (storedEmail) email = storedEmail;
      }

      if (typeof document !== 'undefined') {
        const matchEmail = document.cookie.match(/user_email=([^;]+)/);
        if (matchEmail && !email) email = decodeURIComponent(matchEmail[1]);
        const matchName = document.cookie.match(/user_name=([^;]+)/);
        if (matchName && !name) name = decodeURIComponent(matchName[1]);
      }

      if (!name) name = appWrapData.account.full_name || 'Suraj Vishwakarma';
      if (!email) email = appWrapData.account.email || 'suraj.vishwakarma@gvilab.com';

      const parts = name.trim().split(/\s+/);
      const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase() || 'SV';

      setUserProfile({
        name,
        email,
        id,
        initials,
      });
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    if (typeof document !== 'undefined') {
      document.cookie = 'seranking_auth_status=; path=/; max-age=0;';
      document.cookie = 'user_email=; path=/; max-age=0;';
      document.cookie = 'user_name=; path=/; max-age=0;';
      document.cookie = 'user_domain=; path=/; max-age=0;';
      document.cookie = 'seranking_user=; path=/; max-age=0;';
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seranking_auth_status');
      sessionStorage.removeItem('seranking_auth_status');
      localStorage.removeItem('seranking_user');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      window.dispatchEvent(new CustomEvent('seranking_auth_change'));
    }
    router.push('/login');
  };

  // Dropdown states
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddTabOpen, setIsAddTabOpen] = useState(false);

  // Tabs state with localStorage persistence
  const [favoriteTabs, setFavoriteTabs] = useState<HeaderTab[]>(DEFAULT_TABS);
  const [hoveredCloseTabId, setHoveredCloseTabId] = useState<string | null>(null);

  // Modals
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Dropdown container refs
  const appsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const addTabRef = useRef<HTMLDivElement>(null);

  // Load favorite tabs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seranking_favorite_tabs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFavoriteTabs(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveTabs = (tabs: HeaderTab[]) => {
    setFavoriteTabs(tabs);
    try {
      localStorage.setItem('seranking_favorite_tabs', JSON.stringify(tabs));
    } catch {
      // ignore
    }
  };

  const handleRemoveTab = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favoriteTabs.filter((t) => t.id !== id);
    saveTabs(updated);
  };

  const handleAddTab = (tool: HeaderTab) => {
    if (!favoriteTabs.some((t) => t.id === tool.id)) {
      const updated = [...favoriteTabs, tool];
      saveTabs(updated);
    }
    setIsAddTabOpen(false);
  };

  const handleRestoreDefaultTabs = () => {
    saveTabs(DEFAULT_TABS);
    setIsAddTabOpen(false);
  };

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
      if (addTabRef.current && !addTabRef.current.contains(target)) {
        setIsAddTabOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-[44px] bg-[#0B69FF] text-white flex items-center justify-between px-3 z-40 select-none shrink-0 relative">
      {/* ==================== LEFT SECTION: Mobile Toggle, Apps Menu, Logo, Favorite Tabs ==================== */}
      <div className="flex items-center gap-2 h-full min-w-0">
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
              setIsAddTabOpen(false);
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

          {/* Apps Switcher Dropdown - Exact match to Screenshot */}
          <AppsDropdown
            isOpen={isAppsOpen}
            onClose={() => setIsAppsOpen(false)}
            activeApp="ranking"
            className="left-0 top-[calc(100%+6px)]"
          />
        </div>

        {/* Official Real SE Ranking Logo */}
        <Link href="/" className="flex items-center hover:opacity-95 mr-2 shrink-0">
          <SeRankingLogo variant="white" width={110} height={26} />
        </Link>

        {/* Favorite Navigation Tabs with Hover X and 'Remove from Favorites' Tooltip */}
        <nav className="hidden md:flex items-center h-full gap-0.5 overflow-x-auto no-scrollbar">
          {favoriteTabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href.startsWith('/website-audit') && pathname.startsWith('/website-audit')) ||
              (tab.href.startsWith('/audit') && pathname.startsWith('/audit')) ||
              (tab.href.startsWith('/local-marketing') && pathname.startsWith('/local-marketing') && !pathname.includes('/reviews') && !tab.href.includes('/reviews')) ||
              (tab.href.includes('/reviews') && pathname.includes('/reviews')) ||
              (tab.href.startsWith('/projects') && (pathname === '/projects' || pathname.startsWith('/project-overview'))) ||
              (tab.href.startsWith('/backlinks') && pathname.startsWith('/backlinks'));

            return (
              <div
                key={tab.id}
                className="relative group flex items-center h-full"
              >
                <Link
                  href={tab.href}
                  className={`relative flex items-center h-full px-2.5 py-1 text-[13px] font-medium transition-all cursor-pointer rounded-[4px] whitespace-nowrap ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="pr-3.5">{tab.label}</span>
                </Link>

                {/* Close X Button - appears at upper corner on hover */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveTab(tab.id, e)}
                  onMouseEnter={() => setHoveredCloseTabId(tab.id)}
                  onMouseLeave={() => setHoveredCloseTabId(null)}
                  className="absolute right-0.5 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  title="Remove from Favorites"
                >
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>

                {/* Exact Tooltip matching screenshot: "Remove from Favorites" with downward arrow right above X */}
                {hoveredCloseTabId === tab.id && (
                  <div className="absolute -top-7 right-0 bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>Remove from Favorites</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1E293B] -mb-1 mt-0.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Plus Add / Customize Favorites Button */}
          <div ref={addTabRef} className="relative flex items-center h-full">
            <button
              onClick={() => setIsAddTabOpen(!isAddTabOpen)}
              className={`p-1.5 rounded transition-colors text-white/70 hover:text-white hover:bg-white/10 cursor-pointer ${
                isAddTabOpen ? 'bg-white/20 text-white' : ''
              }`}
              title="Add or manage favorite tabs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Add Tab Popover Dropdown */}
            {isAddTabOpen && (
              <div className="absolute left-0 top-[calc(100%+3px)] w-60 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-800 z-50 py-2 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b pb-1.5 mb-1">
                  <span>Add to Favorites</span>
                  <button
                    onClick={handleRestoreDefaultTabs}
                    className="text-[#0B69FF] hover:underline flex items-center gap-1 font-semibold normal-case text-[11px] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {ALL_AVAILABLE_TOOLS.map((tool) => {
                    const isAdded = favoriteTabs.some((t) => t.id === tool.id);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          if (isAdded) {
                            saveTabs(favoriteTabs.filter((t) => t.id !== tool.id));
                          } else {
                            handleAddTab(tool);
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-blue-50/70 text-gray-700 hover:text-[#0B69FF] font-medium text-left transition-colors cursor-pointer"
                      >
                        <span className="truncate">{tool.label}</span>
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 text-[#0B69FF] shrink-0" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ==================== RIGHT SECTION: Help, Notifications, User SV Profile ==================== */}
      <div className="flex items-center gap-1.5 h-full shrink-0">
        {/* Help Menu Dropdown */}
        <div ref={helpRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsHelpOpen(!isHelpOpen);
              setIsAppsOpen(false);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
              setIsAddTabOpen(false);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              isHelpOpen ? 'bg-white/20 text-white shadow-xs' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Help & Support"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 top-[calc(100%+3px)] w-56 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-800 z-50 py-1.5 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
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
              setIsAddTabOpen(false);
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
            <div className="absolute right-0 top-[calc(100%+3px)] w-80 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-800 z-50 p-4 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
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
              setIsAddTabOpen(false);
            }}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded transition-colors cursor-pointer ${
              isProfileOpen ? 'bg-white/20 text-white shadow-xs' : 'hover:bg-white/10 text-white'
            }`}
            title="Account & Settings"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white border border-white/30">
              {userProfile.initials}
            </div>
            <MoreHorizontal className="w-3.5 h-3.5 text-white/80" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+3px)] w-60 bg-white rounded-xl shadow-xl border border-gray-200/90 text-gray-800 z-50 py-2 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-[13px] leading-tight">{userProfile.name}</p>
                <p className="text-gray-500 text-[11px] font-mono mt-0.5 truncate">{userProfile.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-gray-400 font-mono tracking-wide">
                    ID: {userProfile.id}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#0B69FF] font-normal text-[13px] transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#0B69FF] font-normal text-[13px] transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/settings/white-label"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#0B69FF] font-normal text-[13px] transition-colors"
                >
                  White Label
                </Link>
                <Link
                  href="/billing"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#0B69FF] font-normal text-[13px] transition-colors"
                >
                  Billing
                </Link>
                <Link
                  href="/bonus-offers"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#0B69FF] font-normal text-[13px] transition-colors"
                >
                  Bonus Offers
                </Link>
                <Link
                  href="/affiliate"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-50 hover:text-[#0B69FF] font-normal text-[13px] transition-colors"
                >
                  Affiliate Program
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-[#0B69FF] hover:text-[#0952C7] hover:bg-blue-50/40 font-medium text-[13px] transition-colors cursor-pointer text-left"
                >
                  Log Out
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsBugModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-800 hover:bg-red-50/50 hover:text-red-600 font-normal text-[13px] transition-colors cursor-pointer text-left"
                >
                  <Bug className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Report a bug</span>
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
