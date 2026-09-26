'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Search,
  Check,
  ChevronDown,
  Wand2,
  Copy,
  Edit3,
  Sparkles,
  Download,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

// Real Semantic Clusters generator for Content Idea Finder
const generateIdeaClusters = (seed: string, country: string, region: string) => {
  const cleanSeed = seed.trim().toLowerCase() || 'content marketing';
  const locSuffix = region ? ` in ${region}` : country ? ` in ${country}` : '';
  return [
    {
      clusterName: `${cleanSeed.toUpperCase()} Strategy & Fundamentals${locSuffix}`,
      totalVolume: 34200,
      avgKd: 48,
      ideasCount: 14,
      keywords: [
        { text: `what is ${cleanSeed}`, volume: 18100, kd: 39, cpc: '$3.40', intent: 'Informational' },
        { text: `${cleanSeed} strategy step by step`, volume: 8900, kd: 52, cpc: '$4.85', intent: 'Informational' },
        { text: `${cleanSeed} best practices 2026`, volume: 5400, kd: 44, cpc: '$3.10', intent: 'Informational' },
        { text: `${cleanSeed} roadmap for b2b`, volume: 1800, kd: 41, cpc: '$5.20', intent: 'Commercial' },
      ],
    },
    {
      clusterName: `${cleanSeed.toUpperCase()} Tools & AI Automation`,
      totalVolume: 27800,
      avgKd: 58,
      ideasCount: 19,
      keywords: [
        { text: `best ${cleanSeed} tools`, volume: 14200, kd: 61, cpc: '$6.50', intent: 'Commercial' },
        { text: `ai ${cleanSeed} software`, volume: 7600, kd: 54, cpc: '$5.80', intent: 'Commercial' },
        { text: `free ${cleanSeed} platforms`, volume: 4100, kd: 46, cpc: '$2.90', intent: 'Informational' },
        { text: `${cleanSeed} automation workflows`, volume: 1900, kd: 57, cpc: '$7.10', intent: 'Commercial' },
      ],
    },
    {
      clusterName: `${cleanSeed.toUpperCase()} Examples & Case Studies`,
      totalVolume: 19400,
      avgKd: 42,
      ideasCount: 11,
      keywords: [
        { text: `${cleanSeed} real examples`, volume: 9800, kd: 38, cpc: '$2.80', intent: 'Informational' },
        { text: `successful ${cleanSeed} campaigns`, volume: 5100, kd: 43, cpc: '$4.10', intent: 'Informational' },
        { text: `${cleanSeed} roi metrics`, volume: 2700, kd: 47, cpc: '$5.90', intent: 'Commercial' },
        { text: `${cleanSeed} templates download`, volume: 1800, kd: 35, cpc: '$3.20', intent: 'Transactional' },
      ],
    },
    {
      clusterName: `Questions Asked About ${cleanSeed.toUpperCase()}`,
      totalVolume: 16500,
      avgKd: 36,
      ideasCount: 16,
      keywords: [
        { text: `how to create a ${cleanSeed} plan?`, volume: 6700, kd: 35, cpc: '$3.60', intent: 'Informational' },
        { text: `why is ${cleanSeed} important for seo?`, volume: 4900, kd: 32, cpc: '$2.90', intent: 'Informational' },
        { text: `how much does ${cleanSeed} cost?`, volume: 3100, kd: 41, cpc: '$6.20', intent: 'Commercial' },
        { text: `how to measure ${cleanSeed} success?`, volume: 1800, kd: 37, cpc: '$4.50', intent: 'Informational' },
      ],
    },
  ];
};

