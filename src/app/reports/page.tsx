'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
  // Navigation tabs: 'reports' | 'templates'
  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports');

  // Filter type: 'my' | 'shared'
  const [filterType, setFilterType] = useState<'my' | 'shared'>('my');

  // Modes filter: 'All reports' | 'Without schedule' | 'With schedule'
  const [scheduleFilter, setScheduleFilter] = useState<'All reports' | 'Without schedule' | 'With schedule'>('All reports');
  const [isModesDropdownOpen, setIsModesDropdownOpen] = useState(false);

  // Search input
  const [searchQuery, setSearchQuery] = useState('');

  // Rows per page dropdown
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

  // Dismissible Banners
  const [showModularBanner, setShowModularBanner] = useState(true);
  const [showInfoNotification, setShowInfoNotification] = useState(true);
  const [showWarningNotification, setShowWarningNotification] = useState(true);

  // Accordions
  const [isStartFromTemplateOpen, setIsStartFromTemplateOpen] = useState(true);
  const [isMyTemplatesOpen, setIsMyTemplatesOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(0); // 0: 1-7, 1: 8-12

  // Modals & Feedback
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Create report form
  const [newTitle, setNewTitle] = useState('workcomposer.com Custom Report');
  const [newFrequency, setNewFrequency] = useState('Every week, on: Wednesday');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newPeriod, setNewPeriod] = useState('Sep-21 2026 - Sep-27 2026');

  // 12 Templates matching exact user screenshot & HTML
  const allTemplates = [
    { name: 'Rankings Overview' },
    { name: 'Monthly Report: Rankings & Traffic' },
    { name: 'Traffic Overview' },
    { name: 'Organic Traffic' },
    { name: 'Rankings & Competitors' },
    { name: 'Competitor Overview' },
    { name: 'Rankings & Website Audit' },
    { name: 'SEO report' },
    { name: 'Website Audit Overview' },
    { name: 'Website Audit Issues' },
    { name: 'Social Media Overview' },
    { name: 'Google Ads' },
  ];

  // Reports data
  const [reports, setReports] = useState<ReportRow[]>([
    {
      id: '10075967',
      title: 'zohosocial.com Project Report',
      domain: 'workcomposer.com',
      updated: 'Sep-23 2026',
      sent: '-',
      frequency: 'Every week, on: Wednesday',
      language: 'English',
      period: 'Sep-21 2026 - Sep-27 2026',
      hasSchedule: true,
    },
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reports.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleTemplateClick = (templateName: string) => {
    setNewTitle(`https://www.workcomposer.com/ - ${templateName}`);
    setIsCreateReportModalOpen(true);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReport: ReportRow = {
      id: String(Date.now()),
      title: newTitle.trim(),
      domain: 'workcomposer.com',
      updated: 'Sep-27 2026',
      sent: '-',
      frequency: newFrequency,
      language: newLanguage,
      period: newPeriod,
      hasSchedule: newFrequency !== 'Without schedule',
    };

    setReports([newReport, ...reports]);
    setIsCreateReportModalOpen(false);
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const filteredReports = reports.filter((r) => {
    if (filterType === 'shared') return false;
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (scheduleFilter === 'Without schedule' && r.hasSchedule) return false;
    if (scheduleFilter === 'With schedule' && !r.hasSchedule) return false;
    return true;
  });

  return (
    <div className="section-template section-wrapper__section-content min-h-screen bg-[#F4F6F9] text-[#171B24] font-sans flex flex-col justify-between">
      <div>
        {/* ===================== TOP MODULAR BANNER (Exact match to user screenshot) ===================== */}
        {showModularBanner && (
          <div className="bg-white border-b border-[#E1E6EB] px-6 py-2.5 text-xs text-[#5B6370] flex items-center justify-between shadow-2xs select-none">
            <div className="flex-1 pr-6 leading-relaxed">
              Create reports using the modular approach: add the cover page and the table of contents, edit the contents of the report and add comments to separate sections when necessary. Ready-to-go reports can be saved as a template, downloaded in .PDF, .HTML or .XLS file formats or sent to an email address.
            </div>
            <button
              onClick={() => setShowModularBanner(false)}
              className="text-[#7A8391] hover:text-[#171B24] p-1 cursor-pointer shrink-0"
              title="Close banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* ===================== TOP CONTROL PANEL ===================== */}
        <div className="section-wrapper__top-control bg-white border-b border-[#E1E6EB] px-6 py-2">
          <div className="top-control-panel flex items-center justify-between">
            
            {/* Breadcrumbs */}
            <div className="top-control-panel__cell top-control-panel__cell_grow flex items-center">
              <div className="se-breadcrumbs">
                <ul className="se-breadcrumbs__list flex items-center gap-1.5 text-xs">
                  <li className="se-breadcrumbs__item">
                    <Link href="/reports" className="se-breadcrumbs__link text-[#5B6370] hover:text-[#2870ED] transition-colors">
                      Report Builder
                    </Link>
                  </li>
                  <li className="text-gray-300">/</li>
                  <li className="se-breadcrumbs__item">
                    <span className="se-breadcrumbs__link text-[#171B24] font-semibold">Reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side: Feedback & Scheduled reporting 1 / 5 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="se-table-link text-xs text-[#5B6370] hover:text-[#2870ED] cursor-pointer transition-colors"
              >
                Feedback
              </button>

              {/* Amber limit pill: Scheduled reporting 1 / 5 (Matching screenshot) */}
              <div className="bg-[#FFF8E6] text-[#B78103] border border-[#FFE29A] rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <svg className="w-3.5 h-3.5 text-[#B78103]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.43zM10.59 15.41a2 2 0 1 0 2.83-2.83l-4.24-4.24-1.42 1.41 2.83 2.83a2 2 0 0 0 0 2.83z" />
                </svg>
                <span>Scheduled reporting</span>
                <span className="text-[#171B24]">1 / 5</span>
              </div>
            </div>

          </div>
        </div>

        {/* ===================== SECTION WRAPPER CONTENT ===================== */}
        <div className="section-wrapper__content max-w-7xl mx-auto px-6 py-6">
          <div className="app-main vue-app space-y-5">
            
            {/* TOP PAGE SECTION: Title & + CREATE REPORT */}
            <div className="top-page-section list__top-section flex flex-wrap items-center justify-between gap-4">
              <div className="top-page-section__title text-2xl font-bold text-[#171B24] tracking-tight">
                Report Builder
              </div>
              <div className="top-page-section__wrapper">
                <div className="list__box flex items-center gap-4">
                  
                  {/* Menu Tabs */}
                  <div className="menu-tabs flex items-center bg-[#ECEFF3] p-0.5 rounded-[8px] text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`menu-tabs__tab px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer ${
                        activeTab === 'reports'
                          ? 'menu-tabs__tab_active bg-white text-[#171B24] shadow-xs'
                          : 'text-[#5B6370] hover:text-[#171B24]'
                      }`}
                    >
                      <div className="menu-tabs__tab-title">Reports</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className={`menu-tabs__tab px-3.5 py-1.5 rounded-[6px] transition-all cursor-pointer ${
                        activeTab === 'templates'
                          ? 'menu-tabs__tab_active bg-white text-[#171B24] shadow-xs'
                          : 'text-[#5B6370] hover:text-[#171B24]'
                      }`}
                    >
                      <div className="menu-tabs__tab-title">Templates</div>
                    </button>
                  </div>

                  {/* + CREATE REPORT button (Exact match to screenshot) */}
                  <button
                    onClick={() => setIsCreateReportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white font-bold text-xs rounded-[8px] uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <span className="text-base font-black leading-none">+</span>
                    <span>CREATE REPORT</span>
                  </button>

                </div>
              </div>
            </div>

            {/* ===================== ACCORDION 1: START FROM TEMPLATE ===================== */}
            <div className="se-page__row bg-white border border-[#E1E6EB] rounded-[12px] p-4 shadow-xs">
              <div className="template-list">
                <div className="template-list__head flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                  
                  <div
                    onClick={() => setIsStartFromTemplateOpen(!isStartFromTemplateOpen)}
                    className="template-list__box flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div className="template-list__name flex items-center gap-1">
                      <div className={`transition-transform duration-200 ${isStartFromTemplateOpen ? 'rotate-90' : ''}`}>
                        <svg className="w-5 h-5 text-[#5B6370]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                      </div>
                      <div className="template-list__title text-sm font-bold text-[#171B24]">
                        Start from template
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#5B6370] bg-[#F2F5F8] px-2 py-0.5 rounded-full">
                      12
                    </span>
                  </div>

                  {isStartFromTemplateOpen && (
                    <div className="template-list__active flex items-center gap-3 text-xs text-[#5B6370]">
                      <div className="font-medium">
                        Templates: {templatePage === 0 ? '1 - 7 out of 12' : '8 - 12 out of 12'}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setTemplatePage(0)}
                          disabled={templatePage === 0}
                          className={`p-1.5 rounded-[6px] border border-[#E1E6EB] transition-colors ${
                            templatePage === 0
                              ? 'opacity-35 cursor-not-allowed bg-gray-50'
                              : 'hover:bg-[#F2F5F8] text-[#171B24] cursor-pointer'
                          }`}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTemplatePage(1)}
                          disabled={templatePage === 1}
                          className={`p-1.5 rounded-[6px] border border-[#E1E6EB] transition-colors ${
                            templatePage === 1
                              ? 'opacity-35 cursor-not-allowed bg-gray-50'
                              : 'hover:bg-[#F2F5F8] text-[#171B24] cursor-pointer'
                          }`}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Templates Grid Cards (Matching screenshot) */}
                {isStartFromTemplateOpen && (
                  <div className="template-list__body pt-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-3">
                      {allTemplates
                        .slice(templatePage * 7, templatePage * 7 + 7)
                        .map((tpl, i) => (
                          <div
                            key={i}
                            onClick={() => handleTemplateClick(tpl.name)}
                            className="template-item group cursor-pointer"
                          >
                            <div className="bg-white border border-[#E1E6EB] border-t-4 border-t-[#E5E7EB] group-hover:border-t-[#2870ED] rounded-[8px] p-3 h-24 flex items-center justify-center text-center transition-all group-hover:shadow-xs">
                              <span className="text-xs font-semibold text-[#171B24] group-hover:text-[#2870ED] leading-snug">
                                {tpl.name}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ===================== ACCORDION 2: MY TEMPLATES ===================== */}
            <div className="se-page__row bg-white border border-[#E1E6EB] rounded-[12px] p-4 shadow-xs">
              <div className="template-list template-list-pointer">
                <div className="template-list__head flex items-center justify-between">
                  <div
                    onClick={() => setIsMyTemplatesOpen(!isMyTemplatesOpen)}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <div className={`transition-transform duration-200 ${isMyTemplatesOpen ? 'rotate-90' : ''}`}>
                      <svg className="w-5 h-5 text-[#5B6370]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-[#171B24]">
                      My templates
                    </div>
                  </div>

                  {/* + CREATE TEMPLATE button (Matching screenshot) */}
                  <button
                    onClick={() => setIsCreateTemplateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#10B981] font-bold text-xs rounded-[6px] border border-[#10B981] transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    <span>+</span>
                    <span>CREATE TEMPLATE</span>
                  </button>
                </div>

                {isMyTemplatesOpen && (
                  <div className="pt-4 border-t border-[#F0F2F5] mt-3 text-center py-6 text-xs text-[#5B6370]">
                    No custom templates created yet. Click <b>&quot;+ CREATE TEMPLATE&quot;</b> above to save your first custom report format.
                  </div>
                )}
              </div>
            </div>

            {/* ===================== BLUE COMBINED NOTIFICATION ===================== */}
            {showInfoNotification && (
              <div className="se-page__row animate-in fade-in duration-200">
                <div className="bg-[#F0F7FF] border border-[#B8D7FF] rounded-[10px] p-3.5 relative">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 text-[#1976D2]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                    </div>

                    <div className="flex-1 text-xs text-[#1E3A8A] leading-relaxed pr-6">
                      We combined manual and scheduled reports into a single report. You can configure its sending schedule, download it immediately, or select both options in the report’s settings. When you download the report, you can be confident that it contains up-to-date information. Below, you will find all your reports, which were previously separated into two tabs. These reports can be filtered based on whether or not they have a sending schedule.
                    </div>

                    <button
                      onClick={() => setShowInfoNotification(false)}
                      className="absolute top-3 right-3 text-[#1976D2] hover:text-[#0D47A1] p-1 cursor-pointer"
                      title="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== WARNING NOTIFICATION ===================== */}
            {showWarningNotification && (
              <div className="se-page__row animate-in fade-in duration-200">
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] p-3.5 relative">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 text-[#D97706]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                    </div>

                    <div className="flex-1 text-xs text-[#92400E] leading-relaxed pr-6">
                      We&apos;ve updated our Traffic Forecast algorithm, which might affect your scheduled reports with traffic data. Please ensure that you take into account possible deviations from previous values.{' '}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://help.seranking.com/hc/en-us/articles/16332595832604-Overview-section#:~:text=lists%2C%20tables%2C%20etc.-,New%20Update%3A,-With%20the%20latest"
                        className="font-bold underline hover:text-[#B45309]"
                      >
                        Learn more
                      </a>
                    </div>

                    <button
                      onClick={() => setShowWarningNotification(false)}
                      className="absolute top-3 right-3 text-[#D97706] hover:text-[#78350F] p-1 cursor-pointer"
                      title="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== REPORTS TABLE TILE ===================== */}
            <div className="bg-white border border-[#E1E6EB] rounded-[12px] shadow-xs overflow-hidden">
              
              {/* Header Controls */}
              <div className="p-4 border-b border-[#F0F2F5]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    
                    {/* Switch Bar: My Reports vs Shared Reports */}
                    <div className="flex items-center bg-[#F2F5F8] p-1 rounded-[8px] border border-[#E1E6EB]">
                      <button
                        onClick={() => setFilterType('my')}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          filterType === 'my'
                            ? 'bg-white text-[#171B24] shadow-xs'
                            : 'text-[#5B6370] hover:text-[#171B24]'
                        }`}
                      >
                        <span>My Reports</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E8DAEF] text-[#56565B]">
                          {reports.length}
                        </span>
                      </button>
                      <button
                        onClick={() => setFilterType('shared')}
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          filterType === 'shared'
                            ? 'bg-white text-[#171B24] shadow-xs'
                            : 'text-[#5B6370] hover:text-[#171B24]'
                        }`}
                      >
                        <span>Shared Reports</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#EFEFF4] text-[#56565B]">
                          0
                        </span>
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-[#E1E6EB] rounded-[8px] text-xs text-[#171B24] placeholder-[#7A8391] focus:outline-hidden focus:ring-1 focus:ring-[#2870ED]"
                      />
                      <svg className="w-4 h-4 text-[#7A8391] absolute left-3 top-2.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </div>

                    {/* Modes Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsModesDropdownOpen(!isModesDropdownOpen)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E1E6EB] hover:bg-[#F8FAFC] text-xs font-medium text-[#171B24] rounded-[8px] transition-colors cursor-pointer select-none"
                      >
                        <span>{scheduleFilter}</span>
                        <svg className={`w-3.5 h-3.5 transition-transform ${isModesDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        </svg>
                      </button>

                      {isModesDropdownOpen && (
                        <div className="absolute left-0 mt-1 w-44 bg-white border border-[#E1E6EB] rounded-[8px] shadow-lg py-1 z-20 text-xs">
                          {(['All reports', 'Without schedule', 'With schedule'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setScheduleFilter(mode);
                                setIsModesDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-[#F2F5F8] cursor-pointer flex items-center justify-between ${
                                scheduleFilter === mode ? 'font-bold text-[#2870ED]' : 'text-[#171B24]'
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
                </div>
              </div>

              {/* Table Rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#E1E6EB] bg-[#F8FAFC] text-[#5B6370] font-semibold">
                      <th className="py-3 px-4" style={{ width: '360px' }}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={reports.length > 0 && selectedIds.length === reports.length}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 text-[#2870ED] focus:ring-[#2870ED] cursor-pointer"
                          />
                          <span>Report title</span>
                        </div>
                      </th>
                      <th className="py-3 px-4" style={{ width: '170px' }}>
                        <div className="flex items-center gap-1 cursor-pointer">
                          <span>Updated</span>
                          <svg className="w-3.5 h-3.5 text-[#2870ED]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                          </svg>
                        </div>
                      </th>
                      <th className="py-3 px-4" style={{ width: '170px' }}>Sent</th>
                      <th className="py-3 px-4" style={{ width: '320px' }}>Frequency</th>
                      <th className="py-3 px-4" style={{ width: '100px' }}>Language</th>
                      <th className="py-3 px-4">Report period</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((row) => {
                      const isSelected = selectedIds.includes(row.id);
                      const isHovered = hoveredRowId === row.id;

                      return (
                        <tr
                          key={row.id}
                          onMouseEnter={() => setHoveredRowId(row.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          className={`border-b border-[#F0F2F5] transition-colors ${
                            isSelected ? 'bg-blue-50/50' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOne(row.id)}
                                  className="rounded border-gray-300 text-[#2870ED] focus:ring-[#2870ED] cursor-pointer"
                                />
                                <div className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                                  PDF
                                </div>
                                <span className="font-semibold text-[#171B24] hover:text-[#2870ED] cursor-pointer transition-colors">
                                  {row.title}
                                </span>
                              </div>

                              <div className={`flex items-center gap-1.5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                <button
                                  onClick={() => alert(`Edit: ${row.title}`)}
                                  title="Edit report"
                                  className="p-1 text-[#5B6370] hover:text-[#171B24] hover:bg-gray-100 rounded cursor-pointer"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => alert(`Downloading PDF: ${row.title}`)}
                                  title="Download"
                                  className="p-1 text-[#5B6370] hover:text-[#171B24] hover:bg-gray-100 rounded cursor-pointer"
                                >
                                  ⬇
                                </button>
                                <button
                                  onClick={() => handleDeleteReport(row.id)}
                                  title="Delete report"
                                  className="p-1 text-[#5B6370] hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-[#5B6370]">{row.updated}</td>
                          <td className="py-3 px-4 text-[#5B6370]">{row.sent}</td>
                          <td className="py-3 px-4 text-[#171B24] font-medium">{row.frequency}</td>
                          <td className="py-3 px-4 text-[#5B6370]">{row.language}</td>
                          <td className="py-3 px-4 text-[#5B6370]">{row.period}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#F0F2F5] flex items-center justify-between text-xs text-[#5B6370]">
                <div>Showing {filteredReports.length} of {reports.length} reports</div>
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <div className="relative">
                    <button
                      onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                      className="px-2.5 py-1 bg-white border border-[#E1E6EB] rounded-[6px] text-xs font-semibold text-[#171B24] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{rowsPerPage}</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                      </svg>
                    </button>

                    {isRowsDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-1 w-20 bg-white border border-[#E1E6EB] rounded-[6px] shadow-md py-1 z-20 text-xs">
                        {['20', '50', '100'].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              setRowsPerPage(val);
                              setIsRowsDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-[#F2F5F8] cursor-pointer"
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

          </div>
        </div>
      </div>

      {/* Footer Utility bar */}
      <div className="border-t border-[#E1E6EB] bg-white px-6 py-3 text-xs text-[#7A8391] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-[#323842]">
          <div className="w-4 h-4 rounded bg-[#10B981] flex items-center justify-center text-white text-[9px] font-black">
            RB
          </div>
          <span>SE Ranking Report Builder</span>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="hover:text-[#2870ED] transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <Link href="/api-docs" className="hover:text-[#2870ED] transition-colors">
            API
          </Link>
          <Link href="/pricing" className="hover:text-[#2870ED] transition-colors">
            Pricing
          </Link>
        </div>
      </div>

      {/* ===================== MODAL: CREATE REPORT ===================== */}
      {isCreateReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsCreateReportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">Create Report</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="Every week, on: Wednesday">Every week, on: Wednesday</option>
                    <option value="Every Monday morning">Every Monday morning</option>
                    <option value="Monthly, on the 1st">Monthly, on the 1st</option>
                    <option value="Without schedule">Without schedule</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE TEMPLATE ===================== */}
      {isCreateTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsCreateTemplateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">Create Custom Template</h3>
              <p className="text-xs text-[#5B6370]">Save section presets, custom charts, and white-label branding.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Client Monthly Pack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreateTemplateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsCreateTemplateModalOpen(false);
                    alert('Template saved to "My Templates"!');
                  }}
                  className="px-5 py-2 bg-[#10B981] text-white text-xs font-bold rounded-lg"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: FEEDBACK ===================== */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>
            {feedbackSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg">
                  ✓
                </div>
                <h4 className="font-bold text-[#171B24]">Thank you!</h4>
                <p className="text-xs text-[#5B6370]">Your feedback was sent to the Report Builder team.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">Send Feedback</h3>
                <textarea
                  rows={4}
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  placeholder="Tell us what you think about Report Builder..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!feedbackMsg.trim()) return;
                      setFeedbackSent(true);
                      setTimeout(() => {
                        setFeedbackSent(false);
                        setFeedbackMsg('');
                        setIsFeedbackOpen(false);
                      }, 1200);
                    }}
                    className="px-5 py-2 bg-[#10B981] text-white text-xs font-bold rounded-lg"
                  >
                    Send
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
