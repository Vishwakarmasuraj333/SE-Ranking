'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Compass,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  Trash2,
  X,
  Share2,
  ChevronDown,
  ArrowRight,
  Filter,
  Sparkles,
  Layers,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

interface InsightItem {
  id: string;
  keyword: string;
  type: 'quick_win' | 'cannibalization' | 'serp_feature' | 'rank_drop';
  typeLabel: string;
  currentRank: number;
  rankChange: number;
  searchVolume: number;
  searchEngine: string;
  targetUrl: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Critical';
}

const DEFAULT_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-1',
    keyword: 'employee monitoring software',
    type: 'quick_win',
    typeLabel: 'Quick Win (Rank 11-20)',
    currentRank: 12,
    rankChange: 3,
    searchVolume: 14800,
    searchEngine: 'Google India 🇮🇳',
    targetUrl: 'https://www.workcomposer.com/employee-monitoring',
    recommendation: 'Add 3 internal links from high-authority blog posts to push this keyword from #12 into the Top 10.',
    impact: 'High',
  },
  {
    id: 'ins-2',
    keyword: 'remote team productivity tracker',
    type: 'quick_win',
    typeLabel: 'Quick Win (Rank 11-20)',
    currentRank: 14,
    rankChange: 2,
    searchVolume: 6600,
    searchEngine: 'Google India 🇮🇳',
    targetUrl: 'https://www.workcomposer.com/remote-teams',
    recommendation: 'Optimize H2 headers and meta description with exact search intent to reach Page 1.',
    impact: 'High',
  },
  {
    id: 'ins-3',
    keyword: 'automatic time tracking app',
    type: 'cannibalization',
    typeLabel: 'Keyword Cannibalization',
    currentRank: 8,
    rankChange: -2,
    searchVolume: 9200,
    searchEngine: 'Google India 🇮🇳',
    targetUrl: 'https://www.workcomposer.com/features/time-tracking vs /solutions',
    recommendation: 'Two URLs (/features/time-tracking and /solutions) are competing in SERP. Consolidate canonical tags.',
    impact: 'Critical',
  },
  {
    id: 'ins-4',
    keyword: 'best screenshot monitoring tool',
    type: 'serp_feature',
    typeLabel: 'Featured Snippet Opportunity',
    currentRank: 4,
    rankChange: 1,
    searchVolume: 4400,
    searchEngine: 'Google India 🇮🇳',
    targetUrl: 'https://www.workcomposer.com/features/screenshots',
    recommendation: 'Add a 45-word definition paragraph to win the featured snippet currently occupied by competitor.',
    impact: 'Medium',
  },
  {
    id: 'ins-5',
    keyword: 'freelance hours tracker software',
    type: 'rank_drop',
    typeLabel: 'Ranking Drop Alert',
    currentRank: 19,
    rankChange: -5,
    searchVolume: 3100,
    searchEngine: 'Google India 🇮🇳',
    targetUrl: 'https://www.workcomposer.com/freelancers',
    recommendation: 'Position dropped by 5 spots due to competitor content refreshes. Update outdated 2024 benchmarks.',
    impact: 'High',
  },
  {
    id: 'ins-6',
    keyword: 'developer activity monitoring stealth mode',
    type: 'quick_win',
    typeLabel: 'Quick Win (Rank 11-20)',
    currentRank: 11,
    rankChange: 4,
    searchVolume: 2400,
    searchEngine: 'Google India 🇮🇳',
    targetUrl: 'https://www.workcomposer.com/stealth-monitoring',
    recommendation: 'Just 1 rank away from Page 1! Expand content FAQ schema markup to gain instant visibility.',
    impact: 'High',
  },
];

