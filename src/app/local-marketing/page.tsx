'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Plus,
  RefreshCw,
  Download,
  ChevronDown,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  Search,
  ExternalLink,
  Building,
  Store,
  MessageSquare,
  PhoneCall,
  Navigation,
  Globe,
  Star,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

// Real Location Dataset
interface LocationData {
  id: string;
  name: string;
  address: string;
  category: string;
  updatedDate: string;
  avgPosition: number;
  positionChange: number;
  topDistribution: {
    top1_3: { count: number; change: number };
    top4_5: { count: number; change: number };
    top7_10: { count: number; change: number };
    top11_15: { count: number; change: number };
    top16_19: { count: number; change: number };
    top20_plus: { count: number; change: number };
  };
  auditScore: number;
  auditIssues: {
    gbp: { red: number; yellow: number; blue: number };
    listings: { red: number; yellow: number; blue: number };
    reviews: { red: number; yellow: number; blue: number };
    total: number;
  };
  gbp: {
    totalViews: number;
    mobileSearchViews: number;
    mobileMapsViews: number;
    desktopSearchViews: number;
    desktopMapsViews: number;
    totalSearches: number;
    topKeywords: { keyword: string; count: number }[];
    websiteVisits: number;
    directionRequests: number;
    phoneCalls: number;
    messages: number;
  };
  listings: {
    found: number;
    totalDirectories: number;
    missingCount: number;
    napErrors: number;
    nameErrors: number;
    addressErrors: number;
    phoneErrors: number;
  };
  reviewsData: {
    avgRating: number;
    totalReviews: number;
    positive: number;
    neutral: number;
    negative: number;
    notRated: number;
    recommended: number;
    notRecommended: number;
    sources: { name: string; rating: number; count: number; icon: string }[];
  };
}

const LOCATIONS: LocationData[] = [
  {
    id: 'folk-osteria',
    name: 'Folk Osteria, Highland Dr., Hot...',
    address: 'Highland Dr., Hot Springs, AR 71901',
    category: 'Italian Restaurant',
    updatedDate: 'Sep-20,2026',
    avgPosition: 12.2,
    positionChange: 0.3,
    topDistribution: {
      top1_3: { count: 45, change: 6 },
      top4_5: { count: 46, change: 8 },
      top7_10: { count: 50, change: 3 },
      top11_15: { count: 78, change: 14 },
      top16_19: { count: 70, change: 2 },
      top20_plus: { count: 66, change: 10 },
    },
    auditScore: 86,
    auditIssues: {
      gbp: { red: 0, yellow: 0, blue: 1 },
      listings: { red: 15, yellow: 0, blue: 0 },
      reviews: { red: 6, yellow: 1, blue: 44 },
      total: 67,
    },
    gbp: {
      totalViews: 214538,
      mobileSearchViews: 63381,
      mobileMapsViews: 58190,
      desktopSearchViews: 83912,
      desktopMapsViews: 9055,
      totalSearches: 163761,
      topKeywords: [
        { keyword: 'food', count: 12381 },
        { keyword: 'pasta', count: 11619 },
        { keyword: 'italian', count: 5659 },
        { keyword: 'pizza near me', count: 4120 },
        { keyword: 'dinner downtown', count: 2890 },
      ],
      websiteVisits: 5571,
      directionRequests: 1148,
      phoneCalls: 746,
      messages: 1352,
    },
    listings: {
      found: 57,
      totalDirectories: 59,
      missingCount: 2,
      napErrors: 6,
      nameErrors: 2,
      addressErrors: 2,
      phoneErrors: 2,
    },
    reviewsData: {
      avgRating: 3.8,
      totalReviews: 60,
      positive: 35,
      neutral: 4,
      negative: 10,
      notRated: 11,
      recommended: 7,
      notRecommended: 2,
      sources: [
        { name: 'Google', rating: 3.56, count: 16, icon: 'G' },
        { name: 'Tripadvisor', rating: 3.78, count: 16, icon: '🦉' },
        { name: 'Facebook', rating: 4.33, count: 9, icon: 'f' },
      ],
    },
  },
  {
    id: 'apex-dental',
    name: 'Apex Dental Care, 5th Ave, New York',
    address: '350 5th Ave, New York, NY 10118',
    category: 'Dentist / Healthcare',
    updatedDate: 'Sep-24,2026',
    avgPosition: 8.4,
    positionChange: 1.2,
    topDistribution: {
      top1_3: { count: 82, change: 12 },
      top4_5: { count: 64, change: 5 },
      top7_10: { count: 41, change: -2 },
      top11_15: { count: 32, change: -4 },
      top16_19: { count: 21, change: 1 },
      top20_plus: { count: 18, change: -6 },
    },
    auditScore: 92,
    auditIssues: {
      gbp: { red: 0, yellow: 0, blue: 0 },
      listings: { red: 4, yellow: 1, blue: 2 },
      reviews: { red: 2, yellow: 2, blue: 18 },
      total: 29,
    },
    gbp: {
      totalViews: 189420,
      mobileSearchViews: 81200,
      mobileMapsViews: 62450,
      desktopSearchViews: 41100,
      desktopMapsViews: 4670,
      totalSearches: 142300,
      topKeywords: [
        { keyword: 'dentist manhattan', count: 18450 },
        { keyword: 'emergency dental', count: 14200 },
        { keyword: 'teeth whitening', count: 8900 },
        { keyword: 'invisalign near me', count: 5200 },
        { keyword: 'cosmetic dentist', count: 3410 },
      ],
      websiteVisits: 9840,
      directionRequests: 2410,
      phoneCalls: 1890,
      messages: 2150,
    },
    listings: {
      found: 58,
      totalDirectories: 59,
      missingCount: 1,
      napErrors: 2,
      nameErrors: 1,
      addressErrors: 1,
      phoneErrors: 0,
    },
    reviewsData: {
      avgRating: 4.6,
      totalReviews: 142,
      positive: 118,
      neutral: 14,
      negative: 5,
      notRated: 5,
      recommended: 32,
      notRecommended: 1,
      sources: [
        { name: 'Google', rating: 4.8, count: 94, icon: 'G' },
        { name: 'Yelp', rating: 4.4, count: 28, icon: 'Y' },
        { name: 'Healthgrades', rating: 4.7, count: 20, icon: 'H' },
      ],
    },
  },
];

