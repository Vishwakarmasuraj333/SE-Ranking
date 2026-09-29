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

export default function ProjectsDashboardPage() {
  const { projects, activeProject, setActiveProject } = useApp();
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

  // Dynamic chart dates based on groupBy
  const chartData =
    groupBy === 'WEEKS'
      ? [
          { date: 'Week 35', pos: null },
          { date: 'Week 36', pos: null },
          { date: 'Week 37', pos: null },
          { date: 'Week 38', pos: null },
          { date: 'Week 39', pos: null },
        ]
      : groupBy === 'MONTHS'
      ? [
          { date: 'May 2026', pos: null },
          { date: 'Jun 2026', pos: null },
          { date: 'Jul 2026', pos: null },
          { date: 'Aug 2026', pos: null },
          { date: 'Sep 2026', pos: null },
        ]
      : [
          { date: 'Sep 19', pos: null },
          { date: 'Sep 20', pos: null },
          { date: 'Sep 21', pos: null },
          { date: 'Sep 22', pos: null },
          { date: 'Sep 23', pos: null },
          { date: 'Sep 24', pos: null },
          { date: 'Sep 25', pos: null },
        ];

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
              onClick={handleExport}
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

        {/* Chart View with vertical rotated label */}
        {displayCharts && (
          <div className="space-y-2">
            <div className="relative h-56 w-full pt-2 border border-gray-100 rounded-lg p-3 bg-white">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-wider whitespace-nowrap">
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
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project indicator under chart */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>{currentDomainFormatted}</span>
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

          <h3 className="text-base font-bold text-gray-900 mb-2">Projects</h3>

          {/* Projects Table matching Screenshot 1 & 2 */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10.5px] tracking-wider">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded text-[#0B69FF] cursor-pointer"
                    />
                  </th>
                  <th className="p-3">
                    WEBSITES (1 - {filteredProjects.length || 1} out of {filteredProjects.length || 1})
                  </th>
                  {visibleColumns.topRanks && <th className="p-3 text-center">TOP 5 / 10 / 30</th>}
                  {visibleColumns.keywords && <th className="p-3 text-center">KEYWORDS</th>}
                  {visibleColumns.prompts && <th className="p-3 text-center">PROMPTS</th>}
                  {visibleColumns.avgPosition && <th className="p-3 text-center">AVG. POSITION</th>}
                  {visibleColumns.trafficForecast && <th className="p-3 text-center">TRAFFIC FORECAST</th>}
                  {visibleColumns.searchVisibility && <th className="p-3 text-center">SEARCH VISIBILITY</th>}
                  {visibleColumns.top10Percent && <th className="p-3 text-center">% IN TOP 10</th>}
                  {visibleColumns.mentionPresence && <th className="p-3 text-center">MENTION PRESENCE</th>}
                  {visibleColumns.linkPresence && <th className="p-3 text-center">LINK PRESENCE</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((p) => {
                  const displayDomain = p.domain.startsWith('http')
                    ? p.domain
                    : `https://${p.domain}`;
                  const isCurrentActive = activeProject?.id === p.id || activeProject?.domain === p.domain;
                  const isRowSelected = selectedRowIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setActiveProject(p)}
                      className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${
                        isRowSelected ? 'bg-blue-50/25' : isCurrentActive ? 'bg-blue-50/15' : ''
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleToggleRow(p.id)}
                          className="rounded text-[#0B69FF] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <img
                            src={`https://www.google.de/s2/favicons?domain=${p.domain || 'workcomposer.com'}`}
                            alt=""
                            className="w-4 h-4 rounded-xs shrink-0"
                          />
                          <Link
                            href={`/project-overview`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(p);
                            }}
                            className="hover:text-[#0B69FF] hover:underline truncate"
                          >
                            {displayDomain}
                          </Link>
                        </div>
                      </td>
                      {visibleColumns.topRanks && (
                        <td className="p-3 text-center text-gray-600 font-mono">0 / 0 / 0</td>
                      )}
                      {visibleColumns.keywords && (
                        <td className="p-3 text-center">
                          <Link
                            href="/research/keyword-research"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#0B69FF] font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            <span>🔍 Find</span>
                          </Link>
                        </td>
                      )}
                      {visibleColumns.prompts && (
                        <td className="p-3 text-center">
                          <Link
                            href={`/research/ai-search?domain=${p.domain}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#0B69FF] font-semibold hover:underline"
                          >
                            Add
                          </Link>
                        </td>
                      )}
                      {visibleColumns.avgPosition && (
                        <td className="p-3 text-center text-gray-400">-</td>
                      )}
                      {visibleColumns.trafficForecast && (
                        <td className="p-3 text-center text-gray-400">0</td>
                      )}
                      {visibleColumns.searchVisibility && (
                        <td className="p-3 text-center text-gray-400">0%</td>
                      )}
                      {visibleColumns.top10Percent && (
                        <td className="p-3 text-center text-gray-400">0%</td>
                      )}
                      {visibleColumns.mentionPresence && (
                        <td className="p-3 text-center text-gray-400">N/A</td>
                      )}
                      {visibleColumns.linkPresence && (
                        <td className="p-3 text-center text-gray-400">N/A</td>
                      )}
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

        {/* Bottom Footer Links */}
        <div className="pt-12 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <Link href="/projects" className="flex items-center gap-2 font-bold text-gray-700 hover:text-gray-900 cursor-pointer">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#2563eb]">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            <span>SE Ranking</span>
          </Link>

          <div className="flex items-center gap-5 text-gray-400">
            <button onClick={() => setIsBugModalOpen(true)} className="hover:text-gray-600 cursor-pointer">
              Report a bug
            </button>
            <Link href="/affiliate" className="hover:text-gray-600">
              Affiliates
            </Link>
            <Link href="/api-docs" className="hover:text-gray-600">
              API
            </Link>
            <Link href="/whats-new" className="hover:text-gray-600">
              What&apos;s new
            </Link>
            <Link href="/help" className="hover:text-gray-600">
              Help
            </Link>
          </div>
        </div>
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
    </div>
  );
}