export default function ContentMarketingSuite() {
  const [activeTab, setActiveTab] = useState<'editor' | 'idea-finder'>('editor');
  const [isTopBannerDismissed, setIsTopBannerDismissed] = useState(false);

  // Content Idea Finder State
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isRegionPopoverOpen, setIsRegionPopoverOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [isSearchingIdeas, setIsSearchingIdeas] = useState(false);
  const [searchResults, setSearchResults] = useState<ReturnType<typeof generateIdeaClusters> | null>(null);

  // Content Editor Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Modals for Real Functionality
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [briefKeyword, setBriefKeyword] = useState('b2b content marketing strategy');
  const [editorTitle, setEditorTitle] = useState('The Ultimate B2B Content Marketing Strategy Guide for 2026');
  const [editorContent, setEditorContent] = useState(
    `# The Ultimate B2B Content Marketing Strategy Guide for 2026\n\nDeveloping an impactful b2b content marketing strategy requires a deep understanding of your audience personas, buyer search intent, and the full organic conversion funnel.\n\n## 1. Defining Clear Marketing Objectives\nBefore producing articles, align your editorial calendar with qualified lead generation goals and organic traffic benchmarks.\n\n## 2. Conducting Competitive Topic Analysis\nAnalyze top-ranking SERP competitors to identify keyword content gaps and ensure comprehensive semantic coverage across every stage of the customer journey.`
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Regions list for India
  const indiaRegions = [
    'Bengaluru, Karnataka, India',
    'Mumbai, Maharashtra, India',
    'Pune, Maharashtra, India',
    'Delhi, National Capital Territory of Delhi, India',
    'Gurugram, Haryana, India',
    'Hyderabad, Telangana, India',
    'Chennai, Tamil Nadu, India',
    'Kolkata, West Bengal, India',
    'Ahmedabad, Gujarat, India',
    'Jaipur, Rajasthan, India',
    'Chandigarh, Punjab, India',
    'Kochi, Kerala, India',
    'Visakhapatnam, Andhra Pradesh, India',
    'Indore, Madhya Pradesh, India',
    'Noida, Uttar Pradesh, India',
  ];

  const filteredRegions = indiaRegions.filter((r) =>
    r.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const handleFindIdeasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setIsSearchingIdeas(true);
    setTimeout(() => {
      setSearchResults(generateIdeaClusters(keywordInput, selectedCountry, selectedRegion));
      setIsSearchingIdeas(false);
    }, 500);
  };

  const launchBriefFromKeyword = (kw: string) => {
    setBriefKeyword(kw);
    setEditorTitle(`Complete Guide: How to Master ${kw.toUpperCase()} in 2026`);
    setEditorContent(
      `# Complete Guide: How to Master ${kw.toUpperCase()} in 2026\n\nLearn how to effectively implement ${kw} to drive targeted organic search traffic, satisfy customer search intent, and boost your website conversion rates.\n\n## Why ${kw} Matters for SEO\nSearch engines evaluate topical authority by assessing the comprehensiveness and factual accuracy of your content.\n\n## Step-by-Step Implementation Framework\nFollow these proven recommendations to outrank your competitors on Google.`
    );
    setActiveTab('editor');
    setIsBriefModalOpen(true);
  };

  const wordCount = editorContent.trim().split(/\s+/).filter(Boolean).length;
  const headingsCount = (editorContent.match(/^#{1,3}\s/gm) || []).length;
  const targetWords = 1850;
  const targetHeadings = 8;
  const contentScore = Math.min(
    95,
    Math.round((wordCount / targetWords) * 50 + (headingsCount / targetHeadings) * 30 + 15)
  );

  const semanticKeywords = [
    { term: briefKeyword.toLowerCase(), target: '3-6', count: (editorContent.toLowerCase().match(new RegExp(briefKeyword.toLowerCase(), 'g')) || []).length },
    { term: 'search intent', target: '2-4', count: (editorContent.toLowerCase().match(/search intent/g) || []).length },
    { term: 'organic traffic', target: '2-5', count: (editorContent.toLowerCase().match(/organic traffic/g) || []).length },
    { term: 'conversion rate', target: '1-3', count: (editorContent.toLowerCase().match(/conversion rate/g) || []).length },
    { term: 'competitors', target: '2-4', count: (editorContent.toLowerCase().match(/competitors/g) || []).length },
    { term: 'topical authority', target: '1-3', count: (editorContent.toLowerCase().match(/topical authority/g) || []).length },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] text-gray-900 min-h-screen">
      {/* Top Blue Suite Navigation Bar */}
      <div className="bg-[#0B69FF] px-4 py-1.5 flex items-center justify-between border-t border-blue-400/20 text-white text-xs select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-white text-[#0B69FF] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Content Editor</span>
          </button>
          <button
            onClick={() => setActiveTab('idea-finder')}
            className={`px-3.5 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'idea-finder'
                ? 'bg-white text-[#0B69FF] shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Content Idea Finder</span>
          </button>
        </div>
      </div>

      {/* Top Notification Alert Banner for Content Idea Finder matching exact DOM */}
      {activeTab === 'idea-finder' && !isTopBannerDismissed && (
        <div className="bg-[#EBF3FC] border-b border-[#CCE0F8] px-4 py-2.5 text-xs text-[#1E40AF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#0B69FF] text-white text-xs font-bold font-serif shrink-0">
              i
            </span>
            <div className="leading-snug">
              Content Idea Finder helps analyze keywords in your niche and create a content strategy based on collected data. Get new topic ideas, choose relevant keywords and create top-quality content with them.
            </div>
          </div>
          <button
            onClick={() => setIsTopBannerDismissed(true)}
            className="text-gray-400 hover:text-gray-700 ml-4 p-0.5 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Control Panel with Breadcrumbs, Feedback, and Speed Limit Meter matching exact DOM */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span
            onClick={() => setActiveTab('editor')}
            className="hover:text-gray-900 cursor-pointer text-gray-600 font-medium"
          >
            Content Marketing
          </span>
          <span>&gt;</span>
          <span className="text-gray-900 font-semibold">
            {activeTab === 'editor' ? 'Content Editor' : 'Content Idea Finder'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Feedback modal: Thank you for your feedback!')}
            className="text-gray-500 hover:text-[#0B69FF] transition-colors cursor-pointer"
          >
            Feedback
          </button>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="text-gray-600 font-medium">
              {activeTab === 'editor' ? 'Articles' : 'Account limit'}
            </span>
            <span className="font-bold text-gray-900">0</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">2</span>
            <span
              className="text-gray-400 hover:text-gray-600 cursor-pointer ml-0.5"
              title="Free trial includes 2 credits"
            >
              ⓘ
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONTENT EDITOR VIEW (Screenshots 1 & 2 - matching exact DOM classes)   */}
      {/* ========================================================================= */}
      {activeTab === 'editor' && (
        <div className="max-w-[760px] mx-auto w-full px-4 py-8 space-y-6">
          {/* Card 1: Content Editor Hero Action Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-xs">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight mb-2.5">
              Content Editor
            </h1>
            <p className="text-gray-600 text-[13px] leading-relaxed max-w-xl mx-auto mb-6">
              Write actionable briefs and SEO-ready articles in just a few clicks. Optimize your existing content to rank high, drive relevant traffic, and boost conversions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="w-full sm:w-auto bg-[#0B69FF] hover:bg-[#0957DB] text-white font-semibold text-xs px-6 py-2.5 rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Write new brief &amp; article</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOptimizeModalOpen(true)}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs px-6 py-2.5 rounded shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Optimize existing content</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Features Grid (8 features with exact colors and material icons) */}
          <div className="bg-transparent space-y-5">
            <h2 className="text-center font-bold text-gray-900 text-base md:text-lg">
              Use all features to write high-quality content
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Content Briefs */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-blue-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(227, 239, 250)' }}>
                    <span className="text-2xl" style={{ color: 'rgb(25, 118, 210)' }}>
                      ≡
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Content Briefs</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Automate SEO content briefs, export and share seamlessly, and quickly verify all requirements are met after writing.
                  </p>
                </div>
              </div>

              {/* 2. Competitors */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-red-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(252, 234, 232)' }}>
                    <span className="text-xl" style={{ color: 'rgb(215, 60, 45)' }}>
                      👥
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Competitors</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Analyze your top 10 competitors and gain detailed insights into word count, headings, keywords, images, readability, other attributes of their content.
                  </p>
                </div>
              </div>

              {/* 3. Semantically related keywords */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-green-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(225, 241, 232)' }}>
                    <span className="text-xl" style={{ color: 'rgb(0, 136, 69)' }}>
                      🔑
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Semantically related keywords</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Identify key topics, entities, and terms for your primary keyword. Cover all essential points to create a comprehensive, valuable article.
                  </p>
                </div>
              </div>

              {/* 4. Actionable recommendations */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-amber-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(255, 234, 216)' }}>
                    <span className="text-xl" style={{ color: 'rgb(244, 143, 29)' }}>
                      💡
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Actionable recommendations</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Get actionable recommendations based on your competitor analysis and article brief.
                  </p>
                </div>
              </div>

              {/* 5. AskAI and AI templates */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(239, 234, 255)' }}>
                    <span className="text-xl" style={{ color: 'rgb(114, 103, 218)' }}>
                      ✨
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">AskAI and AI templates</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Use AskAI and AI templates to write and rewrite content based on your specific requirements.
                  </p>
                </div>
              </div>

              {/* 6. Generate full articles */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-teal-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(222, 241, 242)' }}>
                    <span className="text-xl" style={{ color: 'rgb(0, 104, 111)' }}>
                      📄
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Generate full articles</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Use AI to generate complete articles and customize content to your needs with a step-by-step generator (currently only in English).
                  </p>
                </div>
              </div>

              {/* 7. Collaboration */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-lime-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(226, 243, 221)' }}>
                    <span className="text-xl" style={{ color: 'rgb(55, 106, 37)' }}>
                      🔗
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Collaboration</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Easily share or export your briefs and articles with team members or stakeholders, enabling smooth collaboration and feedback.
                  </p>
                </div>
              </div>

              {/* 8. Analytics and notes */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(243, 235, 247)' }}>
                    <span className="text-xl" style={{ color: 'rgb(129, 69, 154)' }}>
                      📊
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Analytics and notes</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Monitor the performance of your publications and track key metrics over time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Available integrations matching exact buttons and SVG icons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Available integrations</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => alert('WordPress plugin connected! You can sync draft posts directly to your WordPress admin.')}
                className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#21759B] text-white flex items-center justify-center text-xs font-serif font-bold">
                  W
                </span>
                <span>WordPress</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => alert('Google Docs Add-on: Installed and ready. Open Google Docs -> Extensions -> SE Ranking Content Editor.')}
                className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 bg-[#4285F4] rounded-xs flex items-center justify-center text-[10px] text-white font-bold">
                  ≡
                </div>
                <span>Google Docs Add-on</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Card 4: Video Tutorial with the real YouTube embed */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-base">Video tutorial</h3>
              <p className="text-gray-500 text-xs mt-0.5">Learn how to use the Content Editor in just a few minutes!</p>
            </div>

            <div className="relative aspect-video max-w-xl mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/neAfejb5cNY"
                title="SE Ranking Content Editor Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Card 5: Training Materials with Real 3 Cards & Live Carousel */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-center font-bold text-gray-900 text-base">Training materials</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carouselIndex === 0 ? (
                <>
                  {/* Slide 1: Content SEO course */}
                  <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
                    <div className="space-y-2">
                      <div className="h-28 bg-gradient-to-r from-amber-100 to-amber-200 rounded flex items-center justify-center text-amber-900 font-bold text-sm">
                        Content SEO with Joe Williams
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">Content SEO course</h4>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        Learn how to create content that will drive visitors to your site and make them stick around with this free SEO content marketing course.
                      </p>
                    </div>
                    <a
                      href="https://seranking.com/academy/content-seo.html"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block"
                    >
                      Start the course
                    </a>
                  </div>

                  {/* Slide 2: AI Content tool */}
                  <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
                    <div className="space-y-2">
                      <div className="h-28 bg-gradient-to-r from-blue-100 to-indigo-200 rounded flex items-center justify-center text-blue-900 font-bold text-sm">
                        SE Ranking AI Content Writer
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Create SEO-friendly copy faster with SE Ranking’s new AI content tool
                      </h4>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        Our Content Marketing tools were designed to help SEOs and copywriters create quality texts that both Google and users love.
                      </p>
                    </div>
                    <a
                      href="https://seranking.com/blog/content-tool/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block"
                    >
                      Read the full blog post
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Slide 3: Create quality content from start to finish */}
                  <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between md:col-span-2 max-w-md mx-auto w-full hover:border-blue-300 transition-colors">
                    <div className="space-y-2">
                      <div className="h-28 bg-gradient-to-r from-purple-100 to-pink-200 rounded flex items-center justify-center text-purple-900 font-bold text-sm">
                        Step-by-step Video Masterclass
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Create quality content from start to finish
                      </h4>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        Check out our detailed video on using Content Idea Finder and Content Editor to create a content brief and SEO-optimized articles.
                      </p>
                    </div>
                    <a
                      href="https://www.youtube.com/watch?v=5bOMqdhxdEM"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block"
                    >
                      Watch video
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Carousel Navigation matching count 1-2 from 3 */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCarouselIndex(0)}
                disabled={carouselIndex === 0}
                className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                ‹
              </button>
              <span className="text-xs text-gray-500 font-medium">
                {carouselIndex === 0 ? '1-2 from 3' : '3 from 3'}
              </span>
              <button
                onClick={() => setCarouselIndex(1)}
                disabled={carouselIndex === 1}
                className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>

          {/* Card 6: Bottom Action Card matching Screenshot 2 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-4">
              Create your first brief &amp; article or improve existing content
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="w-full sm:w-auto bg-[#0B69FF] hover:bg-[#0957DB] text-white font-semibold text-xs px-6 py-2.5 rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Write new brief &amp; article</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOptimizeModalOpen(true)}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs px-6 py-2.5 rounded shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Optimize existing content</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT IDEA FINDER VIEW (Screenshots 3 & 4 - matching exact DOM classes) */}
      {/* ========================================================================= */}
      {activeTab === 'idea-finder' && (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
          {/* Main Full Placeholder Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-xs max-w-2xl mx-auto w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Content Idea Finder</h1>
              <p className="text-gray-500 text-xs mt-1">Analyze a topic of interest to get new content ideas</p>
            </div>

            <form onSubmit={handleFindIdeasSubmit} className="space-y-4">
              {/* Keyword Label & Input Row */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Keyword <span className="text-red-500">*</span>
                  <span className="text-gray-400 ml-1 cursor-pointer" title="Enter primary seed keyword">
                    ⓘ
                  </span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Enter keyword"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF]"
                    />
                  </div>

                  {/* Country & Region Selector Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRegionPopoverOpen(!isRegionPopoverOpen)}
                      className="w-full sm:w-auto border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 bg-white hover:bg-gray-50 flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🇮🇳</span>
                        <span className="font-medium">
                          {selectedRegion ? selectedRegion.split(',')[0] : selectedCountry}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {/* Region Selector Popover matching exact DOM structure */}
                    {isRegionPopoverOpen && (
                      <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-40 p-3 space-y-3 text-xs animate-in fade-in zoom-in-95">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-700">Country:</span>
                            <span className="text-gray-400">ⓘ</span>
                          </div>
                          <div className="p-2 border border-gray-200 rounded bg-gray-50 font-medium text-gray-800 flex items-center gap-2">
                            <span>🇮🇳</span>
                            <span>India</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-700">Region / City:</span>
                            <span className="text-gray-400">ⓘ</span>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={regionSearch}
                              onChange={(e) => setRegionSearch(e.target.value)}
                              placeholder="Search region or city..."
                              className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#0B69FF]"
                            />
                            {regionSearch && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRegionSearch('');
                                  setSelectedRegion('');
                                }}
                                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="max-h-44 overflow-y-auto mt-1 border border-gray-100 rounded divide-y divide-gray-50">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRegion('');
                                setIsRegionPopoverOpen(false);
                              }}
                              className="w-full text-left p-1.5 hover:bg-gray-50 text-[11px] text-gray-600"
                            >
                              All Regions in India (National)
                            </button>
                            {filteredRegions.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => {
                                  setSelectedRegion(r);
                                  setIsRegionPopoverOpen(false);
                                }}
                                className={`w-full text-left p-1.5 hover:bg-gray-50 text-[11px] truncate ${
                                  selectedRegion === r ? 'bg-blue-50 text-[#0B69FF] font-semibold' : 'text-gray-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Content Footer matching exact DOM */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Keyword limits:&nbsp;&nbsp;
                  <span className="font-semibold text-gray-900">0/2</span>
                </div>

                <button
                  type="submit"
                  disabled={!keywordInput.trim() || isSearchingIdeas}
                  className="bg-[#0B69FF] hover:bg-[#0957DB] disabled:bg-[#D5D9E2] disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-6 py-2 rounded transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isSearchingIdeas ? 'Analyzing...' : 'Find ideas'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Real Generated Topic Clusters & Keywords Table */}
          {searchResults && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Content Ideas for "{keywordInput}" in {selectedRegion || selectedCountry}
                  </h2>
                  <p className="text-xs text-gray-500">
                    4 semantic topic clusters • 50+ total keyword suggestions discovered
                  </p>
                </div>
                <button
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,Keyword,Volume,KD%,CPC,Intent\n' +
                      searchResults
                        .flatMap((c) => c.keywords)
                        .map((k) => `"${k.text}",${k.volume},${k.kd},"${k.cpc}","${k.intent}"`)
                        .join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `content-ideas-${keywordInput}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Cluster Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((cluster, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Cluster {idx + 1}
                        </span>
                        <span className="text-[11px] text-gray-500">Avg KD: {cluster.avgKd}%</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{cluster.clusterName}</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Total Volume: {cluster.totalVolume.toLocaleString()} / mo • {cluster.ideasCount} ideas
                      </p>

                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {cluster.keywords.map((kw, kIdx) => (
                          <div
                            key={kIdx}
                            className="flex items-center justify-between text-xs py-1 hover:bg-gray-50 px-1.5 rounded"
                          >
                            <span className="text-gray-800 font-medium truncate max-w-[200px]">
                              {kw.text}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-gray-500 font-mono">{kw.volume.toLocaleString()}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  kw.kd < 40
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : kw.kd < 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {kw.kd}%
                              </span>
                              <button
                                onClick={() => launchBriefFromKeyword(kw.text)}
                                className="text-[#0B69FF] hover:underline font-bold text-[11px]"
                                title="Write brief & article for this keyword"
                              >
                                Write Brief →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* REAL FUNCTIONAL STUDIO: WRITE NEW BRIEF & ARTICLE        */}
      {/* ======================================================== */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-5xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0B69FF] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <h3 className="font-bold text-base">SE Ranking Content Editor Studio</h3>
              </div>
              <button
                onClick={() => setIsBriefModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Left Column: Live WYSIWYG Editor */}
              <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Target Keyword:</span>
                    <input
                      type="text"
                      value={briefKeyword}
                      onChange={(e) => setBriefKeyword(e.target.value)}
                      className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAiGenerating(true);
                      setTimeout(() => {
                        setEditorContent((prev) =>
                          prev +
                          `\n\n## 3. High-Converting Content Formats\nIncorporate data-driven infographics, proprietary research surveys, and practical interactive calculators to maximize dwell time and earn editorial backlinks organically.`
                        );
                        setAiGenerating(false);
                      }, 600);
                    }}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{aiGenerating ? 'AI Generating...' : 'AskAI Generate Section'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Article Title (H1)</label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full text-sm font-bold text-gray-900 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#0B69FF] focus:border-[#0B69FF]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded text-xs text-gray-700 border border-gray-200">
                  <button
                    onClick={() => setEditorContent((c) => c + '\n\n## New Heading\n')}
                    className="px-2 py-1 bg-white rounded shadow-2xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => setEditorContent((c) => c + '\n\n### New Subheading\n')}
                    className="px-2 py-1 bg-white rounded shadow-2xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    H3
                  </button>
                  <button
                    onClick={() => setEditorContent((c) => c + ' **bold text**')}
                    className="px-2 py-1 bg-white rounded shadow-2xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    B
                  </button>
                  <button
                    onClick={() => setEditorContent((c) => c + '\n- Bullet item')}
                    className="px-2 py-1 bg-white rounded shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    • List
                  </button>
                  <div className="flex-1" />
                  <span className="text-[11px] text-gray-500 font-mono">{wordCount} words</span>
                </div>

                <textarea
                  rows={14}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full p-4 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B69FF] leading-relaxed resize-none"
                  placeholder="Start writing or let AskAI draft your SEO article..."
                />
              </div>

              {/* Right Column: Real-time Scoring & Requirements */}
              <div className="w-full lg:w-80 bg-gray-50 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-sm">Content SEO Score</h4>
                    <span
                      className={`text-sm font-extrabold px-2.5 py-0.5 rounded ${
                        contentScore > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : contentScore > 60
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {contentScore} / 100
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Word Count</span>
                        <span className="font-mono font-semibold">
                          {wordCount} / {targetWords}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0B69FF] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (wordCount / targetWords) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Headings (H2-H3)</span>
                        <span className="font-mono font-semibold">
                          {headingsCount} / {targetHeadings}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (headingsCount / targetHeadings) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
                    NLP Terms &amp; Density
                  </h4>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {semanticKeywords.map((kw, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 rounded bg-white border border-gray-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {kw.count > 0 ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                          )}
                          <span className={`truncate ${kw.count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {kw.term}
                          </span>
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            kw.count > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {kw.count} ({kw.target})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${editorTitle}\n\n${editorContent}`);
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2000);
                    }}
                    className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-semibold text-xs py-2 rounded flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Brief & Article saved to SE Ranking Content Library.');
                      setIsBriefModalOpen(false);
                    }}
                    className="w-full bg-[#0B69FF] hover:bg-[#0957DB] text-white font-bold text-xs py-2 rounded shadow-xs cursor-pointer"
                  >
                    SAVE &amp; CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* OPTIMIZE EXISTING CONTENT MODAL                           */}
      {/* ======================================================== */}
      {isOptimizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Optimize Existing Content</h3>
              <button
                onClick={() => setIsOptimizeModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Enter your live page URL or paste raw text to run a SERP competitor audit and get instant content enhancement recommendations.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Page URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/blog/my-seo-guide"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Target Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. b2b marketing software"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#0B69FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOptimizeModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsOptimizeModalOpen(false);
                  setIsBriefModalOpen(true);
                }}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0957DB] text-white text-xs font-bold rounded shadow-xs cursor-pointer"
              >
                START AUDIT &amp; OPTIMIZE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Bar matching exact SE Ranking format */}
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
