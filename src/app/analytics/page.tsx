'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Search,
  Plus,
  Download,
  Calendar,
  Folder,
  Copy,
  Edit2,
  HelpCircle,
  TrendingUp,
  Globe,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface KeywordSnippetItem {
  id: string;
  keyword: string;
  searchVolume: number;
  currentRank: number;
  url: string;
  title: string;
  snippet: string;
  group: 'General' | 'Brand' | 'Features';
}

const INITIAL_KEYWORD_SNIPPETS: KeywordSnippetItem[] = [
  {
    id: 'k-1',
    keyword: 'work composer',
    searchVolume: 1200,
    currentRank: 1,
    url: 'https://www.workcomposer.com/',
    title: 'WorkComposer - Employee Monitoring & Time Tracking Software',
    snippet: 'WorkComposer helps modern remote and hybrid teams track work hours, monitor productivity, and capture real-time activity metrics effortlessly.',
    group: 'Brand',
  },
  {
    id: 'k-2',
    keyword: 'employee tracking software',
    searchVolume: 8100,
    currentRank: 4,
    url: 'https://www.workcomposer.com/employee-monitoring',
    title: 'Employee Tracking & Monitoring Software for Teams | WorkComposer',
    snippet: 'Automatic screenshots, keystroke activity, application usage, and stealth time tracking with WorkComposer.',
    group: 'General',
  },
  {
    id: 'k-3',
    keyword: 'time tracking software',
    searchVolume: 14800,
    currentRank: 7,
    url: 'https://www.workcomposer.com/time-tracker',
    title: 'Time Tracking Software with Screenshots | WorkComposer',
    snippet: 'Track employee billable hours with automated timesheets, GPS tracking, and payroll export capabilities.',
    group: 'General',
  },
  {
    id: 'k-4',
    keyword: 'remote team management',
    searchVolume: 2400,
    currentRank: 3,
    url: 'https://www.workcomposer.com/features/remote-teams',
    title: 'Remote Team Management Tools | WorkComposer',
    snippet: 'Empower hybrid and remote distributed workforces with automated transparency, productivity analytics and payroll.',
    group: 'Features',
  },
];