export default function LocalMarketingSuitePage() {
  const [selectedLocationId, setSelectedLocationId] = useState('folk-osteria');
  const [selectedDateRange, setSelectedDateRange] = useState('All dates');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isConnectBannerDismissed, setIsConnectBannerDismissed] = useState(false);

  // Modals & Popovers
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isListingsModalOpen, setIsListingsModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Review Timeline Filter
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | '7D' | '1M' | '3M' | '6M' | '1Y'>('ALL');

  const currentLoc = LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0];

  const handleUpdateData = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      alert(`Updated rankings and GBP data for ${currentLoc.name}!`);
    }, 800);
  };

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `Location,${currentLoc.name}\n` +
      `Category,${currentLoc.category}\n` +
      `Average Position,${currentLoc.avgPosition}\n` +
      `Audit Score,${currentLoc.auditScore}/100\n` +
      `Total GBP Views,${currentLoc.gbp.totalViews}\n` +
      `Total GBP Searches,${currentLoc.gbp.totalSearches}\n` +
      `Business Listings Found,${currentLoc.listings.found}/${currentLoc.listings.totalDirectories}\n` +
      `NAP Errors,${currentLoc.listings.napErrors}\n` +
      `Average Review Rating,${currentLoc.reviewsData.avgRating}/5\n` +
      `Total Reviews,${currentLoc.reviewsData.totalReviews}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `local-seo-report-${currentLoc.id}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Review Scatter Plot Sources
  const scatterSources = [
    { name: 'City squares', color: '#9333EA' },
    { name: 'EZlocal', color: '#059669' },
    { name: 'Facebook', color: '#2563EB' },
    { name: 'FindOpen', color: '#0284C7' },
    { name: 'Google', color: '#16A34A' },
    { name: "Judy's Book", color: '#991B1B' },
    { name: 'N49', color: '#4B5563' },
    { name: 'ShowMeLocal', color: '#06B6D4' },
    { name: 'Tripadvisor', color: '#DB2777' },
    { name: 'WhereTo', color: '#4F46E5' },
  ];

  const timelineMonths = [
    'Oct 2025',
    'Nov 2025',
    'Dec 2025',
    'Jan 2026',
    'Feb 2026',
    'Mar 2026',
    'Apr 2026',
    'May 2026',
    'Jun 2026',
    'Jul 2026',
    'Aug 2026',
    'Sep 2026',
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] text-gray-900 min-h-screen">
      {/* Top Blue Secondary Navigation Sub-bar matching Screenshot 5 & Screenshot 1 */}
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
          <button className="px-3 py-1 rounded bg-white/20 text-white font-semibold shadow-xs shrink-0">
            All Locations
          </button>
        </div>
      </div>

      {/* Info Blue Alert Banner matching Screenshot 5 */}
      {!isBannerDismissed && (
        <div className="bg-[#EBF3FC] border-b border-[#CCE0F8] px-4 py-2.5 text-xs text-[#1E40AF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0B69FF] shrink-0" />
            <span>
              This tool manages local business data. It provides local grid rank tracking, listings &amp; reviews management, GBP posting, and more. You can try out its features using demo locations (these are not real locations). To use the tool,{' '}
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="text-[#0B69FF] underline font-semibold cursor-pointer"
              >
                add your own locations
              </button>
            </span>
          </div>
          <button
            onClick={() => setIsBannerDismissed(true)}
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
          <span className="hover:text-gray-900 cursor-pointer">Local Marketing</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-semibold">Overview</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Feedback modal: Thank you for sharing your thoughts on Local Marketing!')}
            className="text-gray-500 hover:text-[#0B69FF] transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
            <span>Location update limit: 0 / 3</span>
            <span
              className="cursor-pointer text-gray-400 hover:text-gray-600"
              title="Demo license includes 3 live location tracking updates."
            >
              ⓘ
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Controls Row matching Screenshot 5 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Overview</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Location updated: {currentLoc.updatedDate}</span>
            </div>

            {/* Switchers: Location Dropdown + Date Range Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {/* Location Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 font-medium flex items-center gap-2 hover:bg-gray-50 shadow-2xs cursor-pointer"
                >
                  <span>🇺🇸</span>
                  <span className="max-w-[200px] truncate">{currentLoc.name}</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                    Demo
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-1" />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      Demo &amp; Connected Locations
                    </div>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocationId(loc.id);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                          loc.id === currentLoc.id ? 'bg-blue-50/70 font-semibold text-[#0B69FF]' : 'text-gray-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{loc.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{loc.category}</p>
                        </div>
                        {loc.id === currentLoc.id && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 p-1.5">
                      <button
                        onClick={() => {
                          setIsLocationDropdownOpen(false);
                          setIsAddLocationModalOpen(true);
                        }}
                        className="w-full text-center text-xs font-bold text-[#0B69FF] hover:bg-blue-50 py-1.5 rounded transition-colors cursor-pointer"
                      >
                        + Add New Location
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 font-medium flex items-center gap-1.5 hover:bg-gray-50 shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>{selectedDateRange}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-0.5" />
                </button>

                {isDateDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
                    {['All dates', 'Last 7 days', 'Last 30 days', 'Last 90 days'].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setSelectedDateRange(range);
                          setIsDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
                          range === selectedDateRange ? 'bg-blue-50 text-[#0B69FF] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddLocationModalOpen(true)}
              className="bg-[#0B69FF] hover:bg-[#0957DB] text-white font-bold text-xs uppercase px-4 py-2 rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD LOCATION</span>
            </button>
            <button
              onClick={handleUpdateData}
              disabled={isUpdating}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3 py-2 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>UPDATE</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={handleExportData}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3 py-2 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>EXPORT</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 1: LOCAL RANKINGS                                   */}
        {/* ======================================================== */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Local Rankings</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
            {/* Left: Rankings Distribution Grid (6 sparklines) */}
            <div className="lg:col-span-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6">
              <div>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                  RANKINGS DISTRIBUTION
                </div>

                <div className="grid grid-cols-3 gap-y-4 gap-x-3">
                  {/* TOP 1-3 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 1-3</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">{currentLoc.topDistribution.top1_3.count}</span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        ▲ {currentLoc.topDistribution.top1_3.change}
                      </span>
                    </div>
                    <svg className="w-full h-5 text-amber-500 overflow-visible" viewBox="0 0 100 20">
                      <path
                        d="M0,15 Q25,8 50,14 T100,5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* TOP 4-5 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 4-5</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">{currentLoc.topDistribution.top4_5.count}</span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        ▲ {currentLoc.topDistribution.top4_5.change}
                      </span>
                    </div>
                    <svg className="w-full h-5 text-blue-500 overflow-visible" viewBox="0 0 100 20">
                      <path
                        d="M0,8 Q30,18 60,10 T100,16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* TOP 7-10 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 7-10</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">{currentLoc.topDistribution.top7_10.count}</span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        ▲ {currentLoc.topDistribution.top7_10.change}
                      </span>
                    </div>
                    <svg className="w-full h-5 text-lime-500 overflow-visible" viewBox="0 0 100 20">
                      <path
                        d="M0,16 Q25,18 55,7 T100,12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* TOP 11-15 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 11-15</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">
                        {currentLoc.topDistribution.top11_15.count}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        ▲ {currentLoc.topDistribution.top11_15.change}
                      </span>
                    </div>
                    <svg className="w-full h-5 text-purple-500 overflow-visible" viewBox="0 0 100 20">
                      <path
                        d="M0,12 Q30,6 60,15 T100,8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* TOP 16-19 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 16-19</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">
                        {currentLoc.topDistribution.top16_19.count}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        ▲ {currentLoc.topDistribution.top16_19.change}
                      </span>
                    </div>
                    <svg className="w-full h-5 text-orange-400 overflow-visible" viewBox="0 0 100 20">
                      <path
                        d="M0,14 Q30,16 65,8 T100,15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* TOP 20+ */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 20+</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900">
                        {currentLoc.topDistribution.top20_plus.count}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                        ▲ {currentLoc.topDistribution.top20_plus.change}
                      </span>
                    </div>
                    <svg className="w-full h-5 text-pink-500 overflow-visible" viewBox="0 0 100 20">
                      <path
                        d="M0,10 Q25,5 60,16 T100,9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => alert('Viewing detailed keyword ranking positions grid...')}
                  className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <span>⤓ VIEW ALL</span>
                </button>
              </div>
            </div>

            {/* Right: Overall Avg. Position Line Chart */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  OVERALL AVG. POSITION
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">{currentLoc.avgPosition}</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    ▲ {currentLoc.positionChange}
                  </span>
                </div>

                <div className="h-28 w-full relative flex flex-col justify-end">
                  <svg className="w-full h-20 text-blue-500 overflow-visible" viewBox="0 0 500 80">
                    <line x1="0" y1="10" x2="500" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />

                    <path
                      d="M0,45 L100,42 L200,40 L300,46 L400,43 L500,41"
                      fill="none"
                      stroke="#0B69FF"
                      strokeWidth="2.5"
                    />

                    <circle cx="0" cy="45" r="3.5" fill="#0B69FF" />
                    <circle cx="100" cy="42" r="3.5" fill="#0B69FF" />
                    <circle cx="200" cy="40" r="3.5" fill="#0B69FF" />
                    <circle cx="300" cy="46" r="3.5" fill="#0B69FF" />
                    <circle cx="400" cy="43" r="3.5" fill="#0B69FF" />
                    <circle cx="500" cy="41" r="3.5" fill="#0B69FF" />
                  </svg>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-2">
                    <span>Aug-30 2026</span>
                    <span>Sep-03 2026</span>
                    <span>Sep-07 2026</span>
                    <span>Sep-11 2026</span>
                    <span>Sep-15 2026</span>
                    <span>Sep-19 2026</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => alert('Viewing complete historical ranking movement...')}
                  className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <span>⤓ VIEW ALL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: LOCAL MARKETING AUDIT                            */}
        {/* ======================================================== */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Local Marketing Audit</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Health Score Circular Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 pr-0 md:pr-6">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">SCORE ⓘ</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#10B981"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * currentLoc.auditScore) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-emerald-600 font-bold">▲ 86</span>
                  <span className="text-2xl font-black text-gray-900 leading-none">{currentLoc.auditScore}</span>
                  <span className="text-[9px] text-gray-400 font-medium">OUT OF 100</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-600 mt-2 tracking-wide uppercase">HEALTHY</span>

              <div className="flex items-center gap-1.5 mt-2">
                {[...Array(9)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < 7 ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            {/* Audit Issues Blocks */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase">ISSUES</span>
                  <div className="text-xl font-bold text-gray-900">{currentLoc.auditIssues.total}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Google Business Profile */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Store className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold truncate">GOOGLE BUSINESS PROFILE</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold">
                    <span className="flex items-center gap-1 text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> {currentLoc.auditIssues.gbp.red}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> {currentLoc.auditIssues.gbp.yellow}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> {currentLoc.auditIssues.gbp.blue}
                    </span>
                  </div>
                </div>

                {/* 2. Business Listings */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold truncate">BUSINESS LISTINGS</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold">
                    <span className="flex items-center gap-1 text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> {currentLoc.auditIssues.listings.red}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> {currentLoc.auditIssues.listings.yellow}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> {currentLoc.auditIssues.listings.blue}
                    </span>
                  </div>
                </div>

                {/* 3. Reviews */}
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold truncate">REVIEWS</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold">
                    <span className="flex items-center gap-1 text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> {currentLoc.auditIssues.reviews.red}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> {currentLoc.auditIssues.reviews.yellow}
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> {currentLoc.auditIssues.reviews.blue}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <span>⤓ VIEW ALL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connect a real location banner matching Screenshot 5 */}
        {!isConnectBannerDismissed && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setIsConnectBannerDismissed(true)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1 max-w-2xl">
              <h3 className="text-sm font-bold text-gray-900">Connect a real location</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                You're viewing data for a demo, imaginary business. Add a real local business (e.g., restaurant, car wash, locksmith) to view and manage its data. Start by connecting its Google Business Profile.
              </p>
            </div>
            <button
              onClick={() => setIsAddLocationModalOpen(true)}
              className="bg-[#0B69FF] hover:bg-[#0957DB] text-white font-bold text-xs uppercase px-4 py-2 rounded shrink-0 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD LOCATION</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 3: GOOGLE BUSINESS PROFILE                          */}
        {/* ======================================================== */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-gray-900">Google Business Profile</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-gray-200 pb-6">
            <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                VIEWS BY PLATFORM AND DEVICE ⓘ
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#FF5722" strokeWidth="10" strokeDasharray="74 251" strokeDashoffset="0" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="10" strokeDasharray="68 251" strokeDashoffset="-74" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#3B82F6" strokeWidth="10" strokeDasharray="98 251" strokeDashoffset="-142" fill="none" />
                    <circle cx="50" cy="50" r="40" stroke="#FBBF24" strokeWidth="10" strokeDasharray="11 251" strokeDashoffset="-240" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold text-gray-900 font-mono">
                      {currentLoc.gbp.totalViews.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722]" />
                      <span className="text-gray-700">MOBILE SEARCH VIEWS</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-gray-900">
                        {currentLoc.gbp.mobileSearchViews.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-[11px]">29.5%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span className="text-gray-700">MOBILE MAPS VIEWS</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-gray-900">
                        {currentLoc.gbp.mobileMapsViews.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-[11px]">27.1%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                      <span className="text-gray-700">DESKTOP SEARCH VIEWS</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-gray-900">
                        {currentLoc.gbp.desktopSearchViews.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-[11px]">39.1%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                      <span className="text-gray-700">DESKTOP MAPS VIEWS</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-gray-900">
                        {currentLoc.gbp.desktopMapsViews.toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-[11px]">4.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  SEARCHES BY KEYWORDS
                </span>
                <div className="text-xl font-bold text-gray-900 font-mono mb-4">
                  {currentLoc.gbp.totalSearches.toLocaleString()}
                </div>

                <div className="space-y-2 text-xs divide-y divide-gray-100">
                  {currentLoc.gbp.topKeywords.slice(0, 3).map((kw, i) => (
                    <div key={i} className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono">{i + 1}.</span>
                        <span className="font-medium text-gray-800">{kw.keyword}</span>
                      </div>
                      <span className="font-mono text-gray-600 font-semibold">{kw.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 8 Metric Grid Cards matching Screenshot 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* 1. VIEWS */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">VIEWS</span>
                <div className="text-lg font-bold text-gray-900 font-mono">
                  {currentLoc.gbp.totalViews.toLocaleString()}
                </div>
              </div>
              <div className="h-10 flex items-end gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-0.5">
                    <div className="bg-emerald-400 rounded-xs" style={{ height: `${Math.sin(i) * 8 + 10}px` }} />
                    <div className="bg-purple-500 rounded-xs" style={{ height: `${Math.cos(i) * 6 + 12}px` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SEARCHES */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SEARCHES</span>
                <div className="text-lg font-bold text-gray-900 font-mono">
                  {currentLoc.gbp.totalSearches.toLocaleString()}
                </div>
              </div>
              <svg className="w-full h-10 text-blue-500 overflow-visible" viewBox="0 0 100 30">
                <path
                  d="M0,15 Q20,5 40,20 T80,10 T100,18"
                  fill="none"
                  stroke="#0B69FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* 3. MOBILE MAPS VS SEARCH VIEWS */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                MOBILE MAPS VS. SEARCH VIEWS ⓘ
              </span>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" stroke="#FF5722" strokeWidth="4" strokeDasharray="53 100" fill="none" />
                    <circle cx="18" cy="18" r="14" stroke="#10B981" strokeWidth="4" strokeDasharray="47 100" strokeDashoffset="-53" fill="none" />
                  </svg>
                  <span className="absolute text-[9px] font-bold font-mono">121,571</span>
                </div>
                <div className="text-[10px] space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF5722]" />
                    <span className="text-gray-500">Search: 52.7%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-gray-500">Maps: 47.3%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. DESKTOP MAPS VS SEARCH VIEWS */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                DESKTOP MAPS VS. SEARCH VIEWS ⓘ
              </span>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" stroke="#3B82F6" strokeWidth="4" strokeDasharray="90 100" fill="none" />
                    <circle cx="18" cy="18" r="14" stroke="#FBBF24" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-90" fill="none" />
                  </svg>
                  <span className="absolute text-[9px] font-bold font-mono">92,967</span>
                </div>
                <div className="text-[10px] space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <span className="text-gray-500">Search: 90.3%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                    <span className="text-gray-500">Maps: 9.7%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. WEBSITE VISITS */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WEBSITE VISITS</span>
                <div className="text-lg font-bold text-gray-900 font-mono">
                  {currentLoc.gbp.websiteVisits.toLocaleString()}
                </div>
              </div>
              <div className="h-10 flex items-end gap-1">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-lime-500 rounded-xs"
                    style={{ height: `${(i % 5) * 5 + 12}px` }}
                  />
                ))}
              </div>
            </div>

            {/* 6. DIRECTION REQUESTS */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">DIRECTION REQUESTS</span>
                <div className="text-lg font-bold text-gray-900 font-mono">
                  {currentLoc.gbp.directionRequests.toLocaleString()}
                </div>
              </div>
              <div className="h-10 flex items-end gap-1">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-pink-500 rounded-xs"
                    style={{ height: `${(i % 4) * 6 + 10}px` }}
                  />
                ))}
              </div>
            </div>

            {/* 7. PHONE CALLS */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PHONE CALLS</span>
                <div className="text-lg font-bold text-gray-900 font-mono">
                  {currentLoc.gbp.phoneCalls.toLocaleString()}
                </div>
              </div>
              <div className="h-10 flex items-end gap-1">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-slate-800 rounded-xs"
                    style={{ height: `${(i % 6) * 4 + 14}px` }}
                  />
                ))}
              </div>
            </div>

            {/* 8. MESSAGES */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MESSAGES</span>
                <div className="text-lg font-bold text-gray-900 font-mono">
                  {currentLoc.gbp.messages.toLocaleString()}
                </div>
              </div>
              <div className="h-10 flex items-end gap-1">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-orange-500 rounded-xs"
                    style={{ height: `${(i % 5) * 5 + 10}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Opening full Google Business Profile analytics and insights...')}
              className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>➔ VIEW ALL</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 4: BUSINESS LISTINGS (Exact match of Screenshot 1)   */}
        {/* ======================================================== */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Business Listings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Mentions Found */}
            <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  MENTIONS FOUND ⓘ
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#0B69FF] font-mono">{currentLoc.listings.found}</span>
                  <span className="text-lg text-gray-400 font-mono">/{currentLoc.listings.totalDirectories}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsListingsModalOpen(true)}
                  className="text-gray-700 hover:text-[#0B69FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span>VIEW WHOLE LIST</span>
                </button>
                <span className="text-xs text-gray-400 font-medium">
                  in {currentLoc.listings.missingCount} missing directories
                </span>
              </div>
            </div>

            {/* Card 2: NAP Errors */}
            <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  NAP ERRORS ⓘ
                </span>
                <div className="flex items-center gap-8">
                  <span className="text-3xl font-bold text-gray-900 font-mono">
                    {currentLoc.listings.napErrors}
                  </span>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase">
                        <span>T</span>
                        <span>NAME</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 font-mono">
                        {currentLoc.listings.nameErrors}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase">
                        <span>📍</span>
                        <span>ADDRESS</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 font-mono">
                        {currentLoc.listings.addressErrors}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase">
                        <span>📞</span>
                        <span>PHONE</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 font-mono">
                        {currentLoc.listings.phoneErrors}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsListingsModalOpen(true)}
                  className="text-gray-700 hover:text-[#0B69FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span>VIEW ERRORS</span>
                </button>
                <span className="text-xs text-gray-400 font-medium">in 57 directories</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARD 5: REVIEWS (Exact match of Screenshot 1)            */}
        {/* ======================================================== */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-gray-900">Reviews</h2>

          {/* Row 1: Overview & Top Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-gray-200 pb-6">
            {/* Overview Box */}
            <div className="lg:col-span-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  OVERVIEW ⓘ
                </span>

                <div className="flex items-start gap-6 py-2">
                  {/* Rating Big Number */}
                  <div className="space-y-1">
                    <span className="text-4xl font-black text-[#0B69FF] font-mono leading-none">
                      {currentLoc.reviewsData.avgRating.toFixed(1)}
                    </span>
                    <div className="flex items-center text-amber-400 text-xs">
                      ★★★★☆
                    </div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">
                      NUMBER OF REVIEWS: {currentLoc.reviewsData.totalReviews}
                    </span>
                  </div>

                  {/* Horizontal Bar Meters */}
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-gray-400 uppercase w-28">POSITIVE</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="font-mono text-gray-700 text-xs font-semibold w-6 text-right">
                        {currentLoc.reviewsData.positive}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-gray-400 uppercase w-28">NEUTRAL</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '15%' }} />
                      </div>
                      <span className="font-mono text-gray-700 text-xs font-semibold w-6 text-right">
                        {currentLoc.reviewsData.neutral}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-gray-400 uppercase w-28">NEGATIVE</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '25%' }} />
                      </div>
                      <span className="font-mono text-gray-700 text-xs font-semibold w-6 text-right">
                        {currentLoc.reviewsData.negative}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-gray-400 uppercase w-28">NOT RATED</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '20%' }} />
                      </div>
                      <span className="font-mono text-gray-700 text-xs font-semibold w-6 text-right">
                        {currentLoc.reviewsData.notRated}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-gray-400 uppercase w-28">RECOMMENDED</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '18%' }} />
                      </div>
                      <span className="font-mono text-gray-700 text-xs font-semibold w-6 text-right">
                        {currentLoc.reviewsData.recommended}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-gray-400 uppercase w-28">NOT RECOMMENDED</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: '8%' }} />
                      </div>
                      <span className="font-mono text-gray-700 text-xs font-semibold w-6 text-right">
                        {currentLoc.reviewsData.notRecommended}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="text-gray-700 hover:text-[#0B69FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span>VIEW ALL</span>
                </button>
              </div>
            </div>

            {/* Top Sources Box */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                  TOP SOURCES ⓘ
                </span>

                <div className="flex flex-wrap items-center gap-4 py-2">
                  {currentLoc.reviewsData.sources.map((s, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 flex items-center gap-3 text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs shadow-2xs">
                        {s.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 flex items-center gap-1">
                          <span className="text-amber-400">★</span> {s.rating}
                        </span>
                        <span className="text-gray-400 flex items-center gap-0.5">
                          <span>🏳️</span> {s.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="text-gray-700 hover:text-[#0B69FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span>VIEW ALL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Insights - What customers say about your business */}
          <div className="space-y-4 border-b border-gray-200 pb-6">
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                INSIGHTS ⓘ
              </span>
              <p className="text-xs text-gray-600 font-medium">What customers say about your business</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 5.0 ★ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    5.0 <span className="text-amber-400">★</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Frequency in reviews</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { term: 'italian', freq: 7 },
                    { term: 'servicio', freq: 3 },
                    { term: 'breakfast', freq: 2 },
                    { term: 'calidad', freq: 2 },
                    { term: 'vista', freq: 1 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded text-xs flex items-center justify-between"
                    >
                      <span className="truncate">{item.term}</span>
                      <span className="font-mono font-bold text-[11px]">{item.freq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4.0 ★ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    4.0 <span className="text-amber-400">★</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Frequency in reviews</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { term: 'restaurant', freq: 6 },
                    { term: 'waiter', freq: 4 },
                    { term: 'waiters', freq: 4 },
                    { term: 'order', freq: 4 },
                    { term: 'experience', freq: 3 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-lime-50 text-lime-800 px-2.5 py-1 rounded text-xs flex items-center justify-between"
                    >
                      <span className="truncate">{item.term}</span>
                      <span className="font-mono font-bold text-[11px]">{item.freq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3.0 ★ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    3.0 <span className="text-amber-400">★</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Frequency in reviews</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { term: 'food', freq: 10 },
                    { term: 'pasta', freq: 6 },
                    { term: 'place', freq: 5 },
                    { term: 'service', freq: 5 },
                    { term: 'people', freq: 3 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded text-xs flex items-center justify-between"
                    >
                      <span className="truncate">{item.term}</span>
                      <span className="font-mono font-bold text-[11px]">{item.freq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2.0 ★ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    2.0 <span className="text-amber-400">★</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Frequency in reviews</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { term: 'customer service', freq: 2 },
                    { term: 'recepcionista', freq: 1 },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-orange-50 text-orange-800 px-2.5 py-1 rounded text-xs flex items-center justify-between"
                    >
                      <span className="truncate">{item.term}</span>
                      <span className="font-mono font-bold text-[11px]">{item.freq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.0 ★ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    1.0 <span className="text-amber-400">★</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Frequency in reviews</span>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-red-50 text-red-800 px-2.5 py-1 rounded text-xs flex items-center justify-between">
                    <span className="truncate">more than an hour</span>
                    <span className="font-mono font-bold text-[11px]">1</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsReviewsModalOpen(true)}
                className="text-gray-700 hover:text-[#0B69FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                <span>VIEW ALL</span>
              </button>
            </div>
          </div>

          {/* Row 3: Reviews Timeline / Scatter Plot matching Screenshot 1 */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  REVIEWS ⓘ
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Time Range Pills */}
                <div className="flex items-center gap-1 font-semibold text-gray-600">
                  {(['ALL', '7D', '1M', '3M', '6M', '1Y'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimelineFilter(r)}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        timelineFilter === r
                          ? 'bg-blue-50 text-[#0B69FF] font-bold'
                          : 'hover:text-gray-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="text-gray-300">|</div>

                <div className="text-gray-600 flex items-center gap-1">
                  <span>GROUPED BY:</span>
                  <button className="text-[#0B69FF] font-semibold flex items-center gap-0.5">
                    MONTHS <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Sources Filter */}
                <div className="border border-gray-300 rounded px-2.5 py-1 bg-white flex items-center gap-1.5 shadow-2xs">
                  <span className="bg-gray-900 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    10
                  </span>
                  <span className="font-semibold text-gray-800">All Sources Selected</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Scatter Matrix Grid */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-x-auto">
              <div className="min-w-[700px] space-y-4">
                {/* Scatter Rows (5.0, 4.0, 3.0, 2.0, 1.0, Thumbs Up, Thumbs Down, Neutral) */}
                {[
                  { label: '5.0 ★', dots: [1, 2, 4, 6, 8, 10, 11] },
                  { label: '4.0 ★', dots: [2, 5, 6, 7, 9, 10, 11] },
                  { label: '3.0 ★', dots: [0, 4, 7, 11] },
                  { label: '2.0 ★', dots: [1, 2, 3, 5, 8] },
                  { label: '1.0 ★', dots: [6, 7, 8, 11] },
                  { label: '👍', dots: [0, 1, 5, 6, 8, 10] },
                  { label: '👎', dots: [0, 8, 9] },
                  { label: '★ ?', dots: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
                ].map((row, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-4 text-xs">
                    <span className="w-10 font-bold text-gray-600 text-right shrink-0">{row.label}</span>
                    <div className="flex-1 flex items-center justify-between relative h-6 border-b border-gray-100">
                      {timelineMonths.map((m, mIdx) => {
                        const hasDot = row.dots.includes(mIdx);
                        const source = scatterSources[(mIdx + rIdx) % scatterSources.length];
                        return (
                          <div key={mIdx} className="flex-1 flex items-center justify-center">
                            {hasDot && (
                              <span
                                className="w-2.5 h-2.5 rounded-full shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                                style={{ backgroundColor: source.color }}
                                title={`${row.label} review from ${source.name} in ${m}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* X Axis Months */}
                <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono pt-2">
                  <span className="w-10 shrink-0" />
                  <div className="flex-1 flex items-center justify-between">
                    {timelineMonths.map((m, idx) => (
                      <span key={idx} className="flex-1 text-center truncate">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sources Color Legend matching Screenshot 1 */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 text-[11px]">
                  {scatterSources.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: s.color }} />
                      <span className="text-gray-600">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsReviewsModalOpen(true)}
                className="text-gray-700 hover:text-[#0B69FF] text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                <span>VIEW ALL (119)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODALS: ADD LOCATION, AUDIT, LISTINGS, REVIEWS           */}
      {/* ======================================================== */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0B69FF]" />
                <h3 className="font-bold text-base text-gray-900">Add New Business Location</h3>
              </div>
              <button onClick={() => setIsAddLocationModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Connect your Google Business Profile via OAuth or enter your business details to monitor local map rankings and NAP citations.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bella Italia Bistro"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Business Category</label>
                <input
                  type="text"
                  placeholder="e.g. Italian Restaurant, Dental Clinic, Law Firm"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main Street, Suite 400, Chicago, IL"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setIsAddLocationModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Success! New location connected to SE Ranking Local Marketing.');
                  setIsAddLocationModalOpen(false);
                }}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0957DB] text-white text-xs font-bold rounded shadow-xs cursor-pointer"
              >
                CONNECT LOCATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">
                Local Marketing Audit Issues ({currentLoc.auditIssues.total})
              </h3>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900">15 Inconsistent Business Citations (NAP)</span>
                  <span className="bg-red-200 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Critical</span>
                </div>
                <p className="text-gray-600">
                  Address formatting differs across Yelp, YellowPages, and Apple Maps compared to your Google Business Profile.
                </p>
                <button
                  onClick={() => alert('Citation auto-sync dispatched to 40+ directory aggregators.')}
                  className="text-xs font-bold text-red-700 underline pt-1 cursor-pointer"
                >
                  Auto-sync directory citations →
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">6 Unanswered Negative Reviews</span>
                  <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Warning</span>
                </div>
                <p className="text-gray-600">
                  Responding to customer reviews within 24 hours boosts local 3-pack rankings by up to 18%.
                </p>
                <button
                  onClick={() => alert('Generating AI response drafts for unanswered reviews...')}
                  className="text-xs font-bold text-amber-700 underline pt-1 cursor-pointer"
                >
                  Generate AI review responses →
                </button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Missing Holiday Hours on Google Maps</span>
                  <span className="bg-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Notice</span>
                </div>
                <p className="text-gray-600">
                  Ensure special opening hours for upcoming national holidays are confirmed on your GBP profile.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-bold hover:bg-gray-800 cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings Modal */}
      {isListingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">
                Directory Citations &amp; Mentions ({currentLoc.listings.found} / {currentLoc.listings.totalDirectories})
              </h3>
              <button onClick={() => setIsListingsModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs divide-y divide-gray-100">
              {[
                { name: 'Google Business Profile', status: 'Synced', nap: 'Consistent' },
                { name: 'Apple Maps', status: 'Synced', nap: 'Consistent' },
                { name: 'Bing Places', status: 'Synced', nap: 'Consistent' },
                { name: 'Yelp', status: 'Inconsistent Address', nap: 'Error' },
                { name: 'YellowPages', status: 'Inconsistent Phone', nap: 'Error' },
                { name: 'Tripadvisor', status: 'Synced', nap: 'Consistent' },
                { name: 'Foursquare', status: 'Missing', nap: 'Not Found' },
                { name: 'Better Business Bureau', status: 'Synced', nap: 'Consistent' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.nap === 'Consistent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.nap === 'Error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsListingsModalOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-bold hover:bg-gray-800 cursor-pointer"
              >
                Close Listings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">
                Customer Reviews Feed (119 Reviews)
              </h3>
              <button onClick={() => setIsReviewsModalOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {[
                { author: 'Marco Rossi', rating: 5, source: 'Google', text: 'Exceptional authentic Italian pasta and warm ambiance! The waiter was attentive and polite.', date: 'Yesterday' },
                { author: 'Sarah Jenkins', rating: 4, source: 'Tripadvisor', text: 'Great dinner downtown. Wine selection is extensive, though wait times can be slightly long on weekends.', date: '3 days ago' },
                { author: 'David Kim', rating: 1, source: 'Facebook', text: 'Waited more than an hour for our main course without updates from the staff.', date: 'Sep 12, 2026' },
              ].map((rev, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{rev.author}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{rev.date} • {rev.source}</span>
                  </div>
                  <div className="text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsReviewsModalOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded text-xs font-bold hover:bg-gray-800 cursor-pointer"
              >
                Close Reviews
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Bar matching Screenshot 1 */}
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
