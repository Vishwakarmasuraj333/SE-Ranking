'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Settings,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Search,
  CheckCircle2,
  FileSearch,
  Link2,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Check,
  Globe,
  Upload,
  GripVertical,
  RotateCcw,
  Copy,
  LayoutGrid,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/components/providers/AppProviders';
import { appWrapData } from '@/lib/appWrapData';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

const SUGGESTED_HIGH_POTENTIAL = [
  { keyword: 'employee monitoring software', volume: '14.8K', kd: 28, intent: 'Commercial', cpc: '$4.50' },
  { keyword: 'work time tracker', volume: '8.1K', kd: 22, intent: 'Commercial', cpc: '$3.20' },
  { keyword: 'remote employee tracking software', volume: '5.4K', kd: 25, intent: 'Commercial', cpc: '$4.10' },
  { keyword: 'automatic screenshot monitoring tool', volume: '2.4K', kd: 16, intent: 'High Potential', cpc: '$5.10' },
  { keyword: 'desktop activity tracker', volume: '3.6K', kd: 19, intent: 'Commercial', cpc: '$2.80' },
  { keyword: 'remote team productivity tool', volume: '5.2K', kd: 24, intent: 'Commercial', cpc: '$3.90' },
  { keyword: 'time tracking software with screenshots', volume: '1.9K', kd: 18, intent: 'Commercial', cpc: '$3.40' },
];

const mockBacklinkTrend = [
  { date: '06 Jul', backlinks: 60, referring: 41, domainTrust: 21, pageTrust: 6 },
  { date: '20 Jul', backlinks: 60, referring: 41, domainTrust: 21, pageTrust: 6 },
  { date: '03 Aug', backlinks: 55, referring: 38, domainTrust: 21, pageTrust: 6 },
  { date: '17 Aug', backlinks: 55, referring: 40, domainTrust: 23, pageTrust: 6 },
  { date: '31 Aug', backlinks: 55, referring: 40, domainTrust: 23, pageTrust: 6 },
  { date: '14 Sep', backlinks: 55, referring: 41, domainTrust: 23, pageTrust: 6 },
  { date: '28 Sep', backlinks: 55, referring: 41, domainTrust: 26, pageTrust: 6 },
];

const DEFAULT_SECTIONS = [
  'comp_ai_search',
  'rankings',
  'analytics_traffic',
  'backlink_checker',
  'key_metrics',
  'ai_results_tracker',
  'marketing_plan',
  'comp_research_geo',
  'insights',
  'website_audit',
  'content_keywords',
];

const WIDGET_NAMES: Record<string, string> = {
  comp_ai_search: 'Competitive Research - AI Search',
  rankings: 'Rankings',
  analytics_traffic: 'Analytics and traffic',
  backlink_checker: 'Backlink Checker',
  key_metrics: 'Key metrics',
  ai_results_tracker: 'AI Results Tracker',
  marketing_plan: 'Marketing Plan',
  comp_research_geo: 'Competitive Research',
  insights: 'Insights',
  website_audit: 'Website Audit',
  content_keywords: 'Content',
};

