'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface ReportRow {
  id: string;
  title: string;
  domain: string;
  updated: string;
  sent: string;
  frequency: string;
  language: string;
  period: string;
  hasSchedule: boolean;
}

export default function ReportBuilderPage() {
  // Tabs: 'my' | 'shared'
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');

  // Filter dropdown: 'All reports' | 'With schedule' | 'Without schedule'
  const [scheduleFilter, setScheduleFilter] = useState<'All reports' | 'With schedule' | 'Without schedule'>('All reports');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Rows per page
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

  // Dismissible banners (matching screenshot)
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

  // Accordion for "My templates"
  const [isMyTemplatesOpen, setIsMyTemplatesOpen] = useState(false);

  // Modals
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<ReportRow | null>(null);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [bugMessage, setBugMessage] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  // Selected row checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // System templates for "My templates" dropdown
  const templatesList = [
    { name: 'Rankings Overview', desc: 'Keyword positions, top movers, and search volume overview' },
    { name: 'Monthly Report: Rankings & Traffic', desc: 'Full monthly SEO summary with Google Analytics & GSC' },
    { name: 'Traffic Overview', desc: 'Organic traffic growth, top landing pages, and search engines' },
    { name: 'Organic Traffic', desc: 'Organic keywords and SERP features distribution' },
    { name: 'Rankings & Competitors', desc: 'SERP comparison against key domain competitors' },
    { name: 'Competitor Overview', desc: 'Share of voice and competitor backlink gap' },
    { name: 'SEO Report', desc: 'Comprehensive technical and organic ranking audit' },
    { name: 'Website Audit Overview', desc: 'Core Web Vitals, crawlability score, and technical errors' },
  ];

  // Reports data matching screenshot exactly:
  // workcomposer.com Project Report | Sep-29 2026 | - | Every week, on: Tuesday | English | Sep-23 2026 - Sep-29 2026
  const [reports, setReports] = useState<ReportRow[]>([
    {
      id: '10075967',
      title: 'workcomposer.com Project Report',
      domain: 'workcomposer.com',
      updated: 'Sep-29 2026',
      sent: '-',
      frequency: 'Every week, on: Tuesday',
      language: 'English',
      period: 'Sep-23 2026 - Sep-29 2026',
      hasSchedule: true,
    },
  ]);

  // New report form state
  const [newTitle, setNewTitle] = useState('workcomposer.com Project Report');
  const [newFrequency, setNewFrequency] = useState('Every week, on: Tuesday');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newPeriod, setNewPeriod] = useState('Sep-23 2026 - Sep-29 2026');

  // New template form state
  const [newTemplateName, setNewTemplateName] = useState('');

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length && filteredReports.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: ReportRow = {
      id: String(Date.now()),
      title: newTitle.trim(),
      domain: 'workcomposer.com',
      updated: 'Sep-29 2026',
      sent: '-',
      frequency: newFrequency,
      language: newLanguage,
      period: newPeriod,
      hasSchedule: newFrequency !== 'Without schedule',
    };

    setReports([created, ...reports]);
    setIsCreateReportModalOpen(false);
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (activeTab === 'shared') return false;
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (scheduleFilter === 'With schedule' && !r.hasSchedule) return false;
    if (scheduleFilter === 'Without schedule' && r.hasSchedule) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#171B24] font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-6 space-y-4">
      <div className="space-y-4">
        {/* ===================== ROW 1: MY TEMPLATES ACCORDION ===================== */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 sm:p-4 shadow-2xs transition-all">
          <div className="flex items-center justify-between">
            {/* Accordion Toggle */}
            <div
              onClick={() => setIsMyTemplatesOpen(!isMyTemplatesOpen)}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <svg
                className={`w-4 h-4 text-[#8C95A6] group-hover:text-[#171B24] transition-transform duration-200 ${
                  isMyTemplatesOpen ? 'rotate-90' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-sm font-semibold text-[#171B24] group-hover:text-[#2870ED] transition-colors">
                My templates
              </span>
            </div>

            {/* + CREATE TEMPLATE BUTTON (Exact match: green outline & text) */}
            <button
              onClick={() => setIsCreateTemplateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0FDF4] active:bg-[#DCFCE7] text-[#10B981] font-bold text-xs rounded-[6px] border border-[#10B981] transition-colors cursor-pointer uppercase tracking-wider"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>CREATE TEMPLATE</span>
            </button>
          </div>

          {/* Accordion Expand Body */}
          {isMyTemplatesOpen && (
            <div className="pt-4 mt-3 border-t border-[#F0F2F5] animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {templatesList.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setNewTitle(`workcomposer.com - ${tpl.name}`);
                      setIsCreateReportModalOpen(true);
                    }}
                    className="p-3 bg-[#FAFBFD] hover:bg-white border border-[#E2E8F0] hover:border-[#10B981] rounded-[8px] cursor-pointer transition-all group shadow-2xs hover:shadow-xs"
                  >
                    <div className="text-xs font-bold text-[#171B24] group-hover:text-[#10B981] mb-1">
                      {tpl.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] line-clamp-2">
                      {tpl.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===================== ROW 2: BLUE COMBINED INFO BANNER ===================== */}
        {showInfoBanner && (
          <div className="bg-[#EDF5FF] border border-[#B8D7FF] rounded-[8px] p-3.5 sm:p-4 relative flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
            {/* Info Icon (Blue circle with white i) */}
            <div className="shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full bg-[#1976D2] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                i
              </div>
            </div>

            {/* Banner Text (Exact match from screenshot) */}
            <div className="flex-1 text-xs text-[#1E3A8A] leading-relaxed pr-6">
              We combined manual and scheduled reports into a single report. You can configure its sending schedule, download it immediately, or select both options in the report&apos;s settings. When you download the report, you can be confident that it contains up-to-date information. Below, you will find all your reports, which were previously separated into two tabs. These reports can be filtered based on whether or not they have a sending schedule.
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowInfoBanner(false)}
              className="absolute top-3.5 right-3.5 text-[#1976D2]/70 hover:text-[#1976D2] p-1 cursor-pointer transition-colors"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* ===================== ROW 3: YELLOW WARNING BANNER ===================== */}
        {showWarningBanner && (
          <div className="bg-[#FEF9E7] border border-[#FDE68A] rounded-[8px] p-3.5 sm:p-4 relative flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
            {/* Warning Icon (Amber/Yellow circle with !) */}
            <div className="shrink-0 mt-0.5">
              <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                !
              </div>
            </div>

            {/* Banner Text (Exact match from screenshot) */}
            <div className="flex-1 text-xs text-[#92400E] leading-relaxed pr-6">
              We&apos;ve updated our Traffic Forecast algorithm, which might affect your scheduled reports with traffic data. Please ensure that you take into account possible deviations from previous values.{' '}
              <a
                href="https://help.seranking.com/hc/en-us/articles/16332595832604-Overview-section"
                target="_blank"
                rel="noreferrer"
                className="text-[#2563EB] hover:underline font-semibold cursor-pointer ml-1"
              >
                Learn more
              </a>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowWarningBanner(false)}
              className="absolute top-3.5 right-3.5 text-[#D97706]/70 hover:text-[#D97706] p-1 cursor-pointer transition-colors"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* ===================== ROW 4: MAIN WHITE CONTAINER WITH TABLE ===================== */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-2xs overflow-hidden">
          
          {/* Top Controls Bar */}
          <div className="p-3.5 sm:p-4 border-b border-[#F0F2F5]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Switch Tabs: MY REPORTS 1 | SHARED REPORTS 0 */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('my')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'my'
                        ? 'bg-[#4D4D6B] text-white shadow-2xs'
                        : 'bg-[#F2F4F7] text-[#555C68] hover:bg-[#E9ECF0]'
                    }`}
                  >
                    <span>MY REPORTS</span>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                        activeTab === 'my'
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E1E4EA] text-[#555C68]'
                      }`}
                    >
                      {reports.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('shared')}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'shared'
                        ? 'bg-[#4D4D6B] text-white shadow-2xs'
                        : 'bg-[#F2F4F7] text-[#555C68] hover:bg-[#E9ECF0]'
                    }`}
                  >
                    <span>SHARED REPORTS</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-[#E1E4EA] text-[#555C68]">
                      0
                    </span>
                  </button>
                </div>

                {/* Search Input with Magnifying Glass on the right */}
                <div className="relative w-48 sm:w-60">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] placeholder-[#98A2B3] focus:outline-hidden focus:border-[#2870ED] transition-colors"
                  />
                  <svg
                    className="w-4 h-4 text-[#98A2B3] absolute right-2.5 top-2.5 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                {/* All reports Dropdown Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className="px-3 py-1.5 bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] rounded-[6px] text-xs font-medium text-[#344054] flex items-center gap-2 cursor-pointer transition-colors select-none"
                  >
                    <span>{scheduleFilter}</span>
                    <svg
                      className={`w-3.5 h-3.5 text-[#667085] transition-transform ${
                        isFilterDropdownOpen ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-44 bg-white border border-[#E2E8F0] rounded-[6px] shadow-lg py-1 z-30 text-xs">
                      {(['All reports', 'With schedule', 'Without schedule'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setScheduleFilter(mode);
                            setIsFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-[#F2F5F8] cursor-pointer flex items-center justify-between ${
                            scheduleFilter === mode
                              ? 'font-bold text-[#2870ED] bg-blue-50/40'
                              : 'text-[#171B24]'
                          }`}
                        >
                          <span>{mode}</span>
                          {scheduleFilter === mode && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* + CREATE REPORT ACTION BUTTON */}
              <div>
                <button
                  onClick={() => setIsCreateReportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-[6px] shadow-xs cursor-pointer uppercase tracking-wider transition-colors"
                >
                  <span className="text-sm font-bold leading-none">+</span>
                  <span>NEW REPORT</span>
                </button>
              </div>

            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#667085] font-bold text-[11px] tracking-wide select-none">
                  <th className="py-2.5 px-4 w-[340px]">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded-[3px] border-[#CBD5E1] text-[#2870ED] focus:ring-0 cursor-pointer"
                      />
                      <span>REPORT TITLE</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 w-[160px]">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#171B24]">
                      <span>UPDATED</span>
                      <svg className="w-3.5 h-3.5 text-[#2870ED]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                      </svg>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 w-[120px]">SENT</th>
                  <th className="py-2.5 px-4 w-[240px]">FREQUENCY</th>
                  <th className="py-2.5 px-4 w-[130px]">LANGUAGE</th>
                  <th className="py-2.5 px-4">REPORT PERIOD</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-[#667085]">
                      {activeTab === 'shared'
                        ? 'No shared reports available.'
                        : 'No reports found matching your criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isHovered = hoveredRowId === row.id;

                    return (
                      <tr
                        key={row.id}
                        onMouseEnter={() => setHoveredRowId(row.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        className={`border-b border-[#F0F2F5] transition-colors group ${
                          isSelected ? 'bg-blue-50/40' : 'bg-white hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {/* Report Title & PDF Icon */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOne(row.id)}
                                className="w-3.5 h-3.5 rounded-[3px] border-[#CBD5E1] text-[#2870ED] focus:ring-0 cursor-pointer"
                              />

                              {/* Red PDF Icon matching exact screenshot */}
                              <div className="w-4 h-4 rounded-[2px] bg-[#E53935] text-white flex items-center justify-center font-bold text-[8px] tracking-tight shrink-0 shadow-2xs">
                                PDF
                              </div>

                              {/* Clickable Title opens realistic preview modal */}
                              <span
                                onClick={() => setSelectedReportForPreview(row)}
                                className="font-semibold text-[#171B24] hover:text-[#2870ED] cursor-pointer transition-colors"
                              >
                                {row.title}
                              </span>
                            </div>

                            {/* Hover Quick Actions */}
                            <div
                              className={`flex items-center gap-1 transition-opacity ${
                                isHovered ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              <button
                                onClick={() => setSelectedReportForPreview(row)}
                                title="View & Download Report"
                                className="p-1 text-[#667085] hover:text-[#2870ED] hover:bg-blue-50 rounded cursor-pointer transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReportForPreview(row);
                                  setTimeout(() => window.print(), 300);
                                }}
                                title="Download PDF"
                                className="p-1 text-[#667085] hover:text-[#10B981] hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteReport(row.id)}
                                title="Delete report"
                                className="p-1 text-[#667085] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#667085]">{row.updated}</td>
                        <td className="py-3 px-4 text-[#667085]">{row.sent}</td>
                        <td className="py-3 px-4 text-[#171B24] font-medium">{row.frequency}</td>
                        <td className="py-3 px-4 text-[#667085]">{row.language}</td>
                        <td className="py-3 px-4 text-[#667085]">{row.period}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Rows selector: 20 ˅ (Matching exact screenshot) */}
          <div className="p-3 border-t border-[#F0F2F5] flex items-center justify-end">
            <div className="relative">
              <button
                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                className="px-2.5 py-1 bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] rounded-[6px] text-xs font-medium text-[#344054] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{rowsPerPage}</span>
                <svg
                  className={`w-3 h-3 text-[#667085] transition-transform ${
                    isRowsDropdownOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                </svg>
              </button>

              {isRowsDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-20 bg-white border border-[#E2E8F0] rounded-[6px] shadow-lg py-1 z-30 text-xs">
                  {['20', '50', '100'].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setRowsPerPage(val);
                        setIsRowsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1 hover:bg-[#F2F5F8] cursor-pointer ${
                        rowsPerPage === val ? 'font-bold text-[#2870ED]' : 'text-[#171B24]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ===================== PAGE BOTTOM FOOTER BAR ===================== */}
      {/* Exact match from screenshot: SE Ranking logo on left, links on right */}
      <div className="pt-6 pb-2 flex flex-wrap items-center justify-between gap-4 text-xs text-[#667085] select-none">
        {/* Left: SE Ranking Dark Logo */}
        <div className="flex items-center gap-2">
          <SeRankingLogo variant="dark" width={95} height={20} />
        </div>

        {/* Right Links matching screenshot */}
        <div className="flex items-center gap-5 font-normal">
          <button
            onClick={() => setIsBugReportOpen(true)}
            className="hover:text-[#2870ED] transition-colors cursor-pointer"
          >
            Report a bug
          </button>
          <a
            href="https://seranking.com/affiliate.html"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#2870ED] transition-colors"
          >
            Affiliates
          </a>
          <Link href="/api-docs" className="hover:text-[#2870ED] transition-colors">
            API
          </Link>
          <Link href="/whats-new" className="hover:text-[#2870ED] transition-colors">
            What&apos;s new
          </Link>
          <Link href="/help" className="hover:text-[#2870ED] transition-colors">
            Help
          </Link>
        </div>
      </div>

      {/* ===================== MODAL: REPORT VIEWER & PDF EXPORTER ===================== */}
      {selectedReportForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#E2E8F0] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#1E293B] text-white flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[#E53935] text-white flex items-center justify-center font-black text-[9px]">
                  PDF
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white">
                    {selectedReportForPreview.title}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Domain: https://www.workcomposer.com/ • Period: {selectedReportForPreview.period}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-[6px] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  <span>DOWNLOAD / PRINT PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReportForPreview(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-full text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body - Realistic SEO Executive Report */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFBFD] print:p-0 print:bg-white">
              
              {/* Cover Summary Banner */}
              <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider mb-1">
                    Scheduled Weekly SEO Performance Audit
                  </div>
                  <h2 className="text-xl font-bold text-[#171B24]">
                    workcomposer.com Project Report
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Generated automatically on <b>Sep-29 2026</b> for active website monitoring.
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] p-3 text-right text-xs space-y-1">
                  <div><b>Frequency:</b> Every week, on: Tuesday</div>
                  <div><b>Language:</b> English</div>
                  <div><b>Target Market:</b> Global / English</div>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 shadow-2xs">
                  <div className="text-[11px] text-[#64748B] font-semibold">Average Position</div>
                  <div className="text-2xl font-black text-[#171B24] mt-1">3.8</div>
                  <div className="text-[10px] text-[#10B981] font-bold mt-1">▲ +0.6 vs last week</div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 shadow-2xs">
                  <div className="text-[11px] text-[#64748B] font-semibold">Est. Organic Traffic</div>
                  <div className="text-2xl font-black text-[#171B24] mt-1">42,850</div>
                  <div className="text-[10px] text-[#10B981] font-bold mt-1">▲ +12.4% traffic growth</div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 shadow-2xs">
                  <div className="text-[11px] text-[#64748B] font-semibold">Total Ranked Keywords</div>
                  <div className="text-2xl font-black text-[#171B24] mt-1">1,420</div>
                  <div className="text-[10px] text-[#2870ED] font-bold mt-1">128 in Top 10</div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-3.5 shadow-2xs">
                  <div className="text-[11px] text-[#64748B] font-semibold">Website Health Score</div>
                  <div className="text-2xl font-black text-[#10B981] mt-1">94 / 100</div>
                  <div className="text-[10px] text-[#10B981] font-bold mt-1">0 Critical Errors</div>
                </div>
              </div>

              {/* Section 1: Top Keywords Table */}
              <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 shadow-2xs">
                <h4 className="font-bold text-xs text-[#171B24] mb-3 uppercase tracking-wider">
                  Top Ranked Keywords Summary
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#F0F2F5] text-[#64748B] font-semibold">
                        <th className="pb-2">Keyword</th>
                        <th className="pb-2">Position</th>
                        <th className="pb-2">Volume</th>
                        <th className="pb-2">Difficulty</th>
                        <th className="pb-2">URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F2F5]">
                      {[
                        { kw: 'employee productivity tracker', pos: '1', vol: '14,200', diff: '34%', url: '/features/tracker' },
                        { kw: 'workcomposer desktop app', pos: '1', vol: '8,100', diff: '18%', url: '/download' },
                        { kw: 'remote team monitoring software', pos: '2', vol: '22,400', diff: '45%', url: '/solutions/remote' },
                        { kw: 'automatic time tracker windows', pos: '3', vol: '6,700', diff: '29%', url: '/windows-tracking' },
                        { kw: 'best employee screenshot software', pos: '4', vol: '5,300', diff: '41%', url: '/screenshots' },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]">
                          <td className="py-2 font-semibold text-[#171B24]">{item.kw}</td>
                          <td className="py-2 text-[#10B981] font-black">{item.pos}</td>
                          <td className="py-2 text-[#64748B]">{item.vol}</td>
                          <td className="py-2 text-[#64748B]">{item.diff}</td>
                          <td className="py-2 text-[#2870ED] truncate max-w-[150px]">{item.url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: AI Search Studio & Competitor Presence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 shadow-2xs">
                  <h4 className="font-bold text-xs text-[#171B24] mb-2 uppercase tracking-wider">
                    AI Search Engine Presence
                  </h4>
                  <div className="space-y-2.5 mt-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[#64748B] mb-1">
                        <span>ChatGPT Search Citations</span>
                        <span className="font-bold text-[#171B24]">72%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-[#10B981] h-full rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#64748B] mb-1">
                        <span>Google AI Overviews</span>
                        <span className="font-bold text-[#171B24]">65%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-[#2870ED] h-full rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#64748B] mb-1">
                        <span>Perplexity.ai Source Mentions</span>
                        <span className="font-bold text-[#171B24]">58%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: '58%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 shadow-2xs">
                  <h4 className="font-bold text-xs text-[#171B24] mb-2 uppercase tracking-wider">
                    Competitor Share of Voice
                  </h4>
                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC]">
                      <span className="font-bold text-[#171B24]">workcomposer.com (Your Site)</span>
                      <span className="text-[#10B981] font-bold">44.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded">
                      <span className="text-[#64748B]">timecamp.com</span>
                      <span className="font-semibold text-[#171B24]">26.8%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded">
                      <span className="text-[#64748B]">zohosocial.com</span>
                      <span className="font-semibold text-[#171B24]">18.4%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Bar */}
            <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                Automated weekly dispatch configured for: <b>Every week, on: Tuesday</b>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReportForPreview(null)}
                  className="px-4 py-1.5 border border-[#D0D5DD] hover:bg-gray-50 text-[#344054] rounded-[6px] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Report link copied to clipboard!');
                  }}
                  className="px-4 py-1.5 bg-[#2870ED] hover:bg-[#1C5CD1] text-white font-bold rounded-[6px] cursor-pointer"
                >
                  Share Report
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE TEMPLATE ===================== */}
      {isCreateTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-[#E2E8F0] relative">
            <button
              onClick={() => setIsCreateTemplateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-[#171B24] mb-1">Create Report Template</h3>
            <p className="text-xs text-[#64748B] mb-4">
              Configure custom modular sections to reuse across your client and project reports.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsCreateTemplateModalOpen(false);
                alert(`Template "${newTemplateName || 'Custom Template'}" created and added to "My templates"!`);
                setNewTemplateName('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Executive Rankings & AI Citations"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] focus:outline-hidden focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1.5">
                  Included Modules
                </label>
                <div className="space-y-1.5 text-xs text-[#344054]">
                  {['Rankings Summary & Movers', 'Traffic & Analytics Overview', 'AI Search Engine Visibility', 'Website Technical Audit', 'Competitor Comparison'].map((mod, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#10B981] focus:ring-0" />
                      <span>{mod}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0F2F5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#D0D5DD] text-[#344054] text-xs rounded-[6px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-[6px] cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE REPORT ===================== */}
      {isCreateReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-[#E2E8F0] relative">
            <button
              onClick={() => setIsCreateReportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-[#171B24] mb-1">Create Report</h3>
            <p className="text-xs text-[#64748B] mb-4">
              Schedule or generate an instant SEO performance report for your project.
            </p>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] focus:outline-hidden focus:border-[#2870ED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] focus:outline-hidden focus:border-[#2870ED]"
                  >
                    <option value="Every week, on: Tuesday">Every week, on: Tuesday</option>
                    <option value="Every week, on: Wednesday">Every week, on: Wednesday</option>
                    <option value="Every Monday morning">Every Monday morning</option>
                    <option value="Monthly, on the 1st">Monthly, on the 1st</option>
                    <option value="Without schedule">Without schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] focus:outline-hidden focus:border-[#2870ED]"
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Report Period</label>
                <input
                  type="text"
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] focus:outline-hidden focus:border-[#2870ED]"
                />
              </div>

              <div className="pt-3 border-t border-[#F0F2F5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#D0D5DD] text-[#344054] text-xs rounded-[6px] hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-[6px] cursor-pointer"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: REPORT A BUG ===================== */}
      {isBugReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-[#E2E8F0] relative">
            <button
              onClick={() => setIsBugReportOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-[#171B24] mb-1">Report a Bug</h3>
            <p className="text-xs text-[#64748B] mb-3">
              Encountered an issue with Report Builder? Let our technical engineering team know.
            </p>

            {bugSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <div className="font-bold text-[#171B24] text-sm">Bug report submitted</div>
                <p className="text-xs text-[#64748B]">Thank you for helping us improve SE Ranking Studio.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={bugMessage}
                  onChange={(e) => setBugMessage(e.target.value)}
                  placeholder="Describe what happened or what didn't load..."
                  className="w-full p-2.5 border border-[#D0D5DD] rounded-[6px] text-xs text-[#171B24] focus:outline-hidden focus:border-[#2870ED]"
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-[#F0F2F5]">
                  <button
                    onClick={() => setIsBugReportOpen(false)}
                    className="px-3.5 py-1.5 border border-[#D0D5DD] text-[#344054] text-xs rounded-[6px] hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!bugMessage.trim()) return;
                      try {
                        await fetch('/api/bug-report', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: bugMessage, page: 'Report Builder' }),
                        });
                      } catch {
                        // ignore
                      }
                      setBugSubmitted(true);
                      setTimeout(() => {
                        setBugSubmitted(false);
                        setBugMessage('');
                        setIsBugReportOpen(false);
                      }, 1500);
                    }}
                    className="px-4 py-1.5 bg-[#2870ED] hover:bg-[#1C5CD1] text-white text-xs font-bold rounded-[6px] cursor-pointer"
                  >
                    Send Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
