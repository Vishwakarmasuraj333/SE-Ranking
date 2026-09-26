'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
  Globe2,
  BarChart3,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Layers,
  FileSearch,
  Building,
  Check,
  CreditCard,
  Bot,
  ExternalLink,
  Database,
  Code2,
  FileText,
  Megaphone,
  GraduationCap,
  Radio,
  Target,
  Key,
  Globe,
  Award,
  Sliders,
  CheckSquare,
  MapPin,
  Briefcase,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Compass,
  Smile,
  Tag,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { PartnerLogos } from '@/components/landing/PartnerLogos';
import { HeroAvatarSlider } from '@/components/landing/HeroAvatarSlider';

// 10 languages list matching official SE Ranking language-switcher-2025
const languages = [
  { code: 'en', label: 'English', href: '/' },
  { code: 'de', label: 'Deutsch', href: 'https://seranking.com/de/' },
  { code: 'fr', label: 'Français', href: 'https://seranking.com/fr/' },
  { code: 'es', label: 'Español', href: 'https://seranking.com/es/' },
  { code: 'nl', label: 'Nederlands', href: 'https://seranking.com/nl/' },
  { code: 'it', label: 'Italiano', href: 'https://seranking.com/it/' },
  { code: 'pt', label: 'Português', href: 'https://seranking.com/pt/' },
  { code: 'ua', label: 'Українська', href: 'https://seranking.com/ua/' },
  { code: 'ru', label: 'Русский', href: 'https://seranking.com/ru/' },
  { code: 'あ', label: '日本語', href: 'https://seranking.com/jp/' },
];

// Mock chart data for SEO Rankings
const mockRankingsTrend = [
  { date: 'Jun 24', top1: 18, top3: 42, top10: 110 },
  { date: 'Jun 25', top1: 22, top3: 48, top10: 125 },
  { date: 'Jun 26', top1: 28, top3: 56, top10: 142 },
  { date: 'Jun 27', top1: 34, top3: 65, top10: 168 },
  { date: 'Jun 28', top1: 39, top3: 74, top10: 189 },
  { date: 'Jun 29', top1: 46, top3: 86, top10: 215 },
];

// Case studies data (7 items) - Exact screenshot match
const caseStudies = [
  {
    company: 'Fractional Teams',
    meta: 'a UK-based digital marketing and product consulting agency, centralized reporting with SE Ranking',
    link: 'https://seranking.com/blog/fractional-teams-success-story/',
    metric1: '50% less',
    desc1: 'time spent on reporting',
    metric2: '30 minutes',
    desc2: 'needed for initial report setup',
  },
  {
    company: 'EYClick',
    meta: 'a Spanish digital marketing agency, tripled traffic for a local restaurant',
    link: 'https://seranking.com/blog/eyclick-success-story/',
    metric1: '#1 position',
    desc1: 'for competitive local terms',
    metric2: '20+ keywords',
    desc2: 'ranking in Google’s Top 10',
  },
  {
    company: 'Japan Ski Experience',
    meta: 'a UK-based company specializing in ski holidays, reduced dependence on PPC through SEO',
    link: 'https://seranking.com/blog/japan-ski-experience-case-study/',
    metric1: '59%',
    desc1: 'of target keywords in the top 5 positions',
    metric2: '61.2 overall',
    desc2: 'in search visibility',
  },
  {
    company: 'Cardeseo',
    meta: 'a Spanish-based SEO agency, helped several struggling clients get more visibility',
    link: 'https://seranking.com/blog/cardeseo-success-story/',
    metric1: '5.7M',
    desc1: 'impressions',
    metric2: '54.4K',
    desc2: 'clicks',
  },
  {
    company: 'hurra.com™',
    meta: "a German digital marketing agency, automated SEO and SEA workflows with SE Ranking's API",
    link: 'https://seranking.com/blog/hurra-com-success-story/',
    metric1: '+140%',
    desc1: 'in SEO revenue',
    metric2: '+21%',
    desc2: 'in SEA revenue',
  },
  {
    company: 'Pilote Consulting',
    meta: 'a French digital marketing agency, grew local hotel bookings by 38%',
    link: 'https://seranking.com/blog/pilote-consulting-success-story/',
    metric1: '9,500 visits',
    desc1: 'per month in 7 months',
    metric2: '30% decrease',
    desc2: 'in paid search budget',
  },
  {
    company: 'Votre Site Pro',
    meta: 'a Belgian website creation agency, automated reporting and SEO insights',
    link: 'https://seranking.com/blog/votre-site-pro-success-story/',
    metric1: '48% less',
    desc1: 'spending on SEO tools',
    metric2: '3 hours',
    desc2: 'per week saves on reporting',
  },
];

// Ecosystem SE Ranking multi-line curve data (Sep 23 - Sep 29)
const ecoRankingsData = [
  { date: 'Sep 23', rank1: 14, rank2: 17, rank3: 20, rank4: 25 },
  { date: 'Sep 24', rank1: 17, rank2: 21, rank3: 23, rank4: 27 },
  { date: 'Sep 25', rank1: 16, rank2: 23, rank3: 27, rank4: 31 },
  { date: 'Sep 26', rank1: 22, rank2: 24, rank3: 28, rank4: 31 },
  { date: 'Sep 27', rank1: 24, rank2: 27, rank3: 29, rank4: 29 },
  { date: 'Sep 28', rank1: 19, rank2: 23, rank3: 26, rank4: 28 },
  { date: 'Sep 29', rank1: 23, rank2: 25, rank3: 29, rank4: 31 },
];

// Ecosystem SE Visible multi-line curve data (Aug 24 - Aug 29)
const ecoVisibleData = [
  { date: 'Aug 24', you: 45, smx: 68, pubcon: 38, techSeo: 62, competitors: 50 },
  { date: 'Aug 25', you: 62, smx: 52, pubcon: 58, techSeo: 48, competitors: 54 },
  { date: 'Aug 26', you: 58, smx: 55, pubcon: 52, techSeo: 50, competitors: 58 },
  { date: 'Aug 27', you: 72, smx: 64, pubcon: 56, techSeo: 68, competitors: 62 },
  { date: 'Aug 28', you: 60, smx: 54, pubcon: 48, techSeo: 58, competitors: 56 },
  { date: 'Aug 29', you: 82, smx: 65, pubcon: 70, techSeo: 78, competitors: 68 },
];

// Ecosystem Planable stacked area data (Oct 7 - Oct 10)
const ecoPlanableData = [
  { date: 'Oct 7', ig: 18000, tiktok: 26000, fb: 19000, yt: 14000, linkedin: 12000 },
  { date: 'Oct 8', ig: 24000, tiktok: 34000, fb: 22000, yt: 18000, linkedin: 15000 },
  { date: 'Oct 9', ig: 42000, tiktok: 58000, fb: 38000, yt: 28000, linkedin: 22000 },
  { date: 'Oct 10', ig: 28000, tiktok: 39000, fb: 26000, yt: 21000, linkedin: 17000 },
];

// Agency Catalog Cards (Screenshot 5 exact match)
const agencyCatalogItems = [
  {
    id: 'pixelpulse',
    name: 'PixelPulse Agency',
    url: 'https://pixelpulseagency.com',
    location: 'Barcelona (Spain)',
    services: 'Digital Marketing, General SEO +11',
    industries: 'Technology, Healthcare, Retail +3',
    budget: 'No minimum budget',
    teamSize: '100+',
  },
  {
    id: 'fusion',
    name: 'Fusion Marketing',
    url: 'https://fusionmarketing.co.uk',
    location: 'London (UK)',
    services: 'SEO, Content Strategy +8',
    industries: 'Fintech, E-commerce +5',
    budget: '$2,500/mo',
    teamSize: '50-100',
  },
  {
    id: 'neonwave',
    name: 'NeonWave Digital',
    url: 'https://neonwavedigital.com',
    location: 'Berlin (Germany)',
    services: 'Technical SEO, Link Building +6',
    industries: 'SaaS, AI Startups +4',
    budget: '$5,000/mo',
    teamSize: '25-50',
  },
  {
    id: 'echo',
    name: 'Echo Marketing',
    url: 'https://echomarketing.io',
    location: 'Austin (USA)',
    services: 'Local SEO, PPC, Analytics +9',
    industries: 'Real Estate, Automotive +2',
    budget: 'No minimum budget',
    teamSize: '10-25',
  },
];

// Testimonials data (7 items) - Screenshot 5 exact match
const testimonials = [
  {
    quote:
      '“I’ve been using SE Ranking MCP server for months and it’s fantastic. My keyword research involves classifying keywords with a lot of ambiguity into families and locations. This MCP has saved me days of manual work — my research now takes a few hours instead of days”',
    name: 'Gus Pelogia',
    role: 'Senior SEO Product Manager (R&D) Indeed',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      '“The AI Visibility and GEO tracking in SE Ranking gave us early clarity on LLM citations across ChatGPT and Perplexity. We turned AI answers into our #1 referral channel in under 6 months.”',
    name: 'Marta Alonso',
    role: 'Head of Organic Growth, Softonic',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      '“SE Ranking has outpaced traditional suites by building native MCP integrations and AI SEO monitoring directly into their platform. It’s what modern search practitioners actually need.”',
    name: 'Kevin Indig',
    role: 'Strategic SEO Advisor (ex-Shopify, G2)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      '“Accurate rank tracking across 188 country DBs and mobile SERPs without hidden fees makes SE Ranking our default recommendation for international enterprise audits.”',
    name: 'Aleyda Solis',
    role: 'International SEO Consultant & Founder, Orainti',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      '“The Agency Pack is a game changer for client retention. Automated white-label reporting and client seats shaved 15 hours off each team lead\'s week.”',
    name: 'Luke Jordan',
    role: 'Director of SEO, Kaida Agency',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      '“Combining rank intelligence with social publishing in Planable streamlined our cross-channel marketing. Our team executes twice as fast without switching apps.”',
    name: 'Sarah Prescott',
    role: 'VP Digital Marketing, Wiser IT',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      '“We replaced three disparate tools with SE Ranking\'s unified studio. The depth of competitive gap analysis and API reliability is best-in-class.”',
    name: 'Marcus Vance',
    role: 'Chief Growth Officer, Tailor Brands',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  },
];