export default function ProjectOverviewPage() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'https://www.workcomposer.com/';

  // Sections order for Drag and Drop (uper niche)
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(DEFAULT_SECTIONS);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    comp_ai_search: true,
    rankings: true,
    analytics_traffic: true,
    backlink_checker: true,
    key_metrics: true,
    ai_results_tracker: true,
    marketing_plan: true,
    comp_research_geo: true,
    insights: true,
    website_audit: true,
    content_keywords: true,
  });

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isWidgetsDropdownOpen, setIsWidgetsDropdownOpen] = useState(false);
  const widgetsDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic state for Add Keywords Modal
  const [isAddKeywordsOpen, setIsAddKeywordsOpen] = useState(false);
  const [newKeywordsText, setNewKeywordsText] = useState('');
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Guest Link & Feedback Modals matching screenshots
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isHighPotentialModalOpen, setIsHighPotentialModalOpen] = useState(false);
  const [selectedHighPotential, setSelectedHighPotential] = useState<string[]>([
    'employee monitoring software',
    'work time tracker',
    'remote employee tracking software',
  ]);
  const [feedbackText, setFeedbackText] = useState('');

  // Overview Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('15m');
  const [defaultPeriod, setDefaultPeriod] = useState('Last 30 days');

  // Interactive Section Dropdown States
  const [aiSearchBrand, setAiSearchBrand] = useState('WorkCo');
  const [isAiSearchBrandOpen, setIsAiSearchBrandOpen] = useState(false);
  const [aiSearchPeriod, setAiSearchPeriod] = useState('Last 30 days');
  const [isAiSearchPeriodOpen, setIsAiSearchPeriodOpen] = useState(false);

  const [aiTrackerBrand, setAiTrackerBrand] = useState('WorkCo');
  const [isAiTrackerBrandOpen, setIsAiTrackerBrandOpen] = useState(false);
  const [aiTrackerEngines, setAiTrackerEngines] = useState('1 AI engines · 0 prompts');
  const [isAiTrackerEnginesOpen, setIsAiTrackerEnginesOpen] = useState(false);
  const [aiTrackerPeriod, setAiTrackerPeriod] = useState('27 Sept - 29 Sept, 2026');
  const [isAiTrackerPeriodOpen, setIsAiTrackerPeriodOpen] = useState(false);

  const [rankingsEngine, setRankingsEngine] = useState('Google India');
  const [isRankingsEngineOpen, setIsRankingsEngineOpen] = useState(false);
  const [rankingsPeriod, setRankingsPeriod] = useState('Past 30 days');
  const [isRankingsPeriodOpen, setIsRankingsPeriodOpen] = useState(false);

  const [compGeo, setCompGeo] = useState('India');
  const [isCompGeoOpen, setIsCompGeoOpen] = useState(false);

  const [contentEngine, setContentEngine] = useState('Google India (EN)');
  const [isContentEngineOpen, setIsContentEngineOpen] = useState(false);

  // Close widgets dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetsDropdownRef.current && !widgetsDropdownRef.current.contains(e.target as Node)) {
        setIsWidgetsDropdownOpen(false);
      }
    };
    if (isWidgetsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isWidgetsDropdownOpen]);

  // Load saved order from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('se_ranking_overview_order');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSectionsOrder(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveOrder = (newOrder: string[]) => {
    setSectionsOrder(newOrder);
    if (typeof window !== 'undefined') {
      localStorage.setItem('se_ranking_overview_order', JSON.stringify(newOrder));
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...sectionsOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    saveOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
    showNotice(`Moved section up/down successfully!`);
  };

  // Arrow buttons (Uper / Niche)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...sectionsOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    saveOrder(newOrder);
    showNotice(`Moved ${WIDGET_NAMES[temp]} up`);
  };

  const moveDown = (index: number) => {
    if (index === sectionsOrder.length - 1) return;
    const newOrder = [...sectionsOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    saveOrder(newOrder);
    showNotice(`Moved ${WIDGET_NAMES[temp]} down`);
  };

  const toggleWidgetVisibility = (key: string) => {
    setVisibleWidgets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetLayout = () => {
    saveOrder(DEFAULT_SECTIONS);
    const allVisible = DEFAULT_SECTIONS.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setVisibleWidgets(allVisible);
    setIsWidgetsDropdownOpen(false);
    showNotice('Layout reset to default SE Ranking order');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    const added = newKeywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    if (added.length > 0) {
      setKeywordList((prev) => [...prev, ...added]);
      setNewKeywordsText('');
      setIsAddKeywordsOpen(false);
      showNotice(`${added.length} keywords added to tracking!`);
    }
  };

  // Render individual widget by ID
  const renderWidget = (sectionId: string, index: number) => {
    if (!visibleWidgets[sectionId]) return null;

    // Clean, authentic widget header matching real SE Ranking (Screenshot 1-5)
    const headerControls = (title: React.ReactNode, rightControls?: React.ReactNode) => (
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 select-none">
        <div className="flex items-center gap-2 flex-wrap">
          {title}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          {rightControls}
          <button
            type="button"
            onClick={() => toggleWidgetVisibility(sectionId)}
            className="p-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            title="Hide widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );

    let content: React.ReactNode = null;

    switch (sectionId) {
      case 'comp_ai_search':
        content = (
          <div className="space-y-3">
            {headerControls(
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="font-bold text-gray-900 text-sm">Competitive Research - AI Search ⓘ</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600 font-medium">Brand: WorkCo</span>
                <span className="text-gray-600 font-medium">Last 30 days</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {/* AI Overview */}
              <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-[#0B69FF]">✦</span>
                  <span>AI Overview</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Mentions ⓘ</span>
                  <span className="font-bold text-[#0B69FF]">13.5K</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Link Presence ⓘ</span>
                  <span className="font-bold text-gray-900">6</span>
                </div>
              </div>

              {/* AI Mode */}
              <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-amber-500">✦</span>
                  <span>AI Mode</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Mentions ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Link Presence ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

              {/* ChatGPT */}
              <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-emerald-600 font-bold">◎</span>
                  <span>ChatGPT</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Mentions ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Link Presence ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

              {/* Gemini */}
              <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-blue-500">✦</span>
                  <span>Gemini</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Mentions ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Link Presence ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

              {/* Perplexity */}
              <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-purple-500">✱</span>
                  <span>Perplexity</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Mentions ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Link Presence ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
        );
        break;

      case 'rankings':
        content = (
          <div className="space-y-4">
            {headerControls(
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-sm text-gray-900">Rankings</span>

                {/* Google India EN Dropdown matching Screenshot 3 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRankingsEngineOpen(!isRankingsEngineOpen);
                      setIsRankingsPeriodOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 cursor-pointer text-xs shadow-2xs"
                  >
                    <span className="font-bold text-xs text-blue-600">G</span>
                    <span className="text-sm">🇮🇳</span>
                    <span>{rankingsEngine}</span>
                    <span className="text-[10px] font-bold text-gray-500">EN</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isRankingsEngineOpen && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsRankingsEngineOpen(false)}
                        className="w-full text-left px-3 py-1.5 bg-gray-100 font-semibold text-gray-900 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-600">G</span>
                          <span className="text-sm">🇮🇳</span>
                          <span>Google India</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">EN</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Past 30 days Dropdown matching Screenshot 2 */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRankingsPeriodOpen(!isRankingsPeriodOpen);
                      setIsRankingsEngineOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 cursor-pointer text-xs shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{rankingsPeriod}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isRankingsPeriodOpen && (
                    <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {['Today', 'Yesterday', 'Last Week', 'Last month', 'Past 7 days', 'Past 30 days'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setRankingsPeriod(p);
                            setIsRankingsPeriodOpen(false);
                            showNotice(`Rankings date range: ${p}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                            rankingsPeriod === p ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="py-8 text-center space-y-3">
              <h3 className="text-base font-bold text-gray-900">Add keywords</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Type manually, select from the suggested list, import copy-paste in a column from any text editor.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-4 py-2 bg-[#20B26C] hover:bg-[#1BA061] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD KEYWORDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                >
                  FIND HIGH-POTENTIAL KEYWORDS
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'analytics_traffic':
        content = (
          <div className="space-y-4">
            {headerControls(
              <span className="font-bold text-sm text-gray-900">Analytics and traffic</span>
            )}
            <div className="py-8 text-center space-y-3">
              <h3 className="text-base font-bold text-gray-900">Analytics and statistics services</h3>
              <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
                Connect Google Analytics and statistics services to get detailed information about your website without switching between browser tabs. It will only take a few minutes.
              </p>
              <div className="flex flex-col items-center gap-2.5 pt-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => showNotice('Connecting to Google Analytics...')}
                  className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="text-amber-500 font-bold">📊</span>
                  <span>Connect Google Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={() => showNotice('Connecting to Google Search Console...')}
                  className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="font-bold text-blue-600">G</span>
                  <span>Connect Google Search Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => showNotice('Connecting to Matomo Analytics...')}
                  className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <span className="text-blue-500 font-bold">Ⓜ</span>
                  <span>Connect Matomo Analytics</span>
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'backlink_checker':
        content = (
          <div className="space-y-4">
            {headerControls(
              <span className="font-bold text-sm text-gray-900">Backlink Checker</span>
            )}
            <div className="py-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-[#0B69FF] flex items-center justify-center mx-auto">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Backlink Checker</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Get the full list of backlinks for your domain along with additional data for each backlink.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => showNotice('Running backlink analysis for https://www.workcomposer.com/...')}
                  className="px-6 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                >
                  RUN ANALYSIS
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'key_metrics':
        content = (
          <div className="space-y-4">
            {headerControls(
              <span className="font-bold text-sm text-gray-900">Key metrics</span>,
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer mr-1"
                title="Key metrics settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-1">
              {/* Column 1: AI PRESENCE */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>AI PRESENCE ⓘ</span>
                  <span className="text-sm">🇮🇳</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#0B69FF]">0.54%</span>
                  <span className="text-xs font-bold text-emerald-600">▲ 0.001%</span>
                </div>
                <div className="text-[10px] text-gray-400">Sep, 2026</div>
              </div>

              {/* Column 2: ORGANIC TRAFFIC */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>ORGANIC TRAFFIC ⓘ</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🇮🇳</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
                <div className="text-2xl font-black text-gray-900">514</div>
                <div className="text-[10px] text-gray-400">Sep, 2026</div>
              </div>

              {/* Column 3: ORGANIC KEYWORDS */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>ORGANIC KEYWORDS ⓘ</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🇮🇳</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
                <div className="text-2xl font-black text-gray-900">131</div>
                <div className="text-[10px] text-gray-400">Sep, 2026</div>
              </div>

              {/* Column 4: REFERRING DOMAINS */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="text-[11px] text-gray-500 font-bold uppercase">
                  <span>REFERRING DOMAINS ⓘ</span>
                </div>
                <div className="text-xs text-gray-500">Get backlink data</div>
                <button
                  type="button"
                  onClick={() => showNotice('Running backlink analysis...')}
                  className="text-xs font-bold text-white bg-[#0B69FF] hover:bg-[#005FE0] px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Run analysis
                </button>
              </div>

              {/* Column 5: SEARCH VISIBILITY */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>SEARCH VISIBILITY ⓘ</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-600 text-xs">G</span>
                    <span className="text-sm">🇮🇳</span>
                    <span className="text-[10px] font-bold text-gray-500">EN</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">Get site visibility data</div>
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="text-xs font-bold text-white bg-[#20B26C] hover:bg-[#1BA061] px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Add keywords
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'ai_results_tracker':
        content = (
          <div className="space-y-4">
            {headerControls(
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="font-bold text-gray-900 text-sm">AI Results Tracker ⓘ</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600 font-medium">Brand: WorkCo</span>
                <span className="text-gray-600 font-medium">1 AI engines · 0 prompts</span>
                <span className="text-gray-600 font-medium">27 Sept - 29 Sept, 2026</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5">
                <div className="font-bold text-xs text-gray-900">Mention presence</div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  The search engine has been created, but prompts have not yet been added. Please add
                  prompts to start the analysis.
                </p>
                <Link
                  href="/research/ai-search"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B69FF] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add prompts</span>
                </Link>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5">
                <div className="font-bold text-xs text-gray-900">Link presence</div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  The search engine has been created, but prompts have not yet been added. Please add
                  prompts to start the analysis.
                </p>
                <Link
                  href="/research/ai-search"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B69FF] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add prompts</span>
                </Link>
              </div>

              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2.5">
                <div className="font-bold text-xs text-gray-900">AI Overview presence</div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  The search engine has been created, but prompts have not yet been added. Please add
                  prompts to start the analysis.
                </p>
                <Link
                  href="/research/ai-search"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B69FF] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add prompts</span>
                </Link>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 pt-1">
              ⓘ Widgets display combined metrics from all AI search systems added to the project.
            </div>
          </div>
        );
        break;

      case 'marketing_plan':
        content = (
          <div className="space-y-3">
            {headerControls(<span className="font-bold text-sm text-gray-900">Marketing Plan</span>)}
            <div className="space-y-3 pt-1">
              <div>
                <div className="font-black text-3xl text-gray-900">65</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Marketing tasks</div>
              </div>

              {/* Orange progress bar */}
              <div className="w-full bg-[#F59E0B] h-3.5 rounded-sm" />

              <div className="space-y-2 text-xs pt-1 text-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Done</span>
                  </div>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span>To Do</span>
                  </div>
                  <span className="font-bold text-gray-900">65</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                    <span>Ignored</span>
                  </div>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

              <Link
                href="/marketing-plan"
                className="inline-block mt-3 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                VIEW FULL REPORT
              </Link>
            </div>
          </div>
        );
        break;

      case 'comp_research_geo':
        content = (
          <div className="space-y-4">
            {headerControls(
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="font-bold text-sm text-gray-900">Competitive Research</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCompGeoOpen(!isCompGeoOpen)}
                    className="flex items-center gap-1.5 text-xs text-gray-700 font-medium bg-white border border-gray-300 hover:bg-gray-50 px-2.5 py-1 rounded transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>🇮🇳</span>
                    <span>{compGeo}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isCompGeoOpen && (
                    <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {[
                        { name: 'India', flag: '🇮🇳' },
                        { name: 'United States', flag: '🇺🇸' },
                        { name: 'United Kingdom', flag: '🇬🇧' },
                        { name: 'Germany', flag: '🇩🇪' },
                        { name: 'Australia', flag: '🇦🇺' },
                      ].map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setCompGeo(c.name);
                            setIsCompGeoOpen(false);
                            showNotice(`Competitive research region: ${c.name}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            compGeo === c.name ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                          {compGeo === c.name && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-gray-500 font-medium">Sep, 2026</span>
                <span className="text-gray-400 font-medium">Compare to: Aug, 2026</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
              {/* Left 4 metric boxes (2x2) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                    <div className="text-[11px] text-gray-500 font-bold uppercase">ORGANIC TRAFFIC ⓘ</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">514</span>
                      <span className="text-sm font-semibold text-gray-400">0</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                    <div className="text-[11px] text-gray-500 font-bold uppercase">PAID TRAFFIC ⓘ</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#0B69FF]">42</span>
                      <span className="text-sm font-semibold text-gray-400">0</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                    <div className="text-[11px] text-gray-500 font-bold uppercase">ORGANIC KEYWORDS ⓘ</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">131</span>
                      <span className="text-sm font-semibold text-gray-400">0</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                    <div className="text-[11px] text-gray-500 font-bold uppercase">PAID KEYWORDS ⓘ</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#0B69FF]">3</span>
                      <span className="text-sm font-semibold text-gray-400">0</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/competitors"
                  className="inline-block px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                >
                  VIEW FULL REPORT
                </Link>
              </div>

              {/* Right Top Competitors Table */}
              <div className="lg:col-span-6 bg-gray-50/50 border border-gray-200 rounded-xl p-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200 pb-2">
                      <th className="text-left font-bold py-2">Top competitors</th>
                      <th className="text-right font-bold py-2">Organic tr...</th>
                      <th className="text-right font-bold py-2">Domain Tru...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 flex items-center gap-2 font-medium text-gray-800">
                        <span className="text-sm">🌐</span>
                        <a href="https://onetracker.in" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-[#0B69FF]">
                          <span>onetracker.in</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="text-right py-2.5 font-bold text-gray-900">46</td>
                      <td className="text-right py-2.5 font-bold text-gray-900">1</td>
                    </tr>
                    <tr className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2.5 flex items-center gap-2 font-medium text-gray-800">
                        <span className="text-sm">🌐</span>
                        <a href="https://afk-assistant.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-[#0B69FF]">
                          <span>afk-assistant.com</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="text-right py-2.5 font-bold text-gray-900">0</td>
                      <td className="text-right py-2.5 font-bold text-gray-900">4</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        break;

      case 'insights':
        content = (
          <div className="space-y-4">
            {headerControls(<span className="font-bold text-sm text-gray-900">Insights</span>)}
            <div className="py-8 text-center space-y-3">
              <h3 className="text-base font-bold text-gray-900">Add keywords</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Type manually, select from the suggested list, import copy-paste in a column from any
                text editor.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-5 py-2 bg-[#20B26C] hover:bg-[#1BA061] text-white text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD KEYWORDS</span>
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'website_audit':
        content = (
          <div className="space-y-4">
            {headerControls(
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="font-bold text-sm text-gray-900">Website Audit</span>
                <button
                  type="button"
                  onClick={() => showNotice('Starting website audit...')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-bold uppercase transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3 text-gray-500" />
                  <span>UPDATE</span>
                </button>
                <span className="text-gray-500 font-medium">Updated: Sep-27 2026 05:32:58</span>
                <span className="text-gray-400 font-medium">Compare to: Sep-23 2026 10:06:31</span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1 items-start">
              {/* Health Score */}
              <div className="space-y-1">
                <div className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <span>HEALTH SCORE</span>
                  <span className="cursor-help text-[10px]">ⓘ</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#0B69FF]">84</span>
                  <span className="text-xs font-bold text-rose-500">▼ 16</span>
                </div>
                <div className="h-9 w-full pt-1.5">
                  <svg className="w-full h-6 overflow-visible" viewBox="0 0 160 26" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="healthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,18 Q 45,22 85,16 T 160,11 L 160,26 L 0,26 Z"
                      fill="url(#healthGrad)"
                    />
                    <path
                      d="M 0,18 Q 45,22 85,16 T 160,11"
                      fill="none"
                      stroke="#93C5FD"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Crawled Pages */}
              <div className="space-y-1">
                <div className="text-[11px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  <span>CRAWLED PAGES</span>
                  <span className="cursor-help text-[10px]">ⓘ</span>
                </div>
                <div className="text-4xl font-black text-[#0B69FF]">79</div>
                <div className="h-9 flex items-end gap-16 pt-1">
                  {/* Left short tick/bar matching screenshot */}
                  <div className="w-1.5 h-1.5 bg-[#0B69FF] rounded-2xs" />
                  {/* Right tall vertical bar matching screenshot */}
                  <div className="w-1.5 h-7 bg-[#0B69FF] rounded-2xs" />
                </div>
              </div>

              {/* Errors & Notices */}
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] text-gray-400 font-bold uppercase">ERRORS</div>
                  <div className="text-3xl font-black text-[#EF4444]">2</div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-[11px] text-gray-400 font-bold uppercase">NOTICES</div>
                  <div className="text-3xl font-black text-[#0B69FF]">277</div>
                </div>
              </div>

              {/* Warnings & Passed Checks */}
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] text-gray-400 font-bold uppercase">WARNINGS</div>
                  <div className="text-3xl font-black text-[#F59E0B]">30</div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-[11px] text-gray-400 font-bold uppercase">PASSED CHECKS</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">106</span>
                    <span className="text-xs font-bold text-rose-500">▼ 17</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/website-audit"
                className="inline-block px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                VIEW FULL REPORT
              </Link>
            </div>
          </div>
        );
        break;

      case 'content_keywords':
        content = (
          <div className="space-y-4">
            {headerControls(
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-gray-900">Content</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsContentEngineOpen(!isContentEngineOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 cursor-pointer text-xs shadow-2xs"
                  >
                    <span className="font-bold text-xs text-blue-600">G</span>
                    <span className="text-sm">🇮🇳</span>
                    <span>Google India</span>
                    <span className="text-[10px] font-bold text-gray-500">EN</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isContentEngineOpen && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsContentEngineOpen(false)}
                        className="w-full text-left px-3 py-1.5 bg-gray-100 font-semibold text-gray-900 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-600">G</span>
                          <span className="text-sm">🇮🇳</span>
                          <span>Google India</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">EN</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="py-12 text-center space-y-3">
              <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-blue-100 text-[#0B69FF] flex items-center justify-center mx-auto shadow-2xs">
                <span className="text-lg font-bold">🔑</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Add keywords</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Type manually, select from the suggested list, import copy-paste in a column from any
                text editor.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#00925d] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD KEYWORDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHighPotentialModalOpen(true)}
                  className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
                >
                  FIND HIGH-POTENTIAL KEYWORDS
                </button>
              </div>

              {keywordList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-left max-w-lg mx-auto">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span className="font-semibold text-gray-800">
                      Tracked Keywords ({keywordList.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setKeywordList([])}
                      className="text-gray-400 hover:text-red-500 text-[11px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywordList.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100 flex items-center gap-1"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div
        key={sectionId}
        className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs transition-all hover:border-gray-300"
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-16 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-6 py-5 space-y-4 w-full">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-700 font-semibold">{domain}</span>
            <span>&gt;</span>
            <span className="text-gray-900 font-semibold">Project Overview</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsGuestLinkOpen(true)}
              className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
            >
              Guest link
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
            >
              Feedback
            </button>
            <Link
              href="/notes"
              className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
            >
              Notes (16)
            </Link>
          </div>
        </div>

        {/* Title & Widgets Dropdown Controls */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Overview / {domain}
          </h1>

          <div className="flex items-center gap-2 relative">
            {/* Widgets Dropdown matching Screenshot 1 */}
            <div className="relative" ref={widgetsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsWidgetsDropdownOpen(!isWidgetsDropdownOpen)}
                className="px-3.5 py-1.5 bg-[#453768] hover:bg-[#3B2E5A] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Widgets</span>
                {isWidgetsDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {isWidgetsDropdownOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl py-1.5 z-50 text-xs animate-in fade-in duration-100">
                  <div className="divide-y divide-gray-50">
                    {DEFAULT_SECTIONS.map((key) => (
                      <div
                        key={key}
                        onClick={() => toggleWidgetVisibility(key)}
                        className="px-3.5 py-2 flex items-center gap-3 hover:bg-gray-50 cursor-pointer text-gray-800 transition-colors select-none"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <div
                          className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center shrink-0 transition-colors ${
                            visibleWidgets[key] !== false ? 'bg-black text-white' : 'border border-gray-400 bg-white'
                          }`}
                        >
                          {visibleWidgets[key] !== false && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium text-gray-900 truncate">{WIDGET_NAMES[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs cursor-pointer"
              title="Overview Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render Ordered Widgets */}
        <div className="space-y-4">
          {sectionsOrder.map((sectionId, index) => renderWidget(sectionId, index))}
        </div>

        {/* Bottom Footer matching Screenshot */}
        <footer className="mt-8 pt-4 pb-4 border-t border-gray-200/90 flex items-center justify-between text-xs text-gray-500 w-full select-none">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#0B69FF] rounded-xs flex items-center justify-center text-white font-black text-[10px]">
              ⚡
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-sm">SE Ranking</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600 font-medium">
            <button
              type="button"
              onClick={() => setIsBugModalOpen(true)}
              className="hover:text-[#0B69FF] transition-colors cursor-pointer"
            >
              Report a bug
            </button>
            <Link href="/affiliate" className="hover:text-[#0B69FF] transition-colors">
              Affiliates
            </Link>
            <Link href="/api-docs" className="hover:text-[#0B69FF] transition-colors">
              API
            </Link>
            <Link href="/whats-new" className="hover:text-[#0B69FF] transition-colors">
              What's new
            </Link>
            <Link href="/help" className="hover:text-[#0B69FF] transition-colors">
              Help
            </Link>
          </div>
        </footer>
      </div>

      {/* Guest Link Modal matching user screenshot */}
      {isGuestLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Get access to guest links</h3>
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or partners to give them the possibility to view website statistics without logging into the system.
            </p>

            {/* Link box */}
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;hv=e8a49...
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641');
                  showNotice('Guest link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-[#0B69FF] font-semibold hover:underline shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 text-xs text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5" />
                <span>Hide search volume column</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5" />
                <span className="flex items-center gap-1">
                  Include filtering and sorting settings
                  <span className="italic text-gray-400 font-serif text-[10px]">i</span>
                </span>
              </label>
            </div>

            {/* Access to modules */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-gray-700">Access to modules:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'overview', label: 'PROJECT OVERVIEW', defaultActive: true },
                  { id: 'rankings', label: 'RANKINGS', defaultActive: false },
                  { id: 'analytics', label: 'ANALYTICS & TRAFFIC', defaultActive: false },
                  { id: 'competitors', label: 'MY COMPETITORS', defaultActive: false },
                  { id: 'ai', label: 'AI RESULTS TRACKER', defaultActive: false },
                  { id: 'audit', label: 'WEBSITE AUDIT', defaultActive: false },
                  { id: 'marketing', label: 'MARKETING PLAN', defaultActive: false },
                ].map((mod) => (
                  <label
                    key={mod.id}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 font-bold cursor-pointer transition-all ${
                      mod.defaultActive
                        ? 'bg-[#534F6A] border-[#534F6A] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      defaultChecked={mod.defaultActive}
                      className="w-3.5 h-3.5 rounded"
                    />
                    <span className="text-[11px] tracking-wide">{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGuestLinkOpen(false);
                  showNotice('Guest link updated successfully!');
                }}
                className="px-6 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer"
              >
                UPDATE LINK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal matching user screenshot */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Add Keywords Modal */}
      {isAddKeywordsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">Add Keywords to {domain}</h3>
              <button
                type="button"
                onClick={() => setIsAddKeywordsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeywords} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Enter keywords (one per line):
                </label>
                <textarea
                  rows={6}
                  value={newKeywordsText}
                  onChange={(e) => setNewKeywordsText(e.target.value)}
                  placeholder="social media management&#10;best social scheduling tool&#10;instagram scheduler app"
                  className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Add to Trackings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Overview Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#0B69FF]" />
                <h3 className="text-base font-bold text-gray-900">Overview Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Auto-refresh Frequency</label>
                <select
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                >
                  <option value="5m">Every 5 minutes</option>
                  <option value="15m">Every 15 minutes</option>
                  <option value="30m">Every 30 minutes</option>
                  <option value="1h">Every 1 hour</option>
                  <option value="off">Off (Manual refresh only)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Default Date Range</label>
                <select
                  value={defaultPeriod}
                  onChange={(e) => setDefaultPeriod(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                >
                  <option value="Last 7 days">Last 7 days</option>
                  <option value="Last 30 days">Last 30 days</option>
                  <option value="Last 3 months">Last 3 months</option>
                  <option value="Last 6 months">Last 6 months</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#0B69FF] w-4 h-4" />
                  <span className="text-gray-700">Display AI Search brand presence widgets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#0B69FF] w-4 h-4" />
                  <span className="text-gray-700">Show competitor trend comparison overlays</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  showNotice('Overview display settings saved!');
                }}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report a Bug Modal matching user screenshot */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

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
                AI-curated high search volume, low competition search terms with high intent for {domain}:
              </p>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {SUGGESTED_HIGH_POTENTIAL.map((item) => (
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
                      <div className="font-bold text-[#0B69FF]">{item.volume} vol</div>
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
                    onClick={() => {
                      if (selectedHighPotential.length > 0) {
                        setKeywordList((prev) => [...prev, ...selectedHighPotential]);
                        showNotice(`${selectedHighPotential.length} high-potential keywords added!`);
                        setIsHighPotentialModalOpen(false);
                      }
                    }}
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
    </div>
  );
}
