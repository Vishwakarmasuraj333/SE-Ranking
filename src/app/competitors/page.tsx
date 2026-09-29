'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Plus,
  BarChart2,
  TrendingUp,
  Link2,
  Globe,
  Trash2,
  ExternalLink,
  Copy,
  Users,
  Activity,
  ArrowUp,
  ArrowUpRight,
  Layers,
  SlidersHorizontal,
  Folder,
  Calendar,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface CompetitorData {
  id: string;
  domain: string;
  visibility: number;
  avgPosition: number;
  commonKeywords: number;
  totalKeywords: number;
  organicTraffic: string;
  backlinks: string;
  tag: string;
}

const DEFAULT_SUGGESTIONS: CompetitorData[] = [
  {
    id: 'comp-1',
    domain: 'hubstaff.com',
    visibility: 68.4,
    avgPosition: 6.2,
    commonKeywords: 48,
    totalKeywords: 28400,
    organicTraffic: '482K',
    backlinks: '1.2M',
    tag: 'Direct Competitor',
  },
  {
    id: 'comp-2',
    domain: 'timedoctor.com',
    visibility: 61.2,
    avgPosition: 7.8,
    commonKeywords: 39,
    totalKeywords: 21900,
    organicTraffic: '320K',
    backlinks: '890K',
    tag: 'Direct Competitor',
  },
  {
    id: 'comp-3',
    domain: 'desktime.com',
    visibility: 54.7,
    avgPosition: 8.9,
    commonKeywords: 34,
    totalKeywords: 16800,
    organicTraffic: '240K',
    backlinks: '640K',
    tag: 'Direct Competitor',
  },
  {
    id: 'comp-4',
    domain: 'insightful.io',
    visibility: 43.1,
    avgPosition: 11.4,
    commonKeywords: 26,
    totalKeywords: 11200,
    organicTraffic: '135K',
    backlinks: '320K',
    tag: 'Emerging',
  },
  {
    id: 'comp-5',
    domain: 'teramind.com',
    visibility: 49.8,
    avgPosition: 9.7,
    commonKeywords: 29,
    totalKeywords: 14500,
    organicTraffic: '190K',
    backlinks: '510K',
    tag: 'Enterprise',
  },
];