function InsightsContent() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'https://www.workcomposer.com/';

  // Empty state by default to match screenshot 1:1
  const [hasKeywords, setHasKeywords] = useState(false);
  const [insightsList, setInsightsList] = useState<InsightItem[]>(DEFAULT_INSIGHTS);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'quick_win' | 'cannibalization' | 'serp_feature' | 'rank_drop'>('all');

  // Modals
  const [isAddKeywordOpen, setIsAddKeywordOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddKeywordsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = keywordInput
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    if (entered.length === 0) {
      // Default sample keywords
      setHasKeywords(true);
      showToast('Added 5 keywords to project tracking');
    } else {
      setHasKeywords(true);
      showToast(`Added ${entered.length} keywords to project tracking`);
    }
    setIsAddKeywordOpen(false);
    setKeywordInput('');
  };

  const filteredInsights = insightsList.filter((item) => {
    const matchesSearch = item.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.recommendation.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 flex flex-col font-sans select-text">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & METADATA BAR (1:1 Matching Screenshot) */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
            <span className="text-gray-600 font-medium">{domain}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-700 font-medium">Insights</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal">
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
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 1:1 HERO ILLUSTRATION EMPTY STATE OR POPULATED INSIGHTS TABLE */}
        {/* ========================================================================= */}
        <div className="px-6 py-8 max-w-[1440px] mx-auto">
          {!hasKeywords ? (
            /* ===================================================================== */
            /* 1:1 HERO EMPTY STATE (Exact Match to User Screenshot)                 */
            /* ===================================================================== */
            <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs py-20 px-6 text-center min-h-[550px] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-200">
              {/* Detailed Vector Illustration matching user screenshot */}
              <div className="relative w-80 h-56 flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="ins_cloud" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="ins_desk" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FCD34D" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="ins_chart" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>

                  {/* Soft Background Cloud/Blob */}
                  <path
                    d="M 60 110 C 40 70, 90 30, 150 40 C 210 20, 270 50, 260 100 C 280 140, 250 180, 190 180 C 130 190, 70 170, 60 110 Z"
                    fill="url(#ins_cloud)"
                  />

                  {/* Prop (Top Left): Green Checkmark Card */}
                  <g>
                    <rect x="52" y="44" width="30" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                    <rect x="58" y="50" width="12" height="12" rx="2" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
                    <path d="M 61 56 L 64 59 L 68 53" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>

                  {/* Prop (Middle Left): Calendar / Table Card */}
                  <g>
                    <rect x="36" y="74" width="44" height="34" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                    <rect x="36" y="74" width="44" height="8" rx="2" fill="#EBF5FF" />
                    {/* Calendar grid cells */}
                    <rect x="42" y="86" width="6" height="5" rx="1" fill="#E2E8F0" />
                    <rect x="51" y="86" width="6" height="5" rx="1" fill="#3B82F6" />
                    <rect x="60" y="86" width="6" height="5" rx="1" fill="#E2E8F0" />
                    <rect x="69" y="86" width="6" height="5" rx="1" fill="#E2E8F0" />
                    <rect x="42" y="95" width="6" height="5" rx="1" fill="#E2E8F0" />
                    <rect x="51" y="95" width="6" height="5" rx="1" fill="#E2E8F0" />
                    <rect x="60" y="95" width="6" height="5" rx="1" fill="#3B82F6" />
                    <rect x="69" y="95" width="6" height="5" rx="1" fill="#E2E8F0" />
                  </g>

                  {/* Prop (Top Right): Yellow Bar Chart Card */}
                  <g>
                    <rect x="236" y="48" width="48" height="36" rx="4" fill="url(#ins_chart)" />
                    {/* Bars */}
                    <rect x="244" y="66" width="4" height="12" rx="1" fill="#FFFFFF" opacity="0.9" />
                    <rect x="252" y="60" width="4" height="18" rx="1" fill="#FFFFFF" opacity="0.9" />
                    <rect x="260" y="56" width="4" height="22" rx="1" fill="#FFFFFF" opacity="0.9" />
                    <rect x="268" y="62" width="4" height="16" rx="1" fill="#FFFFFF" opacity="0.9" />
                  </g>

                  {/* Prop (Bottom Left): Water Bottle & Apple */}
                  <g>
                    {/* Bottle */}
                    <rect x="80" y="146" width="12" height="24" rx="3" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                    <rect x="83" y="141" width="6" height="5" rx="1" fill="#F59E0B" />
                    <path d="M 80 156 L 92 156" stroke="#CBD5E1" strokeWidth="1" />
                    {/* Apple */}
                    <circle cx="72" cy="164" r="6" fill="#EF4444" />
                    <path d="M 72 158 Q 74 155 76 156" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
                  </g>

                  {/* Prop (Bottom Right): Potted Plant */}
                  <g>
                    {/* Purple Vase */}
                    <path d="M 238 152 Q 236 172 248 174 Q 260 172 258 152 Z" fill="#8B5CF6" />
                    {/* Leaves */}
                    <path d="M 248 152 Q 242 136 234 134 Q 238 144 246 150" fill="#15803D" />
                    <path d="M 248 152 Q 248 130 252 126 Q 256 136 249 150" fill="#22C55E" />
                    <path d="M 248 152 Q 256 138 264 136 Q 258 146 250 150" fill="#16A34A" />
                  </g>

                  {/* Character Illustration */}
                  <g>
                    {/* Legs / Lotus Position */}
                    <ellipse cx="160" cy="165" rx="42" ry="12" fill="#2E5077" />
                    <path
                      d="M 124 154 Q 138 176 160 176 Q 182 176 196 154 Q 178 162 160 162 Q 142 162 124 154 Z"
                      fill="#254266"
                    />
                    {/* Purple Socks/Shoes */}
                    <ellipse cx="130" cy="168" rx="6" ry="4" fill="#6D28D9" />
                    <ellipse cx="190" cy="168" rx="6" ry="4" fill="#6D28D9" />

                    {/* Torso: Green Shirt */}
                    <path
                      d="M 144 116 Q 142 152 144 156 L 176 156 Q 178 152 176 116 Z"
                      fill="#52B788"
                    />
                    {/* Arms holding laptop */}
                    <path
                      d="M 144 118 Q 132 136 142 148 L 152 146"
                      stroke="#52B788"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 176 118 Q 188 136 178 148 L 168 146"
                      stroke="#52B788"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />

                    {/* Tablet/Laptop */}
                    <rect x="146" y="132" width="28" height="20" rx="3" fill="#1E293B" transform="rotate(-3 160 142)" />
                    <rect x="148" y="134" width="24" height="15" rx="1.5" fill="#3B82F6" opacity="0.3" transform="rotate(-3 160 142)" />

                    {/* Neck */}
                    <rect x="156" y="106" width="8" height="12" fill="#FBCFB3" />

                    {/* Head */}
                    <ellipse cx="160" cy="100" rx="11" ry="12" fill="#FBCFB3" />

                    {/* Ears */}
                    <ellipse cx="149" cy="101" rx="2" ry="3" fill="#FBCFB3" />
                    <ellipse cx="171" cy="101" rx="2" ry="3" fill="#FBCFB3" />

                    {/* Glasses & Face Details */}
                    <circle cx="156" cy="99" r="3" stroke="#334155" strokeWidth="1" fill="none" />
                    <circle cx="164" cy="99" r="3" stroke="#334155" strokeWidth="1" fill="none" />
                    <line x1="159" y1="99" x2="161" y2="99" stroke="#334155" strokeWidth="1" />
                    {/* Mustache */}
                    <path d="M 157 105 Q 160 106 163 105" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Hair (Brown curly hair) */}
                    <path
                      d="M 149 98 Q 148 86 160 86 Q 172 86 171 98 Q 168 89 160 89 Q 152 89 149 98 Z"
                      fill="#78350F"
                    />
                    <circle cx="152" cy="89" r="4" fill="#78350F" />
                    <circle cx="160" cy="87" r="4.5" fill="#78350F" />
                    <circle cx="168" cy="89" r="4" fill="#78350F" />
                  </g>
                </svg>
              </div>

              {/* Text Elements (1:1 Matching Screenshot) */}
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  No keywords added
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Add keywords to the project to check positions and discover helpful insights
                </p>
              </div>

              {/* Primary Green CTA Button (1:1 Matching Screenshot) */}
              <button
                type="button"
                onClick={() => setIsAddKeywordOpen(true)}
                className="px-5 py-2.5 bg-[#00B074] hover:bg-[#009A65] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>ADD KEYWORD</span>
              </button>
            </div>
          ) : (
            /* ===================================================================== */
            /* POPULATED STATE: LIVE SEO INSIGHTS & OPPORTUNITY ENGINE               */
            /* ===================================================================== */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Title and Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Search Insights</span>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {insightsList.length} Active Insights
                    </span>
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Algorithmic ranking recommendations, page 1 quick wins, and keyword cannibalization alerts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddKeywordOpen(true)}
                    className="px-3.5 py-1.5 bg-[#00B074] hover:bg-[#009A65] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>ADD KEYWORD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasKeywords(false);
                      showToast('Reset Insights to empty state');
                    }}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset empty state</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Quick Wins (Page 2)</span>
                    <Zap className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">3</span>
                    <span className="text-xs font-semibold text-emerald-600">Near Top 10</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">High potential for rapid organic traffic gains</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Cannibalization Risks</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">1</span>
                    <span className="text-xs font-semibold text-amber-600">Requires Fix</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Multiple URLs competing for the same query</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">SERP Feature Wins</span>
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">1</span>
                    <span className="text-xs font-semibold text-blue-600">Snippet Target</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Eligible for featured answer boxes</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Est. Traffic Upside</span>
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">+4.2K</span>
                    <span className="text-xs font-semibold text-purple-600">Clicks/mo</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">If page 2 keywords hit top 5 positions</p>
                </div>
              </div>

              {/* Controls bar: Category filter tabs + Search */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: 'All Insights', count: insightsList.length },
                    { id: 'quick_win', label: 'Quick Wins', count: insightsList.filter((i) => i.type === 'quick_win').length },
                    { id: 'cannibalization', label: 'Cannibalization', count: insightsList.filter((i) => i.type === 'cannibalization').length },
                    { id: 'serp_feature', label: 'SERP Features', count: insightsList.filter((i) => i.type === 'serp_feature').length },
                    { id: 'rank_drop', label: 'Ranking Drops', count: insightsList.filter((i) => i.type === 'rank_drop').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeCategory === tab.id
                          ? 'bg-[#00B074] text-white shadow-2xs font-bold'
                          : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeCategory === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-64">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search keywords or recommendations..."
                    className="w-full pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#00B074] bg-white shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Insights Table */}
              <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFBFD] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">TRACKED KEYWORD</th>
                      <th className="py-3 px-4 text-center">CURRENT POSITION</th>
                      <th className="py-3 px-4 text-center">MONTHLY VOLUME</th>
                      <th className="py-3 px-4">INSIGHT TYPE</th>
                      <th className="py-3 px-4">RECOMMENDATION</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInsights.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div className="space-y-0.5">
                            <span className="font-bold">{item.keyword}</span>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                              <span>{item.searchEngine}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-mono">
                            <span className="font-bold text-gray-900 text-sm">#{item.currentRank}</span>
                            <span className={`text-[10px] font-bold px-1 rounded ${
                              item.rankChange > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                            }`}>
                              {item.rankChange > 0 ? `+${item.rankChange}` : item.rankChange}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-700">
                          {item.searchVolume.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            item.type === 'quick_win'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.type === 'cannibalization'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : item.type === 'serp_feature'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {item.typeLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 max-w-md">
                          <p className="line-clamp-2 leading-relaxed">{item.recommendation}</p>
                          <span className="text-[10px] text-gray-400 hover:text-blue-600 cursor-pointer truncate block mt-0.5">
                            {item.targetUrl}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => showToast(`Applied optimization workflow for "${item.keyword}"`)}
                            className="px-2.5 py-1 bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-[11px] font-bold rounded shadow-2xs transition-colors cursor-pointer"
                          >
                            Optimize
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER BAR (1:1 Matching SE Ranking Platform Footer)                      */}
        {/* ========================================================================= */}
        <div className="border-t border-gray-200/90 bg-white mt-12 py-3 px-6 text-xs text-gray-500">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1B66FF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="font-bold text-gray-800 text-sm tracking-tight">SE Ranking</span>
            </div>

            <div className="flex items-center gap-6 text-xs font-normal">
              <button
                type="button"
                onClick={() => setIsBugModalOpen(true)}
                className="hover:text-[#1B66FF] transition-colors cursor-pointer"
              >
                Report a bug
              </button>
              <Link href="/affiliate" className="hover:text-[#1B66FF] transition-colors">
                Affiliates
              </Link>
              <Link href="/api-docs" className="hover:text-[#1B66FF] transition-colors">
                API
              </Link>
              <Link href="/whats-new" className="hover:text-[#1B66FF] transition-colors">
                What&apos;s new
              </Link>
              <Link href="/help" className="hover:text-[#1B66FF] transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD KEYWORD MODAL (1:1 Interactive Workflow)                              */}
      {/* ========================================================================= */}
      {isAddKeywordOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Add Keywords for Insights</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeywordOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeywordsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Enter target keywords (one per line):
                </label>
                <textarea
                  rows={4}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder={`employee monitoring software\nautomatic time tracking app\nremote productivity tracker\nscreenshot monitoring tool`}
                  className="w-full text-xs border border-gray-300 rounded-lg p-3 text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#00B074] focus:ring-1 focus:ring-[#00B074]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Search Engine & Region:
                </label>
                <select className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-800 bg-white">
                  <option>Google India (en) 🇮🇳</option>
                  <option>Google United States (en) 🇺🇸</option>
                  <option>Google United Kingdom (en) 🇬🇧</option>
                </select>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-800">
                <span className="font-bold">Automated Analysis:</span> SE Ranking will immediately cross-reference your rankings, identify page 2 quick wins, and detect cannibalization issues.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009A65] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Add Keywords
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading Insights...</div>}>
      <InsightsContent />
    </Suspense>
  );
}