function AnalyticsPageContent() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'https://www.workcomposer.com/';
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get('tab') || 'overview';
  const tabTitle =
    tabParam === 'traffic'
      ? 'Traffic'
      : tabParam === 'snippets'
      ? 'Snippets'
      : tabParam === 'gsc'
      ? 'Google Search Console Data'
      : tabParam === 'potential'
      ? 'SEO potential'
      : 'Overview';

  // Connected state for services
  const [isGAConnected, setIsGAConnected] = useState(false);
  const [isGSCConnected, setIsGSCConnected] = useState(false);
  const [isMatomoConnected, setIsMatomoConnected] = useState(false);

  // Modals state
  const [isGAModalOpen, setIsGAModalOpen] = useState(false);
  const [isGSCModalOpen, setIsGSCModalOpen] = useState(false);
  const [isMatomoModalOpen, setIsMatomoModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Notice Banners visibility
  const [showSnippetsNotice, setShowSnippetsNotice] = useState(true);
  const [showPotentialNotice, setShowPotentialNotice] = useState(true);

  // Snippets interactive state matching Screenshots 1 & 2
  const [selectedEngine, setSelectedEngine] = useState('India');
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  const [dateRangeLabel, setDateRangeLabel] = useState('29 Sep 2026 - 29 Sep 2026');
  const [snippetSearchKeyword, setSnippetSearchKeyword] = useState('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'All keywords' | 'General'>('All keywords');

  // Snippet Chart Tab State
  const [activeSnippetMetric, setActiveSnippetMetric] = useState<'position' | 'forecast' | 'visibility'>('position');
  const [activeSnippetTimeframe, setActiveSnippetTimeframe] = useState<'week' | 'month' | '3month' | '6month'>('week');
  const [hasSnippetsData, setHasSnippetsData] = useState(false);

  // SEO Potential State matching Screenshots 1 & 2
  const [conversionRatio, setConversionRatio] = useState('1:100');
  const [avgRevenue, setAvgRevenue] = useState(50);
  const [estimatedTop, setEstimatedTop] = useState(10);
  const [isEditConversionOpen, setIsEditConversionOpen] = useState(false);
  const [isEditRevenueOpen, setIsEditRevenueOpen] = useState(false);
  const [tempConversion, setTempConversion] = useState('1:100');
  const [tempRevenue, setTempRevenue] = useState('50');
  const [isAddKeywordsOpen, setIsAddKeywordsOpen] = useState(false);
  const [newKeywordsInput, setNewKeywordsInput] = useState('');
  const [hasPotentialKeywords, setHasPotentialKeywords] = useState(false);

  // Form states
  const [gaProperty, setGaProperty] = useState('workcomposer.com (GA4-48291054)');
  const [gscSite, setGscSite] = useState('sc-domain:workcomposer.com');
  const [matomoUrl, setMatomoUrl] = useState('https://analytics.workcomposer.com');
  const [matomoSiteId, setMatomoSiteId] = useState('1');
  const [matomoToken, setMatomoToken] = useState('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const hasAnyConnected = isGAConnected || isGSCConnected || isMatomoConnected;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(e.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(e.target as Node)) {
        setIsFolderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-12 select-none overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        {/* ========================================================================= */}
        {/* TOP DISMISSIBLE NOTICES MATCHING SCREENSHOTS */}
        {/* ========================================================================= */}

        {/* Snippets Blue Notice Banner */}
        {tabParam === 'snippets' && showSnippetsNotice && (
          <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#1B66FF] leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pr-4">
              <span className="w-4 h-4 rounded-full bg-[#1B66FF] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                i
              </span>
              <p className="text-gray-700">
                Find out how effective your snippets are. After all, the way a web page is displayed in search engines has a direct impact on the number of clicks it gets. All the data in this section is grouped by search engines and dates, and is stored for 30 days.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSnippetsNotice(false)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
              title="Close notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SEO Potential Blue Notice Banner */}
        {tabParam === 'potential' && showPotentialNotice && (
          <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#1B66FF] leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pr-4">
              <span className="w-4 h-4 rounded-full bg-[#1B66FF] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                i
              </span>
              <p className="text-gray-700">
                <strong className="text-gray-900 font-semibold mr-1">How does SEO potential work?</strong>
                This tool will help you estimate the traffic volume, traffic cost (if acquired through Google Ads), and the potential number of clients.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsReadMoreOpen(true)}
                className="text-[#1B66FF] hover:underline font-medium cursor-pointer text-xs"
              >
                Read more
              </button>
              <button
                type="button"
                onClick={() => setShowPotentialNotice(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                title="Close notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & METADATA BAR (Matching all Screenshots) */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer bg-white shrink-0"
              title="Back to projects"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
              <span className="text-gray-600 font-medium">{domain}</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-gray-500">Analytics &amp; Traffic</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-gray-700 font-medium">{tabTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal text-gray-600">
            <button
              type="button"
              onClick={() => setIsGuestLinkOpen(true)}
              className="text-[#1B66FF] hover:underline cursor-pointer"
            >
              Guest link
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#1B66FF] hover:underline cursor-pointer"
            >
              Feedback
            </button>
            <Link href="/notes" className="text-[#1B66FF] hover:underline">
              Notes (46)
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & TRAFFIC (Matching Screenshot 1 & 2 from previous request) */}
        {/* ========================================================================= */}
        {(tabParam === 'overview' || tabParam === 'traffic') && (
          <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center space-y-8 animate-in fade-in duration-200">
            <div className="space-y-3">
              <h1 className="text-[26px] font-bold text-[#1E293B] tracking-tight">
                Analytics and statistics services
              </h1>
              <p className="text-xs text-[#64748B] max-w-xl mx-auto leading-relaxed">
                Connect Google Analytics and statistics services to get detailed information about your website without switching between browser tabs. It will only take a few minutes.
              </p>
            </div>

            {/* Connection Cards/Buttons */}
            <div className="space-y-3.5 max-w-2xl mx-auto">
              {/* Row 1: Google Analytics & Google Search Console */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Connect Google Analytics */}
                <button
                  type="button"
                  onClick={() => setIsGAModalOpen(true)}
                  className={`bg-white border rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                    isGAConnected
                      ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20 text-emerald-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-5 h-5 flex items-end justify-center gap-0.5 shrink-0">
                    <span className="w-1 h-2.5 bg-[#F9AB00] rounded-xs" />
                    <span className="w-1 h-4 bg-[#E37400] rounded-xs" />
                    <span className="w-1 h-5 bg-[#E37400] rounded-xs" />
                  </div>
                  <span>{isGAConnected ? 'Google Analytics Connected' : 'Connect Google Analytics'}</span>
                  {isGAConnected && <Check className="w-4 h-4 text-emerald-600 ml-1" />}
                </button>

                {/* Connect Google Search Console */}
                <button
                  type="button"
                  onClick={() => setIsGSCModalOpen(true)}
                  className={`bg-white border rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                    isGSCConnected
                      ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20 text-emerald-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isGSCConnected ? 'Search Console Connected' : 'Connect Google Search Console'}</span>
                  {isGSCConnected && <Check className="w-4 h-4 text-emerald-600 ml-1" />}
                </button>
              </div>

              {/* Row 2: Connect Matomo Analytics */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsMatomoModalOpen(true)}
                  className={`w-full sm:w-[320px] bg-white border rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                    isMatomoConnected
                      ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20 text-emerald-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#3152A0] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    M
                  </div>
                  <span>{isMatomoConnected ? 'Matomo Connected' : 'Connect Matomo Analytics'}</span>
                  {isMatomoConnected && <Check className="w-4 h-4 text-emerald-600 ml-1" />}
                </button>
              </div>
            </div>

            {/* CONTINUE Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                disabled={!hasAnyConnected}
                onClick={() => {
                  if (hasAnyConnected) {
                    showToast('Analytics services connected successfully!');
                    router.push('/rankings?tab=detailed');
                  }
                }}
                className={`px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all ${
                  hasAnyConnected
                    ? 'bg-[#1B66FF] hover:bg-[#0B59EE] text-white cursor-pointer shadow-md'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <span>CONTINUE</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SNIPPETS (1:1 Matching User Screenshots 1 & 2) */}
        {/* ========================================================================= */}
        {tabParam === 'snippets' && (
          <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Title & Export Row */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Snippets</h1>
              <button
                type="button"
                onClick={() => showToast('Exporting snippets data...')}
                className="px-3.5 py-1.5 bg-gray-200/80 hover:bg-gray-300/80 text-gray-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors shadow-2xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </button>
            </div>

            {/* Filters Row: Search Engine & Date Picker */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Engine Dropdown */}
              <div className="relative" ref={engineDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                  className={`bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer ${
                    isEngineDropdownOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-blue-600">G</span>
                  <span className="text-sm">🇮🇳</span>
                  <span>{selectedEngine}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                </button>

                {isEngineDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                    {['India', 'United States', 'United Kingdom', 'Canada', 'Australia'].map((eng) => (
                      <button
                        key={eng}
                        type="button"
                        onClick={() => {
                          setSelectedEngine(eng);
                          setIsEngineDropdownOpen(false);
                          showToast(`Switched search engine to Google ${eng}`);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer ${
                          selectedEngine === eng ? 'font-bold text-[#1B66FF] bg-blue-50/50' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">G</span>
                          <span>{eng}</span>
                        </div>
                        {selectedEngine === eng && <Check className="w-3.5 h-3.5 text-[#1B66FF]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Button */}
              <div className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer hover:bg-gray-50">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{dateRangeLabel}</span>
              </div>
            </div>

            {/* Main Content Layout: 2 Columns Matching Screenshots */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Keywords List Card (Width: ~5/12) */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-[460px]">
                {/* Search Bar & Folder/Group Dropdown Row */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-white">
                  {/* Search keyword input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={snippetSearchKeyword}
                      onChange={(e) => setSnippetSearchKeyword(e.target.value)}
                      placeholder="Search keyword..."
                      className="w-full pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#1B66FF]"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* ALL KEYWORDS Dropdown Button Matching Screenshot 2 */}
                  <div className="relative" ref={folderDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                      className={`bg-gray-100/80 hover:bg-gray-200/70 border border-gray-300/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer uppercase ${
                        isFolderDropdownOpen ? 'ring-2 ring-blue-500/20 border-blue-400' : ''
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 fill-gray-600 text-gray-600" />
                      <span>{selectedGroup.toUpperCase()}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-0.5" />
                    </button>

                    {/* Dropdown Popover matching Screenshot 2 */}
                    {isFolderDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 text-xs animate-in fade-in duration-100">
                        {/* Search Input inside Dropdown */}
                        <div className="px-2.5 pb-2 border-b border-gray-100">
                          <input
                            type="text"
                            value={folderSearch}
                            onChange={(e) => setFolderSearch(e.target.value)}
                            placeholder="Search"
                            className="w-full px-2 py-1 border-b border-blue-500 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
                            autoFocus
                          />
                        </div>

                        {/* Options */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGroup('All keywords');
                              setIsFolderDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-1.5 hover:bg-gray-100 cursor-pointer ${
                              selectedGroup === 'All keywords' ? 'text-gray-900 font-semibold' : 'text-gray-600'
                            }`}
                          >
                            All keywords
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGroup('General');
                              setIsFolderDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-1.5 hover:bg-gray-100 cursor-pointer ${
                              selectedGroup === 'General' ? 'text-gray-900 font-semibold' : 'text-gray-600'
                            }`}
                          >
                            General
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 px-4 py-2.5 bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-8 flex items-center gap-1">
                    <span>KEYWORD</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="col-span-4 text-right">
                    <span>SEARCH VOLUME</span>
                  </div>
                </div>

                {/* Table Content / Empty State Matching Screenshot 1 */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  {!hasSnippetsData && !snippetSearchKeyword ? (
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center mx-auto text-gray-500 font-bold text-sm">
                        !
                      </div>
                      <div className="text-xs font-semibold text-gray-700">No data</div>
                      <button
                        type="button"
                        onClick={() => {
                          setHasSnippetsData(true);
                          showToast('Loaded tracked keywords with SERP snippet previews');
                        }}
                        className="text-[11px] text-[#1B66FF] hover:underline font-medium cursor-pointer pt-2 block mx-auto"
                      >
                        + Load demo snippet data
                      </button>
                    </div>
                  ) : (
                    <div className="w-full divide-y divide-gray-100 text-left">
                      {INITIAL_KEYWORD_SNIPPETS.filter((item) =>
                        snippetSearchKeyword
                          ? item.keyword.toLowerCase().includes(snippetSearchKeyword.toLowerCase())
                          : true
                      ).map((item) => (
                        <div key={item.id} className="py-3 px-2 hover:bg-blue-50/40 rounded-lg transition-colors group">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-gray-900">{item.keyword}</span>
                            <span className="font-mono text-gray-500">{item.searchVolume.toLocaleString()}</span>
                          </div>
                          <div className="text-[11px] text-[#1a0dab] group-hover:underline truncate font-medium">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-[#006621] truncate font-mono">
                            {item.url}
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chart / Trends Card (Width: ~7/12) */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl shadow-2xs p-5 flex flex-col justify-between min-h-[460px]">
                <div>
                  {/* Top Metric Switcher Tabs */}
                  <div className="flex items-center border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => setActiveSnippetMetric('position')}
                      className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer ${
                        activeSnippetMetric === 'position'
                          ? 'border-[#1B66FF] text-[#1B66FF]'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      AVERAGE POSITION
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSnippetMetric('forecast')}
                      className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer ${
                        activeSnippetMetric === 'forecast'
                          ? 'border-[#1B66FF] text-[#1B66FF]'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      TRAFFIC FORECAST
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSnippetMetric('visibility')}
                      className={`pb-3 px-4 border-b-2 transition-colors cursor-pointer ${
                        activeSnippetMetric === 'visibility'
                          ? 'border-[#1B66FF] text-[#1B66FF]'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      SEARCH VISIBILITY
                    </button>
                  </div>

                  {/* Sub Timeframe Tabs */}
                  <div className="flex items-center gap-4 pt-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {(['week', 'month', '3month', '6month'] as const).map((tf) => {
                      const label =
                        tf === 'week'
                          ? 'LAST WEEK'
                          : tf === 'month'
                          ? 'MONTH'
                          : tf === '3month'
                          ? '3 MONTHS'
                          : '6 MONTHS';
                      const isActive = activeSnippetTimeframe === tf;
                      return (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setActiveSnippetTimeframe(tf)}
                          className={`pb-1 cursor-pointer transition-colors ${
                            isActive
                              ? 'text-[#1B66FF] border-b-2 border-[#1B66FF]'
                              : 'hover:text-gray-800'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chart Area Matching Screenshot 1 */}
                <div className="py-16 relative flex items-center justify-center">
                  <svg className="w-full h-32 text-gray-300" viewBox="0 0 500 100" fill="none">
                    {/* Horizontal baseline line matching screenshot */}
                    <line x1="40" y1="80" x2="480" y2="80" stroke="#E2E8F0" strokeWidth="1.5" />
                    {hasSnippetsData && (
                      <path
                        d="M 40 75 Q 120 40 200 60 T 360 30 T 480 45"
                        fill="none"
                        stroke="#1B66FF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                </div>

                {/* Bottom Chart Legend Matching Screenshot 1 */}
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#1B66FF] shrink-0" />
                  <span>Google {selectedEngine}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GOOGLE SEARCH CONSOLE DATA (1:1 Matching User Screenshot) */}
        {/* ========================================================================= */}
        {tabParam === 'gsc' && (
          <div className="animate-in fade-in duration-200">
            {!isGSCConnected ? (
              /* Initial Connection Screen Matching User Screenshot */
              <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center space-y-6">
                {/* Vector Illustration matching Screenshot */}
                <div className="w-72 h-56 mx-auto relative flex items-center justify-center">
                  {/* Modern Illustration Graphic */}
                  <svg viewBox="0 0 320 240" className="w-full h-full" fill="none">
                    {/* Soft background shape */}
                    <ellipse cx="160" cy="195" rx="130" ry="30" fill="#FEE2E2" opacity="0.45" />

                    {/* Floating colored shapes */}
                    <rect x="235" y="35" width="22" height="16" rx="3" fill="#EF4444" transform="rotate(15 235 35)" />
                    <rect x="215" y="55" width="28" height="18" rx="3" fill="#3B82F6" transform="rotate(-10 215 55)" />
                    <rect x="190" y="30" width="20" height="15" rx="3" fill="#F59E0B" />

                    {/* Standing User Character with Laptop */}
                    <circle cx="178" cy="40" r="10" fill="#1E293B" />
                    <path d="M178 50 C 168 55, 168 70, 178 75 C 188 70, 188 55, 178 50 Z" fill="#93C5FD" />

                    {/* Main Browser Window */}
                    <g filter="drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.08))">
                      <rect x="65" y="70" width="180" height="115" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                      <rect x="65" y="70" width="180" height="18" rx="6" fill="#F8FAFC" />
                      <line x1="65" y1="88" x2="245" y2="88" stroke="#E2E8F0" strokeWidth="1" />
                      {/* Browser dots */}
                      <circle cx="75" cy="79" r="2.5" fill="#EF4444" />
                      <circle cx="83" cy="79" r="2.5" fill="#F59E0B" />
                      <circle cx="91" cy="79" r="2.5" fill="#10B981" />

                      {/* Bar chart inside window */}
                      <rect x="80" y="100" width="80" height="7" rx="2" fill="#3B82F6" />
                      <circle cx="120" cy="140" r="22" stroke="#E2E8F0" strokeWidth="6" fill="none" />
                      <path d="M 120 118 A 22 22 0 0 1 142 140" stroke="#3B82F6" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </g>

                    {/* Green Audit Document on Left */}
                    <g filter="drop-shadow(0px 6px 12px rgba(16, 185, 129, 0.12))">
                      <rect x="40" y="95" width="60" height="85" rx="5" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
                      <polygon points="45,130 95,98 95,130" fill="#10B981" opacity="0.7" />
                      <line x1="48" y1="145" x2="75" y2="145" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      <line x1="48" y1="155" x2="88" y2="155" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      <line x1="48" y1="165" x2="70" y2="165" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Sitting character working on laptop */}
                    <ellipse cx="205" cy="140" rx="14" ry="14" fill="#FBBF24" />
                    {/* Blue shirt & jeans */}
                    <path d="M 195 155 Q 210 145 220 155 L 210 195 L 188 190 Z" fill="#2563EB" />
                    {/* Blue laptop */}
                    <rect x="180" y="152" width="24" height="14" rx="2" fill="#3B82F6" transform="rotate(-15 180 152)" />
                    {/* Plant/foliage */}
                    <path d="M 235 150 C 245 130 250 160 255 190 C 240 190 235 170 235 150 Z" fill="#6EE7B7" opacity="0.6" />
                  </svg>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2">
                  <h1 className="text-[26px] font-bold text-[#1E293B] tracking-tight">
                    Google Search Console
                  </h1>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Connect Google Search Console to get detailed information about your project.
                  </p>
                </div>

                {/* Connect Button Matching Screenshot */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsGSCModalOpen(true)}
                    className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl px-5 py-3 flex items-center justify-center gap-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Connect Google Search Console</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Connected Real Dynamic GSC Dashboard */
              <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-blue-600 text-lg">G</span>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Google Search Console Performance</h1>
                      <div className="text-xs text-gray-500 font-mono">{gscSite}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGSCConnected(false)}
                      className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      Disconnect Property
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Exported GSC data to CSV')}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer uppercase shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EXPORT</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">TOTAL CLICKS</div>
                    <div className="text-2xl font-black text-blue-600 mt-1">14.8K</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +12.4% vs last period</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">TOTAL IMPRESSIONS</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">382.4K</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +8.7% vs last period</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">AVERAGE CTR</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">3.9%</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +0.4% vs last period</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">AVERAGE POSITION</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">14.2</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +2.1 pos vs last period</div>
                  </div>
                </div>

                {/* Performance Chart Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-sm text-gray-900">Search performance over time</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Clicks
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Impressions
                      </span>
                    </div>
                  </div>
                  <div className="h-44 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 120" fill="none">
                      <line x1="20" y1="100" x2="580" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                      <path
                        d="M 20 85 Q 120 40 220 70 T 400 35 T 580 50"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 20 60 Q 140 20 260 55 T 440 25 T 580 30"
                        fill="none"
                        stroke="#9333EA"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Top Queries Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-200 font-bold text-xs text-gray-800 uppercase tracking-wider">
                    Top Google Search Queries
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">TOP QUERIES</th>
                          <th className="py-2.5 px-4 text-right">CLICKS</th>
                          <th className="py-2.5 px-4 text-right">IMPRESSIONS</th>
                          <th className="py-2.5 px-4 text-right">CTR</th>
                          <th className="py-2.5 px-4 text-right">POSITION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {[
                          { query: 'work composer', clicks: '4,892', imp: '18,400', ctr: '26.6%', pos: '1.2' },
                          { query: 'employee tracking software', clicks: '2,940', imp: '42,100', ctr: '7.0%', pos: '4.1' },
                          { query: 'time tracking software with screenshots', clicks: '1,830', imp: '28,900', ctr: '6.3%', pos: '3.8' },
                          { query: 'remote work monitoring', clicks: '920', imp: '19,300', ctr: '4.8%', pos: '6.4' },
                          { query: 'stealth employee tracker', clicks: '740', imp: '12,500', ctr: '5.9%', pos: '5.2' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-900">{row.query}</td>
                            <td className="py-3 px-4 text-right font-mono text-blue-600 font-bold">{row.clicks}</td>
                            <td className="py-3 px-4 text-right font-mono text-gray-600">{row.imp}</td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">{row.ctr}</td>
                            <td className="py-3 px-4 text-right font-mono text-amber-600 font-bold">{row.pos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SEO POTENTIAL (1:1 Matching User Screenshots 1 & 2) */}
        {/* ========================================================================= */}
        {tabParam === 'potential' && (
          <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Title & Export Row */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">SEO potential</h1>
              <button
                type="button"
                onClick={() => showToast('Exporting SEO potential calculations...')}
                className="px-3.5 py-1.5 bg-gray-200/80 hover:bg-gray-300/80 text-gray-500 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors shadow-2xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </button>
            </div>

            {/* 2 Colored Top Cards Matching Screenshot 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Blue Card - Conversion into sales */}
              <div className="bg-[#3B72FF] text-white rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    $
                  </div>
                  <span className="text-sm font-semibold tracking-wide">
                    Conversion into sales
                  </span>
                </div>

                {/* Editable Pill Box */}
                <button
                  type="button"
                  onClick={() => setIsEditConversionOpen(true)}
                  className="bg-white/25 hover:bg-white/35 rounded-lg px-4 py-2 flex items-center gap-3 transition-colors cursor-pointer border border-white/20"
                  title="Click to edit conversion ratio"
                >
                  <span className="text-xl font-bold tracking-tight">{conversionRatio}</span>
                  <Edit2 className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>

              {/* Card 2: Green Card - Average revenue per customer */}
              <div className="bg-[#2BB673] text-white rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                    💳
                  </div>
                  <span className="text-sm font-semibold tracking-wide">
                    Average revenue per customer
                  </span>
                </div>

                {/* Editable Pill Box */}
                <button
                  type="button"
                  onClick={() => setIsEditRevenueOpen(true)}
                  className="bg-white/25 hover:bg-white/35 rounded-lg px-4 py-2 flex items-center gap-3 transition-colors cursor-pointer border border-white/20"
                  title="Click to edit average revenue per customer"
                >
                  <span className="text-xl font-bold tracking-tight">{avgRevenue}</span>
                  <Edit2 className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>

            {/* Section 1 Card: Current traffic estimate for all added keywords */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 font-semibold text-xs text-gray-800">
                Current traffic estimate for all added keywords.
              </div>

              {/* Content / Empty State Matching Screenshot 1 */}
              {!hasPotentialKeywords ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-sm font-bold">
                    🔍
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-800">No data found</div>
                    <p className="text-[11px] text-gray-400">
                      No keywords have been added to the project yet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddKeywordsOpen(true)}
                    className="bg-[#2BB673] hover:bg-[#259b62] text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>ADD KEYWORDS</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="text-[11px] text-gray-500 font-bold uppercase">Estimated Monthly Traffic</div>
                      <div className="text-2xl font-black text-blue-600 mt-1">4,280 visits</div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="text-[11px] text-gray-500 font-bold uppercase">Potential Clients / Mo</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">
                        {Math.round(4280 / 100)} clients
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                      <div className="text-[11px] text-gray-500 font-bold uppercase">Est. Monthly Revenue</div>
                      <div className="text-2xl font-black text-purple-600 mt-1">
                        ${Math.round((4280 / 100) * avgRevenue).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2 Card: Expected traffic volume provided top 10 ranking Matching Screenshot 2 */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <span>Expected traffic volume provided that every keyword ranks among the top 10 in search results.</span>
                  <span className="text-gray-400 cursor-help text-[11px]">ⓘ</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs font-medium">Estimated top:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={estimatedTop}
                    onChange={(e) => setEstimatedTop(Number(e.target.value))}
                    className="w-16 px-2.5 py-1 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-[#2BB673] text-center"
                  />
                </div>
              </div>

              {/* Content / Empty State Matching Screenshot 2 */}
              {!hasPotentialKeywords ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-sm font-bold">
                    🔍
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-800">No data found</div>
                    <p className="text-[11px] text-gray-400">
                      No keywords have been added to the project yet.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddKeywordsOpen(true)}
                    className="bg-[#2BB673] hover:bg-[#259b62] text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>ADD KEYWORDS</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <div className="text-[11px] text-gray-500 font-bold uppercase">Top {estimatedTop} Expected Traffic</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">26,500 visits</div>
                    </div>
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="text-[11px] text-gray-500 font-bold uppercase">Estimated Clients / Mo</div>
                      <div className="text-2xl font-black text-blue-600 mt-1">
                        {Math.round(26500 / 100)} clients
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="text-[11px] text-gray-500 font-bold uppercase">Max Revenue Potential</div>
                      <div className="text-2xl font-black text-amber-600 mt-1">
                        ${Math.round((26500 / 100) * avgRevenue).toLocaleString()} /mo
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM FOOTER (Matching all Screenshots) */}
      {/* ========================================================================= */}
      <footer className="px-6 py-4 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs text-gray-500 select-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00A86B] flex items-center justify-center text-white text-[9px] font-black">
            SE
          </div>
          <span className="font-bold text-gray-800 text-xs">SE Ranking</span>
        </div>

        <div className="flex items-center gap-5 font-normal text-xs text-gray-500">
          <button
            type="button"
            onClick={() => setIsBugModalOpen(true)}
            className="hover:text-gray-900 cursor-pointer"
          >
            Report a bug
          </button>
          <Link href="/affiliate" className="hover:text-gray-900">
            Affiliates
          </Link>
          <Link href="/api-docs" className="hover:text-gray-900">
            API
          </Link>
          <Link href="/whats-new" className="hover:text-gray-900">
            What's new
          </Link>
          <Link href="/help" className="hover:text-gray-900">
            Help
          </Link>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* ALL INTERACTIVE MODALS */}
      {/* ========================================================================= */}

      {/* Edit Conversion Ratio Modal */}
      {isEditConversionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Conversion into sales ratio</h3>
              <button
                type="button"
                onClick={() => setIsEditConversionOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Enter Ratio (e.g. 1:100, 1:50)</label>
              <input
                type="text"
                value={tempConversion}
                onChange={(e) => setTempConversion(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-hidden focus:border-blue-500"
              />
              <p className="text-[11px] text-gray-400">
                1 sale for every 100 unique website visitors (1% baseline conversion).
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditConversionOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConversionRatio(tempConversion);
                  setIsEditConversionOpen(false);
                  showToast(`Conversion ratio set to ${tempConversion}`);
                }}
                className="px-4 py-2 bg-[#3B72FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Ratio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Average Revenue Modal */}
      {isEditRevenueOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Average revenue per customer</h3>
              <button
                type="button"
                onClick={() => setIsEditRevenueOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Enter Value ($)</label>
              <input
                type="number"
                value={tempRevenue}
                onChange={(e) => setTempRevenue(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-[11px] text-gray-400">
                Average transaction amount or subscription value per paying customer.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditRevenueOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvgRevenue(Number(tempRevenue) || 50);
                  setIsEditRevenueOpen(false);
                  showToast(`Average revenue updated to $${tempRevenue}`);
                }}
                className="px-4 py-2 bg-[#2BB673] hover:bg-[#259b62] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Value
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Keywords Modal for SEO Potential */}
      {isAddKeywordsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#2BB673]" />
                <h3 className="text-sm font-bold text-gray-900">Add Keywords to Estimate SEO Potential</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeywordsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Enter target keywords line by line to calculate potential traffic and revenue forecast:
            </p>
            <textarea
              rows={5}
              placeholder={`work composer\nemployee tracking software\ntime tracking software\nremote team management`}
              value={newKeywordsInput}
              onChange={(e) => setNewKeywordsInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#2BB673]"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddKeywordsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasPotentialKeywords(true);
                  setIsAddKeywordsOpen(false);
                  showToast('Calculated SEO potential for added keywords!');
                }}
                className="px-5 py-2 bg-[#2BB673] hover:bg-[#259b62] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Calculate Potential
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read More Modal for SEO Potential */}
      {isReadMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">How Does SEO Potential Work?</h3>
              <button
                type="button"
                onClick={() => setIsReadMoreOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                <strong>1. Traffic Estimate:</strong> Based on the total search volume of your tracked keywords and their hypothetical ranking in the top 10 SERP spots, multiplied by industry click-through rates (CTR).
              </p>
              <p>
                <strong>2. Conversion into Sales:</strong> Your assumed conversion rate (e.g. 1:100 = 1%) estimates how many search engine visits will convert into paying customers.
              </p>
              <p>
                <strong>3. Revenue Potential:</strong> Total potential revenue is derived from `Estimated Clients × Average Revenue per Customer`.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsReadMoreOpen(false)}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Analytics Modal */}
      {isGAModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">📊</span>
                <h3 className="text-sm font-bold text-gray-900">Connect Google Analytics 4</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGAModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect your GA4 property to fetch organic traffic, sessions, and conversion data for <strong>{domain}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select GA4 Property</label>
                <select
                  value={gaProperty}
                  onChange={(e) => setGaProperty(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1B66FF]"
                >
                  <option value="workcomposer.com (GA4-48291054)">workcomposer.com (GA4-48291054)</option>
                  <option value="app.workcomposer.com (GA4-59201948)">app.workcomposer.com (GA4-59201948)</option>
                  <option value="api.workcomposer.com (GA4-10294851)">api.workcomposer.com (GA4-10294851)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#1B66FF] shrink-0 mt-0.5" />
                <span>
                  Read-only permissions are requested. Your analytics credentials remain securely encrypted with industry standards.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsGAModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGAConnected(true);
                  setIsGAModalOpen(false);
                  showToast('Google Analytics 4 connected!');
                }}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Authorize &amp; Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Search Console Modal */}
      {isGSCModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">G</span>
                <h3 className="text-sm font-bold text-gray-900">Connect Google Search Console</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGSCModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect Google Search Console to pull genuine search impressions, clicks, CTR, and average SERP positions for <strong>{domain}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select Verified Property</label>
                <select
                  value={gscSite}
                  onChange={(e) => setGscSite(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1B66FF]"
                >
                  <option value="sc-domain:workcomposer.com">sc-domain:workcomposer.com</option>
                  <option value="https://www.workcomposer.com/">https://www.workcomposer.com/</option>
                  <option value="https://workcomposer.com/">https://workcomposer.com/</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Property verification verified via DNS TXT record. Ready for immediate synchronization.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsGSCModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGSCConnected(true);
                  setIsGSCModalOpen(false);
                  showToast('Google Search Console connected!');
                }}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Connect GSC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matomo Modal */}
      {isMatomoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3152A0] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  M
                </div>
                <h3 className="text-sm font-bold text-gray-900">Connect Matomo Analytics</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMatomoModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect self-hosted or cloud Matomo instances to fetch on-premise privacy-compliant analytics.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Matomo Instance URL</label>
                <input
                  type="url"
                  value={matomoUrl}
                  onChange={(e) => setMatomoUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1B66FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Site ID</label>
                  <input
                    type="text"
                    value={matomoSiteId}
                    onChange={(e) => setMatomoSiteId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1B66FF]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Auth Token (token_auth)</label>
                  <input
                    type="password"
                    placeholder="32-char hex token"
                    value={matomoToken}
                    onChange={(e) => setMatomoToken(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#1B66FF]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsMatomoModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMatomoConnected(true);
                  setIsMatomoModalOpen(false);
                  showToast('Matomo Analytics connected!');
                }}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Connect Matomo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Link Modal */}
      {isGuestLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Get access to guest links</h3>
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or team members to let them view website analytics and traffic without logging into the system.
            </p>
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;section=analytics
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641&section=analytics');
                  showToast('Guest link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-[#1B66FF] font-semibold hover:underline shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading analytics &amp; traffic...</div>}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
