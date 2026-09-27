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
  MousePointerClick,
  Wrench,
  Banknote,
  Shield,
  User,
  Square,
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

// Mock chart data for SEO Rankings - wavy curves matching reference screenshot
const mockRankingsTrend = [
  { date: 'Jun 24', pink: 72, blue: 70, teal: 35, purple: 28 },
  { date: 'Jun 25', pink: 98, blue: 45, teal: 68, purple: 64 },
  { date: 'Jun 26', pink: 82, blue: 68, teal: 52, purple: 56 },
  { date: 'Jun 27', pink: 88, blue: 85, teal: 80, purple: 70 },
  { date: 'Jun 28', pink: 62, blue: 60, teal: 45, purple: 40 },
  { date: 'Jun 29', pink: 78, blue: 88, teal: 84, purple: 75 },
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

// Agency Catalog Cards (Exact user reference screenshot match)
const agencyCatalogItems = [
  {
    id: 'pixelpulse',
    name: 'PixelPulse Agency',
    url: 'https://pixelpulseagency.com',
    location: 'Barcelona (Spain)',
    services: 'Digital Marketing, General SEO',
    servicesExtra: '+11',
    industries: 'Technology, Healthcare, Retail',
    industriesExtra: '+3',
    budget: 'No minimum budget',
    teamSize: '100+',
  },
  {
    id: 'fusion',
    name: 'Fusion Marketing',
    url: 'https://fusionmarketing.co.uk',
    location: 'London (UK)',
    services: 'SEO, Content Strategy',
    servicesExtra: '+8',
    industries: 'Fintech, E-commerce',
    industriesExtra: '+5',
    budget: 'No minimum budget',
    teamSize: '50-100',
  },
  {
    id: 'neonwave',
    name: 'NeonWave Digital',
    url: 'https://neonwavedigital.com',
    location: 'Berlin (Germany)',
    services: 'Technical SEO, Link Building',
    servicesExtra: '+6',
    industries: 'SaaS, AI Startups',
    industriesExtra: '+4',
    budget: 'No minimum budget',
    teamSize: '25-50',
  },
  {
    id: 'echo',
    name: 'Echo Marketing',
    url: 'https://echomarketing.io',
    location: 'Austin (USA)',
    services: 'Local SEO, PPC, Analytics',
    servicesExtra: '+9',
    industries: 'Real Estate, Automotive',
    industriesExtra: '+2',
    budget: 'No minimum budget',
    teamSize: '10-25',
  },
];

// Testimonials data (7 items) - Exact screenshot match
const testimonials = [
  {
    quote:
      '“I’ve been using SE Ranking MCP server for months and it’s fantastic. My keyword research involves classifying keywords with a lot of ambiguity into families and locations. This MCP has saved me days of manual work — my research now takes a few hours instead of days”',
    name: 'Gus Pelogia',
    role: 'Senior SEO Product Manager (R&D) Indeed',
    avatar: '/images/testimonials/gus.png',
  },
  {
    quote:
      '“The AI Visibility and GEO tracking in SE Ranking gave us early clarity on LLM citations across ChatGPT and Perplexity. We turned AI answers into our #1 referral channel in under 6 months.”',
    name: 'Dana DiTomaso',
    role: 'Founder & Lead Instructor, Kick Point Playbook',
    avatar: '/images/testimonials/dana.png',
  },
  {
    quote:
      '“Accurate rank tracking across 188 country DBs and mobile SERPs without hidden fees makes SE Ranking our default recommendation for international enterprise audits.”',
    name: 'Aleyda Solis',
    role: 'International SEO Consultant & Founder, Orainti',
    avatar: '/images/testimonials/aleyda.png',
  },
  {
    quote:
      '“SE Ranking has outpaced traditional suites by building native MCP integrations and AI SEO monitoring directly into their platform. It’s what modern search practitioners actually need.”',
    name: 'Alex Moss',
    role: 'SEO Director, Yoast & FireCask',
    avatar: '/images/testimonials/alex.png',
  },
  {
    quote:
      '“The Agency Pack is a game changer for client retention. Automated white-label reporting and client seats shaved 15 hours off each team lead\'s week.”',
    name: 'John Doherty',
    role: 'CEO & Founder, Credo & EditorNinja',
    avatar: '/images/testimonials/john.png',
  },
  {
    quote:
      '“Combining rank intelligence with social publishing in Planable streamlined our cross-channel marketing. Our team executes twice as fast without switching apps.”',
    name: 'Giannis Karampatsos',
    role: 'Head of Growth, Productiv',
    avatar: '/images/testimonials/giannis.png',
  },
  {
    quote:
      '“We replaced three disparate tools with SE Ranking\'s unified studio. The depth of competitive gap analysis and API reliability is best-in-class.”',
    name: 'Erin Sparks',
    role: 'President, Site-Strategics & Edge of the Web Host',
    avatar: '/images/testimonials/erin.png',
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
        <div className="w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-w-7xl mx-auto mt-2.5 mb-1">
          <div className="bg-[#0b8465] text-white py-2 px-6 rounded-xl text-center text-sm font-semibold tracking-wide flex items-center justify-between relative shadow-xs">
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

      {/* 2. Main Navigation Header (Exact screenshot match) */}
      <header className="sticky top-0 bg-white z-40 transition-all border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 h-full">
            {/* 9-Dots Suite Switcher Button & Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setActiveMenu('suite')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'suite' ? null : 'suite')}
                className="w-8 h-8 rounded-lg bg-[#f3f4f6] hover:bg-gray-200 border border-gray-200/50 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="App Switcher"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
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
                <div className="absolute top-full left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 space-y-1">
                    {/* SE Ranking */}
                    <div className="p-2 bg-blue-50/70 rounded-lg flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#0B69FF] flex items-center justify-center shrink-0">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L3 9V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V9L12 2Z" fill="none" stroke="white" strokeWidth="2" />
                            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 leading-tight">SE Ranking</div>
                          <div className="text-[11px] text-gray-500 leading-tight">Grow your visibility with AI SEO</div>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-[#0B69FF] shrink-0" />
                    </div>

                    {/* SE Visible */}
                    <a
                      href="https://visible.seranking.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 font-black text-xs">
                          N
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 flex items-center gap-1 leading-tight">
                            <span>SE Visible</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-700" />
                          </div>
                          <div className="text-[11px] text-gray-500 leading-tight">Analyze AI visibility strategically</div>
                        </div>
                      </div>
                    </a>

                    {/* Planable */}
                    <a
                      href="https://planable.io/"
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 font-black text-xs">
                          ▲
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 flex items-center gap-1 leading-tight">
                            <span>Planable</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-700" />
                          </div>
                          <div className="text-[11px] text-gray-500 leading-tight">Manage your socials as a team</div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* SE Ranking Logo: Dark text + blue spark logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <SeRankingLogo variant="dark" width={130} height={28} />
            </Link>

            {/* Desktop Navigation Links & Dropdowns */}
            <nav className="flex items-center gap-5 xl:gap-6 text-[14px] font-medium text-gray-900 h-full">
              {/* 1. Solutions Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('solutions')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'solutions' ? null : 'solutions')}
                  className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'solutions' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      activeMenu === 'solutions' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="w-[420px] bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex gap-2 h-fit">
                      {/* Left Column */}
                      <div className="w-44 space-y-0.5 pr-2 border-r border-gray-100 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setSolutionsSubTab('business-type')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              solutionsSubTab === 'business-type'
                                ? 'bg-[#E0F2FE] text-[#0f172a]'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>By business type</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          </button>

                          <a
                            href="https://seranking.com/solutions.html"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>By SEO goals</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                        </div>

                        <a
                          href="https://seranking.com/migration.html"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer border-t border-gray-50 pt-1.5"
                        >
                          <span>Migrate to SE Ranking</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                      </div>

                      {/* Right Column */}
                      <div className="flex-1 space-y-0.5 pl-0.5">
                        <Link
                          href="/agency-pack"
                          onClick={() => setActiveMenu(null)}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                            <Target className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                            Agencies
                          </span>
                        </Link>

                        <Link
                          href="/project-overview"
                          onClick={() => setActiveMenu(null)}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                            <Building className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                            Enterprises
                          </span>
                        </Link>

                        <Link
                          href="/projects"
                          onClick={() => setActiveMenu(null)}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                            Growing business
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Tools Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('tools')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
                  className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'tools' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      activeMenu === 'tools' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'tools' && (
                  <div className="absolute top-full -left-12 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="w-[510px] bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex gap-2">
                      {/* Left Column (Categories) */}
                      <div className="w-48 space-y-0.5 pr-1.5 border-r border-gray-100">
                        <button
                          type="button"
                          onMouseEnter={() => setToolsSubTab('core-seo')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            toolsSubTab === 'core-seo'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Core SEO tools</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          type="button"
                          onMouseEnter={() => setToolsSubTab('ai-search')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            toolsSubTab === 'ai-search'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>AI Search tools</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          type="button"
                          onMouseEnter={() => setToolsSubTab('other-seo')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            toolsSubTab === 'other-seo'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Other SEO tools</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          type="button"
                          onMouseEnter={() => setToolsSubTab('agency-pack')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            toolsSubTab === 'agency-pack'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Agency Pack</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          type="button"
                          onMouseEnter={() => setToolsSubTab('content-marketing')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            toolsSubTab === 'content-marketing'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Content Marketing</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <Link
                          href="/local-marketing"
                          onClick={() => setActiveMenu(null)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Local Marketing</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </Link>

                        <Link
                          href="/api-docs"
                          onClick={() => setActiveMenu(null)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Integrations</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </Link>
                      </div>

                      {/* Right Column */}
                      <div className="flex-1 space-y-0.5 pl-0.5">
                        {toolsSubTab === 'core-seo' && (
                          <>
                            <Link
                              href="/rankings"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <BarChart3 className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Rank Tracker
                              </span>
                            </Link>

                            <Link
                              href="/research/keyword-research"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Key className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Keyword Research
                              </span>
                            </Link>

                            <Link
                              href="/website-audit/on-page"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Search className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                On-Page SEO Checker
                              </span>
                            </Link>

                            <Link
                              href="/website-audit"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <FileSearch className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Website Audit
                              </span>
                            </Link>

                            <Link
                              href="/research/competitive-research"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Target className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Competitor Analysis Tool
                              </span>
                            </Link>

                            <Link
                              href="/backlinks"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Globe className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
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
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                AI Overviews Tracker
                              </span>
                            </Link>
                            <Link
                              href="/research/ai-search"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
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
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Sliders className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                SERP Tracker
                              </span>
                            </Link>
                            <Link
                              href="/keyword-grouper"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Layers className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Keyword Grouper
                              </span>
                            </Link>
                            <Link
                              href="/page-changes"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <CheckSquare className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
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
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <Award className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Agency Pack &amp; White Label
                              </span>
                            </Link>
                            <Link
                              href="/reports"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                SEO Report Generator
                              </span>
                            </Link>
                          </>
                        )}

                        {toolsSubTab === 'content-marketing' && (
                          <Link
                            href="/content-marketing"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                              Content Marketing Tool
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Resources Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('resources')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'resources' ? null : 'resources')}
                  className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'resources' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Resources</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      activeMenu === 'resources' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'resources' && (
                  <div className="absolute top-full left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="w-[430px] bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex gap-2">
                      {/* Left Column */}
                      <div className="w-44 space-y-0.5 pr-2 border-r border-gray-100">
                        <button
                          type="button"
                          onClick={() => setResourcesSubTab('education')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            resourcesSubTab === 'education'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Education</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setResourcesSubTab('customer-hub')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            resourcesSubTab === 'customer-hub'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>Customer Hub</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <a
                          href="https://seranking.com/agency-catalog/"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Agency Catalog</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                      </div>

                      {/* Right Column */}
                      <div className="flex-1 space-y-0.5 pl-0.5">
                        {resourcesSubTab === 'education' ? (
                          <>
                            <Link
                              href="/landing"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Blog
                              </span>
                            </Link>

                            <Link
                              href="/landing"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Megaphone className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Webinars
                              </span>
                            </Link>

                            <Link
                              href="/landing"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Radio className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Podcast
                              </span>
                            </Link>

                            <Link
                              href="/landing"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
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
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Building className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Help Center
                              </span>
                            </a>
                            <Link
                              href="/landing"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Award className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Case Studies
                              </span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Pricing Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('pricing')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'pricing' ? null : 'pricing')}
                  className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'pricing' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Pricing</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      activeMenu === 'pricing' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'pricing' && (
                  <div className="absolute top-full left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 space-y-0.5">
                      <a
                        href="#pricing"
                        onClick={() => setActiveMenu(null)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                          Platform plans
                        </span>
                      </a>

                      <Link
                        href="/api-docs"
                        onClick={() => setActiveMenu(null)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                          <Code2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                          API Plans
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. API & MCP Dropdown */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('api-mcp')}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'api-mcp' ? null : 'api-mcp')}
                  className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'api-mcp' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>API &amp; MCP</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                      activeMenu === 'api-mcp' ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {activeMenu === 'api-mcp' && (
                  <div className="absolute top-full -left-20 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="w-[430px] bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex gap-2">
                      {/* Left Column */}
                      <div className="w-44 space-y-0.5 pr-2 border-r border-gray-100">
                        <button
                          type="button"
                          onClick={() => setApiSubTab('api')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            apiSubTab === 'api'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>API</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setApiSubTab('mcp')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            apiSubTab === 'mcp'
                              ? 'bg-[#E0F2FE] text-[#0f172a]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>MCP</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <a
                          href="https://seranking.com/our-data.html"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Our data</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>

                        <Link
                          href="/api-docs"
                          onClick={() => setActiveMenu(null)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>API Pricing</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                      </div>

                      {/* Right Column */}
                      <div className="flex-1 space-y-0.5 pl-0.5">
                        {apiSubTab === 'api' ? (
                          <>
                            <Link
                              href="/api-docs"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Code2 className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                API
                              </span>
                            </Link>

                            <Link
                              href="/api-docs"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Key className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Keyword Research API
                              </span>
                            </Link>

                            <Link
                              href="/api-docs"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Globe className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Backlinks API
                              </span>
                            </Link>

                            <Link
                              href="/api-docs"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Globe2 className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Domain Analysis API
                              </span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/api-docs"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                SE Ranking MCP Server
                              </span>
                            </Link>

                            <Link
                              href="/api-docs"
                              onClick={() => setActiveMenu(null)}
                              className="px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0B69FF] flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">
                                Claude Integration
                              </span>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Header Navigation Items (Exact screenshot match) */}
          <div className="flex items-center gap-3 sm:gap-4 h-full">
            {/* Language Switcher */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'lang' ? null : 'lang')}
                className="px-2 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1 text-[13px] font-semibold text-gray-900 transition-colors cursor-pointer"
              >
                <span className="uppercase text-[13px] font-bold tracking-wide">
                  {selectedLang}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 ${
                    activeMenu === 'lang' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeMenu === 'lang' && (
                <div
                  className="absolute right-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-[155px] bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 px-1.5 space-y-0.5">
                    {languages.map((l) => {
                      const isActive = selectedLang.toLowerCase() === l.code.toLowerCase();
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setSelectedLang(l.code);
                            setActiveMenu(null);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#EBF5FF] text-[#1351d8] font-bold'
                              : 'text-[#374151] hover:bg-gray-50 font-medium'
                          }`}
                        >
                          <span
                            className={`uppercase font-bold text-[10px] w-6 h-4 flex items-center justify-center rounded ${
                              isActive
                                ? 'bg-[#1351d8] text-white'
                                : 'bg-[#E5E7EB] text-[#4B5563]'
                            }`}
                          >
                            {l.code}
                          </span>
                          <span className="text-xs">{l.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* "Log in" link matching SE Ranking official header */}
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-800 hover:text-[#0B69FF] transition-colors px-2 py-1 cursor-pointer"
            >
              Log in
            </Link>

            {/* "See product tour" button matching Screenshot */}
            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-gray-900 text-gray-900 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span>See product tour</span>
            </button>

            {/* "Start free trial" Solid Blue Button */}
            <Link
              href="/signup"
              className="px-5 py-2 bg-[#1351d8] hover:bg-[#0f46bd] text-white rounded-lg text-[13px] font-bold tracking-normal transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <span>Start free trial</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Exact visual match to Screenshot) */}
      <section className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-[36px] sm:text-[48px] md:text-[52px] lg:text-[54px] font-extrabold text-[#111827] tracking-tight leading-[1.12]">
          Don’t just track visibility. Validate&nbsp;it.
        </h1>

        <p className="mt-5 text-[#4b5563] text-base sm:text-[18px] max-w-[740px] mx-auto leading-relaxed font-normal">
          Give your team the cross-channel context to prove the value of every decision across<br className="hidden sm:inline" /> SEO, GEO, and social.
        </p>

        {/* Hero CTAs: Start free trial & See product tour */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-9 py-3.5 sm:px-10 sm:py-4 bg-[#1351d8] hover:bg-[#0f46bd] text-white text-[16px] sm:text-[17px] font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-center cursor-pointer"
          >
            <span>Start free trial</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsTourOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 bg-white border border-[#111827] hover:bg-gray-50 text-[#111827] text-[16px] sm:text-[17px] font-medium rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <span>See product tour</span>
          </button>
        </div>

        {/* Social Proof: 1-by-1 sliding avatars + Trusted by 40,000+ agencies */}
        <div className="mt-12">
          <HeroAvatarSlider />
        </div>

        {/* Static 6 Partner Logos row matching screenshot */}
        <div className="mt-12 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-11 md:gap-14 text-[#596372] select-none">
          {/* soapbox */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L3 26H29L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M16 9L8 23H24L16 9Z" fill="currentColor" opacity="0.3" />
            </svg>
            <span className="font-black text-base sm:text-lg tracking-tight lowercase text-[#4b5563]">soapbox</span>
          </div>

          {/* Nex Brand Marketing */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-extrabold text-[12px] tracking-wider uppercase block text-[#4b5563]">NEX BRAND</span>
              <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-widest block mt-0.5">MARKETING</span>
            </div>
          </div>

          {/* Tailor Brands */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a2 2 0 0 0-2 2c0 1.1.9 2 2 2v2L3 17a2 2 0 0 0 1 3h16a2 2 0 0 0 1-3L12 9" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-extrabold text-[12px] tracking-wider uppercase block text-[#4b5563]">TAILOR</span>
              <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-widest block mt-0.5">BRANDS</span>
            </div>
          </div>

          {/* Wiser IT SEO Company */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0 2 6 6 0 0 0 6 6 1 1 0 0 1 2 0 6 6 0 0 0 6-6 1 1 0 0 1 2 0 8 8 0 0 1-6.93 6.93z" />
            </svg>
            <div className="text-left leading-none">
              <span className="font-black text-[12px] tracking-wider uppercase block text-[#4b5563]">WISER IT</span>
              <span className="text-[8px] font-bold text-[#6b7280] uppercase tracking-widest block mt-0.5">SEO COMPANY</span>
            </div>
          </div>

          {/* Kaida */}
          <div className="flex items-center gap-2 hover:text-gray-900 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6l8 6-8 6V6z" />
              <path d="M20 6l-8 6 8 6V6z" />
            </svg>
            <span className="font-black text-[14px] tracking-widest uppercase text-[#4b5563]">KAIDA</span>
          </div>

          {/* Neary Hayes */}
          <div className="text-left leading-none hover:text-gray-900 transition-colors">
            <span className="font-serif italic font-bold text-[13px] block text-[#4b5563]">neary</span>
            <span className="font-serif italic font-bold text-[13px] block pl-2 text-[#4b5563]">hayes</span>
          </div>
        </div>
      </section>

      {/* 4. Complete AI SEO platform for every challenge (Exact Match to User Reference Screenshots) */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-24 bg-white px-6 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#101423] tracking-tight leading-tight">
              Complete AI SEO platform for every challenge
            </h2>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-sm">
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
                  className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-[15px] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#101423] text-white font-normal shadow-xs'
                      : 'text-[#667085] hover:text-[#101423] font-normal hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2-Column Section Layout matching Screenshots */}

          {/* TAB 1: AI Visibility (Exact Screenshot Match: uploaded_media_1790446897464.png) */}
          {platformTab === 'ai-visibility' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Interactive Mockup Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                {/* Header Bar with AI Engines */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/70 shadow-2xs">
                  <span className="text-base font-bold text-gray-900">AI Visibility</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-gray-800">
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
                  {/* Visibility (Mint Green Box with binoculars) */}
                  <div className="p-3.5 bg-[#C6F5E6] rounded-2xl border border-[#9BE3CE] relative overflow-hidden">
                    <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-20 20 Q 30 60, 80 20 T 180 20 T 280 20" fill="none" stroke="#0D9488" strokeWidth="2" />
                    </svg>
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-800 relative z-10">
                      <span>Visibility</span>
                      <span className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-[10px]">
                        👓
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2 relative z-10">
                      <span className="text-2xl font-bold text-gray-900">99%</span>
                      <span className="text-[11px] text-teal-800 font-bold bg-[#A3EAD4] px-1.5 py-0.2 rounded">
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
                    <div className="text-2xl font-bold text-gray-900 mt-2">#1</div>
                  </div>

                  {/* Avg. position */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Avg. position</span>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-2xl font-bold text-gray-900">2.61</span>
                      <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
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
                      <span className="text-2xl font-bold text-gray-900">+78</span>
                      <span className="text-[11px] text-pink-700 font-bold bg-pink-50 px-1.5 py-0.2 rounded border border-pink-100">
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
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-900 shadow-2xs">
                          Visibility score
                        </span>
                        <span className="text-gray-400 font-semibold px-1">Avg position</span>
                      </div>
                    </div>
                    <div className="h-40 w-full relative">
                      <div className="absolute left-0 top-0 bottom-4 text-[9px] text-gray-400 flex flex-col justify-between">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0</span>
                      </div>
                      <div className="ml-7 h-32">
                        <svg viewBox="0 0 160 80" className="w-full h-full overflow-visible">
                          <line x1="0" y1="0" x2="160" y2="0" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="20" x2="160" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="40" x2="160" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="60" x2="160" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="80" x2="160" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                          <path d="M 0 35 C 20 8, 40 10, 60 40 C 90 75, 120 40, 160 30" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                          <path d="M 0 45 C 30 15, 60 25, 90 45 C 120 18, 140 22, 160 15" fill="none" stroke="#2563EB" strokeWidth="1.5" />
                          <path d="M 0 30 C 25 70, 50 65, 80 40 C 110 20, 130 50, 160 12" fill="none" stroke="#0D9488" strokeWidth="1.5" />
                          <path d="M 0 65 C 25 35, 50 35, 80 55 C 110 40, 135 60, 160 25" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-400 ml-7 pt-1">
                        <span>Jun 24</span>
                        <span>Jun 25</span>
                        <span>Jun 26</span>
                        <span>Jun 27</span>
                        <span>Jun 28</span>
                        <span>Jun 29</span>
                      </div>
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
                          <th className="font-bold py-1 text-right">Net sentiment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-blue-600">
                            <span>1</span>
                            <span className="w-4 h-4 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">b.</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">99%</td>
                          <td className="py-2 text-gray-600">2.61</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+78</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-blue-600">
                            <span>2</span>
                            <span className="w-4 h-4 rounded bg-sky-50 text-sky-600 flex items-center justify-center text-[10px]">🔍</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">83%</td>
                          <td className="py-2 text-gray-600">2.75</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+44</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-purple-600">
                            <span>3</span>
                            <span className="w-4 h-4 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px]">🌐</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">80%</td>
                          <td className="py-2 text-gray-600">5.11</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+40</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-1.5 font-bold text-teal-600">
                            <span>4</span>
                            <span className="w-4 h-4 rounded bg-teal-50 text-teal-700 flex items-center justify-center text-[10px]">⚙️</span>
                          </td>
                          <td className="py-2 font-bold text-gray-900">72%</td>
                          <td className="py-2 text-gray-600">5.87</td>
                          <td className="py-2 text-right font-bold text-emerald-600">+39</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Copy & CTA */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Track where your brand appears across ChatGPT, Gemini, Perplexity, and AI Overviews, see how it&apos;s described, and learn which sources matter most.
                </h3>

                <ul className="space-y-4 text-sm sm:text-[15px] text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                    <span className="leading-relaxed">
                      <strong className="font-semibold text-[#101423]">Brand mentions and sentiment tracking</strong> across the top 5 AI engines
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                    <span className="leading-relaxed">
                      <strong className="font-semibold text-[#101423]">Prompt intelligence</strong> that reveals the queries your audience is using
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                    <span className="leading-relaxed">
                      <strong className="font-semibold text-[#101423]">In-depth analysis</strong> of the prompts and sources behind AI answers
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <a
                    href="https://visible.seranking.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1351d8] hover:bg-[#0f44b8] text-white text-[15px] font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Try SE Visible
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEO Research (Exact Screenshot Match) */}
          {platformTab === 'seo-research' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: SEO Research Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Left Column: Organic & Paid Traffic Cards */}
                  <div className="md:col-span-5 space-y-3">
                    {/* Organic Traffic */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                          ORGANIC TRAFFIC
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                          🍃
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-900">11.3M</span>
                        <span className="text-xs text-emerald-600 font-bold">▲ 215.9K</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium block mt-1">Clicks/mo</span>
                    </div>

                    {/* Paid Traffic */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                          PAID TRAFFIC
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold">
                          $
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-bold text-gray-900">12.9K</span>
                        <span className="text-xs text-emerald-600 font-bold">▲ 41.7K</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium block mt-1">Clicks/mo</span>
                    </div>
                  </div>

                  {/* Right Column: Traffic Chart with Google Update Badge */}
                  <div className="md:col-span-7 p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                      <span className="font-bold text-[#1864FF] border-b-2 border-[#1864FF] pb-1.5 cursor-pointer">
                        TOTAL TRAFFIC
                      </span>
                      <span className="font-semibold text-gray-500 hover:text-gray-900 cursor-pointer">KEYWORDS</span>
                      <span className="font-semibold text-gray-500 hover:text-gray-900 cursor-pointer">BACKLINKS</span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold text-gray-400">
                      <span className="text-[#1864FF] border-b border-[#1864FF] cursor-pointer">6M</span>
                      <span className="hover:text-gray-900 cursor-pointer">12M</span>
                      <span className="hover:text-gray-900 cursor-pointer">18M</span>
                      <span className="hover:text-gray-900 cursor-pointer">24M</span>
                      <span className="hover:text-gray-900 cursor-pointer">30M</span>
                      <span className="hover:text-gray-900 cursor-pointer">36M</span>
                      <span className="hover:text-gray-900 cursor-pointer">ALL</span>
                    </div>

                    <div className="h-32 w-full relative">
                      <div className="absolute left-0 top-0 bottom-4 text-[9px] text-gray-400 flex flex-col justify-between">
                        <span>100K</span>
                        <span>75K</span>
                        <span>50K</span>
                        <span>25K</span>
                        <span>0</span>
                      </div>
                      <div className="ml-7 h-28">
                        <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
                          <line x1="0" y1="0" x2="200" y2="0" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="20" x2="200" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="40" x2="200" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="60" x2="200" y2="60" stroke="#F1F5F9" strokeWidth="1" />

                          {/* Organic Green Curve & Area */}
                          <path d="M 0 55 C 30 45, 60 50, 95 30 C 130 5, 160 35, 200 15 L 200 80 L 0 80 Z" fill="#10B981" fillOpacity="0.1" />
                          <path d="M 0 55 C 30 45, 60 50, 95 30 C 130 5, 160 35, 200 15" fill="none" stroke="#10B981" strokeWidth="2" />
                          <circle cx="95" cy="30" r="2.5" fill="#10B981" />
                          <circle cx="200" cy="15" r="2.5" fill="#10B981" />

                          {/* Paid Blue Curve */}
                          <path d="M 0 25 C 30 40, 60 15, 95 38 C 130 65, 165 60, 200 35" fill="none" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="0" cy="25" r="2.5" fill="#2563EB" />
                          <circle cx="60" cy="15" r="2.5" fill="#2563EB" />
                          <circle cx="95" cy="38" r="2.5" fill="#2563EB" />
                          <circle cx="200" cy="35" r="2.5" fill="#2563EB" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-400 ml-7 pt-1">
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span className="flex items-center gap-0.5 font-bold text-gray-800">
                          Jun <span className="w-2.5 h-2.5 rounded-full bg-blue-600 text-white text-[6px] inline-flex items-center justify-center">G</span>
                        </span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-600 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Organic</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600" /> Paid</span>
                      </div>
                      <button type="button" className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">
                        ↑
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Referring Domains, Backlinks, Domain/Page Trust */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">REFERRING DOMAINS</span>
                    <span className="text-2xl font-bold text-gray-900 block mt-1">962.8K</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Analyzed only the top 10 000 domains ⓘ</span>
                  </div>
                  <div className="border-l border-gray-100 pl-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">BACKLINKS</span>
                    <span className="text-2xl font-bold text-gray-900 block mt-1">13.9M</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Analyzed only the top 10 000 backlinks ⓘ</span>
                  </div>
                  <div className="border-l border-gray-100 pl-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700">DOMAIN TRUST</span>
                      <span className="text-lg font-bold text-gray-900">96</span>
                    </div>
                    <div className="border-t border-gray-100 pt-1 flex items-center justify-between">
                      <span className="font-bold text-gray-700">PAGE TRUST</span>
                      <span className="text-lg font-bold text-gray-900">72</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Get the most accurate keyword and competitor data to uncover high-impact growth opportunities and outrank your rivals
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/research" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Competitive Research</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/research" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Keyword Research</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/backlinks" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Backlink Checker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link href="/competitors" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>SERP Checker</span>
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

          {/* TAB 3: SEO Monitoring (Exact Screenshot Match) */}
          {platformTab === 'seo-monitoring' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: 3 Top Sparkline Cards + 3 Bottom Cards */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                {/* Top Row: 3 Metric Cards with Blue Sparkline Curves */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">AVERAGE POSITION</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">34</span>
                      <span className="text-xs text-emerald-600 font-bold">▲ 51</span>
                    </div>
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#2563EB] stroke-2">
                        <path d="M 0 18 Q 15 5, 30 14 T 60 8 T 85 16 T 100 6" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">TRAFIC FORECAST</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">520</span>
                      <span className="text-xs text-rose-500 font-bold">▼ 245</span>
                    </div>
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#2563EB] stroke-2">
                        <path d="M 0 16 Q 20 8, 40 18 T 70 12 T 100 8" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">SEARCH VISIBILITY</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">0.66</span>
                      <span className="text-xs text-emerald-600 font-bold">▲ 0.34</span>
                    </div>
                    <div className="h-6 w-full pt-1">
                      <svg viewBox="0 0 100 24" className="w-full h-full fill-none stroke-[#2563EB] stroke-2">
                        <path d="M 0 16 Q 15 6, 30 18 T 60 10 T 85 16 T 100 4" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Health Score, Backlinks Area, Page Quality Score Rose Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Health Score Speedometer */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left block">
                      HEALTH SCORE
                    </span>
                    <div className="py-2 flex items-center justify-center">
                      <div className="relative w-28 h-16 overflow-hidden">
                        <svg viewBox="0 0 100 55" className="w-full h-full">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
                          <path d="M 10 50 A 40 40 0 0 1 78 22" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-x-0 bottom-0 text-center leading-none">
                          <span className="text-2xl font-bold text-gray-900 block">87</span>
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
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-gray-500 uppercase tracking-wider">BACKLINKS</span>
                        <div className="flex items-center gap-1 font-bold text-gray-400">
                          <span className="text-[#1864FF] border-b border-[#1864FF]">3M</span>
                          <span>6M</span>
                          <span>12M</span>
                        </div>
                      </div>
                      <div className="h-24 w-full mt-2 relative">
                        <div className="absolute left-0 top-0 bottom-3 text-[8px] text-gray-400 flex flex-col justify-between">
                          <span>30</span>
                          <span>20</span>
                          <span>10</span>
                        </div>
                        <div className="ml-5 h-20">
                          <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                            <line x1="0" y1="10" x2="100" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                            <line x1="0" y1="35" x2="100" y2="35" stroke="#F1F5F9" strokeWidth="1" />
                            <line x1="0" y1="60" x2="100" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                            <path d="M 0 45 C 25 35, 45 40, 65 15 C 80 18, 90 35, 100 20 L 100 60 L 0 60 Z" fill="#2563EB" fillOpacity="0.15" />
                            <path d="M 0 45 C 25 35, 45 40, 65 15 C 80 18, 90 35, 100 20" fill="none" stroke="#2563EB" strokeWidth="2" />
                            <circle cx="0" cy="45" r="2" fill="#2563EB" />
                            <circle cx="25" cy="35" r="2" fill="#2563EB" />
                            <circle cx="45" cy="40" r="2" fill="#2563EB" />
                            <circle cx="65" cy="15" r="2" fill="#2563EB" />
                            <circle cx="100" cy="20" r="2" fill="#2563EB" />
                          </svg>
                        </div>
                        <div className="flex justify-between text-[8px] text-gray-400 ml-5">
                          <span>Apr 23</span>
                          <span>May 24</span>
                          <span>Jun 25</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page Quality Score Rose Chart */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      PAGE QUALITY SCORE
                    </span>
                    <div className="py-2 flex items-center justify-center relative">
                      <div className="w-24 h-24 rounded-full border border-dashed border-gray-200 flex items-center justify-center relative">
                        {/* Segmented Petals */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Segment 1: Dark green top */}
                            <path d="M 50 50 L 50 15 A 35 35 0 0 1 75 25 Z" fill="#14532D" />
                            {/* Segment 2: Light lime green */}
                            <path d="M 50 50 L 75 25 A 35 35 0 0 1 85 50 Z" fill="#BBF7D0" />
                            {/* Segment 3: Light gray blue */}
                            <path d="M 50 50 L 85 50 A 35 35 0 0 1 75 75 Z" fill="#CBD5E1" />
                            {/* Segment 4: Vibrant purple */}
                            <path d="M 50 50 L 75 75 A 35 35 0 0 1 50 85 Z" fill="#A855F7" />
                            {/* Segment 5: Dark violet */}
                            <path d="M 50 50 L 50 85 A 35 35 0 0 1 35 80 Z" fill="#3B0764" />
                            {/* Segment 6: Light sky */}
                            <path d="M 50 50 L 35 80 A 35 35 0 0 1 20 60 Z" fill="#BAE6FD" />
                            {/* Segment 7: Blue */}
                            <path d="M 50 50 L 20 60 A 35 35 0 0 1 20 40 Z" fill="#2563EB" />
                            {/* Segment 8: Mint */}
                            <path d="M 50 50 L 20 40 A 35 35 0 0 1 50 15 Z" fill="#86EFAC" />
                            {/* Center circle */}
                            <circle cx="50" cy="50" r="16" fill="white" />
                          </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900 relative z-10">78</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-gray-400 flex flex-wrap justify-between pt-1 border-t border-gray-100 font-medium">
                      <span>External links</span>
                      <span>Page UX</span>
                      <span>Domain</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Track your SEO progress and make timely adjustments to your strategy based on actionable insights
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
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

          {/* TAB 4: Content Marketing (Exact Screenshot Match) */}
          {platformTab === 'content-marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Content Editor Mockup Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Left Column: Rich Text Document View */}
                  <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-2xs">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-2 text-gray-600 text-xs border-b border-gray-100 pb-2">
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">↶</button>
                      <button type="button" className="p-1 hover:bg-gray-100 rounded">↷</button>
                      <span className="text-gray-300">|</span>
                      <span className="font-semibold text-gray-800">Paragraph ▾</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-gray-900">B</span>
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
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">
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
                        <span className="text-xl font-bold text-gray-900">62</span>
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
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-gray-900">80</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase block">CONTENT SCORE</span>
                        <span className="text-[11px] text-gray-600 font-medium block">
                          Average score: 65 | TOP score: 80
                        </span>
                      </div>
                    </div>

                    {/* Brief Progress */}
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1.5 text-xs">
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
                    <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block text-left">QUALITY SCORE</span>
                      <div className="py-1 flex items-center justify-center">
                        <div className="relative w-20 h-20 rounded-full border border-dashed border-gray-200 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900">72</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                        <span className="text-emerald-600">● Grammar</span>
                        <span className="text-amber-500">● Punctuation</span>
                        <span className="text-emerald-600">● Stop words</span>
                      </div>
                    </div>

                    {/* One Click Article Generation */}
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>One click article generation</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
                        ✦
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Create new content faster and get AI-powered optimization tips to help your existing pages rock the SERP
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
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

          {/* TAB 5: Local Marketing (Exact Screenshot Match: Map + Business Listings + Reviews + Avg Pos) */}
          {platformTab === 'local-marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Local Marketing Detailed Mockup Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                {/* Top Row: Map (Left) + Business Listings (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Map Card */}
                  <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                    {/* Filters Row */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium bg-white">
                        All keywords ▾
                      </span>
                      <span className="bg-[#101423] text-white px-2 py-1 rounded-md flex items-center gap-1 font-semibold text-[9px]">
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-700 flex items-center justify-center text-[8px]">49</span>
                        4517 Wash... ▾
                      </span>
                    </div>

                    {/* Geo-Grid Map Simulation */}
                    <div className="h-44 w-full bg-[#EBF3ED] rounded-xl relative overflow-hidden border border-emerald-100 flex items-center justify-center">
                      {/* Subtle map road grid */}
                      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 150">
                        <line x1="20" y1="0" x2="20" y2="150" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="80" y1="0" x2="80" y2="150" stroke="#CBD5E1" strokeWidth="2" />
                        <line x1="140" y1="0" x2="140" y2="150" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="0" y1="40" x2="200" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="0" y1="90" x2="200" y2="90" stroke="#CBD5E1" strokeWidth="2" />
                      </svg>

                      {/* Pins Matrix matching screenshot */}
                      <div className="relative z-10 grid grid-cols-4 gap-2 text-[8px] font-bold text-white text-center">
                        <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-xs">4.3</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>

                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-600 ring-2 ring-white flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center shadow-xs text-[7px]">21+</span>

                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">1.1</span>
                        <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-xs">7.5</span>
                      </div>

                      {/* Red Target Pin */}
                      <div className="absolute bottom-4 left-1/3 flex flex-col items-center">
                        <span className="w-3.5 h-3.5 bg-rose-600 rounded-full border-2 border-white shadow-md animate-pulse" />
                        <span className="text-[7px] font-bold text-gray-700 bg-white/90 px-1 rounded shadow-2xs mt-0.5">Woodinville</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Listings Card */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <span className="text-xs font-bold text-gray-900 block pb-1 border-b border-gray-100">
                      Business Listings
                    </span>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-[9px] text-gray-400 border-b border-gray-100 pb-1">
                          <th className="font-bold py-1">DIRECTORY</th>
                          <th className="font-bold py-1">PRESENCE</th>
                          <th className="font-bold py-1 text-right">ISSUES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        <tr>
                          <td className="py-2.5 flex items-center gap-1.5 text-gray-800">
                            <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">🏪</span>
                            Google
                          </td>
                          <td className="py-2.5 text-emerald-600 font-semibold">Listed</td>
                          <td className="py-2.5 text-right text-gray-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 flex items-center gap-1.5 text-gray-800">
                            <span className="w-4 h-4 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-black">f</span>
                            Facebook
                          </td>
                          <td className="py-2.5 text-emerald-600 font-semibold">Listed</td>
                          <td className="py-2.5 text-right text-rose-500 font-bold flex items-center justify-end gap-1">
                            <span>📍</span> <span>📞</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 flex items-center gap-1.5 text-gray-800">
                            <span className="w-4 h-4 rounded bg-pink-100 text-pink-600 flex items-center justify-center text-[10px]">F</span>
                            Foursquare
                          </td>
                          <td className="py-2.5 text-gray-900 font-semibold">Not Listed</td>
                          <td className="py-2.5 text-right text-gray-400">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Row: Reviews (Left) + Top 1-3 & 4-6 (Center) + Overall Avg Position (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Reviews Card */}
                  <div className="md:col-span-5 p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">REVIEWS</span>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase font-semibold block">OVERVIEW</span>
                        <span className="text-3xl font-bold text-gray-900 block leading-tight">4.8</span>
                        <div className="flex text-amber-500 text-xs">★★★★★</div>
                        <span className="text-[8px] text-gray-400 font-mono mt-0.5 block">301 REVIEWS</span>
                      </div>
                      <div className="flex-1 space-y-1 text-[8.5px] font-semibold text-gray-600">
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">POSITIVE</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[80%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">143</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">NEUTRAL</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full w-[45%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">75</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">NEGATIVE</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full w-[15%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">21</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="w-12 text-gray-500">NOT RATED</span>
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-300 h-full w-[35%]" />
                          </div>
                          <span className="text-gray-900 w-5 text-right">62</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Top 1-3 & Top 4-6 */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">TOP 1-3</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-bold text-gray-900">49</span>
                        <span className="text-[10px] text-emerald-600 font-bold">▲ 10</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">TOP 4-6</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-bold text-gray-900">86</span>
                        <span className="text-[10px] text-emerald-600 font-bold">▲ 32</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Overall Avg Position */}
                  <div className="md:col-span-4 p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase block">OVERALL AVG. POSITION</span>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 mt-1">
                        <span className="text-[#1864FF] border-b border-[#1864FF]">3M</span>
                        <span>6M</span>
                        <span>12M</span>
                      </div>
                      <div className="h-16 w-full mt-1 relative">
                        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                          <line x1="0" y1="10" x2="100" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="30" x2="100" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                          <path d="M 0 35 C 25 30, 45 35, 65 20 C 80 15, 90 10, 100 12 L 100 50 L 0 50 Z" fill="#2563EB" fillOpacity="0.15" />
                          <path d="M 0 35 C 25 30, 45 35, 65 20 C 80 15, 90 10, 100 12" fill="none" stroke="#2563EB" strokeWidth="2" />
                          <circle cx="0" cy="35" r="1.5" fill="#2563EB" />
                          <circle cx="25" cy="30" r="1.5" fill="#2563EB" />
                          <circle cx="65" cy="20" r="1.5" fill="#2563EB" />
                          <circle cx="100" cy="12" r="1.5" fill="#2563EB" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[7px] text-gray-400 pt-0.5">
                        <span>Apr 23</span>
                        <span>May 24</span>
                        <span>Jun 25</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Exact User Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Take control of your online local presence and put your business on the map, attracting clients right to your doorstep
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <a href="https://seranking.com/local-marketing-tool.html" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Local Marketing Tool</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <a href="https://seranking.com/local-rank-tracker.html" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Local Rank Tracker</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <a href="https://online.seranking.com/admin.dashboard.html" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Projects</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
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

          {/* TAB 6: Agency Success Kit (Exact Screenshot Match: My Logo + SEO Report + Circular Wheel) */}
          {platformTab === 'agency-kit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Agency Kit Card */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center text-center">
                {/* My Logo pill badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#101423] text-white rounded-md text-xs font-semibold shadow-xs mb-4">
                  <span className="text-xs">✱</span>
                  <span>My Logo</span>
                </div>

                {/* Report Title */}
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  SEO Report
                </h3>

                {/* Date range */}
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1.5 mb-6">
                  JAN-19 2025 <span className="mx-2 text-gray-300">|</span> JAN-25 2025
                </div>

                {/* Semicircular / Segmented Color Wheel */}
                <div className="relative w-72 h-40 overflow-hidden flex items-end justify-center">
                  <svg viewBox="0 0 200 100" className="w-72 h-40 overflow-visible">
                    {/* Concentric radar arcs */}
                    <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#DBEAFE" strokeWidth="1.5" />
                    <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#DBEAFE" strokeWidth="1.5" />
                    <path d="M 50 100 A 50 50 0 0 1 150 100" fill="none" stroke="#DBEAFE" strokeWidth="1.5" />
                    <path d="M 70 100 A 30 30 0 0 1 130 100" fill="none" stroke="#DBEAFE" strokeWidth="1.5" />

                    {/* Radial grid lines */}
                    <line x1="100" y1="100" x2="30" y2="35" stroke="#DBEAFE" strokeWidth="1.5" />
                    <line x1="100" y1="100" x2="65" y2="15" stroke="#DBEAFE" strokeWidth="1.5" />
                    <line x1="100" y1="100" x2="100" y2="10" stroke="#DBEAFE" strokeWidth="1.5" />
                    <line x1="100" y1="100" x2="135" y2="15" stroke="#DBEAFE" strokeWidth="1.5" />
                    <line x1="100" y1="100" x2="170" y2="35" stroke="#DBEAFE" strokeWidth="1.5" />

                    {/* Sector 1: Lime Green */}
                    <path d="M 100 100 L 25 80 A 80 80 0 0 1 45 45 Z" fill="#4ADE80" />
                    {/* Sector 2: Deep Blue */}
                    <path d="M 100 100 L 45 45 A 80 80 0 0 1 75 25 Z" fill="#0018A8" />
                    {/* Sector 3: Bright Magenta / Red */}
                    <path d="M 100 100 L 75 25 A 80 80 0 0 1 125 25 Z" fill="#F43F5E" />
                    {/* Sector 4: Royal Blue */}
                    <path d="M 100 100 L 125 25 A 80 80 0 0 1 165 45 Z" fill="#1D4ED8" />
                    {/* Sector 5: Dark Navy */}
                    <path d="M 100 100 L 165 45 A 80 80 0 0 1 178 75 Z" fill="#0F172A" />

                    {/* Inner cutout hub */}
                    <circle cx="100" cy="100" r="18" fill="#EEF3F8" />
                  </svg>
                </div>
              </div>

              {/* Right Column: Title, Links & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Get support at every stage of the client management cycle: from lead gen to winning clients&apos; loyalty
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
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

          {/* TAB 7: Integrations (Exact Screenshot Match: 5 Category Boxes) */}
          {platformTab === 'integrations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: 5 Integrations Boxes matching exact screenshot */}
              <div className="lg:col-span-7 bg-[#EEF3F8] border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Category 1: Analytics */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block font-mono">
                      ANALYTICS
                    </span>
                    <div className="flex items-center gap-2.5">
                      {/* GA */}
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center p-2 border border-gray-100 shadow-2xs">
                        <div className="flex items-end gap-0.5 h-6">
                          <span className="w-1.5 h-2 bg-amber-500 rounded-2xs" />
                          <span className="w-1.5 h-4 bg-amber-500 rounded-2xs" />
                          <span className="w-1.5 h-6 bg-amber-500 rounded-2xs" />
                        </div>
                      </div>
                      {/* GSC */}
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center border border-gray-100 shadow-2xs text-lg">
                        <span className="text-blue-500">🔍</span>
                      </div>
                      {/* Ads */}
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center border border-gray-100 shadow-2xs">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <span className="w-2 h-5 bg-blue-600 rounded-full rotate-45 transform -translate-x-1" />
                          <span className="w-2 h-5 bg-emerald-500 rounded-full -rotate-45 transform translate-x-1" />
                        </div>
                      </div>
                      {/* Matomo */}
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center border border-gray-100 shadow-2xs">
                        <span className="text-[#0052CC] font-black text-sm">M</span>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Reporting */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block font-mono">
                      REPORTING
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-blue-600 font-bold text-sm border border-gray-100 shadow-2xs">
                        8
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-rose-500 font-bold text-sm border border-gray-100 shadow-2xs">
                        W
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-blue-600 font-black text-sm border border-gray-100 shadow-2xs">
                        A
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-cyan-500 font-bold text-sm border border-gray-100 shadow-2xs">
                        R
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Automation */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block font-mono">
                      AUTOMATION
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-rose-500 font-bold text-sm border border-gray-100 shadow-2xs">
                        ⚯
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-emerald-600 font-bold text-sm border border-gray-100 shadow-2xs">
                        ⊞
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-orange-500 font-bold text-base border border-gray-100 shadow-2xs">
                        ✱
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-purple-600 font-bold text-sm border border-gray-100 shadow-2xs">
                        III
                      </div>
                    </div>
                  </div>

                  {/* Category 4: Business Profile */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block font-mono">
                      BUSINESS PROFILE
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-blue-600 font-bold text-sm border border-gray-100 shadow-2xs">
                        🏪
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-blue-700 font-bold text-sm border border-gray-100 shadow-2xs">
                        f
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-gray-900 font-bold text-sm border border-gray-100 shadow-2xs">
                        
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-teal-600 font-bold text-sm border border-gray-100 shadow-2xs">
                        b
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category 5: Website Builder (Full Width) */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block font-mono">
                    WEBSITE BUILDER
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-gray-800 font-black text-sm border border-gray-100 shadow-2xs">
                      W
                    </div>
                    <div className="px-4 h-11 rounded-xl bg-[#F0F4FA] flex items-center justify-center text-gray-900 font-bold text-sm tracking-wider border border-gray-100 shadow-2xs">
                      WiX
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Link & Button */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal text-[#101423] leading-[1.38]">
                  Connect SE Ranking to GA4, GSC, Data Studio, Make.com, n8n, and other tools your workflows run on
                </h3>

                <div className="space-y-3.5 text-base font-medium text-gray-900">
                  <Link href="/api-docs" className="flex items-center gap-2 hover:text-[#1864FF] transition-colors cursor-pointer group">
                    <span>Integrations</span>
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

      {/* 5. Power up your stack, workflows, and reporting with SE Ranking data (Exact Screenshot Match) */}
      <section className="py-16 sm:py-24 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#101423] tracking-tight leading-tight">
            Power up your stack, workflows, and reporting with SE Ranking data
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Pull search performance and AI visibility data directly into your own tools via API or query it live inside AI assistants via MCP
          </p>
        </div>

        {/* 2-Column Section Layout matching Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Official Diagram Image */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <img
              src="/images/seranking/api-diagram.png"
              alt="SE Ranking API & Integrations Architecture"
              className="w-full h-auto rounded-3xl"
            />
          </div>

          {/* Right Column: 4 Feature Points + Projects CTA */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-6 text-sm text-[#101423]">
              {/* Bullet 1 */}
              <div className="flex items-start gap-3">
                <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#101423]">Data on your terms</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    Access rankings, keywords, backlinks, and AI visibility insights directly via SE Ranking API. No manual exports.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-3">
                <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#101423]">Reporting built around your logic</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    Connect SE Ranking to Data Studio, Whatagraph, Agency Analytics, and more to build dashboards that reflect your workflows and client priorities.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-3">
                <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#101423]">Workflows that run without you</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    Automate complex processes across multiple client projects via Make.com, n8n, or Zapier without coding.
                  </p>
                </div>
              </div>

              {/* Bullet 4 */}
              <div className="flex items-start gap-3">
                <span className="text-[#1351d8] text-xl leading-none select-none font-bold">•</span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#101423]">Live data inside your AI assistant</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    Connect via MCP and get structured SE Ranking data inside Claude, ChatGPT, or any other AI chatbot by simply describing what you need.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1351d8] hover:bg-[#0f44b8] text-white text-[15px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Precise. Credible. AI-Ready. It's all about our unique data (Exact Screenshot Match) */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#101423] tracking-tight leading-tight">
              Precise. Credible. AI-Ready. It&apos;s all about our unique data
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
              The SE Ranking AI SEO platform relies on advanced data processing algorithms to deliver unique insights. We regularly expand our databases and securely store them.
            </p>
          </div>

          {/* 5 Cards Row matching screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
            {/* 188 Country Databases */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#C4FFC4', color: '#101423' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <path d="M75 26V30H53V26H75ZM75 4H53V30L52.7939 29.9951C50.7488 29.8913 49.1087 28.2512 49.0049 26.2061L49 26V4C49 1.79086 50.7909 1.12745e-07 53 0H75C77.2091 0 79 1.79086 79 4V26C79 28.14 77.3194 29.8879 75.2061 29.9951L75 30V4Z" fill="#101423" />
                  <path opacity="0.25" d="M75 61V65H53V61H75ZM75 39H53V65L52.7939 64.9951C50.7488 64.8913 49.1087 63.2512 49.0049 61.2061L49 61V39C49 36.7909 50.7909 35 53 35H75C77.2091 35 79 36.7909 79 39V61C79 63.14 77.3194 64.8879 75.2061 64.9951L75 65V39Z" fill="#101423" />
                  <circle cx="26" cy="48" r="20" stroke="#101423" strokeWidth="4.5" />
                  <path d="M26 28V68M6 48H46" stroke="#101423" strokeWidth="3.5" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">188</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5">Country databases</div>
              </div>
            </div>

            {/* AI Powered Algorithms */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#5F31EC', color: '#ffffff' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <rect x="25" y="25" width="30" height="30" rx="4" transform="rotate(45 40 40)" stroke="#ffffff" strokeWidth="4.5" />
                  <circle cx="40" cy="12" r="3.5" fill="#ffffff" />
                  <circle cx="40" cy="68" r="3.5" fill="#ffffff" />
                  <circle cx="12" cy="40" r="3.5" fill="#ffffff" />
                  <circle cx="68" cy="40" r="3.5" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">AI</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5 opacity-95">Powered algorithms</div>
              </div>
            </div>

            {/* 5.5B Keyword Database */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#240659', color: '#ffffff' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <rect x="18" y="28" width="22" height="34" rx="3" stroke="#ffffff" strokeWidth="4" />
                  <rect x="44" y="16" width="20" height="20" rx="3" stroke="#ffffff" strokeWidth="4" />
                  <rect x="44" y="44" width="20" height="20" rx="3" stroke="#ffffff" strokeWidth="4" opacity="0.35" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">5.5B</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5 opacity-95">Keyword database</div>
              </div>
            </div>

            {/* 2.2B Domain Profiles */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] shadow-xs" style={{ backgroundColor: '#ECF1F9', color: '#101423' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="26" stroke="#101423" strokeWidth="3.5" opacity="0.25" />
                  <circle cx="40" cy="22" r="5.5" fill="#101423" />
                  <circle cx="40" cy="40" r="5.5" fill="#101423" />
                  <circle cx="40" cy="58" r="5.5" fill="#101423" />
                  <line x1="40" y1="22" x2="40" y2="58" stroke="#101423" strokeWidth="3" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">2.2B</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5">Domain profiles</div>
              </div>
            </div>

            {/* 100% Accurate Keyword Rankings */}
            <div className="rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-[210px] sm:h-[235px] col-span-2 sm:col-span-1 shadow-xs" style={{ backgroundColor: '#D8F7FF', color: '#101423' }}>
              <div className="flex justify-end">
                <svg width="50" height="50" viewBox="0 0 80 80" fill="none">
                  <path d="M22 22L36 36M22 22H34M22 22V34" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                  <path d="M58 22L44 36M58 22H46M58 22V34" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 58L36 44M22 58H34M22 58V46" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                  <path d="M58 58L44 44M58 58H46M58 58V46" stroke="#101423" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                </svg>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl lg:text-[44px] font-black leading-none tracking-tight">100%</div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider mt-2.5">Accurate keyword rankings</div>
              </div>
            </div>
          </div>

          {/* G2 Awards Box (Exact Screenshot Match) */}
          <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-9 border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl sm:text-2xl font-black text-[#101423] tracking-tight">
                Highly rated by large teams running SEO at scale
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563]">
                Don&apos;t just take our word for it, check out our latest awards from G2
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5].map((num) => (
                <img
                  key={num}
                  src={`/images/seranking/g2-${num}.svg`}
                  alt={`G2 Award ${num}`}
                  className="h-14 sm:h-18 w-auto object-contain hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>

          {/* Centered Blue Start Free Trial Button */}
          <div className="text-center pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-10 py-3.5 bg-[#1351d8] hover:bg-[#0f46bd] text-white font-bold text-sm sm:text-base rounded-lg transition-colors shadow-xs"
            >
              <span>Start free trial</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Brand visibility across the ecosystem (Exact Match to User Reference Screenshots) */}
      <section className="py-20 sm:py-28 bg-[#EBF8FE] border-t border-blue-100/50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3.5">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#101423] tracking-tight leading-tight">
              Brand visibility across the ecosystem
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Don&apos;t stop at SEO. Add AI search intelligence and social performance to see the full picture.
            </p>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
            {/* Card 1: SE Ranking (SEO & GEO) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-100/60 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 text-[#0052FF]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l6 3.75v7.85l-6 3.75-6-3.75V7.95l6-3.75z" />
                    </svg>
                    <span className="font-bold text-lg text-[#101423]">SE Ranking</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#38E0F7] text-[#101423] px-3 py-1 rounded-md">
                    SEO&amp;GEO
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                  Track rankings, research competitors, analyze brand mentions, and pull SEO and GEO data into your own workflows and reporting systems with API access.
                </p>

                {/* Card Mockup: SEO & GEO Analytics Exact Screenshot Match */}
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 text-xs">
                  {/* Top 4 Metric Pills */}
                  <div className="grid grid-cols-4 gap-2 text-left pb-2 border-b border-gray-100">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">AVERAGE POSITION</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        34 <span className="text-[10px] text-emerald-600 font-semibold">▲ 51</span>
                      </div>
                      <div className="h-4 w-full mt-0.5">
                        <svg viewBox="0 0 50 15" className="w-full h-full stroke-blue-600 fill-none stroke-[1.8]">
                          <path d="M 0 12 Q 12 0, 20 8 T 35 14 T 50 4" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">TRAFIC FORECAST</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        520 <span className="text-[10px] text-rose-500 font-semibold">▼ 245</span>
                      </div>
                      <div className="h-4 w-full mt-0.5">
                        <svg viewBox="0 0 50 15" className="w-full h-full stroke-blue-600 fill-none stroke-[1.8]">
                          <path d="M 0 10 Q 15 5, 25 11 T 40 4 T 50 10" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">SEARCH VISIBILITY</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        0.66 <span className="text-[10px] text-emerald-600 font-semibold">▲ 0.34</span>
                      </div>
                      <div className="h-4 w-full mt-0.5">
                        <svg viewBox="0 0 50 15" className="w-full h-full stroke-blue-600 fill-none stroke-[1.8]">
                          <path d="M 0 11 Q 12 3, 22 12 T 38 6 T 50 12" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">SERP FEATURES</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base flex items-baseline gap-1 mt-0.5">
                        2 <span className="text-[10px] text-emerald-600 font-semibold">▲ 1</span>
                      </div>
                      <div className="flex items-end justify-center gap-0.5 h-4 mt-0.5">
                        <span className="w-1 h-2 bg-blue-600 rounded-2xs" />
                        <span className="w-1 h-3 bg-blue-300 rounded-2xs" />
                        <span className="w-1 h-4 bg-blue-600 rounded-2xs" />
                        <span className="w-1 h-2 bg-blue-300 rounded-2xs" />
                        <span className="w-1 h-3 bg-blue-600 rounded-2xs" />
                        <span className="w-1 h-5 bg-blue-300 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">CURRENT</span>
                      <span className="text-[#1864FF] border-b-2 border-[#1864FF] pb-0.5">7D</span>
                      <span>1M</span>
                      <span>3M</span>
                      <span>6M</span>
                      <span className="ml-1 text-gray-400">GROUP BY: <strong className="text-gray-800">DAYS ∨</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1864FF] border-b-2 border-[#1864FF] pb-0.5">ALL</span>
                      <span>WEBSITES</span>
                      <span>GROUPS</span>
                    </div>
                  </div>

                  {/* Multi-Line Chart with Y-axis and 5 lines */}
                  <div className="relative pt-2 pb-1">
                    <div className="h-32 w-full relative">
                      {/* Y-axis */}
                      <div className="absolute left-0 top-0 bottom-4 text-[8px] text-gray-400 flex flex-col justify-between items-start">
                        <span>30</span>
                        <span className="flex items-center gap-1">
                          <span>20</span>
                          <span className="text-[7px] text-gray-400 -rotate-90 origin-left uppercase tracking-tighter">AVERAGE RANK</span>
                        </span>
                        <span>10</span>
                      </div>

                      <div className="ml-8 h-28">
                        <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible">
                          {/* Grid lines */}
                          <line x1="0" y1="10" x2="280" y2="10" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="50" x2="280" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                          <line x1="0" y1="90" x2="280" y2="90" stroke="#F1F5F9" strokeWidth="1" />

                          {/* Line 1: Blue (Top) */}
                          <path
                            d="M 0 65 C 35 48, 70 38, 95 32 C 120 28, 140 25, 175 35 C 210 40, 240 38, 280 25"
                            fill="none"
                            stroke="#0052FF"
                            strokeWidth="2.5"
                          />
                          <circle cx="0" cy="65" r="2.5" fill="#0052FF" />
                          <circle cx="45" cy="52" r="2.5" fill="#0052FF" />
                          <circle cx="95" cy="32" r="2.5" fill="#0052FF" />
                          <circle cx="140" cy="25" r="2.5" fill="#0052FF" />
                          <circle cx="175" cy="35" r="2.5" fill="#0052FF" />
                          <circle cx="230" cy="38" r="2.5" fill="#0052FF" />
                          <circle cx="280" cy="25" r="2.5" fill="#0052FF" />

                          {/* Line 2: Purple */}
                          <path
                            d="M 0 72 C 35 58, 70 50, 95 48 C 120 42, 140 40, 175 42 C 210 50, 240 48, 280 35"
                            fill="none"
                            stroke="#9333EA"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="72" r="2" fill="#9333EA" />
                          <circle cx="45" cy="60" r="2" fill="#9333EA" />
                          <circle cx="95" cy="48" r="2" fill="#9333EA" />
                          <circle cx="140" cy="40" r="2" fill="#9333EA" />
                          <circle cx="175" cy="42" r="2" fill="#9333EA" />
                          <circle cx="230" cy="48" r="2" fill="#9333EA" />
                          <circle cx="280" cy="35" r="2" fill="#9333EA" />

                          {/* Line 3: Cyan */}
                          <path
                            d="M 0 78 C 35 68, 70 65, 95 62 C 120 52, 140 48, 175 52 C 210 65, 240 60, 280 45"
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="78" r="2" fill="#06B6D4" />
                          <circle cx="45" cy="68" r="2" fill="#06B6D4" />
                          <circle cx="95" cy="62" r="2" fill="#06B6D4" />
                          <circle cx="140" cy="48" r="2" fill="#06B6D4" />
                          <circle cx="175" cy="52" r="2" fill="#06B6D4" />
                          <circle cx="230" cy="62" r="2" fill="#06B6D4" />
                          <circle cx="280" cy="45" r="2" fill="#06B6D4" />

                          {/* Line 4: Dark Navy */}
                          <path
                            d="M 0 85 C 35 72, 70 75, 95 72 C 120 62, 140 55, 175 50 C 210 75, 240 70, 280 55"
                            fill="none"
                            stroke="#0F172A"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="85" r="2" fill="#0F172A" />
                          <circle cx="45" cy="72" r="2" fill="#0F172A" />
                          <circle cx="95" cy="72" r="2" fill="#0F172A" />
                          <circle cx="140" cy="55" r="2" fill="#0F172A" />
                          <circle cx="175" cy="50" r="2" fill="#0F172A" />
                          <circle cx="230" cy="70" r="2" fill="#0F172A" />
                          <circle cx="280" cy="55" r="2" fill="#0F172A" />

                          {/* Line 5: Light Lime Green */}
                          <path
                            d="M 0 92 C 35 82, 70 85, 95 85 C 120 70, 140 60, 175 55 C 210 82, 240 78, 280 62"
                            fill="none"
                            stroke="#4ADE80"
                            strokeWidth="2"
                          />
                          <circle cx="0" cy="92" r="2" fill="#4ADE80" />
                          <circle cx="45" cy="80" r="2" fill="#4ADE80" />
                          <circle cx="95" cy="85" r="2" fill="#4ADE80" />
                          <circle cx="140" cy="68" r="2" fill="#4ADE80" />
                          <circle cx="175" cy="55" r="2" fill="#4ADE80" />
                          <circle cx="230" cy="80" r="2" fill="#4ADE80" />
                          <circle cx="280" cy="62" r="2" fill="#4ADE80" />
                        </svg>
                      </div>

                      {/* X-axis dates */}
                      <div className="flex justify-between text-[8px] text-gray-400 ml-8 pt-1">
                        <span>Sep 23</span>
                        <span>Sep 24</span>
                        <span>Sep 25</span>
                        <span>Sep 26</span>
                        <span>Sep 27</span>
                        <span>Sep 28</span>
                        <span>Sep 29</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 1 Button */}
              <div className="pt-5">
                <a
                  href="https://seranking.com/sign-up.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1351d8] hover:text-[#0f46bd] font-medium text-sm transition-colors group cursor-pointer"
                >
                  <span>Explore SE Ranking</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Card 2: SE Visible (AI VISIBILITY) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-100/60 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* SE Visible green wave logo */}
                    <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 14c2-4 4-6 6-6s4 8 6 8 4-5 6-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-bold text-lg text-[#101423]">SE Visible</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#38E0F7] text-[#101423] px-3 py-1 rounded-md">
                    AI VISIBILITY
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                  Monitor where your brand appears and how AI platforms describe it across ChatGPT, Gemini, Perplexity, AI Overviews, AI Mode, and other emerging search experiences.
                </p>

                {/* Card Mockup: 2x2 Grid Exact Match */}
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3.5 text-xs">
                  {/* Top Row: Visibility Chart (Left) + Competitors Table (Right) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                    {/* Visibility Chart */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">Visibility</span>
                        <div className="flex items-center gap-1 text-[9px] bg-gray-100/80 p-0.5 rounded-md">
                          <span className="bg-white text-gray-900 font-semibold px-1.5 py-0.5 rounded shadow-2xs">Visibility score</span>
                          <span className="text-gray-500 px-1.5 py-0.5">Avg position</span>
                        </div>
                      </div>

                      {/* Line chart with axis */}
                      <div className="h-20 w-full relative">
                        <div className="absolute left-0 top-0 bottom-0 text-[8px] text-gray-400 flex flex-col justify-between">
                          <span>100%</span>
                          <span>75%</span>
                          <span>50%</span>
                          <span>25%</span>
                          <span>0</span>
                        </div>
                        <div className="ml-7 h-full">
                          <svg viewBox="0 0 160 80" className="w-full h-full overflow-visible">
                            <line x1="0" y1="0" x2="160" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="20" x2="160" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="40" x2="160" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="60" x2="160" y2="60" stroke="#f1f5f9" strokeWidth="1" />

                            <path d="M 0 35 C 20 8, 40 10, 60 40 C 90 75, 120 40, 160 30" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                            <path d="M 0 45 C 30 15, 60 25, 90 45 C 120 18, 140 22, 160 15" fill="none" stroke="#2563EB" strokeWidth="1.5" />
                            <path d="M 0 30 C 25 70, 50 65, 80 40 C 110 20, 130 50, 160 12" fill="none" stroke="#0D9488" strokeWidth="1.5" />
                            <path d="M 0 65 C 25 35, 50 35, 80 55 C 110 40, 135 60, 160 25" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex justify-between text-[8px] text-gray-400 ml-6">
                        <span>Aug 24</span>
                        <span>Aug 25</span>
                        <span>Aug 26</span>
                        <span>Aug 27</span>
                        <span>Aug 28</span>
                        <span>Aug 29</span>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[8px] pt-0.5">
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />You</span>
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />Smx</span>
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />Pubcon</span>
                        <span className="flex items-center gap-1 text-gray-700 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />Tech SEO</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">✓ Competitors</span>
                      </div>
                    </div>

                    {/* Competitors Table */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-gray-900 text-xs block">Competitors</span>
                      <div className="overflow-hidden">
                        <table className="w-full text-left text-[9px]">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100">
                              <th className="pb-1 font-normal">#</th>
                              <th className="pb-1 font-normal">Brand</th>
                              <th className="pb-1 font-normal">Visibility</th>
                              <th className="pb-1 font-normal">Avg pos</th>
                              <th className="pb-1 font-normal text-right">Net</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 font-medium">
                            <tr>
                              <td className="py-1 text-gray-400">1</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-blue-600 text-white font-black text-[7px] flex items-center justify-center">b.</span>
                                Brighto..
                              </td>
                              <td className="py-1 font-bold text-gray-900">99%</td>
                              <td className="py-1 text-gray-800">2.61</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+78</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-400">2</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-sky-500 text-white font-black text-[7px] flex items-center justify-center">🔍</span>
                                Smx
                              </td>
                              <td className="py-1 font-bold text-gray-900">83%</td>
                              <td className="py-1 text-gray-800">2.75</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+44</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-400">3</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-gray-500 text-white font-black text-[7px] flex items-center justify-center">🌐</span>
                                Pubcon
                              </td>
                              <td className="py-1 font-bold text-gray-900">80%</td>
                              <td className="py-1 text-gray-800">5.11</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+40</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-gray-400">4</td>
                              <td className="py-1 flex items-center gap-1 text-gray-800">
                                <span className="w-3.5 h-3.5 rounded bg-teal-500 text-white font-black text-[7px] flex items-center justify-center">⚙️</span>
                                Tech SE..
                              </td>
                              <td className="py-1 font-bold text-gray-900">72%</td>
                              <td className="py-1 text-gray-800">5.87</td>
                              <td className="py-1 text-right text-emerald-600 font-bold">+39</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Net Sentiment Donut (Left) + Sources Table (Right) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Net Sentiment */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-gray-900 text-xs block">Net sentiment</span>
                      <div className="flex items-center gap-2.5">
                        {/* Donut Chart */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#E5E7EB"
                              strokeWidth="3.5"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#0D9488"
                              strokeWidth="3.8"
                              strokeDasharray="79, 100"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute font-black text-xs text-gray-900">+79</span>
                        </div>

                        {/* Breakdown text */}
                        <div className="space-y-0.5 text-[8.5px]">
                          <div className="text-[8px] text-gray-400">Analyzed 71 mentions</div>
                          <div className="flex items-center gap-1 font-semibold text-gray-800">
                            <span className="w-1.5 h-1.5 rounded-xs bg-[#0D9488]" /> 79% Positive
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-xs bg-gray-300" /> 61% Neutral
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-xs bg-rose-500" /> 0% Negative
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sources Table */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">Sources</span>
                        <div className="flex items-center gap-1 text-[8px]">
                          <span className="bg-gray-100 text-gray-800 font-semibold px-1 rounded">Domains</span>
                          <span className="text-gray-400">URLs</span>
                          <span className="border border-gray-200 rounded px-1 text-gray-600">Cat: All ▾</span>
                        </div>
                      </div>
                      <table className="w-full text-left text-[8.5px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-100">
                            <th className="pb-1 font-normal">Source</th>
                            <th className="pb-1 font-normal">Category</th>
                            <th className="pb-1 font-normal text-right">Used</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                          <tr>
                            <td className="py-1 text-gray-800 flex items-center gap-1">
                              <span className="text-xs">📰</span> Emryo.com
                            </td>
                            <td className="py-1">
                              <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-xs text-[7.5px]">SEO conf</span>
                            </td>
                            <td className="py-1 text-right text-gray-900 font-bold">100%</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-800 flex items-center gap-1">
                              <span className="text-xs">🤖</span> Writesonic
                            </td>
                            <td className="py-1">
                              <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded-xs text-[7.5px]">SEO conf</span>
                            </td>
                            <td className="py-1 text-right text-gray-900 font-bold">88%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 Button */}
              <div className="pt-5">
                <a
                  href="https://visible.seranking.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1351d8] hover:text-[#0f46bd] font-medium text-sm transition-colors group cursor-pointer"
                >
                  <span>Explore SE Visible</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Card 3: Planable (Social) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-100/60 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Planable multi-color flower logo */}
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 grid grid-cols-2 gap-0.5 rotate-45">
                        <span className="bg-emerald-400 rounded-xs" />
                        <span className="bg-amber-400 rounded-xs" />
                        <span className="bg-purple-500 rounded-xs" />
                        <span className="bg-pink-500 rounded-xs" />
                      </div>
                    </div>
                    <span className="font-bold text-lg text-[#101423]">planable</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#38E0F7] text-[#101423] px-3 py-1 rounded-md">
                    Social
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem]">
                  Plan, collaborate, publish, and track social performance in one workflow. Use automations and API access to keep scheduling, approvals, reporting, and integrations running.
                </p>

                {/* Card Mockup: Social Performance Stacked Waves & Metrics */}
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3.5 text-xs">
                  {/* Social Channel Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[8.5px] text-gray-600 pb-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#FB923C]" /> Instagram</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#4ADE80]" /> TikTok</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#818CF8]" /> Facebook</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#60A5FA]" /> YouTube</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-[#F472B6]" /> LinkedIn</span>
                    <span className="text-gray-400">-- Incomplete data</span>
                  </div>

                  {/* 3 Metric Cards Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-white border-2 border-blue-500 shadow-2xs">
                      <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                        <span>Followers</span>
                        <Users className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">150,716</div>
                      <div className="inline-block mt-0.5 px-1 py-0.2 bg-emerald-100 text-emerald-700 text-[8px] font-semibold rounded">
                        ↑ 1,416
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                        <span>Impressions</span>
                        <Eye className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">2,154,703</div>
                      <div className="inline-block mt-0.5 px-1 py-0.2 bg-rose-100 text-rose-700 text-[8px] font-semibold rounded">
                        ↓ 27%
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[8px] text-gray-500 mb-0.5">
                        <span>Engagements</span>
                        <MousePointerClick className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">41,967</div>
                      <div className="inline-block mt-0.5 px-1 py-0.2 bg-gray-100 text-gray-700 text-[8px] font-semibold rounded">
                        → 0
                      </div>
                    </div>
                  </div>

                  {/* Stacked Waves Chart with Jusco Juice Tooltip */}
                  <div className="relative pt-2">
                    <div className="h-28 w-full relative">
                      <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.4" />
                          </linearGradient>
                          <linearGradient id="gradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.4" />
                          </linearGradient>
                          <linearGradient id="gradPurple" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.65" />
                            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.35" />
                          </linearGradient>
                          <linearGradient id="gradPink" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#FBCFE8" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        {/* Layer 1: Orange Top Curve */}
                        <path
                          d="M 0 75 C 60 70, 110 30, 160 30 C 210 30, 240 70, 320 70 L 320 120 L 0 120 Z"
                          fill="url(#gradOrange)"
                        />
                        {/* Layer 2: Green Curve */}
                        <path
                          d="M 0 82 C 60 78, 110 50, 160 50 C 210 50, 240 80, 320 78 L 320 120 L 0 120 Z"
                          fill="url(#gradGreen)"
                        />
                        {/* Layer 3: Purple Curve */}
                        <path
                          d="M 0 92 C 60 88, 110 70, 160 70 C 210 70, 240 92, 320 90 L 320 120 L 0 120 Z"
                          fill="url(#gradPurple)"
                        />
                        {/* Layer 4: Pink Curve */}
                        <path
                          d="M 0 98 C 60 95, 110 82, 160 82 C 210 82, 240 98, 320 96 L 320 120 L 0 120 Z"
                          fill="url(#gradPink)"
                        />

                        {/* Top Wave Outlines */}
                        <path d="M 0 75 C 60 70, 110 30, 160 30 C 210 30, 240 70, 320 70" fill="none" stroke="#F97316" strokeWidth="1.5" />
                        <path d="M 0 82 C 60 78, 110 50, 160 50 C 210 50, 240 80, 320 78" fill="none" stroke="#22C55E" strokeWidth="1.5" />
                        <path d="M 0 92 C 60 88, 110 70, 160 70 C 210 70, 240 92, 320 90" fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
                      </svg>

                      {/* Tooltip for Jusco Juice at Oct 11, 2025 */}
                      <div className="absolute right-4 top-4 bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-xl p-2.5 shadow-lg text-[9px] z-10 space-y-1">
                        <div className="text-[8px] text-gray-400 font-medium">Oct 11, 2025</div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-black text-white flex items-center justify-center text-[6px]">♪</span>
                            Jusco Juice
                          </span>
                          <span className="font-bold text-gray-800">32,718</span>
                        </div>
                      </div>

                      {/* Mouse cursor pointer pointing at tooltip */}
                      <div className="absolute right-12 top-14 z-20 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-900 fill-white drop-shadow-md" viewBox="0 0 24 24">
                          <path d="M3 3l7 18 3-7 7-3L3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {/* X-axis dates */}
                    <div className="flex justify-between text-[8px] text-gray-400 pt-1">
                      <span>Oct 7</span>
                      <span>Oct 8</span>
                      <span>Oct 9</span>
                      <span>Oct 10</span>
                      <span>Oct 11</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 Button */}
              <div className="pt-5">
                <a
                  href="https://planable.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#1351d8] hover:text-[#0f46bd] font-medium text-sm transition-colors group cursor-pointer"
                >
                  <span>Explore Planable</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Card: 3 Pillars with Cyan Checkmarks */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xs border border-blue-100/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#38E0F7] text-gray-900 flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#101423] text-base sm:text-lg leading-snug">
                    More context for your visibility
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    See how your brand performs across organic search, LLMs, and social to get a fuller visibility picture.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#38E0F7] text-gray-900 flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#101423] text-base sm:text-lg leading-snug">
                    AI workflows on real brand data
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Link search performance, GEO insights, and social analytics to Claude, Cursor, or any other AI tool via MCP and API.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#38E0F7] text-gray-900 flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[#101423] text-base sm:text-lg leading-snug">
                    Cross-channel performance
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Find connections between channels, analyze dependencies, and act on the right signals instead of isolated metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Brand, grow, and win more clients with the Agency Pack (Exact Screenshot Match) */}
      <section className="py-16 sm:py-24 bg-white border-t border-gray-100 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#101423] tracking-tight leading-tight">
              Brand, grow, and win more clients with the Agency Pack
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Take control of your agency&apos;s client cycle with tools that help you attract prospects, deliver results, and build loyalty.
            </p>
          </div>

          {/* 5 Agency Pack Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-sm">
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
                className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-[15px] transition-all cursor-pointer ${
                  agencyPackTab === t.id
                    ? 'bg-[#101423] text-white font-normal shadow-xs'
                    : 'text-[#667085] hover:text-[#101423] font-normal hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 1. Tab: Agency Catalog (Exact 100% match to official seranking.com screenshot) */}
          {agencyPackTab === 'catalog' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pt-2">
              {/* Left Column: Agency Cards in Mockup with right and bottom peeking effect */}
              <div className="lg:col-span-7 xl:col-span-7 bg-[#EEF6FF] border border-[#DEECFD] rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 overflow-hidden h-[440px] sm:h-[460px] relative shadow-xs">
                <div className="grid grid-cols-[330px_330px] sm:grid-cols-[350px_350px] gap-5 w-[730px] select-none">
                  {agencyCatalogItems.map((item) => (
                    <div
                      key={item.id}
                      className="w-[330px] sm:w-[350px] p-5 sm:p-6 bg-white border border-[#E2EDF9] rounded-[22px] space-y-4 shadow-[0_2px_12px_rgba(16,24,40,0.04)] shrink-0"
                    >
                      {/* Top Header: Logo box + Title & URL */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-[52px] h-[52px] rounded-[14px] border border-[#CBD5E1] bg-white flex items-center justify-center shrink-0 shadow-2xs">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="text-[18px] font-bold text-[#101828] leading-tight truncate">
                            {item.name}
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] text-[#0B69FF] font-medium hover:underline block truncate mt-1"
                          >
                            {item.url}
                          </a>
                        </div>
                      </div>

                      {/* Key-Value Details matching reference screenshot */}
                      <div className="space-y-3 text-[13px] pt-1.5">
                        {/* Location */}
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-[#475467] w-[95px] shrink-0 font-normal">
                            <MapPin className="w-4 h-4 text-[#344054] shrink-0" strokeWidth={1.8} />
                            <span>Location</span>
                          </div>
                          <div className="font-bold text-[#101828] truncate pl-3">
                            {item.location}
                          </div>
                        </div>

                        {/* Services */}
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-[#475467] w-[95px] shrink-0 font-normal">
                            <Wrench className="w-4 h-4 text-[#344054] shrink-0" strokeWidth={1.8} />
                            <span>Services</span>
                          </div>
                          <div className="font-bold text-[#101828] truncate pl-3 flex items-center">
                            <span className="truncate">{item.services}</span>
                            {item.servicesExtra && (
                              <span className="text-[#0B69FF] font-bold ml-1.5 shrink-0">
                                {item.servicesExtra}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Industries */}
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-[#475467] w-[95px] shrink-0 font-normal">
                            <Briefcase className="w-4 h-4 text-[#344054] shrink-0" strokeWidth={1.8} />
                            <span>Industries</span>
                          </div>
                          <div className="font-bold text-[#101828] truncate pl-3 flex items-center">
                            <span className="truncate">{item.industries}</span>
                            {item.industriesExtra && (
                              <span className="text-[#0B69FF] font-bold ml-1.5 shrink-0">
                                {item.industriesExtra}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Budget */}
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-[#475467] w-[95px] shrink-0 font-normal">
                            <Banknote className="w-4 h-4 text-[#344054] shrink-0" strokeWidth={1.8} />
                            <span>Budget</span>
                          </div>
                          <div className="font-bold text-[#101828] truncate pl-3">
                            {item.budget}
                          </div>
                        </div>

                        {/* Team size */}
                        <div className="flex items-center">
                          <div className="flex items-center gap-2 text-[#475467] w-[95px] shrink-0 font-normal">
                            <Users className="w-4 h-4 text-[#344054] shrink-0" strokeWidth={1.8} />
                            <span>Team size</span>
                          </div>
                          <div className="font-bold text-[#101828] truncate pl-3">
                            {item.teamSize}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column (Exact Screenshot Match) */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-3xl sm:text-[44px] font-bold text-[#101423] tracking-tight leading-[1.1]">
                  Agency Catalog
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Jump into the spotlight with SE Ranking&apos;s Agency Pack! Secure a spot in our expert Agency Catalog, where your services take center stage in front of new prospects. Watch your leads soar, trust surge, and your agency thrive and grow.
                </p>
                <div className="pt-1">
                  <a
                    href="https://seranking.com/agency-catalog.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#101423] hover:bg-black text-white text-[15px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Browse catalog
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 2. Tab: White Label Reporting (Exact 100% match to screenshot 1) */}
          {agencyPackTab === 'reporting' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pt-2">
              {/* Left Column: SEO Report Card with Gauge */}
              <div className="lg:col-span-7 xl:col-span-7 bg-[#EEF6FF] border border-[#DEECFD] rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
                <div className="w-full max-w-[360px] sm:max-w-[380px] bg-white rounded-[26px] border border-[#E2EDF9] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center space-y-3 relative overflow-hidden">
                  {/* Top Badge: * My Logo */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0E131F] text-white rounded-lg text-xs font-bold shadow-2xs">
                    <span className="text-[13px] leading-none">✻</span>
                    <span>My Logo</span>
                  </div>

                  <div>
                    <h4 className="text-[28px] sm:text-[32px] font-bold text-[#101423] tracking-tight leading-none mt-2">
                      SEO Report
                    </h4>
                    <p className="text-[11px] sm:text-[12px] font-mono tracking-wider font-semibold text-[#64748B] uppercase mt-2.5">
                      JAN-19 2025 <span className="mx-2 text-[#CBD5E1]">|</span> JAN-25 2025
                    </p>
                  </div>

                  {/* Polar radial semi-circle gauge matching exact screenshot */}
                  <div className="pt-3 flex justify-center overflow-visible">
                    <svg
                      width="300"
                      height="150"
                      viewBox="0 0 300 150"
                      className="overflow-visible select-none"
                    >
                      {/* Concentric grid lines */}
                      <path
                        d="M 20 150 A 130 130 0 0 1 280 150"
                        fill="none"
                        stroke="#DCE7F6"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 50 150 A 100 100 0 0 1 250 150"
                        fill="none"
                        stroke="#DCE7F6"
                        strokeWidth="1.5"
                      />

                      {/* Radial spokes in faint blue */}
                      <line x1="150" y1="150" x2="20" y2="150" stroke="#DCE7F6" strokeWidth="1.5" />
                      <line x1="150" y1="150" x2="38" y2="85" stroke="#DCE7F6" strokeWidth="1.5" />
                      <line x1="150" y1="150" x2="85" y2="38" stroke="#DCE7F6" strokeWidth="1.5" />
                      <line x1="150" y1="150" x2="150" y2="20" stroke="#DCE7F6" strokeWidth="1.5" />
                      <line x1="150" y1="150" x2="215" y2="38" stroke="#DCE7F6" strokeWidth="1.5" />
                      <line x1="150" y1="150" x2="262" y2="85" stroke="#DCE7F6" strokeWidth="1.5" />
                      <line x1="150" y1="150" x2="280" y2="150" stroke="#DCE7F6" strokeWidth="1.5" />

                      {/* Colored Radial Slices matching screenshot */}
                      {/* 1. Neon Green Slice (Leftmost) */}
                      <path
                        d="M 150 150 L 60 150 A 90 90 0 0 1 68 112 Z"
                        fill="#7EFC7E"
                      />

                      {/* 2. Deep Navy Blue Slice */}
                      <path
                        d="M 150 150 L 46 92 A 125 125 0 0 1 92 46 Z"
                        fill="#000EB8"
                      />

                      {/* 3. Vivid Pink/Red Slice (Top Center) */}
                      <path
                        d="M 150 150 L 102 52 A 105 105 0 0 1 198 52 Z"
                        fill="#F42557"
                      />

                      {/* 4. Bright Electric Blue Slice (Upper Right) */}
                      <path
                        d="M 150 150 L 208 38 A 130 130 0 0 1 272 105 Z"
                        fill="#1251FE"
                      />

                      {/* 5. Dark Midnight Blue Slice (Far Right) */}
                      <path
                        d="M 150 150 L 258 110 A 115 115 0 0 1 265 150 Z"
                        fill="#0B1336"
                      />

                      {/* Inner semi-circle hub */}
                      <path
                        d="M 115 150 A 35 35 0 0 1 185 150 Z"
                        fill="#E2EDF8"
                      />
                      <path
                        d="M 132 150 A 18 18 0 0 1 168 150 Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-3xl sm:text-[44px] font-bold text-[#101423] tracking-tight leading-[1.1]">
                  White Label Reporting
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Keep your customer in the loop with compelling reporting. Design customizable automated reports to effortlessly showcase the value of your SEO services to clients.
                </p>
                <div className="pt-1">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#101423] hover:bg-black text-white text-[15px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 3. Tab: Lead Generator (Exact 100% match to screenshot 2) */}
          {agencyPackTab === 'lead-gen' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center pt-2">
              {/* Left Column: Leads Mockup Card */}
              <div className="lg:col-span-7 xl:col-span-7 bg-[#EEF6FF] border border-[#DEECFD] rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-xs">
                <div className="bg-white rounded-[24px] border border-[#E2EDF9] p-5 sm:p-6 shadow-[0_2px_12px_rgba(16,24,40,0.04)] space-y-4">
                  <h4 className="text-[20px] font-bold text-[#101423]">Leads</h4>

                  {/* 3 Stat Cards */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-3.5">
                    <div className="p-3.5 sm:p-4 bg-[#EEF5FF] rounded-[14px] border border-[#DCE9F8]">
                      <div className="text-[28px] sm:text-[32px] font-bold text-[#101423] leading-none">
                        72
                      </div>
                      <div className="text-[11px] font-mono tracking-wider font-semibold text-[#64748B] mt-2 uppercase">
                        TODAY
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-[#EEF5FF] rounded-[14px] border border-[#DCE9F8]">
                      <div className="text-[28px] sm:text-[32px] font-bold text-[#101423] leading-none">
                        1798
                      </div>
                      <div className="text-[11px] font-mono tracking-wider font-semibold text-[#64748B] mt-2 uppercase">
                        PER MONTH
                      </div>
                    </div>
                    <div className="p-3.5 sm:p-4 bg-[#EEF5FF] rounded-[14px] border border-[#DCE9F8]">
                      <div className="text-[28px] sm:text-[32px] font-bold text-[#101423] leading-none">
                        58
                      </div>
                      <div className="text-[11px] font-mono tracking-wider font-semibold text-[#64748B] mt-2 uppercase">
                        AVG. PER DAY
                      </div>
                    </div>
                  </div>

                  {/* Leads Table matching screenshot */}
                  <div className="rounded-[16px] border border-gray-200/80 overflow-hidden divide-y divide-gray-100">
                    <div className="grid grid-cols-2 py-3 px-4 bg-white text-[11px] font-mono font-bold text-[#64748B] tracking-wider uppercase border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Square className="w-3.5 h-3.5 text-gray-800 shrink-0" strokeWidth={2} />
                        <span>AUDIT PAGE URL</span>
                      </div>
                      <div>LEAD INFO</div>
                    </div>

                    <div className="grid grid-cols-2 py-3 px-4 items-center bg-white">
                      <div className="flex items-center gap-2 text-xs">
                        <Square className="w-3.5 h-3.5 text-gray-800 shrink-0" strokeWidth={2} />
                        <span className="text-[#0B69FF] font-medium truncate">
                          https://www.g2.com/products/se-rankin...
                        </span>
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-[#101423]">Dianne Russell</div>
                        <div className="text-[11px] text-[#64748B]">dianne.russel@outlook.com</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 py-3 px-4 items-center bg-white">
                      <div className="flex items-center gap-2 text-xs">
                        <Square className="w-3.5 h-3.5 text-gray-800 shrink-0" strokeWidth={2} />
                        <span className="text-[#0B69FF] font-medium truncate">
                          https://www.capterra.com/p/142169/SE...
                        </span>
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-[#101423]">Megan Smith</div>
                        <div className="text-[11px] text-[#64748B]">megan.design@gmail.com</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 py-3 px-4 items-center bg-white">
                      <div className="flex items-center gap-2 text-xs">
                        <Square className="w-3.5 h-3.5 text-gray-800 shrink-0" strokeWidth={2} />
                        <span className="text-[#0B69FF] font-medium truncate">
                          https://www.getapp.com/marketing-soft...
                        </span>
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-[#101423]">Dianne Russell</div>
                        <div className="text-[11px] text-[#64748B]">dianne.russel@outlook.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-3xl sm:text-[44px] font-bold text-[#101423] tracking-tight leading-[1.1]">
                  Lead Generator
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Expand your email list and generate new quality leads. Embed our customizable lead gen solutions to your website and convert visitors into new customers.
                </p>
                <div className="pt-1">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#101423] hover:bg-black text-white text-[15px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 4. Tab: White Label */}
          {agencyPackTab === 'white-label' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: White Label Customization Mockup Card */}
              <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
                {/* Mint green header bar */}
                <div className="px-6 py-4 bg-[#BEF7C5] border-b border-gray-100 flex items-center">
                  <div className="px-3.5 py-1.5 bg-white text-[#101423] rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-2xs">
                    <span className="text-base leading-none font-black">*</span>
                    <span className="tracking-tight">My Logo</span>
                  </div>
                </div>

                {/* Settings Rows */}
                <div className="divide-y divide-gray-100">
                  {/* Row 1: UI Color */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-5">
                    <span className="font-mono text-[14px] text-gray-800 tracking-wide font-medium">UI Color</span>
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      {/* Mint Green (active outline) */}
                      <div className="w-8 h-8 rounded-lg bg-[#BEF7C5] border-2 border-emerald-400 cursor-pointer shadow-2xs hover:scale-105 transition-transform" />
                      {/* Purple */}
                      <div className="w-8 h-8 rounded-lg bg-[#9A00FF] cursor-pointer hover:scale-105 transition-transform" />
                      {/* Orange with cursor arrow */}
                      <div className="relative cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-8 h-8 rounded-lg bg-[#FF9F00]" />
                        <div className="absolute -bottom-3 right-0 pointer-events-none z-10">
                          <svg className="w-5 h-5 text-black drop-shadow-sm fill-black stroke-white stroke-[0.5]" viewBox="0 0 24 24">
                            <path d="M4 2l16 11.5-7.5 1.5 4.5 7.5-3 1.5-4.5-7.5L4 20V2z" />
                          </svg>
                        </div>
                      </div>
                      {/* Deep Royal Blue */}
                      <div className="w-8 h-8 rounded-lg bg-[#0000C8] cursor-pointer hover:scale-105 transition-transform" />
                      {/* Crimson / Magenta */}
                      <div className="w-8 h-8 rounded-lg bg-[#E61952] cursor-pointer hover:scale-105 transition-transform" />
                    </div>
                  </div>

                  {/* Row 2: Company logo */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-5">
                    <span className="font-mono text-[14px] text-gray-800 tracking-wide font-medium">Company logo</span>
                    <div className="flex items-center gap-3">
                      {/* Current logo preview pill */}
                      <div className="px-3.5 py-2 bg-[#E2E8F4] text-gray-900 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-2xs">
                        <span className="w-5 h-5 rounded-md bg-white flex items-center justify-center text-xs font-black text-black">
                          *
                        </span>
                        <span className="tracking-tight text-gray-900">My Logo</span>
                      </div>
                      {/* Update logo button */}
                      <button
                        type="button"
                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="16" height="16" x="2" y="5" rx="2" />
                          <circle cx="8" cy="11" r="1.5" />
                          <path d="m2 17 5-5 4 4 5-5 2 2" />
                          <path d="M19 2v6m-3-3h6" />
                        </svg>
                        <span>Update logo</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 3: Footer logo */}
                  <div className="flex items-center justify-between px-6 sm:px-8 py-5">
                    <span className="font-mono text-[14px] text-gray-800 tracking-wide font-medium">Footer logo</span>
                    <button
                      type="button"
                      className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-900 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="16" height="16" x="2" y="5" rx="2" />
                        <circle cx="8" cy="11" r="1.5" />
                        <path d="m2 17 5-5 4 4 5-5 2 2" />
                        <path d="M19 2v6m-3-3h6" />
                      </svg>
                      <span>Upload logo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-3xl sm:text-[44px] font-bold text-[#101423] tracking-tight leading-[1.1]">
                  White Label
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Enhance credibility and strengthen customer trust. Create a seamless client experience by providing access to our SEO platform customized to your brand book and domain name.
                </p>
                <div className="pt-1">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#101423] hover:bg-black text-white text-[15px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 5. Tab: Client Seats */}
          {agencyPackTab === 'seats' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2">
              {/* Left Column: Users Table Mockup Card */}
              <div className="lg:col-span-7 bg-[#F4F6FA] border border-gray-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <h4 className="text-xl font-bold text-[#101423]">Users</h4>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] text-gray-400 uppercase font-semibold">
                        <th className="py-3 px-4">NAME</th>
                        <th className="py-3 px-4">ACCOUNT TYPE</th>
                        <th className="py-3 px-4">EMAIL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Row 1: Devon Lane (Highlighted in soft cyan) */}
                      <tr className="bg-[#E5F6FF]/90 font-medium">
                        <td className="py-3 px-4 flex items-center gap-2.5 text-gray-900">
                          <span className="text-gray-400 text-xs">›</span>
                          <span className="w-6 h-6 rounded bg-gray-200/90 flex items-center justify-center text-xs font-bold text-gray-700">7</span>
                          <span className="font-semibold text-gray-900">Devon Lane</span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                            <Shield className="w-3.5 h-3.5 text-blue-600" />
                            Owner
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">ewaters@comcast.net</td>
                      </tr>
                      {/* Row 2: Harry Leddington */}
                      <tr>
                        <td className="py-3 px-4 flex items-center gap-2.5 text-gray-900">
                          <span className="text-gray-400 text-xs">›</span>
                          <span className="w-6 h-6 rounded bg-gray-200/90 flex items-center justify-center text-xs font-bold text-gray-700">51</span>
                          <span className="font-semibold text-gray-900">Harry Leddington</span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            Client
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">yeedancer@gmail.c...</td>
                      </tr>
                      {/* Row 3: Mark Kleiner */}
                      <tr>
                        <td className="py-3 px-4 flex items-center gap-2.5 text-gray-900">
                          <span className="text-gray-400 text-xs">›</span>
                          <span className="w-6 h-6 rounded bg-gray-200/90 flex items-center justify-center text-xs font-bold text-gray-700">65</span>
                          <span className="font-semibold text-gray-900">Mark Kleiner</span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                            <User className="w-3.5 h-3.5 text-gray-500" />
                            Manager
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">m.klnr@outlook.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-5 pl-2 sm:pl-6 space-y-6 text-left">
                <h3 className="text-3xl sm:text-[44px] font-bold text-[#101423] tracking-tight leading-[1.1]">
                  Client Seats
                </h3>
                <p className="text-[16px] text-[#475467] leading-[1.65] max-w-[460px] font-normal">
                  Get extra client seats to openly communicate your progress. Choose which SEO tools your clients will have access to and adjust access settings at any time.
                </p>
                <div className="pt-1">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#101423] hover:bg-black text-white text-[15px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. Why SEO pros from 150+ countries choose us (Exact Screenshot Match) */}
      <section className="py-20 sm:py-28 bg-white border-t border-gray-100 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#101423] tracking-tight">
            Why SEO pros from 150+ countries choose us
          </h2>

          {/* Interactive Pagination < 1 / 7 > matching screenshot */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                setTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
              }
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 cursor-pointer transition-colors shadow-2xs"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-sm font-semibold text-gray-700 px-3">
              {testimonialIdx + 1} / {testimonials.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
              }
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 cursor-pointer transition-colors shadow-2xs"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quote display */}
          <div className="min-h-[160px] flex flex-col justify-center px-4">
            <p className="text-xl sm:text-2xl lg:text-[26px] font-normal text-[#101423] leading-relaxed max-w-3xl mx-auto font-mono sm:font-sans">
              {testimonials[testimonialIdx].quote}
            </p>
          </div>

          {/* Author avatar & info */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <img
              src={testimonials[testimonialIdx].avatar}
              alt={testimonials[testimonialIdx].name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs"
            />
            <div className="text-base font-bold text-[#101423]">
              {testimonials[testimonialIdx].name}
            </div>
            <div className="text-sm text-gray-500 font-normal">
              {testimonials[testimonialIdx].role}
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
              href="/signup"
              className="px-8 py-3.5 bg-[#4ADE80] hover:bg-[#22C55E] text-[#052E16] font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-md inline-block cursor-pointer"
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Close Tour
                </button>
                <Link
                  href="/projects"
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition-colors"
                >
                  View Studio Live
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
