'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Info,
  X,
  Play,
  TrendingUp,
  Globe2,
  Anchor,
  FileText,
  ExternalLink,
  Download,
  Filter,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/components/providers/AppProviders';

interface BacklinkItem {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  anchor: string;
  domainTrust: number;
  pageTrust: number;
  type: 'Dofollow' | 'Nofollow';
  firstSeen: string;
  lastSeen: string;
}

const mockChartData7D = [
  { date: 'Sep 23', newDomains: 18, lostDomains: -8 },
  { date: 'Sep 24', newDomains: 24, lostDomains: -12 },
  { date: 'Sep 25', newDomains: 15, lostDomains: -6 },
  { date: 'Sep 26', newDomains: 9, lostDomains: -3 },
  { date: 'Sep 27', newDomains: 6, lostDomains: -2 },
  { date: 'Sep 28', newDomains: 19, lostDomains: -7 },
  { date: 'Sep 29', newDomains: 28, lostDomains: -11 },
];

const mockChartData1M = [
  { date: 'Week 1', newDomains: 92, lostDomains: -38 },
  { date: 'Week 2', newDomains: 110, lostDomains: -45 },
  { date: 'Week 3', newDomains: 84, lostDomains: -29 },
  { date: 'Week 4', newDomains: 142, lostDomains: -51 },
];

