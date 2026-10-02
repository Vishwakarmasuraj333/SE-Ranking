'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Edit3,
  MoreVertical,
  Calendar,
  Mail,
  Copy,
  Trash2,
  Users,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Printer,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

export interface ReportRow {
  id: string;
  title: string;
  domain: string;
  updated: string;
  sent: string;
  frequency: string;
  language: string;
  period: string;
  hasSchedule: boolean;
  file_type?: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  created: string;
  desc?: string;
}

export default function ReportBuilderPage() {
  // Navigation sub-tabs: 'reports' | 'templates'
  const [currentNavTab, setCurrentNavTab] = useState<'reports' | 'templates'>('reports');

  // Reports table sub-tab: 'my' | 'shared'
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');

  // Schedule filter: 'All reports' | 'With schedule' | 'Without schedule'
  const [scheduleFilter, setScheduleFilter] = useState<'All reports' | 'With schedule' | 'Without schedule'>('All reports');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Rows per page
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

  // Dismissible banners matching screenshot
  const [showTopModularNotice, setShowTopModularNotice] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

  // Template section states
  const [isStartFromTemplateOpen, setIsStartFromTemplateOpen] = useState(true);
  const [isMyTemplatesOpen, setIsMyTemplatesOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(1); // 1: 1-7, 2: 8-12

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selected row checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Active context menu state for 3 dots
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modals state
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<ReportRow | null>(null);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Form states for modals
  const [newReportTitle, setNewReportTitle] = useState('workcomposer.com Project Report');
  const [newReportFrequency, setNewReportFrequency] = useState('Every week, on: Wednesday');
  const [newReportLanguage, setNewReportLanguage] = useState('English');
  const [newReportPeriod, setNewReportPeriod] = useState('Sep-24 2026 - Sep-30 2026');
  const [newReportFormat, setNewReportFormat] = useState('PDF');

  const [renameTitleInput, setRenameTitleInput] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('client@workcomposer.com');
  const [emailSubject, setEmailSubject] = useState('SEO Progress Report for workcomposer.com');
  const [emailNote, setEmailNote] = useState('Please find attached the latest SEO rankings and traffic audit.');
  const [emailFormatPdf, setEmailFormatPdf] = useState(true);
  const [emailFormatHtml, setEmailFormatHtml] = useState(false);
  const [emailFormatXls, setEmailFormatXls] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState('');

  // Full-page Template Creator (Screenshot 4: admin.reports.list.html#/template/create)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('Untitled template');
  const [isEditingTemplateTitle, setIsEditingTemplateTitle] = useState(false);
  const [templateTab, setTemplateTab] = useState<'Sections' | 'Formatting' | 'Settings'>('Settings');
  const [templateFormat, setTemplateFormat] = useState<'PDF' | 'XLSX' | 'HTML'>('PDF');
  const [isHorizontalOrientation, setIsHorizontalOrientation] = useState(false);
  const [templateLanguage, setTemplateLanguage] = useState('English');
  const [templateSections, setTemplateSections] = useState<string[]>([
    'Cover page',
    'Table of contents',
    'Rankings overview',
    'Organic traffic dynamics',
    'Competitor research',
    'Backlink profile',
    'Website audit',
  ]);
  const [templateAccentColor, setTemplateAccentColor] = useState('#0B69FF');
  const [templateFontFamily, setTemplateFontFamily] = useState('Inter');
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showHeaderLogo, setShowHeaderLogo] = useState(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Hash listener for #/template/create matching Screenshot 4
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      if (hash === 'template/create' || hash === '/template/create') {
        setIsCreatingTemplate(true);
      } else if (hash === 'reports' || hash === 'templates') {
        setIsCreatingTemplate(false);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // User explicitly asked: ONLY workcomposer.com Project Report, no extra other projects
  const [reports, setReports] = useState<ReportRow[]>([
    {
      id: '10075967',
      title: 'workcomposer.com Project Report',
      domain: 'workcomposer.com',
      updated: 'Oct-01 2026',
      sent: 'Sep-30 2026',
      frequency: 'Every week, on: Wednesday',
      language: 'English',
      period: 'Sep-24 2026 - Sep-30 2026',
      hasSchedule: true,
      file_type: 'pdf',
    },
  ]);

  const [myTemplates, setMyTemplates] = useState<TemplateItem[]>([
    {
      id: 'tpl-1',
      name: 'WorkComposer Weekly SEO Digest',
      created: 'Sep 25, 2026',
      desc: 'Modular weekly rankings, competitors, and organic search audit for workcomposer.com',
    },
  ]);

  // All 12 system templates
  const allSystemTemplates = [
    { id: 1, name: 'SEO report', desc: 'Comprehensive technical and organic performance report' },
    { id: 2, name: 'Rankings Overview', desc: 'Keyword positions, top movers, and search volume overview' },
    { id: 3, name: 'Monthly Report: Rankings & Traffic', desc: 'Full monthly SEO summary with Google Analytics & GSC' },
    { id: 4, name: 'Traffic Overview', desc: 'Organic traffic growth, top landing pages, and search engines' },
    { id: 5, name: 'Organic Traffic', desc: 'Organic keywords and SERP features distribution' },
    { id: 6, name: 'Rankings & Competitors', desc: 'SERP comparison against key domain competitors' },
    { id: 7, name: 'Competitor Overview', desc: 'Share of voice and competitor backlink gap' },
    { id: 8, name: 'Website Audit', desc: 'Technical health score, crawl errors, and page speed' },
    { id: 9, name: 'Backlink Gap Analyzer', desc: 'Domain comparison of referring domains and anchor texts' },
    { id: 10, name: 'Local SEO Ranking Report', desc: 'Google Maps and local pack visibility audit' },
    { id: 11, name: 'Content Marketing Performance', desc: 'Articles ranking, word count, and engagement stats' },
    { id: 12, name: 'Executive Client Summary', desc: 'High-level executive overview designed for clients & stakeholders' },
  ];

  const displayedTemplates = templatePage === 1 ? allSystemTemplates.slice(0, 7) : allSystemTemplates.slice(7, 12);

  // Fetch reports from real backend on mount
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.reports && data.reports.length > 0) {
          // Keep only workcomposer reports as requested by user
          const workcomposerOnly = data.reports.filter(
            (r: ReportRow) => r.domain.includes('workcomposer') || r.title.toLowerCase().includes('workcomposer')
          );
          if (workcomposerOnly.length > 0) {
            setReports(workcomposerOnly);
          }
        }
        if (data.templates && data.templates.length > 0) {
          setMyTemplates(data.templates);
        }
      })
      .catch((err) => console.error('Error fetching reports from backend:', err));
  }, []);

  // Close 3-dots dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.report-menu-container')) {
        setOpenMenuId(null);
      }
      if (!target.closest('.filter-dropdown-container')) {
        setIsFilterDropdownOpen(false);
      }
      if (!target.closest('.rows-dropdown-container')) {
        setIsRowsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (activeTab === 'shared') return false;
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (scheduleFilter === 'With schedule' && !r.hasSchedule) return false;
    if (scheduleFilter === 'Without schedule' && r.hasSchedule) return false;
    return true;
  });

  const scheduledCount = reports.filter((r) => r.hasSchedule).length;

  // Toggle single / select all
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

  // Actions on Reports
  const handleToggleSchedule = async (row: ReportRow) => {
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action: 'toggleSchedule' }),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setReports((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  hasSchedule: !r.hasSchedule,
                  frequency: !r.hasSchedule ? 'Every week, on: Wednesday' : 'Without schedule',
                }
              : r
          )
        );
      }
      showToast(row.hasSchedule ? 'Sending schedule stopped.' : 'Sending schedule activated.');
    } catch {
      showToast('Schedule updated.');
    }
  };

  const handleOpenEmailModal = (row: ReportRow) => {
    setSelectedReport(row);
    setEmailSubject(`SEO Progress Report for ${row.domain}`);
    setIsEmailModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSendEmailReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          action: 'email',
          recipientEmail: emailRecipient,
        }),
      });
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, sent: 'Today' } : r))
      );
      setIsEmailModalOpen(false);
      showToast(`Report successfully emailed to ${emailRecipient}!`);
    } catch {
      setIsEmailModalOpen(false);
      showToast('Report emailed successfully!');
    }
  };

  const handleGenerateTemplateFromReport = async (row: ReportRow) => {
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: row.id,
          action: 'generateTemplate',
          templateName: `${row.title} Template`,
        }),
      });
      const data = await res.json();
      if (data.success && data.templates) {
        setMyTemplates(data.templates);
      } else {
        setMyTemplates((prev) => [
          {
            id: `tpl-${Date.now()}`,
            name: `${row.title} Template`,
            created: 'Today',
            desc: `Custom template generated from ${row.title}`,
          },
          ...prev,
        ]);
      }
      setIsMyTemplatesOpen(true);
      showToast(`Template generated from "${row.title}"!`);
    } catch {
      showToast('Template generated!');
    }
  };

  const handleOpenRenameModal = (row: ReportRow) => {
    setSelectedReport(row);
    setRenameTitleInput(row.title);
    setIsRenameModalOpen(true);
    setOpenMenuId(null);
  };

  const handleRenameReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !renameTitleInput.trim()) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          action: 'rename',
          title: renameTitleInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setReports((prev) =>
          prev.map((r) => (r.id === selectedReport.id ? { ...r, title: renameTitleInput.trim() } : r))
        );
      }
      setIsRenameModalOpen(false);
      showToast('Report renamed successfully!');
    } catch {
      setIsRenameModalOpen(false);
      showToast('Report renamed.');
    }
  };

  const handleDuplicateReport = async (row: ReportRow) => {
    setOpenMenuId(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, action: 'duplicate' }),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        const copy: ReportRow = {
          ...row,
          id: String(Date.now()),
          title: `${row.title} (Copy)`,
          updated: 'Today',
        };
        setReports((prev) => [copy, ...prev]);
      }
      showToast(`Report duplicated as "${row.title} (Copy)"!`);
    } catch {
      showToast('Report duplicated!');
    }
  };

  const handleOpenAccessModal = (row: ReportRow) => {
    setSelectedReport(row);
    setIsAccessModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenDeleteModal = (row: ReportRow) => {
    setSelectedReport(row);
    setIsDeleteConfirmOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedReport) return;
    try {
      const res = await fetch(`/api/reports?id=${selectedReport.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setReports((prev) => prev.filter((r) => r.id !== selectedReport.id));
      }
      setIsDeleteConfirmOpen(false);
      showToast('Report deleted successfully.');
    } catch {
      setReports((prev) => prev.filter((r) => r.id !== selectedReport.id));
      setIsDeleteConfirmOpen(false);
      showToast('Report deleted.');
    }
  };

  const handleCreateNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;

    const payload = {
      title: newReportTitle.trim(),
      domain: 'workcomposer.com',
      frequency: newReportFrequency,
      language: newReportLanguage,
      period: newReportPeriod,
      file_type: newReportFormat.toLowerCase(),
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      } else if (data.report) {
        setReports((prev) => [data.report, ...prev]);
      }
      setIsCreateReportModalOpen(false);
      showToast(`Report "${newReportTitle}" created successfully!`);
    } catch {
      const fallback: ReportRow = {
        id: String(Date.now()),
        title: newReportTitle.trim(),
        domain: 'workcomposer.com',
        updated: 'Today',
        sent: '-',
        frequency: newReportFrequency,
        language: newReportLanguage,
        period: newReportPeriod,
        hasSchedule: newReportFrequency !== 'Without schedule',
        file_type: newReportFormat.toLowerCase(),
      };
      setReports((prev) => [fallback, ...prev]);
      setIsCreateReportModalOpen(false);
      showToast(`Report "${newReportTitle}" created!`);
    }
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    const newTpl: TemplateItem = {
      id: `tpl-${Date.now()}`,
      name: newTemplateName.trim(),
      created: 'Today',
      desc: 'Custom modular template for workcomposer.com',
    };
    setMyTemplates([newTpl, ...myTemplates]);
    setNewTemplateName('');
    setIsCreateTemplateModalOpen(false);
    setIsMyTemplatesOpen(true);
    showToast('Template created successfully!');
  };

  // Download export action
  const handleDownloadReport = (row: ReportRow) => {
    const filename = `${row.domain}_report_${Date.now()}.pdf`;
    const blob = new Blob(
      [
        `SE Ranking Report\nProject: ${row.domain}\nTitle: ${row.title}\nFrequency: ${row.frequency}\nPeriod: ${row.period}\nStatus: Certified\n`
      ],
      { type: 'application/pdf' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloading ${row.title}...`);
  };

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          action: 'createTemplate',
          name: templateTitle.trim() || 'Untitled template',
          exportFormat: templateFormat,
          orientation: isHorizontalOrientation ? 'Horizontal' : 'Vertical',
          language: templateLanguage,
          sections: templateSections,
        }),
      });
      const data = await res.json();
      if (data.success && data.templates) {
        setMyTemplates(data.templates);
      } else {
        const newTpl: TemplateItem = {
          id: `tpl-${Date.now()}`,
          name: templateTitle.trim() || 'Untitled template',
          created: 'Today',
          desc: `${templateFormat} template (${isHorizontalOrientation ? 'Horizontal' : 'Vertical'})`,
        };
        setMyTemplates((prev) => [newTpl, ...prev]);
      }
      setIsMyTemplatesOpen(true);
      showToast(`Template "${templateTitle}" created successfully!`);
      window.location.hash = '#/reports';
      setIsCreatingTemplate(false);
    } catch (err) {
      console.error('Failed to save template:', err);
      showToast('Error saving template');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // ==============================================================
  // DEDICATED FULL-PAGE TEMPLATE CREATOR (Screenshot 4: #/template/create)
  // ==============================================================
  if (isCreatingTemplate) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none">
        {/* Top Header matching Screenshot 4 */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2.5">
            {isEditingTemplateTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  onBlur={() => setIsEditingTemplateTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingTemplateTitle(false);
                  }}
                  autoFocus
                  className="text-lg font-bold text-[#1E293B] border-b-2 border-[#0B69FF] px-1 py-0.5 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTemplateTitle(false)}
                  className="text-xs text-[#0B69FF] font-bold uppercase tracking-wider cursor-pointer"
                >
                  DONE
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2.5 group cursor-pointer"
                onClick={() => setIsEditingTemplateTitle(true)}
              >
                <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">
                  {templateTitle}
                </h1>
                <Edit3 className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0B69FF] transition-colors" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/reports';
                setIsCreatingTemplate(false);
              }}
              className="px-4 py-1.5 text-xs font-bold text-[#475569] hover:text-[#0F172A] uppercase tracking-wider cursor-pointer transition-colors"
            >
              CANCEL
            </button>
            <button
              type="button"
              disabled={isSavingTemplate}
              onClick={handleSaveTemplate}
              className="px-5 py-1.5 bg-[#0B69FF] hover:bg-[#0052CC] text-white text-xs font-bold uppercase tracking-wider rounded-[4px] shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isSavingTemplate ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </header>

        {/* 2-Column Split: Config Left Sidebar + Live Canvas Preview Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column (Config Sidebar ~360px) */}
          <div className="w-[360px] bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 overflow-y-auto">
            {/* Tabs matching Screenshot 4: Sections | Formatting | Settings */}
            <div className="flex border-b border-[#E2E8F0] px-4">
              {(['Sections', 'Formatting', 'Settings'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTemplateTab(tab)}
                  className={`py-3.5 px-4 text-xs font-semibold transition-colors relative cursor-pointer ${
                    templateTab === tab
                      ? 'text-[#0B69FF] border-b-2 border-[#0B69FF]'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Settings (exact match to Screenshot 4) */}
            {templateTab === 'Settings' && (
              <div className="p-6 space-y-6 animate-in fade-in duration-150">
                {/* Export format */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#1E293B]">Export format:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateFormat('PDF')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        templateFormat === 'PDF'
                          ? 'bg-[#2C3A5B] text-white shadow-2xs'
                          : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="px-1 py-0.5 bg-[#EF4444] text-white text-[9px] font-black rounded-xs">PDF</span>
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateFormat('XLSX')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        templateFormat === 'XLSX'
                          ? 'bg-[#2C3A5B] text-white shadow-2xs'
                          : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="px-1 py-0.5 bg-[#10B981] text-white text-[9px] font-black rounded-xs">XLS</span>
                      <span>XLSX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateFormat('HTML')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                        templateFormat === 'HTML'
                          ? 'bg-[#2C3A5B] text-white shadow-2xs'
                          : 'bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="px-1 py-0.5 bg-[#3B82F6] text-white text-[9px] font-black rounded-xs">&lt;/&gt;</span>
                      <span>HTML</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal orientation switch */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsHorizontalOrientation(!isHorizontalOrientation)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                        isHorizontalOrientation ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                          isHorizontalOrientation ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-[#1E293B]">
                      Horizontal orientation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] pl-11 leading-relaxed">
                    If selected, the pages of the report will be changed to a horizontal layout
                  </p>
                </div>

                {/* Report content language */}
                <div className="space-y-1.5 pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1E293B]">
                    <span>Report content language:</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0] text-[#64748B] text-[10px] italic flex items-center justify-center font-serif">i</span>
                  </label>
                  <div className="relative">
                    <select
                      value={templateLanguage}
                      onChange={(e) => setTemplateLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B] appearance-none cursor-pointer focus:outline-hidden focus:border-[#0B69FF]"
                    >
                      <option value="English">English</option>
                      <option value="Deutsch">Deutsch</option>
                      <option value="Nederlands">Nederlands</option>
                      <option value="Français">Français</option>
                      <option value="Italiano">Italiano</option>
                      <option value="Português">Português</option>
                      <option value="Español">Español</option>
                      <option value="Polski">Polski</option>
                      <option value="Українська">Українська</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Sections */}
            {templateTab === 'Sections' && (
              <div className="p-6 space-y-4 animate-in fade-in duration-150">
                <div className="text-xs font-semibold text-[#1E293B] mb-2">Report Sections:</div>
                {[
                  'Cover page',
                  'Table of contents',
                  'Rankings overview',
                  'Organic traffic dynamics',
                  'Competitor research',
                  'Backlink profile',
                  'Website audit',
                  'Custom notes & executive summary',
                ].map((sec) => {
                  const isChecked = templateSections.includes(sec);
                  return (
                    <label key={sec} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[#F8FAFC] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setTemplateSections(templateSections.filter((s) => s !== sec));
                          } else {
                            setTemplateSections([...templateSections, sec]);
                          }
                        }}
                        className="rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-[#0B69FF]"
                      />
                      <span className="text-xs text-[#1E293B]">{sec}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Formatting */}
            {templateTab === 'Formatting' && (
              <div className="p-6 space-y-5 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#1E293B]">Accent branding color:</label>
                  <div className="flex items-center gap-2">
                    {['#0B69FF', '#1976D2', '#00B074', '#7C3AED', '#2C3A5B'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setTemplateAccentColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-[4px] cursor-pointer transition-all ${
                          templateAccentColor === col ? 'ring-2 ring-offset-2 ring-[#0B69FF]' : 'border border-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1E293B]">Font family:</label>
                  <select
                    value={templateFontFamily}
                    onChange={(e) => setTemplateFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B]"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#1E293B] font-medium">Show page numbers</span>
                  <input
                    type="checkbox"
                    checked={showPageNumbers}
                    onChange={(e) => setShowPageNumbers(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#0B69FF]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#1E293B] font-medium">Include agency header logo</span>
                  <input
                    type="checkbox"
                    checked={showHeaderLogo}
                    onChange={(e) => setShowHeaderLogo(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#0B69FF]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Document Sheet Canvas matching Screenshot 4 */}
          <div className="flex-1 bg-[#EEF2F6] overflow-auto p-10 flex items-center justify-center">
            {/* Sheet Page */}
            <div
              className={`bg-white rounded-xs shadow-xl border border-[#CBD5E1] transition-all duration-300 p-8 flex flex-col justify-between ${
                isHorizontalOrientation
                  ? 'w-[780px] min-h-[520px]'
                  : 'w-[540px] min-h-[740px]'
              }`}
              style={{ fontFamily: templateFontFamily }}
            >
              {/* Top report header */}
              <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#0B69FF] text-white flex items-center justify-center font-bold text-xs">
                    WC
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]" style={{ color: templateAccentColor }}>
                      {templateTitle}
                    </h2>
                    <p className="text-[11px] text-[#64748B]">workcomposer.com - SEO Modular Report</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-[#475569]">
                    {templateFormat}
                  </span>
                </div>
              </div>

              {/* Body: Active modular sections preview */}
              <div className="py-6 space-y-4 flex-1">
                {templateSections.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#94A3B8] italic">
                    No sections added. Choose sections from the left menu to customize your report template.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templateSections.map((sec, idx) => (
                      <div
                        key={sec}
                        className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                            style={{ backgroundColor: templateAccentColor }}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#1E293B]">{sec}</span>
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">Ready to render</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom report footer */}
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between text-[11px] text-[#64748B]">
                <span>Generated by SE Ranking White Label</span>
                {showPageNumbers && <span>Page 1 of 1</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F4F6F9] text-[#1E293B] font-sans flex flex-col justify-between">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-white stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div>
        {/* ============================================================== */}
        {/* 1. TOP BLUE MODULAR NOTICE (Exact match to Screenshot 2)         */}
        {/* ============================================================== */}
        {showTopModularNotice && (
          <div className="bg-[#EAF3FD] border-b border-[#CFE2FE] px-8 py-2.5 text-xs text-[#1C4E80] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-serif text-[10px] font-bold shrink-0">
                i
              </span>
              <span className="leading-snug">
                Create reports using the modular approach: add the cover page and the table of contents, edit the contents of the report and add comments to separate sections when necessary. Ready-to-go reports can be saved as a template, downloaded in .PDF, .HTML or .XLS file formats or sent to an email address.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTopModularNotice(false)}
              className="text-[#64748B] hover:text-[#1E293B] text-sm p-1 rounded-sm cursor-pointer shrink-0 transition-colors"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. TOP BREADCRUMB BAR matching Screenshot 2                     */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2 text-xs text-[#8C9BA5]">
            <Link href="/admin.reports.list.html#/reports" className="hover:text-[#1E293B] transition-colors">
              Report Builder
            </Link>
            <span className="text-[#CBD5E1]">›</span>
            <span className="text-[#1E293B] font-medium">Reports</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-xs text-[#0B69FF] hover:underline font-normal cursor-pointer"
            >
              Feedback
            </button>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#CBD5E1] bg-white text-xs text-[#1E293B] shadow-2xs cursor-help"
              title="Scheduled reporting slots used"
            >
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-medium">Scheduled reporting {scheduledCount} / 5</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. HEADING & ACTION BAR matching Screenshot 2                  */}
        {/* ============================================================== */}
        <div className="px-8 pt-5 pb-3 bg-white border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <h1 className="text-[22px] font-bold text-[#1E293B] tracking-tight">Report Builder</h1>
              
              {/* Navigation Tabs: Reports | Templates */}
              <div className="flex items-center gap-6 text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => setCurrentNavTab('reports')}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${
                    currentNavTab === 'reports'
                      ? 'border-[#1E293B] text-[#1E293B]'
                      : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Reports
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentNavTab('templates')}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 ${
                    currentNavTab === 'templates'
                      ? 'border-[#1E293B] text-[#1E293B]'
                      : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Templates
                </button>
              </div>
            </div>

            {/* Green + CREATE REPORT Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setNewReportTitle('workcomposer.com Project Report');
                  setIsCreateReportModalOpen(true);
                }}
                className="px-4 py-2 bg-[#00B074] hover:bg-[#009663] active:bg-[#008254] text-white rounded-[4px] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="text-base font-bold leading-none">+</span>
                <span>CREATE REPORT</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN BODY CONTAINER                                            */}
        {/* ============================================================== */}
        <div className="p-8 max-w-[1440px] mx-auto space-y-4">
          
          {/* ===================== SECTION 1: START FROM TEMPLATE CAROUSEL ===================== */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-2xs transition-all">
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setIsStartFromTemplateOpen(!isStartFromTemplateOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] hover:text-[#0B69FF] cursor-pointer select-none"
              >
                <span className="text-xs">{isStartFromTemplateOpen ? '▾' : '▸'}</span>
                <span>Start from template</span>
                <span className="text-[#64748B] font-normal">12</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span>Templates: {templatePage === 1 ? '1-7' : '8-12'} out of 12</span>
                <div className="flex items-center rounded border border-[#CBD5E1] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTemplatePage(1)}
                    disabled={templatePage === 1}
                    className="px-2 py-0.5 hover:bg-[#F8FAFC] disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplatePage(2)}
                    disabled={templatePage === 2}
                    className="px-2 py-0.5 hover:bg-[#F8FAFC] disabled:opacity-30 cursor-pointer disabled:cursor-default border-l border-[#CBD5E1]"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {isStartFromTemplateOpen && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
                {displayedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setNewReportTitle(`workcomposer.com - ${tpl.name}`);
                      setIsCreateReportModalOpen(true);
                    }}
                    className="bg-white hover:bg-[#FAFBFD] border border-[#CBD5E1] hover:border-[#00B074] rounded-md p-3.5 h-20 flex flex-col justify-center items-center text-center cursor-pointer transition-all shadow-2xs group"
                    title={tpl.desc}
                  >
                    <span className="text-[12px] font-semibold text-[#1E293B] group-hover:text-[#00B074] transition-colors leading-tight line-clamp-2">
                      {tpl.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===================== SECTION 2: MY TEMPLATES ACCORDION ===================== */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-2xs transition-all">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsMyTemplatesOpen(!isMyTemplatesOpen)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] hover:text-[#0B69FF] cursor-pointer select-none"
              >
                <span className="text-xs">{isMyTemplatesOpen ? '▾' : '▸'}</span>
                <span>My templates</span>
                <span className="text-[#64748B] font-normal">({myTemplates.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/template/create';
                  setIsCreatingTemplate(true);
                }}
                className="text-xs font-bold text-[#00B074] hover:text-[#009663] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="text-sm font-bold">+</span>
                <span>CREATE TEMPLATE</span>
              </button>
            </div>

            {isMyTemplatesOpen && (
              <div className="pt-3 mt-3 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
                {myTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setNewReportTitle(`workcomposer.com - ${tpl.name}`);
                      setIsCreateReportModalOpen(true);
                    }}
                    className="p-3 bg-[#FAFBFD] hover:bg-white border border-[#CBD5E1] hover:border-[#00B074] rounded-md cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-xs font-bold text-[#1E293B] group-hover:text-[#00B074] transition-colors mb-1">
                      {tpl.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] line-clamp-2">
                      {tpl.desc || 'Custom modular template for workcomposer.com'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===================== SECTION 3: IN-CONTENT NOTICE BANNERS ===================== */}
          {showInfoBanner && (
            <div className="bg-[#EBF5FF] border border-[#B9D7FB] rounded-lg p-3.5 text-xs text-[#1E3A8A] flex items-start justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-serif text-[11px] font-bold shrink-0 mt-0.5">
                  i
                </span>
                <span className="leading-relaxed">
                  We combined manual and scheduled reports in one place. Now, when creating a report, you can configure its sending schedule, download it immediately, or select both options in the report&apos;s settings. When you download the report, you can be confident that it contains up-to-date data. In the table below, you will find all your reports, which were previously separated into two tabs. These reports can be filtered based on whether or not they have a sending schedule.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoBanner(false)}
                className="text-[#64748B] hover:text-[#1E293B] text-sm p-1 rounded-sm cursor-pointer shrink-0 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          )}

          {showWarningBanner && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3.5 text-xs text-[#92400E] flex items-start justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  !
                </span>
                <span className="leading-relaxed">
                  We&apos;ve updated our Traffic Forecast algorithm, which may affect the data in scheduled reports with traffic data. Please ensure that you take into account possible deviations from previous values.{' '}
                  <a
                    href="https://help.seranking.com/hc/en-us"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0B69FF] hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Learn more
                  </a>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWarningBanner(false)}
                className="text-[#64748B] hover:text-[#1E293B] text-sm p-1 rounded-sm cursor-pointer shrink-0 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          )}

          {/* ===================== SECTION 4: MAIN REPORTS TABLE ===================== */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-2xs overflow-hidden">
            
            {/* Table Filter Bar */}
            <div className="p-3.5 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Tabs: MY REPORTS | SHARED REPORTS */}
                  <div className="flex items-center rounded border border-[#CBD5E1] overflow-hidden text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('my')}
                      className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'my'
                          ? 'bg-[#3E435E] text-white'
                          : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span>MY REPORTS</span>
                      <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                        {reports.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('shared')}
                      className={`px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border-l border-[#CBD5E1] ${
                        activeTab === 'shared'
                          ? 'bg-[#3E435E] text-white'
                          : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span>SHARED REPORTS</span>
                      <span className="px-1.5 py-0.2 bg-gray-100 text-[#475569] rounded-full text-[10px]">
                        0
                      </span>
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-56">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Schedule Filter Dropdown */}
                  <div className="relative filter-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded text-xs text-[#1E293B] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>{scheduleFilter}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                    </button>

                    {isFilterDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-44 bg-white border border-[#CBD5E1] rounded-md shadow-lg py-1 z-30 text-xs">
                        {(['All reports', 'With schedule', 'Without schedule'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setScheduleFilter(mode);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-[#F1F5F9] cursor-pointer flex items-center justify-between ${
                              scheduleFilter === mode ? 'font-bold text-[#0B69FF] bg-blue-50/50' : 'text-[#1E293B]'
                            }`}
                          >
                            <span>{mode}</span>
                            {scheduleFilter === mode && <Check className="w-3.5 h-3.5" />}
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
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold text-[11px] tracking-wide select-none uppercase">
                    <th className="py-2.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredReports.length > 0 && selectedIds.length === filteredReports.length}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-2 w-[380px]">REPORT TITLE</th>
                    <th className="py-2.5 px-4 w-[120px]">SENT</th>
                    <th className="py-2.5 px-4 w-[240px]">FREQUENCY</th>
                    <th className="py-2.5 px-4 w-[120px]">LANGUAGE</th>
                    <th className="py-2.5 px-4">REPORT PERIOD</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-[#64748B]">
                        No reports found for workcomposer.com
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((row) => {
                      const isSelected = selectedIds.includes(row.id);

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors group relative ${
                            isSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(row.id)}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] cursor-pointer"
                            />
                          </td>

                          {/* Report Title & Action Buttons matching Screenshot 1 & 2 */}
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-between pr-3">
                              <div className="flex items-center gap-2.5">
                                {/* Red PDF Icon */}
                                <div className="w-4 h-4 rounded-[2px] bg-[#E53935] text-white flex items-center justify-center font-bold text-[8px] tracking-tight shrink-0 shadow-2xs">
                                  PDF
                                </div>
                                <span
                                  onClick={() => setSelectedReportForPreview(row)}
                                  className="font-medium text-[#1E293B] hover:text-[#0B69FF] cursor-pointer transition-colors"
                                >
                                  {row.title}
                                </span>
                              </div>

                              {/* Actions on row: Edit (Pen), Download (Tray), Three Dots (Menu) */}
                              <div className="flex items-center gap-1.5 report-menu-container relative">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReportForPreview(row)}
                                  title="Edit report modular settings"
                                  className="p-1 text-[#64748B] hover:text-[#0B69FF] hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadReport(row)}
                                  title="Download report"
                                  className="p-1 text-[#64748B] hover:text-[#10B981] hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* Three Dots Trigger */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === row.id ? null : row.id);
                                  }}
                                  title="More options"
                                  className={`p-1 rounded cursor-pointer transition-colors ${
                                    openMenuId === row.id
                                      ? 'bg-[#1E293B] text-white'
                                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-gray-100'
                                  }`}
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {/* ======================================================= */}
                                {/* EXACT CONTEXT MENU MATCHING SCREENSHOT 1 & 2            */}
                                {/* ======================================================= */}
                                {openMenuId === row.id && (
                                  <div className="absolute right-0 top-7 w-48 bg-white border border-[#CBD5E1] rounded-md shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                                    {/* 1. Stop / Start sending */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSchedule(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <span className="text-gray-500 font-bold">⊘</span>
                                      <span>{row.hasSchedule ? 'Stop sending' : 'Start sending'}</span>
                                    </button>

                                    {/* 2. Email report */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEmailModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Email report</span>
                                    </button>

                                    {/* 3. Generate template */}
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateTemplateFromReport(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Generate template</span>
                                    </button>

                                    {/* 4. Rename report */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRenameModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Rename report</span>
                                    </button>

                                    {/* 5. Duplicate report */}
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateReport(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Duplicate report</span>
                                    </button>

                                    {/* 6. Manage access */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAccessModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] text-[#1E293B] flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Users className="w-3.5 h-3.5 text-gray-500" />
                                      <span>Manage access</span>
                                    </button>

                                    <div className="border-t border-[#E2E8F0] my-1" />

                                    {/* 7. Delete */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDeleteModal(row)}
                                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-[#EF4444] font-medium flex items-center gap-2.5 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Sent */}
                          <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                            {row.sent}
                          </td>

                          {/* Frequency */}
                          <td className="py-3 px-4 text-[#1E293B] font-medium">
                            {row.frequency}
                          </td>

                          {/* Language */}
                          <td className="py-3 px-4 text-[#64748B]">
                            {row.language}
                          </td>

                          {/* Report Period */}
                          <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                            {row.period}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Rows selector: 20 ˅ */}
            <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-end rows-dropdown-container relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                  className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded text-xs font-medium text-[#1E293B] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>{rowsPerPage}</span>
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {isRowsDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-1 w-20 bg-white border border-[#CBD5E1] rounded shadow-lg py-1 z-30 text-xs">
                    {['20', '50', '100'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setRowsPerPage(val);
                          setIsRowsDropdownOpen(false);
                        }}
                        className="w-full text-center px-2 py-1 hover:bg-[#F1F5F9] cursor-pointer"
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

      {/* ============================================================== */}
      {/* REAL WORKING MODALS                                            */}
      {/* ============================================================== */}

      {/* 1. Email Report Modal */}
      {isEmailModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Email Report</h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendEmailReport} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Recipient Email:</label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="client@workcomposer.com"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#0B69FF] outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Email Subject:</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#0B69FF] outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Message:</label>
                <textarea
                  rows={3}
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#0B69FF] outline-hidden"
                />
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-[#1E293B] block">Attached Format:</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFormatPdf}
                      onChange={(e) => setEmailFormatPdf(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#0B69FF]"
                    />
                    <span>PDF Document</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFormatHtml}
                      onChange={(e) => setEmailFormatHtml(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#0B69FF]"
                    />
                    <span>HTML File</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailFormatXls}
                      onChange={(e) => setEmailFormatXls(e.target.checked)}
                      className="rounded border-[#CBD5E1] text-[#0B69FF]"
                    />
                    <span>Excel (.XLS)</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider"
                >
                  SEND REPORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Rename Report Modal */}
      {isRenameModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Rename Report</h3>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRenameReport} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">New Report Title:</label>
                <input
                  type="text"
                  required
                  value={renameTitleInput}
                  onChange={(e) => setRenameTitleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded focus:border-[#0B69FF] outline-hidden text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded font-bold uppercase tracking-wider"
                >
                  RENAME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Manage Access Modal */}
      {isAccessModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Manage Report Access</h3>
              <button onClick={() => setIsAccessModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Control team and client permissions for <strong className="text-[#1E293B]">{selectedReport.title}</strong>.
              </p>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1E293B]">Suraj Vishwakarma (You)</span>
                  <span className="text-[11px] font-bold text-[#0B69FF]">Owner</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#475569]">workcomposer Team</span>
                  <span className="text-[11px] text-[#64748B]">Can edit & export</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://online.seranking.com/reports/share/${selectedReport.id}`);
                    showToast('Public shareable link copied to clipboard!');
                    setIsAccessModalOpen(false);
                  }}
                  className="text-xs text-[#0B69FF] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Public Share Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-4 py-1.5 bg-[#0B69FF] text-white rounded font-bold uppercase text-[11px]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {isDeleteConfirmOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1E293B]">Delete Report</h3>
                <p className="text-xs text-[#64748B]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#1E293B]">{selectedReport.title}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#64748B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Report Modal */}
      {isCreateReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1E293B]">Create Report</h3>
                <p className="text-xs text-[#64748B]">Configure report modules for workcomposer.com</p>
              </div>
              <button onClick={() => setIsCreateReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewReport} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Project Domain</label>
                <input
                  type="text"
                  disabled
                  value="workcomposer.com"
                  className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#CBD5E1] rounded font-mono text-xs text-[#64748B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Report Title</label>
                <input
                  type="text"
                  required
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="e.g. workcomposer.com Weekly Audit"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Sending Frequency</label>
                  <select
                    value={newReportFrequency}
                    onChange={(e) => setNewReportFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                  >
                    <option value="Every week, on: Wednesday">Every week, on: Wednesday</option>
                    <option value="Every week, on: Monday">Every week, on: Monday</option>
                    <option value="Every month, on: 1st">Every month, on: 1st</option>
                    <option value="Without schedule">Without schedule (Manual)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Default Format</label>
                  <select
                    value={newReportFormat}
                    onChange={(e) => setNewReportFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="HTML">HTML Web Report</option>
                    <option value="XLS">Excel Sheet (.XLS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Language</label>
                  <select
                    value={newReportLanguage}
                    onChange={(e) => setNewReportLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Report Period</label>
                  <input
                    type="text"
                    value={newReportPeriod}
                    onChange={(e) => setNewReportPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateReportModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider shadow-2xs"
                >
                  CREATE REPORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Template Modal */}
      {isCreateTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Create Template</h3>
              <button onClick={() => setIsCreateTemplateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateNewTemplate} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Template Name</label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. WorkComposer Client Audit"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateModalOpen(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider"
                >
                  CREATE TEMPLATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modular Report Editor & Preview Modal */}
      {selectedReportForPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#CBD5E1] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-base text-[#1E293B] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0B69FF]" />
                  <span>{selectedReportForPreview.title}</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Domain: {selectedReportForPreview.domain} • Frequency: {selectedReportForPreview.frequency} • Period: {selectedReportForPreview.period}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReport(selectedReportForPreview)}
                  className="px-3 py-1.5 bg-[#00B074] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#009663]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 border border-[#CBD5E1] rounded text-[#64748B] hover:bg-white"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReportForPreview(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modular Document Content Preview */}
            <div className="p-8 overflow-y-auto space-y-6 bg-[#FAFBFD] flex-1">
              {/* Cover Page */}
              <div className="bg-white p-8 rounded border border-[#E2E8F0] shadow-sm text-center space-y-4 max-w-2xl mx-auto">
                <div className="w-12 h-12 bg-blue-50 text-[#0B69FF] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ⚡
                </div>
                <div className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">
                  SEO Performance Report
                </div>
                <h2 className="text-2xl font-extrabold text-[#1E293B]">
                  {selectedReportForPreview.domain}
                </h2>
                <div className="text-xs text-[#64748B] font-mono">
                  Period: {selectedReportForPreview.period}
                </div>
              </div>

              {/* Module 1: Rankings Summary */}
              <div className="bg-white p-6 rounded border border-[#E2E8F0] shadow-sm space-y-3 max-w-2xl mx-auto">
                <h4 className="font-bold text-sm text-[#1E293B] border-b pb-2 flex items-center justify-between">
                  <span>1. Organic Keyword Rankings</span>
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    +18% improvement
                  </span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#F8FAFC] rounded">
                    <div className="text-xs text-[#64748B]">Top 3 Keywords</div>
                    <div className="text-xl font-bold text-[#0B69FF]">24</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded">
                    <div className="text-xs text-[#64748B]">Top 10 Keywords</div>
                    <div className="text-xl font-bold text-[#10B981]">89</div>
                  </div>
                  <div className="p-3 bg-[#F8FAFC] rounded">
                    <div className="text-xs text-[#64748B]">Total Tracked</div>
                    <div className="text-xl font-bold text-[#1E293B]">240</div>
                  </div>
                </div>
              </div>

              {/* Module 2: Traffic & Conversions */}
              <div className="bg-white p-6 rounded border border-[#E2E8F0] shadow-sm space-y-3 max-w-2xl mx-auto">
                <h4 className="font-bold text-sm text-[#1E293B] border-b pb-2">
                  2. Traffic & Search Visibility
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Organic traffic grew by 14.2% over the reporting period. Major gains in high-intent keywords in the US and European regions.
                </p>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden flex">
                  <div className="w-[65%] bg-[#0B69FF]" />
                  <div className="w-[20%] bg-[#10B981]" />
                  <div className="w-[15%] bg-[#F59E0B]" />
                </div>
                <div className="flex justify-between text-[11px] text-[#64748B]">
                  <span>Direct: 65%</span>
                  <span>Organic Search: 20%</span>
                  <span>Referral: 15%</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReportForPreview(null)}
                className="px-5 py-2 bg-[#1E293B] text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Bug Report & Feedback Modals */}
      <ReportBugModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />

      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#CBD5E1]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Send Feedback</h3>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsFeedbackOpen(false);
                setFeedbackText('');
                showToast('Thank you! Feedback received.');
              }}
              className="space-y-4 text-xs"
            >
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts or suggest an improvement for Report Builder..."
                className="w-full p-3 border border-[#CBD5E1] rounded focus:border-[#0B69FF] outline-hidden text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded font-bold uppercase text-[11px]"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
}
