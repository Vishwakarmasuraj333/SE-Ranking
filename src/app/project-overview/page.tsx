'use client';

import React, { useState, useEffect } from 'react';
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

  // Dynamic state for Add Keywords Modal
  const [isAddKeywordsOpen, setIsAddKeywordsOpen] = useState(false);
  const [newKeywordsText, setNewKeywordsText] = useState('');
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

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
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-gray-900">{title}</span>
          {subInfo}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
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
              'Competitive Research - AI Search ⓘ',
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Brand: Zoho</span>
                <span>Last 30 days</span>
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
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Brand: Zoho</span>
                <span>1 AI engines · 0 prompts</span>
                <span>23 Sept - 25 Sept, 2026</span>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                  <span>G</span>
                  <span>🇮🇳</span>
                  <span>Google India</span>
                  <span className="font-bold text-[10px] text-gray-400">EN</span>
                </span>
                <span className="text-xs text-gray-400">Past 30 days</span>
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
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded">
                <span>🇮🇳</span>
                <span>India</span>
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                  <span>G</span>
                  <span>🇮🇳</span>
                  <span>Google India</span>
                  <span className="font-bold text-[10px] text-gray-400">EN</span>
                </span>
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
              onClick={() => showNotice('Guest link copied to clipboard')}
              className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
            >
              Guest link
            </button>
            <button
              onClick={() => showNotice('Feedback dialog opened')}
              className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
            >
              Feedback
            </button>
            <button
              onClick={() => showNotice('Notes drawer opened')}
              className="text-[#0B69FF] hover:underline font-semibold cursor-pointer"
            >
              Notes ({appWrapData.site_notes?.notes_count || 46})
            </button>
          </div>
        </div>

        {/* Title & Widgets Dropdown Controls */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Overview / {domain}
          </h1>

          <div className="flex items-center gap-2 relative">
            {/* Widgets Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWidgetsDropdownOpen(!isWidgetsDropdownOpen)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>Widgets</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isWidgetsDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <span>Manage Widgets</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-gray-50">
                    {DEFAULT_SECTIONS.map((key) => (
                      <label
                        key={key}
                        className="px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 cursor-pointer text-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={visibleWidgets[key] !== false}
                          onChange={() => toggleWidgetVisibility(key)}
                          className="rounded text-[#0B69FF]"
                        />
                        <span className="truncate">{WIDGET_NAMES[key]}</span>
                      </label>
                    ))}
                  </div>

                  <div className="p-2 border-t border-gray-100 text-[11px] text-gray-400 text-center">
                    💡 Tip: Card headers se uper/niche drag ya move karein
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => showNotice('Overview display settings opened')}
              className="p-1.5 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
              title="Overview Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drag & Drop Instruction bar */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">✨ Interactive Layout:</span>
            <span>Aap kisi bhi section ko <strong>drag &amp; drop karke uper-niche</strong> kar sakte hain, ya header ke <strong>↑ / ↓ arrows</strong> se reorder kar sakte hain!</span>
          </div>
          <button
            onClick={resetLayout}
            className="text-[11px] font-bold text-[#0B69FF] hover:underline shrink-0 ml-2"
          >
            Reset Layout
          </button>
        </div>

        {/* Render Ordered Widgets */}
        <div className="space-y-4">
          {sectionsOrder.map((sectionId, index) => renderWidget(sectionId, index))}
        </div>
      </div>

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
    </div>
  );
}