function BacklinkCheckerContent() {
  const searchParams = useSearchParams();
  const { activeProject } = useApp();

  const [scope, setScope] = useState('*.DOMAIN.COM/*');
  const [domainInput, setDomainInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState<'CURRENT' | '7D' | '1M' | '3M' | '6M'>('7D');
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // Analysis result state
  const [analyzedDomain, setAnalyzedDomain] = useState('');
  const [backlinksList, setBacklinksList] = useState<BacklinkItem[]>([]);
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'dofollow' | 'nofollow'>('all');

  const handleSearch = (targetDomain?: string) => {
    const domain = (targetDomain || domainInput || activeProject?.domain || 'zohosocial.com').trim();
    if (!domain) return;

    setIsAnalyzing(true);
    setAnalyzedDomain(domain);

    setTimeout(() => {
      // Deterministic generation based on domain
      const generatedBacklinks: BacklinkItem[] = [
        {
          id: 'bl-1',
          sourceUrl: `https://techcrunch.com/2026/08/social-media-management-tools-benchmark/`,
          targetUrl: `https://${domain}/features/scheduler`,
          anchor: `${domain} social scheduler suite`,
          domainTrust: 93,
          pageTrust: 78,
          type: 'Dofollow',
          firstSeen: '2026-08-12',
          lastSeen: '2026-09-24',
        },
        {
          id: 'bl-2',
          sourceUrl: `https://forbes.com/advisor/business/software/best-marketing-apps/`,
          targetUrl: `https://${domain}/`,
          anchor: 'learn more at ' + domain,
          domainTrust: 91,
          pageTrust: 82,
          type: 'Dofollow',
          firstSeen: '2026-07-19',
          lastSeen: '2026-09-25',
        },
        {
          id: 'bl-3',
          sourceUrl: `https://hubspot.com/marketing/social-media-trends-2026`,
          targetUrl: `https://${domain}/resources/guides`,
          anchor: 'social media publishing platform',
          domainTrust: 89,
          pageTrust: 74,
          type: 'Dofollow',
          firstSeen: '2026-06-04',
          lastSeen: '2026-09-22',
        },
        {
          id: 'bl-4',
          sourceUrl: `https://g2.com/products/${domain.replace(/\.[^/.]+$/, '')}/reviews`,
          targetUrl: `https://${domain}/pricing`,
          anchor: `${domain} pricing and reviews`,
          domainTrust: 88,
          pageTrust: 79,
          type: 'Nofollow',
          firstSeen: '2026-05-14',
          lastSeen: '2026-09-25',
        },
        {
          id: 'bl-5',
          sourceUrl: `https://capterra.com/p/189201/social-suite/`,
          targetUrl: `https://${domain}/features/analytics`,
          anchor: 'visit official site',
          domainTrust: 86,
          pageTrust: 71,
          type: 'Nofollow',
          firstSeen: '2026-04-10',
          lastSeen: '2026-09-21',
        },
        {
          id: 'bl-6',
          sourceUrl: `https://searchenginejournal.com/enterprise-seo-platforms/`,
          targetUrl: `https://${domain}/case-studies`,
          anchor: 'case studies from ' + domain,
          domainTrust: 85,
          pageTrust: 69,
          type: 'Dofollow',
          firstSeen: '2026-08-30',
          lastSeen: '2026-09-25',
        },
      ];

      setBacklinksList(generatedBacklinks);
      setIsAnalyzing(false);
      setHasSearched(true);
    }, 600);
  };

  const filteredBacklinks = backlinksList.filter((b) => {
    if (activeReportTab === 'dofollow') return b.type === 'Dofollow';
    if (activeReportTab === 'nofollow') return b.type === 'Nofollow';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-16 flex flex-col justify-between">
      <div>
        {/* Top Notice Banner matching Screenshot 5 */}
        {showNoticeBanner && (
          <div className="bg-[#EBF3FF] border-b border-[#CBE0FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#1E3A8A]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0B69FF] shrink-0" />
              <span>
                You may have noticed some changes in the number of backlinks and DT value. This is
                because we removed many outdated, disruptive backlinks from the new database. Our new
                data is more precise and reliable.
              </span>
            </div>
            <button
              onClick={() => setShowNoticeBanner(false)}
              className="text-[#1E3A8A]/60 hover:text-[#1E3A8A] ml-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-5 space-y-5">
          {/* Breadcrumb & Limit Badge */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 font-medium">Backlink Checker</span>
              <span>&gt;</span>
              <span className="text-gray-900 font-semibold">
                {hasSearched ? analyzedDomain : 'All Reports'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Account limit 0 / 10</span>
              <span className="text-gray-400 cursor-help" title="Daily backlink check credits">
                ⓘ
              </span>
            </div>
          </div>

          {/* Info Card matching Screenshot 5 */}
          {showInfoBanner && (
            <div className="p-4 bg-white border border-[#0B69FF]/20 rounded-xl relative text-xs text-gray-700 flex items-start gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#0B69FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-[#0B69FF]" />
              </div>
              <div className="pr-6 space-y-1">
                <p className="leading-relaxed">
                  Get a full list of backlinks for any domain, complete with detailed data on each link.
                  This tool is perfect for analyzing any website&apos;s backlink profiles, including
                  your competitors&apos; sites. In just minutes, you&apos;ll receive a report
                  detailing every backlink, including information on the originating domains and pages
                  they link to. With this data, you can get the full picture of any backlink profile and
                  effectively evaluate the value and quality of each backlink.
                </p>
              </div>
              <button
                onClick={() => setShowInfoBanner(false)}
                className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search Hero Card matching Screenshot 5 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-2xs space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Backlink Checker</h1>
              <p className="text-xs text-gray-500 mt-1">
                Get a complete list of backlinks from any domain, each evaluated for major SEO parameters
              </p>
            </div>

            {/* Input Form */}
            <div className="max-w-2xl mx-auto flex items-center shadow-xs rounded-lg border border-gray-300 overflow-hidden focus-within:border-[#0B69FF] focus-within:ring-1 focus-within:ring-[#0B69FF]">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="bg-gray-50 text-xs font-medium text-gray-700 px-3 py-2.5 border-r border-gray-300 focus:outline-hidden"
              >
                <option value="*.DOMAIN.COM/*">*.DOMAIN.COM/*</option>
                <option value="URL">URL</option>
                <option value="DOMAIN.COM/*">DOMAIN.COM/*</option>
              </select>

              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter domain name"
                className="flex-1 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden"
              />

              <button
                onClick={() => handleSearch()}
                disabled={isAnalyzing}
                className="bg-[#0B69FF] hover:bg-[#005FE0] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isAnalyzing ? (
                  <span>Analyzing...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
              <span className="text-gray-400">Suggestions</span>
              {['zohosocial.com', 'seranking.com', 'coursera.org'].map((sugg) => (
                <button
                  key={sugg}
                  onClick={() => {
                    setDomainInput(sugg);
                    handleSearch(sugg);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Results View if searched */}
          {hasSearched ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Domain Overview KPI Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                    Domain Trust (DT)
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-gray-900">76</span>
                    <span className="text-xs font-bold text-emerald-600">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#0B69FF] h-full rounded-full" style={{ width: '76%' }} />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                    Total Backlinks
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-gray-900">1,420,890</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">
                    +1,240 new in 30d
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                    Referring Domains
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-gray-900">18,450</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium mt-1">
                    From 112 unique countries
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-2xs">
                  <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                    Dofollow / Nofollow
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-gray-900">84%</span>
                    <span className="text-xs text-gray-500">/ 16%</span>
                  </div>
                  <div className="w-full bg-amber-400 h-1.5 rounded-full mt-2 overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>

              {/* Backlinks Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-900">
                      Backlinks for {analyzedDomain} ({filteredBacklinks.length})
                    </span>
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        onClick={() => setActiveReportTab('all')}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          activeReportTab === 'all' ? 'bg-white shadow-2xs text-[#0B69FF]' : 'text-gray-600'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActiveReportTab('dofollow')}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          activeReportTab === 'dofollow' ? 'bg-white shadow-2xs text-emerald-700' : 'text-gray-600'
                        }`}
                      >
                        Dofollow
                      </button>
                      <button
                        onClick={() => setActiveReportTab('nofollow')}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          activeReportTab === 'nofollow' ? 'bg-white shadow-2xs text-amber-700' : 'text-gray-600'
                        }`}
                      >
                        Nofollow
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/export?format=csv&domain=${analyzedDomain}&type=backlinks`}
                      download
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </a>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-gray-200">
                    <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Source URL &amp; Anchor</th>
                        <th className="p-3">Target URL</th>
                        <th className="p-3 text-center">DT</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3">First Seen</th>
                        <th className="p-3">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBacklinks.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 max-w-sm">
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[#0B69FF] hover:underline flex items-center gap-1 truncate"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{item.sourceUrl}</span>
                            </a>
                            <div className="text-[11px] text-gray-600 mt-1 italic">
                              &ldquo;{item.anchor}&rdquo;
                            </div>
                          </td>
                          <td className="p-3 text-gray-700 max-w-xs truncate font-mono text-[11px]">
                            {item.targetUrl}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-50 text-[#0B69FF]">
                              {item.domainTrust}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.type === 'Dofollow'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{item.firstSeen}</td>
                          <td className="p-3 text-gray-500">{item.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Educational & Marketing Showcase matching Screenshots 6 & 7 */
            <div className="space-y-8">
              {/* Video Tutorial Section matching Screenshot 6 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-3">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900">Video tutorial</h2>
                  <p className="text-xs text-gray-500">
                    Learn how to use our Backlink Checker with this video tutorial
                  </p>
                </div>

                {/* Video Card */}
                <div className="max-w-2xl mx-auto rounded-xl border border-gray-200 overflow-hidden bg-gray-900 text-white relative shadow-md group cursor-pointer aspect-video flex flex-col justify-between p-4">
                  {/* Mock video content */}
                  <div className="flex items-center justify-between text-xs opacity-90">
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wider text-xs">SE Ranking</span>
                      <span className="bg-[#0B69FF] text-[9px] font-bold px-1.5 py-0.5 rounded">
                        GETTING STARTED
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-300">3:38</div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xs border-2 border-white/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0B69FF] transition-all">
                      <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">How to analyze &amp; monitor backlinks</h3>
                    <div className="flex items-center gap-4 text-[11px] text-gray-300 mt-1">
                      <span>• Total backlinks: 13.9M</span>
                      <span>• Referring IPs: 256</span>
                      <span>• Toxicity backlinks: 0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Angles Showcase matching Screenshots 6 & 7 */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-gray-900">
                    Check backlinks from all possible angles
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Column interactive feature tabs */}
                  <div className="md:col-span-6 space-y-2.5">
                    {[
                      {
                        title:
                          'Check the dynamics of new & lost website backlinks, as well as the dynamics of referring domains',
                        desc: 'Track backlink velocity day-over-day to discover marketing spikes and disavow harmful links.',
                      },
                      {
                        title:
                          'Discover which regions most links are coming from (based on referring IPs and subnets)',
                        desc: 'Map international domain distribution to verify geographic relevance.',
                      },
                      {
                        title:
                          'Analyze the anchor text distribution across referring domains and backlinks',
                        desc: 'Detect keyword stuffing patterns and natural branded anchor profile health.',
                      },
                      {
                        title: 'Find out which pages are linked to the most',
                        desc: 'Discover your highest-value link magnets and optimize internal link authority passing.',
                      },
                    ].map((feature, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveFeatureTab(idx)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          activeFeatureTab === idx
                            ? 'border-[#0B69FF] bg-blue-50/40 text-gray-900 shadow-2xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-gray-900 leading-snug">
                          {feature.title}
                        </h4>
                        {activeFeatureTab === idx && (
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            {feature.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Right Column Chart Showcase */}
                  <div className="md:col-span-6 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-xs text-gray-800">New &amp; lost domains</span>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-600">
                        {(['CURRENT', '7D', '1M', '3M', '6M'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setChartTimeframe(t)}
                            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                              chartTimeframe === t
                                ? 'bg-gray-900 text-white'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartTimeframe === '1M' ? mockChartData1M : mockChartData7D}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                            formatter={(value: any) => [Math.abs(Number(value)), 'Domains']}
                          />
                          <Bar dataKey="newDomains" name="New domains" fill="#22C55E" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="lostDomains" name="Lost domains" fill="#F97316" radius={[0, 0, 4, 4]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-gray-600 pt-1 border-t">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#22C55E]" />
                        <span>New domains</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#F97316]" />
                        <span>Lost domains</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card matching Screenshot 7 */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-2xs space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Start your first analysis</h3>
                </div>

                <div className="max-w-2xl mx-auto flex items-center shadow-xs rounded-lg border border-gray-300 overflow-hidden focus-within:border-[#0B69FF]">
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="bg-gray-50 text-xs font-medium text-gray-700 px-3 py-2.5 border-r border-gray-300 focus:outline-hidden"
                  >
                    <option value="*.DOMAIN.COM/*">*.DOMAIN.COM/*</option>
                    <option value="URL">URL</option>
                    <option value="DOMAIN.COM/*">DOMAIN.COM/*</option>
                  </select>

                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter domain name"
                    className="flex-1 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden"
                  />

                  <button
                    onClick={() => handleSearch()}
                    className="bg-[#0B69FF] hover:bg-[#005FE0] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
                  <span className="text-gray-400">Suggestions</span>
                  {['zohosocial.com', 'seranking.com', 'coursera.org'].map((sugg) => (
                    <button
                      key={sugg}
                      onClick={() => {
                        setDomainInput(sugg);
                        handleSearch(sugg);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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

export default function BacklinkCheckerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Backlink Checker...</div>}>
      <BacklinkCheckerContent />
    </Suspense>
  );
}
