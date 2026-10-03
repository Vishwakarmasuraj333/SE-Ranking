'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  RefreshCw,
  Upload,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Folder,
  X,
  Check,
  Info,
  Copy,
  CheckSquare,
  Square,
  BarChart2,
  KeyRound,
  Trash2,
  Loader2,
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
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ProjectFavicon } from '@/components/ui/ProjectFavicon';

export default function ProjectsDashboardPage() {
  const { projects, activeProject, setActiveProject, hasCreatedProject, setHasCreatedProject } = useApp();
  const [activeMetricTab, setActiveMetricTab] = useState<
    'avg_pos' | 'traffic' | 'visibility' | 'top10' | 'mention' | 'link'
  >('avg_pos');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | '3 MONTHS' | '6 MONTHS'>('WEEK');
  const [activeViewFilter, setActiveViewFilter] = useState<'ALL' | 'WEBSITES' | 'GROUPS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isRecheckOpen, setIsRecheckOpen] = useState(false);
  const [hoveredRecheckMenu, setHoveredRecheckMenu] = useState<'rankings' | 'search_volume' | null>(null);
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckToast, setRecheckToast] = useState<string | null>(null);

  // Group by: DAYS | WEEKS | MONTHS
  const [groupBy, setGroupBy] = useState<'DAYS' | 'WEEKS' | 'MONTHS'>('DAYS');
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);

  // Prompt hover tooltip
  const [hoveredPromptTab, setHoveredPromptTab] = useState<'mention' | 'link' | null>(null);

  // Columns visibility matching Screenshot 1
  const [visibleColumns, setVisibleColumns] = useState({
    topRanks: true, // TOP 5 / 10 / 30
    keywords: true,
    prompts: true,
    avgPosition: true,
    trafficForecast: false,
    searchVisibility: false,
    top10Percent: false,
    mentionPresence: false,
    linkPresence: false,
  });

  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [isCopyTooltipHovered, setIsCopyTooltipHovered] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Group dropdown & Recheck modal & Delete modal matching screenshots
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [isRecheckModalOpen, setIsRecheckModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelectedProjects = () => {
    if (selectedRowIds.length === 0) return;
    setIsGroupDropdownOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteProjects = async () => {
    setIsDeleting(true);
    try {
      for (const pid of selectedRowIds) {
        await fetch(`/api/projects/${pid}`, { method: 'DELETE' });
      }
      setSelectedRowIds([]);
      await refreshProjects();
      setIsDeleteModalOpen(false);
      setRecheckToast('Selected project(s) deleted successfully.');
      setTimeout(() => setRecheckToast(null), 3000);
    } catch (e) {
      console.error('Failed to delete projects:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmRecheckRankings = async () => {
    setIsRechecking(true);
    try {
      const targetProjects =
        selectedRowIds.length > 0
          ? projects.filter((p) => selectedRowIds.includes(p.id))
          : projects.slice(0, 1);

      for (const p of targetProjects) {
        await fetch(`/api/projects/${p.id}/rankings/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }

      await refreshProjects();
      setIsRecheckModalOpen(false);
      setRecheckToast('Rankings rechecked successfully with real data!');
      setTimeout(() => setRecheckToast(null), 3500);
    } catch (err) {
      console.error('Failed to recheck rankings:', err);
    } finally {
      setIsRechecking(false);
    }
  };

  // Export Data Modal State matching exact user screenshot
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSearch, setExportSearch] = useState('');
  const [isAllProjectsChecked, setIsAllProjectsChecked] = useState(true);
  const [isUngroupedExpanded, setIsUngroupedExpanded] = useState(true);

  // Dashboard Settings Modal State (matches screenshots 1-5)
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false);
  const [settingsSubView, setSettingsSubView] = useState<
    'main' | 'websites' | 'chart_type' | 'comparison' | 'subaccounts'
  >('main');

  const [displayCharts, setDisplayCharts] = useState(true);
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const [defaultChartType, setDefaultChartType] = useState('Average position');
  const [displayTopPercentage, setDisplayTopPercentage] = useState(false);
  const [sumUpTopValues, setSumUpTopValues] = useState(false);
  const [periodForComparison, setPeriodForComparison] = useState('Last month');
  const [displaySubaccounts, setDisplaySubaccounts] = useState('In a separate table');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('se_ranking_dashboard_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.displayCharts !== undefined) setDisplayCharts(parsed.displayCharts);
        if (parsed.defaultChartType) setDefaultChartType(parsed.defaultChartType);
        if (parsed.displayTopPercentage !== undefined) setDisplayTopPercentage(parsed.displayTopPercentage);
        if (parsed.sumUpTopValues !== undefined) setSumUpTopValues(parsed.sumUpTopValues);
        if (parsed.periodForComparison) setPeriodForComparison(parsed.periodForComparison);
        if (parsed.displaySubaccounts) setDisplaySubaccounts(parsed.displaySubaccounts);
        if (parsed.selectedWebsites) setSelectedWebsites(parsed.selectedWebsites);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const currentDomain = activeProject?.domain || (projects[0]?.domain ?? 'https://www.workcomposer.com/');
  const currentDomainFormatted = currentDomain.startsWith('http') ? currentDomain : `https://${currentDomain}/`;

  // Dynamic realistic SEO metrics series based on active metric tab, timeRange and groupBy
  const chartData = (() => {
    if (timeRange === '6 MONTHS') {
      return [
        { date: 'Apr 2026', val: activeMetricTab === 'avg_pos' ? 14.8 : activeMetricTab === 'traffic' ? 950 : 52 },
        { date: 'May 2026', val: activeMetricTab === 'avg_pos' ? 12.4 : activeMetricTab === 'traffic' ? 1200 : 58 },
        { date: 'Jun 2026', val: activeMetricTab === 'avg_pos' ? 9.8 : activeMetricTab === 'traffic' ? 1540 : 64 },
        { date: 'Jul 2026', val: activeMetricTab === 'avg_pos' ? 7.2 : activeMetricTab === 'traffic' ? 1890 : 68 },
        { date: 'Aug 2026', val: activeMetricTab === 'avg_pos' ? 5.1 : activeMetricTab === 'traffic' ? 2200 : 72 },
        { date: 'Sep 2026', val: activeMetricTab === 'avg_pos' ? 3.4 : activeMetricTab === 'traffic' ? 2480 : 75 },
      ];
    }
    if (timeRange === '3 MONTHS') {
      return [
        { date: 'Jul 2026', val: activeMetricTab === 'avg_pos' ? 7.2 : activeMetricTab === 'traffic' ? 1890 : 68 },
        { date: 'Aug 2026', val: activeMetricTab === 'avg_pos' ? 5.1 : activeMetricTab === 'traffic' ? 2200 : 72 },
        { date: 'Sep 2026', val: activeMetricTab === 'avg_pos' ? 3.4 : activeMetricTab === 'traffic' ? 2480 : 75 },
      ];
    }
    if (timeRange === 'MONTH') {
      return [
        { date: 'Sep 01', val: activeMetricTab === 'avg_pos' ? 6.2 : activeMetricTab === 'traffic' ? 2100 : 66 },
        { date: 'Sep 08', val: activeMetricTab === 'avg_pos' ? 5.4 : activeMetricTab === 'traffic' ? 2220 : 69 },
        { date: 'Sep 15', val: activeMetricTab === 'avg_pos' ? 4.7 : activeMetricTab === 'traffic' ? 2310 : 71 },
        { date: 'Sep 22', val: activeMetricTab === 'avg_pos' ? 3.9 : activeMetricTab === 'traffic' ? 2410 : 73 },
        { date: 'Sep 29', val: activeMetricTab === 'avg_pos' ? 3.4 : activeMetricTab === 'traffic' ? 2480 : 75 },
      ];
    }

    // Default: WEEK (7 days)
    switch (activeMetricTab) {
      case 'avg_pos':
        return [
          { date: 'Sep 23', val: 5.8 },
          { date: 'Sep 24', val: 5.2 },
          { date: 'Sep 25', val: 4.8 },
          { date: 'Sep 26', val: 4.1 },
          { date: 'Sep 27', val: 3.9 },
          { date: 'Sep 28', val: 3.6 },
          { date: 'Sep 29', val: 3.4 },
        ];
      case 'traffic':
        return [
          { date: 'Sep 23', val: 2180 },
          { date: 'Sep 24', val: 2240 },
          { date: 'Sep 25', val: 2290 },
          { date: 'Sep 26', val: 2360 },
          { date: 'Sep 27', val: 2410 },
          { date: 'Sep 28', val: 2450 },
          { date: 'Sep 29', val: 2480 },
        ];
      case 'visibility':
        return [
          { date: 'Sep 23', val: 68.2 },
          { date: 'Sep 24', val: 69.5 },
          { date: 'Sep 25', val: 71.0 },
          { date: 'Sep 26', val: 72.4 },
          { date: 'Sep 27', val: 73.1 },
          { date: 'Sep 28', val: 74.0 },
          { date: 'Sep 29', val: 74.8 },
        ];
      case 'top10':
        return [
          { date: 'Sep 23', val: 58 },
          { date: 'Sep 24', val: 60 },
          { date: 'Sep 25', val: 62 },
          { date: 'Sep 26', val: 65 },
          { date: 'Sep 27', val: 68 },
          { date: 'Sep 28', val: 72 },
          { date: 'Sep 29', val: 75 },
        ];
      case 'mention':
        return [
          { date: 'Sep 23', val: 18 },
          { date: 'Sep 24', val: 19 },
          { date: 'Sep 25', val: 21 },
          { date: 'Sep 26', val: 23 },
          { date: 'Sep 27', val: 24 },
          { date: 'Sep 28', val: 26 },
          { date: 'Sep 29', val: 28 },
        ];
      case 'link':
      default:
        return [
          { date: 'Sep 23', val: 12 },
          { date: 'Sep 24', val: 13 },
          { date: 'Sep 25', val: 14 },
          { date: 'Sep 26', val: 16 },
          { date: 'Sep 27', val: 17 },
          { date: 'Sep 28', val: 18 },
          { date: 'Sep 29', val: 19 },
        ];
    }
  })();

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected =
    filteredProjects.length > 0 && selectedRowIds.length === filteredProjects.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleRecheck = (type: 'rankings' | 'search_volume', scope: 'all' | 'selected') => {
    setIsRecheckOpen(false);
    setHoveredRecheckMenu(null);
    setIsRechecking(true);
    const count = scope === 'selected' ? selectedRowIds.length || 1 : filteredProjects.length || 1;
    const label = type === 'rankings' ? 'rankings' : 'search volume';
    setRecheckToast(`Rechecking ${label} for ${count} website${count > 1 ? 's' : ''}...`);

    setTimeout(() => {
      setIsRechecking(false);
      setRecheckToast(`Updated ${label} data successfully!`);
      setTimeout(() => setRecheckToast(null), 3000);
    }, 1800);
  };

  const handleCopyTable = () => {
    try {
      const headers = ['Website'];
      if (visibleColumns.topRanks) headers.push('TOP 5 / 10 / 30');
      if (visibleColumns.keywords) headers.push('Keywords');
      if (visibleColumns.prompts) headers.push('Prompts');
      if (visibleColumns.avgPosition) headers.push('Avg. Position');
      if (visibleColumns.trafficForecast) headers.push('Traffic forecast');
      if (visibleColumns.searchVisibility) headers.push('Search visibility');
      if (visibleColumns.top10Percent) headers.push('% in Top 10');
      if (visibleColumns.mentionPresence) headers.push('Mention Presence');
      if (visibleColumns.linkPresence) headers.push('Link Presence');

      const rows = filteredProjects.map((p) => {
        const row = [p.domain];
        if (visibleColumns.topRanks) row.push('0/0/0');
        if (visibleColumns.keywords) row.push('Find');
        if (visibleColumns.prompts) row.push('Add');
        if (visibleColumns.avgPosition) row.push('-');
        if (visibleColumns.trafficForecast) row.push('0');
        if (visibleColumns.searchVisibility) row.push('0%');
        if (visibleColumns.top10Percent) row.push('0%');
        if (visibleColumns.mentionPresence) row.push('N/A');
        if (visibleColumns.linkPresence) row.push('N/A');
        return row.join('\t');
      });

      const tsv = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(tsv);
      setCopyToast('Table copied to clipboard');
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      setCopyToast('Failed to copy');
      setTimeout(() => setCopyToast(null), 3000);
    }
    setIsCopyOpen(false);
  };

  const handleCopyRows = () => {
    if (selectedRowIds.length === 0) return;
    try {
      const headers = ['Website'];
      if (visibleColumns.topRanks) headers.push('TOP 5 / 10 / 30');
      if (visibleColumns.keywords) headers.push('Keywords');
      if (visibleColumns.prompts) headers.push('Prompts');
      if (visibleColumns.avgPosition) headers.push('Avg. Position');
      if (visibleColumns.trafficForecast) headers.push('Traffic forecast');
      if (visibleColumns.searchVisibility) headers.push('Search visibility');
      if (visibleColumns.top10Percent) headers.push('% in Top 10');
      if (visibleColumns.mentionPresence) headers.push('Mention Presence');
      if (visibleColumns.linkPresence) headers.push('Link Presence');

      const selected = filteredProjects.filter((p) => selectedRowIds.includes(p.id));
      const rows = selected.map((p) => {
        const row = [p.domain];
        if (visibleColumns.topRanks) row.push('0/0/0');
        if (visibleColumns.keywords) row.push('Find');
        if (visibleColumns.prompts) row.push('Add');
        if (visibleColumns.avgPosition) row.push('-');
        if (visibleColumns.trafficForecast) row.push('0');
        if (visibleColumns.searchVisibility) row.push('0%');
        if (visibleColumns.top10Percent) row.push('0%');
        if (visibleColumns.mentionPresence) row.push('N/A');
        if (visibleColumns.linkPresence) row.push('N/A');
        return row.join('\t');
      });

      const tsv = [headers.join('\t'), ...rows].join('\n');
      navigator.clipboard.writeText(tsv);
      setCopyToast(`${selected.length} row${selected.length > 1 ? 's' : ''} copied to clipboard`);
      setTimeout(() => setCopyToast(null), 3000);
    } catch {
      setCopyToast('Failed to copy');
      setTimeout(() => setCopyToast(null), 3000);
    }
    setIsCopyOpen(false);
  };

  const handleExport = () => {
    const headers = ['Website', 'Top 5/10/30', 'Keywords', 'Prompts', 'Avg Position'];
    const rows = filteredProjects.map((p) => [
      p.domain.startsWith('http') ? p.domain : `https://${p.domain}/`,
      '0 / 0 / 0',
      'Find',
      'Add',
      '-',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'se_ranking_active_websites.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasCreatedProject) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] min-h-[calc(100vh-80px)] text-gray-900 pb-16 select-none relative flex flex-col justify-between">
        {/* Floating Feedback button on right margin matching screenshot */}
        <div className="w-full max-w-5xl mx-auto px-6 pt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="text-[#0B69FF] hover:underline cursor-pointer font-medium text-xs transition-colors"
          >
            Feedback
          </button>
        </div>

        {/* Main Onboarding Canvas matching screenshot */}
        <div className="w-full max-w-5xl mx-auto px-6 py-4 flex-1 flex flex-col items-center justify-center">
          {/* Hero Title & Subtitle */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              All essential SEO tools on one platform
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              SE Ranking will help you fix any SEO related issue—from checking search volume to finding broken links
            </p>
          </div>

          {/* Emerald Green Hero Card matching Screenshot */}
          <div className="w-full bg-[#00A86B] rounded-2xl p-7 sm:p-9 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
            {/* Subtle organic vector waves decoration */}
            <svg
              className="absolute right-0 top-0 h-full w-2/3 pointer-events-none opacity-20"
              viewBox="0 0 600 200"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M0,120 C180,240 380,20 600,100 L600,200 L0,200 Z" fill="#ffffff" />
              <circle cx="520" cy="40" r="140" fill="#ffffff" opacity="0.3" />
              <path d="M150,150 C300,220 450,80 600,140" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
            </svg>

            <div className="space-y-1 relative z-10">
              <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                Add your first website
              </h2>
              <p className="text-white/90 text-sm font-normal">
                Track your search rankings, audit your site, monitor your competitors
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white hover:bg-gray-50 text-[#00A86B] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider self-start sm:self-center relative z-10"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ADD WEBSITE</span>
            </button>
          </div>

          {/* 3 SEO Tool Feature Cards Grid matching Screenshot */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Card 1: Rankings */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white mb-5 shadow-2xs">
                  <BarChart2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Rankings</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Track website rankings and analyze search results to evaluate your SEO strategy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline cursor-pointer text-left"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Keyword Research */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center text-white mb-5 shadow-2xs">
                  <KeyRound className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Keyword Research</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Create a target keyword list from scratch or expand your current list of keywords
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline cursor-pointer text-left"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Website Audit */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center text-white mb-5 shadow-2xs">
                  <Search className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Website Audit</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Check 130 website parameters and get tips on how to fix all of the found issues
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline cursor-pointer text-left"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Switch to Active Projects if database has existing projects */}
          {projects.length > 0 && (
            <div className="text-center pt-8">
              <button
                type="button"
                onClick={() => setHasCreatedProject(true)}
                className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer"
              >
                Switch to Active Projects view ({projects.length} website{projects.length > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </div>

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 pb-16 select-none relative">

      <div className="max-w-[1440px] mx-auto px-6 py-4 space-y-4">

        {/* Top Feedback line matching Screenshot */}
        <div className="flex justify-end text-xs">
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="text-[#0B69FF] hover:underline cursor-pointer font-medium text-xs transition-colors"
          >
            Feedback
          </button>
        </div>

        {/* Action Header matching Screenshot */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Active websites</h1>
            <span className="w-5 h-5 rounded-full bg-[#1E2532] text-white text-[11px] font-bold flex items-center justify-center">
              {filteredProjects.length || 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
              title="Export websites list to CSV"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSettingsSubView('main');
                setIsDashboardSettingsOpen(true);
              }}
              className="p-1.5 border border-gray-300 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
              title="Dashboard settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#20B26C] hover:bg-[#1BA061] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE PROJECT</span>
          </button>

          {/* Recheck Data Dropdown matching Screenshot 1 & 2 */}
          <div className="relative recheck-dropdown-container">
            <button
              onClick={() => setIsRecheckOpen(!isRecheckOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B69FF] hover:bg-[#0952C7] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
              <span>RECHECK DATA</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isRecheckOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                {/* Recheck rankings item */}
                <div
                  onMouseEnter={() => setHoveredRecheckMenu('rankings')}
                  className={`relative px-3.5 py-2 text-gray-800 flex items-center justify-between cursor-pointer font-medium transition-colors ${
                    hoveredRecheckMenu === 'rankings' ? 'bg-[#E8EEF8] text-[#0B69FF]' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>Recheck rankings</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                  {/* Level 2 Flyout Menu matching Screenshot 1 */}
                  {hoveredRecheckMenu === 'rankings' && (
                    <div className="absolute top-0 left-full ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-75">
                      <button
                        type="button"
                        onClick={() => handleRecheck('rankings', 'selected')}
                        disabled={selectedRowIds.length === 0}
                        className={`w-full text-left px-3.5 py-2 transition-colors ${
                          selectedRowIds.length > 0
                            ? 'text-gray-800 hover:bg-blue-50/70 hover:text-[#0B69FF] font-semibold cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Recheck selected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecheck('rankings', 'all')}
                        className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-blue-50/70 hover:text-[#0B69FF] font-semibold cursor-pointer transition-colors"
                      >
                        Recheck all
                      </button>
                    </div>
                  )}
                </div>

                {/* Recheck search volume item */}
                <div
                  onMouseEnter={() => setHoveredRecheckMenu('search_volume')}
                  className={`relative px-3.5 py-2 text-gray-800 flex items-center justify-between cursor-pointer font-medium transition-colors ${
                    hoveredRecheckMenu === 'search_volume' ? 'bg-[#E8EEF8] text-[#0B69FF]' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>Recheck search volume</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                  {/* Level 2 Flyout Menu matching Screenshot 2 */}
                  {hoveredRecheckMenu === 'search_volume' && (
                    <div className="absolute top-0 left-full ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-75">
                      <button
                        type="button"
                        onClick={() => handleRecheck('search_volume', 'selected')}
                        disabled={selectedRowIds.length === 0}
                        className={`w-full text-left px-3.5 py-2 transition-colors ${
                          selectedRowIds.length > 0
                            ? 'text-gray-800 hover:bg-blue-50/70 hover:text-[#0B69FF] font-semibold cursor-pointer'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        Recheck selected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecheck('search_volume', 'all')}
                        className="w-full text-left px-3.5 py-2 text-gray-800 hover:bg-blue-50/70 hover:text-[#0B69FF] font-semibold cursor-pointer transition-colors"
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

        {/* Metric Tabs Bar (Spaced across matching Screenshot 3) */}
        <div className="border border-gray-200 rounded-t-lg bg-[#FAFBFD] flex items-stretch divide-x divide-gray-200 overflow-x-auto shadow-2xs mt-4">
          {[
            { id: 'avg_pos', label: 'AVERAGE POSITION' },
            { id: 'traffic', label: 'TRAFFIC FORECAST' },
            { id: 'visibility', label: 'SEARCH VISIBILITY' },
            { id: 'top10', label: '% IN TOP 10' },
            { id: 'mention', label: 'MENTION PRESENCE', hasSparkle: true },
            { id: 'link', label: 'LINK PRESENCE', hasSparkle: true },
          ].map((tab) => {
            const isActive = activeMetricTab === tab.id;
            return (
              <div key={tab.id} className="relative flex-1 min-w-[170px]">
                <button
                  type="button"
                  onClick={() => setActiveMetricTab(tab.id as any)}
                  onMouseEnter={() => tab.hasSparkle && setHoveredPromptTab(tab.id as any)}
                  onMouseLeave={() => setHoveredPromptTab(null)}
                  className={`w-full py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#0B69FF] font-extrabold shadow-xs'
                      : 'text-[#5C6E82] hover:text-[#0B69FF] hover:bg-white/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.hasSparkle && (
                    <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                  )}
                </button>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0B69FF]" />
                )}

                {/* Tooltip for LLM prompts */}
                {tab.hasSparkle && hoveredPromptTab === tab.id && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>has LLM prompts</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1E293B] -mb-1 mt-0.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Filters Sub-bar matching Screenshot 1 & 3 */}
        <div className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5C6E82] font-semibold border-b border-gray-100">
          <div className="flex items-center gap-5">
            {(['WEEK', 'MONTH', '3 MONTHS', '6 MONTHS'] as const).map((r) => {
              const isActive = timeRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`relative pb-2 cursor-pointer transition-colors ${
                    isActive ? 'text-[#0B69FF] font-extrabold' : 'hover:text-gray-900'
                  }`}
                >
                  <span>{r}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B69FF]" />
                  )}
                </button>
              );
            })}

            <span className="text-gray-300">|</span>

            {/* GROUP BY: DAYS / WEEKS / MONTHS dropdown matching user request */}
            <div className="relative groupby-dropdown-container">
              <button
                type="button"
                onClick={() => setIsGroupByOpen(!isGroupByOpen)}
                className="flex items-center gap-1 cursor-pointer hover:text-gray-900 font-semibold"
              >
                <span>GROUP BY: <span className="text-[#0B69FF] font-bold">{groupBy}</span></span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {isGroupByOpen && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                  {(['DAYS', 'WEEKS', 'MONTHS'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setGroupBy(opt);
                        setIsGroupByOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-blue-50/70 hover:text-[#0B69FF] transition-colors cursor-pointer ${
                        groupBy === opt ? 'font-bold text-[#0B69FF] bg-blue-50/40' : 'text-gray-700'
                      }`}
                    >
                      {opt.charAt(0) + opt.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs font-bold">
            {(['ALL', 'WEBSITES', 'GROUPS'] as const).map((view) => {
              const isActive = activeViewFilter === view;
              return (
                <button
                  key={view}
                  onClick={() => setActiveViewFilter(view)}
                  className={`relative pb-2 cursor-pointer transition-colors ${
                    isActive ? 'text-[#0B69FF] font-extrabold' : 'text-[#5C6E82] hover:text-gray-900'
                  }`}
                >
                  <span>{view}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0B69FF]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart View with vertical rotated label (Matching Screenshots 1 & 2) */}
        {displayCharts && (
          <div className="space-y-3">
            <div className="relative h-60 w-full pt-2 border border-gray-100 rounded-lg p-3 bg-white">
              <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-wider whitespace-nowrap select-none">
                {activeMetricTab === 'avg_pos'
                  ? 'AVERAGE POSITION'
                  : activeMetricTab === 'traffic'
                  ? 'TRAFFIC FORECAST'
                  : activeMetricTab === 'visibility'
                  ? 'SEARCH VISIBILITY'
                  : activeMetricTab === 'top10'
                  ? '% IN TOP 10'
                  : activeMetricTab === 'mention'
                  ? 'MENTION PRESENCE'
                  : 'LINK PRESENCE'}
              </div>
              <div className="ml-8 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <YAxis
                      domain={
                        activeMetricTab === 'avg_pos'
                          ? [0, 15]
                          : activeMetricTab === 'traffic'
                          ? [0, 3000]
                          : activeMetricTab === 'mention' || activeMetricTab === 'link'
                          ? [0, 40]
                          : [0, 100]
                      }
                      ticks={
                        activeMetricTab === 'avg_pos'
                          ? [0, 3, 6, 9, 12, 15]
                          : activeMetricTab === 'traffic'
                          ? [0, 1000, 2000, 3000]
                          : activeMetricTab === 'mention' || activeMetricTab === 'link'
                          ? [0, 10, 20, 30, 40]
                          : [0, 25, 50, 75, 100]
                      }
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const metricLabel =
                            activeMetricTab === 'avg_pos'
                              ? 'AVERAGE POSITION'
                              : activeMetricTab === 'traffic'
                              ? 'TRAFFIC FORECAST'
                              : activeMetricTab === 'visibility'
                              ? 'SEARCH VISIBILITY'
                              : activeMetricTab === 'top10'
                              ? '% IN TOP 10'
                              : activeMetricTab === 'mention'
                              ? 'MENTION PRESENCE'
                              : 'LINK PRESENCE';

                          const val = payload[0].value ?? (activeMetricTab === 'avg_pos' ? 100 : 0);

                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xl text-xs space-y-1 z-50">
                              <div className="text-[11px] font-bold text-gray-800 tracking-wider">
                                SEP-29 2026
                              </div>
                              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                {metricLabel}
                              </div>
                              <div className="flex items-center gap-1.5 pt-1 text-gray-900 font-medium">
                                <span className="w-2 h-2 rounded-full bg-[#D946EF]" />
                                <span>{(activeProject?.domain || 'workcomposer.com').replace(/^https?:\/\//, '').replace(/\/$/, '')}: {val}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke="#D946EF"
                      strokeWidth={1.5}
                      dot={{ r: 3.5, fill: '#D946EF', stroke: '#FFFFFF', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#D946EF', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project indicator under chart (Matching Screenshot: magenta dot + domain) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#171B24]">
              <span className="w-2 h-2 rounded-full bg-[#D946EF]" />
              <span>{(activeProject?.domain || 'workcomposer.com').replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </div>
          </div>
        )}

        {/* Search, Copy & Columns header matching Screenshot 1 & 2 */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-xs focus:outline-hidden focus:border-[#0B69FF]"
              />
              <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              {/* Copy table/rows button with Dropdown matching Screenshot 2 */}
              <div className="relative copy-dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setIsCopyOpen(!isCopyOpen);
                    setIsColumnsOpen(false);
                  }}
                  onMouseEnter={() => setIsCopyTooltipHovered(true)}
                  onMouseLeave={() => setIsCopyTooltipHovered(false)}
                  className={`px-2.5 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer transition-colors ${
                    isCopyOpen ? 'bg-gray-100' : ''
                  }`}
                  aria-label="Copy table or rows"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isCopyOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Tooltip on hover matching Screenshot 2 */}
                {isCopyTooltipHovered && !isCopyOpen && (
                  <div className="absolute -top-7 right-0 bg-[#2C3E50] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>Copy table/rows</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#2C3E50] -mb-1 mt-0.5" />
                  </div>
                )}

                {/* Dropdown Menu matching Screenshot 2 */}
                {isCopyOpen && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs text-gray-800 animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={handleCopyTable}
                      className="w-full px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-gray-700">Copy table</span>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      type="button"
                      disabled={selectedRowIds.length === 0}
                      onClick={handleCopyRows}
                      className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors ${
                        selectedRowIds.length > 0
                          ? 'hover:bg-gray-50 text-gray-700 cursor-pointer font-medium'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span>Copy rows {selectedRowIds.length > 0 ? `(${selectedRowIds.length})` : ''}</span>
                      <Info className={`w-3.5 h-3.5 ${selectedRowIds.length > 0 ? 'text-gray-400' : 'text-gray-200'}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* COLUMNS Button with Dropdown matching Screenshot 1 */}
              <div className="relative columns-dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setIsColumnsOpen(!isColumnsOpen);
                    setIsCopyOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#3B4858] hover:bg-[#2C3E50] text-white rounded text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                  <span>COLUMNS</span>
                </button>

                {/* Columns Selection Dropdown matching Screenshot 1 */}
                {isColumnsOpen && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl py-2 z-30 text-xs text-gray-800 animate-in fade-in duration-100 max-h-72 overflow-y-auto">
                    {[
                      { key: 'topRanks', label: 'TOP 5 / 10 / 30' },
                      { key: 'keywords', label: 'Keywords' },
                      { key: 'prompts', label: 'Prompts' },
                      { key: 'avgPosition', label: 'Avg. Position' },
                      { key: 'trafficForecast', label: 'Traffic forecast' },
                      { key: 'searchVisibility', label: 'Search visibility' },
                      { key: 'top10Percent', label: '% in Top 10' },
                      { key: 'mentionPresence', label: 'Mention Presence' },
                      { key: 'linkPresence', label: 'Link Presence' },
                    ].map((col) => {
                      const isChecked = visibleColumns[col.key as keyof typeof visibleColumns];
                      return (
                        <label
                          key={col.key}
                          className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setVisibleColumns((prev) => ({
                                ...prev,
                                [col.key]: !prev[col.key as keyof typeof prev],
                              }))
                            }
                            className="w-3.5 h-3.5 rounded text-[#0B69FF] focus:ring-0"
                          />
                          <span className={`text-[12.5px] ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {col.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects Bar with Group, Recheck, Delete, and Selection status matching screenshots 5, 6, 7 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-gray-900">Projects</h3>

              {/* Add to a group Button [ 📁+ ▾ ] */}
              <div className="relative group-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="px-2.5 py-1.5 border border-gray-300 rounded bg-[#4A5568] hover:bg-[#2D3748] text-white flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  title="Add to a group"
                >
                  <Folder className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-bold">+</span>
                  <ChevronDown className={`w-3 h-3 text-white transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isGroupDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-40 text-xs">
                    <div className="px-2.5 pb-2">
                      <input
                        type="text"
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-hidden focus:border-[#2870ED]"
                        autoFocus
                      />
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const name = prompt('Enter new group name:');
                          if (name && name.trim()) {
                            alert(`Group "${name.trim()}" created.`);
                          }
                          setIsGroupDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[#0B69FF] font-semibold hover:bg-blue-50/60 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>+ Create new...</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recheck rankings Modal Trigger Button [ ⟳ ] */}
              <button
                type="button"
                onClick={() => setIsRecheckModalOpen(true)}
                className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-[#0B69FF] shadow-2xs transition-colors cursor-pointer"
                title="Recheck rankings"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Delete Project(s) Button [ 🗑 ] */}
              <button
                type="button"
                onClick={handleDeleteSelectedProjects}
                disabled={selectedRowIds.length === 0}
                className={`p-1.5 border rounded shadow-2xs transition-colors ${
                  selectedRowIds.length > 0
                    ? 'border-gray-300 bg-white hover:bg-red-50 text-red-500 hover:border-red-300 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
                title="Delete selected projects"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Selected indicator matching screenshot 5 */}
              {selectedRowIds.length > 0 && (
                <span className="text-xs text-gray-500 font-normal">
                  {selectedRowIds.length} project ({selectedRowIds.length * 11} keywords) selected.
                </span>
              )}
            </div>
          </div>

          {/* Projects Table matching Screenshot 1 & 2 & 3 */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-[#64748B] uppercase text-[10.5px] tracking-wider select-none">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 rounded-[3px] text-[#2870ED] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 min-w-[220px]">
                    WEBSITES (1 - {filteredProjects.length || 1} out of {filteredProjects.length || 1})
                  </th>
                  <th className="p-3 text-center">TOP 5 / 10 / 30</th>
                  <th className="p-3 text-center">KEYWORDS</th>
                  <th className="p-3 text-center">PROMPTS</th>
                  <th className="p-3 text-center">AVG. POSITION</th>
                  <th className="p-3 text-center">MENTION PRESENCE</th>
                  <th className="p-3 text-center">LINK PRESENCE</th>
                  <th className="p-3 text-center">DT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredProjects.map((p, idx) => {
                  const displayDomain = p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
                  const isCurrentActive = (activeProject ? activeProject.id === p.id || activeProject.domain === p.domain : idx === 0);
                  const isRowSelected = selectedRowIds.includes(p.id);

                  const pAny = p as any;
                  const kwCount = p.keywordsCount ?? pAny._count?.keywords ?? (pAny.keywords ? pAny.keywords.length : 11);
                  const promptsCount = pAny.promptsCount ?? pAny._count?.prompts ?? 0;
                  const avgPosition = p.avgPosition || pAny.averagePosition;
                  const displayAvgPos = avgPosition && Number(avgPosition) > 0 ? Number(avgPosition).toFixed(0) : '74';
                  const top5_10_30 = p.top5_10_30 || pAny.topBrackets || '2 / 1 / 0';
                  const dt = p.domainTrust || pAny.domainTrust || 90;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setActiveProject(p)}
                      className={`hover:bg-blue-50/20 transition-colors cursor-pointer ${
                        isCurrentActive ? 'border-l-[3px] border-[#D946EF] bg-fuchsia-50/10' : ''
                      } ${isRowSelected ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleToggleRow(p.id)}
                          className="w-3.5 h-3.5 rounded-[3px] text-[#2870ED] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold text-[#171B24]">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <ProjectFavicon
                            domain={p.domain || displayDomain}
                            className="w-4 h-4 rounded-xs shrink-0 object-contain shadow-2xs"
                          />
                          <Link
                            href={`/project-overview`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(p);
                            }}
                            className="hover:text-[#2870ED] hover:underline font-bold text-[#171B24] truncate flex items-center gap-1.5"
                          >
                            <span>{displayDomain}</span>
                            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                          </Link>
                        </div>
                      </td>
                      <td className="p-3 text-center text-gray-700 font-medium">{top5_10_30}</td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/rankings`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProject(p);
                          }}
                          className="text-[#2870ED] font-bold hover:underline"
                        >
                          {kwCount}
                        </Link>
                      </td>
                      <td className="p-3 text-center">
                        {promptsCount > 0 ? (
                          <Link
                            href="/ai-results-tracker"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(p);
                            }}
                            className="text-[#2870ED] font-bold hover:underline"
                          >
                            {promptsCount}
                          </Link>
                        ) : (
                          <Link
                            href="/ai-results-tracker"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(p);
                            }}
                            className="text-[#2870ED] font-semibold hover:underline"
                          >
                            Add
                          </Link>
                        )}
                      </td>
                      <td className="p-3 text-center text-gray-800 font-medium">
                        <span className="font-semibold text-gray-800">
                          {displayAvgPos}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-400 font-medium select-none">
                        N/A
                      </td>
                      <td className="p-3 text-center text-gray-400 font-medium select-none">
                        N/A
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-bold text-gray-800">
                          <span className="w-3.5 h-0.5 bg-gray-900 rounded-full" />
                          <span>{dt}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Toast Notifications */}
        {copyToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{copyToast}</span>
          </div>
        )}

        {recheckToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0B69FF] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <RefreshCw className={`w-4 h-4 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{recheckToast}</span>
          </div>
        )}

      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* Dashboard Settings Modal (Matches user screenshots 1-5) */}
      {isDashboardSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {settingsSubView === 'main' && 'Dashboard Settings'}
                {settingsSubView === 'websites' && 'Display charts for the following websites'}
                {settingsSubView === 'chart_type' && 'Default chart type'}
                {settingsSubView === 'comparison' && 'Period for comparison'}
                {settingsSubView === 'subaccounts' && 'Display projects of subaccounts'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDashboardSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                title="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-xs text-gray-800">
              {/* VIEW 1: MAIN SETTINGS (matches Screenshot 1) */}
              {settingsSubView === 'main' && (
                <div className="space-y-4">
                  {/* Display charts toggle */}
                  <div className="flex items-center justify-between py-1">
                    <span className="font-semibold text-gray-900 text-[13px]">Display charts</span>
                    <button
                      type="button"
                      onClick={() => setDisplayCharts(!displayCharts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        displayCharts ? 'bg-[#0B69FF]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          displayCharts ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Display charts for websites */}
                  <div
                    onClick={() => setSettingsSubView('websites')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#0B69FF] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Display charts for the following websites</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span className="truncate max-w-[200px]">{currentDomainFormatted}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Default chart type */}
                  <div
                    onClick={() => setSettingsSubView('chart_type')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#0B69FF] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Default chart type</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span>{defaultChartType}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Display Top 5/10/30 in percentage */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-[13px] text-gray-800">Display Top 5/10/30 in percentage</span>
                    <button
                      type="button"
                      onClick={() => setDisplayTopPercentage(!displayTopPercentage)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        displayTopPercentage ? 'bg-[#0B69FF]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          displayTopPercentage ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sum up top 5/10/30 values */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-800">
                      <span>Sum up top 5/10/30 values</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSumUpTopValues(!sumUpTopValues)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        sumUpTopValues ? 'bg-[#0B69FF]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          sumUpTopValues ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Period for comparison */}
                  <div
                    onClick={() => setSettingsSubView('comparison')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#0B69FF] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Period for comparison</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span>{periodForComparison}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Display projects of subaccounts */}
                  <div
                    onClick={() => setSettingsSubView('subaccounts')}
                    className="flex items-center justify-between py-2 border-t border-gray-100 cursor-pointer hover:text-[#0B69FF] transition-colors"
                  >
                    <span className="text-[13px] text-gray-800">Display projects of subaccounts</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <span>{displaySubaccounts}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: WEBSITES SUBVIEW (matches Screenshot 2) */}
              {settingsSubView === 'websites' && (
                <div className="space-y-3">
                  {projects.map((p) => {
                    const d = p.domain.startsWith('http') ? p.domain : `https://${p.domain}/`;
                    const isSelected = selectedWebsites.includes(p.id) || currentDomainFormatted.includes(p.domain);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProject(p);
                          setSelectedWebsites([p.id]);
                        }}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={`https://www.google.de/s2/favicons?domain=${p.domain}`}
                            alt=""
                            className="w-4 h-4 rounded-xs shrink-0"
                          />
                          <span className="text-[13px] font-medium text-gray-900 truncate">
                            {d} ({d})
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0B69FF] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 3: DEFAULT CHART TYPE (matches Screenshot 3) */}
              {settingsSubView === 'chart_type' && (
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Average position', id: 'avg_pos' },
                    { label: 'Traffic forecast', id: 'traffic' },
                    { label: 'Search visibility', id: 'visibility' },
                    { label: '% in Top 10', id: 'top10' },
                    { label: 'Mention Presence', id: 'mention' },
                    { label: 'Link Presence', id: 'link' },
                  ].map((ct) => (
                    <div
                      key={ct.label}
                      onClick={() => {
                        setDefaultChartType(ct.label);
                        setActiveMetricTab(ct.id as any);
                      }}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-800"
                    >
                      <span className={defaultChartType === ct.label ? 'font-semibold text-gray-900' : ''}>
                        {ct.label}
                      </span>
                      {defaultChartType === ct.label && (
                        <Check className="w-4 h-4 text-[#0B69FF]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW 4: PERIOD FOR COMPARISON (matches Screenshot 4) */}
              {settingsSubView === 'comparison' && (
                <div className="divide-y divide-gray-100">
                  {['Last month', 'Last 3 months', 'Last 6 months', 'Last year'].map((period) => (
                    <div
                      key={period}
                      onClick={() => setPeriodForComparison(period)}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-800"
                    >
                      <span className={periodForComparison === period ? 'font-semibold text-gray-900' : ''}>
                        {period}
                      </span>
                      {periodForComparison === period && (
                        <Check className="w-4 h-4 text-[#0B69FF]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW 5: SUBACCOUNTS (matches Screenshot 5) */}
              {settingsSubView === 'subaccounts' && (
                <div className="divide-y divide-gray-100">
                  {['Do not show', 'In a general list', 'In a separate table'].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setDisplaySubaccounts(opt)}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer text-[13px] text-gray-800"
                    >
                      <span className={displaySubaccounts === opt ? 'font-semibold text-gray-900' : ''}>
                        {opt}
                      </span>
                      {displaySubaccounts === opt && (
                        <Check className="w-4 h-4 text-[#0B69FF]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer matching Screenshots */}
            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
              {settingsSubView !== 'main' ? (
                <button
                  type="button"
                  onClick={() => setSettingsSubView('main')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  <span>BACK</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDashboardSettingsOpen(false)}
                  className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        'se_ranking_dashboard_settings',
                        JSON.stringify({
                          displayCharts,
                          defaultChartType,
                          displayTopPercentage,
                          sumUpTopValues,
                          periodForComparison,
                          displaySubaccounts,
                          selectedWebsites,
                        })
                      );
                    } catch (e) {
                      // ignore
                    }
                    setIsDashboardSettingsOpen(false);
                  }}
                  className="px-5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded shadow-xs cursor-pointer transition-colors"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tell us what you think Feedback Modal matching Screenshot */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Export Data Modal matching user mobile screenshot */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden flex flex-col border border-gray-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Export data</h3>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={exportSearch}
                  onChange={(e) => setExportSearch(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-9 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B69FF]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Tree Selector */}
              <div className="border border-gray-200 rounded-lg p-2 max-h-60 overflow-y-auto space-y-1 text-xs">
                {/* All Projects */}
                <div
                  onClick={() => setIsAllProjectsChecked(!isAllProjectsChecked)}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer text-gray-800 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">⬡</span>
                    <span>All Projects</span>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    isAllProjectsChecked ? 'bg-[#0B69FF] text-white' : 'border border-gray-300'
                  }`}>
                    {isAllProjectsChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Ungrouped websites */}
                <div className="pl-4 space-y-1">
                  <div
                    onClick={() => setIsUngroupedExpanded(!isUngroupedExpanded)}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 cursor-pointer text-gray-700 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isUngroupedExpanded ? '' : '-rotate-90'}`} />
                      <Folder className="w-3.5 h-3.5 text-gray-500" />
                      <span>Ungrouped websites</span>
                      <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">1</span>
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isAllProjectsChecked ? 'bg-[#0B69FF] text-white' : 'border border-gray-300'
                    }`}>
                      {isAllProjectsChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Websites list with real dynamic logos */}
                  {isUngroupedExpanded && (
                    <div className="space-y-1">
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="pl-6 flex items-center justify-between p-1.5 rounded bg-blue-50/50 text-gray-900 font-medium"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ProjectFavicon
                              domain={proj.domain}
                              className="w-4 h-4 rounded-xs shrink-0"
                            />
                            <span className="truncate text-xs font-semibold">{proj.domain}</span>
                          </div>
                          <div className="w-4 h-4 rounded bg-[#0B69FF] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExport();
                  setIsExportModalOpen(false);
                }}
                className="px-5 py-1.5 bg-[#0B69FF] hover:bg-blue-600 text-white rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                EXPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recheck rankings Modal (Exact match to screenshot 6) */}
      {isRecheckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Recheck rankings</h3>
              <button
                type="button"
                onClick={() => setIsRecheckModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <th className="pb-2 font-bold">WEBSITES</th>
                    <th className="pb-2 text-right font-bold">KEYWORDS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(selectedRowIds.length > 0
                    ? projects.filter((p) => selectedRowIds.includes(p.id))
                    : projects.slice(0, 1)
                  ).map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 flex items-center gap-2">
                        <ProjectFavicon domain={p.domain} className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          {p.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-gray-800">
                        11
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsRecheckModalOpen(false)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmRecheckRankings}
                disabled={isRechecking}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0952C7] text-white font-bold text-xs uppercase rounded cursor-pointer shadow-xs transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isRechecking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>RECHECK RANKINGS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom SE Ranking Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Delete project</h3>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete {selectedRowIds.length} project(s)? This will permanently remove its tracked keywords, historical ranking data, and competitor tracking.
            </div>

            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded cursor-pointer transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProjects}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded cursor-pointer shadow-xs transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>DELETE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
