'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Settings,
  Download,
  Filter,
  Columns,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Info,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Check,
  BarChart2,
  Copy,
  Tag,
  Link2,
  Target,
  Clock,
  List,
  Folder,
  Layers,
  ArrowUpRight,
  StickyNote,
  Sliders,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { AppFooter } from '@/components/layout/AppFooter';
import { CreateNoteModal } from '@/components/modals/CreateNoteModal';

interface KeywordItem {
  id: string;
  keyword: string;
  rank: number;
  prevRank: number;
  change: number;
  volume: number;
  cpc: string;
  difficulty: number;
  serpFeatures: string[];
  url: string;
  dateChecked: string;
}

const HIGH_POTENTIAL_KEYWORDS = [
  { keyword: 'remote employee tracking software', volume: 5400, kd: 25, intent: 'Commercial', cpc: '$4.10' },
  { keyword: 'work time tracker', volume: 8100, kd: 22, intent: 'Commercial', cpc: '$3.20' },
  { keyword: 'employee monitoring software', volume: 14800, kd: 28, intent: 'Commercial', cpc: '$4.50' },
  { keyword: 'automatic screenshot monitoring tool', volume: 2400, kd: 16, intent: 'High Potential', cpc: '$5.10' },
  { keyword: 'desktop activity tracker', volume: 3600, kd: 19, intent: 'Commercial', cpc: '$2.80' },
  { keyword: 'remote team productivity tool', volume: 5200, kd: 24, intent: 'Commercial', cpc: '$3.90' },
  { keyword: 'time tracking software with screenshots', volume: 1900, kd: 18, intent: 'Commercial', cpc: '$3.40' },
];

const INITIAL_KEYWORDS: KeywordItem[] = [
  {
    id: 'kw-1',
    keyword: 'employee monitoring software',
    rank: 2,
    prevRank: 3,
    change: 1,
    volume: 14800,
    cpc: '$4.50',
    difficulty: 28,
    serpFeatures: ['Featured Snippet', 'SiteLinks'],
    url: 'https://www.workcomposer.com/employee-monitoring',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-2',
    keyword: 'work time tracker',
    rank: 3,
    prevRank: 5,
    change: 2,
    volume: 8100,
    cpc: '$3.20',
    difficulty: 22,
    serpFeatures: ['Reviews', 'SiteLinks'],
    url: 'https://www.workcomposer.com/time-tracker',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-3',
    keyword: 'remote employee tracking software',
    rank: 5,
    prevRank: 5,
    change: 0,
    volume: 5400,
    cpc: '$4.10',
    difficulty: 25,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/remote-tracking',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-4',
    keyword: 'automatic screenshot monitoring tool',
    rank: 4,
    prevRank: 7,
    change: 3,
    volume: 2400,
    cpc: '$5.10',
    difficulty: 16,
    serpFeatures: ['Video', 'FAQ'],
    url: 'https://www.workcomposer.com/screenshots',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-5',
    keyword: 'desktop activity tracker',
    rank: 7,
    prevRank: 6,
    change: -1,
    volume: 3600,
    cpc: '$2.80',
    difficulty: 19,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/activity-tracker',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-6',
    keyword: 'remote team productivity tool',
    rank: 6,
    prevRank: 8,
    change: 2,
    volume: 5200,
    cpc: '$3.90',
    difficulty: 24,
    serpFeatures: ['SiteLinks', 'People Also Ask'],
    url: 'https://www.workcomposer.com/productivity',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-7',
    keyword: 'time tracking software with screenshots',
    rank: 3,
    prevRank: 4,
    change: 1,
    volume: 1900,
    cpc: '$3.40',
    difficulty: 18,
    serpFeatures: ['Featured Snippet'],
    url: 'https://www.workcomposer.com/time-tracking-screenshots',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-8',
    keyword: 'staff attendance tracker',
    rank: 9,
    prevRank: 13,
    change: 4,
    volume: 4800,
    cpc: '$2.90',
    difficulty: 31,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/attendance',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-9',
    keyword: 'computer usage tracker for employees',
    rank: 8,
    prevRank: 6,
    change: -2,
    volume: 2100,
    cpc: '$4.30',
    difficulty: 27,
    serpFeatures: ['FAQ'],
    url: 'https://www.workcomposer.com/usage-tracker',
    dateChecked: 'Today, 06:00',
  },
  {
    id: 'kw-10',
    keyword: 'keystroke logging tool for office',
    rank: 11,
    prevRank: 12,
    change: 1,
    volume: 1200,
    cpc: '$3.80',
    difficulty: 33,
    serpFeatures: ['SiteLinks'],
    url: 'https://www.workcomposer.com/keystrokes',
    dateChecked: 'Today, 06:00',
  },
];


const SUMMARY_NOTES = [
  {
    id: 'note-1',
    title: 'May 2026 Google Core Update',
    shortDesc: 'This is the second core update of 2026. It started on May 21, 2026, and finished approximately 12 days later on June 2, 2026. As with other core updates, Google described it as a regular update designed to better surface relevant, satisfying content for...',
    fullDesc: 'This is the second core update of 2026. It started on May 21, 2026, and finished approximately 12 days later on June 2, 2026. As with other core updates, Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all kinds of sites.',
    date: 'May-21 2026',
    category: 'Google update',
  },
  {
    id: 'note-2',
    title: 'March 2026 core update',
    shortDesc: 'This is the first core update of 2026, launching just three days after the March 2026 spam update completed. It started on March 27, 2026, and finished approximately 12 days later on April 8, 2026. As with other core updates, Google refined its core ra...',
    fullDesc: 'This is the first core update of 2026, launching just three days after the March 2026 spam update completed. It started on March 27, 2026, and finished approximately 12 days later on April 8, 2026. As with other core updates, Google refined its core ranking systems to elevate high-value experiences.',
    date: 'Mar-27 2026',
    category: 'Google update',
  },
  {
    id: 'note-3',
    title: 'March 2026 spam update',
    shortDesc: "This is the first spam update of 2026 and the first since August 2025. It launched on March 24, 2026, and completed the following day in under 24 hours, making it the fastest spam update ever recorded on Google's Search Status Dashboard. Google ...",
    fullDesc: "This is the first spam update of 2026 and the first since August 2025. It launched on March 24, 2026, and completed the following day in under 24 hours, making it the fastest spam update ever recorded on Google's Search Status Dashboard. Google confirmed all scaled abusive content is heavily mitigated.",
    date: 'Mar-24 2026',
    category: 'Google update',
  },
  {
    id: 'note-4',
    title: 'February 2026 Discover core update',
    shortDesc: "This is the first confirmed Google Search update of 2026 and the first core update in Google's history to target Google Discover exclusively. It started on February 5, 2026, and completed approximately 22 days later on February 27, 2026. Google descr...",
    fullDesc: "This is the first confirmed Google Search update of 2026 and the first core update in Google's history to target Google Discover exclusively. It started on February 5, 2026, and completed approximately 22 days later on February 27, 2026. Google described this adjustment as tailored specifically for discovery algorithmic feeds.",
    date: 'Feb-05 2026',
    category: 'Google update',
  },
  {
    id: 'note-5',
    title: 'December 2025 core update',
    shortDesc: 'This is the third and final core update of 2025. It started on December 11, 2025, and completed 18 days later on December 29, 2025. Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all t...',
    fullDesc: 'This is the third and final core update of 2025. It started on December 11, 2025, and completed 18 days later on December 29, 2025. Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all types of publishers worldwide.',
    date: 'Dec-11 2025',
    category: 'Google update',
  },
];

