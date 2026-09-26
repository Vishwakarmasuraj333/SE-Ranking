'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
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
  Layers,
  Filter,
} from 'lucide-react';

export type LocalMarketingTab = 'overview' | 'audit' | 'reviews';

interface ReviewItem {
  id: string;
  source: string;
  sourceIcon: string;
  rating: number | null; // null for not rated
  date: string;
  text: string;
  author: string;
  status: 'Read' | 'Answered' | 'Needs attention' | 'Not read';
  language: 'EN' | 'ES' | 'FR' | 'DE';
  reply?: string;
}

export default function LocalMarketingSuitePage({ initialTab = 'overview' }: { initialTab?: LocalMarketingTab }) {
  const [activeTab, setActiveTab] = useState<LocalMarketingTab>(initialTab);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isConnectBannerDismissed, setIsConnectBannerDismissed] = useState(false);

  // Switchers & Dropdowns
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('All dates');
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Review Scatter Matrix Filter (Overview)
  const [scatterTimelineFilter, setScatterTimelineFilter] = useState<'ALL' | '7D' | '1M' | '3M' | '6M' | '1Y'>('ALL');

  // Audit View State (Screenshot 1 / Screenshot 4)
  const [selectedAuditSection, setSelectedAuditSection] = useState<'gbp' | 'listings' | 'reviews'>('gbp');
  const [auditFilter, setAuditFilter] = useState<'all' | 'errors' | 'warnings' | 'notices' | 'passed' | 'unchecked'>('all');
  const [expandedChecklistItems, setExpandedChecklistItems] = useState<Record<string, boolean>>({
    'gbp-service-area': true,
    'listings-not-all-active': true,
    'listings-name-errors': false,
    'listings-address-errors': false,
    'listings-phone-errors': false,
    'listings-url-errors': false,
    'reviews-unmonitored': true,
    'reviews-disabled': false,
    'reviews-negative-reply': true,
    'reviews-neutral-old': false,
    'reviews-neutral-new': true,
    'reviews-rating-unsatisfactory': false,
    'reviews-30-days': false,
  });

  // Review List State (Screenshot 2 & 3)
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All sources');
  const [activeReviewModal, setActiveReviewModal] = useState<ReviewItem | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [reviewListSearch, setReviewListSearch] = useState('');

  // 10 Exact Reviews matching Screenshot 2 & 3
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 25 2026',
      text: 'I loved the place so much. The owner greets you with a smile which makes the overall atmosphere wonderful and welcoming. Definitely coming back soon!',
      author: 'Ben A.',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-2',
      source: 'Google',
      sourceIcon: 'G',
      rating: 5,
      date: 'Sep 25 2026',
      text: 'It was absolutely incredible. There was amazing service, absolutely delicious food, and the handmade pasta is out of this world.',
      author: 'Sabrina Taylor',
      status: 'Answered',
      language: 'EN',
      reply: 'Thank you Sabrina! We take tremendous pride in crafting our handmade pasta every morning.',
    },
    {
      id: 'rev-3',
      source: "Judy's Book",
      sourceIcon: '📖',
      rating: 2,
      date: 'Sep 23 2026',
      text: 'The atmosphere was great. Location seemed convenient. The Philly sandwich i ordered was soggy and cold upon arrival unfortunately.',
      author: 'George Kent',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-4',
      source: 'FindOpen',
      sourceIcon: '📍',
      rating: 4,
      date: 'Sep 23 2026',
      text: 'Super popular place. We even had to stand in the line to get in. Food was great overall and drinks arrived swiftly.',
      author: 'Minka Lawson',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-5',
      source: 'EZlocal',
      sourceIcon: '⚡',
      rating: 3,
      date: 'Sep 21 2026',
      text: "First time here. Tried the pasta on pasta Friday. It was okay... didn't taste much flavor in the white truffle cream sauce.",
      author: 'Emma Conte',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-6',
      source: 'Tripadvisor',
      sourceIcon: '🦉',
      rating: 5,
      date: 'Sep 20 2026',
      text: 'Genuine Italian food. Tasty and looks great. Nice wine too. Waiters are pleasant and fast.',
      author: 'Jerry_213',
      status: 'Not read',
      language: 'EN',
    },
    {
      id: 'rev-7',
      source: 'City squares',
      sourceIcon: '🏙️',
      rating: 5,
      date: 'Sep 19 2026',
      text: 'The food is delicious and full of flavor. The only complaint I have this time around that parking was a bit tight during dinner rush.',
      author: 'Alan Pascot',
      status: 'Read',
      language: 'EN',
    },
    {
      id: 'rev-8',
      source: "Judy's Book",
      sourceIcon: '📖',
      rating: null,
      date: 'Sep 18 2026',
      text: 'Es el tipico asador castellano, donde puedes degustar un delicioso cordero. Y claro, sin olvidar los postres caseros de primera.',
      author: 'spain_girl',
      status: 'Read',
      language: 'ES',
    },
    {
      id: 'rev-9',
      source: 'FindOpen',
      sourceIcon: '📍',
      rating: 3,
      date: 'Sep 14 2026',
      text: 'The food was average overall. The mac and cheese tasted artificial. However, the wings were quite crispy and enjoyable.',
      author: 'Mark Steiner',
      status: 'Needs attention',
      language: 'EN',
    },
    {
      id: 'rev-10',
      source: 'ShowMeLocal',
      sourceIcon: '🗺️',
      rating: 5,
      date: 'Sep 12 2026',
      text: 'Reasonable prices, amazing food, fast service. Very clean, friendly staff, a chili oil dip that was simply unforgettable!',
      author: 'Monica Dalton',
      status: 'Read',
      language: 'EN',
    },
  ]);

  const toggleAccordion = (key: string) => {
    setExpandedChecklistItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      alert('Location metrics and reviews synced successfully!');
    }, 700);
  };

  const handleSaveReply = (id: string) => {
    if (!reviewReplyText.trim()) return;
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Answered', reply: reviewReplyText } : r))
    );
    setReviewReplyText('');
    setActiveReviewModal(null);
    alert('Reply sent to customer!');
  };

  // Scatter plot source dots (Overview)
  const scatterMonths = [
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

  const scatterLegendSources = [
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

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] text-gray-900 min-h-screen font-sans">
      {/* Top Blue Notice Banner (Exact match to Screenshots) */}
      {!isBannerDismissed && (
        <div className="bg-[#EBF3FC] border-b border-[#CCE0F8] px-4 py-2.5 text-xs text-[#1E40AF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0B69FF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              i
            </span>
            <span className="leading-snug">
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
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className="hover:text-gray-900 cursor-pointer"
          >
            Local Marketing
          </button>
          <span>›</span>
          {activeTab === 'reviews' ? (
            <>
              <button onClick={() => setActiveTab('reviews')} className="hover:text-gray-900 cursor-pointer">
                Reviews
              </button>
              <span>›</span>
              <span className="text-gray-900 font-semibold">Review List</span>
            </>
          ) : activeTab === 'audit' ? (
            <>
              <span className="text-gray-900 font-semibold">Audit</span>
            </>
          ) : (
            <span className="text-gray-900 font-semibold">Overview</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Feedback modal')}
            className="text-gray-500 hover:text-[#0B69FF] transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Location update limit: 0 / 3</span>
            <span className="cursor-pointer text-[#B45309]">ⓘ</span>
          </div>
        </div>
      </div>

      {/* Sub-Header Row: Tabs + Action Buttons */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview'
                  ? 'Overview'
                  : activeTab === 'reviews'
                  ? 'Review List'
                  : 'Local Marketing Audit'}
              </h1>
              <div className="flex items-center gap-1 border border-gray-200 rounded p-0.5 bg-gray-50 text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Review List (60)
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                    activeTab === 'audit'
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Audit Checklist
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
              <span>Location updated on: Sep 26 2026</span>
              {activeTab === 'reviews' && <span>Reviews updated on: Sep 26 2026</span>}
            </div>

            {/* Location Switcher & Date Range Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="relative">
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 font-medium flex items-center gap-2 hover:bg-gray-50 shadow-2xs cursor-pointer"
                >
                  <span>🇺🇸</span>
                  <span className="max-w-[200px] truncate">Folk Osteria, Highland Dr., Hol...</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                    Demo
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-1" />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      Locations
                    </div>
                    <div className="p-2.5 bg-blue-50/70 font-semibold text-[#0B69FF] flex justify-between items-center">
                      <div>
                        <p>Folk Osteria, Highland Dr., Hol...</p>
                        <p className="text-[10px] text-gray-400 font-normal">Italian Restaurant</p>
                      </div>
                      <Check className="w-4 h-4 text-[#0B69FF]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter */}
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

              {/* Integrations Indicators on Review List (Screenshot 2) */}
              {activeTab === 'reviews' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#1E293B] text-white px-2 py-1 rounded text-[11px] font-semibold">
                    <span>G</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-1 bg-[#3B5998] text-white px-2 py-1 rounded text-[11px] font-semibold">
                    <span>f</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[11px] text-gray-400 italic hidden lg:inline">
                    • We check reviews on a daily basis
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddLocationModalOpen(true)}
              className="bg-[#0B69FF] hover:bg-[#0052D4] text-white font-bold text-xs uppercase px-4 py-2 rounded shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer tracking-wider"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ADD LOCATION</span>
            </button>
            {activeTab === 'overview' && (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3 py-2 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span>UPDATE</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => alert('Exporting Local Marketing report in CSV format...')}
                  className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs px-3 py-2 rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>EXPORT</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW (Screenshots 1, 2, 3 previous)                            */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* 1. Local Rankings Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Local Rankings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
              {/* Left 6 cols: Rankings Distribution with exact numbers */}
              <div className="lg:col-span-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6">
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                    RANKINGS DISTRIBUTION
                  </div>

                  <div className="grid grid-cols-3 gap-y-4 gap-x-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 1-3</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">45</span>
                        <span className="text-[11px] font-bold text-emerald-600">▲ 6</span>
                      </div>
                      <svg className="w-full h-5 text-amber-500 overflow-visible" viewBox="0 0 100 20">
                        <path d="M0,15 Q25,8 50,14 T100,5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 4-6</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">46</span>
                        <span className="text-[11px] font-bold text-red-600">▼ 8</span>
                      </div>
                      <svg className="w-full h-5 text-blue-500 overflow-visible" viewBox="0 0 100 20">
                        <path d="M0,8 Q30,18 60,10 T100,16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 7-10</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">50</span>
                        <span className="text-[11px] font-bold text-emerald-600">▲ 2</span>
                      </div>
                      <svg className="w-full h-5 text-lime-500 overflow-visible" viewBox="0 0 100 20">
                        <path d="M0,16 Q25,18 55,7 T100,12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 11-15</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">78</span>
                        <span className="text-[11px] font-bold text-emerald-600">▲ 14</span>
                      </div>
                      <svg className="w-full h-5 text-purple-500 overflow-visible" viewBox="0 0 100 20">
                        <path d="M0,12 Q30,6 60,15 T100,8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 16-19</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">70</span>
                        <span className="text-[11px] font-bold text-emerald-600">▲ 2</span>
                      </div>
                      <svg className="w-full h-5 text-orange-400 overflow-visible" viewBox="0 0 100 20">
                        <path d="M0,14 Q30,16 65,8 T100,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">TOP 20+</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-gray-900">66</span>
                        <span className="text-[11px] font-bold text-red-600">▼ 18</span>
                      </div>
                      <svg className="w-full h-5 text-pink-500 overflow-visible" viewBox="0 0 100 20">
                        <path d="M0,10 Q25,5 60,16 T100,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => alert('View all rankings distribution')}
                    className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>→ VIEW ALL</span>
                  </button>
                </div>
              </div>

              {/* Right 6 cols: Overall Avg Position Line Chart */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    OVERALL AVG. POSITION
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">12.2</span>
                    <span className="text-xs font-bold text-emerald-600">▲ 0.3</span>
                  </div>

                  <div className="h-28 w-full relative flex flex-col justify-end">
                    <svg className="w-full h-20 text-blue-500 overflow-visible" viewBox="0 0 500 80">
                      <line x1="0" y1="10" x2="500" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                      <path d="M0,45 L100,42 L200,40 L300,46 L400,43 L500,41" fill="none" stroke="#0B69FF" strokeWidth="2.5" />
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
                    onClick={() => alert('View all position movement')}
                    className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>→ VIEW ALL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Local Marketing Audit Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Local Marketing Audit</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
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
                      strokeDashoffset={264 - (264 * 85) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-emerald-600 font-bold">▲ 85</span>
                    <span className="text-2xl font-black text-gray-900 leading-none">85</span>
                    <span className="text-[9px] text-gray-400 font-medium">OUT OF 100</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 mt-2 tracking-wide uppercase">HEALTHY</span>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase">ISSUES</span>
                  <div className="text-xl font-bold text-gray-900">68</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Store className="w-4 h-4 text-gray-500" />
                      <span className="text-[11px] font-bold truncate">GOOGLE BUSINESS PROFILE</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono font-bold">
                      <span className="text-red-600">● 0</span>
                      <span className="text-amber-600">▲ 0</span>
                      <span className="text-blue-600">ⓘ 1</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-[11px] font-bold truncate">BUSINESS LISTINGS</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono font-bold">
                      <span className="text-red-600">● 10</span>
                      <span className="text-amber-600">▲ 0</span>
                      <span className="text-blue-600">ⓘ 0</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-[11px] font-bold truncate">REVIEWS</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono font-bold">
                      <span className="text-red-600">● 8</span>
                      <span className="text-amber-600">▲ 1</span>
                      <span className="text-blue-600">ⓘ 44</span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>→ VIEW ALL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Connect Location Banner */}
          {!isConnectBannerDismissed && (
            <div className="bg-white border border-[#D0E2FF] rounded-lg p-5 shadow-2xs relative">
              <button
                onClick={() => setIsConnectBannerDismissed(true)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-sm text-gray-900">Connect a real location</h3>
              <p className="text-xs text-gray-600 mt-1 max-w-3xl leading-relaxed">
                You&apos;re viewing data for a demo, imaginary business. Add a real local business (e.g. restaurant, car wash, locksmith) to view and manage its data. Start by connecting its Google Business Profile.
              </p>
              <button
                onClick={() => setIsAddLocationModalOpen(true)}
                className="mt-3 px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs font-bold uppercase rounded shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD LOCATION</span>
              </button>
            </div>
          )}

          {/* 4. Google Business Profile Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-gray-900">Google Business Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-6 border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 pr-0 lg:pr-6">
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#3B82F6" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="0" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="145" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="75" fill="none" />
                    <circle cx="50" cy="50" r="38" stroke="#EF4444" strokeWidth="8" strokeDasharray="238.7" strokeDashoffset="10" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-bold text-gray-900">214,538</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs flex-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    VIEWS BY PLATFORM AND DEVICE ⓘ
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> MOBILE SEARCH VIEWS</span>
                    <span className="font-mono font-bold">63,381 <span className="text-gray-400 font-normal">29.5%</span></span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> MOBILE MAPS VIEWS</span>
                    <span className="font-mono font-bold">58,190 <span className="text-gray-400 font-normal">27.1%</span></span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600" /> DESKTOP SEARCH VIEWS</span>
                    <span className="font-mono font-bold">83,912 <span className="text-gray-400 font-normal">39.1%</span></span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> DESKTOP MAPS VIEWS</span>
                    <span className="font-mono font-bold">9,055 <span className="text-gray-400 font-normal">4.2%</span></span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  SEARCHES BY KEYWORDS
                </div>
                <div className="text-lg font-bold text-gray-900">163,761</div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>1. food</span>
                    <span className="font-mono font-semibold">12381</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>2. pasta</span>
                    <span className="font-mono font-semibold">11619</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>3. italian</span>
                    <span className="font-mono font-semibold">5659</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('View all GBP insights')}
                className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
              >
                <span>→ VIEW ALL</span>
              </button>
            </div>
          </div>

          {/* 5. Business Listings Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Business Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase">MENTIONS FOUND ⓘ</div>
                <div className="text-3xl font-extrabold text-[#0B69FF]">
                  57<span className="text-gray-400 text-lg font-normal">/60</span>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">→ VIEW WHOLE LIST</span>
                  <span className="text-gray-400">in 3 missing directories</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase">NAP ERRORS ⓘ</div>
                <div className="flex items-center gap-6">
                  <div className="text-3xl font-extrabold text-gray-900">6</div>
                  <div className="grid grid-cols-3 gap-6 text-xs border-l border-gray-200 pl-6">
                    <div>
                      <div className="text-gray-400 text-[10px]">T NAME</div>
                      <div className="font-bold text-sm text-[#0B69FF]">2</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">📍 ADDRESS</div>
                      <div className="font-bold text-sm text-[#0B69FF]">2</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">📞 PHONE</div>
                      <div className="font-bold text-sm text-[#0B69FF]">2</div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">→ VIEW ERRORS</span>
                  <span className="text-gray-400">in 57 directories</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Reviews Overview with link to Review List */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Reviews</h2>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-bold text-[#0B69FF] hover:underline flex items-center gap-1"
              >
                <span>Go to Review List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase">OVERVIEW ⓘ</div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-extrabold text-gray-900">3.8</div>
                  <div>
                    <div className="flex text-amber-400 text-sm">★★★★☆</div>
                    <div className="text-[11px] text-gray-400">NUMBER OF REVIEWS: 90</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-2">
                  <div className="flex items-center justify-between">
                    <span className="w-24 text-[10px] text-gray-500 uppercase">POSITIVE</span>
                    <div className="flex-1 mx-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[40%]" />
                    </div>
                    <span className="font-mono text-gray-700 text-xs">36</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="w-24 text-[10px] text-gray-500 uppercase">NEUTRAL</span>
                    <div className="flex-1 mx-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gray-400 h-full w-[8%]" />
                    </div>
                    <span className="font-mono text-gray-700 text-xs">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="w-24 text-[10px] text-gray-500 uppercase">NEGATIVE</span>
                    <div className="flex-1 mx-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[14%]" />
                    </div>
                    <span className="font-mono text-gray-700 text-xs">10</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-gray-500 hover:text-[#0B69FF] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>→ VIEW ALL (90)</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="text-[11px] font-bold text-gray-400 uppercase">TOP SOURCES ⓘ</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50/50 space-y-1">
                    <div className="font-bold text-xs">Google</div>
                    <div className="font-bold text-sm text-gray-900">★ 3.56</div>
                    <div className="text-[10px] text-gray-400">16 reviews</div>
                  </div>
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50/50 space-y-1">
                    <div className="font-bold text-xs">Tripadvisor</div>
                    <div className="font-bold text-sm text-gray-900">★ 3.70</div>
                    <div className="text-[10px] text-gray-400">16 reviews</div>
                  </div>
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50/50 space-y-1">
                    <div className="font-bold text-xs">Facebook</div>
                    <div className="font-bold text-sm text-gray-900">★ 4.33</div>
                    <div className="text-[10px] text-gray-400">9 reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REVIEW LIST (Exact match to Screenshots 2 & 3)                     */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
          {/* Source Filter Pills Bar matching Screenshot 2 */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-xs">
            {/* All sources active pill */}
            <button
              onClick={() => setSelectedSourceFilter('All sources')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedSourceFilter === 'All sources'
                  ? 'bg-[#3B4252] text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>All sources</span>
            </button>

            {/* Google */}
            <button
              onClick={() => setSelectedSourceFilter('Google')}
              className={`px-3 py-1.5 rounded-md font-medium border flex items-center gap-2 transition-colors cursor-pointer ${
                selectedSourceFilter === 'Google'
                  ? 'bg-blue-50 border-[#0B69FF] text-[#0B69FF]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-bold text-blue-600">G</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 3.56</span>
              <span className="text-gray-400">16</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => setSelectedSourceFilter('Facebook')}
              className={`px-3 py-1.5 rounded-md font-medium border flex items-center gap-2 transition-colors cursor-pointer ${
                selectedSourceFilter === 'Facebook'
                  ? 'bg-blue-50 border-[#0B69FF] text-[#0B69FF]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-bold text-blue-800">f</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 4.33</span>
              <span className="text-gray-400">9</span>
            </button>

            {/* Tripadvisor */}
            <button
              onClick={() => setSelectedSourceFilter('Tripadvisor')}
              className={`px-3 py-1.5 rounded-md font-medium border flex items-center gap-2 transition-colors cursor-pointer ${
                selectedSourceFilter === 'Tripadvisor'
                  ? 'bg-blue-50 border-[#0B69FF] text-[#0B69FF]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>🦉</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 3.70</span>
              <span className="text-gray-400">16</span>
            </button>

            {/* Yelp */}
            <button
              onClick={() => setSelectedSourceFilter('Yelp')}
              className="px-3 py-1.5 rounded-md font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="font-bold text-red-600">Y</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 4.00</span>
              <span className="text-gray-400">3</span>
            </button>

            {/* Trustpilot */}
            <button
              onClick={() => setSelectedSourceFilter('Trustpilot')}
              className="px-3 py-1.5 rounded-md font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="font-bold text-emerald-600">★</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">★ 3.67</span>
              <span className="text-gray-400">3</span>
            </button>

            {/* More (5) */}
            <button className="px-3 py-1.5 rounded-md font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1">
              <span>More (5)</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Reviews Header Bar: Counter, Filters, Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Reviews</h2>
              <div className="text-xs text-gray-500">Showing 1-10 of 60</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Filter reviews by star rating, answered status, or date')}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span>FILTERS (0)</span>
              </button>
              <button
                onClick={() => {
                  const csv =
                    'data:text/csv;charset=utf-8,Source,Rating,Date,Author,Review,Status,Language\n' +
                    reviewsList.map((r) => `"${r.source}","${r.rating || 'None'}","${r.date}","${r.author}","${r.text.replace(/"/g, '""')}","${r.status}","${r.language}"`).join('\n');
                  const encodedUri = encodeURI(csv);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', 'reviews-list.csv');
                  document.body.appendChild(link);
                  link.click();
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>EXPORT</span>
              </button>
            </div>
          </div>

          {/* Exact Reviews Table (Screenshot 2 & 3) */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3">SOURCE</th>
                    <th className="px-5 py-3">RATING</th>
                    <th className="px-5 py-3">DATE ⌄</th>
                    <th className="px-5 py-3">REVIEW</th>
                    <th className="px-5 py-3">STATUS</th>
                    <th className="px-5 py-3">LANGUAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {reviewsList.map((rev) => (
                    <tr key={rev.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Source */}
                      <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{rev.sourceIcon}</span>
                          <span>{rev.source}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {rev.rating !== null ? (
                          <div className="flex items-center gap-1 font-bold text-gray-900">
                            <span>{rev.rating}</span>
                            <span className="text-amber-400">★</span>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs italic">☆ Not rated</div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{rev.date}</td>

                      {/* Review text & author */}
                      <td className="px-5 py-4 max-w-md">
                        <p className="text-gray-800 text-xs leading-relaxed line-clamp-2">
                          {rev.text}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          <button
                            onClick={() => setActiveReviewModal(rev)}
                            className="text-[#0B69FF] font-semibold hover:underline cursor-pointer"
                          >
                            Show more
                          </button>
                          <span className="text-gray-400 font-medium">{rev.author}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-xs">
                            {rev.status === 'Needs attention' ? (
                              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                Needs attention
                              </span>
                            ) : rev.status === 'Not read' ? (
                              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                                Not read
                              </span>
                            ) : rev.status === 'Answered' ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                                Answered
                              </span>
                            ) : (
                              <span className="text-gray-700 font-medium">Read</span>
                            )}
                          </div>
                          <button
                            onClick={() => setActiveReviewModal(rev)}
                            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 cursor-pointer pt-0.5"
                          >
                            <Eye className="w-3 h-3 text-gray-400" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="px-5 py-4 whitespace-nowrap text-gray-500 font-bold font-mono">
                        {rev.language}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Row matching Screenshot 2 */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 bg-white">
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-400 cursor-not-allowed">
                  &lt;
                </button>
                <button className="px-3 py-1 bg-[#0B69FF] text-white rounded font-bold">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">4</button>
                <span>...</span>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">6</button>
                <button className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-50">&gt;</button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span>Go to page:</span>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span>View on page:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 bg-white">
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT CHECKLIST (Screenshot 1 / Screenshot 4)                      */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-3">
              <div
                onClick={() => setSelectedAuditSection('gbp')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAuditSection === 'gbp'
                    ? 'bg-[#3B4252] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>Google Business Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> 0
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-300" /> 0
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-300" /> 1
                  </span>
                </div>
              </div>

              <div
                onClick={() => setSelectedAuditSection('listings')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAuditSection === 'listings'
                    ? 'bg-[#3B4252] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Business Listings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> 10
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-300" /> 0
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-300" /> 0
                  </span>
                </div>
              </div>

              <div
                onClick={() => setSelectedAuditSection('reviews')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAuditSection === 'reviews'
                    ? 'bg-[#3B4252] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Reviews</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" /> 8
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-300" /> 1
                  </span>
                  <span className="flex items-center gap-1 text-blue-300">
                    <span className="w-2 h-2 rounded-full bg-blue-300" /> 44
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3 text-xs font-semibold">
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`flex items-center gap-1 cursor-pointer ${
                    auditFilter === 'all' ? 'text-[#0B69FF] font-bold border-b-2 border-[#0B69FF] pb-1' : 'text-gray-500'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ALL (69)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('errors')}
                  className={`flex items-center gap-1 cursor-pointer ${
                    auditFilter === 'errors' ? 'text-red-600 font-bold border-b-2 border-red-500 pb-1' : 'text-gray-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>ERRORS (18)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('warnings')}
                  className={`flex items-center gap-1 cursor-pointer ${
                    auditFilter === 'warnings' ? 'text-amber-600 font-bold border-b-2 border-amber-500 pb-1' : 'text-gray-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>WARNINGS (1)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('notices')}
                  className={`flex items-center gap-1 cursor-pointer ${
                    auditFilter === 'notices' ? 'text-blue-600 font-bold border-b-2 border-blue-500 pb-1' : 'text-gray-500'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>NOTICES (50)</span>
                </button>
                <button
                  onClick={() => setAuditFilter('passed')}
                  className={`flex items-center gap-1 cursor-pointer ${
                    auditFilter === 'passed' ? 'text-emerald-600 font-bold border-b-2 border-emerald-500 pb-1' : 'text-gray-500'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PASSED CHECKS (9)</span>
                </button>
              </div>

              {(selectedAuditSection === 'gbp' || auditFilter === 'all') && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900">Google Business Profile</h3>
                  <div className="divide-y divide-gray-100 text-xs">
                    <div className="py-2.5 flex items-center justify-between text-emerald-700 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Company category added</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div className="py-2.5 flex items-center justify-between text-emerald-700 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Company address added</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>

                    <div className="py-2.5 space-y-1.5">
                      <div
                        onClick={() => toggleAccordion('gbp-service-area')}
                        className="flex items-center justify-between cursor-pointer text-blue-700 font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Service area not added</span>
                        </div>
                        {expandedChecklistItems['gbp-service-area'] ? (
                          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      {expandedChecklistItems['gbp-service-area'] && (
                        <p className="text-[11.5px] text-gray-500 leading-relaxed pl-4">
                          Specify the areas in which you deliver goods or provide services to the customer&apos;s address. You can add multiple service areas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(selectedAuditSection === 'listings' || auditFilter === 'all') && (
                <div className="space-y-3 pt-4">
                  <h3 className="font-bold text-sm text-gray-900">Business Listings</h3>
                  <div className="divide-y divide-gray-100 text-xs">
                    <div className="py-2.5 space-y-1.5">
                      <div
                        onClick={() => toggleAccordion('listings-not-all-active')}
                        className="flex items-center justify-between cursor-pointer text-red-700 font-medium"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Company is not added to all active directories</span>
                        </div>
                        {expandedChecklistItems['listings-not-all-active'] ? (
                          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      {expandedChecklistItems['listings-not-all-active'] && (
                        <p className="text-[11.5px] text-gray-500 leading-relaxed pl-4">
                          Being listed in various business directories serves as an additional source of traffic for a business, improves its rankings in local search, and increases its brand awareness.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Matching All Screenshots */}
      <footer className="mt-12 py-5 px-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[13px]">
            <span className="w-4 h-4 rounded bg-[#0B69FF] flex items-center justify-center text-white text-[10px] font-black">
              S
            </span>
            <span>SE Ranking</span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-500 text-[11.5px]">
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Report a bug
          </a>
          <a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Affiliates
          </a>
          <Link href="/api-docs" className="hover:text-gray-900 transition-colors">
            API
          </Link>
          <a href="https://seranking.com/blog/whats-new/" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            What&apos;s new
          </a>
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Help
          </a>
        </div>
      </footer>

      {/* Review View & Reply Modal */}
      {activeReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeReviewModal.sourceIcon}</span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{activeReviewModal.source} Review</h3>
                  <div className="text-[11px] text-gray-400">By {activeReviewModal.author} on {activeReviewModal.date}</div>
                </div>
              </div>
              <button onClick={() => setActiveReviewModal(null)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                {activeReviewModal.rating !== null ? (
                  <>
                    <span>{activeReviewModal.rating}.0</span>
                    <span>{'★'.repeat(activeReviewModal.rating)}</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-normal">Not rated</span>
                )}
              </div>
              <p className="p-3 bg-gray-50 rounded-lg text-gray-800 leading-relaxed border border-gray-200/60">
                &ldquo;{activeReviewModal.text}&rdquo;
              </p>
            </div>

            {activeReviewModal.reply && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-900">Your Response:</div>
                <p className="text-emerald-800">{activeReviewModal.reply}</p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <label className="block font-semibold text-gray-700">Reply to customer</label>
              <textarea
                rows={3}
                placeholder="Write a professional reply to post to review source..."
                value={reviewReplyText}
                onChange={(e) => setReviewReplyText(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewModal(null)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveReply(activeReviewModal.id)}
                  className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-md font-semibold shadow-xs cursor-pointer"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {isAddLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0B69FF]" />
                Add New Business Location
              </h3>
              <button onClick={() => setIsAddLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Location connected successfully!');
                setIsAddLocationModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Folk Osteria &amp; Bar"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Highland Dr, City, State ZIP"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