export default function LandingPage() {
  // Mobile drawer & language switcher states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  // Active Dropdown state for Desktop Navigation
  const [activeMenu, setActiveMenu] = useState<
    'suite' | 'solutions' | 'tools' | 'resources' | 'pricing' | 'api-mcp' | 'lang' | null
  >(null);

  // Sub-tabs inside dropdowns
  const [solutionsSubTab, setSolutionsSubTab] = useState<'business-type' | 'migrate'>('business-type');
  const [toolsSubTab, setToolsSubTab] = useState<
    'core-seo' | 'ai-search' | 'other-seo' | 'agency-pack' | 'content-marketing'
  >('core-seo');
  const [resourcesSubTab, setResourcesSubTab] = useState<'education' | 'customer-hub'>('education');
  const [apiSubTab, setApiSubTab] = useState<'api' | 'mcp'>('api');

  // Platform tabs (Complete AI SEO platform)
  const [platformTab, setPlatformTab] = useState<
    'ai-visibility' | 'seo-research' | 'seo-monitoring' | 'content-marketing' | 'local-marketing' | 'agency-kit' | 'integrations'
  >('ai-visibility');

  // Case study pagination index (0 to 6 = 1 to 7)
  const [caseStudyIdx, setCaseStudyIdx] = useState(0);

  // Product tour modal
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Hello bar visibility
  const [showHelloBar, setShowHelloBar] = useState(true);

  // Ecosystem section states
  const [ecoRankingTimeTab, setEcoRankingTimeTab] = useState<'CURRENT' | '7D' | '1M' | '3M' | '6M'>('7D');
  const [ecoRankingView, setEcoRankingView] = useState<'ALL' | 'WEBSITES' | 'GROUPS'>('ALL');
  const [ecoRankingGroupBy, setEcoRankingGroupBy] = useState<'DAYS' | 'WEEKS' | 'MONTHS'>('DAYS');
  const [isEcoGroupByOpen, setIsEcoGroupByOpen] = useState(false);
  const [ecoVisibleMetric, setEcoVisibleMetric] = useState<'score' | 'avg_pos'>('score');
  const [ecoVisibleSourceTab, setEcoVisibleSourceTab] = useState<'domains' | 'urls'>('domains');
  const [ecoVisibleCategory, setEcoVisibleCategory] = useState('All');
  const [isEcoCategoryOpen, setIsEcoCategoryOpen] = useState(false);

  // Agency Pack tabs
  const [agencyPackTab, setAgencyPackTab] = useState<
    'catalog' | 'reporting' | 'lead-gen' | 'white-label' | 'seats'
  >('catalog');

  // Testimonials carousel index (0 to 6 = 1 to 7)
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Dynamic Footer states matching seranking.com
  const [isFooterLangOpen, setIsFooterLangOpen] = useState(false);
  const [footerLang, setFooterLang] = useState('English');

  return (
    <div
      className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900"
      onClick={() => setActiveMenu(null)}
    >
      {/* 1. Green HelloBar at Top (Exact screenshot match) */}
      {showHelloBar && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2.5 pb-1">
          <div className="bg-[#008871] text-white py-2.5 px-6 rounded-xl text-center text-sm font-semibold tracking-wide flex items-center justify-between relative shadow-xs">
            <div className="flex-1 text-center">
              <Link
                href="https://visible.seranking.com/?utm_source=seranking&utm_medium=hellobar&utm_campaign=visible"
                className="hover:underline text-white font-semibold inline-flex items-center gap-1.5"
              >
                <span>Start doing more with your AI Visibility Data</span>
                <span className="font-bold">→</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHelloBar(false);
              }}
              className="text-white/80 hover:text-white transition-opacity p-1 cursor-pointer shrink-0"
              aria-label="Close Announcement"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Header (Spacious, Clean, Bold) */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-8">
            {/* 9-Dots Suite Switcher Button & Dropdown */}
            <div
              className="relative py-4"
              onMouseEnter={() => setActiveMenu('suite')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'suite' ? null : 'suite')}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="App Switcher"
              >
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="7.25" y="1" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="13.5" y="1" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="1" y="7.25" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="7.25" y="7.25" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="13.5" y="7.25" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="1" y="13.5" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="7.25" y="13.5" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                  <rect x="13.5" y="13.5" width="3.5" height="3.5" rx="0.8" fill="#4B5563" />
                </svg>
              </button>

              {activeMenu === 'suite' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1.5">
                  {/* SE Ranking */}
                  <div className="p-3 bg-blue-50/80 rounded-xl flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0B69FF] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L3 9V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9L12 2Z" fill="none" stroke="white" strokeWidth="2" />
                          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">SE Ranking</div>
                        <div className="text-xs text-gray-500">Grow your visibility with AI SEO</div>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-[#0B69FF] shrink-0" />
                  </div>

                  {/* SE Visible */}
                  <a
                    href="https://visible.seranking.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 hover:bg-gray-50 rounded-xl flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 font-black text-sm">
                        N
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                          <span>SE Visible</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" />
                        </div>
                        <div className="text-xs text-gray-500">Analyze AI visibility strategically</div>
                      </div>
                    </div>
                  </a>

                  {/* Planable */}
                  <a
                    href="https://planable.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 hover:bg-gray-50 rounded-xl flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 font-black text-sm">
                        ▲
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                          <span>Planable</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" />
                        </div>
                        <div className="text-xs text-gray-500">Manage your socials as a team</div>
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* SE Ranking Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <SeRankingLogo variant="brand" width={140} height={32} />
            </Link>

            {/* Desktop Navigation Links & Dropdowns */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-sm font-bold text-gray-800">
              {/* 1. Solutions Dropdown */}
              <div
                className="relative py-6"
                onMouseEnter={() => setActiveMenu('solutions')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'solutions' ? null : 'solutions')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMenu === 'solutions' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeMenu === 'solutions' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 mt-1 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex gap-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Left Column */}
                    <div className="w-52 space-y-1.5 pr-2 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => setSolutionsSubTab('business-type')}
                        className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          solutionsSubTab === 'business-type'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>By business type</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <a
                        href="https://seranking.com/migration.html"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>Migrate to SE Ranking</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-1.5 pl-1">
                      <Link
                        href="/agency-pack"
                        onClick={() => setActiveMenu(null)}
                        className="p-3 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                          Agencies
                        </span>
                      </Link>

                      <Link
                        href="/project-overview"
                        onClick={() => setActiveMenu(null)}
                        className="p-3 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                          Enterprises
                        </span>
                      </Link>

                      <Link
                        href="/projects"
                        onClick={() => setActiveMenu(null)}
                        className="p-3 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                          Growing business
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Tools Dropdown */}
              <div
                className="relative py-6"
                onMouseEnter={() => setActiveMenu('tools')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMenu === 'tools' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Tools</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeMenu === 'tools' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'tools' && (
                  <div className="absolute top-full -left-12 mt-1 w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex gap-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Left Column (Categories) */}
                    <div className="w-60 space-y-1 pr-2 border-r border-gray-100">
                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('core-seo')}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          toolsSubTab === 'core-seo'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Core SEO tools</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('ai-search')}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          toolsSubTab === 'ai-search'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>AI Search tools</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('other-seo')}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          toolsSubTab === 'other-seo'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Other SEO tools</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('agency-pack')}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          toolsSubTab === 'agency-pack'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Agency Pack</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('content-marketing')}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          toolsSubTab === 'content-marketing'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Content Marketing</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <Link
                        href="/local-marketing"
                        onClick={() => setActiveMenu(null)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>Local Marketing Software</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </Link>

                      <Link
                        href="/api-docs"
                        onClick={() => setActiveMenu(null)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>Integrations</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-1 pl-1">
                      {toolsSubTab === 'core-seo' && (
                        <>
                          <Link
                            href="/rankings"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <BarChart3 className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Rank Tracker
                            </span>
                          </Link>

                          <Link
                            href="/research/keyword-research"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Key className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Keyword Research
                            </span>
                          </Link>

                          <Link
                            href="/website-audit/on-page"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Search className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              On-Page SEO Checker
                            </span>
                          </Link>

                          <Link
                            href="/website-audit"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <FileSearch className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Website Audit
                            </span>
                          </Link>

                          <Link
                            href="/research/competitive-research"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Target className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Competitor Analysis Tool
                            </span>
                          </Link>

                          <Link
                            href="/backlinks"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Backlink Checker
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'ai-search' && (
                        <>
                          <Link
                            href="/research/ai-search"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              AI Overviews Tracker
                            </span>
                          </Link>
                          <Link
                            href="/research/ai-search"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              AI Visibility Studio
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'other-seo' && (
                        <>
                          <Link
                            href="/website-audit/serp-analyzer"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Sliders className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              SERP Tracker
                            </span>
                          </Link>
                          <Link
                            href="/keyword-grouper"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Layers className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Keyword Grouper
                            </span>
                          </Link>
                          <Link
                            href="/page-changes"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Webpage Monitor
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'agency-pack' && (
                        <>
                          <Link
                            href="/agency-pack"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                              <Award className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Agency Pack &amp; White Label
                            </span>
                          </Link>
                          <Link
                            href="/reports"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              SEO Report Generator
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'content-marketing' && (
                        <Link
                          href="/content-marketing"
                          onClick={() => setActiveMenu(null)}
                          className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                            Content Marketing Tool
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Resources Dropdown */}
              <div
                className="relative py-6"
                onMouseEnter={() => setActiveMenu('resources')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'resources' ? null : 'resources')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMenu === 'resources' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeMenu === 'resources' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'resources' && (
                  <div className="absolute top-full left-0 mt-1 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex gap-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Left Column */}
                    <div className="w-52 space-y-1.5 pr-2 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => setResourcesSubTab('education')}
                        className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          resourcesSubTab === 'education'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Education</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setResourcesSubTab('customer-hub')}
                        className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          resourcesSubTab === 'customer-hub'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>Customer Hub</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <a
                        href="https://seranking.com/agency-catalog/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>Agency Catalog</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-1.5 pl-1">
                      {resourcesSubTab === 'education' ? (
                        <>
                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Blog
                            </span>
                          </Link>

                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Megaphone className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Webinars
                            </span>
                          </Link>

                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Radio className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Podcast
                            </span>
                          </Link>

                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Academy
                            </span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <a
                            href="https://help.seranking.com"
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Building className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Help Center
                            </span>
                          </a>
                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Award className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Case Studies
                            </span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Pricing Dropdown */}
              <div
                className="relative py-6"
                onMouseEnter={() => setActiveMenu('pricing')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'pricing' ? null : 'pricing')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMenu === 'pricing' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Pricing</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeMenu === 'pricing' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'pricing' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2.5 space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <a
                      href="#pricing"
                      onClick={() => setActiveMenu(null)}
                      className="p-3 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                        Platform plans
                      </span>
                    </a>

                    <Link
                      href="/api-docs"
                      onClick={() => setActiveMenu(null)}
                      className="p-3 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                        API Plans
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. API & MCP Dropdown */}
              <div
                className="relative py-6"
                onMouseEnter={() => setActiveMenu('api-mcp')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'api-mcp' ? null : 'api-mcp')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMenu === 'api-mcp' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>API &amp; MCP</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeMenu === 'api-mcp' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'api-mcp' && (
                  <div className="absolute top-full -left-20 mt-1 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex gap-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Left Column */}
                    <div className="w-52 space-y-1.5 pr-2 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => setApiSubTab('api')}
                        className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          apiSubTab === 'api'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>API</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setApiSubTab('mcp')}
                        className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                          apiSubTab === 'mcp'
                            ? 'bg-[#E0F2FE] text-[#0f172a]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>MCP</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      <a
                        href="https://seranking.com/our-data.html"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>Our data</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>

                      <Link
                        href="/api-docs"
                        onClick={() => setActiveMenu(null)}
                        className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <span>API Pricing</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-1.5 pl-1">
                      {apiSubTab === 'api' ? (
                        <>
                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Code2 className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              API
                            </span>
                          </Link>

                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Key className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Keyword Research API
                            </span>
                          </Link>

                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Globe className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Backlinks API
                            </span>
                          </Link>

                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Globe2 className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Domain Analysis API
                            </span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Bot className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              SE Ranking MCP Server
                            </span>
                          </Link>

                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="p-2.5 rounded-xl hover:bg-blue-50/70 flex items-center gap-3.5 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Claude Integration
                            </span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Header Navigation Items */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* 10-Language Selector Dropdown */}
            <div
              className="relative py-4 hidden md:block"
              onMouseEnter={() => setActiveMenu('lang')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'lang' ? null : 'lang')}
                className="px-2.5 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-1.5 text-sm font-bold text-gray-800 transition-colors cursor-pointer"
              >
                <span className="uppercase text-xs font-black tracking-wide">
                  {selectedLang}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {activeMenu === 'lang' && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="space-y-0.5">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(l.code);
                          setActiveMenu(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-colors cursor-pointer ${
                          selectedLang === l.code
                            ? 'bg-[#E0F2FE] text-[#0B69FF] font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="uppercase font-bold text-[11px] w-6 text-center bg-gray-100 rounded-md py-0.5">
                          {l.code}
                        </span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* "Sign in" link matching Screenshot */}
            <Link
              href="/login"
              className="hidden sm:inline-block text-sm font-semibold text-gray-800 hover:text-[#0B69FF] transition-colors"
            >
              Sign in
            </Link>

            {/* "See product tour" button matching Screenshot */}
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-gray-900 text-gray-900 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span>See product tour</span>
            </button>

            {/* "Start free trial" Blue Button matching Screenshot */}
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Start free trial</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Navigation"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-5 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-3 text-sm font-bold text-gray-800">
              <Link href="/rankings" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Rank Tracker</Link>
              <Link href="/website-audit" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Website Audit</Link>
              <Link href="/research/ai-search" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">AI Visibility</Link>
              <Link href="/backlinks" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Backlinks</Link>
              <Link href="/agency-pack" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">Agency Pack</Link>
              <Link href="/api-docs" onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-gray-50">API &amp; MCP</Link>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsTourOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-sm font-bold text-gray-800"
              >
                See product tour
              </button>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-5 py-2.5 bg-[#0B69FF] text-white rounded-xl text-sm font-bold"
              >
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section (Spacious, Big Bold Typography matching Screenshot) */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-6 sm:px-8 max-w-5xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl md:text-[68px] font-extrabold text-gray-900 tracking-[-0.03em] leading-[1.08]">
          Don’t just track visibility. Validate&nbsp;it.
        </h1>

        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
          Give your team the cross-channel context to prove the value of every decision across<br className="hidden sm:inline" /> SEO, GEO, and social.
        </p>

        {/* Hero CTAs matching Screenshot: Start free trial & See product tour */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-base font-bold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>Start free trial</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-900 hover:bg-gray-50 text-gray-900 text-base font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <span>See product tour</span>
          </button>
        </div>

        {/* Micro copy under buttons */}
        <div className="text-xs text-gray-400 font-normal">
          No credit card required
        </div>

        {/* Social Proof: Cycling 3 Agency Avatars with Smooth Transition + Trusted by 40,000+ agencies */}
        <div className="pt-6 flex items-center justify-center">
          <HeroAvatarSlider />
        </div>

        {/* Static 6 Partner Logos row matching screenshot (NO MOVING MARQUEE SLIDER) */}
        <div className="pt-8 pb-4 flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-14 text-gray-600 select-none">
          {/* soapbox */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L3 26H29L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M16 9L8 23H24L16 9Z" fill="currentColor" opacity="0.3" />
            </svg>
            <span className="font-black text-base sm:text-lg tracking-tight lowercase">soapbox</span>
          </div>

          {/* Nex Brand Marketing */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="text-left leading-none">
              <span className="font-extrabold text-xs tracking-wider uppercase block">Nex Brand</span>
              <span className="text-[8px] font-semibold text-gray-500 uppercase tracking-widest block">Marketing</span>
            </div>
          </div>

          {/* Tailor Brands */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-extrabold text-xs tracking-wider uppercase block">Tailor</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Brands</span>
            </div>
          </div>

          {/* Wiser IT SEO Company */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0 2 6 6 0 0 0 6 6 1 1 0 0 1 2 0 6 6 0 0 0 6-6 1 1 0 0 1 2 0 8 8 0 0 1-6.93 6.93z" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-black text-xs tracking-wider uppercase block">Wiser IT</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">SEO Company</span>
            </div>
          </div>

          {/* Kaida */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full border border-current" />
            </div>
            <span className="font-black text-sm tracking-widest uppercase">Kaida</span>
          </div>

          {/* Neary Hayes */}
          <div className="text-left leading-none hover:text-gray-900 transition-colors">
            <span className="font-serif italic font-bold text-sm block">neary</span>
            <span className="font-serif italic font-bold text-sm block pl-2">hayes</span>
          </div>
        </div>
      </section>

      {/* 4. Complete AI SEO platform for every challenge (Spacious & Clean matching Screenshot) */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-24 bg-white px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Complete AI SEO platform for every challenge
            </h2>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm">
            {[
              { id: 'ai-visibility', label: 'AI Visibility' },
              { id: 'seo-research', label: 'SEO Research' },
              { id: 'seo-monitoring', label: 'SEO Monitoring' },
              { id: 'content-marketing', label: 'Content Marketing' },
              { id: 'local-marketing', label: 'Local Marketing' },
              { id: 'agency-kit', label: 'Agency Success Kit' },
              { id: 'integrations', label: 'Integrations' },
            ].map((tab) => {
              const isActive = platformTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPlatformTab(tab.id as any)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1D2533] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2-Column Section Layout matching Screenshot */}

          {/* TAB 1: AI Visibility (Exact Screenshot 1 & 2 Match) */}
          {platformTab === 'ai-visibility' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Interactive Mockup Card */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                {/* Header Bar with AI Engines */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/70 pb-3">
                  <span className="text-base font-black text-gray-900">AI Visibility</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                        ✦
                      </div>
                      ChatGPT
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                        G
                      </div>
                      AI Mode
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer">
                      <Sparkles className="w-4 h-4 text-purple-600" /> Gemini
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-teal-600 transition-colors cursor-pointer">
                      <span className="text-teal-600 font-black text-sm leading-none">*</span> Perplexity
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-amber-600 transition-colors cursor-pointer">
                      <Zap className="w-4 h-4 text-amber-600" /> Claude
                    </span>
                  </div>
                </div>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Visibility */}
                  <div className="p-3.5 bg-[#D5F5EE] rounded-2xl border border-[#A7E8D8] relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Visibility</span>
                      <span className="text-[10px] bg-white text-gray-700 font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                        6d
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-black text-gray-900">99%</span>
                      <span className="text-[11px] text-emerald-800 font-bold bg-[#A7E8D8] px-1.5 py-0.2 rounded">
                        ↗ 8,4
                      </span>
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Rank</span>
                      <Award className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-2">#1</div>
                  </div>

                  {/* Avg. position */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Avg. position</span>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-black text-gray-900">2.61</span>
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                        ↘ 1,3
                      </span>
                    </div>
                  </div>

                  {/* Net sentiment */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Net sentiment</span>
                      <Smile className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-black text-gray-900">+78</span>
                      <span className="text-[11px] text-pink-700 font-bold bg-pink-100 px-1.5 py-0.2 rounded">
                        ↘ 1,5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lower Row: Chart & Competitors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Left: Visibility Chart */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">Visibility</span>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-md font-bold text-gray-900 shadow-2xs">
                          Visibility score
                        </span>
                        <span className="text-gray-400 font-semibold px-1.5">Avg position</span>
                      </div>
                    </div>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockRankingsTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                          <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="top1" stroke="#1864FF" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="top3" stroke="#10B981" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="top10" stroke="#D946EF" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Competitors Table */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-xs font-bold text-gray-900 block pb-1 border-b border-gray-100">
                      Competitors
                    </span>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-gray-400 border-b border-gray-100 pb-1">
                          <th className="font-bold py-1">#</th>
                          <th className="font-bold py-1">Visibility</th>
                          <th className="font-bold py-1">Avg position</th>
                          <th className="font-bold py-1">Net sentiment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-blue-600">
                            <span>1</span>
                            <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">b</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">99%</td>
                          <td className="py-2 text-gray-600 font-medium">2.61</td>
                          <td className="py-2 font-bold text-gray-900">+78</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-blue-600">
                            <span>2</span>
                            <span className="w-4 h-4 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">Q</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">83%</td>
                          <td className="py-2 text-gray-600 font-medium">2.75</td>
                          <td className="py-2 font-bold text-gray-900">+44</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-purple-600">
                            <span>3</span>
                            <span className="w-4 h-4 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">E</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">80%</td>
                          <td className="py-2 text-gray-600 font-medium">5.11</td>
                          <td className="py-2 font-bold text-gray-900">+40</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-emerald-600">
                            <span>4</span>
                            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">*</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">72%</td>
                          <td className="py-2 text-gray-600 font-medium">5.87</td>
                          <td className="py-2 font-bold text-gray-900">+39</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Explanations & CTAs */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[27px] font-black text-gray-900 leading-snug">
                  Analyze your brand&apos;s visibility across major AI search engines with SE Visible by SE Ranking — track mentions, sentiment, and share of voice, and benchmark competitors to grow your AI presence.
                </h3>

                <ul className="space-y-3.5 text-sm text-gray-800">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1864FF] text-lg leading-none font-black">•</span>
                    <span><strong>Comprehensive visibility analysis</strong> across 5 major AI engines</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1864FF] text-lg leading-none font-black">•</span>
                    <span><strong>Competitive benchmarks for AI visibility</strong>, share of voice, and the gaps to close</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1864FF] text-lg leading-none font-black">•</span>
                    <span><strong>In-depth analysis</strong> of the prompts and sources behind AI answers</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <a
                    href="https://visible.seranking.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Try SE Visible
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO Research (Exact Screenshot 3 Match) */}
          {platformTab === 'seo-research' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: SEO Research Card */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Left Column of Left Card: Organic & Paid Traffic Cards */}
                  <div className="md:col-span-5 space-y-3">
                    {/* Organic Traffic */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                          ORGANIC TRAFFIC
                        </span>
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                          🍃
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-gray-900">11.3M</span>
                        <span className="text-xs text-emerald-600 font-bold">▲ 215.9K</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium block mt-1">Clicks/mo</span>
                    </div>

                    {/* Paid Traffic */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                          PAID TRAFFIC
                        </span>
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                          $
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-gray-900">12.9K</span>
                        <span className="text-xs text-emerald-600 font-bold">▲ 41.7K</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium block mt-1">Clicks/mo</span>
                    </div>
                  </div>

                  {/* Right Column of Left Card: Traffic Chart with Google Update Badge */}
                  <div className="md:col-span-7 p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                      <span className="font-bold text-[#1864FF] border-b-2 border-[#1864FF] pb-1.5 cursor-pointer">
                        TOTAL TRAFFIC
                      </span>
                      <span className="font-bold text-gray-500 hover:text-gray-900 cursor-pointer">KEYWORDS</span>
                      <span className="font-bold text-gray-500 hover:text-gray-900 cursor-pointer">BACKLINKS</span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-gray-400">
                      <span className="hover:text-gray-900 cursor-pointer">6M</span>
                      <span className="hover:text-gray-900 cursor-pointer">12M</span>
                      <span className="hover:text-gray-900 cursor-pointer">18M</span>
                      <span className="hover:text-gray-900 cursor-pointer">24M</span>
                      <span className="hover:text-gray-900 cursor-pointer">30M</span>
                      <span className="hover:text-gray-900 cursor-pointer">36M</span>
                      <span className="text-[#1864FF] bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer">ALL</span>
                    </div>

                    <div className="h-36 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { month: 'Mar', organic: 38000, paid: 52000 },
                            { month: 'Apr', organic: 52000, paid: 46000 },
                            { month: 'May', organic: 45000, paid: 72000 },
                            { month: 'Jun', organic: 62000, paid: 38000 },
                            { month: 'Jul', organic: 58000, paid: 45000 },
                            { month: 'Aug', organic: 68000, paid: 50000 },
                            { month: 'Sep', organic: 82000, paid: 64000 },
                          ]}
                        >
                          <defs>
                            <linearGradient id="orgGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1864FF" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#1864FF" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 100000]} ticks={[0, 25000, 50000, 75000, 100000]} />
                          <Area type="monotone" dataKey="organic" stroke="#10B981" strokeWidth={2} fill="url(#orgGrad)" />
                          <Area type="monotone" dataKey="paid" stroke="#1864FF" strokeWidth={2} fill="url(#paidGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Organic
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600" /> Paid
                        </span>
                      </div>
                      <button type="button" className="p-1 rounded bg-gray-50 text-gray-500 hover:bg-gray-100">
                        <ChevronRight className="w-3.5 h-3.5 rotate-[-90deg]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Wide Tile: Referring Domains, Backlinks, Domain Trust */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase flex items-center gap-1">
                      REFFERING DOMAINS <span className="text-[10px] text-gray-400">ⓘ</span>
                    </span>
                    <span className="text-xl font-black text-gray-900 block mt-1">962.8K</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Analyzed only the top 10 000 domains</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase flex items-center gap-1">
                      BACKLINKS <span className="text-[10px] text-gray-400">ⓘ</span>
                    </span>
                    <span className="text-xl font-black text-gray-900 block mt-1">13.9M</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Analyzed only the top 10 000 backlinks</span>
                  </div>

                  <div className="space-y-1.5 border-l border-gray-100 pl-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-600 uppercase text-[10px]">DOMAIN TRUST</span>
                      <span className="font-black text-gray-900 text-sm">96</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-600 uppercase text-[10px]">PAGE TRUST</span>
                      <span className="font-black text-gray-900 text-sm">72</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 leading-tight">
                  Build winning SEO strategies with unique traffic, keyword, and backlink datasets powered by advanced AI and ML technologies!
                </h3>

                <div className="space-y-3.5 text-base font-bold text-gray-900">
                  <Link href="/research/keyword-research" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Keyword Suggestion Tool</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/research/competitive-research" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Competitive Research</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/backlinks" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Backlink Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/research/competitive-research" className="flex items-center gap-2 text-[#1864FF] underline underline-offset-4 cursor-pointer group">
                    <span>SERP Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform no-underline">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO Monitoring (Exact Screenshot 4 Match) */}
          {platformTab === 'seo-monitoring' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Monitoring Card */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                {/* Top Row: 3 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Average Position */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">AVERAGE POSITION</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-gray-900">34</span>
                      <span className="text-xs text-emerald-600 font-bold">- 51</span>
                    </div>
                    {/* Blue wave sparkline */}
                    <div className="h-7 w-full mt-2">
                      <svg viewBox="0 0 100 25" className="w-full h-full text-blue-500" fill="none">
                        <path d="M0 20 Q 20 5, 40 18 T 80 8 T 100 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Traffic Forecast */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">TRAFIC FORECAST</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-gray-900">520</span>
                      <span className="text-xs text-pink-600 font-bold">- 245</span>
                    </div>
                    <div className="h-7 w-full mt-2">
                      <svg viewBox="0 0 100 25" className="w-full h-full text-blue-500" fill="none">
                        <path d="M0 15 Q 30 22, 60 10 T 100 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Search Visibility */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">SEARCH VISIBILITY</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-gray-900">0.66</span>
                      <span className="text-xs text-emerald-600 font-bold">▲ 0.34</span>
                    </div>
                    <div className="h-7 w-full mt-2">
                      <svg viewBox="0 0 100 25" className="w-full h-full text-blue-500" fill="none">
                        <path d="M0 22 Q 25 8, 50 18 T 100 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Health Score Semi-Gauge, Backlinks Chart, Page Quality Score Polar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Health Score Gauge */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between text-center">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block text-left">HEALTH SCORE</span>
                    <div className="py-2 flex flex-col items-center justify-center">
                      <div className="relative w-28 h-16 flex items-end justify-center">
                        <svg viewBox="0 0 100 60" className="w-28 h-16">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 0 1 78 22" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-x-0 bottom-0 text-center leading-none">
                          <span className="text-2xl font-black text-gray-900 block">87</span>
                          <span className="text-[10px] text-gray-500 font-bold">Strong</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] space-y-1 text-left border-t border-gray-100 pt-2 font-medium">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Your website
                        </span>
                        <span className="font-bold text-gray-900">87 ▲ 4</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Recommended
                        </span>
                        <span className="font-bold text-gray-900">90+</span>
                      </div>
                    </div>
                  </div>

                  {/* Backlinks Trend Area */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-500 uppercase">BACKLINKS</span>
                        <span className="text-[9px] text-gray-400 font-bold">3M 6M 12M</span>
                      </div>
                      <div className="h-28 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { period: 'Apr 23', links: 20 },
                              { period: 'May 24', links: 30 },
                              { period: 'Jun 25', links: 10 },
                            ]}
                          >
                            <defs>
                              <linearGradient id="blGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1864FF" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#1864FF" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="period" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} domain={[0, 40]} ticks={[10, 20, 30]} />
                            <Area type="monotone" dataKey="links" stroke="#1864FF" strokeWidth={2} fill="url(#blGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Page Quality Score Polar Radar */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">PAGE QUALITY SCORE</span>
                    <div className="py-2 flex items-center justify-center relative">
                      <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-100 flex items-center justify-center relative">
                        {/* Colorful segmented petals */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-purple-600 border-r-blue-600 border-b-gray-800" />
                        </div>
                        <span className="text-xl font-black text-gray-900 relative z-10">78</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-400 flex flex-wrap justify-between pt-1 border-t border-gray-100 font-semibold">
                      <span>Usability</span>
                      <span>Indexing</span>
                      <span>Domain</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 leading-tight">
                  Track your SEO progress and make timely adjustments to your strategy based on actionable insights
                </h3>

                <div className="space-y-3.5 text-base font-bold text-gray-900">
                  <Link href="/rankings" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Rank Tracker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/website-audit" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Website Audit</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/backlinks" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Backlink Monitor</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/website-audit/on-page" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>On-Page SEO Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Content Marketing (Exact Screenshot 5 Match) */}
          {platformTab === 'content-marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Content Editor Mockup Card */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Left Column: Rich Text Document View */}
                  <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-2 text-gray-600 text-xs border-b border-gray-100 pb-2">
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">↶</button>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">↷</button>
                      <span className="text-gray-300">|</span>
                      <span className="font-semibold text-gray-800">Paragraph ▾</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-black text-gray-900">B</span>
                      <span className="italic font-bold text-gray-800">I</span>
                      <span className="underline font-bold text-gray-800">U</span>
                      <span className="line-through text-gray-500">S</span>
                      <span className="text-gray-400">🖌</span>
                    </div>

                    {/* Article Content */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase shrink-0 mt-0.5">
                          H1
                        </span>
                        <h4 className="font-black text-gray-900 text-sm leading-tight">
                          Scientifically Tested Search Engine Optimization
                        </h4>
                      </div>

                      <div className="flex items-start gap-2 pt-1 text-gray-600 text-[11px] leading-relaxed">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase shrink-0 mt-0.5">
                          P
                        </span>
                        <div className="space-y-1.5">
                          <p>
                            Search engine optimization (SEO) is a highly effective method of attracting new customers and qualified leads to your website, but only when it&apos;s done right.
                          </p>
                          <p>
                            We don&apos;t guess, assume, or hope for the best with your SEO. We develop our SEO strategies around thorough research and scientifically-tested data. And we prove our results every time.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Readability bar at bottom of document */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-500 uppercase text-[10px]">READABILITY</span>
                        <span className="font-bold text-blue-600 text-[11px]">Plain text</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-black text-gray-900">62</span>
                        <span className="text-xs text-emerald-600 font-bold">▲ 1</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full w-[62%]" />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 mt-1 font-semibold">
                        <span>Very difficult</span>
                        <span>Very easy</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Content Score, Brief Progress, Quality Score Radar */}
                  <div className="md:col-span-5 space-y-3">
                    {/* Content Score Donut */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-base font-black text-gray-900">80</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">CONTENT SCORE</span>
                        <span className="text-[11px] text-gray-600 font-medium block">
                          Average score: 65 | TOP score: 80
                        </span>
                      </div>
                    </div>

                    {/* Brief Progress */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">BRIEF PROGRESS</span>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-700">
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                          70%
                        </span>
                        <span>Words: 595 ↑</span>
                        <span>Headings: 18 ✓</span>
                      </div>
                    </div>

                    {/* Quality Score Radar */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block text-left">QUALITY SCORE</span>
                      <div className="py-1 flex items-center justify-center">
                        <div className="relative w-20 h-20 rounded-full border border-dashed border-gray-200 flex items-center justify-center">
                          <span className="text-lg font-black text-gray-900">72</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                        <span>Grammar</span>
                        <span>Punctuation</span>
                        <span>Stop words</span>
                      </div>
                    </div>

                    {/* One Click Article Generation */}
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>One click article generation</span>
                      <button type="button" className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">
                        ✦
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 leading-tight">
                  Create new content faster and get AI-powered optimization tips to help your existing pages rock the SERP
                </h3>

                <div className="space-y-3.5 text-base font-bold text-gray-900">
                  <Link href="/content-marketing" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Content Marketing Tool</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/content-marketing" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Content Editor</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/content-marketing/idea-finder" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>AI Writer</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Local Marketing */}
          {platformTab === 'local-marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Local Marketing Card */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">LOCAL RANKINGS</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-gray-900">86%</span>
                      <span className="text-xs text-emerald-600 font-bold">▲ 8.2%</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1">Local 3-Pack Presence</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">REVIEWS &amp; RATING</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-gray-900">4.8</span>
                      <span className="text-amber-500 font-bold">★</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-1">1,420 total reviews</span>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">NAP CONSISTENCY</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-gray-900">98%</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1">57 Directories synced</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900 pb-1 border-b border-gray-100">
                    <span>Geo-Grid Google Maps Rankings</span>
                    <span className="text-emerald-600 font-bold text-[10px]">9x9 Grid Active</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold py-2">
                    <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">#1</span>
                    <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">#1</span>
                    <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">#1</span>
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">#2</span>
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">#2</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 leading-tight">
                  Dominate Google Maps and local search for all your business locations with complete local SEO tools
                </h3>

                <div className="space-y-3.5 text-base font-bold text-gray-900">
                  <Link href="/local-marketing" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Local Marketing Tool</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/local-marketing" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Google Business Profile Optimization</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/rankings" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Local Rank Tracker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/local-marketing" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Listing &amp; NAP Management</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Agency Success Kit (Exact Screenshot 6 Match) */}
          {platformTab === 'agency-kit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Agency Kit Card */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                {/* Top Row: Report Setup & Gauge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Left: Schedule & Format Options */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">Export format:</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded border border-red-100">PDF</span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-100">XLS</span>
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded border border-blue-100">HTML</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-gray-700">Shedule report</span>
                      <div className="w-8 h-4.5 bg-cyan-400 rounded-full relative cursor-pointer">
                        <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-xs" />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Set shedule:</span>
                        <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Daily ▾</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Set time:</span>
                        <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Not selected ▾</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Timezone:</span>
                        <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">GMT +1:00 ▾</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: SEO Report Preview */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 text-center flex flex-col justify-between">
                    <div className="flex justify-end">
                      <span className="text-[10px] font-bold px-2 py-1 bg-gray-900 text-white rounded-md cursor-pointer">
                        + My Logo
                      </span>
                    </div>
                    <div>
                      <span className="text-base font-black text-gray-900 block">SEO Report</span>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">JAN - 19   JAN - 25</span>
                    </div>
                    <div className="py-2 flex justify-center">
                      <div className="w-28 h-14 overflow-hidden relative">
                        <svg viewBox="0 0 100 50" className="w-28 h-14">
                          <path d="M 10 50 A 40 40 0 0 1 35 15" fill="none" stroke="#00B8D9" strokeWidth="16" />
                          <path d="M 35 15 A 40 40 0 0 1 65 15" fill="none" stroke="#FF5630" strokeWidth="16" />
                          <path d="M 65 15 A 40 40 0 0 1 90 50" fill="none" stroke="#0052CC" strokeWidth="16" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Bar: Account Type (Owner, Client, Manager) */}
                <div className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="text-gray-400 font-semibold uppercase text-[10px]">ACCOUNT TYPE</span>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5 text-gray-900">🛡 Owner</span>
                    <span className="flex items-center gap-1.5 text-gray-700">👤 Client</span>
                    <span className="flex items-center gap-1.5 text-gray-700">💬 Manager</span>
                  </div>
                </div>

                {/* Bottom Row: Leads & Conversion Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">LEADS</span>
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div>
                        <span className="text-xl font-black text-gray-900 block">12</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">TODAY</span>
                      </div>
                      <div>
                        <span className="text-xl font-black text-gray-900 block">197</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">PER MONTH</span>
                      </div>
                      <div>
                        <span className="text-xl font-black text-gray-900 block">9</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">AVG. PER DAY</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">CONVERSION RATE</span>
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div>
                        <span className="text-xl font-black text-gray-900 block">1.3%</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">TODAY</span>
                      </div>
                      <div>
                        <span className="text-xl font-black text-gray-900 block">0.6%</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">PER MONTH</span>
                      </div>
                      <div>
                        <span className="text-xl font-black text-gray-900 block">0.9%</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">AVG. PER DAY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 leading-tight">
                  Get support at every stage of the client management cycle: from lead gen to winning clients&apos; loyalty
                </h3>

                <div className="space-y-3.5 text-base font-bold text-gray-900">
                  <Link href="/reports" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Scheduled SEO reports</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/agency-pack" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>White Label</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/agency-pack" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Lead Generator</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Integrations (Exact Screenshot 7 Match) */}
          {platformTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: 5 Integrations Boxes */}
              <div className="lg:col-span-7 bg-[#F0F4F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Analytics */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">ANALYTICS</span>
                    <div className="flex items-center gap-3">
                      {/* GA */}
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center p-2 border border-amber-100">
                        <div className="w-full h-full bg-amber-500 rounded-sm" />
                      </div>
                      {/* GSC */}
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center p-2 border border-blue-100">
                        <div className="w-full h-full bg-blue-500 rounded-sm" />
                      </div>
                      {/* Ads */}
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center p-2 border border-emerald-100">
                        <div className="w-full h-full bg-emerald-500 rounded-sm" />
                      </div>
                      {/* Looker */}
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center p-2 border border-purple-100">
                        <div className="w-full h-full bg-purple-500 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Reporting */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">REPORTING</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                        8
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs border border-red-100">
                        W
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 font-black text-xs border border-blue-100">
                        A
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-xs border border-cyan-100">
                        R
                      </div>
                    </div>
                  </div>

                  {/* Automation */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">AUTOMATION</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-xs border border-pink-100">
                        ⚯
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs border border-emerald-100">
                        ⊞
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-sm border border-orange-100">
                        *
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-100">
                        III
                      </div>
                    </div>
                  </div>

                  {/* Business Profile */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">BUSINESS PROFILE</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                        G
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-800 font-bold text-xs border border-blue-100">
                        f
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 font-bold text-xs border border-gray-200">
                        
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs border border-teal-100">
                        b
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website Builder (Full Width) */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">WEBSITE BUILDER</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 font-black text-xs border border-gray-200">
                      W
                    </div>
                    <div className="px-3 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 font-black text-xs tracking-wider border border-gray-200">
                      WiX
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Link & Button */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-gray-900 leading-tight">
                  Connect SE Ranking to GA4, GSC, Data Studio, Make.com, n8n, and other tools your workflows run on
                </h3>

                <div className="space-y-3.5 text-base font-bold text-gray-900">
                  <Link href="/api-docs" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Inegrations</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    href="/signup"
                    className="px-8 py-3.5 bg-[#1864FF] hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer inline-block"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Power up your stack, workflows, and reporting with SE Ranking data (Spacious & Clean) */}
      <section className="py-20 sm:py-28 px-6 sm:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight">
            Power up your stack, workflows, and reporting with SE Ranking data
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Pull search performance and AI visibility data directly into your own tools via API or query it live inside AI assistants via MCP
          </p>
        </div>

        {/* 4 Feature Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-sm">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#0B69FF]" /> Data on your terms
            </h3>
            <p className="text-gray-600 pl-4 leading-relaxed">
              Access rankings, keywords, backlinks, and AI visibility insights directly via SE Ranking API. No manual exports.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#0B69FF]" /> Reporting built around your logic
            </h3>
            <p className="text-gray-600 pl-4 leading-relaxed">
              Connect SE Ranking to Data Studio, Whatagraph, Agency Analytics, and more to build dashboards that reflect your workflows.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#0B69FF]" /> Workflows that run without you
            </h3>
            <p className="text-gray-600 pl-4 leading-relaxed">
              Automate complex processes across multiple client projects via Make.com, n8n, or Zapier without coding.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#0B69FF]" /> Live data inside your AI assistant
            </h3>
            <p className="text-gray-600 pl-4 leading-relaxed">
              Connect via MCP and get structured SE Ranking data inside Claude, ChatGPT, or any other AI chatbot.
            </p>
          </div>
        </div>

        <div className="text-left">
          <Link
            href="/projects"
            className="px-6 py-3 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-sm font-bold rounded-xl transition-all shadow-xs inline-block"
          >
            Start free trial
          </Link>
        </div>

        {/* Stack Flow Diagram matching exact screenshot */}
        <div className="space-y-4 pt-4">
          {/* Top Sources Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm font-bold text-gray-700">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Analytics
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2">
              <Database className="w-5 h-5 text-blue-600" /> Search Console
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> AI Visibility
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Social Data
            </div>
          </div>

          {/* Center Banner: SE Ranking API */}
          <div className="p-6 bg-gradient-to-r from-emerald-100/70 to-emerald-50 rounded-3xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-xl font-black text-gray-900">SE Ranking API</div>
            <div className="p-4 bg-white/95 rounded-2xl border border-emerald-200 font-mono text-xs space-y-1.5 text-gray-800 shadow-2xs">
              <div><strong className="text-purple-600">POST</strong> https://api4.seranking.com/audit/create...</div>
              <div><strong className="text-blue-600">GET</strong> https://api4.seranking.com/backlinks...</div>
              <div><strong className="text-purple-600">POST</strong> https://api4.seranking.com/key-volume...</div>
              <div><strong className="text-blue-600">GET</strong> https://api4.seranking.com/site...</div>
            </div>
          </div>

          {/* Connectors Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm font-bold text-gray-700">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">n8n</div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">make</div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200">zapier</div>
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2">
              <Bot className="w-4 h-4 text-[#0B69FF]" /> MCP
            </div>
          </div>

          {/* Bottom Destinations Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm font-bold text-gray-700">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-gray-500" /> Live Dashboards
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2.5">
              <Zap className="w-5 h-5 text-gray-500" /> Automated Alerts
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center gap-2.5">
              <FileText className="w-5 h-5 text-gray-500" /> PDF Reports
            </div>
          </div>
        </div>
      </section>

      {/* 6. Precise. Credible. AI-Ready. It's all about our unique data (5 Bento Cards Spacious) */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-200 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight">
              Precise. Credible. AI-Ready. It&apos;s all about our unique data
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              The SE Ranking AI SEO platform relies on advanced data processing algorithms to deliver unique insights. We regularly expand our databases and securely store them.
            </p>
          </div>

          {/* 5 Distinct Bento Data Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1: 188 Country Databases (Mint Green) */}
            <div className="p-8 bg-[#BBF7D0]/60 rounded-3xl flex flex-col justify-between h-52 sm:h-56 shadow-2xs">
              <div className="flex justify-end">
                <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center">
                  <span className="w-4 h-4 bg-gray-800 rounded-xs" />
                </div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-gray-900">188</div>
                <div className="text-xs font-black uppercase tracking-wider text-gray-800 mt-1">
                  Country Databases
                </div>
              </div>
            </div>

            {/* Card 2: AI Powered Algorithms (Vibrant Purple) */}
            <div className="p-8 bg-[#6366F1] text-white rounded-3xl flex flex-col justify-between h-52 sm:h-56 shadow-2xs">
              <div className="flex justify-end">
                <Sparkles className="w-9 h-9 text-white/90" />
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-white">AI</div>
                <div className="text-xs font-black uppercase tracking-wider text-white/90 mt-1">
                  Powered Algorithms
                </div>
              </div>
            </div>

            {/* Card 3: 5.5B Keyword Database (Deep Dark Navy) */}
            <div className="p-8 bg-[#1E1B4B] text-white rounded-3xl flex flex-col justify-between h-52 sm:h-56 shadow-2xs">
              <div className="flex justify-end">
                <Database className="w-9 h-9 text-indigo-300" />
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-white">5.5B</div>
                <div className="text-xs font-black uppercase tracking-wider text-indigo-200 mt-1">
                  Keyword Database
                </div>
              </div>
            </div>

            {/* Card 4: 2.2B Domain Profiles (Light Ice Gray) */}
            <div className="p-8 bg-[#F1F5F9] rounded-3xl flex flex-col justify-between h-52 sm:h-56 shadow-2xs sm:col-span-1">
              <div className="flex justify-end">
                <div className="w-12 h-12 rounded-full border border-gray-300 flex flex-col items-center justify-center gap-1 bg-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                </div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-gray-900">2.2B</div>
                <div className="text-xs font-black uppercase tracking-wider text-gray-600 mt-1">
                  Domain Profiles
                </div>
              </div>
            </div>

            {/* Card 5: 100% Accurate Keyword Rankings (Light Cyan Sky) */}
            <div className="p-8 bg-[#E0F2FE] rounded-3xl flex flex-col justify-between h-52 sm:h-56 shadow-2xs sm:col-span-2">
              <div className="flex justify-end">
                <div className="w-12 h-12 flex items-center justify-center text-[#0B69FF]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-gray-900">100%</div>
                <div className="text-xs font-black uppercase tracking-wider text-gray-700 mt-1">
                  Accurate Keyword Rankings
                </div>
              </div>
            </div>
          </div>

          {/* G2 Awards Strip (Screenshot 2 Exact Match) */}
          <div className="p-8 sm:p-10 bg-gray-50 rounded-3xl border border-gray-200 text-center space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Highly rated by large teams running SEO at scale
            </h3>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Don&apos;t just take our word for it, check out our latest awards from G2
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {[
                { name: 'Leader', color: '#FF492C', trim: 'border-b-[#FF492C]' },
                { name: 'Most Implementable', color: '#0B69FF', trim: 'border-b-[#0B69FF]' },
                { name: 'Best Results', color: '#8B5CF6', trim: 'border-b-[#8B5CF6]' },
                { name: 'Momentum Leader', color: '#F97316', trim: 'border-b-[#F97316]' },
                { name: 'Best Relationship', color: '#06B6D4', trim: 'border-b-[#06B6D4]' },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className="w-24 sm:w-28 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm text-center flex flex-col justify-between h-32 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-[7px] font-black uppercase text-gray-400">SPRING 2024</span>
                    <span className="w-3.5 h-3.5 bg-[#FF492C] text-white rounded-xs text-[8px] font-black flex items-center justify-center">
                      G
                    </span>
                  </div>
                  <div className="my-auto py-1">
                    <span className="text-[11px] font-extrabold text-gray-900 leading-tight block">
                      {badge.name}
                    </span>
                  </div>
                  {/* Colored Ribbon Tail Accent */}
                  <div className="pt-1 border-t border-gray-100">
                    <div
                      className="h-1.5 w-full rounded-full"
                      style={{ backgroundColor: badge.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link
                href="/projects"
                className="px-7 py-3 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-sm font-bold rounded-xl transition-colors inline-block shadow-xs"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Brand visibility across the ecosystem (Screenshots 3 & 4 Exact Match) */}
      <section className="py-16 sm:py-24 bg-[#F0FDF4]/30 border-t border-gray-200 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              Brand visibility across the ecosystem
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
              Don&apos;t stop at SEO. Add AI search intelligence and social performance to see the full picture.
            </p>
          </div>

          {/* Card 1: SE Ranking (SEO & GEO) - Screenshot 3 Exact */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0B69FF] flex items-center justify-center text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 9V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9L12 2Z" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-lg sm:text-xl text-gray-900">SE Ranking</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] px-3 py-1 rounded-md">
                SEO&amp;GEO
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              Track rankings, research competitors, analyze brand mentions, and pull SEO and GEO data into your own workflows and reporting systems with API access.
            </p>

            {/* 4 Metric Cards with Mini Sparklines */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm pt-2">
              {/* Metric 1 */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Average Position
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">34</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    ▲ 51
                  </span>
                </div>
                {/* Sparkline wave */}
                <div className="h-6 w-full pt-1">
                  <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#0B69FF] stroke-2">
                    <path d="M 0 18 Q 15 5, 30 14 T 60 8 T 85 16 T 100 6" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Trafic Forecast
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">520</span>
                  <span className="text-xs font-bold text-rose-500 flex items-center">
                    ▼ 245
                  </span>
                </div>
                {/* Sparkline wave */}
                <div className="h-6 w-full pt-1">
                  <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#0B69FF] stroke-2">
                    <path d="M 0 14 Q 20 20, 40 10 T 70 18 T 100 8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Search Visibility
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">0.66</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    ▲ 0.34
                  </span>
                </div>
                {/* Sparkline wave */}
                <div className="h-6 w-full pt-1">
                  <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#0B69FF] stroke-2">
                    <path d="M 0 16 Q 25 6, 50 16 T 80 6 T 100 12" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  SERP Features
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">2</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    ▲ 1
                  </span>
                </div>
                {/* Sparkline bar bars */}
                <div className="h-6 w-full flex items-end gap-1.5 pt-1">
                  <span className="w-2.5 h-3 bg-blue-300 rounded-xs" />
                  <span className="w-2.5 h-5 bg-blue-600 rounded-xs" />
                  <span className="w-2.5 h-2 bg-blue-300 rounded-xs" />
                  <span className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                  <span className="w-2.5 h-6 bg-blue-700 rounded-xs" />
                  <span className="w-2.5 h-3 bg-blue-400 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Interactive Filter Bar matching Screenshot 3 */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs font-bold text-gray-600">
              {/* Time tabs */}
              <div className="flex items-center gap-4">
                {(['CURRENT', '7D', '1M', '3M', '6M'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEcoRankingTimeTab(tab)}
                    className={`pb-1 transition-colors cursor-pointer ${
                      ecoRankingTimeTab === tab
                        ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold'
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}

                {/* Group By dropdown */}
                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={() => setIsEcoGroupByOpen(!isEcoGroupByOpen)}
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900 uppercase tracking-wider font-bold"
                  >
                    <span>GROUP BY: {ecoRankingGroupBy}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {isEcoGroupByOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-20 w-32 space-y-1">
                      {(['DAYS', 'WEEKS', 'MONTHS'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setEcoRankingGroupBy(g);
                            setIsEcoGroupByOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold ${
                            ecoRankingGroupBy === g ? 'bg-blue-50 text-[#0B69FF]' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* View filters on right */}
              <div className="flex items-center gap-4">
                {(['ALL', 'WEBSITES', 'GROUPS'] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setEcoRankingView(view)}
                    className={`pb-1 transition-colors cursor-pointer ${
                      ecoRankingView === view
                        ? 'text-gray-900 border-b-2 border-gray-900 font-extrabold'
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-line curve chart (Sep 23 - Sep 29) */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                AVERAGE RANK
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={ecoRankingsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[10, 35]}
                    ticks={[10, 20, 30]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                  <Line type="monotone" dataKey="rank1" stroke="#84CC16" strokeWidth={2.5} dot={{ r: 4, fill: '#84CC16' }} />
                  <Line type="monotone" dataKey="rank2" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4, fill: '#06B6D4' }} />
                  <Line type="monotone" dataKey="rank3" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: '#8B5CF6' }} />
                  <Line type="monotone" dataKey="rank4" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Link href="/projects" className="text-xs sm:text-sm font-bold text-[#0B69FF] hover:underline inline-flex items-center gap-1.5 pt-2">
              <span>Explore SE Ranking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: SE Visible (AI VISIBILITY) - Screenshot 4 Exact */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0F766E] flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 18L10 6L14 14L20 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-bold text-lg sm:text-xl text-gray-900">SE Visible</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#CCFBF1] text-[#0F766E] px-3 py-1 rounded-md">
                AI VISIBILITY
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              Monitor where your brand appears and how AI platforms describe it across ChatGPT, Gemini, Perplexity, AI Overviews, AI Mode, and other emerging search experiences.
            </p>

            {/* 4-Box Grid inside SE Visible */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Top Left: Visibility Chart */}
              <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Visibility</span>
                  <div className="flex items-center gap-1.5 text-xs bg-gray-200/70 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEcoVisibleMetric('score')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        ecoVisibleMetric === 'score' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      Visibility score
                    </button>
                    <button
                      type="button"
                      onClick={() => setEcoVisibleMetric('avg_pos')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        ecoVisibleMetric === 'avg_pos' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      Avg position
                    </button>
                  </div>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ecoVisibleData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                      />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '10px' }} />
                      <Line type="monotone" dataKey="you" stroke="#14B8A6" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="smx" stroke="#1E293B" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="pubcon" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="techSeo" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="competitors" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend matching Screenshot 4 */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-600 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#14B8A6]" /> You</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1E293B]" /> Smx</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Pubcon</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Tech SEO connect</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Competitors</span>
                </div>
              </div>

              {/* Top Right: Competitors Table */}
              <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                <span className="text-sm font-bold text-gray-900 block">Competitors</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-200/80 pb-2">
                        <th className="font-bold py-2 w-8">#</th>
                        <th className="font-bold py-2">Brand</th>
                        <th className="font-bold py-2">Visibility</th>
                        <th className="font-bold py-2">Avg position</th>
                        <th className="font-bold py-2">Net sentiment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60 font-medium">
                      <tr>
                        <td className="py-2.5 font-bold text-gray-400">1</td>
                        <td className="py-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-sm bg-blue-600 text-white text-[9px] flex items-center justify-center font-black">b</span>
                          Brighto...
                        </td>
                        <td className="py-2.5 font-bold text-gray-900">99%</td>
                        <td className="py-2.5 text-gray-700">2.61</td>
                        <td className="py-2.5 font-bold text-emerald-600">+78</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-gray-400">2</td>
                        <td className="py-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-sm bg-sky-500 text-white text-[9px] flex items-center justify-center font-black">Q</span>
                          Smx
                        </td>
                        <td className="py-2.5 font-bold text-gray-900">83%</td>
                        <td className="py-2.5 text-gray-700">2.75</td>
                        <td className="py-2.5 font-bold text-emerald-600">+44</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-gray-400">3</td>
                        <td className="py-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-sm bg-purple-600 text-white text-[9px] flex items-center justify-center font-black">V</span>
                          Pubcon
                        </td>
                        <td className="py-2.5 font-bold text-gray-900">80%</td>
                        <td className="py-2.5 text-gray-700">5.11</td>
                        <td className="py-2.5 font-bold text-emerald-600">+40</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-gray-400">4</td>
                        <td className="py-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-sm bg-teal-500 text-white text-[9px] flex items-center justify-center font-black">✱</span>
                          Tech SE...
                        </td>
                        <td className="py-2.5 font-bold text-gray-900">72%</td>
                        <td className="py-2.5 text-gray-700">5.87</td>
                        <td className="py-2.5 font-bold text-emerald-600">+39</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Left: Net sentiment Donut Gauge */}
              <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-4">
                <span className="text-sm font-bold text-gray-900 block">Net sentiment</span>
                <div className="flex items-center gap-6">
                  {/* Circular progress meter */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="12" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#14B8A6"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset="52.7"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <div className="absolute text-2xl font-black text-gray-900">+79</div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="text-gray-500 leading-tight">
                      Analyzed 71 sentiment-bearing mentions
                    </div>
                    <div className="space-y-1.5 font-bold pt-1">
                      <div className="flex items-center gap-2 text-gray-800">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#14B8A6]" />
                        <span>79% Positive</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-sm bg-gray-400" />
                        <span>61% Neutral</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-pink-400" />
                        <span>0% Negative</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right: Sources Table */}
              <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">Sources</span>
                    <div className="flex items-center gap-1 text-[11px] bg-gray-200/70 p-0.5 rounded-md font-bold">
                      <button
                        type="button"
                        onClick={() => setEcoVisibleSourceTab('domains')}
                        className={`px-2 py-0.5 rounded-sm transition-all ${
                          ecoVisibleSourceTab === 'domains' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        Domains
                      </button>
                      <button
                        type="button"
                        onClick={() => setEcoVisibleSourceTab('urls')}
                        className={`px-2 py-0.5 rounded-sm transition-all ${
                          ecoVisibleSourceTab === 'urls' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        URLs
                      </button>
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsEcoCategoryOpen(!isEcoCategoryOpen)}
                      className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-semibold"
                    >
                      <span>Category: {ecoVisibleCategory}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {isEcoCategoryOpen && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md p-1 z-20 w-36 space-y-0.5 text-xs">
                        {['All', 'Conferences', 'News', 'Blogs'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setEcoVisibleCategory(c);
                              setIsEcoCategoryOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1 rounded hover:bg-gray-50 text-gray-700"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-200/80 pb-2">
                      <th className="font-bold py-2">Source</th>
                      <th className="font-bold py-2">Category</th>
                      <th className="font-bold py-2 text-right">Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 font-medium">
                    <tr>
                      <td className="py-2.5 font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        Emryo.com
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-gray-200/60 text-gray-700 rounded-md text-[10px] font-semibold">
                          SEO conferences
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-gray-900">100%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        Writesonic
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-gray-200/60 text-gray-700 rounded-md text-[10px] font-semibold">
                          SEO conferences
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-gray-900">88%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <a href="https://visible.seranking.com/" target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-bold text-[#0F766E] hover:underline inline-flex items-center gap-1.5 pt-2">
              <span>Explore SE Visible</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 3: Planable (SOCIAL) - Screenshot 4 Exact */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="7" r="3" />
                    <circle cx="7" cy="15" r="3" />
                    <circle cx="17" cy="15" r="3" />
                  </svg>
                </div>
                <span className="font-bold text-lg sm:text-xl text-gray-900">planable</span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] px-3 py-1 rounded-md">
                SOCIAL
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              Plan, collaborate, publish, and track social performance in one workflow. Use automations and API access to keep scheduling, approvals, reporting, and integrations running.
            </p>

            {/* Channel Legend Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-700 pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FB923C]" /> Instagram</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#2DD4BF]" /> TikTok</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" /> Facebook</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#60A5FA]" /> YouTube</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F43F5E]" /> LinkedIn</span>
              <span className="flex items-center gap-1.5 text-gray-400 border-b border-dashed border-gray-400">-- Incomplete data</span>
            </div>

            {/* 3 Big KPI Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Followers</span>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">150,716</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded flex items-center">
                    ↑ 1,416
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Impressions</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">2,154,703</span>
                  <span className="text-xs bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.5 rounded flex items-center">
                    ↓ 27%
                  </span>
                </div>
              </div>

              <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Engagements</span>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">41,967</span>
                  <span className="text-xs bg-gray-100 text-gray-600 font-extrabold px-1.5 py-0.5 rounded flex items-center">
                    → 0
                  </span>
                </div>
              </div>
            </div>

            {/* Stacked Multi-layer Wave Area Chart */}
            <div className="h-60 sm:h-72 w-full pt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ecoPlanableData}>
                  <defs>
                    <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorFb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="tiktok" stackId="1" stroke="#FB923C" fill="url(#colorYt)" />
                  <Area type="monotone" dataKey="ig" stackId="1" stroke="#2DD4BF" fill="url(#colorTiktok)" />
                  <Area type="monotone" dataKey="fb" stackId="1" stroke="#818CF8" fill="url(#colorFb)" />
                </AreaChart>
              </ResponsiveContainer>

              {/* Floating Tooltip Card matching Screenshot 4 */}
              <div className="absolute right-8 top-8 bg-white/95 backdrop-blur-xs border border-gray-200 rounded-xl shadow-lg p-3 text-xs space-y-1 z-10 hidden sm:block">
                <div className="text-[10px] text-gray-400 font-semibold">Oct 11, 2025</div>
                <div className="flex items-center gap-4 justify-between font-bold text-gray-900">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">♪</span> Jusco Juice
                  </span>
                  <span className="font-mono">32,718</span>
                </div>
              </div>
            </div>

            <a href="https://planable.io/" target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-bold text-[#0B69FF] hover:underline inline-flex items-center gap-1.5 pt-2">
              <span>Explore Planable</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 3 Cyan Value Props below Planable (Screenshot 5 Exact Match) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#38BDF8] text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                More context for your visibility
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                See how your brand performs across organic search, LLMs, and social to get a fuller visibility picture.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#38BDF8] text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                AI workflows on real brand data
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Link search performance, GEO insights, and social analytics to Claude, Cursor, or any other AI tool via MCP and API.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200/80 rounded-2xl shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#38BDF8] text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Cross-channel performance
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Find connections between channels, analyze dependencies, and act on the right signals instead of isolated metrics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Brand, grow, and win more clients with the Agency Pack (Screenshot 5 Exact Match) */}
      <section className="py-16 sm:py-24 bg-white border-t border-gray-200 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              Brand, grow, and win more clients with the Agency Pack
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
              Take control of your agency&apos;s client cycle with tools that help you attract prospects, deliver results, and build loyalty.
            </p>
          </div>

          {/* 5 Agency Pack Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold">
            {(
              [
                { id: 'catalog', label: 'Agency Catalog' },
                { id: 'reporting', label: 'White Label Reporting' },
                { id: 'lead-gen', label: 'Lead Generator' },
                { id: 'white-label', label: 'White Label' },
                { id: 'seats', label: 'Client Seats' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAgencyPackTab(t.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full transition-all cursor-pointer ${
                  agencyPackTab === t.id
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Tab: Agency Catalog */}
          {agencyPackTab === 'catalog' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="space-y-3 max-w-4xl">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Agency Catalog</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Jump into the spotlight with SE Ranking&apos;s Agency Pack! Secure a spot in our expert Agency Catalog, where your services take center stage in front of new prospects. Watch your leads soar, trust surge, and your agency thrive and grow.
                </p>
                <div className="pt-2">
                  <a
                    href="https://seranking.com/agency-catalog.html"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-[#1E293B] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl transition-all inline-block shadow-xs"
                  >
                    Browse catalog
                  </a>
                </div>
              </div>

              {/* 4 Agency Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {agencyCatalogItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 bg-gray-50/70 border border-gray-200/80 rounded-2xl hover:border-gray-300 transition-all space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900">{item.name}</div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#0B69FF] hover:underline block truncate"
                        >
                          {item.url}
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-200/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-16">Location</span>
                        <span className="font-semibold text-gray-800">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-16">Services</span>
                        <span className="font-semibold text-gray-800 truncate">{item.services}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-16">Industries</span>
                        <span className="font-semibold text-gray-800 truncate">{item.industries}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-16">Budget</span>
                        <span className="font-semibold text-gray-800">{item.budget}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500 w-16">Team size</span>
                        <span className="font-semibold text-gray-800">{item.teamSize}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic previews for other Agency Pack tabs */}
          {agencyPackTab !== 'catalog' && (
            <div className="p-8 bg-gray-50/70 border border-gray-200 rounded-3xl space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {agencyPackTab.replace('-', ' ')}
              </h3>
              <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                {agencyPackTab === 'reporting' &&
                  'Generate and send automated, custom-branded PDF reports to your clients with live ranking deltas, competitors, and KPI summaries on scheduled dates.'}
                {agencyPackTab === 'lead-gen' &&
                  'Embed a high-converting, custom SEO audit widget onto your agency website to capture qualified prospect contact information automatically.'}
                {agencyPackTab === 'white-label' &&
                  'Host SE Ranking under your own custom domain, logo, and brand color palette with zero third-party branding visible to clients.'}
                {agencyPackTab === 'seats' &&
                  'Invite unlimited client and contractor accounts with read-only or customizable role permissions tailored to each project.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/agency-pack"
                  className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs font-bold rounded-xl transition-all inline-block"
                >
                  Configure {agencyPackTab.replace('-', ' ')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. Why SEO pros from 150+ countries choose us (Screenshot 5 Exact Match) */}
      <section className="py-16 sm:py-24 bg-white border-t border-gray-200 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
            Why SEO pros from 150+ countries choose us
          </h2>

          {/* Pagination arrows */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                setTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
              }
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 cursor-pointer transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold text-gray-600 px-2">
              {testimonialIdx + 1} / {testimonials.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
              }
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 cursor-pointer transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Monospace Quote Box */}
          <div className="p-8 sm:p-10 bg-gray-50/70 border border-gray-200/80 rounded-3xl space-y-6 text-center max-w-3xl mx-auto">
            <p className="font-mono text-xs sm:text-sm md:text-base text-gray-800 leading-relaxed">
              {testimonials[testimonialIdx].quote}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                <img
                  src={testimonials[testimonialIdx].avatar}
                  alt={testimonials[testimonialIdx].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900">
                  {testimonials[testimonialIdx].name}
                </div>
                <div className="text-xs text-gray-500">
                  {testimonials[testimonialIdx].role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Pricing & Add-ons (Screenshot 6 Exact Match) */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-gray-200 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* 2 Featured Platform Plans matching Screenshot 6 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Plan 1: Essential / Growth */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  $103.20<span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
                <div className="pt-4">
                  <Link
                    href="/projects"
                    className="w-full py-3 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs block text-center"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs sm:text-sm text-gray-700">
                <div className="font-bold text-gray-900">Repeatable SEO + GEO delivery</div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Rank tracking across engines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Unlimited keyword &amp; comp. research</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Data Studio / Matomo / GA / GSC</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan 2: Pro / Business */}
            <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  $223.20<span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
                <div className="pt-4">
                  <Link
                    href="/projects"
                    className="w-full py-3 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs block text-center"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs sm:text-sm text-gray-700">
                <div className="font-bold text-gray-900">Multi-client SEO + GEO workflows</div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>All Core features included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Project Lifetime historical data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>API access with 300k credits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Need more? Upgrade with add-ons! */}
          <div className="text-center space-y-6 pt-4">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900">
              Need more? Upgrade with add-ons!
            </h2>

            {/* 3 Add-ons Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-7 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-gray-500">Agency Pack</div>
                <div className="text-xs text-gray-400">From</div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  $69.00<span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
              </div>

              <div className="p-7 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-gray-500">AI Search</div>
                <div className="text-xs text-gray-400">From</div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  $71.20<span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
              </div>

              <div className="p-7 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-gray-500">API</div>
                <div className="text-xs text-gray-400">From</div>
                <div className="text-3xl sm:text-4xl font-black text-gray-900">
                  $149.00<span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <a href="#pricing" className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#0B69FF] inline-flex items-center gap-1.5">
                <span>Explore pricing plans</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Customer Success Stories (Screenshot 6 Exact Match) */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 text-center leading-tight">
          How agencies, brands, and businesses worldwide win with SE Ranking
        </h2>

        {/* Dark Forest Green Box matching Screenshot 6 */}
        <div className="bg-[#032E1D] text-white rounded-3xl p-6 sm:p-12 space-y-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <h3 className="text-base sm:text-2xl font-bold text-white max-w-2xl leading-snug">
              {caseStudies[caseStudyIdx].company}, {caseStudies[caseStudyIdx].meta}
            </h3>
            <span className="text-xs font-bold text-[#4ade80] tracking-wider shrink-0 flex items-center gap-2">
              <span>{caseStudies[caseStudyIdx].company.toLowerCase()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div>
              <div className="text-3xl sm:text-5xl font-black text-[#4ade80]">
                {caseStudies[caseStudyIdx].metric1}
              </div>
              <div className="text-xs sm:text-sm text-gray-200 mt-2">
                {caseStudies[caseStudyIdx].desc1}
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-5xl font-black text-[#4ade80]">
                {caseStudies[caseStudyIdx].metric2}
              </div>
              <div className="text-xs sm:text-sm text-gray-200 mt-2">
                {caseStudies[caseStudyIdx].desc2}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination & View all case studies */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-2">
          <a
            href="https://seranking.com/blog/category-customer-stories/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-gray-900 hover:text-[#0B69FF] inline-flex items-center gap-1.5"
          >
            <span>View all case studies</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setCaseStudyIdx((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1))
              }
              className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer text-gray-700"
              aria-label="Previous case study"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold text-gray-700 px-2">
              {caseStudyIdx + 1} / {caseStudies.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCaseStudyIdx((prev) => (prev + 1) % caseStudies.length)
              }
              className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer text-gray-700"
              aria-label="Next case study"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 12. Full Width Royal Blue CTA Banner (Screenshot 6 Exact Match) */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="bg-[#0B69FF] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-lg">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Get 14 days of full access to the SE Ranking platform!
          </h2>
          <div className="pt-2">
            <Link
              href="/projects"
              className="px-8 py-3.5 bg-[#4ADE80] hover:bg-[#22C55E] text-[#052E16] font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-md inline-block"
            >
              Start free trial
            </Link>
          </div>
          <div className="text-xs sm:text-sm text-blue-100 font-medium">
            No credit card required
          </div>
        </div>
      </section>

      {/* 13. Official 5-Column Footer (Screenshot 7 Exact Match) */}
      <footer className="border-t border-gray-200 bg-white pt-16 pb-12 px-4 sm:px-8 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-x-12 lg:gap-x-24 xl:gap-x-32 gap-y-12">
          {/* Column 1: Core SEO Tools & Performance & Reporting Tools */}
          <div className="space-y-14 sm:space-y-16">
            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Core SEO Tools
              </h4>
              <ul className="space-y-3">
                <li><Link href="/rankings" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Rank Tracker</Link></li>
                <li><Link href="/website-audit" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Website Audit</Link></li>
                <li><Link href="/website-audit" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">On-Page SEO Checker</Link></li>
                <li><Link href="/rankings" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">SERP Tracker</Link></li>
                <li><Link href="/backlinks" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Backlink Checker</Link></li>
                <li><Link href="/keyword-manager" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Keyword Grouper</Link></li>
                <li><Link href="/research/keyword-research" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Keyword Tool</Link></li>
                <li><Link href="/research/competitive-research" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Website Competitor Analysis Tool</Link></li>
                <li><Link href="/research/ai-search" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">AI Overviews Tracker</Link></li>
                <li><Link href="/projects" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">All features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Performance &amp; Reporting Tools
              </h4>
              <ul className="space-y-3">
                <li><Link href="/page-changes" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Webpage Monitor</Link></li>
                <li><Link href="/reports" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">SEO Report Generator</Link></li>
                <li><Link href="/projects" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">SEO Dashboard</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Add-ons, Additional Services & Support & Partnership */}
          <div className="space-y-12 sm:space-y-14">
            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Add-ons
              </h4>
              <ul className="space-y-3">
                <li><Link href="/local-marketing" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Local Marketing Software</Link></li>
                <li><Link href="/content-marketing" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Content Marketing Tool</Link></li>
                <li><Link href="/agency-pack" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Agency Pack</Link></li>
                <li><Link href="/agency-pack" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">White Label</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Additional Services
              </h4>
              <ul className="space-y-3">
                <li><Link href="/api-docs" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">SEO API</Link></li>
                <li><Link href="/research/keyword-research" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Free SEO tools</Link></li>
                <li><Link href="/marketing-plan" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">SEO Task Manager</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Support &amp; Partnership
              </h4>
              <ul className="space-y-3">
                <li><Link href="/settings" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Contact</Link></li>
                <li><a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Help</a></li>
                <li><a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Affiliate</a></li>
                <li><a href="https://seranking.com/educational-program.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Educational Partnership Program</a></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Company & Resources, Legal & Technical & Download */}
          <div className="space-y-12 sm:space-y-14">
            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Company &amp; Resources
              </h4>
              <ul className="space-y-3">
                <li><a href="https://seranking.com/blog/" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">SEO Blog</a></li>
                <li><a href="https://seranking.com/about-us.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">About</a></li>
                <li>
                  <a href="https://seranking.com/stand-with-ukraine.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed flex items-center gap-1.5">
                    <span>Stand with Ukraine</span>
                  </a>
                </li>
                <li><a href="https://seranking.com/careers.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Careers</a></li>
                <li><a href="https://seranking.com/whats-new.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">What&apos;s New</a></li>
                <li><a href="https://seranking.com/testimonials.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Testimonials</a></li>
                <li><a href="https://seranking.com/webinars.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Webinars</a></li>
                <li><a href="https://seranking.com/academy.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Academy</a></li>
                <li><Link href="/competitors" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Competitors</Link></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Legal &amp; Technical
              </h4>
              <ul className="space-y-3">
                <li><a href="https://seranking.com/privacy-policy.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Privacy Statement</a></li>
                <li><a href="https://seranking.com/cookie-policy.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Cookie Policy</a></li>
                <li><a href="https://seranking.com/terms-of-use.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Legal Information</a></li>
                <li><a href="https://seranking.com/terms-of-use.html" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-[#0B69FF] transition-colors leading-relaxed block">Open Source Attributions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-base sm:text-[17px] mb-4 tracking-tight">
                Download
              </h4>
              <div className="space-y-3">
                {/* App Store Badge */}
                <a
                  href="https://apps.apple.com/app/se-ranking-pro/id1111979313"
                  target="_blank"
                  rel="noreferrer"
                  className="w-44 bg-black text-white px-3.5 py-2.5 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors cursor-pointer shadow-sm group"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 group-hover:scale-105 transition-transform">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.13 16.69C20.09 16.82 19.71 18.14 18.71 19.5ZM14.88 4.67C15.54 3.86 16 2.73 15.88 1.59C14.88 1.63 13.68 2.26 12.96 3.1C12.33 3.83 11.78 4.98 11.93 6.1C13.04 6.19 14.21 5.48 14.88 4.67Z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] text-gray-300 font-medium">Available on the</span>
                    <span className="font-bold text-xs sm:text-[13px] tracking-tight">App Store</span>
                  </div>
                </a>

                {/* Google Play Badge */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.seranking.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-44 bg-black text-white px-3.5 py-2.5 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors cursor-pointer shadow-sm group"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 group-hover:scale-105 transition-transform">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186c-.347-.323-.559-.79-.559-1.341V3.155c0-.551.212-1.018.558-1.341z" fill="#00C4FF" />
                    <path d="M15.207 13.414l2.454 2.454-11.45 6.611 8.996-9.065z" fill="#FF3333" />
                    <path d="M15.207 10.586L6.211 1.521l11.45 6.611-2.454 2.454z" fill="#00E676" />
                    <path d="M17.661 14.028l3.197-1.846c.907-.524.907-1.382 0-1.906l-3.197-1.846-1.928 1.846 1.928 1.752z" fill="#FFD600" />
                  </svg>
                  <div className="text-left leading-tight">
                    <span className="block text-[10px] text-gray-300 font-medium">GET IT ON</span>
                    <span className="font-bold text-xs sm:text-[13px] tracking-tight">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logo + EN English dropdown, Center Copyright, Right Socials */}
        <div className="max-w-7xl mx-auto pt-10 mt-14 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          {/* Left: Logo & Interactive Language Switcher */}
          <div className="flex items-center gap-5">
            <SeRankingLogo variant="brand" width={135} height={30} />
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFooterLangOpen(!isFooterLangOpen);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-gray-100 text-gray-600">EN</span>
                <span>{footerLang}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isFooterLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dynamic Footer Language Dropdown */}
              {isFooterLangOpen && (
                <div
                  className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setFooterLang(lang.label);
                        setIsFooterLangOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B69FF] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{lang.label}</span>
                      {footerLang === lang.label && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Copyright Notice */}
          <div className="text-xs text-gray-500 font-normal tracking-tight text-center">
            &copy; 2013 - 2026 SER Acquisition Inc. All Rights Reserved
          </div>

          {/* Right: Social Media Links */}
          <div className="flex items-center gap-6 text-gray-500">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Product Tour Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 bg-[#0B69FF] text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2.5">
                <Play className="w-5 h-5 fill-white" />
                SE Ranking Product Tour
              </h3>
              <button
                onClick={() => setIsTourOpen(false)}
                className="text-white/80 hover:text-white text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-7 space-y-5 text-sm text-gray-700 leading-relaxed">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <h4 className="font-bold text-blue-900 text-base">Welcome to SE Ranking Studio</h4>
                <p className="text-blue-800 text-xs sm:text-sm mt-1">
                  Unified visibility across SEO, Generative AI (GEO), backlinks, and multi-network social publishing.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Close Tour
                </button>
                <Link
                  href="/projects"
                  className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
                >
                  Launch Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