function RankingsPageContent() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'https://www.workcomposer.com/';
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active view tab: supports detailed, summary, and historical
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'historical'>(
    tabParam === 'summary'
      ? 'summary'
      : tabParam === 'historical' || tabParam === 'history'
      ? 'historical'
      : 'detailed'
  );

  useEffect(() => {
    if (tabParam === 'summary') {
      setActiveTab('summary');
    } else if (tabParam === 'historical' || tabParam === 'history') {
      setActiveTab('historical');
    } else if (tabParam === 'detailed') {
      setActiveTab('detailed');
    }
  }, [tabParam]);

  // Ranking Settings Gear Dropdown state matching Screenshot 1
  const [isRankingSettingsMenuOpen, setIsRankingSettingsMenuOpen] = useState(false);
  const rankingSettingsRef = useRef<HTMLDivElement>(null);
  const [isRankingSettingsModalOpen, setIsRankingSettingsModalOpen] = useState(false);

  const [rankingFrequency, setRankingFrequency] = useState('Daily');
  const [searchVolumeSource, setSearchVolumeSource] = useState('Google Keyword Planner');
  const [trackSerpFeatures, setTrackSerpFeatures] = useState(true);
  const [exactMatchMode, setExactMatchMode] = useState(false);

  // Dual Calendar Date Picker Popover matching Screenshot 1
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [selectedDateRangeLabel, setSelectedDateRangeLabel] = useState('29 Sep 2026 - 29 Sep 2026');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(29);

  // Search Engine Dropdown
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedEngine, setSelectedEngine] = useState('India');
  const [isAddEngineModalOpen, setIsAddEngineModalOpen] = useState(false);

  // View Mode Dropdown matching Screenshot 3 & 4
  const [isViewModeDropdownOpen, setIsViewModeDropdownOpen] = useState(false);
  const viewModeRef = useRef<HTMLDivElement>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<'List' | 'Groups' | 'Tags' | 'URL in SERP' | 'Target URL' | 'Date'>('Groups');

  // Position Filters state matching Screenshot 1
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [posMin, setPosMin] = useState('');
  const [posMax, setPosMax] = useState('');

  // Insights Section matching Screenshot 1, 2, 3
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  // Metrics Section toggle
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);

  // Summary View interactive states
  const [distributionPeriod, setDistributionPeriod] = useState<'CURRENT' | '7D' | '1M' | '3M' | '6M' | '1Y' | '2Y'>('CURRENT');
  const [keywordOverviewMode, setKeywordOverviewMode] = useState<'VISIBILITY' | 'TRAFFIC FORECAST'>('VISIBILITY');
  const [pagesFilterTab, setPagesFilterTab] = useState<'TOP' | 'JUMPED' | 'DROPPED'>('TOP');
  const [isGroupsDropdownOpen, setIsGroupsDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('All groups');
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteDate, setNoteDate] = useState('29 Sep 2026');
  const [noteCategory, setNoteCategory] = useState('Google update');
  const [notes, setNotes] = useState(SUMMARY_NOTES);
  const [isConnectGAOpen, setIsConnectGAOpen] = useState(false);
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);

  // Recheck Data 2-Tier Dropdown state
  const [isRecheckOpen, setIsRecheckOpen] = useState(false);
  const [hoveredRecheckSubmenu, setHoveredRecheckSubmenu] = useState<'rankings' | 'search_volume' | null>(null);
  const recheckDropdownRef = useRef<HTMLDivElement>(null);

  // Add Keywords and High-Potential Keywords Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHighPotentialModalOpen, setIsHighPotentialModalOpen] = useState(false);
  const [selectedHighPotential, setSelectedHighPotential] = useState<string[]>([
    'remote employee tracking software',
    'work time tracker',
  ]);
  const [keywordInput, setKeywordInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [keywords, setKeywords] = useState<KeywordItem[]>(INITIAL_KEYWORDS);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  // Modals
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isDataStudioOpen, setIsDataStudioOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchRankingsData = async () => {
    try {
      setIsLoadingRankings(true);
      const projectId = activeProject?.id || 'workcomposer.com';
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/rankings`);
      if (res.ok) {
        const data = await res.json();
        if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
          setKeywords(data.keywords);
        }
      }
    } catch (e) {
      console.error('Failed to load rankings:', e);
    } finally {
      setIsLoadingRankings(false);
    }
  };

  useEffect(() => {
    fetchRankingsData();
  }, [activeProject?.id]);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rankingSettingsRef.current && !rankingSettingsRef.current.contains(e.target as Node)) {
        setIsRankingSettingsMenuOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(e.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (viewModeRef.current && !viewModeRef.current.contains(e.target as Node)) {
        setIsViewModeDropdownOpen(false);
      }
      if (recheckDropdownRef.current && !recheckDropdownRef.current.contains(e.target as Node)) {
        setIsRecheckOpen(false);
        setHoveredRecheckSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;

    const lines = keywordInput
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const projectId = activeProject?.id || 'workcomposer.com';
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: lines }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Successfully added ${data.addedCount || lines.length} keywords to database!`);
        setKeywordInput('');
        setIsAddModalOpen(false);
        fetchRankingsData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to add keywords.');
      }
    } catch {
      showToast('Network error while adding keywords.');
    }
  };

  const handleRecheckRankings = async (selectedIds?: string[]) => {
    setIsRechecking(true);
    setIsRecheckOpen(false);
    const projectId = activeProject?.id || 'workcomposer.com';
    showToast('Connecting to ranking provider...');

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/rankings/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywordIds: selectedIds }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Rankings updated for ${data.checkedCount} keywords!`);
        fetchRankingsData();
      } else {
        if (data.error?.code === 'PROVIDER_UNCONFIGURED') {
          showToast('Live tracking requires SERPAPI_API_KEY set in server environment.');
        } else {
          showToast(data.error?.message || data.error || 'Ranking check failed.');
        }
      }
    } catch {
      showToast('Failed to connect to ranking check service.');
    } finally {
      setIsRechecking(false);
    }
  };

  const handleExportCsv = () => {
    const projectId = activeProject?.id || 'workcomposer.com';
    window.location.href = `/api/projects/${encodeURIComponent(projectId)}/keywords/export`;
    showToast('Exporting rankings CSV...');
  };

  const addSelectedHighPotential = async () => {
    const projectId = activeProject?.id || 'workcomposer.com';
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: selectedHighPotential }),
      });
      if (res.ok) {
        showToast(`${selectedHighPotential.length} high-potential keywords added!`);
        setIsHighPotentialModalOpen(false);
        fetchRankingsData();
      }
    } catch {
      showToast('Network error adding keywords.');
    }
  };

  // Metrics counts
  const countTop1 = keywords.filter((k) => k.rank === 1).length;
  const countTop3 = keywords.filter((k) => k.rank <= 3).length;
  const countTop5 = keywords.filter((k) => k.rank <= 5).length;
  const countTop10 = keywords.filter((k) => k.rank <= 10).length;
  const countTop30 = keywords.filter((k) => k.rank <= 30).length;
  const countOver100 = keywords.filter((k) => k.rank > 100).length;

  const avgPosition =
    keywords.length > 0
      ? (keywords.reduce((acc, k) => acc + k.rank, 0) / keywords.length).toFixed(1)
      : '0';

  const totalTraffic = keywords.reduce((acc, k) => acc + Math.round(k.volume * 0.12), 0);
  const searchVisibility = keywords.length > 0 ? (countTop10 / keywords.length * 100).toFixed(1) : '0';

  const filteredKeywords = keywords.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedRange === 'top1') return k.rank === 1;
    if (selectedRange === 'top3') return k.rank <= 3;
    if (selectedRange === 'top5') return k.rank <= 5;
    if (selectedRange === 'top10') return k.rank <= 10;
    if (selectedRange === 'top30') return k.rank <= 30;
    if (selectedRange === 'over100') return k.rank > 100;
    return true;
  });

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-16 select-none overflow-x-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Breadcrumb & Metadata Header Row matching Screenshot 1 */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-2">
          {/* Circular Back Button matching Screenshot 1 */}
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
            <span className="text-gray-500">Rankings</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-700 font-medium">
              {activeTab === 'detailed'
                ? 'Detailed'
                : activeTab === 'historical'
                ? 'Historical data'
                : 'Summary'}
            </span>
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
          <div className="flex items-center gap-1 text-gray-600">
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            <span>Manual rechecks: <strong className="font-semibold text-gray-800">0 / 750</strong></span>
            <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <span>Keyword limits: <strong className="font-semibold text-gray-800">{keywords.length} / 750</strong></span>
            <span className="cursor-help text-gray-400 text-[10px]">ℹ</span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Top Controls Row: Search Engine, Date Range Picker, Data Studio, Export, and RANKING SETTINGS ICON */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Search Engine Dropdown (Screenshot 1) */}
            <div className="relative" ref={engineDropdownRef}>
              <button
                type="button"
                onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                className={`bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer ${
                  isEngineDropdownOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <GoogleLogo className="w-4 h-4" />
                <CountryFlag code="IN" name="India" size="sm" />
                <span>{selectedEngine}</span>
                <span className="text-[10px] text-gray-500 font-bold">EN</span>
                {isEngineDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-500 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                )}
              </button>

              {isEngineDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                  <div
                    onClick={() => {
                      setSelectedEngine('India');
                      setIsEngineDropdownOpen(false);
                    }}
                    className="px-3 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer bg-gray-50 font-medium text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <GoogleLogo className="w-4 h-4" />
                      <CountryFlag code="IN" name="India" size="sm" />
                      <span>India</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">EN</span>
                  </div>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEngineDropdownOpen(false);
                      setIsAddEngineModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#0B69FF] font-semibold hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add search engine</span>
                  </button>
                </div>
              )}
            </div>

            {/* DUAL-MONTH CALENDAR DATE PICKER (Hidden in Historical data view matching Screenshot 1) */}
            {activeTab !== 'historical' && (
              <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className={`bg-white border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer ${
                  isDatePickerOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{selectedDateRangeLabel}</span>
              </button>

              {/* Exact Dual-Month Calendar Popover matching Screenshot 1 */}
              {isDatePickerOpen && (
                <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 w-[640px]">
                  <div className="flex items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Month 1: August 2026 */}
                        <div>
                          <div className="flex items-center justify-between font-bold text-xs text-gray-800 mb-3 px-1">
                            <button type="button" className="text-gray-400 hover:text-gray-700 cursor-pointer">&lt;</button>
                            <div className="flex items-center gap-1">
                              <span>August 2026</span>
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </div>
                            <span />
                          </div>

                          <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold mb-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                              <div key={i} className="py-1">{d}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 text-center text-xs text-gray-600 gap-y-1 font-medium">
                            <div /><div /><div /><div /><div />
                            <div className="py-1 hover:bg-gray-100 rounded cursor-pointer">1</div>
                            <div className="py-1 hover:bg-gray-100 rounded cursor-pointer">2</div>
                            {[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((day) => (
                              <div
                                key={day}
                                onClick={() => setSelectedCalendarDay(day)}
                                className="py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Month 2: September 2026 */}
                        <div>
                          <div className="flex items-center justify-between font-bold text-xs text-gray-800 mb-3 px-1">
                            <span />
                            <div className="flex items-center gap-1">
                              <span>September 2026</span>
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </div>
                            <button type="button" className="text-gray-400 hover:text-gray-700 cursor-pointer">&gt;</button>
                          </div>

                          <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold mb-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                              <div key={i} className="py-1">{d}</div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 text-center text-xs text-gray-600 gap-y-1 font-medium">
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map((day) => (
                              <div
                                key={day}
                                onClick={() => setSelectedCalendarDay(day)}
                                className="py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                              >
                                {day}
                              </div>
                            ))}
                            <div className="py-1 border border-[#1B66FF] text-[#1B66FF] font-bold rounded-md cursor-pointer relative bg-blue-50/40">
                              <span>29</span>
                              <span className="w-1 h-1 rounded-full bg-[#1B66FF] absolute bottom-0.5 left-1/2 -translate-x-1/2" />
                            </div>
                            <div className="py-1 hover:bg-gray-100 rounded cursor-pointer">30</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Cancel / Apply Actions */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(false)}
                          className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
                        >
                          CANCEL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDatePickerOpen(false);
                            showToast(`Applied date range: ${selectedDateRangeLabel}`);
                          }}
                          className="px-5 py-1.5 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>

                    {/* Right Preset Buttons */}
                    <div className="w-36 space-y-1 border-l border-gray-100 pl-4 text-xs font-semibold">
                      {[
                        'TODAY',
                        'YESTERDAY',
                        'LAST WEEK',
                        'LAST MONTH',
                        'PAST 7 DAYS',
                        'PAST 30 DAYS',
                        'PAST 6 MONTHS',
                        'YEAR',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setSelectedDateRangeLabel(
                              preset === 'TODAY'
                                ? '29 Sep 2026 - 29 Sep 2026'
                                : preset === 'PAST 7 DAYS'
                                ? '22 Sep 2026 - 29 Sep 2026'
                                : preset === 'PAST 30 DAYS'
                                ? '30 Aug 2026 - 29 Sep 2026'
                                : `29 Sep 2026 (${preset})`
                            );
                            setIsDatePickerOpen(false);
                            showToast(`Date range set to ${preset}`);
                          }}
                          className="w-full text-center py-1.5 px-2 rounded-md border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors uppercase text-[10px] tracking-wider cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          <div className="flex items-center gap-2">
            {/* Google Looker Studio */}
            <button
              type="button"
              onClick={() => setIsDataStudioOpen(true)}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <span className="text-[#0B69FF] font-bold">☌</span>
              <span>DATA STUDIO</span>
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-400 rotate-180" />
              <span>EXPORT</span>
            </button>

            {/* RANKING SETTINGS ICON BUTTON */}
            <div className="relative" ref={rankingSettingsRef}>
              <button
                type="button"
                onClick={() => setIsRankingSettingsMenuOpen(!isRankingSettingsMenuOpen)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Ranking settings"
              >
                <Settings className="w-4 h-4 stroke-[2]" />
                {isRankingSettingsMenuOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {isRankingSettingsMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
                  <Link
                    href="/settings?site_id=12960641"
                    onClick={() => setIsRankingSettingsMenuOpen(false)}
                    className="block px-3.5 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
                  >
                    Project settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRankingSettingsMenuOpen(false);
                      setIsRankingSettingsModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors cursor-pointer"
                  >
                    Ranking settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 0% INDEXED Thin Line & Badge matching Screenshot 1 */}
        <div className="relative pt-1">
          <div className="w-full bg-gray-200 h-0.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00A86B] h-full transition-all duration-500"
              style={{ width: keywords.length > 0 ? '100%' : '0%' }}
            />
          </div>
          <div className="flex justify-center -mt-2.5">
            <span className="bg-[#00A86B] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              {keywords.length > 0 ? '100% INDEXED' : '0% INDEXED'}
            </span>
          </div>
        </div>

        {/* Action Buttons: + ADD KEYWORDS & RECHECK DATA Dropdown */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#00A86B] hover:bg-[#00925d] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD KEYWORDS</span>
          </button>

          {/* Recheck Data Dropdown */}
          <div className="relative" ref={recheckDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRecheckOpen(!isRecheckOpen)}
              disabled={isRechecking}
              className="bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
              <span>{isRechecking ? 'CHECKING...' : 'RECHECK DATA'}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {isRecheckOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
                <div
                  className="relative group"
                  onMouseEnter={() => setHoveredRecheckSubmenu('rankings')}
                  onMouseLeave={() => setHoveredRecheckSubmenu(null)}
                >
                  <div className="px-3.5 py-2 flex items-center justify-between text-gray-700 hover:bg-gray-100 cursor-pointer font-medium">
                    <span>Recheck live rankings</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  {hoveredRecheckSubmenu === 'rankings' && (
                    <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecheckOpen(false);
                          handleRecheckRankings(keywords.slice(0, 5).map((k) => k.id));
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Recheck selected
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecheckOpen(false);
                          handleRecheckRankings();
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-100 cursor-pointer font-semibold"
                      >
                        Recheck all
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className="relative group"
                  onMouseEnter={() => setHoveredRecheckSubmenu('search_volume')}
                  onMouseLeave={() => setHoveredRecheckSubmenu(null)}
                >
                  <div className="px-3.5 py-2 flex items-center justify-between text-gray-700 hover:bg-gray-100 cursor-pointer font-medium">
                    <span>Recheck search volume</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  {hoveredRecheckSubmenu === 'search_volume' && (
                    <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecheckOpen(false);
                          handleRecheckRankings();
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Recheck selected
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecheckOpen(false);
                          handleRecheckRankings();
                        }}
                        className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-gray-100 cursor-pointer font-semibold"
                      >
                        Recheck all
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DETAILED VIEW MATCHING SCREENSHOTS 1, 2, 3, 4 */}
        {/* ========================================================================= */}
        {activeTab === 'detailed' && (
          <div className="space-y-4">
            {/* Position Filters Row matching Screenshot 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left: Position filters label + buttons + counts */}
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mb-2">
                    <span>Position filters:</span>
                    <span className="cursor-help text-[10px]">ℹ</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Top Button Row */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'all', label: 'ALL', count: keywords.length },
                        { id: 'top1', label: 'TOP 1', count: countTop1 },
                        { id: 'top3', label: 'TOP 3', count: countTop3 },
                        { id: 'top5', label: 'TOP 5', count: countTop5 },
                        { id: 'top10', label: 'TOP 10', count: countTop10 },
                        { id: 'top30', label: 'TOP 30', count: countTop30 },
                        { id: 'over100', label: '>100', count: countOver100 },
                      ].map((tab) => (
                        <div key={tab.id} className="w-16 flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => setSelectedRange(tab.id)}
                            className={`w-full py-1.5 rounded text-center transition-colors cursor-pointer text-xs ${
                              selectedRange === tab.id
                                ? 'bg-[#4A4E69] text-white font-bold shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium'
                            }`}
                          >
                            {tab.label}
                          </button>
                          <span className="text-xs font-semibold text-gray-600 mt-1">
                            {tab.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Position range and Changes matching Screenshot 1 */}
                <div className="flex items-center gap-6 pt-1">
                  <div>
                    <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mb-2">
                      <span>Position range:</span>
                      <span className="cursor-help text-[10px]">ℹ</span>
                    </div>
                    <div className="w-14 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                      <input
                        type="text"
                        value={posMin}
                        onChange={(e) => setPosMin(e.target.value)}
                        placeholder="—"
                        className="w-full text-center text-xs text-gray-700 placeholder-gray-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mb-2">
                      <span>Changes:</span>
                      <span className="cursor-help text-[10px]">ℹ</span>
                    </div>
                    <div className="h-8 px-3 bg-white border border-gray-300 rounded flex items-center gap-3 text-xs font-semibold">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span>▲</span>
                        <span>{keywords.filter((k) => k.change > 0).length}</span>
                      </span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <span>▼</span>
                        <span>{keywords.filter((k) => k.change < 0).length}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Section matching Screenshot 1, 2, 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#5850EC]" />
                  <h3 className="text-sm font-bold text-gray-900">Insights</h3>
                  <span className="cursor-help text-gray-400 text-xs">ℹ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  {isInsightsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isInsightsOpen && (
                <div className="relative pt-2">
                  <div className="space-y-3">
                    {/* Card 1: 0 pages recommended for monitoring matching Screenshot 1 & 2 */}
                    <div className="bg-[#FAF5FF]/30 border border-purple-100/70 rounded-xl p-4 text-xs space-y-2">
                      <div className="font-bold text-[13px] text-gray-900">0 pages recommended for monitoring</div>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        We found <strong>0</strong> ranked pages for which you are not tracking changes. Monitor what affects your visibility. Then we can reveal the changes found when positions fall.{' '}
                        <button
                          type="button"
                          onClick={() => showToast('Starting page changes monitoring...')}
                          className="text-[#1B66FF] font-medium hover:underline cursor-pointer"
                        >
                          Start monitoring
                        </button>
                      </p>
                      <div className="pt-1">
                        <span className="text-[11px] bg-[#E0F2FE] text-[#0284C7] px-2.5 py-0.5 rounded font-semibold">
                          Content
                        </span>
                      </div>
                    </div>

                    {/* Card 2: 28 pages needing SEO refinement matching Screenshot 2 */}
                    {isInsightsExpanded && (
                      <div className="bg-[#FAF5FF]/30 border border-purple-100/70 rounded-xl p-4 text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-[13px] text-gray-900">28 pages needing SEO refinement</div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Your current Health Score is <strong>84</strong>, indicating strong site performance. Great job! Continue optimizing to reach even higher performance levels.{' '}
                          <button
                            type="button"
                            onClick={() => router.push('/website-audit')}
                            className="text-[#1B66FF] font-medium hover:underline cursor-pointer"
                          >
                            Check your efficiency and keep optimizing
                          </button>
                        </p>
                        <div className="pt-1">
                          <span className="text-[11px] bg-[#FFEDD5] text-[#EA580C] px-2.5 py-0.5 rounded font-semibold">
                            Tech SEO
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Card 3: High-impact keywords found matching Screenshot 2 & 3 */}
                    {isInsightsExpanded && (
                      <div className="bg-[#FAF5FF]/30 border border-purple-100/70 rounded-xl p-4 text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-[13px] text-gray-900">High-impact keywords found</div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Discover untapped, high-potential keywords—quick wins that can drive fast growth.{' '}
                          <button
                            type="button"
                            onClick={() => setIsHighPotentialModalOpen(true)}
                            className="text-[#1B66FF] font-medium hover:underline cursor-pointer"
                          >
                            Check them out now
                          </button>
                        </p>
                        <div className="pt-1">
                          <span className="text-[11px] bg-[#DCFCE7] text-[#16A34A] px-2.5 py-0.5 rounded font-semibold">
                            Opportunities
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Feedback Banner matching Screenshot 3 */}
                    {isInsightsExpanded && (
                      <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs text-gray-700 flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#1B66FF] shrink-0" />
                        <span>
                          Pick insights for adding next or share your ideas.{' '}
                          <button
                            type="button"
                            onClick={() => setIsFeedbackOpen(true)}
                            className="text-[#1B66FF] font-semibold hover:underline cursor-pointer"
                          >
                            Provide your feedback
                          </button>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View more insights button matching Screenshot 1 */}
                  {!isInsightsExpanded && (
                    <div className="flex justify-center -mt-3 relative z-10">
                      <button
                        type="button"
                        onClick={() => setIsInsightsExpanded(true)}
                        className="px-4 py-1.5 bg-[#5850EC] hover:bg-[#4B44C6] text-white text-xs font-semibold rounded-md flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                      >
                        <span>View more insights</span>
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      </button>
                    </div>
                  )}

                  {isInsightsExpanded && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsInsightsExpanded(false)}
                        className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                      >
                        Hide insights
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Google India Summary Box matching Screenshot 1, 2, 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <GoogleLogo className="w-4 h-4" />
                <CountryFlag code="IN" name="India" size="sm" />
                <h4 className="text-sm font-bold text-gray-900">Google India</h4>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-2xs relative overflow-hidden">
                {isMetricsVisible && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-4 text-xs">
                    <div className="px-3 py-1">
                      <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">AVERAGE POSITION</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1.5">{avgPosition}</div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">TRAFFIC FORECAST</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1.5">{totalTraffic}</div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">SEARCH VISIBILITY</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1.5">{searchVisibility}</div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1">
                        <span>SERP FEATURES</span>
                        <span className="cursor-help text-[10px] text-gray-400">ℹ</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-1.5">
                        {keywords.length > 0 ? 12 : 0}
                      </div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">% IN TOP 10</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1.5">
                        {keywords.length > 0 ? `${((countTop10 / keywords.length) * 100).toFixed(0)}%` : 0}
                      </div>
                    </div>
                    <div className="px-3 py-1">
                      <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">SELECTED KEYWORDS</div>
                      <div className="text-[11px] text-gray-500 mt-1.5 leading-snug">
                        Select keywords in the table to compare their rankings.
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Center Collapse Chevron matching Screenshot 3 */}
                <button
                  type="button"
                  onClick={() => setIsMetricsVisible(!isMetricsVisible)}
                  className="w-full py-1 flex justify-center items-center text-gray-400 hover:text-gray-600 border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Toggle metrics summary"
                >
                  {isMetricsVisible ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Keywords Table Container & Filter Bar matching Screenshot 3 & 4 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-gray-300 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
                    <GoogleLogo className="w-4 h-4" />
                    <CountryFlag code="IN" name="India" size="sm" />
                    <span>India</span>
                    <span className="text-[10px] text-gray-500 font-bold">EN</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#1B66FF] w-64 shadow-2xs"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* View Mode Dropdown matching Screenshot 3 & 4 */}
                  <div className="relative" ref={viewModeRef}>
                    <button
                      type="button"
                      onClick={() => setIsViewModeDropdownOpen(!isViewModeDropdownOpen)}
                      className="bg-white border border-gray-300 rounded-md px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer shadow-2xs hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-500">View mode:</span>
                      <Folder className="w-3.5 h-3.5 text-gray-600" />
                      <span>{selectedViewMode}</span>
                      {isViewModeDropdownOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>

                    {isViewModeDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
                        {[
                          { id: 'List', label: 'List', icon: List },
                          { id: 'Groups', label: 'Groups', icon: Folder },
                          { id: 'Tags', label: 'Tags', icon: Tag },
                          { id: 'URL in SERP', label: 'URL in SERP', icon: Link2 },
                          { id: 'Target URL', label: 'Target URL', icon: Target },
                          { id: 'Date', label: 'Date', icon: Clock },
                        ].map((item) => {
                          const IconComp = item.icon;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedViewMode(item.id as any);
                                setIsViewModeDropdownOpen(false);
                                showToast(`Switched view to ${item.label}`);
                              }}
                              className={`px-3 py-2 flex items-center gap-2.5 hover:bg-gray-100 cursor-pointer transition-colors ${
                                selectedViewMode === item.id ? 'bg-gray-50 font-bold text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5 text-gray-500" />
                              <span>{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('View link copied to clipboard!');
                    }}
                    className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-600 cursor-pointer shadow-2xs"
                    title="Copy view"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Filters panel opened')}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>⊲</span>
                    <span>FILTERS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Columns configuration opened')}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>☷</span>
                    <span>COLUMNS</span>
                  </button>
                </div>
              </div>

              {/* Exact Empty State matching Screenshot 4 */}
              {keywords.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#1B66FF] flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No keywords</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    You have not added any keywords to this project. Add a few keywords to see the rankings of your site.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-[#00A86B] hover:bg-[#00925d] text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD KEYWORDS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHighPotentialModalOpen(true)}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-lg shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      FIND HIGH-POTENTIAL KEYWORDS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Keyword</th>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">Change</th>
                        <th className="px-4 py-3">Search Volume</th>
                        <th className="px-4 py-3">CPC</th>
                        <th className="px-4 py-3">Difficulty</th>
                        <th className="px-4 py-3">Ranked URL</th>
                        <th className="px-4 py-3 text-right">Checked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {filteredKeywords.map((k) => (
                        <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                            <span>{k.keyword}</span>
                            {k.rank <= 3 && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                Top 3
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-xs ${
                                k.rank <= 3
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : k.rank <= 10
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              #{k.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {k.change > 0 ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" /> +{k.change}
                              </span>
                            ) : k.change < 0 ? (
                              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                <TrendingDown className="w-3 h-3" /> {k.change}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{k.volume.toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium">{k.cpc}</td>
                          <td className="px-4 py-3">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {k.difficulty}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#1B66FF] hover:underline truncate max-w-xs cursor-pointer">
                            {k.url}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400">{k.dateChecked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Legend Footer matching Screenshot 4 */}
              <div className="p-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                <div className="flex flex-wrap items-center gap-5 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Entered Top 10
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Left Top 10
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> In Top 10
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" /> Entered Top 100
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600">View on page:</span>
                  <div className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700 flex items-center gap-1 font-medium">
                    <span>100</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* HISTORICAL DATA VIEW MATCHING USER SCREENSHOTS 1 & 2 */}
        {/* ========================================================================= */}
        {activeTab === 'historical' && (
          <div className="space-y-4">
            {/* Position Filters Row matching Screenshot 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left: Position filters label + buttons + counts */}
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mb-2">
                    <span>Position filters:</span>
                    <span className="cursor-help text-[10px]">ℹ</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Top Button Row */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'all', label: 'ALL', count: keywords.length },
                        { id: 'top1', label: 'TOP 1', count: countTop1 },
                        { id: 'top3', label: 'TOP 3', count: countTop3 },
                        { id: 'top5', label: 'TOP 5', count: countTop5 },
                        { id: 'top10', label: 'TOP 10', count: countTop10 },
                        { id: 'top30', label: 'TOP 30', count: countTop30 },
                        { id: 'over100', label: '>100', count: countOver100 },
                      ].map((tab) => (
                        <div key={tab.id} className="w-16 flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => setSelectedRange(tab.id)}
                            className={`w-full py-1.5 rounded text-center transition-colors cursor-pointer text-xs ${
                              selectedRange === tab.id
                                ? 'bg-[#4A4E69] text-white font-bold shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium'
                            }`}
                          >
                            {tab.label}
                          </button>
                          <span className="text-xs font-semibold text-gray-600 mt-1">
                            {tab.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Position range and Changes matching Screenshot 1 */}
                <div className="flex items-center gap-6 pt-1">
                  <div>
                    <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mb-2">
                      <span>Position range:</span>
                      <span className="cursor-help text-[10px]">ℹ</span>
                    </div>
                    <div className="w-14 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                      <input
                        type="text"
                        value={posMin}
                        onChange={(e) => setPosMin(e.target.value)}
                        placeholder="—"
                        className="w-full text-center text-xs text-gray-700 placeholder-gray-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mb-2">
                      <span>Changes:</span>
                      <span className="cursor-help text-[10px]">ℹ</span>
                    </div>
                    <div className="h-8 px-3 bg-white border border-gray-300 rounded flex items-center gap-3 text-xs font-semibold">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span>▲</span>
                        <span>{keywords.filter((k) => k.change > 0).length}</span>
                      </span>
                      <span className="text-rose-600 flex items-center gap-1">
                        <span>▼</span>
                        <span>{keywords.filter((k) => k.change < 0).length}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Data 4-Column Metrics Card matching Screenshot 1 */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs relative overflow-hidden">
              {isMetricsVisible && (
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-4 text-xs">
                  <div className="px-3 py-1">
                    <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">AVERAGE POSITION</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1.5">{avgPosition}</div>
                  </div>
                  <div className="px-3 py-1">
                    <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">TRAFFIC FORECAST</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1.5">{totalTraffic}</div>
                  </div>
                  <div className="px-3 py-1">
                    <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">SEARCH VISIBILITY</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1.5">{searchVisibility}</div>
                  </div>
                  <div className="px-3 py-1">
                    <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">% IN TOP 10</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1.5">
                      {keywords.length > 0 ? `${((countTop10 / keywords.length) * 100).toFixed(0)}%` : 0}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Center Collapse Chevron matching Screenshot 1 */}
              <button
                type="button"
                onClick={() => setIsMetricsVisible(!isMetricsVisible)}
                className="w-full py-1 flex justify-center items-center text-gray-400 hover:text-gray-600 border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                title="Toggle metrics summary"
              >
                {isMetricsVisible ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Google India Header matching Screenshot 1 & 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <GoogleLogo className="w-4 h-4" />
                <CountryFlag code="IN" name="India" size="sm" />
                <h4 className="text-sm font-bold text-gray-900">Google India</h4>
              </div>

              {/* Keywords Table Container & Filter Bar matching Screenshot 1 & 2 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="bg-white border border-gray-300 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
                      <GoogleLogo className="w-4 h-4" />
                      <CountryFlag code="IN" name="India" size="sm" />
                      <span>India</span>
                      <span className="text-[10px] text-gray-500 font-bold">EN</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#1B66FF] w-64 shadow-2xs"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    {/* View Mode Dropdown matching Screenshot 1 */}
                    <div className="relative" ref={viewModeRef}>
                      <button
                        type="button"
                        onClick={() => setIsViewModeDropdownOpen(!isViewModeDropdownOpen)}
                        className="bg-white border border-gray-300 rounded-md px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-700 font-medium cursor-pointer shadow-2xs hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-500">View mode:</span>
                        <Folder className="w-3.5 h-3.5 text-gray-600" />
                        <span>{selectedViewMode}</span>
                        {isViewModeDropdownOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>

                      {isViewModeDropdownOpen && (
                        <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
                          {[
                            { id: 'List', label: 'List', icon: List },
                            { id: 'Groups', label: 'Groups', icon: Folder },
                            { id: 'Tags', label: 'Tags', icon: Tag },
                            { id: 'URL in SERP', label: 'URL in SERP', icon: Link2 },
                            { id: 'Target URL', label: 'Target URL', icon: Target },
                            { id: 'Date', label: 'Date', icon: Clock },
                          ].map((item) => {
                            const IconComp = item.icon;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedViewMode(item.id as any);
                                  setIsViewModeDropdownOpen(false);
                                  showToast(`Switched view to ${item.label}`);
                                }}
                                className={`px-3 py-2 flex items-center gap-2.5 hover:bg-gray-100 cursor-pointer transition-colors ${
                                  selectedViewMode === item.id ? 'bg-gray-50 font-bold text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                <IconComp className="w-3.5 h-3.5 text-gray-500" />
                                <span>{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('View link copied to clipboard!');
                      }}
                      className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-600 cursor-pointer shadow-2xs"
                      title="Copy view"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Filters panel opened')}
                      className="px-2.5 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>⊲</span>
                      <span>FILTERS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Columns configuration opened')}
                      className="px-2.5 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>☷</span>
                      <span>COLUMNS</span>
                    </button>
                  </div>
                </div>

                {/* Exact Empty State for Historical Data matching Screenshot 2 (ONLY "+ ADD KEYWORDS" button) */}
                {keywords.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#1B66FF] flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.35-4.35" />
                        <path d="M11 8v6M8 11h6" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">No keywords</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      You have not added any keywords to this project. Add a few keywords to see the rankings of your site.
                    </p>
                    <div className="flex items-center justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#00A86B] hover:bg-[#00925d] text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD KEYWORDS</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Keyword</th>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Change</th>
                          <th className="px-4 py-3">Search Volume</th>
                          <th className="px-4 py-3">CPC</th>
                          <th className="px-4 py-3">Difficulty</th>
                          <th className="px-4 py-3">Ranked URL</th>
                          <th className="px-4 py-3 text-right">Checked</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {filteredKeywords.map((k) => (
                          <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                              <span>{k.keyword}</span>
                              {k.rank <= 3 && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                  Top 3
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-xs ${
                                  k.rank <= 3
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : k.rank <= 10
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                #{k.rank}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {k.change > 0 ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                  <TrendingUp className="w-3 h-3" /> +{k.change}
                                </span>
                              ) : k.change < 0 ? (
                                <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                  <TrendingDown className="w-3 h-3" /> {k.change}
                                </span>
                              ) : (
                                <span className="text-gray-400 font-medium">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{k.volume.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-700 font-medium">{k.cpc}</td>
                            <td className="px-4 py-3">
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {k.difficulty}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#1B66FF] hover:underline truncate max-w-xs cursor-pointer">
                              {k.url}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-400">{k.dateChecked}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Legend Footer matching Screenshot 2 */}
                <div className="p-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                  <div className="flex flex-wrap items-center gap-5 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Entered Top 10
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Left Top 10
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" /> In Top 10
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#9CA3AF]" /> Entered Top 100
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-600">View on page:</span>
                    <div className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700 flex items-center gap-1 font-medium">
                      <span>100</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SUMMARY VIEW (When switched to Summary tab) */}
        {/* ========================================================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-1">
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  SEARCH VISIBILITY
                </div>
                <div className="text-3xl font-black text-gray-900 pt-1">
                  {searchVisibility}%
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-1">
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  AVERAGE POSITION
                </div>
                <div className="text-3xl font-black text-gray-900 pt-1">
                  {avgPosition}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-2">
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  ORGANIC TRAFFIC
                </div>
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsConnectGAOpen(true)}
                    className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                  >
                    <span className="text-amber-500 font-bold">📊</span>
                    <span>Connect Google Analytics</span>
                  </button>
                  <p className="text-[11px] text-gray-400 mt-1">for detailed information</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-gray-900">Distribution of top positions</h3>
                  <span className="cursor-help text-gray-400 text-xs">ⓘ</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-gray-500">
                    {(['CURRENT', '7D', '1M', '3M', '6M', '1Y', '2Y'] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setDistributionPeriod(period)}
                        className={`px-1.5 py-1 cursor-pointer transition-colors uppercase ${
                          distributionPeriod === period
                            ? 'text-[#0B69FF] font-bold border-b-2 border-[#0B69FF]'
                            : 'hover:text-gray-800'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> TOP 1</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> TOP 2-3</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EC4899]" /> TOP 4-5</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#14B8A6]" /> TOP 6-10</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#06B6D4]" /> TOP 11-30</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> TOP 31-100</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#94A3B8]" /> TOTAL</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-100 space-y-1">
                  <div className="text-[11px] text-gray-500 font-semibold">Top 1</div>
                  <div className="text-2xl font-bold text-gray-900">{countTop1}</div>
                </div>
                <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-100 space-y-1">
                  <div className="text-[11px] text-gray-500 font-semibold">Top 2-3</div>
                  <div className="text-2xl font-bold text-gray-900">{countTop3}</div>
                </div>
                <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-100 space-y-1">
                  <div className="text-[11px] text-gray-500 font-semibold">Top 4-5</div>
                  <div className="text-2xl font-bold text-gray-900">{countTop5}</div>
                </div>
                <div className="p-3 bg-gray-50/60 rounded-lg border border-gray-100 space-y-1">
                  <div className="text-[11px] text-gray-500 font-semibold">Top 6-10</div>
                  <div className="text-2xl font-bold text-gray-900">{countTop10}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>KEYWORDS IN SERP</span>
                  <span className="cursor-help text-xs">ⓘ</span>
                </div>
                <div className="text-3xl font-black text-gray-900">{keywords.length}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 border-b border-gray-200 pb-2">
                    <span>JUMPED (0)</span>
                    <div className="flex items-center gap-6 text-[10px] text-gray-400">
                      <span>%</span>
                      <span>KEYWORDS</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {[
                      { label: 'TOP 1', color: 'bg-emerald-500' },
                      { label: 'TOP 2-3', color: 'bg-emerald-500' },
                      { label: 'TOP 4-5', color: 'bg-emerald-500' },
                      { label: 'TOP 6-10', color: 'bg-emerald-500' },
                      { label: 'TOP 11-30', color: 'bg-emerald-500' },
                      { label: 'TOP 31-100', color: 'bg-emerald-500' },
                      { label: '>100', color: 'bg-emerald-500' },
                    ].map((row, i) => (
                      <div key={i} className="py-1.5 flex items-center justify-between text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.color}`} />
                          <span className="font-medium text-gray-800">{row.label}</span>
                        </div>
                        <div className="flex items-center gap-10 text-right font-medium">
                          <span className="w-8">0%</span>
                          <span className="w-8 text-gray-900 font-bold">0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 border-b border-gray-200 pb-2">
                    <span>DROPPED (0)</span>
                    <div className="flex items-center gap-6 text-[10px] text-gray-400">
                      <span>%</span>
                      <span>KEYWORDS</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {[
                      { label: 'TOP 1', color: 'bg-rose-500' },
                      { label: 'TOP 2-3', color: 'bg-rose-500' },
                      { label: 'TOP 4-5', color: 'bg-rose-500' },
                      { label: 'TOP 6-10', color: 'bg-rose-500' },
                      { label: 'TOP 11-30', color: 'bg-rose-500' },
                      { label: 'TOP 31-100', color: 'bg-rose-500' },
                      { label: '>100', color: 'bg-rose-500' },
                    ].map((row, i) => (
                      <div key={i} className="py-1.5 flex items-center justify-between text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.color}`} />
                          <span className="font-medium text-gray-800">{row.label}</span>
                        </div>
                        <div className="flex items-center gap-10 text-right font-medium">
                          <span className="w-8">0%</span>
                          <span className="w-8 text-gray-900 font-bold">0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 border-b border-gray-200 pb-2">
                    <span>UNCHANGED (0)</span>
                    <div className="flex items-center gap-6 text-[10px] text-gray-400">
                      <span>%</span>
                      <span>KEYWORDS</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {[
                      { label: 'TOP 1', color: 'bg-gray-400' },
                      { label: 'TOP 2-3', color: 'bg-gray-400' },
                      { label: 'TOP 4-5', color: 'bg-gray-400' },
                      { label: 'TOP 6-10', color: 'bg-gray-400' },
                      { label: 'TOP 11-30', color: 'bg-gray-400' },
                      { label: 'TOP 31-100', color: 'bg-gray-400' },
                      { label: '>100', color: 'bg-gray-400' },
                    ].map((row, i) => (
                      <div key={i} className="py-1.5 flex items-center justify-between text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.color}`} />
                          <span className="font-medium text-gray-800">{row.label}</span>
                        </div>
                        <div className="flex items-center gap-10 text-right font-medium">
                          <span className="w-8">0%</span>
                          <span className="w-8 text-gray-900 font-bold">0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900">Competitors</h3>
                  <span className="cursor-help text-gray-400 text-xs">ⓘ</span>
                </div>
                <div className="py-14 text-center space-y-2">
                  <Search className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-xs font-bold text-gray-800">No data</div>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    The system has no search engine results data available for this day
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900">Distribution of competitors</h3>
                  <span className="cursor-help text-gray-400 text-xs">ⓘ</span>
                </div>
                <div className="py-14 text-center space-y-2">
                  <Search className="w-8 h-8 text-gray-400 mx-auto" />
                  <div className="text-xs font-bold text-gray-800">No data</div>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    The system has no search engine results data available for this day
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Section matching Screenshot 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xl font-bold text-gray-900">Notes</h3>
                <button
                  type="button"
                  onClick={() => setIsCreateNoteOpen(true)}
                  className="bg-[#00A86B] hover:bg-[#00925d] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>CREATE A NOTE</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">NOTES</th>
                      <th className="py-2.5 px-3 w-36">DATE</th>
                      <th className="py-2.5 px-3 w-44">CATEGORY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {notes.map((note) => {
                      const isExpanded = expandedNoteIds.includes(note.id);
                      return (
                        <tr key={note.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-3 space-y-1 align-top">
                            <div className="font-bold text-gray-900 text-xs">{note.title}</div>
                            <p className="text-gray-600 text-[11px] leading-relaxed max-w-2xl">
                              {isExpanded ? note.fullDesc : note.shortDesc}{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isExpanded) {
                                    setExpandedNoteIds((prev) => prev.filter((id) => id !== note.id));
                                  } else {
                                    setExpandedNoteIds((prev) => [...prev, note.id]);
                                  }
                                }}
                                className="text-[#1B66FF] font-medium hover:underline cursor-pointer"
                              >
                                {isExpanded ? 'Show less' : 'Show more'}
                              </button>
                            </p>
                          </td>
                          <td className="py-3 px-3 text-gray-500 font-medium text-xs align-top whitespace-nowrap">
                            {note.date}
                          </td>
                          <td className="py-3 px-3 text-xs align-top">
                            <div className="flex items-center gap-1.5 font-medium text-gray-800">
                              <GoogleLogo className="w-3.5 h-3.5 shrink-0" />
                              <span>{note.category}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* View all (45) button matching Screenshot 2 */}
              <div className="pt-2 flex justify-start">
                <Link
                  href="/notes"
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors uppercase tracking-wider"
                >
                  <span>VIEW ALL (45)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE A NOTE MODAL matching exact SE Ranking user screenshot */}
      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        availableKeywords={keywords.map((k) => k.keyword)}
        onSaveNote={(newNote) => {
          setNotes((prev) => [newNote, ...prev]);
          showToast('Note created successfully!');
        }}
      />

      {/* CONNECT GOOGLE ANALYTICS MODAL */}
      {isConnectGAOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="text-amber-500">📊</span>
                Connect Google Analytics 4
              </h3>
              <button
                type="button"
                onClick={() => setIsConnectGAOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Connect your GA4 property to view live organic sessions, conversions, and revenue directly next to keyword ranking movements.
            </p>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
              Property: <strong>{domain.replace(/^https?:\/\//, '')} (GA4-48291054)</strong>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsConnectGAOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Google Analytics 4 connected!');
                  setIsConnectGAOpen(false);
                }}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Connect Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RANKING SETTINGS MODAL */}
      {isRankingSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#453768] text-white rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Rankings Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRankingSettingsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Rank Checking Frequency</label>
                <select
                  value={rankingFrequency}
                  onChange={(e) => setRankingFrequency(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-xs text-gray-900"
                >
                  <option value="Daily">Daily</option>
                  <option value="Every 3 days">Every 3 days</option>
                  <option value="Weekly">Weekly (On Mondays)</option>
                  <option value="Manual">Manual check only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Search Volume Source</label>
                <select
                  value={searchVolumeSource}
                  onChange={(e) => setSearchVolumeSource(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-xs text-gray-900"
                >
                  <option value="Google Keyword Planner">Google Keyword Planner (Default)</option>
                  <option value="SE Ranking Database">SE Ranking Dynamic Regional DB</option>
                  <option value="Blended">Blended (Search Volume + Click Potential)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trackSerpFeatures}
                    onChange={(e) => setTrackSerpFeatures(e.target.checked)}
                    className="rounded text-[#0B69FF] w-4 h-4"
                  />
                  <span>Track SERP features (Featured Snippets, People Also Ask, Local Pack)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exactMatchMode}
                    onChange={(e) => setExactMatchMode(e.target.checked)}
                    className="rounded text-[#0B69FF] w-4 h-4"
                  />
                  <span>Exact URL matching mode (ignore subdomains and subpaths)</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsRankingSettingsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRankingSettingsModalOpen(false);
                  showToast('Rankings settings saved successfully!');
                }}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Potential Keywords Modal */}
      {isHighPotentialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0B69FF]" />
                <h3 className="font-bold text-sm text-gray-900">High-Potential Keywords for {domain}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHighPotentialModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-500 text-xs">
                Select high search volume, low competition search terms with commercial intent:
              </p>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {HIGH_POTENTIAL_KEYWORDS.map((item) => (
                  <label
                    key={item.keyword}
                    className="p-3 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedHighPotential.includes(item.keyword)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHighPotential((prev) => [...prev, item.keyword]);
                          } else {
                            setSelectedHighPotential((prev) => prev.filter((k) => k !== item.keyword));
                          }
                        }}
                        className="w-4 h-4 rounded text-[#0B69FF]"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{item.keyword}</div>
                        <div className="text-[11px] text-gray-400">{item.intent} · CPC: {item.cpc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0B69FF]">{item.volume.toLocaleString()} vol</div>
                      <div className="text-[10px] font-semibold text-emerald-600">KD {item.kd}%</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <span className="text-gray-500 text-xs">
                  {selectedHighPotential.length} keywords selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHighPotentialModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addSelectedHighPotential}
                    disabled={selectedHighPotential.length === 0}
                    className="px-5 py-2 bg-[#00A86B] hover:bg-[#00925d] disabled:opacity-50 text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Add Selected to Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Keywords Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00A86B]" />
                Add Keywords to Track
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeywords} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter keywords (one per line) *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`work composer\nemployee tracking software\ntime tracking software\nremote team management\nactivity monitoring`}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:border-[#00A86B] font-mono leading-relaxed"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-relaxed">
                ℹ️ Positions will be tracked in real time for <strong>Google India (EN)</strong>. Daily historical position tracking will activate immediately.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer uppercase tracking-wider"
                >
                  Add &amp; Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Looker Studio Modal */}
      {isDataStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Google Looker Studio Connector</h3>
              <button
                type="button"
                onClick={() => setIsDataStudioOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Export and visualize your live SE Ranking keyword positions and historical trends directly in Google Looker Studio reports.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono break-all text-gray-700">
              https://lookerstudio.google.com/datasources/create?connectorId=se_ranking_12960641
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDataStudioOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://lookerstudio.google.com/datasources/create?connectorId=se_ranking_12960641');
                  showToast('Connector link copied!');
                  setIsDataStudioOpen(false);
                }}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Copy Connector Link
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
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or team members to let them view website rankings without logging into the system.
            </p>
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;hv=e8a49...
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641');
                  showToast('Guest link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-[#0B69FF] font-semibold hover:underline shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
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

export default function RankingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading rankings...</div>}>
      <RankingsPageContent />
    </Suspense>
  );
}
