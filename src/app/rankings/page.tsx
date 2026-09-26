'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Settings,
  Download,
  Share2,
  FileText,
  Sliders,
  Filter,
  Columns,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Check,
  CheckCircle2,
  HelpCircle,
  BarChart2,
  Table,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface KeywordItem {
  id: string;
  keyword: string;
  rank: number;
  prevRank: number;
  change: number;
  volume: number;
  cpc: string;
  difficulty: number;
  serpFeatures: string[];
  url: string;
  dateChecked: string;
}

export default function RankingsPage() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'zohosocial.com';

  // Tour popup state (Screenshot 1 exact match: "Rankings table" 1 of 3)
  const [showTourPopup, setShowTourPopup] = useState(true);
  const [tourStep, setTourStep] = useState(1);

  // Position filter tab
  const [selectedRange, setSelectedRange] = useState<string>('all');

  // Insights expandable section
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Add Keywords modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Floating discount tab modal
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Keywords state - starts empty as shown in screenshot, or populated when user adds
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);

  // Default suggestions for Quick Add
  const highPotentialSuggestions = [
    { kw: 'zoho social review', vol: 6600, diff: 34, cpc: '$2.85' },
    { kw: 'social media scheduler tool', vol: 14800, diff: 52, cpc: '$4.10' },
    { kw: 'best buffer alternative', vol: 9200, diff: 41, cpc: '$3.40' },
    { kw: 'instagram post planner', vol: 22100, diff: 63, cpc: '$1.95' },
    { kw: 'linkedin scheduling automation', vol: 8100, diff: 45, cpc: '$5.20' },
  ];

  const handleAddKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;

    const lines = keywordInput
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const newItems: KeywordItem[] = lines.map((k, idx) => {
      const randomRank = Math.floor(Math.random() * 25) + 1;
      const prev = randomRank + (Math.floor(Math.random() * 7) - 3);
      return {
        id: `kw-${Date.now()}-${idx}`,
        keyword: k,
        rank: randomRank,
        prevRank: prev,
        change: prev - randomRank,
        volume: Math.floor(Math.random() * 15000) + 1200,
        cpc: `$${(Math.random() * 4 + 1).toFixed(2)}`,
        difficulty: Math.floor(Math.random() * 60) + 20,
        serpFeatures: ['Featured Snippet', 'Site Links', 'People Also Ask'],
        url: `https://${domain}/features`,
        dateChecked: '25 Sep 2026',
      };
    });

    setKeywords((prev) => [...prev, ...newItems]);
    setKeywordInput('');
    setIsAddModalOpen(false);
  };

  const handleAddSuggestions = () => {
    const newItems: KeywordItem[] = highPotentialSuggestions.map((item, idx) => ({
      id: `sug-${Date.now()}-${idx}`,
      keyword: item.kw,
      rank: idx + 1,
      prevRank: idx + 2,
      change: 1,
      volume: item.vol,
      cpc: item.cpc,
      difficulty: item.diff,
      serpFeatures: ['Featured Snippet', 'Site Links'],
      url: `https://${domain}`,
      dateChecked: '25 Sep 2026',
    }));

    setKeywords((prev) => [...prev, ...newItems]);
  };

  // Counts based on keywords
  const countTop1 = keywords.filter((k) => k.rank === 1).length;
  const countTop3 = keywords.filter((k) => k.rank <= 3).length;
  const countTop5 = keywords.filter((k) => k.rank <= 5).length;
  const countTop10 = keywords.filter((k) => k.rank <= 10).length;
  const countTop30 = keywords.filter((k) => k.rank <= 30).length;
  const countOver100 = keywords.filter((k) => k.rank > 100).length;

  const avgPosition =
    keywords.length > 0
      ? (keywords.reduce((acc, k) => acc + k.rank, 0) / keywords.length).toFixed(1)
      : '0';

  const totalTraffic = keywords.reduce((acc, k) => acc + Math.round(k.volume * 0.12), 0);
  const searchVisibility = keywords.length > 0 ? (countTop10 / keywords.length * 100).toFixed(1) : '0';

  const filteredKeywords = keywords.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedRange === 'top1') return k.rank === 1;
    if (selectedRange === 'top3') return k.rank <= 3;
    if (selectedRange === 'top5') return k.rank <= 5;
    if (selectedRange === 'top10') return k.rank <= 10;
    if (selectedRange === 'top30') return k.rank <= 30;
    if (selectedRange === 'over100') return k.rank > 100;
    return true;
  });

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-16 select-none overflow-x-hidden">
      {/* Floating Vertical 10% Discount Tab on Right Edge (Screenshot 2 exact match) */}
      <button
        onClick={() => setIsDiscountModalOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#FF5757] hover:bg-[#E84343] text-white text-[11px] font-bold py-2.5 px-1.5 rounded-l-md shadow-lg transition-transform hover:-translate-x-0.5 cursor-pointer flex items-center justify-center [writing-mode:vertical-rl] rotate-180 tracking-wide"
        title="10% discount just for you"
      >
        10% discount just for you
      </button>

      {/* Top Breadcrumb & Metadata Header Row (Screenshot 1) */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-gray-900 font-semibold">{domain}</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600">Rankings</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-semibold">Detailed</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => alert('Guest link copied to clipboard!')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Guest link
          </button>
          <button
            onClick={() => alert('Opening feedback dialog...')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <Link href="/notes" className="hover:text-blue-600 transition-colors">
            Notes (46)
          </Link>
          <div className="flex items-center gap-1 text-gray-600">
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            <span>Manual rechecks: <strong>0 / 750</strong></span>
            <Info className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <span>Keyword limits: <strong>{keywords.length} / 750</strong></span>
            <Info className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* Search Engine, Date Picker & Action Controls (Screenshot 1) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Country Engine Dropdown */}
            <div className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs">
              <span className="text-base leading-none">🇮🇳</span>
              <span>India</span>
              <span className="text-[10px] text-gray-500 font-normal">EN</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </div>

            {/* Date Range Picker */}
            <div className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>25 Sep 2026 - 25 Sep 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Connecting Google Looker Studio connector...')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              <span>DATA STUDIO</span>
            </button>
            <button
              onClick={() => alert('Exporting Rankings Report to CSV/XLSX...')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>EXPORT</span>
            </button>
            <button
              onClick={() => alert('Opening project rankings settings...')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-lg text-xs shadow-2xs cursor-pointer transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Checked Progress Bar (Screenshot 1: 0% CHECKED) */}
        <div className="relative pt-1">
          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: keywords.length > 0 ? '100%' : '0%' }}
            />
          </div>
          <div className="flex justify-center -mt-2">
            <span className="bg-[#10B981] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              {keywords.length > 0 ? '100% CHECKED' : '0% CHECKED'}
            </span>
          </div>
        </div>

        {/* + ADD KEYWORDS & RECHECK DATA Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD KEYWORDS</span>
          </button>

          <button
            onClick={() => alert('Rechecking live ranking positions across Google India...')}
            className="bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RECHECK DATA</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Position Filter Pills Row (Screenshot 1: ALL, TOP 1, TOP 3, TOP 5, TOP 10, TOP 30, >100) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setSelectedRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'all'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ALL <span className="font-normal">({keywords.length})</span>
            </button>
            <button
              onClick={() => setSelectedRange('top1')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'top1'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TOP 1 <span className="font-normal">({countTop1})</span>
            </button>
            <button
              onClick={() => setSelectedRange('top3')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'top3'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TOP 3 <span className="font-normal">({countTop3})</span>
            </button>
            <button
              onClick={() => setSelectedRange('top5')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'top5'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TOP 5 <span className="font-normal">({countTop5})</span>
            </button>
            <button
              onClick={() => setSelectedRange('top10')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'top10'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TOP 10 <span className="font-normal">({countTop10})</span>
            </button>
            <button
              onClick={() => setSelectedRange('top30')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'top30'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              TOP 30 <span className="font-normal">({countTop30})</span>
            </button>
            <button
              onClick={() => setSelectedRange('over100')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === 'over100'
                  ? 'bg-[#394757] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              &gt;100 <span className="font-normal">({countOver100})</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold pr-2">
            <div>Position range: <span className="text-gray-800 font-bold">—</span></div>
            <div className="flex items-center gap-1.5">
              <span>Changes:</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                +{keywords.filter((k) => k.change > 0).length}
              </span>
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                -{keywords.filter((k) => k.change < 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Insights Section Card (Screenshot 1) */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-gray-800">Insights</h3>
              <Info className="w-3 h-3 text-gray-400" />
            </div>
            <button
              onClick={() => setIsInsightsOpen(!isInsightsOpen)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              {isInsightsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-3 bg-purple-50/40 border border-purple-100 rounded-lg p-3 text-xs">
            <div className="font-bold text-gray-900">0 pages recommended for monitoring</div>
            <p className="text-gray-600 text-[11px] mt-1 leading-relaxed">
              We found 0 ranked pages for which you are not tracking changes. Monitor what affects your visibility. Then we can reveal the changes found when positions fall.{' '}
              <button
                onClick={() => alert('Starting automatic URL change monitoring...')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Start monitoring
              </button>
            </p>
            <div className="mt-2">
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                Content
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setIsInsightsOpen(!isInsightsOpen)}
              className="text-xs font-bold text-[#0B69FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View more insights</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Google India Summary Box (Screenshot 1 & 2) */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs relative">
          {/* Rankings Table Tour Popup (Screenshot 1 exact match) */}
          {showTourPopup && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-[#232E3D] text-white p-4 rounded-xl shadow-2xl max-w-sm w-full border border-gray-700 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white">Rankings table</h4>
                <button
                  onClick={() => setShowTourPopup(false)}
                  className="text-gray-400 hover:text-white p-0.5 cursor-pointer text-sm"
                >
                  &times;
                </button>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Here you can find important information on rankings that includes ranking jumps and drops, target URL and its ranking dynamics. By clicking on a metric, you will see a cached copy of the SERP for the day the rankings were checked.
              </p>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-700 text-xs">
                <span className="text-[10px] text-gray-400">{tourStep} of 3</span>
                <button
                  onClick={() => {
                    if (tourStep < 3) setTourStep(tourStep + 1);
                    else setShowTourPopup(false);
                  }}
                  className="px-3 py-1 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                >
                  {tourStep < 3 ? 'NEXT ›' : 'GOT IT'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span className="text-base leading-none">🇮🇳</span>
            <h4 className="text-xs font-bold text-gray-900">Google India</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div className="border-r border-gray-100 pr-2">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">AVERAGE POSITION</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">{avgPosition}</div>
            </div>
            <div className="border-r border-gray-100 pr-2">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">TRAFFIC FORECAST</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">{totalTraffic}</div>
            </div>
            <div className="border-r border-gray-100 pr-2">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">SEARCH VISIBILITY</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">{searchVisibility}%</div>
            </div>
            <div className="border-r border-gray-100 pr-2">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">SERP FEATURES</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">
                {keywords.length > 0 ? 12 : 0}
              </div>
            </div>
            <div className="border-r border-gray-100 pr-2">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">% IN TOP 10</div>
              <div className="text-xl font-extrabold text-gray-900 mt-0.5">
                {keywords.length > 0 ? `${((countTop10 / keywords.length) * 100).toFixed(0)}%` : '0%'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold">SELECTED KEYWORDS</div>
              <div className="text-[11px] text-gray-400 mt-1 leading-tight">
                Select keywords in the table to compare their rankings.
              </div>
            </div>
          </div>
        </div>

        {/* Keywords Table Container & Filter Bar (Screenshot 1 & 2) */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
          {/* Table Toolbar */}
          <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="bg-white border border-gray-300 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>🇮🇳 India</span>
                <span className="text-[10px] text-gray-400 font-normal">EN</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>

              {/* Keyword Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md pl-7 pr-3 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
              </div>

              {/* Groups Dropdown */}
              <div className="bg-white border border-gray-300 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                <span>📁 Groups</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSuggestions}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded border border-blue-200 transition-colors cursor-pointer"
                title="Populate with high potential sample keywords"
              >
                + Quick Sample Data
              </button>
              <button
                onClick={() => alert('Toggling duplicate view...')}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
                title="Copy view"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert('Advanced SERP filters...')}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
                title="Filters"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => alert('Configure columns...')}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
                title="Columns"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Content or Empty State (Screenshot 1 & 2 exact match) */}
          {keywords.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center mx-auto shadow-2xs">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No keywords</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                You have not added any keywords to this project. Add a few keywords to see the rankings of your site.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#00A86B] hover:bg-[#008f5a] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD KEYWORDS</span>
                </button>
                <button
                  onClick={handleAddSuggestions}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                >
                  FIND HIGH-POTENTIAL KEYWORDS
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Keyword</th>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Change</th>
                    <th className="px-4 py-3">Search Volume</th>
                    <th className="px-4 py-3">CPC</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Ranked URL</th>
                    <th className="px-4 py-3 text-right">Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredKeywords.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                        <span>{k.keyword}</span>
                        {k.rank <= 3 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            Top 3
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            k.rank <= 3
                              ? 'bg-emerald-100 text-emerald-800'
                              : k.rank <= 10
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          #{k.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {k.change > 0 ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +{k.change}
                          </span>
                        ) : k.change < 0 ? (
                          <span className="text-rose-600 font-bold flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> {k.change}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{k.volume.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{k.cpc}</td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {k.difficulty}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-blue-600 hover:underline truncate max-w-xs cursor-pointer">
                        {k.url}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{k.dateChecked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Legend Footer (Screenshot 1 & 2 exact match) */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Entered Top 10
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Left Top 10
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Top 10
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Entered Top 100
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">View on page:</span>
              <div className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-700 flex items-center gap-1">
                <span>100</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Keywords Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00A86B]" />
                Add Keywords to Track
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddKeywords} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter keywords (one per line) *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`zoho social\nsocial media scheduler\ninstagram post manager\nbuffer alternative\nhootsuite vs zoho social`}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#00A86B] font-mono leading-relaxed"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-relaxed">
                ℹ️ Positions will be scraped in real time for <strong>Google India (en)</strong>. Daily historical position tracking will activate immediately.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer uppercase tracking-wider"
                >
                  Add &amp; Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10% Discount Just For You Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-[#FF5757] to-[#FF7575] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>🎁</span>
                Personal 10% Discount Just For You
              </h3>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="text-white/80 hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-700 leading-relaxed">
              <p>
                Congratulations! As an active SE Ranking trial member for <strong>zohosocial.com</strong>, you qualify for an exclusive 10% lifetime discount on any annual subscription plan.
              </p>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="text-[11px] text-rose-800 font-semibold">Your Discount Promo Code:</div>
                <div className="text-xl font-black text-rose-600 font-mono tracking-wider select-all">
                  SERANKING10
                </div>
                <div className="text-[10px] text-rose-700">Applies automatically on checkout or subscription renewal.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/settings"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-5 py-2 bg-[#FF5757] hover:bg-[#E84343] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Upgrade With 10% Off
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
