'use client';

import React, { useState, useRef } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Sparkles,
  BarChart2,
  Globe,
  Database,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Table,
  CheckCircle2,
  Tag,
  Check,
} from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';
import { KeywordResearchDashboard } from '@/components/research/KeywordResearchDashboard';

export default function KeywordResearchPage() {
  const [viewState, setViewState] = useState<'start' | 'dashboard'>('start');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(
    SUPPORTED_COUNTRIES.find((c) => c.code === 'in') || SUPPORTED_COUNTRIES[0]
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carousel 1 Slide State (0 = 1-2 of 4, 1 = 3-4 of 4)
  const [carousel1Page, setCarousel1Page] = useState(0);

  // Carousel 2 Slide State (0 = 1-2 of 4, 1 = 3-4 of 4)
  const [carousel2Page, setCarousel2Page] = useState(0);

  // Image Tabs State (0, 1, 2)
  const [activeImageTab, setActiveImageTab] = useState(0);

  // Handlers for Keywords
  const handleAddKeyword = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!keywordsList.includes(trimmed)) {
      setKeywordsList([...keywordsList, trimmed]);
    }
    setKeywordInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword(keywordInput);
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywordsList(keywordsList.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const parsed = text
        .split(/[\r\n,]+/)
        .map((k) => k.trim())
        .filter(Boolean);
      const unique = Array.from(new Set([...keywordsList, ...parsed]));
      setKeywordsList(unique.slice(0, 50));
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    const activeKw = keywordsList.length > 0 ? keywordsList[0] : keywordInput.trim();
    if (!activeKw) return;
    setViewState('dashboard');
  };

  if (viewState === 'dashboard') {
    const activeKw = keywordsList.length > 0 ? keywordsList[0] : keywordInput.trim() || 'seo software';
    return (
      <KeywordResearchDashboard
        keyword={activeKw}
        country={selectedCountry.name}
        countryCode={selectedCountry.code}
        onNewSearch={() => setViewState('start')}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none pb-20">
      {/* Hidden file input for TXT/CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.csv"
        className="hidden"
      />

      <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-12">
        {/* ========================================================================= */}
        {/* 1. TOP INTERACTIVE SEARCH BLOCK matching user HTML */}
        {/* ========================================================================= */}
        <div className="start-page__interactive-search-block text-center pt-2">
          <div className="start-page__block-head mb-5">
            <h3 className="start-page__top-title text-2xl font-bold text-gray-900 tracking-tight">
              Keyword Research
            </h3>
            <div className="start-page__top-subtitle text-xs text-gray-500 mt-1">
              Find the most profitable keywords to rank for
            </div>
          </div>

          <div className="keyword-search max-w-3xl mx-auto">
            <div className="search-input-multiple bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-[#0B69FF] focus-within:ring-2 focus-within:ring-[#0B69FF]/20 transition-all p-1.5 flex flex-wrap sm:flex-nowrap items-center gap-2">
              {/* Keywords Input with Tag Chips */}
              <div className="search-input-multiple__keywords flex-1 flex flex-wrap items-center gap-1.5 px-2 py-1 min-h-[38px] text-left">
                {keywordsList.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0B69FF] text-xs font-medium border border-blue-200"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="hover:text-blue-800 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    keywordsList.length === 0
                      ? 'Enter keywords or drop a TXT/CSV file'
                      : 'Add more keywords...'
                  }
                  className="flex-1 min-w-[200px] text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden bg-transparent"
                />
              </div>

              {/* Upload TXT/CSV Icon Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Drop or upload a TXT/CSV file"
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
              </button>

              {/* Region & Search Engine Select Button matching SE Ranking */}
              <div className="relative border-l border-gray-200 pl-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="h-10 px-3 flex items-center gap-2 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                >
                  {/* Google Icon */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {/* Flag */}
                  <span className="text-base">{selectedCountry.flag}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isCountryOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 max-h-56 overflow-y-auto text-xs">
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50/70 ${
                          selectedCountry.code === c.code
                            ? 'bg-blue-50 font-bold text-[#0B69FF]'
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <span>{c.name}</span>
                        </div>
                        {selectedCountry.code === c.code && (
                          <Check className="w-3.5 h-3.5 text-[#0B69FF]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button: Analyze matching user HTML */}
              <div className="search-input-multiple__action shrink-0">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!keywordInput.trim() && keywordsList.length === 0}
                  className={`h-10 px-5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    keywordInput.trim() || keywordsList.length > 0
                      ? 'bg-[#0B69FF] hover:bg-[#005FE0] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Analyze</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CAROUSEL 1: Investigate keyword parameters down to the core */}
        {/* ========================================================================= */}
        <div className="landing-section-carousel pt-4">
          <div className="landing-sections-box text-left">
            <div className="landing-sections-box__head flex items-center justify-between mb-4">
              <h3 className="landing-sections-box__title text-lg font-bold text-gray-900">
                Investigate keyword parameters down to the core
              </h3>

              {/* Carousel Navigation: 1-2 of 4 matching user HTML */}
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <span className="font-medium text-gray-600">
                  {carousel1Page === 0 ? '1-2 of 4' : '3-4 of 4'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCarousel1Page(0)}
                    disabled={carousel1Page === 0}
                    className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarousel1Page(1)}
                    disabled={carousel1Page === 1}
                    className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Difficulty score */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  {/* Clean Difficulty Gauge Diagram */}
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-100"
                          strokeWidth="3.8"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#0B69FF]"
                          strokeDasharray="42, 100"
                          strokeWidth="3.8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-base font-black text-gray-900">42</span>
                        <span className="text-[10px] text-gray-400 block -mt-1">/100</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-1">
                      Possible
                    </span>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Difficulty score
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    See how difficult it will be to rank a web page at the top of Google for a specific keyword.
                  </div>
                </div>
              </div>

              {/* Card 2: Search volume */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  {/* Clean Search Volume Bar Graph Diagram */}
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">Monthly Searches</span>
                      <span className="font-bold text-emerald-600">+18%</span>
                    </div>
                    <div className="text-xl font-black text-gray-900">14,800</div>
                    <div className="flex items-end gap-1.5 h-12 pt-2">
                      {[40, 55, 65, 80, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-gray-100 rounded-t h-full flex items-end">
                          <div
                            className="w-full bg-[#10B981] rounded-t transition-all"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Search volume
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    Find out how many monthly organic searches the selected keyword gets on Google.
                  </div>
                </div>
              </div>

              {/* Card 3: CPC and paid competition */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  {/* Clean CPC & PPC Meter Diagram */}
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">Est. Google Ads CPC</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold text-[10px]">
                        PPC
                      </span>
                    </div>
                    <div className="text-xl font-black text-purple-600">$2.40</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Paid Competition</span>
                        <span className="font-bold text-gray-900">0.65 (Medium)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    CPC and paid competition
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    Discover the average price of a click for a pay-per-click (PPC) Google Ads marketing campaign.
                  </div>
                </div>
              </div>

              {/* Card 4: Global Volume */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  {/* Clean Global Volume Diagram */}
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">Global Demand</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#0B69FF] font-semibold text-[10px]">
                        190+ Regions
                      </span>
                    </div>
                    <div className="text-xl font-black text-blue-600">64,200</div>
                    <div className="space-y-1 text-[11px] text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>🇺🇸 United States</span>
                        <span className="font-bold">28,400</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>🇮🇳 India</span>
                        <span className="font-bold">14,800</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>🇬🇧 United Kingdom</span>
                        <span className="font-bold">8,200</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Global Volume
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    Find out the total number of monthly searches a keyword gets on average across all regions (190+) available on the platform.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CAROUSEL 2: Get the most out of keywords with our platform */}
        {/* ========================================================================= */}
        <div className="landing-section-carousel pt-2">
          <div className="landing-sections-box text-left">
            <div className="landing-sections-box__head flex items-center justify-between mb-4">
              <h3 className="landing-sections-box__title text-lg font-bold text-gray-900">
                Get the most out of keywords with our platform
              </h3>

              {/* Navigation count 1-2 of 4 matching user HTML */}
              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <span className="font-medium text-gray-600">
                  {carousel2Page === 0 ? '1-2 of 4' : '3-4 of 4'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCarousel2Page(0)}
                    disabled={carousel2Page === 0}
                    className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarousel2Page(1)}
                    disabled={carousel2Page === 1}
                    className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel 2 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Bulk keyword analysis */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-2">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">Up to 10,000 Keywords</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Instant CSV / TXT Parsing</div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Bulk keyword analysis
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    Need to analyze hundreds or even thousands of keywords fast? With bulk keyword analysis, you don’t have to worry about it taking ages to get done.
                  </div>
                </div>
              </div>

              {/* Card 2: Keyword Manager */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-between text-xs">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Saved Lists</span>
                      <span className="text-[#0B69FF] font-bold">12 Lists</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 p-1 rounded bg-gray-50">
                        <Tag className="w-3 h-3 text-[#0B69FF]" />
                        <span className="font-semibold text-gray-800 truncate">SaaS Landing Keywords</span>
                      </div>
                      <div className="flex items-center gap-2 p-1 rounded bg-gray-50">
                        <Tag className="w-3 h-3 text-purple-600" />
                        <span className="font-semibold text-gray-800 truncate">Competitor Gap Keywords</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Keyword Manager
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    Keyword Manager allows you to add, update, and save keyword lists for different regions all in one place. You can also monitor how keyword metrics and search results change over time.
                  </div>
                </div>
              </div>

              {/* Card 3: Expand Database */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center mb-2">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">Custom SERP Indexing</div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Submit Any Niche Query</div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Expand Database
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    If you can’t find all the data you need in the Keyword Research tool, you can add your own list of keywords to our database. You’ll get a detailed analysis of the keyword you’re interested in this way.
                  </div>
                </div>
              </div>

              {/* Card 4: Historical Data */}
              <div className="slide-card bg-gray-50/60 rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="slide-card__image-wrapper mb-4">
                  <div className="h-32 bg-white rounded-lg border border-gray-100 p-3 flex flex-col justify-center items-center text-center">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">Since Feb 2020</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Historical Search Volumes</div>
                  </div>
                </div>
                <div>
                  <div className="slide-card__title text-sm font-bold text-gray-900 mb-1">
                    Historical Data
                  </div>
                  <div className="slide-card__description text-xs text-gray-500 leading-relaxed">
                    Historical data is a feature in Keyword Research that allows you to access detailed research reports from previous months. You can view, filter and export data from any module of the Keyword Research tool for any previous month going back to February 2020.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SECTION 3: Image Tabs: Go keyword hunting and stock up on your arsenal */}
        {/* ========================================================================= */}
        <div className="landing-section-image-tabs pt-2">
          <div className="landing-sections-box text-left">
            <div className="landing-sections-box__head mb-4">
              <h3 className="landing-sections-box__title text-lg font-bold text-gray-900">
                Go keyword hunting and stock up on your keyword arsenal
              </h3>
            </div>

            <div className="landing-sections-box__main bg-gray-50/70 rounded-2xl border border-gray-200 p-6">
              <div className="slider-images grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* 3 Clickable Tabs */}
                <div className="slider-images__tabs lg:col-span-5 space-y-3">
                  <div
                    onClick={() => setActiveImageTab(0)}
                    className={`slider-images__item p-4 rounded-xl border transition-all cursor-pointer ${
                      activeImageTab === 0
                        ? 'bg-white border-[#0B69FF] shadow-xs'
                        : 'bg-white/60 border-transparent hover:bg-white text-gray-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeImageTab === 0 ? 'bg-[#0B69FF]' : 'bg-gray-300'}`} />
                      <span>Similar Keywords</span>
                    </div>
                    <div className="slider-images__tab-desc text-xs text-gray-500 leading-relaxed">
                      Keywords that are similar to the target keyword that often contain the analyzed search term.
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveImageTab(1)}
                    className={`slider-images__item p-4 rounded-xl border transition-all cursor-pointer ${
                      activeImageTab === 1
                        ? 'bg-white border-[#0B69FF] shadow-xs'
                        : 'bg-white/60 border-transparent hover:bg-white text-gray-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeImageTab === 1 ? 'bg-[#0B69FF]' : 'bg-gray-300'}`} />
                      <span>Related Keywords</span>
                    </div>
                    <div className="slider-images__tab-desc text-xs text-gray-500 leading-relaxed">
                      Related keywords tied to the same high-ranking pages as the target keyword.
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveImageTab(2)}
                    className={`slider-images__item p-4 rounded-xl border transition-all cursor-pointer ${
                      activeImageTab === 2
                        ? 'bg-white border-[#0B69FF] shadow-xs'
                        : 'bg-white/60 border-transparent hover:bg-white text-gray-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${activeImageTab === 2 ? 'bg-[#0B69FF]' : 'bg-gray-300'}`} />
                      <span>Competitive SERP Analysis</span>
                    </div>
                    <div className="slider-images__tab-desc text-xs text-gray-500 leading-relaxed">
                      When picking keywords to target in search campaigns, you can immediately see who you’ll be competing with in organic and paid search.
                    </div>
                  </div>
                </div>

                {/* Interactive Dynamic Preview Image / Diagram */}
                <div className="slider-images__image lg:col-span-7 bg-white rounded-xl border border-gray-200 p-4 shadow-2xs overflow-hidden">
                  {activeImageTab === 0 && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-900">Similar Keywords Preview</span>
                        <span className="text-[11px] text-gray-400">Google US</span>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-gray-400 text-[11px] uppercase border-b border-gray-100">
                            <th className="pb-1.5">Keyword</th>
                            <th className="pb-1.5 text-right">Volume</th>
                            <th className="pb-1.5 text-center">KD %</th>
                            <th className="pb-1.5 text-right">CPC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">best seo software tools</td>
                            <td className="py-2 text-right font-medium">12,100</td>
                            <td className="py-2 text-center text-blue-600 font-bold">48%</td>
                            <td className="py-2 text-right text-gray-700 font-mono">$4.80</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">seo software for agencies</td>
                            <td className="py-2 text-right font-medium">6,400</td>
                            <td className="py-2 text-center text-emerald-600 font-bold">34%</td>
                            <td className="py-2 text-right text-gray-700 font-mono">$6.20</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">enterprise seo platform</td>
                            <td className="py-2 text-right font-medium">3,900</td>
                            <td className="py-2 text-center text-amber-600 font-bold">59%</td>
                            <td className="py-2 text-right text-gray-700 font-mono">$8.40</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeImageTab === 1 && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-900">Related Keywords Preview</span>
                        <span className="text-[11px] text-gray-400">Co-occurring SERP terms</span>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-gray-400 text-[11px] uppercase border-b border-gray-100">
                            <th className="pb-1.5">Related Term</th>
                            <th className="pb-1.5 text-right">Search Intent</th>
                            <th className="pb-1.5 text-right">Relevance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">keyword rank tracker software</td>
                            <td className="py-2 text-right font-medium text-emerald-600">Transactional</td>
                            <td className="py-2 text-right text-[#0B69FF] font-bold">94%</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">website backlink audit tool</td>
                            <td className="py-2 text-right font-medium text-blue-600">Commercial</td>
                            <td className="py-2 text-right text-[#0B69FF] font-bold">89%</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">competitor serp monitoring</td>
                            <td className="py-2 text-right font-medium text-purple-600">Informational</td>
                            <td className="py-2 text-right text-[#0B69FF] font-bold">82%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeImageTab === 2 && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-900">Competitive Landscape Preview</span>
                        <span className="text-[11px] text-gray-400">Organic & Paid Competitors</span>
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-gray-400 text-[11px] uppercase border-b border-gray-100">
                            <th className="pb-1.5">Competitor Domain</th>
                            <th className="pb-1.5 text-center">Avg Position</th>
                            <th className="pb-1.5 text-right">Organic Traffic</th>
                            <th className="pb-1.5 text-right">Paid Ads</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">ahrefs.com</td>
                            <td className="py-2 text-center font-bold text-blue-600">1.8</td>
                            <td className="py-2 text-right font-medium">84,000</td>
                            <td className="py-2 text-right text-gray-700 font-mono">140 Ads</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">semrush.com</td>
                            <td className="py-2 text-center font-bold text-blue-600">2.2</td>
                            <td className="py-2 text-right font-medium">112,000</td>
                            <td className="py-2 text-right text-gray-700 font-mono">380 Ads</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-semibold text-gray-800">moz.com</td>
                            <td className="py-2 text-center font-bold text-blue-600">3.4</td>
                            <td className="py-2 text-right font-medium">42,000</td>
                            <td className="py-2 text-right text-gray-700 font-mono">45 Ads</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM REPEAT SEARCH BLOCK matching user HTML */}
        {/* ========================================================================= */}
        <div className="start-page__interactive-search-block text-center pt-6 pb-4">
          <div className="start-page__block-head mb-5">
            <h4 className="start-page__bottom-title text-xl font-bold text-gray-900 tracking-tight">
              Get all the data you need on any keyword
            </h4>
          </div>

          <div className="keyword-search max-w-3xl mx-auto">
            <div className="search-input-multiple bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-[#0B69FF] focus-within:ring-2 focus-within:ring-[#0B69FF]/20 transition-all p-1.5 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="search-input-multiple__keywords flex-1 flex flex-wrap items-center gap-1.5 px-2 py-1 min-h-[38px] text-left">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter keywords or drop a TXT/CSV file"
                  className="w-full text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden bg-transparent"
                />
              </div>

              <div className="relative border-l border-gray-200 pl-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="h-10 px-3 flex items-center gap-2 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                >
                  <span className="text-base">{selectedCountry.flag}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              <div className="search-input-multiple__action shrink-0">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="h-10 px-5 rounded-lg text-xs font-bold bg-[#0B69FF] hover:bg-[#005FE0] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Analyze</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
