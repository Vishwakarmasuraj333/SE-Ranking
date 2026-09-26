'use client';

import React, { useState, Suspense, useMemo } from 'react';
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
  RefreshCw,
  Bell,
  SlidersHorizontal,
  Table as TableIcon,
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

interface AnchorTextItem {
  anchor: string;
  refDomains: number;
  backlinks: number;
  dofollowCount: number;
  dofollowPercent: number;
  firstSeen: string;
  lastSeen: string;
}

interface PageItem {
  url: string;
  backlinks: number;
  refDomains: number;
}

interface IpItem {
  ip: string;
  country: string;
  flag: string;
  refDomains: number;
  backlinks: number;
}

const INITIAL_ANCHORS: AnchorTextItem[] = [
  {
    anchor: 'Zohosocial.com',
    refDomains: 26,
    backlinks: 33,
    dofollowCount: 10,
    dofollowPercent: 45.5,
    firstSeen: '09 Mar 2024',
    lastSeen: '12 Sep 2026',
  },
  {
    anchor: 'Social',
    refDomains: 7,
    backlinks: 8,
    dofollowCount: 4,
    dofollowPercent: 18.2,
    firstSeen: '17 Jun 2025',
    lastSeen: '23 Sep 2026',
  },
  {
    anchor: 'Zoho Social',
    refDomains: 3,
    backlinks: 7,
    dofollowCount: 6,
    dofollowPercent: 27.3,
    firstSeen: '01 Oct 2024',
    lastSeen: '17 Aug 2026',
  },
  {
    anchor: 'Probar gratis',
    refDomains: 1,
    backlinks: 3,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '01 Sep 2025',
    lastSeen: '09 Sep 2026',
  },
  {
    anchor: 'Probar Zoho Social gratis',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '01 Sep 2025',
    lastSeen: '09 Sep 2026',
  },
  {
    anchor: 'https://www.zohosocial.com',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '17 Jun 2026',
    lastSeen: '07 Sep 2026',
  },
  {
    anchor: 'No text',
    refDomains: 1,
    backlinks: 2,
    dofollowCount: 2,
    dofollowPercent: 9.1,
    firstSeen: '12 Dec 2025',
    lastSeen: '11 Sep 2026',
  },
  {
    anchor: 'Tool #5: Zoho Social',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 1,
    dofollowPercent: 4.5,
    firstSeen: '07 Dec 2025',
    lastSeen: '08 Jun 2026',
  },
  {
    anchor: 'ZohoSocial',
    refDomains: 1,
    backlinks: 7,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '21 Aug 2025',
    lastSeen: '13 Sep 2026',
  },
  {
    anchor: 'ZohoСоциальные',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '13 Sep 2025',
    lastSeen: '20 Nov 2025',
  },
  {
    anchor: 'ZohoSocisal',
    refDomains: 1,
    backlinks: 1,
    dofollowCount: 0,
    dofollowPercent: 0,
    firstSeen: '04 Sep 2025',
    lastSeen: '12 Nov 2025',
  },
];

const INITIAL_PAGES: PageItem[] = [
  { url: 'https://zohosocial.com/', backlinks: 36, refDomains: 30 },
  { url: 'http://zohosocial.com/', backlinks: 24, refDomains: 6 },
  { url: 'https://www.zohosocial.com/', backlinks: 2, refDomains: 2 },
  { url: 'http://www.zohosocial.com/', backlinks: 3, refDomains: 2 },
];

