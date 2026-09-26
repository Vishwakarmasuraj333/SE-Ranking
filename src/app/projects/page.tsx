'use client';

import React, { useState } from 'react';
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

export default function ProjectsDashboardPage() {
  const { projects, activeProject, setActiveProject } = useApp();
  const [activeMetricTab, setActiveMetricTab] = useState<
    'avg_pos' | 'traffic' | 'visibility' | 'top10' | 'mention' | 'link'
  >('avg_pos');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | '3 MONTHS' | '6 MONTHS'>('WEEK');
  const [activeViewFilter, setActiveViewFilter] = useState<'ALL' | 'WEBSITES' | 'GROUPS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 pb-16 select-none">
      <div className="max-w-[1440px] mx-auto px-6 py-5 space-y-4">
        {/* Top Feedback line */}
        <div className="flex justify-end text-xs text-gray-400">
          <button
            onClick={() => alert('Feedback dialog opened')}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            Feedback
          </button>
        </div>

        {/* Action Header matching Screenshot */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Active websites</h1>
            <span className="w-5 h-5 rounded-full bg-[#1E2532] text-white text-[11px] font-bold flex items-center justify-center">
              {projects.length || 1}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exporting active websites list...')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>EXPORT</span>
            </button>

            <Link
              href="/settings"
              className="p-1.5 border border-gray-300 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors"
              title="Project settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE PROJECT</span>
          </button>

          <button
            onClick={() => alert('Rechecking project data...')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RECHECK DATA</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>
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
                    ? 'border-[#0B69FF] text-[#0B69FF]'
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
                  timeRange === r ? 'text-[#0B69FF] font-bold' : ''
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
                  activeViewFilter === view ? 'text-[#0B69FF]' : 'text-gray-500'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View with vertical AVERAGE POSITION label */}
        <div className="relative h-56 w-full pt-2 border border-gray-100 rounded-lg p-3 bg-white">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-wider">
            AVERAGE POSITION
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
          <span>{activeProject?.domain || 'zohosocial.com'}</span>
        </div>

        {/* Search & Columns header */}
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
                    <input type="checkbox" className="rounded text-[#0B69FF]" />
                  </th>
                  <th className="p-3">
                    WEBSITES (1 - {filteredProjects.length} out of {filteredProjects.length})
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
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-3">
                      <input type="checkbox" className="rounded text-[#0B69FF]" />
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                        {/* Zoho colorful square */}
                        <div className="w-4 h-4 rounded-[3px] border border-gray-200 overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0">
                          <div className="bg-[#E53935]" />
                          <div className="bg-[#FB8C00]" />
                          <div className="bg-[#1E88E5]" />
                          <div className="bg-[#43A047]" />
                        </div>
                        <Link
                          href={`/project-overview`}
                          onClick={() => setActiveProject(p)}
                          className="hover:text-[#0B69FF] hover:underline"
                        >
                          {p.domain}
                        </Link>
                      </div>
                    </td>
                    <td className="p-3 text-center text-gray-600 font-mono">0 / 0 / 0</td>
                    <td className="p-3 text-center">
                      <Link
                        href="/research/keyword-research"
                        className="text-[#0B69FF] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>🔍 Find</span>
                      </Link>
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/research/ai-search?domain=${p.domain}`}
                        className="text-[#0B69FF] font-semibold hover:underline"
                      >
                        Add
                      </Link>
                    </td>
                    <td className="p-3 text-center text-gray-400">-</td>
                    <td className="p-3 text-center text-gray-400">N/A</td>
                    <td className="p-3 text-center text-gray-400">N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Footer Links */}
        <div className="pt-12 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            <span>SE Ranking</span>
          </div>

          <div className="flex items-center gap-5 text-gray-400">
            <button onClick={() => alert('Report a bug')} className="hover:text-gray-600">Report a bug</button>
            <button onClick={() => alert('Affiliates')} className="hover:text-gray-600">Affiliates</button>
            <Link href="/api-docs" className="hover:text-gray-600">API</Link>
            <button onClick={() => alert("What's new")} className="hover:text-gray-600">What&apos;s new</button>
            <a href="https://help.seranking.com" target="_blank" className="hover:text-gray-600">Help</a>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
