'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Folder,
  Calendar,
  MessageSquare,
  BarChart3,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Users,
  Clock,
  Send,
  Sliders,
} from 'lucide-react';

export default function SmmPage() {
  // Tabs for "Perfect for agencies and brands that love teamwork"
  const [activeTab, setActiveTab] = useState(0);

  // Testimonials Carousel: page 0 (1-2) or page 1 (3-4)
  const [testimonialPage, setTestimonialPage] = useState(0);

  // Add brand modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'Facebook',
    'Instagram',
    'LinkedIn',
  ]);
  const [isSuccess, setIsSuccess] = useState(false);

  // 9 Platforms list with precise official SVG icons
  const platforms = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
            <stop stopColor="#fdf497" offset="0%" />
            <stop stopColor="#fdf497" offset="5%" />
            <stop stopColor="#fd5949" offset="45%" />
            <stop stopColor="#d6249f" offset="60%" />
            <stop stopColor="#285AEB" offset="90%" />
          </radialGradient>
          <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
          <path
            fill="#ffffff"
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#FF0000"
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          />
          <path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#010101">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.86-4.47V8.78a8.18 8.18 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.21z" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#BD081C">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.02-.97-.03-2.14.21-3.18.26-1.1 1.69-7.15 1.69-7.15s-.43-.86-.43-2.14c0-2 1.16-3.5 2.61-3.5 1.23 0 1.83.92 1.83 2.03 0 1.24-.79 3.09-1.2 4.8-.34 1.44.72 2.61 2.14 2.61 2.57 0 4.29-3.29 4.29-7.19 0-2.96-2-5.17-5.61-5.17-4.08 0-6.63 3.04-6.63 6.44 0 1.17.43 2.01 1.1 2.8.1.13.12.24.08.38-.08.33-.27 1.1-.31 1.26-.05.21-.21.28-.39.2-1.74-.71-2.55-2.61-2.55-4.73 0-3.52 2.97-7.72 8.8-7.72 4.7 0 7.79 3.4 7.79 7.07 0 4.83-2.69 8.44-6.64 8.44-1.33 0-2.58-.72-3.01-1.54l-.82 3.16c-.3 1.13-.9 2.27-1.45 3.14A11.99 11.99 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
        </svg>
      ),
    },
    {
      name: 'Threads',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#101010">
          <path d="M12.186 24C5.503 24 0 18.638 0 12.008 0 5.377 5.503.016 12.186.016c6.682 0 12.185 5.361 12.185 11.992 0 .61-.05 1.209-.148 1.792-.375 2.215-1.517 4.195-3.216 5.578-1.59 1.294-3.58 1.983-5.748 1.983-2.956 0-5.467-1.378-6.716-3.687-.492-.907-.74-1.936-.74-3.064 0-3.695 2.825-6.697 6.446-6.697 3.328 0 5.617 2.457 5.765 5.524h-2.18c-.123-1.89-1.558-3.344-3.585-3.344-2.39 0-4.266 2.016-4.266 4.517 0 .77.164 1.474.475 2.048.82 1.516 2.458 2.417 4.39 2.417 1.558 0 2.99-.492 4.13-1.425 1.229-1 2.05-2.425 2.31-4.032.067-.409.099-.835.099-1.261 0-5.416-4.522-9.817-10.08-9.817-5.558 0-10.08 4.4-10.08 9.817 0 5.416 4.522 9.817 10.08 9.817 2.376 0 4.606-.82 6.375-2.295l1.377 1.705C17.387 23.017 14.86 24 12.186 24z" />
        </svg>
      ),
    },
    {
      name: 'Google Business Profile',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      ),
    },
  ];

  // Feature tabs items matching HTML
  const featureTabs = [
    {
      title: 'Manage multiple brands or clients in dedicated workspaces',
      desc: 'Create separate workspaces for each brand, invite team members and clients with specific roles, and prevent accidental cross-posting.',
      mockupType: 'workspaces',
    },
    {
      title: 'Plan, approve, and schedule content in a drag-and-drop calendar',
      desc: 'Visualize your entire monthly social schedule in a clean calendar grid. Move posts between days effortlessly with seamless drag-and-drop.',
      mockupType: 'calendar',
    },
    {
      title: 'Collaborate effortlessly with real-time comments & suggestions',
      desc: 'Leave inline comments on drafts, tag team members, request changes, and get one-click approvals from clients before publication.',
      mockupType: 'collaboration',
    },
    {
      title: 'Reply to comments and check your analytics — all in one place',
      desc: 'Manage all inbound messages and comments across 9 networks in one unified social inbox and track performance growth metrics.',
      mockupType: 'analytics',
    },
  ];

  // 4 real testimonials matching user HTML & screenshot
  const testimonials = [
    {
      name: 'James Bishop',
      profession: 'Founder of OneFinePlay',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      initials: 'JB',
      avatarColor: 'bg-emerald-600',
      title: 'The ultimate social media scheduling app for creatives',
      text: "Planable is hands down the best social media scheduler I've tried. As a creative, its tagging & approvals features are game-changers. Organizing content and collaborating with my team has never been easier for maximizing efficiency and creativity! We actually get stuff posted rather than not posting at all!",
    },
    {
      name: 'Waseem Satardien',
      profession: 'Founder of DTL Studios',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      initials: 'WS',
      avatarColor: 'bg-indigo-600',
      title: 'My clients love it',
      text: 'The cost is far outweighed by the ease of use and functionality that it brings to both company users and clients. Choose Planable for client flexibility and user account flexibility. Easy overview for all parties involved. Clients loved the workspace.',
    },
    {
      name: 'Teryl Brouillette',
      profession: 'Founder of Electric Kite Media',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      initials: 'TB',
      avatarColor: 'bg-amber-600',
      title: 'The easiest tool I have found for approval workflows',
      text: "Planable is the easiest tool I have found for uploading content with a simple approval workflow that makes it easy to go from draft to published, with client's approval. It is cutting down the time required to go from drafted posts, through the necessary approvals and getting things published.",
    },
    {
      name: 'Yan Pierre le Luyer',
      profession: 'Founder of Legrow.studio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      initials: 'YP',
      avatarColor: 'bg-rose-600',
      title: 'Planable is visual, powerful and elegant!',
      text: 'I have long looked for an application to manage my social posts, which is both powerful and elegant in its interface. But above one which offers me a calendar compatible with my visual mind, with image thumbnails of my future publications. Planable is that app, and I love it!',
    },
  ];

  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setNewBrandName('');
    }, 1400);
  };

  const togglePlatform = (pName: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(pName) ? prev.filter((x) => x !== pName) : [...prev, pName]
    );
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 py-8 px-4 sm:px-6 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* CARD 1: Hero Section (Planable by SE Ranking) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-xs">
          {/* Logo Pinwheel Prism (SVG representation of Planable's colorful icon) */}
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-11 h-11" viewBox="0 0 44 44" fill="none">
                {/* 3 colorful petals */}
                <path
                  d="M22 6C22 6 29 14 26 21C23 28 15 26 15 26C15 26 14 17 18 10C20 6.5 22 6 22 6Z"
                  fill="#00D2D2"
                  opacity="0.95"
                />
                <path
                  d="M36 21C36 21 28 26 21 23C14 20 16 12 16 12C16 12 25 11 32 15C35.5 17 36 21 36 21Z"
                  fill="#7E57C2"
                  opacity="0.95"
                />
                <path
                  d="M24 37C24 37 17 31 19 23C21 15 29 16 29 16C29 16 31 25 28 32C26.5 35.5 24 37 24 37Z"
                  fill="#FF7043"
                  opacity="0.95"
                />
                <circle cx="22" cy="21" r="3" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
            Grow your social media with Planable by&nbsp;SE&nbsp;Ranking
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-gray-600 mt-2 font-normal">
            Get <strong className="font-bold text-gray-900">20% off Planable</strong> for the
            first 12 months, available on all plans
          </p>

          {/* Action CTA Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0055D6] text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer group"
            >
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              <span>Start Planning</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* CARD 2: 9 Social Media Platforms */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-center text-sm sm:text-base font-bold text-gray-900 mb-6">
            Schedule and publish your content on 9 platforms
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 max-w-3xl mx-auto">
            {platforms.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors py-1 px-1.5 cursor-default"
              >
                <div className="shrink-0 flex items-center justify-center">{p.icon}</div>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: Feature Tabs & Visual Mockups */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-center text-lg sm:text-xl font-bold text-gray-900 mb-8">
            Perfect for agencies and brands that love teamwork
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Tabs List */}
            <div className="lg:col-span-6 space-y-2">
              {featureTabs.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-50/60 border-l-4 border-l-[#0B69FF] border-blue-200 shadow-2xs'
                        : 'border-transparent hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                        isActive ? 'text-gray-950 font-bold' : 'text-gray-700'
                      }`}
                    >
                      {tab.title}
                    </div>
                    {isActive && (
                      <p className="text-xs text-gray-500 mt-2 leading-normal animate-in fade-in duration-200">
                        {tab.desc}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Mockup Graphic (Exact match to screenshot 1) */}
            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 rounded-2xl p-6 border border-orange-100/80 shadow-inner relative overflow-hidden min-h-[300px] flex items-center justify-center">
                {activeTab === 0 && (
                  /* Workspaces Graphic Matching Screenshot */
                  <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className="text-xs font-bold text-gray-900">Workspaces</span>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New Workspace +</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        { name: 'Juice Tokyo', color: 'bg-emerald-500', posts: 14 },
                        { name: 'Juice Sydney', color: 'bg-blue-500', posts: 8 },
                        { name: 'Juice Singapore', color: 'bg-purple-500', posts: 22 },
                        { name: 'Juice Osaka', color: 'bg-rose-500', posts: 6 },
                        { name: 'Juice Buenos Aires', color: 'bg-amber-500', posts: 19 },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-md ${item.color} text-white flex items-center justify-center text-[10px] font-bold`}
                            >
                              <Folder className="w-3 h-3 fill-current" />
                            </div>
                            <span className="text-xs font-semibold text-gray-800">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.posts} posts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  /* Calendar Mockup */
                  <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0B69FF]" />
                        <span>September 2026 Schedule</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Weekly View</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Wed 24', 'Thu 25', 'Fri 26'].map((d, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-200/70">
                          <div className="text-[10px] font-bold text-gray-500 mb-1.5">{d}</div>
                          <div className="bg-white p-1.5 rounded border border-blue-200 shadow-2xs space-y-1">
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 rounded block">
                              Instagram
                            </span>
                            <p className="text-[10px] text-gray-800 font-medium truncate">
                              New Product Drop 🚀
                            </p>
                            <span className="text-[8px] text-emerald-600 font-bold">Approved</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  /* Collaboration Mockup */
                  <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span>Live Feedback & Approvals</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                        1 Pending Approval
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                          JB
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-[11px]">
                            James Bishop <span className="text-gray-400 font-normal">2m ago</span>
                          </div>
                          <p className="text-gray-600 text-[11px] mt-0.5">
                            Could we change the CTA on slide 3 to &apos;Explore now&apos;?
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-colors">
                          Approve Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  /* Analytics Mockup */
                  <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Omnichannel Analytics</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">+34.8% MoM</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 block">Total Reach</span>
                        <span className="text-base font-black text-gray-900">482,910</span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <span className="text-xs text-gray-500 block">Engagement Rate</span>
                        <span className="text-base font-black text-[#0B69FF]">4.82%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Interactive Arcade Demo Video / Iframe (Exact match to provided HTML) */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Mac/Browser Style Top Bar */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              <span className="ml-2 font-medium text-gray-700 text-[11px] hidden sm:inline">
                Planable interactive demo for SE Ranking
              </span>
            </div>
            <a
              href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
              target="_blank"
              rel="noreferrer"
              className="text-[#0B69FF] hover:underline flex items-center gap-1 text-[11px] font-semibold"
            >
              <span>Full screen demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Interactive Arcade Demo Iframe */}
          <div className="relative w-full aspect-video bg-gray-900 flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
            <iframe
              className="w-full h-full border-0"
              src="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
              loading="lazy"
              allowFullScreen
              allow="clipboard-write"
              title="Planable Interactive Demo"
            />
          </div>
        </div>

        {/* CARD 5: Testimonials Carousel (Matching Screenshot 1 & HTML) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials
              .slice(testimonialPage * 2, testimonialPage * 2 + 2)
              .map((t, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all"
                >
                  <div className="space-y-3">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${t.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-xs sm:text-sm">{t.name}</div>
                        <div className="text-[11px] text-gray-500">{t.profession}</div>
                      </div>
                    </div>

                    {/* Testimonial Title */}
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                      {t.title}
                    </h3>

                    {/* Testimonial Quote */}
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">{t.text}</p>
                  </div>
                </div>
              ))}
          </div>

          {/* Carousel Navigation (< 1-2 from 4 >) */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setTestimonialPage(0)}
              disabled={testimonialPage === 0}
              className={`p-1.5 rounded-lg border border-gray-200 transition-colors ${
                testimonialPage === 0
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-700 cursor-pointer'
              }`}
              title="Previous testimonials"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-gray-500">
              {testimonialPage === 0 ? '1-2 from 4' : '3-4 from 4'}
            </span>

            <button
              onClick={() => setTestimonialPage(1)}
              disabled={testimonialPage === 1}
              className={`p-1.5 rounded-lg border border-gray-200 transition-colors ${
                testimonialPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-700 cursor-pointer'
              }`}
              title="Next testimonials"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 6: Bottom Action Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 text-center shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Start planning and get 20% off
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
            to any pricing plan for the first year
          </p>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0055D6] text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer group"
            >
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              <span>Add first brand</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Bottom Footer bar matching SE Ranking */}
        <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <div className="w-4 h-4 rounded bg-[#0B69FF] flex items-center justify-center text-white text-[9px] font-black">
              SE
            </div>
            <span>SE Ranking</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => alert('Report a bug modal opened')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Report a bug
            </button>
            <Link href="/landing" className="hover:text-blue-600 transition-colors">
              Affiliates
            </Link>
            <Link href="/api-docs" className="hover:text-blue-600 transition-colors">
              API
            </Link>
            <button
              onClick={() => alert("What's new updates: SMM Planable 20% off promo now live!")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              What&apos;s new
            </button>
            <button
              onClick={() => alert('SE Ranking Help & Knowledge Center')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Help
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add First Brand / Start Planning */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Brand Connected!</h3>
                <p className="text-xs text-gray-600">
                  Redirecting to your Planable workspace with 20% discount applied...
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddBrandSubmit} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center font-bold text-sm">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Add First Brand to Planable</h3>
                    <p className="text-xs text-gray-500">20% exclusive discount will be applied</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Brand or Client Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="e.g. Acme Marketing, Nike Campaign"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Social Channels to Connect
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {platforms.map((p) => {
                      const isSel = selectedPlatforms.includes(p.name);
                      return (
                        <button
                          type="button"
                          key={p.name}
                          onClick={() => togglePlatform(p.name)}
                          className={`p-2 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#0B69FF] bg-blue-50/70 text-blue-900 font-bold'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="shrink-0 scale-75">{p.icon}</div>
                          <span className="truncate">{p.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Promo code <b>SERANKING20</b> will automatically activate 20% off.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0055D6] text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Start Planning
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
