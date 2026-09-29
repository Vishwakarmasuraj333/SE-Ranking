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

  // Empty trend grid lines matching screenshot
  const chartData = [
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

      <div className="max-w-[1440px] mx-auto px-6 py-5 space-y-4">
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
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
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
            className="flex items-center gap-1.5 px-4 py-2 bg-[#20b26c] hover:bg-[#1ba061] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE PROJECT</span>
          </button>

          {/* Recheck Data Dropdown matching Screenshot */}
          <div className="relative">
            <button
              onClick={() => setIsRecheckOpen(!isRecheckOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RECHECK DATA</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isRecheckOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                {/* Recheck rankings item */}
                <div
                  onMouseEnter={() => setHoveredRecheckMenu('rankings')}
                  className="relative px-3.5 py-2 hover:bg-gray-100 text-gray-800 flex items-center justify-between cursor-pointer font-medium"
                >
                  <span>Recheck rankings</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                  {/* Level 2 Flyout Menu */}
                  {hoveredRecheckMenu === 'rankings' && (
                    <div className="absolute top-0 left-full ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs">
                      <div
                        onClick={() => {
                          alert('Recheck selected rankings initiated');
                          setIsRecheckOpen(false);
                        }}
                        className="px-3 py-2 text-gray-400 hover:bg-gray-50 cursor-pointer"
                      >
                        Recheck selected
                      </div>
                      <div
                        onClick={() => {
                          alert('Rechecking all rankings for active websites...');
                          setIsRecheckOpen(false);
                        }}
                        className="px-3 py-2 text-gray-800 hover:bg-blue-50/70 hover:text-[#2563eb] font-semibold cursor-pointer"
                      >
                        Recheck all
                      </div>
                    </div>
                  )}
                </div>

                {/* Recheck search volume item */}
                <div
                  onMouseEnter={() => setHoveredRecheckMenu('search_volume')}
                  className="relative px-3.5 py-2 hover:bg-gray-100 text-gray-800 flex items-center justify-between cursor-pointer font-medium"
                >
                  <span>Recheck search volume</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

                  {hoveredRecheckMenu === 'search_volume' && (
                    <div className="absolute top-0 left-full ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs">
                      <div
                        onClick={() => {
                          alert('Recheck search volume for all keywords initiated');
                          setIsRecheckOpen(false);
                        }}
                        className="px-3 py-2 text-gray-800 hover:bg-blue-50/70 hover:text-[#2563eb] font-semibold cursor-pointer"
                      >
                        Recheck all keywords
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric Tabs Bar */}
        <div className="border-b border-gray-200 pt-2">
          <div className="flex items-center gap-6 overflow-x-auto text-[11.5px] font-bold tracking-wider text-gray-500 no-scrollbar">
            {[
              { id: 'avg_pos', label: 'AVERAGE POSITION' },
              { id: 'traffic', label: 'TRAFFIC FORECAST' },
              { id: 'visibility', label: 'SEARCH VISIBILITY' },
              { id: 'top10', label: '% IN TOP 10' },
              { id: 'mention', label: 'MENTION PRESENCE ✨' },
              { id: 'link', label: 'LINK PRESENCE ✨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMetricTab(tab.id as any)}
                className={`pb-2.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeMetricTab === tab.id
                    ? 'border-[#2563eb] text-[#2563eb]'
                    : 'border-transparent hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Filters Sub-bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-semibold border-b border-gray-100 pb-3">
          <div className="flex items-center gap-4">
            {(['WEEK', 'MONTH', '3 MONTHS', '6 MONTHS'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`hover:text-gray-900 cursor-pointer ${
                  timeRange === r ? 'text-[#2563eb] font-bold' : ''
                }`}
              >
                {r}
              </button>
            ))}
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
              GROUP BY: DAYS <ChevronDown className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            {(['ALL', 'WEBSITES', 'GROUPS'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveViewFilter(view)}
                className={`hover:text-gray-900 cursor-pointer ${
                  activeViewFilter === view ? 'text-[#2563eb]' : 'text-gray-500'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View with vertical AVERAGE POSITION label */}
        {displayCharts && (
          <div className="space-y-2">
            <div className="relative h-56 w-full pt-2 border border-gray-100 rounded-lg p-3 bg-white">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-wider">
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

        {/* Search & Columns header */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-xs focus:outline-hidden focus:border-[#2563eb]"
              />
              <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="flex items-center gap-2">
              {/* Folder/Group dropdown */}
              <button className="p-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center gap-1 text-xs">
                <Folder className="w-3.5 h-3.5 text-gray-500" />
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Columns button */}
              <button className="px-2.5 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                <span>COLUMNS</span>
              </button>
            </div>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-2">Projects</h3>

          {/* Projects Table matching Screenshot */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10.5px] tracking-wider">
                <tr>
                  <th className="p-3 w-8">
                    <input type="checkbox" className="rounded text-[#2563eb]" />
                  </th>
                  <th className="p-3">
                    WEBSITES (1 - {filteredProjects.length || 1} out of {filteredProjects.length || 1})
                  </th>
                  <th className="p-3 text-center">TOP 5 / 10 / 30</th>
                  <th className="p-3 text-center">KEYWORDS</th>
                  <th className="p-3 text-center">PROMPTS</th>
                  <th className="p-3 text-center">AVG. POSITION</th>
                  <th className="p-3 text-center">MENTION PRESENCE</th>
                  <th className="p-3 text-center">LINK PRESENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((p) => {
                  const displayDomain = p.domain.startsWith('http')
                    ? p.domain
                    : `https://${p.domain}`;
                  const isCurrentActive = activeProject?.id === p.id || activeProject?.domain === p.domain;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setActiveProject(p)}
                      className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${
                        isCurrentActive ? 'bg-blue-50/15' : ''
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded text-[#2563eb]" />
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
                            className="hover:text-[#2563eb] hover:underline truncate"
                          >
                            {displayDomain}
                          </Link>
                        </div>
                      </td>
                      <td className="p-3 text-center text-gray-600 font-mono">0 / 0 / 0</td>
                      <td className="p-3 text-center">
                        <Link
                          href="/research/keyword-research"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2563eb] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>🔍 Find</span>
                        </Link>
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/research/ai-search?domain=${p.domain}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2563eb] font-semibold hover:underline"
                        >
                          Add
                        </Link>
                      </td>
                      <td className="p-3 text-center text-gray-400">-</td>
                      <td className="p-3 text-center text-gray-400">N/A</td>
                      <td className="p-3 text-center text-gray-400">N/A</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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
