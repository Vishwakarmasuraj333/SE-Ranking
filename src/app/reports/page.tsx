'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
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
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface ReportItem {
  id: string;
  title: string;
  projectDomain: string;
  updated: string;
  sent: string;
  frequency: 'Manual' | 'Weekly' | 'Monthly';
  language: string;
  period: string;
  format: 'PDF' | 'HTML' | 'XLS';
}

export default function ReportBuilderPage() {
  const { activeProject } = useApp();

  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports');
  const [filterType, setFilterType] = useState<'my' | 'shared'>('my');
  const [reportFilter, setReportFilter] = useState('All reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlueNotice, setShowBlueNotice] = useState(true);
  const [showYellowNotice, setShowYellowNotice] = useState(true);
  const [isStartTemplateOpen, setIsStartTemplateOpen] = useState(false);
  const [isMyTemplatesOpen, setIsMyTemplatesOpen] = useState(false);

  // Create Report Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDomain, setNewReportDomain] = useState(activeProject?.domain || 'zohosocial.com');
  const [newFrequency, setNewFrequency] = useState<'Manual' | 'Weekly' | 'Monthly'>('Manual');
  const [newFormat, setNewFormat] = useState<'PDF' | 'HTML' | 'XLS'>('PDF');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Cover Page',
    'Rankings Overview',
    'AI Search Visibility',
    'Backlinks Summary',
    'Website Audit Health',
  ]);

  // Initial reports matching screenshot
  const [reportsList, setReportsList] = useState<ReportItem[]>([
    {
      id: 'rep-1',
      title: 'Monthly SEO & AI Search Performance',
      projectDomain: 'zohosocial.com',
      updated: 'Today, 14:20',
      sent: 'Never',
      frequency: 'Monthly',
      language: 'English',
      period: 'Last 30 days',
      format: 'PDF',
    },
  ]);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;

    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      title: newReportTitle.trim(),
      projectDomain: newReportDomain,
      updated: 'Just now',
      sent: newFrequency === 'Manual' ? 'Manual trigger' : 'Scheduled',
      frequency: newFrequency,
      language: 'English',
      period: 'Last 30 days',
      format: newFormat,
    };

    setReportsList((prev) => [newReport, ...prev]);
    setIsCreateModalOpen(false);
    setNewReportTitle('');
  };

  const handleDeleteReport = (id: string) => {
    setReportsList((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const filteredReports = reportsList.filter((r) => {
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (reportFilter === 'Scheduled reports' && r.frequency === 'Manual') return false;
    if (reportFilter === 'Manual reports' && r.frequency !== 'Manual') return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-16 flex flex-col justify-between">
      <div>
        {/* Top Header Notice matching Screenshot 9 */}
        <div className="bg-[#EBF3FF] border-b border-[#CBE0FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#1E3A8A]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0B69FF] shrink-0" />
            <span>
              Create reports using the modular approach: add the cover page and the table of
              contents, edit the contents of the report and add comments to separate sections when
              necessary. Ready-to-go reports can be saved as a template, downloaded in .PDF, .HTML or
              .XLS file formats or sent to an email address.
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-5 space-y-4">
          {/* Breadcrumb & Scheduled Limit Badge */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 font-medium">Report Builder</span>
              <span>&gt;</span>
              <span className="text-gray-900 font-semibold">Reports</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-[#0B69FF] hover:underline font-medium">Feedback</button>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Scheduled reporting 1 / 5</span>
              </div>
            </div>
          </div>

          {/* Main Title & Action Bar matching Screenshot 9 & 10 */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Report Builder</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Report</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-gray-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'templates'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Templates
            </button>
          </div>

          {/* Accordion 1: Start from template */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsStartTemplateOpen(!isStartTemplateOpen)}
              className="w-full px-4 py-3 text-left font-semibold text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isStartTemplateOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <span>Start from template</span>
            </button>

            {isStartTemplateOpen && (
              <div className="p-4 border-t border-gray-100 bg-[#FAFBFD] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    title: 'Standard SEO & Search Visibility',
                    desc: 'Executive summary with search rankings, traffic forecast, and organic CTR.',
                  },
                  {
                    title: 'AI Search & Prompt Citations',
                    desc: 'Deep inspection of ChatGPT, Gemini, and AI Overview brand mentions.',
                  },
                  {
                    title: 'Full Technical SEO & Backlink Audit',
                    desc: 'Site health crawl report, toxic link alerts, and Core Web Vitals.',
                  },
                ].map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setNewReportTitle(tpl.title);
                      setIsCreateModalOpen(true);
                    }}
                    className="p-3 bg-white border border-gray-200 hover:border-[#0B69FF] rounded-lg cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="font-bold text-gray-900 group-hover:text-[#0B69FF]">
                      {tpl.title}
                    </div>
                    <div className="text-[11px] text-gray-500">{tpl.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accordion 2: My templates */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsMyTemplatesOpen(!isMyTemplatesOpen)}
              className="w-full px-4 py-3 text-left font-semibold text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isMyTemplatesOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <span>My templates</span>
            </button>

            {isMyTemplatesOpen && (
              <div className="p-4 border-t border-gray-100 bg-[#FAFBFD] text-xs text-gray-500">
                You haven&apos;t saved any custom templates yet. Create a report and click &ldquo;Save as
                template&rdquo; to reuse it later.
              </div>
            )}
          </div>

          {/* Blue Notice Card matching Screenshot 9 & 10 */}
          {showBlueNotice && (
            <div className="p-4 bg-white border border-[#0B69FF]/30 rounded-xl relative text-xs text-gray-700 flex items-start gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#0B69FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-[#0B69FF]" />
              </div>
              <div className="pr-6 space-y-1">
                <p className="leading-relaxed">
                  We combined manual and scheduled reports into a single report. You can configure
                  its sending schedule, download it immediately, or select both options in the
                  report&apos;s settings. When you download the report, you can be confident that it
                  contains up-to-date information. Below, you will find all your reports, which were
                  previously separated into two tabs. These reports can be filtered based on whether
                  or not they have a sending schedule.
                </p>
              </div>
              <button
                onClick={() => setShowBlueNotice(false)}
                className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Yellow Warning Notice matching Screenshot 9 & 10 */}
          {showYellowNotice && (
            <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl relative text-xs text-amber-900 flex items-start justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  We&apos;ve updated our Traffic Forecast algorithm, which might affect your scheduled
                  reports with traffic data. Please ensure that you take into account possible
                  deviations from previous values.{' '}
                  <span className="font-semibold text-amber-800 underline cursor-pointer">
                    Learn more
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowYellowNotice(false)}
                className="text-amber-700/60 hover:text-amber-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Bar matching Screenshot 10 */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setFilterType('my')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    filterType === 'my'
                      ? 'bg-[#1E2532] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  MY REPORTS {reportsList.length}
                </button>
                <button
                  onClick={() => setFilterType('shared')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    filterType === 'shared'
                      ? 'bg-[#1E2532] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  SHARED REPORTS 0
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Report Category Dropdown */}
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 font-medium focus:outline-hidden"
              >
                <option value="All reports">All reports</option>
                <option value="Scheduled reports">Scheduled reports</option>
                <option value="Manual reports">Manual reports</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Show:</span>
              <select className="px-2 py-1 border border-gray-300 rounded bg-white text-xs">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>

          {/* Reports Table matching Screenshot 10 */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 w-8">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="p-3">Report Title</th>
                    <th className="p-3">Updated</th>
                    <th className="p-3">Sent</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Language</th>
                    <th className="p-3">Report Period</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-400">
                        <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <span>No reports found. Click &ldquo;+ Create Report&rdquo; to build one.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="p-3 font-semibold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="text-[#0B69FF] hover:underline cursor-pointer">
                              {report.title}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                              {report.projectDomain}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{report.updated}</td>
                        <td className="p-3 text-gray-500">{report.sent}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              report.frequency === 'Monthly'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : report.frequency === 'Weekly'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {report.frequency}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{report.language}</td>
                        <td className="p-3 text-gray-600">{report.period}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/api/export?format=${report.format.toLowerCase()}&domain=${report.projectDomain}`}
                              download
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#0B69FF]"
                              title="Download Report"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
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
      </div>

      {/* Create Report Studio Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B69FF]" />
                <h3 className="font-bold text-base text-gray-900">Create New Report</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Report Title</label>
                <input
                  type="text"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  placeholder="e.g. Monthly Executive SEO & AI Search Performance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="HTML">HTML Web Report</option>
                    <option value="XLS">Excel (.XLS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden"
                  >
                    <option value="Manual">Manual (Download on demand)</option>
                    <option value="Weekly">Weekly Automated</option>
                    <option value="Monthly">Monthly Automated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Included Modules</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Cover Page',
                    'Executive Summary',
                    'Rankings Overview',
                    'AI Search Visibility',
                    'Backlinks Summary',
                    'Website Audit Health',
                  ].map((m) => {
                    const isChecked = selectedModules.includes(m);
                    return (
                      <label
                        key={m}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-[#0B69FF] bg-blue-50/50 text-[#0B69FF]'
                            : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModule(m)}
                          className="rounded text-[#0B69FF]"
                        />
                        <span className="font-medium text-[11px]">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg font-bold shadow-2xs cursor-pointer"
                >
                  Save &amp; Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer matching SE Ranking screenshots */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between mt-8">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
          <span>SE Ranking</span>
        </div>
        <div className="flex items-center gap-5">
          <button className="hover:underline text-gray-600">Report a bug</button>
          <a
            href="https://seranking.com/affiliate.html"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-gray-600"
          >
            Affiliates
          </a>
          <a href="/api-docs" className="hover:underline text-gray-600">
            API
          </a>
          <a
            href="https://seranking.com/whats-new.html"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-gray-600"
          >
            What&apos;s new
          </a>
          <a
            href="https://help.seranking.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-gray-600"
          >
            Help
          </a>
        </div>
      </footer>
    </div>
  );
}
