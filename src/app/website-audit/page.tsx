'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ShieldCheck,
  Search,
  Check,
  Layers,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useApp } from '@/components/providers/AppProviders';

interface AuditIssue {
  id: string;
  category: 'Crawlability' | 'Meta tags' | 'Content' | 'Internal links' | 'Performance';
  name: string;
  severity: 'Error' | 'Warning' | 'Notice';
  affectedPages: number;
  fixGuide: string;
}

const initialIssues: AuditIssue[] = [
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
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const { activeProject } = useApp();

  const [domain, setDomain] = useState(activeProject?.domain || 'zohosocial.com');
  const [isAuditing, setIsAuditing] = useState(false);
  const [healthScore, setHealthScore] = useState(86);
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | 'Error' | 'Warning' | 'Notice'>('All');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>('iss-1');
  const [searchIssue, setSearchIssue] = useState('');

  const runAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setHealthScore(88);
      setIsAuditing(false);
    }, 900);
  };

  const filteredIssues = initialIssues.filter((iss) => {
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

  const errorCount = initialIssues.filter((i) => i.severity === 'Error').length;
  const warningCount = initialIssues.filter((i) => i.severity === 'Warning').length;
  const noticeCount = initialIssues.filter((i) => i.severity === 'Notice').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-16 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-6 py-5 space-y-5 w-full">
        {/* Breadcrumb & Actions Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 font-medium">Website Audit</span>
            <span>&gt;</span>
            <span className="text-gray-900 font-semibold capitalize">{currentTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runAudit}
              disabled={isAuditing}
              className="bg-[#0B69FF] hover:bg-[#005FE0] text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Crawling pages...' : 'Re-start Audit'}</span>
            </button>

            <a
              href={`/api/export?format=csv&domain=${domain}&type=audit`}
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
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
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
                <span className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">
                  Health
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{domain}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                  Good Condition
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Audit finished: Today, 15:42 • 1,250 URLs crawled • User-Agent: SE Ranking Bot
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
              <div className="text-xl font-black text-gray-800">1,250</div>
              <div className="text-[10px] font-bold text-gray-600 uppercase">Crawled</div>
            </div>
          </div>
        </div>

        {/* Technical SEO Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              category: 'Crawlability & Indexation',
              status: '96% OK',
              details: 'Robots.txt valid, sitemap matched',
              color: 'text-emerald-600',
            },
            {
              category: 'HTTP Status Codes',
              status: '98% 200 OK',
              details: '8 broken links (404), 12 redirects',
              color: 'text-emerald-600',
            },
            {
              category: 'Meta Tags & Headers',
              status: '14 Issues',
              details: 'Duplicate titles & missing descriptions',
              color: 'text-red-500',
            },
            {
              category: 'Core Web Vitals',
              status: 'Pass',
              details: 'LCP 1.8s, CLS 0.04, INP 95ms',
              color: 'text-emerald-600',
            },
          ].map((card, i) => (
            <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-2xs space-y-1">
              <div className="text-[11px] font-semibold text-gray-500 uppercase">{card.category}</div>
              <div className={`text-lg font-bold ${card.color}`}>{card.status}</div>
              <div className="text-[11px] text-gray-500 truncate">{card.details}</div>
            </div>
          ))}
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
                        ? 'bg-white shadow-2xs text-[#0B69FF]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-64">
              <input
                type="text"
                value={searchIssue}
                onChange={(e) => setSearchIssue(e.target.value)}
                placeholder="Search issues"
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 focus:outline-hidden focus:border-[#0B69FF]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {filteredIssues.map((issue) => {
              const isExpanded = expandedIssueId === issue.id;
              return (
                <div key={issue.id} className="hover:bg-gray-50/70 transition-colors">
                  <div
                    onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {issue.severity === 'Error' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      ) : issue.severity === 'Warning' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0B69FF] shrink-0" />
                      )}

                      <div>
                        <span className="font-bold text-gray-900">{issue.name}</span>
                        <span className="ml-2 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
                          {issue.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full text-[11px]">
                        {issue.affectedPages} pages
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-10 pb-4 pt-1 text-xs bg-[#FAFBFD] border-t border-gray-100 space-y-2">
                      <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>How to fix this issue:</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-[11px] max-w-3xl">
                        {issue.fixGuide}
                      </p>
                      <div className="pt-2 flex items-center gap-3 text-[11px]">
                        <button className="text-[#0B69FF] hover:underline font-semibold flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>View all {issue.affectedPages} affected URLs</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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

export default function WebsiteAuditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Website Audit...</div>}>
      <WebsiteAuditContent />
    </Suspense>
  );
}
