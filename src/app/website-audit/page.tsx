'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ShieldCheck,
  Search,
  Check,
  Layers,
  Zap,
  Folder,
  FolderOpen,
  Calendar,
  Columns,
  Plus,
  Globe,
  Gauge,
  X,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface AuditItem {
  id: string;
  domain: string;
  folder: string;
  type: 'Project-based' | 'Standalone';
  lastUpdate: string;
  healthScore: number;
  errors: number;
  pagesCrawled: number;
}

interface AuditIssue {
  id: string;
  category: 'Crawlability' | 'Meta tags' | 'Content' | 'Internal links' | 'Performance';
  name: string;
  severity: 'Error' | 'Warning' | 'Notice';
  affectedPages: number;
  fixGuide: string;
}

const INITIAL_AUDITS: AuditItem[] = [
  {
    id: 'aud-1',
    domain: 'zohosocial.com',
    folder: 'General',
    type: 'Project-based',
    lastUpdate: 'Sep 27 2026',
    healthScore: 84,
    errors: 2,
    pagesCrawled: 79,
  },
];

const INITIAL_ISSUES: AuditIssue[] = [
  {
    id: 'iss-1',
    category: 'Meta tags',
    name: 'Duplicate Title Tags across localized pages',
    severity: 'Error',
    affectedPages: 14,
    fixGuide:
      'Ensure each URL has a distinct, descriptive <title> tag reflecting page context and primary search keywords.',
  },
  {
    id: 'iss-2',
    category: 'Crawlability',
    name: 'Broken internal links (HTTP 404 Not Found)',
    severity: 'Error',
    affectedPages: 8,
    fixGuide:
      'Update internal hyperlink anchors to point to live destination URLs or remove dead references.',
  },
  {
    id: 'iss-3',
    category: 'Meta tags',
    name: 'Meta description tag is missing',
    severity: 'Warning',
    affectedPages: 36,
    fixGuide:
      'Add concise 140-160 character meta descriptions to increase organic click-through rates from search result snippets.',
  },
  {
    id: 'iss-4',
    category: 'Content',
    name: 'Pages with thin or low word count (< 300 words)',
    severity: 'Warning',
    affectedPages: 22,
    fixGuide:
      'Expand informative copy or apply noindex directives to utility pages to avoid search penalty filters.',
  },
  {
    id: 'iss-5',
    category: 'Performance',
    name: 'Images without modern WebP/AVIF compression',
    severity: 'Warning',
    affectedPages: 45,
    fixGuide:
      'Serve responsive WebP/AVIF images with next/image or CDN transformations to improve Largest Contentful Paint (LCP).',
  },
  {
    id: 'iss-6',
    category: 'Internal links',
    name: 'High click-depth pages (Depth > 4 clicks from Home)',
    severity: 'Notice',
    affectedPages: 64,
    fixGuide:
      'Improve website navigation architecture and add contextual internal links to reduce crawl depth.',
  },
  {
    id: 'iss-7',
    category: 'Crawlability',
    name: 'Pages with no self-referencing canonical tag',
    severity: 'Notice',
    affectedPages: 56,
    fixGuide:
      'Specify rel="canonical" link elements on all indexable pages to prevent accidental duplicate parameter indexing.',
  },
];

function WebsiteAuditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all-reports';
  const paramDomain = searchParams.get('domain');
  const { activeProject } = useApp();

  const [audits, setAudits] = useState<AuditItem[]>(INITIAL_AUDITS);
  const [showWhitelistBanner, setShowWhitelistBanner] = useState(true);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<'All' | 'Project-based' | 'Standalone'>('All');
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(true);
  const [selectedAuditIds, setSelectedAuditIds] = useState<Set<string>>(new Set());
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'me' | 'others'>('me');
  const [pageSize, setPageSize] = useState(10);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [newAuditUrl, setNewAuditUrl] = useState('');
  const [newAuditType, setNewAuditType] = useState<'Project-based' | 'Standalone'>('Project-based');
  const [newAuditPageLimit, setNewAuditPageLimit] = useState(100);

  // Single Domain Dashboard State
  const activeDomain = paramDomain || (audits[0] ? audits[0].domain : 'zohosocial.com');
  const [healthScore, setHealthScore] = useState(84);
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | 'Error' | 'Warning' | 'Notice'>('All');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>('iss-1');
  const [searchIssue, setSearchIssue] = useState('');

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsTypeFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditUrl.trim()) return;

    let clean = newAuditUrl.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    const newAudit: AuditItem = {
      id: `aud-${Date.now()}`,
      domain: clean,
      folder: 'General',
      type: newAuditType,
      lastUpdate: 'Just now',
      healthScore: 89,
      errors: 1,
      pagesCrawled: newAuditPageLimit,
    };

    setAudits([newAudit, ...audits]);
    setShowNewAuditModal(false);
    setNewAuditUrl('');
  };

  const filteredAudits = audits.filter((a) => {
    if (auditTypeFilter !== 'All' && a.type !== auditTypeFilter) return false;
    if (auditSearch && !a.domain.toLowerCase().includes(auditSearch.toLowerCase())) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedAuditIds.size === filteredAudits.length) {
      setSelectedAuditIds(new Set());
    } else {
      setSelectedAuditIds(new Set(filteredAudits.map((a) => a.id)));
    }
  };

  const toggleSelectAudit = (id: string) => {
    const next = new Set(selectedAuditIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAuditIds(next);
  };

  // If user navigates to overview or other deep tabs, render the Single Site Audit Dashboard
  if (currentTab !== 'all-reports' && currentTab !== '') {
    const filteredIssues = INITIAL_ISSUES.filter((iss) => {
      if (selectedSeverity !== 'All' && iss.severity !== selectedSeverity) return false;
      if (
        searchIssue &&
        !iss.name.toLowerCase().includes(searchIssue.toLowerCase()) &&
        !iss.category.toLowerCase().includes(searchIssue.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    const errorCount = INITIAL_ISSUES.filter((i) => i.severity === 'Error').length;
    const warningCount = INITIAL_ISSUES.filter((i) => i.severity === 'Warning').length;
    const noticeCount = INITIAL_ISSUES.filter((i) => i.severity === 'Notice').length;

    return (
      <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-16 flex flex-col justify-between">
        <div className="max-w-6xl mx-auto px-6 py-5 space-y-5 w-full">
          {/* Breadcrumb & Actions Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Link href="/website-audit" className="text-[#0B69FF] hover:underline font-medium">
                Website Audit
              </Link>
              <span>&gt;</span>
              <span className="text-gray-900 font-semibold capitalize">{currentTab}</span>
              <span className="text-gray-400">({activeDomain})</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsAuditing(true);
                  setTimeout(() => {
                    setHealthScore(91);
                    setIsAuditing(false);
                  }, 800);
                }}
                disabled={isAuditing}
                className="bg-[#0B69FF] hover:bg-[#005FE0] text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Crawling pages...' : 'Re-start Audit'}</span>
              </button>

              <a
                href={`/api/export?format=csv&domain=${activeDomain}&type=audit`}
                download
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF / CSV</span>
              </a>
            </div>
          </div>

          {/* Audit Header Banner */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Score Ring Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#22C55E"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900 leading-none">{healthScore}</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Health</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{activeDomain}</h1>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    Good Condition
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Audit finished: Sep 27 2026 • 79 URLs crawled • User-Agent: SE Ranking Bot
                </p>
              </div>
            </div>

            {/* Quick Counter Badges */}
            <div className="flex items-center gap-4 text-center">
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-xl font-black text-red-600">{errorCount}</div>
                <div className="text-[10px] font-bold text-red-700 uppercase">Errors</div>
              </div>

              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-xl font-black text-amber-600">{warningCount}</div>
                <div className="text-[10px] font-bold text-amber-700 uppercase">Warnings</div>
              </div>

              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-xl font-black text-[#0B69FF]">{noticeCount}</div>
                <div className="text-[10px] font-bold text-blue-700 uppercase">Notices</div>
              </div>

              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="text-xl font-black text-gray-800">79</div>
                <div className="text-[10px] font-bold text-gray-600 uppercase">Crawled</div>
              </div>
            </div>
          </div>

          {/* Issues List & Filter Tool */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">
                  Issues Report ({filteredIssues.length})
                </span>
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                  {(['All', 'Error', 'Warning', 'Notice'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedSeverity === sev
                          ? 'bg-white text-gray-900 shadow-2xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchIssue}
                  onChange={(e) => setSearchIssue(e.target.value)}
                  placeholder="Filter issues..."
                  className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:border-[#0B69FF]"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredIssues.map((iss) => (
                <div key={iss.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedIssueId(expandedIssueId === iss.id ? null : iss.id)}
                  >
                    <div className="flex items-center gap-3">
                      {iss.severity === 'Error' ? (
                        <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                      ) : iss.severity === 'Warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-[#0B69FF] shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-gray-900">{iss.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Category: <span className="font-semibold text-gray-700">{iss.category}</span> •{' '}
                          <span className="text-red-600 font-semibold">{iss.affectedPages} pages affected</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedIssueId === iss.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedIssueId === iss.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 pl-7 text-xs text-gray-600 space-y-2">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-blue-950">
                        <div className="font-semibold text-[11px] uppercase tracking-wider text-blue-700 mb-1">
                          How to Fix:
                        </div>
                        {iss.fixGuide}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between mt-12">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            <span>SE Ranking</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => alert('Bug report dialog opened.')} className="hover:underline text-gray-600 cursor-pointer">
              Report a bug
            </button>
            <a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="hover:underline text-gray-600">
              Affiliates
            </a>
            <a href="/api-docs" className="hover:underline text-gray-600">
              API
            </a>
            <a href="https://seranking.com/whats-new.html" target="_blank" rel="noreferrer" className="hover:underline text-gray-600">
              What&apos;s new
            </a>
            <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:underline text-gray-600">
              Help
            </a>
          </div>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ALL REPORTS MAIN VIEW (Matching user screenshot 1:1)
  // -------------------------------------------------------------
  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] text-[#2C384A] select-none pb-20 relative flex flex-col justify-between">
      <div className="max-w-[1240px] mx-auto p-4 sm:p-6 sm:pt-4 space-y-4 w-full">
        {/* Whitelist IP Addresses Notice Banner matching Screenshot 1 */}
        {showWhitelistBanner && (
          <div className="p-3 bg-[#F0F5FF] border border-[#D0E2FF] rounded text-[13px] text-[#2C384A] relative flex items-start justify-between shadow-2xs leading-relaxed">
            <div className="flex items-start gap-2.5 pr-6">
              <span className="w-4 h-4 rounded-full bg-[#0B69FF] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                i
              </span>
              <div className="space-y-0.5">
                <div className="font-bold text-[#1E293B]">Whitelist our IP addresses</div>
                <div className="text-[12.5px] text-[#475569]">
                  If you can&apos;t run a website audit or scan pages, make sure the current Website Audit IP addresses are allowed by your server or security system.
                </div>
                <div>
                  <a
                    href="https://help.seranking.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0B69FF] hover:underline font-medium text-[12.5px]"
                  >
                    Whitelist the server IP addresses
                  </a>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWhitelistBanner(false)}
              className="text-[#8C98A9] hover:text-gray-700 p-0.5 cursor-pointer shrink-0 font-bold"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sub-header: Breadcrumb & Account Limits matching Screenshot 1 */}
        <div className="flex items-center justify-between text-xs text-[#8C98A9] pt-1">
          <div className="text-[13px] text-[#8C98A9] font-normal">Website Audit</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#0B69FF] hover:underline cursor-pointer font-medium text-xs"
            >
              Feedback
            </button>
            <div className="flex items-center gap-1.5 text-xs text-[#475569]">
              <Gauge className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Account limits:</span>
              <span className="font-semibold text-gray-900">79 / 5,000</span>
              <span
                className="text-gray-400 cursor-help"
                title="Number of pages crawled in current billing period"
              >
                ℹ
              </span>
            </div>
          </div>
        </div>

        {/* Title & + NEW AUDIT Button matching Screenshot 1 */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-[24px] sm:text-[26px] font-bold text-[#1E293B] tracking-tight">
            Website Audit
          </h1>
          <button
            type="button"
            onClick={() => setShowNewAuditModal(true)}
            className="bg-[#20B26C] hover:bg-[#1CA061] text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ NEW AUDIT</span>
          </button>
        </div>

        {/* Filter Toolbar matching Screenshot 1 */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search audit input */}
            <div className="relative w-64 max-w-full">
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit"
                className="w-full pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded text-[13px] text-gray-800 placeholder-gray-400 bg-white focus:outline-hidden focus:border-[#0B69FF]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* All Audits Dropdown matching Screenshot 1 open state */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                className="px-3 py-1.5 border border-[#CBD5E1] rounded text-[13px] bg-white text-gray-800 font-normal hover:border-gray-400 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>
                  {auditTypeFilter === 'All'
                    ? 'All audits'
                    : auditTypeFilter === 'Project-based'
                    ? 'Project-based audits'
                    : 'Standalone audits'}
                </span>
                {isTypeFilterOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {isTypeFilterOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-[#CBD5E1] rounded-lg shadow-lg z-30 py-1 text-[13px] animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAuditTypeFilter('All');
                      setIsTypeFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between ${
                      auditTypeFilter === 'All' ? 'bg-blue-50/60 font-semibold text-[#0B69FF]' : 'text-gray-700'
                    }`}
                  >
                    <span>All audits</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuditTypeFilter('Project-based');
                      setIsTypeFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between ${
                      auditTypeFilter === 'Project-based' ? 'bg-blue-50/60 font-semibold text-[#0B69FF]' : 'text-gray-700'
                    }`}
                  >
                    <span>Project-based audits</span>
                    <span className="text-gray-400 text-[10px]">ℹ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuditTypeFilter('Standalone');
                      setIsTypeFilterOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between ${
                      auditTypeFilter === 'Standalone' ? 'bg-blue-50/60 font-semibold text-[#0B69FF]' : 'text-gray-700'
                    }`}
                  >
                    <span>Standalone audits</span>
                    <span className="text-gray-400 text-[10px]">ℹ</span>
                  </button>
                </div>
              )}
            </div>

            {/* SELECT DATES Button matching Screenshot 1 */}
            <button
              type="button"
              onClick={() => alert('Date picker filter opened')}
              className="px-3 py-1.5 border border-[#CBD5E1] rounded text-[12px] bg-white text-gray-700 font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>SELECT DATES</span>
            </button>
          </div>

          {/* Sub-row: Created By Me & Columns matching Screenshot 1 */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-[#EEF2F6] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setActiveTab('me')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'me'
                    ? 'bg-[#2C384A] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>CREATED BY ME</span>
                <span className="bg-[#415169] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {filteredAudits.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('others')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'others'
                    ? 'bg-[#2C384A] text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>CREATED BY OTHERS</span>
              </button>
            </div>

            {/* COLUMNS Button matching Screenshot 1 */}
            <button
              type="button"
              onClick={() => alert('Column customizer opened')}
              className="px-3 py-1 border border-[#CBD5E1] rounded text-[11px] bg-white text-gray-700 font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
            >
              <Columns className="w-3.5 h-3.5 text-gray-500" />
              <span>COLUMNS</span>
            </button>
          </div>
        </div>

        {/* Audits Table matching Screenshot 1 */}
        <div className="bg-white border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs mt-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#FAFBFD] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[#E2E8F0] font-semibold">
                <tr>
                  <th className="px-4 py-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAuditIds.size === filteredAudits.length && filteredAudits.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                    />
                    <span>AUDITS</span>
                  </th>
                  <th className="px-4 py-3 text-right">LAST UPDATE</th>
                  <th className="px-4 py-3 text-right">HEALTH SCORE</th>
                  <th className="px-4 py-3 text-right">ERRORS</th>
                  <th className="px-4 py-3 text-right">PAGES CRAWLED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {/* General Folder Row matching Screenshot 1 */}
                <tr className="bg-[#FAFBFD]/60 hover:bg-[#F1F5F9]/80 transition-colors">
                  <td colSpan={5} className="px-4 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                      <input
                        type="checkbox"
                        checked={selectedAuditIds.size === filteredAudits.length && filteredAudits.length > 0}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setFolderOpen(!folderOpen)}
                        className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                            folderOpen ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                        <Folder className="w-4 h-4 text-[#F59E0B] fill-[#FCD34D]" />
                        <span>General</span>
                        <span className="text-gray-400 font-normal">({filteredAudits.length})</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Audit Items under Folder matching Screenshot 1 */}
                {folderOpen &&
                  filteredAudits.map((item) => {
                    const isChecked = selectedAuditIds.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          isChecked ? 'bg-blue-50/20' : ''
                        }`}
                        onClick={() => router.push(`/website-audit?tab=overview&domain=${item.domain}`)}
                      >
                        {/* Domain name with blue globe icon and Project-based subtext */}
                        <td className="px-4 py-3 pl-10" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectAudit(item.id)}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                            />
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[#0B69FF] shrink-0 font-bold text-[10px]">
                              🌐
                            </div>
                            <div>
                              <Link
                                href={`/website-audit?tab=overview&domain=${item.domain}`}
                                className="text-[13px] font-semibold text-gray-900 hover:text-[#0B69FF] transition-colors"
                              >
                                {item.domain}
                              </Link>
                              <div className="text-[11px] text-[#8C98A9]">{item.type}</div>
                            </div>
                          </div>
                        </td>

                        {/* Last Update */}
                        <td className="px-4 py-3 text-right text-[12px] text-gray-700">
                          {item.lastUpdate}
                        </td>

                        {/* Health Score */}
                        <td className="px-4 py-3 text-right">
                          <span className="text-[13px] font-bold text-gray-900">
                            {item.healthScore}%
                          </span>
                        </td>

                        {/* Errors */}
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold text-[13px] ${
                              item.errors > 0 ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {item.errors}
                          </span>
                        </td>

                        {/* Pages Crawled */}
                        <td className="px-4 py-3 text-right font-medium text-[13px] text-gray-800">
                          {item.pagesCrawled}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with View on page dropdown matching Screenshot 1 */}
          <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs text-gray-500 bg-[#FAFBFD]">
            <span>View on page:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1 border border-[#CBD5E1] rounded text-xs bg-white text-gray-700 focus:outline-hidden cursor-pointer pr-6"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* New Audit Modal */}
      {showNewAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-[#20B26C]" />
                <h3 className="text-base font-bold text-gray-900">Create New Website Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewAuditModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Website domain or URL:
                </label>
                <input
                  type="text"
                  required
                  value={newAuditUrl}
                  onChange={(e) => setNewAuditUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Audit Type:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAuditType('Project-based')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      newAuditType === 'Project-based'
                        ? 'bg-blue-50 border-[#0B69FF] text-[#0B69FF] font-bold'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Project-based
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAuditType('Standalone')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      newAuditType === 'Standalone'
                        ? 'bg-blue-50 border-[#0B69FF] text-[#0B69FF] font-bold'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Standalone
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Page Crawl Limit:
                </label>
                <select
                  value={newAuditPageLimit}
                  onChange={(e) => setNewAuditPageLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs bg-white text-gray-700 cursor-pointer"
                >
                  <option value={100}>100 pages</option>
                  <option value={500}>500 pages</option>
                  <option value={1000}>1,000 pages</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewAuditModal(false)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#20B26C] hover:bg-[#1CA061] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Start Website Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer matching Screenshot 1 */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between mt-12">
        <Link href="/projects" className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
          <span>SE Ranking</span>
        </Link>
        <div className="flex items-center gap-5">
          <button onClick={() => setIsBugModalOpen(true)} className="hover:underline text-gray-600 cursor-pointer">
            Report a bug
          </button>
          <Link href="/affiliate" className="hover:underline text-gray-600">
            Affiliates
          </Link>
          <Link href="/api-docs" className="hover:underline text-gray-600">
            API
          </Link>
          <Link href="/whats-new" className="hover:underline text-gray-600">
            What&apos;s new
          </Link>
          <Link href="/help" className="hover:underline text-gray-600">
            Help
          </Link>
        </div>
      </footer>

      {/* Tell us what you think Feedback Modal matching Screenshot */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* SE Ranking support request Modal matching Screenshot */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </div>
  );
}

export default function WebsiteAuditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Website Audit...</div>}>
      <WebsiteAuditContent />
    </Suspense>
  );
}
