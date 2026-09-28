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
  'ai_results_tracker',
  'key_metrics',
  'rankings',
  'backlink_checker',
  'analytics_traffic',
  'marketing_plan',
  'comp_research_geo',
  'website_audit',
  'insights',
  'content_keywords',
];

const WIDGET_NAMES: Record<string, string> = {
  comp_ai_search: 'Competitive Research - AI Search',
  ai_results_tracker: 'AI Results Tracker',
  key_metrics: 'Key metrics',
  rankings: 'Rankings',
  backlink_checker: 'Backlink Checker',
  analytics_traffic: 'Analytics and traffic',
  marketing_plan: 'Marketing Plan',
  comp_research_geo: 'Competitive Research',
  website_audit: 'Website Audit',
  insights: 'Insights',
  content_keywords: 'Content',
};

export default function ProjectOverviewPage() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'zohosocial.com';

  // Sections order for Drag and Drop (uper niche)
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(DEFAULT_SECTIONS);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>({
    comp_ai_search: true,
    ai_results_tracker: true,
    key_metrics: true,
    rankings: true,
    backlink_checker: true,
    analytics_traffic: true,
    marketing_plan: true,
    comp_research_geo: true,
    website_audit: true,
    insights: true,
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
  const [feedbackText, setFeedbackText] = useState('');

  // Overview Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('15m');
  const [defaultPeriod, setDefaultPeriod] = useState('Last 30 days');

  // Interactive Section Dropdown States
  const [aiSearchBrand, setAiSearchBrand] = useState('Zoho');
  const [isAiSearchBrandOpen, setIsAiSearchBrandOpen] = useState(false);
  const [aiSearchPeriod, setAiSearchPeriod] = useState('Last 30 days');
  const [isAiSearchPeriodOpen, setIsAiSearchPeriodOpen] = useState(false);

  const [aiTrackerBrand, setAiTrackerBrand] = useState('Zoho');
  const [isAiTrackerBrandOpen, setIsAiTrackerBrandOpen] = useState(false);
  const [aiTrackerEngines, setAiTrackerEngines] = useState('1 AI engines · 0 prompts');
  const [isAiTrackerEnginesOpen, setIsAiTrackerEnginesOpen] = useState(false);
  const [aiTrackerPeriod, setAiTrackerPeriod] = useState('23 Sept - 25 Sept, 2026');
  const [isAiTrackerPeriodOpen, setIsAiTrackerPeriodOpen] = useState(false);

  const [rankingsEngine, setRankingsEngine] = useState('Google India (EN)');
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

    const isBeingDragged = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    // Clean, authentic widget header matching real SE Ranking
    const headerControls = (title: string, subInfo?: React.ReactNode) => (
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 select-none">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-gray-900">{title}</span>
          {subInfo}
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <button
            type="button"
            onClick={() => moveUp(index)}
            disabled={index === 0}
            className="p-1 rounded hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Move section up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveDown(index)}
            disabled={index === sectionsOrder.length - 1}
            className="p-1 rounded hover:bg-gray-100 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Move section down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => toggleWidgetVisibility(sectionId)}
            className="p-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer ml-0.5"
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
              'Competitive Research - AI Search ⓘ',
              <div className="flex items-center gap-2 text-xs">
                {/* Brand Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiSearchBrandOpen(!isAiSearchBrandOpen);
                      setIsAiSearchPeriodOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 cursor-pointer"
                  >
                    <span>Brand: {aiSearchBrand}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isAiSearchBrandOpen && (
                    <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {['Zoho', 'WorkComposer', 'SE Ranking', 'Competitor A'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setAiSearchBrand(b);
                            setIsAiSearchBrandOpen(false);
                            showNotice(`Brand switched to ${b}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            aiSearchBrand === b ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{b}</span>
                          {aiSearchBrand === b && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Period Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiSearchPeriodOpen(!isAiSearchPeriodOpen);
                      setIsAiSearchBrandOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 cursor-pointer"
                  >
                    <span>{aiSearchPeriod}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isAiSearchPeriodOpen && (
                    <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setAiSearchPeriod(p);
                            setIsAiSearchPeriodOpen(false);
                            showNotice(`Period set to ${p}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            aiSearchPeriod === p ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{p}</span>
                          {aiSearchPeriod === p && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {/* AI Overview */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-[#0B69FF]">✦</span>
                  <span>AI Overview</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Mentions ⓘ</span>
                  <span className="font-bold text-gray-900">13.5K</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Link Presence ⓘ</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

              {/* AI Mode */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
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
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                  <span className="text-emerald-600">◎</span>
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
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
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
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
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

      case 'ai_results_tracker':
        content = (
          <div className="space-y-3">
            {headerControls(
              'AI Results Tracker ⓘ',
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {/* Brand Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiTrackerBrandOpen(!isAiTrackerBrandOpen);
                      setIsAiTrackerEnginesOpen(false);
                      setIsAiTrackerPeriodOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 cursor-pointer"
                  >
                    <span>Brand: {aiTrackerBrand}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isAiTrackerBrandOpen && (
                    <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {['Zoho', 'WorkComposer', 'SE Ranking'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setAiTrackerBrand(b);
                            setIsAiTrackerBrandOpen(false);
                            showNotice(`AI Tracker Brand: ${b}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            aiTrackerBrand === b ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{b}</span>
                          {aiTrackerBrand === b && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Engines Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiTrackerEnginesOpen(!isAiTrackerEnginesOpen);
                      setIsAiTrackerBrandOpen(false);
                      setIsAiTrackerPeriodOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 cursor-pointer"
                  >
                    <span>{aiTrackerEngines}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isAiTrackerEnginesOpen && (
                    <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {[
                        '1 AI engines · 0 prompts',
                        'All engines (ChatGPT, Gemini, Perplexity)',
                        'ChatGPT Only',
                        'Google Gemini Only',
                        'Perplexity AI Only',
                      ].map((eng) => (
                        <button
                          key={eng}
                          type="button"
                          onClick={() => {
                            setAiTrackerEngines(eng);
                            setIsAiTrackerEnginesOpen(false);
                            showNotice(`Engine filter updated: ${eng}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            aiTrackerEngines === eng ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span className="truncate">{eng}</span>
                          {aiTrackerEngines === eng && <Check className="w-3 h-3 text-[#0B69FF] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Period Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiTrackerPeriodOpen(!isAiTrackerPeriodOpen);
                      setIsAiTrackerBrandOpen(false);
                      setIsAiTrackerEnginesOpen(false);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium border border-gray-200 cursor-pointer"
                  >
                    <span>{aiTrackerPeriod}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isAiTrackerPeriodOpen && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {[
                        '23 Sept - 25 Sept, 2026',
                        'Past 7 days',
                        'Past 30 days',
                        'Past 90 days',
                      ].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setAiTrackerPeriod(p);
                            setIsAiTrackerPeriodOpen(false);
                            showNotice(`Date filter: ${p}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            aiTrackerPeriod === p ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{p}</span>
                          {aiTrackerPeriod === p && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

      case 'key_metrics':
        content = (
          <div className="space-y-3">
            {headerControls('Key metrics')}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-1">
              {/* Metric 1 */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>AI PRESENCE ⓘ</span>
                  <span className="text-sm">🇮🇳</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-blue-900">0.54%</span>
                  <span className="text-[11px] font-bold text-gray-500">0%</span>
                </div>
                <div className="text-[10px] text-gray-400">Sep, 2026</div>
              </div>

              {/* Metric 2 */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>ORGANIC TRAFFIC</span>
                  <span className="text-sm">🇮🇳</span>
                </div>
                <div className="text-xs text-gray-400">Data is not found</div>
                <button
                  type="button"
                  onClick={() => showNotice('Traffic recheck started...')}
                  className="text-[11px] font-semibold text-gray-700 bg-white border border-gray-300 px-2 py-0.5 rounded shadow-2xs hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-gray-500" />
                  <span>Restart</span>
                </button>
              </div>

              {/* Metric 3 */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>ORGANIC KEYWORDS</span>
                  <span className="text-sm">🇮🇳</span>
                </div>
                <div className="text-xs text-gray-400">Data is not found</div>
                <button
                  type="button"
                  onClick={() => showNotice('Keywords recheck started...')}
                  className="text-[11px] font-semibold text-gray-700 bg-white border border-gray-300 px-2 py-0.5 rounded shadow-2xs hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-gray-500" />
                  <span>Restart</span>
                </button>
              </div>

              {/* Metric 4 */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1">
                <div className="text-[11px] text-gray-500 font-bold uppercase">
                  <span>REFERRING DOMAINS ⓘ</span>
                </div>
                <div className="text-2xl font-black text-[#0B69FF]">41</div>
                <div className="text-[10px] text-gray-400 flex items-center justify-between">
                  <span>Sep-23 2026</span>
                  <RefreshCw
                    onClick={() => showNotice('Refreshing referring domains...')}
                    className="w-3 h-3 text-[#0B69FF] cursor-pointer"
                  />
                </div>
              </div>

              {/* Metric 5 */}
              <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
                  <span>SEARCH VISIBILITY ⓘ</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">G</span>
                    <span className="text-xs">🇮🇳</span>
                    <span className="text-[10px] font-semibold">EN</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500">Get site visibility data</div>
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="w-full py-1 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[11px] font-bold rounded shadow-2xs transition-colors cursor-pointer"
                >
                  Add keywords
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'rankings':
        content = (
          <div className="space-y-4">
            {headerControls(
              'Rankings',
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search Engine Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRankingsEngineOpen(!isRankingsEngineOpen);
                      setIsRankingsPeriodOpen(false);
                    }}
                    className="text-xs text-gray-700 font-medium flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    <span>G</span>
                    <span>🇮🇳</span>
                    <span>{rankingsEngine}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isRankingsEngineOpen && (
                    <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {[
                        'Google India (EN)',
                        'Google United States (EN)',
                        'Google United Kingdom (EN)',
                        'Bing United States (EN)',
                        'Yahoo India',
                      ].map((se) => (
                        <button
                          key={se}
                          type="button"
                          onClick={() => {
                            setRankingsEngine(se);
                            setIsRankingsEngineOpen(false);
                            showNotice(`Search engine changed to ${se}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            rankingsEngine === se ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{se}</span>
                          {rankingsEngine === se && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Period Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRankingsPeriodOpen(!isRankingsPeriodOpen);
                      setIsRankingsEngineOpen(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>{rankingsPeriod}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {isRankingsPeriodOpen && (
                    <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                      {['Past 7 days', 'Past 30 days', 'Past 90 days', 'All time'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setRankingsPeriod(p);
                            setIsRankingsPeriodOpen(false);
                            showNotice(`Rankings date range: ${p}`);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                            rankingsPeriod === p ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          <span>{p}</span>
                          {rankingsPeriod === p && <Check className="w-3 h-3 text-[#0B69FF]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="py-6 text-center space-y-3">
              <h3 className="text-base font-bold text-gray-900">Add keywords</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Type manually, select from the suggested list, import copy-paste in a column from any
                text editor.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD KEYWORDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  FIND HIGH-POTENTIAL KEYWORDS
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
              'Backlink Checker',
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showNotice('Backlink data update requested')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>UPDATE</span>
                </button>
                <span className="text-xs text-gray-400">Updated: Sep 23 2026</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Graph & KPIs */}
              <div className="lg:col-span-8 space-y-3">
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">TOTAL BACKLINKS ⓘ</span>
                    <div className="text-xl font-black text-[#0B69FF]">65</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">TOTAL REFERRING DOMAINS ⓘ</span>
                    <div className="text-xl font-black text-emerald-600">41</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">DOMAIN TRUST ⓘ</span>
                    <div className="text-xl font-black text-rose-500">21</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">PAGE TRUST ⓘ</span>
                    <div className="text-xl font-black text-amber-500">6</div>
                  </div>
                </div>

                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockBacklinkTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="backlinks" stroke="#0B69FF" strokeWidth={2} dot={false} name="Total backlinks" />
                      <Line type="monotone" dataKey="referring" stroke="#10B981" strokeWidth={2} dot={false} name="Total referring domains" />
                      <Line type="monotone" dataKey="domainTrust" stroke="#EF4444" strokeWidth={2} dot={false} name="Domain Trust" />
                      <Line type="monotone" dataKey="pageTrust" stroke="#F59E0B" strokeWidth={2} dot={false} name="Page Trust" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-gray-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0B69FF]" /> Total backlinks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /> Total referring domains
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Domain Trust
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" /> Page Trust
                  </span>
                </div>

                <Link
                  href="/backlinks"
                  className="inline-block px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                >
                  VIEW FULL REPORT
                </Link>
              </div>

              {/* Right Column: Toxic & Broken Backlinks */}
              <div className="lg:col-span-4 bg-gray-50/80 border border-gray-200 rounded-xl p-5 space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-900">TOXIC BACKLINKS ⓘ</div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Identify harmful links that hurt your site&apos;s SEO and clean up your backlink profile.
                  </p>
                  <Link
                    href="/backlinks"
                    className="w-full mt-3 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold uppercase tracking-wider rounded-lg block text-center shadow-xs transition-colors"
                  >
                    FIND TOXIC LINKS
                  </Link>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-[11px] font-bold text-gray-900 uppercase">BROKEN BACKLINKS ⓘ</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">0</div>
                  <div className="text-[10px] text-gray-400">0% out of 65</div>
                </div>
              </div>
            </div>
          </div>
        );
        break;

      case 'analytics_traffic':
        content = (
          <div className="space-y-4">
            {headerControls('Analytics and traffic')}
            <div className="py-6 text-center space-y-3">
              <h3 className="text-base font-bold text-gray-900">Analytics and statistics services</h3>
              <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
                Connect Google Analytics and statistics services to get detailed information about your
                website without switching between browser tabs. It will only take a few minutes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => showNotice('Connecting to Google Analytics...')}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <span className="text-amber-500 font-bold">📊</span>
                  <span>Connect Google Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={() => showNotice('Connecting to Google Search Console...')}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <span className="text-blue-500 font-bold">G</span>
                  <span>Connect Google Search Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => showNotice('Connecting to Matomo Analytics...')}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <span className="text-purple-500 font-bold">M</span>
                  <span>Connect Matomo Analytics</span>
                </button>
              </div>
            </div>
          </div>
        );
        break;

      case 'marketing_plan':
        content = (
          <div className="space-y-3">
            {headerControls('Marketing Plan')}
            <div className="space-y-3 pt-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-gray-900 text-2xl">65</span>
                <span className="text-gray-500 text-xs">Marketing tasks</span>
              </div>

              {/* Orange progress bar */}
              <div className="w-full bg-[#F59E0B] h-2.5 rounded-full overflow-hidden" />

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Done:</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-600">To Do:</span>
                  <span className="font-bold text-gray-900">65</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-gray-600">Ignored:</span>
                  <span className="font-bold text-gray-900">0</span>
                </div>
              </div>

              <Link
                href="/marketing-plan"
                className="inline-block mt-2 px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                VIEW FULL REPORT
              </Link>
            </div>
          </div>
        );
        break;

      case 'comp_research_geo':
        content = (
          <div className="space-y-3">
            {headerControls(
              'Competitive Research',
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCompGeoOpen(!isCompGeoOpen)}
                  className="flex items-center gap-1.5 text-xs text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
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
            )}
            <div className="py-8 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-sm">
                🔍
              </div>
              <h4 className="text-xs font-bold text-gray-900">Data is not found</h4>
              <p className="text-[11px] text-gray-500">
                We haven&apos;t found any data in the search results.
              </p>
            </div>
          </div>
        );
        break;

      case 'website_audit':
        content = (
          <div className="space-y-3">
            {headerControls('Website Audit')}
            <div className="py-6 text-center space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-sm">
                🔍
              </div>
              <h4 className="text-xs font-bold text-gray-900">Data is not found</h4>
              <p className="text-[11px] text-gray-500">Error: Cannot access page</p>
              <Link
                href="/website-audit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 shadow-2xs mt-1"
              >
                <RefreshCw className="w-3 h-3 text-gray-500" />
                <span>START AUDIT</span>
              </Link>
            </div>
          </div>
        );
        break;

      case 'insights':
        content = (
          <div className="space-y-4">
            {headerControls('Insights')}
            <div className="py-6 text-center space-y-3">
              <h3 className="text-base font-bold text-gray-900">Add keywords</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Type manually, select from the suggested list, import copy-paste in a column from any
                text editor.
              </p>
              <button
                type="button"
                onClick={() => setIsAddKeywordsOpen(true)}
                className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD KEYWORDS</span>
              </button>
            </div>
          </div>
        );
        break;

      case 'content_keywords':
        content = (
          <div className="space-y-4">
            {headerControls(
              'Content',
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsContentEngineOpen(!isContentEngineOpen)}
                  className="text-xs text-gray-700 font-medium flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <span>G</span>
                  <span>🇮🇳</span>
                  <span>{contentEngine}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                {isContentEngineOpen && (
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                    {[
                      'Google India (EN)',
                      'Google United States (EN)',
                      'Google United Kingdom (EN)',
                    ].map((se) => (
                      <button
                        key={se}
                        type="button"
                        onClick={() => {
                          setContentEngine(se);
                          setIsContentEngineOpen(false);
                          showNotice(`Content engine set to ${se}`);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between ${
                          contentEngine === se ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-gray-700'
                        }`}
                      >
                        <span>{se}</span>
                        {contentEngine === se && <Check className="w-3 h-3 text-[#0B69FF]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="py-6 text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0B69FF] font-bold flex items-center justify-center mx-auto text-sm">
                🔑
              </div>
              <h3 className="text-base font-bold text-gray-900">Add keywords</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Type manually, select from the suggested list, import copy-paste in a column from any
                text editor.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD KEYWORDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddKeywordsOpen(true)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  FIND HIGH-POTENTIAL KEYWORDS
                </button>
              </div>
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
              Notes ({appWrapData.site_notes?.notes_count || 46})
            </Link>
          </div>
        </div>

        {/* Title & Widgets Dropdown Controls */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Overview / {domain}
          </h1>

          <div className="flex items-center gap-2 relative">
            {/* Widgets Dropdown */}
            <div className="relative" ref={widgetsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsWidgetsDropdownOpen(!isWidgetsDropdownOpen)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>Widgets</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isWidgetsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isWidgetsDropdownOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-3.5 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Manage Widgets</span>
                    <button
                      type="button"
                      onClick={resetLayout}
                      className="text-[11px] font-bold text-[#0B69FF] hover:underline cursor-pointer"
                    >
                      Reset Layout
                    </button>
                  </div>

                  <div className="px-3.5 py-1.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const allVisible = DEFAULT_SECTIONS.reduce((acc, k) => ({ ...acc, [k]: true }), {});
                        setVisibleWidgets(allVisible);
                        showNotice('All widgets enabled');
                      }}
                      className="text-gray-600 hover:text-[#0B69FF] font-medium cursor-pointer"
                    >
                      Show all
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allHidden = DEFAULT_SECTIONS.reduce((acc, k) => ({ ...acc, [k]: false }), {});
                        setVisibleWidgets(allHidden);
                        showNotice('All widgets hidden');
                      }}
                      className="text-gray-600 hover:text-red-600 font-medium cursor-pointer"
                    >
                      Hide all
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-gray-50">
                    {DEFAULT_SECTIONS.map((key) => (
                      <label
                        key={key}
                        className="px-3.5 py-2 flex items-center gap-2.5 hover:bg-gray-50 cursor-pointer text-gray-800 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={visibleWidgets[key] !== false}
                          onChange={() => toggleWidgetVisibility(key)}
                          className="rounded text-[#0B69FF] focus:ring-[#0B69FF] w-3.5 h-3.5"
                        />
                        <span className="truncate text-xs font-medium">{WIDGET_NAMES[key]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
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
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Tell us what you think</h3>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-gray-700 font-semibold">How useful is this section?</label>
              <textarea
                rows={5}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Your feedback"
                className="w-full p-3 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setFeedbackText('');
                  showNotice('Thank you! Your feedback has been sent.');
                }}
                className="px-6 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-xs cursor-pointer"
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
