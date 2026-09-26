'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Info,
  AlertTriangle,
  X,
  FileText,
  Download,
  Calendar,
  Clock,
  Mail,
  CheckCircle2,
  Trash2,
  Eye,
  ExternalLink,
  Settings,
  Share2,
  Check,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { useApp } from '@/components/providers/AppProviders';

interface ReportRow {
  id: string;
  title: string;
  domain: string;
  updated: string;
  sent: string;
  frequency: string;
  language: string;
  period: string;
  format: 'PDF' | 'HTML' | 'XLS';
}

export default function ReportBuilderPage() {
  const { activeProject } = useApp();

  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports');
  const [filterType, setFilterType] = useState<'my' | 'shared'>('my');
  const [reportCategoryFilter, setReportCategoryFilter] = useState('All reports');
  const [searchQuery, setSearchQuery] = useState('');

  // Dismissible Banners
  const [showTopModularBanner, setShowTopModularBanner] = useState(true);
  const [showBlueMergedBanner, setShowBlueMergedBanner] = useState(true);
  const [showYellowWarningBanner, setShowYellowWarningBanner] = useState(true);

  // Accordion Toggles
  const [isStartFromTemplateOpen, setIsStartFromTemplateOpen] = useState(true);
  const [isMyTemplatesOpen, setIsMyTemplatesOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(1);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDomain, setNewReportDomain] = useState(activeProject?.domain || 'zohosocial.com');
  const [newFrequency, setNewFrequency] = useState('Every week on Wednesday');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newPeriod, setNewPeriod] = useState('Sep-20 2026 - Sep-23 2026');
  const [newFormat, setNewFormat] = useState<'PDF' | 'HTML' | 'XLS'>('PDF');

  // Real Reports Dataset matching Screenshot 2
  const [reportsList, setReportsList] = useState<ReportRow[]>([
    {
      id: 'rep-zoho-1',
      title: 'zohosocial.com Project Report',
      domain: 'zohosocial.com',
      updated: 'Sep-23 2026',
      sent: '-',
      frequency: 'Every week on Wednesday',
      language: 'English',
      period: 'Sep-20 2026 - Sep-23 2026',
      format: 'PDF',
    },
  ]);

  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // 12 Templates
  const allTemplates = [
    { id: 't1', title: 'SEO-report', description: 'Comprehensive search visibility and technical overview' },
    { id: 't2', title: 'Rankings Overview', description: 'Rankings movement, top gains, and keyword distribution' },
    { id: 't3', title: 'Monthly Report: Rankings & Traffic', description: 'Monthly executive summary with traffic forecasts' },
    { id: 't4', title: 'Traffic Overview', description: 'Organic vs. direct traffic sessions and bounce rates' },
    { id: 't5', title: 'Organic Traffic', description: 'Non-branded search engine referral growth report' },
    { id: 't6', title: 'Rankings & Competitors', description: 'Side-by-side SERP comparison against top competitors' },
    { id: 't7', title: 'AI Search Visibility Tracker', description: 'ChatGPT, Gemini, and Google AI Overview citations' },
    { id: 't8', title: 'Full Backlink Audit', description: 'New & lost referring domains with trust scores' },
    { id: 't9', title: 'Local 3-Pack Map Report', description: 'Google Business Profile local grid rankings' },
    { id: 't10', title: 'On-Page SEO Health', description: 'Core Web Vitals, 404 crawl errors, and metadata' },
    { id: 't11', title: 'Content Performance & NLP', description: 'Article word counts, semantic scores, and engagement' },
    { id: 't12', title: 'Executive White-Label Summary', description: 'Agency branded report with custom cover page' },
  ];

  const visibleTemplates = templatePage === 1 ? allTemplates.slice(0, 6) : allTemplates.slice(6, 12);

  const handleSelectTemplate = (title: string) => {
    setNewReportTitle(`${activeProject?.domain || 'zohosocial.com'} - ${title}`);
    setIsCreateModalOpen(true);
  };

  const handleCreateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;

    const newRep: ReportRow = {
      id: `rep_${Date.now()}`,
      title: newReportTitle.trim(),
      domain: newReportDomain.trim() || 'zohosocial.com',
      updated: 'Sep-26 2026',
      sent: '-',
      frequency: newFrequency,
      language: newLanguage,
      period: newPeriod,
      format: newFormat,
    };

    setReportsList((prev) => [newRep, ...prev]);
    setIsCreateModalOpen(false);
    setNewReportTitle('');
  };

  const handleDeleteReport = (id: string) => {
    setReportsList((prev) => prev.filter((r) => r.id !== id));
    setSelectedReports((prev) => prev.filter((item) => item !== id));
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === reportsList.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reportsList.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredReports = reportsList.filter((r) => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (reportCategoryFilter === 'Scheduled reports' && r.frequency === '-') return false;
    if (reportCategoryFilter === 'Manual reports' && r.frequency !== '-') return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] text-gray-900 min-h-screen">
      {/* Top Blue Suite Navigation Bar matching Screenshot 2 */}
      <div className="bg-[#0B69FF] px-4 py-1.5 flex items-center justify-between border-t border-blue-400/20 text-white text-xs select-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Link
            href="/rankings"
            className="px-3 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 font-medium shrink-0"
          >
            Rankings
          </Link>
          <Link
            href="/website-audit"
            className="px-3 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 font-medium shrink-0"
          >
            Website Audit (Projects)
          </Link>
          <Link
            href="/research/ai-search"
            className="px-3 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 font-medium shrink-0"
          >
            Competitive Research
          </Link>
          <Link
            href="/keyword-manager"
            className="px-3 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 font-medium shrink-0"
          >
            Keyword Manager
          </Link>
          <Link
            href="/local-marketing"
            className="px-3 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 font-medium shrink-0"
          >
            All Locations
          </Link>
        </div>
      </div>

      {/* Top Modular Approach Info Alert Banner matching Screenshot 2 */}
      {showTopModularBanner && (
        <div className="bg-[#EBF3FC] border-b border-[#CCE0F8] px-4 py-2.5 text-xs text-[#1E40AF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0B69FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              i
            </span>
            <span className="leading-snug">
              Create reports using the modular approach: add the cover page and the table of contents, edit the contents of the report and add comments to separate sections when necessary. Ready-to-go reports can be saved as a template, downloaded in .PDF, .HTML or .XLS file formats or sent to an email address.
            </span>
          </div>
          <button
            onClick={() => setShowTopModularBanner(false)}
            className="text-gray-400 hover:text-gray-700 ml-4 p-0.5 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="hover:text-gray-900 cursor-pointer">Report Builder</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-semibold">Reports</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Feedback modal: Thank you for your feedback!')}
            className="text-gray-500 hover:text-[#0B69FF] transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Scheduled reporting: 1 / 5</span>
            <span
              className="cursor-pointer text-amber-700 hover:text-amber-900"
              title="Your plan includes up to 5 automated scheduled reports."
            >
              ⓘ
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Header & Create Report Button matching Screenshot 2 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Report Builder</h1>
          <button
            onClick={() => {
              setNewReportTitle('');
              setIsCreateModalOpen(true);
            }}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs uppercase px-4 py-2.5 rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE REPORT</span>
          </button>
        </div>

        {/* Sub-Tabs: Reports | Templates */}
        <div className="flex items-center gap-6 border-b border-gray-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTab === 'templates'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Section: Start from template (Accordion matching Screenshot 2) */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <button
              onClick={() => setIsStartFromTemplateOpen(!isStartFromTemplateOpen)}
              className="flex items-center gap-2 font-bold text-xs text-gray-800 hover:text-gray-900 cursor-pointer"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                  isStartFromTemplateOpen ? '' : '-rotate-90'
                }`}
              />
              <span>Start from template</span>
              <span className="text-[10px] text-gray-400 font-normal">12</span>
            </button>

            {isStartFromTemplateOpen && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{templatePage === 1 ? 'Templates: 1-6 out of 12' : 'Templates: 7-12 out of 12'}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTemplatePage(1)}
                    disabled={templatePage === 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTemplatePage(2)}
                    disabled={templatePage === 2}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {isStartFromTemplateOpen && (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {visibleTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.title)}
                  className="border border-gray-200 hover:border-[#0B69FF] rounded-lg p-3.5 text-center flex items-center justify-center min-h-[72px] bg-white hover:bg-blue-50/30 transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="font-semibold text-xs text-gray-800 group-hover:text-[#0B69FF] leading-snug">
                    {tpl.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: My templates Accordion matching Screenshot 2 */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setIsMyTemplatesOpen(!isMyTemplatesOpen)}
            className="flex items-center gap-2 font-bold text-xs text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            <ChevronRight
              className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                isMyTemplatesOpen ? 'rotate-90' : ''
              }`}
            />
            <span>My templates</span>
          </button>

          <button
            onClick={() => {
              setNewReportTitle('Custom Branded Template');
              setIsCreateModalOpen(true);
            }}
            className="border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-xs uppercase px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE TEMPLATE</span>
          </button>
        </div>

        {/* Blue Info Notice Card matching Screenshot 2 */}
        {showBlueMergedBanner && (
          <div className="bg-white border border-[#0B69FF]/30 rounded-lg p-4 relative text-xs text-gray-700 flex items-start gap-3 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B69FF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              i
            </span>
            <div className="pr-6 space-y-1">
              <p className="leading-relaxed">
                We combined manual and scheduled reports into a single report. You can configure its sending schedule, download it immediately, or select both options in the report's settings. When you download the report, you can be confident that it contains up-to-date information. Below, you will find all your reports, which were previously separated into two tabs. These reports can be filtered based on whether or not they have a sending schedule.
              </p>
            </div>
            <button
              onClick={() => setShowBlueMergedBanner(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label="Close message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Yellow Notice Card matching Screenshot 2 */}
        {showYellowWarningBanner && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-4 relative text-xs text-amber-900 flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <span className="text-amber-500 text-sm mt-0.5 shrink-0">⚠️</span>
              <p className="leading-relaxed">
                We've updated our Traffic Forecast algorithm, which might affect your scheduled reports with traffic data. Please ensure that you take into account possible deviations from previous values.{' '}
                <a
                  href="https://seranking.com/blog"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-amber-800 underline hover:text-amber-900"
                >
                  Learn more
                </a>
              </p>
            </div>
            <button
              onClick={() => setShowYellowWarningBanner(false)}
              className="text-amber-700/60 hover:text-amber-900 cursor-pointer"
              aria-label="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar matching Screenshot 2 */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Tabs: MY REPORTS 1 | SHARED REPORTS 0 */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded text-xs font-semibold">
              <button
                onClick={() => setFilterType('my')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  filterType === 'my'
                    ? 'bg-[#1E2532] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                MY REPORTS {reportsList.length}
              </button>
              <button
                onClick={() => setFilterType('shared')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  filterType === 'shared'
                    ? 'bg-[#1E2532] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                SHARED REPORTS 0
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 focus:outline-none focus:border-[#0B69FF]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
            </div>

            {/* Category Dropdown */}
            <select
              value={reportCategoryFilter}
              onChange={(e) => setReportCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All reports">All reports</option>
              <option value="Scheduled reports">Scheduled reports</option>
              <option value="Manual reports">Manual reports</option>
            </select>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>20</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Reports Data Table matching Screenshot 2 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-gray-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reportsList.length && reportsList.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3">REPORT TITLE</th>
                  <th className="p-3">
                    <div className="flex items-center gap-1">
                      <span>UPDATED</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-3">SENT</th>
                  <th className="p-3">FREQUENCY</th>
                  <th className="p-3">LANGUAGE</th>
                  <th className="p-3">REPORT PERIOD</th>
                  <th className="p-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <span>No reports found. Click &ldquo;+ CREATE REPORT&rdquo; to build one.</span>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => toggleSelectOne(report.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {/* Zoho 4-color square logo matching Screenshot 2 */}
                          <div className="w-4 h-4 rounded-xs border border-gray-200 overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0">
                            <div className="bg-[#E53935]" />
                            <div className="bg-[#FB8C00]" />
                            <div className="bg-[#1E88E5]" />
                            <div className="bg-[#43A047]" />
                          </div>
                          <span
                            onClick={() => {
                              alert(`Opening report preview for: ${report.title}`);
                            }}
                            className="text-gray-900 hover:text-[#0B69FF] cursor-pointer"
                          >
                            {report.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 font-mono text-[11px]">{report.updated}</td>
                      <td className="p-3 text-gray-500 font-mono text-[11px]">{report.sent}</td>
                      <td className="p-3 text-gray-700 font-medium">{report.frequency}</td>
                      <td className="p-3 text-gray-600">{report.language}</td>
                      <td className="p-3 text-gray-600 font-mono text-[11px]">{report.period}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const dummyBlob = new Blob([`Report: ${report.title}\nDomain: ${report.domain}\nPeriod: ${report.period}\nStatus: Complete`], { type: 'text/plain' });
                              const url = URL.createObjectURL(dummyBlob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${report.title.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`;
                              a.click();
                            }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-[#0B69FF] cursor-pointer"
                            title="Download Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* REAL INTERACTIVE MODAL: CREATE REPORT                    */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-gray-900">Create Modular Report</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Report Title</label>
                <input
                  type="text"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="e.g. zohosocial.com Project Report"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0B69FF]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Target Project</label>
                  <input
                    type="text"
                    value={newReportDomain}
                    onChange={(e) => setNewReportDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#0B69FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white"
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="HTML">Web (.html)</option>
                    <option value="XLS">Excel (.xls)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Sending Schedule / Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white"
                >
                  <option value="Every week on Wednesday">Every week on Wednesday</option>
                  <option value="Every Monday at 09:00">Every Monday at 09:00</option>
                  <option value="Monthly on the 1st">Monthly on the 1st</option>
                  <option value="-">Manual (On-demand download)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded shadow-xs cursor-pointer"
                >
                  SAVE &amp; BUILD REPORT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Footer Bar matching Screenshot 2 */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-3 px-6 flex flex-wrap items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <SeRankingLogo variant="brand" width={90} height={20} />
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button onClick={() => alert('Bug report dialog opened.')} className="hover:text-gray-800 cursor-pointer">
            Report a bug
          </button>
          <Link href="/landing" className="hover:text-gray-800">
            Affiliates
          </Link>
          <Link href="/api-docs" className="hover:text-gray-800">
            API
          </Link>
          <button onClick={() => alert('Release notes for SE Ranking 2026.')} className="hover:text-gray-800 cursor-pointer">
            What's new
          </button>
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-800">
            Help
          </a>
        </div>
      </footer>
    </div>
  );
}