function CompetitorsPageContent() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'https://www.workcomposer.com/';
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams?.get('tab') || 'added';
  const tabTitle =
    tabParam === 'serp'
      ? 'SERP Competitors'
      : tabParam === 'sov'
      ? 'Share of Voice'
      : tabParam === 'visibility'
      ? 'Visibility Rating'
      : 'Added Competitors';

  // Common State
  const [showNotice, setShowNotice] = useState(true);
  const [addedCompetitors, setAddedCompetitors] = useState<CompetitorData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [isLimitsInfoOpen, setIsLimitsInfoOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // SERP Competitors Specific States matching Screenshot
  const [serpGroup, setSerpGroup] = useState('All groups');
  const [isSerpGroupOpen, setIsSerpGroupOpen] = useState(false);
  const [serpKeyword, setSerpKeyword] = useState('');
  const [highlightCompetitors, setHighlightCompetitors] = useState(false);
  const [displayMode, setDisplayMode] = useState<'URL' | 'DOMAIN'>('DOMAIN');
  const [filterUrl, setFilterUrl] = useState('');
  const [filterTag, setFilterTag] = useState('All tags');
  const [isFilterTagOpen, setIsFilterTagOpen] = useState(false);
  const [serpTopRange, setSerpTopRange] = useState<'100' | '50' | '30' | '20' | '10'>('100');
  const [serpEngine, setSerpEngine] = useState('India');
  const [isSerpEngineOpen, setIsSerpEngineOpen] = useState(false);
  const [isAdvancedSerpOpen, setIsAdvancedSerpOpen] = useState(false);
  const [hasSerpData, setHasSerpData] = useState(false);

  // Share of Voice Specific States matching User Screenshot
  const [sovSearchEngine, setSovSearchEngine] = useState('All search engines');
  const [isSovEngineOpen, setIsSovEngineOpen] = useState(false);
  const [sovKeywordSelection, setSovKeywordSelection] = useState('ALL KEYWORDS');
  const [isSovKeywordSelectionOpen, setIsSovKeywordSelectionOpen] = useState(false);
  const [sovDomainSearch, setSovDomainSearch] = useState('');
  const [hasSovData, setHasSovData] = useState(false);

  // Visibility Rating Specific States matching User Screenshots 1 & 2
  const [visSearchEngine, setVisSearchEngine] = useState('All search engines');
  const [isVisEngineOpen, setIsVisEngineOpen] = useState(false);
  const [activeVisMetric, setActiveVisMetric] = useState<'visibility' | 'forecast' | 'top10' | 'distribution'>('visibility');
  const [visDomainSearch, setVisDomainSearch] = useState('');
  const [hasVisData, setHasVisData] = useState(false);
  const [isVisFiltersOpen, setIsVisFiltersOpen] = useState(false);
  const [isVisColumnsOpen, setIsVisColumnsOpen] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddCompetitor = (comp: CompetitorData) => {
    if (addedCompetitors.length >= 5) {
      showToast('Maximum 5 competitors allowed for this project.');
      return;
    }
    if (addedCompetitors.some((c) => c.domain.toLowerCase() === comp.domain.toLowerCase())) {
      showToast(`${comp.domain} is already added.`);
      return;
    }
    setAddedCompetitors((prev) => [...prev, comp]);
    showToast(`Added ${comp.domain} to competitor tracking!`);
  };

  const handleAddCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customDomainInput.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!clean) return;
    if (addedCompetitors.length >= 5) {
      showToast('Maximum 5 competitors allowed for this project.');
      return;
    }
    const newComp: CompetitorData = {
      id: `comp-custom-${Date.now()}`,
      domain: clean,
      visibility: Math.floor(Math.random() * 40) + 30,
      avgPosition: Number((Math.random() * 8 + 5).toFixed(1)),
      commonKeywords: Math.floor(Math.random() * 30) + 15,
      totalKeywords: Math.floor(Math.random() * 20000) + 5000,
      organicTraffic: `${Math.floor(Math.random() * 300) + 50}K`,
      backlinks: `${Math.floor(Math.random() * 800) + 100}K`,
      tag: 'Custom Competitor',
    };
    setAddedCompetitors((prev) => [...prev, newComp]);
    setCustomDomainInput('');
    setIsAddModalOpen(false);
    showToast(`Added ${clean} to competitor tracking!`);
  };

  const handleRemoveCompetitor = (id: string, compDomain: string) => {
    setAddedCompetitors((prev) => prev.filter((c) => c.id !== id));
    showToast(`Removed ${compDomain} from competitors.`);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-12 select-none overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        {/* ========================================================================= */}
        {/* TOP BLUE NOTICE BANNER (1:1 Matching Screenshots) */}
        {/* ========================================================================= */}
        {showNotice && (
          <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#1B66FF] leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pr-4">
              <span className="w-4 h-4 rounded-full bg-[#1B66FF] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                i
              </span>
              {tabParam === 'visibility' ? (
                <p className="text-gray-700">
                  We collect every site in the top 10 for each tracked keyword and sort them by their search visibility score. Data is updated every time rankings are checked, and is stored for 30 days.
                </p>
              ) : tabParam === 'sov' ? (
                <p className="text-gray-700">
                  This section shows the shares of your site and its competitors in the total organic traffic provided by a particular set of keywords. Traffic calculation is based on every keyword&apos;s top 20 results in Google Desktop search engines.
                </p>
              ) : tabParam === 'serp' ? (
                <p className="text-gray-700">
                  This section contains brief information on the top 100 websites by each query tracked by you. If you want to track any website in more detail, add it to the{' '}
                  <Link
                    href="/competitors?tab=added"
                    className="text-[#1B66FF] hover:underline font-semibold cursor-pointer"
                  >
                    My Competitors tab
                  </Link>
                  .
                </p>
              ) : (
                <p className="text-gray-700">
                  You can add up to 5 competitors to your projects. You don&apos;t know who your competitors are? Check out the tabs{' '}
                  <Link
                    href="/competitors?tab=serp"
                    className="text-[#1B66FF] hover:underline font-semibold cursor-pointer"
                  >
                    SERP Competitors
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/competitors?tab=visibility"
                    className="text-[#1B66FF] hover:underline font-semibold cursor-pointer"
                  >
                    Visibility Rating
                  </Link>
                  .
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
              title="Close notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & METADATA BAR (Matching Screenshots) */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            {tabParam === 'added' && (
              <button
                type="button"
                onClick={() => router.push('/projects')}
                className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer bg-white shrink-0"
                title="Back to projects"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
              <span className="text-gray-600 font-medium">{domain}</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-gray-500">My Competitors</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-gray-700 font-medium">{tabTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal text-gray-600">
            <button
              type="button"
              onClick={() => setIsGuestLinkOpen(true)}
              className="text-[#1B66FF] hover:underline cursor-pointer"
            >
              Guest link
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#1B66FF] hover:underline cursor-pointer"
            >
              Feedback
            </button>
            <Link href="/notes" className="text-[#1B66FF] hover:underline">
              Notes (46)
            </Link>

            {/* Competitor limits pill badge - only on added tab */}
            {tabParam === 'added' && (
              <button
                type="button"
                onClick={() => setIsLimitsInfoOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200/80 rounded-full text-xs font-medium text-gray-700 cursor-pointer transition-colors"
                title="View competitor limits"
              >
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  Competitor limits:{' '}
                  <strong className="text-gray-900 font-bold">{addedCompetitors.length} / 5</strong>
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-[9px] font-serif italic">
                  i
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ADDED COMPETITORS */}
        {/* ========================================================================= */}
        {tabParam === 'added' && (
          <div>
            {addedCompetitors.length === 0 ? (
              /* Empty Hero State */
              <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 space-y-10 animate-in fade-in duration-200">
                <div className="text-center space-y-5">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#F43F5E] shadow-2xs">
                      <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                      </svg>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#1B66FF] shadow-2xs">
                      <div className="relative">
                        <Users className="w-7 h-7 stroke-[2.2]" />
                        <Search className="w-3.5 h-3.5 text-[#1B66FF] absolute -bottom-1 -right-1 stroke-[3] bg-[#EFF6FF] rounded-full" />
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-[#FFEDD5] flex items-center justify-center text-[#F97316] shadow-2xs">
                      <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                      Stay ahead by tracking your competitors
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Find your competitors and get insights to outrank them
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-xs font-bold px-7 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer uppercase tracking-wider hover:shadow-md active:scale-98"
                    >
                      FIND MY COMPETITORS
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1B66FF] flex items-center justify-center">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Track competitor rankings
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Monitor competitor performance in search results and spot ranking trends over time.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Evaluate traffic of your competitors
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Analyze traffic and keyword performance to know where you stand in your field.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        See competitors&apos; backlinks
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Explore top competitors&apos; backlink profiles to find new link-building opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[13px] font-bold text-gray-900">
                        Get insights on competition
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Discover what drives competitors&apos; rankings, performance, and visibility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Connected Added Competitors Table */
              <div className="px-6 py-6 max-w-[1400px] mx-auto space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Added Competitors</h1>
                    <p className="text-xs text-gray-500">
                      Tracking {addedCompetitors.length} of 5 competitor domains for {domain}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {addedCompetitors.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD COMPETITOR</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => showToast('Exporting competitors report to CSV...')}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs cursor-pointer uppercase flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>EXPORT</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">COMPETITOR DOMAIN</th>
                          <th className="py-3 px-4 text-center">TAG</th>
                          <th className="py-3 px-4 text-right">VISIBILITY SCORE</th>
                          <th className="py-3 px-4 text-right">AVG POSITION</th>
                          <th className="py-3 px-4 text-right">COMMON KEYWORDS</th>
                          <th className="py-3 px-4 text-right">ORGANIC TRAFFIC</th>
                          <th className="py-3 px-4 text-right">BACKLINKS</th>
                          <th className="py-3 px-4 text-center">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                        <tr className="bg-blue-50/30">
                          <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#1B66FF]" />
                            <span>workcomposer.com (Your website)</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-blue-600">32.4%</td>
                          <td className="py-3.5 px-4 text-right font-mono">14.2</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">48</td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-900">18.4K</td>
                          <td className="py-3.5 px-4 text-right font-mono text-gray-900">4.2K</td>
                          <td className="py-3.5 px-4 text-center text-gray-400 text-xs">—</td>
                        </tr>

                        {addedCompetitors.map((comp) => (
                          <tr key={comp.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              <a
                                href={`https://${comp.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 hover:text-[#1B66FF] hover:underline flex items-center gap-1"
                              >
                                {comp.domain}
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </a>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                {comp.tag}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-purple-600">
                              {comp.visibility}%
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono">{comp.avgPosition}</td>
                            <td className="py-3.5 px-4 text-right font-mono text-blue-600 font-bold">
                              {comp.commonKeywords}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-gray-900">
                              {comp.organicTraffic}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-gray-900">
                              {comp.backlinks}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCompetitor(comp.id, comp.domain)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove competitor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SERP COMPETITORS (1:1 Matching User Screenshot) */}
        {/* ========================================================================= */}
        {tabParam === 'serp' && (
          <div className="px-6 py-5 max-w-[1440px] mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Row 1 Controls: Group Dropdown | Search keyword | Highlight competitors | ADVANCED SERP ANALYSIS | EXPORT */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSerpGroupOpen(!isSerpGroupOpen)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5 fill-gray-700 text-gray-700" />
                    <span>{serpGroup}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isSerpGroupOpen && (
                    <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                      {['All groups', 'General', 'Brand'].map((grp) => (
                        <button
                          key={grp}
                          type="button"
                          onClick={() => {
                            setSerpGroup(grp);
                            setIsSerpGroupOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 cursor-pointer ${
                            serpGroup === grp ? 'font-bold text-[#1B66FF] bg-blue-50/50' : 'text-gray-700'
                          }`}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative w-64">
                  <input
                    type="text"
                    value={serpKeyword}
                    onChange={(e) => setSerpKeyword(e.target.value)}
                    placeholder="Search keyword"
                    className="w-full pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#1B66FF] bg-white shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setHighlightCompetitors(!highlightCompetitors);
                      showToast(
                        highlightCompetitors
                          ? 'Disabled competitor highlighting'
                          : 'Highlighting added competitors in SERP results'
                      );
                    }}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      highlightCompetitors ? 'bg-[#1B66FF]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        highlightCompetitors ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="select-none">Highlight competitors</span>
                  <span className="text-[11px] text-gray-400 italic font-serif cursor-help">i</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAdvancedSerpOpen(true)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-gray-600" />
                  <span className="tracking-wide uppercase text-[11px]">ADVANCED SERP ANALYSIS</span>
                  <span className="bg-[#10B981] text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs">
                    NEW
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Exporting top 100 SERP competitors...')}
                  className="bg-gray-200/80 hover:bg-gray-300/80 text-gray-500 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer uppercase tracking-wider transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>EXPORT</span>
                </button>
              </div>
            </div>

            {/* Row 2 Controls: "Not found" | Display toggle | Filter by URL | Filter by tags */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="text-xs text-gray-500 font-medium">
                Not found
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Display</span>
                  <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden shadow-2xs bg-white text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setDisplayMode('URL')}
                      className={`px-3 py-1 transition-colors cursor-pointer ${
                        displayMode === 'URL'
                          ? 'bg-[#4C4F69] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisplayMode('DOMAIN')}
                      className={`px-3 py-1 transition-colors cursor-pointer ${
                        displayMode === 'DOMAIN'
                          ? 'bg-[#4C4F69] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      DOMAIN
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Filter by URL</span>
                  <div className="relative w-40">
                    <input
                      type="text"
                      value={filterUrl}
                      onChange={(e) => setFilterUrl(e.target.value)}
                      placeholder="Insert URL"
                      className="w-full pl-3 pr-7 py-1 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#1B66FF] bg-white shadow-2xs"
                    />
                    <Search className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">Filter by tags</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterTagOpen(!isFilterTagOpen)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-1 flex items-center justify-between gap-3 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer min-w-28"
                    >
                      <span>{filterTag}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {isFilterTagOpen && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs">
                        {['All tags', 'Direct', 'Organic', 'Partners'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setFilterTag(tag);
                              setIsFilterTagOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 cursor-pointer ${
                              filterTag === tag ? 'font-bold text-[#1B66FF] bg-blue-50/50' : 'text-gray-700'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 Controls: TOP 100/50/30/20/10 | Engine Dropdown | Date Picker */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden shadow-2xs bg-white text-xs font-bold uppercase tracking-wider">
                {(['100', '50', '30', '20', '10'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSerpTopRange(r)}
                    className={`px-4 py-1.5 border-r last:border-r-0 border-gray-300 transition-colors cursor-pointer ${
                      serpTopRange === r
                        ? 'bg-[#4C4F69] text-white'
                        : 'text-gray-700 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    TOP {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSerpEngineOpen(!isSerpEngineOpen)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-bold text-blue-600">G</span>
                    <span className="text-sm">🇮🇳</span>
                    <span>{serpEngine}</span>
                    <span className="text-[10px] text-gray-500 font-bold">EN</span>
                    {isSerpEngineOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-500 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                    )}
                  </button>

                  {isSerpEngineOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                      <div
                        onClick={() => {
                          setSerpEngine('India');
                          setIsSerpEngineOpen(false);
                          showToast('Switched to Google India (EN)');
                        }}
                        className={`px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                          serpEngine === 'India' ? 'bg-gray-100/70 font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">G</span>
                          <span className="text-sm">🇮🇳</span>
                          <span>India</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">EN</span>
                      </div>
                      <div
                        onClick={() => {
                          setSerpEngine('United States');
                          setIsSerpEngineOpen(false);
                          showToast('Switched to Google United States (EN)');
                        }}
                        className="px-3 py-2 flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">G</span>
                          <span className="text-sm">🇺🇸</span>
                          <span>United States</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">EN</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer hover:bg-gray-50">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>29 Sep 2026 - 29 Sep 2026</span>
                </div>
              </div>
            </div>

            {/* Main Area: Centered "Not found" Large Text Matching Screenshot */}
            <div className="py-28 text-center space-y-2 select-none">
              <h2 className="text-[34px] font-normal text-gray-400 tracking-tight">
                Not found
              </h2>
              <button
                type="button"
                onClick={() => {
                  setHasSerpData(!hasSerpData);
                  showToast(hasSerpData ? 'Switched to clean state' : 'Loaded top 100 Google SERP competitor data');
                }}
                className="text-xs font-semibold text-[#1B66FF] hover:underline cursor-pointer pt-3 inline-block"
              >
                {hasSerpData ? 'Hide sample data' : '+ Preview Top 100 SERP Competitors list'}
              </button>
            </div>

            {/* Optional Top 100 Table when toggled */}
            {hasSerpData && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">POSITION</th>
                      <th className="py-3 px-4">{displayMode === 'DOMAIN' ? 'COMPETITOR DOMAIN' : 'URL IN SERP'}</th>
                      <th className="py-3 px-4 text-right">TOTAL QUERIES IN TOP {serpTopRange}</th>
                      <th className="py-3 px-4 text-right">VISIBILITY SCORE</th>
                      <th className="py-3 px-4 text-right">EST. TRAFFIC</th>
                      <th className="py-3 px-4 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {DEFAULT_SUGGESTIONS.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-500">#{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <span>{displayMode === 'DOMAIN' ? item.domain : `https://${item.domain}/employee-tracking`}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                          {item.totalKeywords.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-600">
                          {item.visibility}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{item.organicTraffic}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleAddCompetitor(item)}
                            className="text-xs font-semibold px-3 py-1 bg-blue-50 text-[#1B66FF] hover:bg-blue-100 rounded-md cursor-pointer"
                          >
                            + Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SHARE OF VOICE (1:1 Matching User Screenshot) */}
        {/* ========================================================================= */}
        {tabParam === 'sov' && (
          <div className="px-6 py-5 max-w-[1440px] mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Row 1: Search engine dropdown (All search engines) & Export button */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSovEngineOpen(!isSovEngineOpen)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-gray-600" />
                  <span>{sovSearchEngine}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                </button>

                {isSovEngineOpen && (
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                    {['All search engines', 'Google India (en)', 'Google US (en)', 'Google UK (en)'].map((eng) => (
                      <button
                        key={eng}
                        type="button"
                        onClick={() => {
                          setSovSearchEngine(eng);
                          setIsSovEngineOpen(false);
                          showToast(`Selected ${eng}`);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 cursor-pointer ${
                          sovSearchEngine === eng ? 'font-bold text-[#1B66FF] bg-blue-50/50' : 'text-gray-700'
                        }`}
                      >
                        <span>{eng}</span>
                        {sovSearchEngine === eng && <Check className="w-3.5 h-3.5 text-[#1B66FF]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => showToast('Exporting share of voice analysis...')}
                className="bg-gray-200/80 hover:bg-gray-300/80 text-gray-500 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer uppercase tracking-wider transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>EXPORT</span>
              </button>
            </div>

            {/* Row 2: Keyword selection full-width card matching Screenshot */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSovKeywordSelectionOpen(!isSovKeywordSelectionOpen)}
                className="w-full bg-white border border-gray-200/90 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-gray-900 tracking-tight">Keyword selection</span>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {sovKeywordSelection}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>

              {isSovKeywordSelectionOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-40 text-xs animate-in fade-in duration-100 max-w-sm">
                  {['ALL KEYWORDS', 'GENERAL', 'BRAND', 'FEATURES'].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setSovKeywordSelection(kw);
                        setIsSovKeywordSelectionOpen(false);
                        showToast(`Filtered by ${kw}`);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                        sovKeywordSelection === kw ? 'font-bold text-[#1B66FF] bg-blue-50/50' : 'text-gray-700'
                      }`}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Row 3: 2 Summary Cards (Left Total Traffic Forecast / Right 4 Metric Columns) Matching Screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card 1 (Left): TOTAL TRAFFIC FORECAST */}
              <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs flex flex-col justify-between min-h-[120px]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>TOTAL TRAFFIC FORECAST</span>
                  <span className="text-[10px] text-gray-400 italic font-serif cursor-help">i</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 pt-3">
                  {hasSovData ? '48,250' : 'N/A'}
                </div>
              </div>

              {/* Card 2 (Right): SHARE OF VOICE / TRAFFIC FORECAST / URLS IN TOP 20 / KEYWORDS IN TOP 20 */}
              <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-xl p-5 shadow-2xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  <div className="sm:pr-3 space-y-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>SHARE OF VOICE</span>
                      <span className="text-[10px] text-gray-400 italic font-serif cursor-help">i</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {hasSovData ? '14.8%' : 'N/A'}
                    </div>
                  </div>

                  <div className="sm:px-3 pt-3 sm:pt-0 space-y-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>TRAFFIC FORECAST</span>
                      <span className="text-[10px] text-gray-400 italic font-serif cursor-help">i</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {hasSovData ? '7,140' : 'N/A'}
                    </div>
                  </div>

                  <div className="sm:px-3 pt-3 sm:pt-0 space-y-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>URLS IN THE TOP 20</span>
                      <span className="text-[10px] text-gray-400 italic font-serif cursor-help">i</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {hasSovData ? '18' : 'N/A'}
                    </div>
                  </div>

                  <div className="sm:pl-3 pt-3 sm:pt-0 space-y-3">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>KEYWORDS IN THE TOP 20</span>
                      <span className="text-[10px] text-gray-400 italic font-serif cursor-help">i</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {hasSovData ? '42' : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Search domain input matching Screenshot */}
            <div className="pt-1">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  value={sovDomainSearch}
                  onChange={(e) => setSovDomainSearch(e.target.value)}
                  placeholder="Search domain"
                  className="w-full pl-3.5 pr-8 py-2 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#1B66FF] bg-white shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Row 5: Table Header matching Screenshot with active sorted column "SHARE OF VOICE" */}
            <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-gray-400 bg-gray-50/80">#</th>
                    <th className="py-3 px-4 text-gray-600 bg-gray-50/80">DOMAIN</th>
                    <th className="py-3 px-4 text-gray-600 bg-gray-50/80 text-right">URLS IN THE TOP 20</th>
                    <th className="py-3 px-4 text-gray-600 bg-gray-50/80 text-right">KEYWORDS IN THE TOP 20</th>
                    <th className="py-3 px-4 bg-[#3E4459] text-white text-right cursor-pointer">
                      <div className="flex items-center justify-end gap-1">
                        <span>SHARE OF VOICE</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-gray-600 bg-gray-50/80 text-right">TRAFFIC FORECAST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {!hasSovData && !sovDomainSearch ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No share of voice records to display.
                        <button
                          type="button"
                          onClick={() => {
                            setHasSovData(true);
                            showToast('Loaded real share of voice calculation data');
                          }}
                          className="block mx-auto mt-2 text-[#1B66FF] hover:underline font-semibold cursor-pointer"
                        >
                          + Preview live Share of Voice data
                        </button>
                      </td>
                    </tr>
                  ) : (
                    [
                      { id: 1, domain: 'workcomposer.com', urls: 18, kw: 42, sov: '14.8%', traffic: '7,140', isYou: true },
                      { id: 2, domain: 'hubstaff.com', urls: 28, kw: 64, sov: '28.4%', traffic: '13,700', isYou: false },
                      { id: 3, domain: 'timedoctor.com', urls: 24, kw: 52, sov: '22.1%', traffic: '10,660', isYou: false },
                      { id: 4, domain: 'desktime.com', urls: 19, kw: 45, sov: '18.6%', traffic: '8,970', isYou: false },
                      { id: 5, domain: 'teramind.com', urls: 15, kw: 36, sov: '15.2%', traffic: '7,330', isYou: false },
                    ]
                      .filter((row) =>
                        sovDomainSearch ? row.domain.toLowerCase().includes(sovDomainSearch.toLowerCase()) : true
                      )
                      .map((row) => (
                        <tr
                          key={row.id}
                          className={`hover:bg-gray-50/70 transition-colors ${
                            row.isYou ? 'bg-blue-50/30 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-gray-400 font-mono">{row.id}</td>
                          <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                            {row.isYou ? (
                              <span className="w-2 h-2 rounded-full bg-[#1B66FF]" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>{row.domain}</span>
                            {row.isYou && (
                              <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                                You
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{row.urls}</td>
                          <td className="py-3 px-4 text-right font-mono">{row.kw}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-purple-600 bg-purple-50/30">
                            {row.sov}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">{row.traffic}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VISIBILITY RATING (1:1 Matching User Screenshots 1 & 2) */}
        {/* ========================================================================= */}
        {tabParam === 'visibility' && (
          <div className="px-6 py-5 max-w-[1440px] mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Row 1: Search engine dropdown [✔ All search engines ⌃] with popover + Date [📅 29 Sep 2026] + Export */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Engine Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsVisEngineOpen(!isVisEngineOpen)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4 text-gray-600" />
                    <span>{visSearchEngine}</span>
                    {isVisEngineOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-500 ml-1" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                    )}
                  </button>

                  {/* Popover matching Screenshot 1 */}
                  {isVisEngineOpen && (
                    <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                      <div
                        onClick={() => {
                          setVisSearchEngine('India');
                          setIsVisEngineOpen(false);
                          showToast('Filtered by Google India');
                        }}
                        className="px-3 py-2 flex items-center justify-between text-gray-800 hover:bg-gray-50 font-semibold cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {/* Google 'G' icon */}
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
                          </svg>
                          <span className="text-sm">🇮🇳</span>
                          <span>India</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-bold uppercase">EN</span>
                      </div>
                      <div
                        onClick={() => {
                          setVisSearchEngine('All search engines');
                          setIsVisEngineOpen(false);
                        }}
                        className="px-3 py-2 flex items-center justify-between text-gray-700 hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCheck className="w-3.5 h-3.5 text-gray-500" />
                          <span>All search engines</span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-[#1B66FF]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Single Date Picker Button matching Screenshot 1 */}
                <div className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer hover:bg-gray-50">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>29 Sep 2026</span>
                </div>
              </div>

              {/* Export Button matching screenshot */}
              <button
                type="button"
                onClick={() => showToast('Exporting visibility rating data...')}
                className="bg-[#EAECEF] hover:bg-[#DFE2E6] text-gray-500 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer uppercase tracking-wider transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>EXPORT</span>
              </button>
            </div>

            {/* Top Chart / Metric Tabs Bar Card matching Screenshot 1 */}
            <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
              {/* Tab Bar */}
              <div className="grid grid-cols-4 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-center">
                <button
                  type="button"
                  onClick={() => setActiveVisMetric('visibility')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeVisMetric === 'visibility'
                      ? 'border-[#1B66FF] text-[#1B66FF]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  VISIBILITY
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisMetric('forecast')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeVisMetric === 'forecast'
                      ? 'border-[#1B66FF] text-[#1B66FF]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  TRAFFIC FORECAST
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisMetric('top10')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeVisMetric === 'top10'
                      ? 'border-[#1B66FF] text-[#1B66FF]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  % IN TOP 10
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisMetric('distribution')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeVisMetric === 'distribution'
                      ? 'border-[#1B66FF] text-[#1B66FF]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  COMPETITOR DISTRIBUTION
                </button>
              </div>

              {/* Chart Area / "No data" matching Screenshot 1 */}
              <div className="py-24 text-center">
                <span className="text-xs text-gray-500 font-normal">
                  No data
                </span>
              </div>
            </div>

            {/* Bottom Table Section matching Screenshot 1 & 2 */}
            <div className="space-y-3 pt-2">
              {/* Table Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Left: Search input */}
                <div className="relative w-64">
                  <input
                    type="text"
                    value={visDomainSearch}
                    onChange={(e) => setVisDomainSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#1B66FF] bg-white shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Right Action Buttons matching Screenshot */}
                <div className="flex items-center gap-2">
                  {/* Duplicate/Copy Icon Button */}
                  <button
                    type="button"
                    onClick={() => showToast('Copied table data to clipboard')}
                    className="p-1.5 bg-[#EAECEF] hover:bg-[#DFE2E6] border border-gray-300 rounded-lg text-gray-600 cursor-pointer transition-colors shadow-2xs"
                    title="Copy table data"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* FILTERS Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisFiltersOpen(!isVisFiltersOpen);
                      showToast('Toggled filter controls');
                    }}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer uppercase transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                    <span>FILTERS</span>
                  </button>

                  {/* COLUMNS Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisColumnsOpen(!isVisColumnsOpen);
                      showToast('Toggled column visibility');
                    }}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer uppercase transition-colors"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-gray-600" />
                    <span>COLUMNS</span>
                  </button>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input type="checkbox" className="rounded text-blue-600" />
                      </th>
                      <th className="py-3 px-4">DOMAINS</th>
                      <th className="py-3 px-4">TAGS</th>
                      <th className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span>VISIBILITY</span>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span>TRAFFIC FORECAST</span>
                          <span className="text-[10px] text-gray-400 italic font-serif cursor-help">i</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">KEYWORDS</th>
                      <th className="py-3 px-4 text-right">BACKLINKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!hasVisData && !visDomainSearch ? (
                      /* Empty state matching Screenshot 2 EXACTLY */
                      <tr>
                        <td colSpan={7} className="py-20 text-center">
                          <div className="space-y-2 max-w-sm mx-auto">
                            <Search className="w-9 h-9 text-[#2C3E50] stroke-[1.75] mx-auto" />
                            <div className="text-base font-bold text-gray-900">
                              No data
                            </div>
                            <p className="text-xs text-gray-500">
                              We are processing data. It will be available in a few minutes.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      /* Populated rows when previewed or searched */
                      DEFAULT_SUGGESTIONS.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-b-0">
                          <td className="py-3 px-3">
                            <input type="checkbox" className="rounded text-blue-600" />
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.domain}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {item.tag}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-purple-600">{item.visibility}%</td>
                          <td className="py-3 px-4 text-right font-mono">{item.organicTraffic}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">{item.totalKeywords.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono">{item.backlinks}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM FOOTER (Matching all Screenshots) */}
      {/* ========================================================================= */}
      <footer className="px-6 py-4 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs text-gray-500 select-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00A86B] flex items-center justify-center text-white text-[9px] font-black">
            SE
          </div>
          <span className="font-bold text-gray-800 text-xs">SE Ranking</span>
        </div>

        <div className="flex items-center gap-5 font-normal text-xs text-gray-500">
          <button
            type="button"
            onClick={() => setIsBugModalOpen(true)}
            className="hover:text-gray-900 cursor-pointer"
          >
            Report a bug
          </button>
          <Link href="/affiliate" className="hover:text-gray-900">
            Affiliates
          </Link>
          <Link href="/api-docs" className="hover:text-gray-900">
            API
          </Link>
          <Link href="/whats-new" className="hover:text-gray-900">
            What's new
          </Link>
          <Link href="/help" className="hover:text-gray-900">
            Help
          </Link>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* ALL MODALS */}
      {/* ========================================================================= */}

      {/* Advanced SERP Analysis Modal */}
      {isAdvancedSerpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1B66FF]" />
                <h3 className="text-sm font-bold text-gray-900">Advanced SERP Analysis</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedSerpOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Analyze SERP landscape dynamics and feature presence for all tracked keywords on Google India:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">Featured Snippets</span>
                <span className="font-mono font-bold text-blue-600">32% presence</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">People Also Ask (PAA)</span>
                <span className="font-mono font-bold text-emerald-600">86% presence</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">Knowledge Panels</span>
                <span className="font-mono font-bold text-purple-600">14% presence</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-gray-800">Sitelinks</span>
                <span className="font-mono font-bold text-amber-600">54% presence</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAdvancedSerpOpen(false)}
                className="px-5 py-2 bg-[#1B66FF] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Competitors Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1B66FF]" />
                <h3 className="text-sm font-bold text-gray-900">Add Competitors to Track</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Select recommended competitors or add any custom website URL to track keyword rankings side by side:
            </p>

            <form onSubmit={handleAddCustomDomain} className="flex gap-2">
              <input
                type="text"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="e.g. competitor.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#1B66FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Top Competitors for {domain}
              </span>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl max-h-52 overflow-y-auto">
                {DEFAULT_SUGGESTIONS.map((item) => {
                  const isAdded = addedCompetitors.some((c) => c.domain === item.domain);
                  return (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-900">{item.domain}</div>
                        <div className="text-[11px] text-gray-500">
                          Visibility: {item.visibility}% · {item.commonKeywords} common keywords
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCompetitor(item)}
                        disabled={isAdded || addedCompetitors.length >= 5}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          isAdded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-[#1B66FF] hover:bg-blue-100'
                        }`}
                      >
                        {isAdded ? 'Added' : '+ Track'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Limits Modal */}
      {isLimitsInfoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Competitor Limits</h3>
              <button
                type="button"
                onClick={() => setIsLimitsInfoOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your current subscription plan allows up to <strong>5 competitor domains</strong> per project.
              Upgrading allows up to 20 competitors for enterprise benchmarking.
            </p>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsLimitsInfoOpen(false)}
                className="px-4 py-2 bg-[#1B66FF] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Link Modal */}
      {isGuestLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Get access to guest links</h3>
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or team members to let them view competitor benchmarks without logging into the system.
            </p>
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;section=competitors
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641&section=competitors');
                  showToast('Guest link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-[#1B66FF] font-semibold hover:underline shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default function CompetitorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading competitors...</div>}>
      <CompetitorsPageContent />
    </Suspense>
  );
}