const INITIAL_IPS: IpItem[] = [
  { ip: '195.20.79.178', country: 'US', flag: '🇺🇸', refDomains: 15, backlinks: 18 },
  { ip: '45.13.58.15', country: 'ES', flag: '🇪🇸', refDomains: 3, backlinks: 4 },
  { ip: '24.199.114.38', country: 'US', flag: '🇺🇸', refDomains: 3, backlinks: 7 },
  { ip: '152.53.38.228', country: 'ES', flag: '🇪🇸', refDomains: 2, backlinks: 2 },
  { ip: '192.124.249.68', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '74.208.236.184', country: 'CA', flag: '🇨🇦', refDomains: 1, backlinks: 2 },
  { ip: '23.227.38.65', country: 'GB', flag: '🇬🇧', refDomains: 1, backlinks: 1 },
  { ip: '46.202.168.212', country: 'FR', flag: '🇫🇷', refDomains: 1, backlinks: 10 },
  { ip: '217.182.220.21', country: 'FR', flag: '🇫🇷', refDomains: 1, backlinks: 6 },
  { ip: '192.64.119.145', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '70.70.21.241', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '172.67.212.72', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 2 },
  { ip: '66.29.152.156', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '104.21.21.200', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '92.113.15.67', country: 'DE', flag: '🇩🇪', refDomains: 1, backlinks: 1 },
  { ip: '216.150.1.65', country: 'NL', flag: '🇳🇱', refDomains: 1, backlinks: 1 },
  { ip: '82.25.125.136', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
  { ip: '194.59.167.151', country: 'BG', flag: '🇧🇬', refDomains: 1, backlinks: 1 },
  { ip: '118.139.177.45', country: 'CL', flag: '🇨🇱', refDomains: 1, backlinks: 1 },
  { ip: '35.219.200.15', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 4 },
  { ip: '198.54.117.210', country: 'US', flag: '🇺🇸', refDomains: 1, backlinks: 1 },
];

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
  const [domainInput, setDomainInput] = useState('zohosocial.com');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState<'CURRENT' | '7D' | '1M' | '3M' | '6M'>('7D');
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  // Subtabs matching Screenshots 3, 4, 5
  type SubTabType = 'overview' | 'backlinks' | 'referring-domains' | 'anchor-texts' | 'pages' | 'ips';
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('anchor-texts');

  // Filter states
  const [analyzedDomain, setAnalyzedDomain] = useState('zohosocial.com');
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'dofollow' | 'nofollow'>('all');
  const [anchorFilterPill, setAnchorFilterPill] = useState<'all' | '1-word' | '2-word' | '3-word' | '4-word'>('all');
  const [searchFilterText, setSearchFilterText] = useState('');
  const [ipFilterTab, setIpFilterTab] = useState<'ips' | 'subnets'>('ips');

  const handleSearch = (targetDomain?: string) => {
    const domain = (targetDomain || domainInput || activeProject?.domain || 'zohosocial.com').trim();
    if (!domain) return;

    setIsAnalyzing(true);
    setAnalyzedDomain(domain);

    setTimeout(() => {
      setIsAnalyzing(false);
      setHasSearched(true);
    }, 400);
  };

  // Filtered Anchors
  const filteredAnchors = useMemo(() => {
    return INITIAL_ANCHORS.filter((item) => {
      const matchSearch = item.anchor.toLowerCase().includes(searchFilterText.toLowerCase());
      if (!matchSearch) return false;

      const wordCount = item.anchor.trim().split(/\s+/).length;
      if (anchorFilterPill === '1-word') return wordCount === 1;
      if (anchorFilterPill === '2-word') return wordCount === 2;
      if (anchorFilterPill === '3-word') return wordCount === 3;
      if (anchorFilterPill === '4-word') return wordCount >= 4;
      return true;
    });
  }, [searchFilterText, anchorFilterPill]);

  // Filtered Pages
  const filteredPages = useMemo(() => {
    return INITIAL_PAGES.filter((p) =>
      p.url.toLowerCase().includes(searchFilterText.toLowerCase())
    );
  }, [searchFilterText]);

  // Filtered IPs
  const filteredIps = useMemo(() => {
    return INITIAL_IPS.filter((item) =>
      item.ip.includes(searchFilterText) || item.country.toLowerCase().includes(searchFilterText.toLowerCase())
    );
  }, [searchFilterText]);

  const getSubTabTitle = () => {
    switch (activeSubTab) {
      case 'anchor-texts':
        return 'Anchor Texts';
      case 'pages':
        return 'Pages';
      case 'ips':
        return 'IPs';
      case 'referring-domains':
        return 'Referring Domains';
      case 'backlinks':
        return 'Backlinks';
      case 'overview':
      default:
        return 'Overview';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-60px)] text-gray-900 select-none pb-16 flex flex-col justify-between relative">
      <div>
        {/* Top Dismissible Blue Notice Banner matching Screenshots 3, 4, 5 */}
        {showNoticeBanner && (
          <div className="bg-[#EBF3FF] border-b border-[#CBE0FF] px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#1E3A8A]">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#0B69FF] shrink-0" />
              <span>
                You may have noticed some changes in the number of backlinks and DT value. This is
                because we removed many outdated, disruptive backlinks from the new database. Our new
                data is more precise and reliable.
              </span>
            </div>
            <button
              onClick={() => setShowNoticeBanner(false)}
              className="text-[#1E3A8A]/60 hover:text-[#1E3A8A] ml-3 cursor-pointer shrink-0"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Breadcrumbs & Limits Row matching Screenshots 3, 4, 5 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 font-medium">{analyzedDomain}</span>
              <span>&gt;</span>
              <span className="text-gray-600 font-medium">Backlink Checker</span>
              <span>&gt;</span>
              <span className="text-gray-900 font-bold">{getSubTabTitle()}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-900 hover:underline cursor-pointer">
                Feedback
              </button>
              <button className="text-gray-600 hover:text-gray-900 hover:underline cursor-pointer">
                Notes (46)
              </button>
              <div className="flex items-center gap-1 text-gray-700 bg-amber-50/80 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>Account limit 0 / 10</span>
                <span className="text-gray-400">ⓘ</span>
              </div>
            </div>
          </div>

          {/* Page Title & Actions Row matching Screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>{getSubTabTitle()} / {analyzedDomain}</span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>Email notification: <strong className="text-gray-700 font-semibold">Bi-weekly</strong></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6A] shadow-xs inline-block" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">Last check: September 23, 2026</span>
              <button
                onClick={() => handleSearch()}
                className="bg-[#0B69FF] hover:bg-[#005FE0] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>UPDATE REPORT</span>
              </button>
            </div>
          </div>

          {/* Subtabs Bar matching Screenshots 3, 4, 5 */}
          <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-2 pt-1 rounded-t-xl overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'backlinks', label: 'Backlinks' },
              { id: 'referring-domains', label: 'Referring Domains' },
              { id: 'anchor-texts', label: 'Anchor Texts' },
              { id: 'pages', label: 'Pages' },
              { id: 'ips', label: 'IPs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as SubTabType);
                  setSearchFilterText('');
                }}
                className={`px-4 py-2.5 transition-all border-b-2 font-bold whitespace-nowrap cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-[#0B69FF] text-[#0B69FF] bg-blue-50/30'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dismissible Info Box matching Screenshots 3, 4, 5 */}
          {showInfoBanner && (
            <div className="p-3.5 bg-white border border-[#0B69FF]/20 rounded-xl relative text-xs text-gray-700 flex items-start gap-3 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-[#0B69FF]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-[#0B69FF]" />
              </div>
              <p className="leading-relaxed pr-6 text-gray-600">
                Get a full list of backlinks for any domain, complete with detailed data on each link.
                This tool is perfect for analysing any website&apos;s backlink profiles, including
                your competitors&apos; sites. In just minutes, you&apos;ll receive a report
                detailing every backlink, including information on the originating domains and pages
                they link to. With this data, you can get the full picture of any backlink profile and
                effectively evaluate the value and quality of each backlink.
              </p>
              <button
                onClick={() => setShowInfoBanner(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: ANCHOR TEXTS (MATCHING SCREENSHOT 3) */}
          {/* ======================================================== */}
          {activeSubTab === 'anchor-texts' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              {/* Header Filter Row matching Screenshot 3 */}
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {filteredAnchors.length} anchor texts
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <a
                      href={`/api/export?format=csv&domain=${analyzedDomain}&type=anchors`}
                      download
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </a>
                  </div>
                </div>

                {/* Filter Pills matching Screenshot */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <button
                      onClick={() => setAnchorFilterPill('all')}
                      className={`px-3 py-1.5 rounded text-[11px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                        anchorFilterPill === 'all'
                          ? 'bg-[#374151] text-white'
                          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      ANCHOR TEXTS
                    </button>
                    {(['1-word', '2-word', '3-word', '4-word'] as const).map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setAnchorFilterPill(pill)}
                        className={`px-2.5 py-1.5 rounded text-[11px] uppercase font-bold tracking-wide transition-colors cursor-pointer ${
                          anchorFilterPill === pill
                            ? 'bg-[#374151] text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pill.toUpperCase()} TERMS
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        const q = prompt('Filter anchor texts by keyword:', searchFilterText);
                        if (q !== null) setSearchFilterText(q);
                      }}
                      className="px-2.5 py-1.5 border border-gray-200 rounded text-[11px] uppercase font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>+ FILTER</span>
                      {searchFilterText && (
                        <span className="bg-blue-100 text-blue-800 px-1 rounded text-[10px]">
                          &quot;{searchFilterText}&quot;
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer font-semibold uppercase text-[11px]">
                      <span>PRESETS</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table matching Screenshot */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">ANCHOR TEXT</th>
                      <th className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 cursor-pointer">
                          REF.DOMAINS <ChevronDown className="w-3 h-3 text-gray-400" />
                        </span>
                      </th>
                      <th className="p-3 text-center">BACKLINKS</th>
                      <th className="p-3 text-center min-w-[140px]">DOFOLLOW</th>
                      <th className="p-3">FIRST SEEN</th>
                      <th className="p-3">LAST SEEN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAnchors.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-3 font-semibold text-gray-900 max-w-xs truncate">
                          {item.anchor}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{item.refDomains}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{item.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-semibold text-xs text-gray-800 w-4 text-right">
                              {item.dofollowCount}
                            </span>
                            <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden flex shrink-0">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${item.dofollowPercent}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-gray-500 w-10 text-left">
                              {item.dofollowPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.firstSeen}</td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{item.lastSeen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table pagination matching Screenshot 3 */}
              <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Showing 1-{filteredAnchors.length} of {filteredAnchors.length}</span>
                <div className="flex items-center gap-2">
                  <span className="border border-gray-200 rounded px-2 py-0.5 text-gray-700 bg-gray-50">
                    20 v
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PAGES (MATCHING SCREENSHOT 4) */}
          {/* ======================================================== */}
          {activeSubTab === 'pages' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              {/* Header Filter Row matching Screenshot 4 */}
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {filteredPages.length} pages
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Filter row matching Screenshot 4 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="URL or domain"
                        value={searchFilterText}
                        onChange={(e) => setSearchFilterText(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs placeholder:text-gray-400 w-56 sm:w-72 focus:outline-hidden focus:border-[#0B69FF]"
                      />
                    </div>
                    <button className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                      <Filter className="w-3 h-3" />
                      <span>Filter</span>
                    </button>
                  </div>

                  <button className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                    <span>Presets</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Table matching Screenshot 4 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">URL</th>
                      <th className="p-3 text-center">Backlinks</th>
                      <th className="p-3 text-center">Ref.Domains</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPages.map((page, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-3 font-semibold text-[#0B69FF]">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 hover:underline"
                          >
                            <Globe2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{page.url}</span>
                          </a>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{page.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{page.refDomains}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Showing 1-{filteredPages.length} of {filteredPages.length}</span>
                <span className="border border-gray-200 rounded px-2 py-0.5 text-gray-700 bg-gray-50">
                  20 v
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: IPs (MATCHING SCREENSHOT 5) */}
          {/* ======================================================== */}
          {activeSubTab === 'ips' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              {/* Header Filter Row matching Screenshot 5 */}
              <div className="p-3.5 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    {filteredIps.length} referring ips
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <TableIcon className="w-3 h-3" />
                      <span>Columns</span>
                    </button>
                    <button className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Filter row matching Screenshot 5 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        onClick={() => setIpFilterTab('ips')}
                        className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                          ipFilterTab === 'ips' ? 'bg-[#374151] text-white' : 'text-gray-600'
                        }`}
                      >
                        IPS
                      </button>
                      <button
                        onClick={() => setIpFilterTab('subnets')}
                        className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                          ipFilterTab === 'subnets' ? 'bg-[#374151] text-white' : 'text-gray-600'
                        }`}
                      >
                        SUBNETS
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search IP..."
                        value={searchFilterText}
                        onChange={(e) => setSearchFilterText(e.target.value)}
                        className="px-2.5 py-1 border border-gray-300 rounded text-xs placeholder:text-gray-400 w-36 sm:w-48 focus:outline-hidden focus:border-[#0B69FF]"
                      />
                    </div>
                  </div>

                  <button className="px-2.5 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                    <span>Presets</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Table matching Screenshot 5 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">IP</th>
                      <th className="p-3 text-center">Ref.Domains</th>
                      <th className="p-3 text-center">Backlinks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredIps.map((row, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                        <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-base leading-none">{row.flag}</span>
                          <span className="font-mono text-xs">{row.ip}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{row.refDomains}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs">
                            <span>{row.backlinks}</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination matching Screenshot 5 */}
              <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    &lt;
                  </button>
                  <button className="px-2.5 py-1 bg-[#374151] text-white rounded font-bold cursor-pointer">
                    1
                  </button>
                  <button className="px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    2
                  </button>
                  <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                    &gt;
                  </button>
                  <span className="ml-2">Go to page:</span>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-12 px-2 py-0.5 border border-gray-300 rounded text-center text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="border border-gray-200 rounded px-2 py-0.5 text-gray-700 bg-gray-50">
                    20 v
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4, 5, 6: OVERVIEW & BACKLINKS & REFERRING DOMAINS */}
          {/* ======================================================== */}
          {(activeSubTab === 'overview' || activeSubTab === 'backlinks' || activeSubTab === 'referring-domains') && (
            <div className="space-y-5">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="text-xs text-gray-500">Domain Trust</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">68 / 100</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#0B69FF] h-full" style={{ width: '68%' }} />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="text-xs text-gray-500">Total Backlinks</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">13,920</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+18.4% last month</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="text-xs text-gray-500">Referring Domains</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">1,480</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">+64 new domains</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="text-xs text-gray-500">Dofollow Ratio</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">84%</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-xs text-gray-800">New &amp; lost referring domains</span>
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
          <button className="hover:underline text-gray-600 cursor-pointer">Report a bug</button>
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
