'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SmmPage() {
  // Tabs for "Perfect for agencies and brands that love teamwork"
  const [activeTab, setActiveTab] = useState(0);

  // Testimonials Carousel: 0 -> cards 1-2, 1 -> cards 3-4
  const [testimonialPage, setTestimonialPage] = useState(0);

  // Dropdown states for "Start Planning" and "Add first brand"
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false);
  const [isBottomDropdownOpen, setIsBottomDropdownOpen] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'Facebook',
    'Instagram',
    'LinkedIn',
  ]);
  const [isSuccess, setIsSuccess] = useState(false);

  // 9 Platforms list with precise SVG icons
  const platforms = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <radialGradient id="smm-ig" r="150%" cx="30%" cy="107%">
            <stop stopColor="#fdf497" offset="0%" />
            <stop stopColor="#fdf497" offset="5%" />
            <stop stopColor="#fd5949" offset="45%" />
            <stop stopColor="#d6249f" offset="60%" />
            <stop stopColor="#285AEB" offset="90%" />
          </radialGradient>
          <rect width="24" height="24" rx="6" fill="url(#smm-ig)" />
          <path
            fill="#ffffff"
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0F1419">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.86-4.47V8.78a8.18 8.18 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.21z" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#BD081C">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.02-.97-.03-2.14.21-3.18.26-1.1 1.69-7.15 1.69-7.15s-.43-.86-.43-2.14c0-2 1.16-3.5 2.61-3.5 1.23 0 1.83.92 1.83 2.03 0 1.24-.79 3.09-1.2 4.8-.34 1.44.72 2.61 2.14 2.61 2.57 0 4.29-3.29 4.29-7.19 0-2.96-2-5.17-5.61-5.17-4.08 0-6.63 3.04-6.63 6.44 0 1.17.43 2.01 1.1 2.8.1.13.12.24.08.38-.08.33-.27 1.1-.31 1.26-.05.21-.21.28-.39.2-1.74-.71-2.55-2.61-2.55-4.73 0-3.52 2.97-7.72 8.8-7.72 4.7 0 7.79 3.4 7.79 7.07 0 4.83-2.69 8.44-6.64 8.44-1.33 0-2.58-.72-3.01-1.54l-.82 3.16c-.3 1.13-.9 2.27-1.45 3.14A11.99 11.99 0 0 0 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
        </svg>
      ),
    },
    {
      name: 'Threads',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
          <path d="M12.186 24C5.503 24 0 18.638 0 12.008 0 5.377 5.503.016 12.186.016c6.682 0 12.185 5.361 12.185 11.992 0 .61-.05 1.209-.148 1.792-.375 2.215-1.517 4.195-3.216 5.578-1.59 1.294-3.58 1.983-5.748 1.983-2.956 0-5.467-1.378-6.716-3.687-.492-.907-.74-1.936-.74-3.064 0-3.695 2.825-6.697 6.446-6.697 3.328 0 5.617 2.457 5.765 5.524h-2.18c-.123-1.89-1.558-3.344-3.585-3.344-2.39 0-4.266 2.016-4.266 4.517 0 .77.164 1.474.475 2.048.82 1.516 2.458 2.417 4.39 2.417 1.558 0 2.99-.492 4.13-1.425 1.229-1 2.05-2.425 2.31-4.032.067-.409.099-.835.099-1.261 0-5.416-4.522-9.817-10.08-9.817-5.558 0-10.08 4.4-10.08 9.817 0 5.416 4.522 9.817 10.08 9.817 2.376 0 4.606-.82 6.375-2.295l1.377 1.705C17.387 23.017 14.86 24 12.186 24z" />
        </svg>
      ),
    },
    {
      name: 'Google Business Profile',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
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

  // 4 Feature tabs matching exact user HTML
  const featureTabs = [
    {
      desc: 'Manage multiple brands or clients in dedicated workspaces',
    },
    {
      desc: 'Plan, approve, and schedule content in a drag-and-drop calendar',
    },
    {
      desc: 'Collaborate effortlessly with real-time comments & suggestions',
    },
    {
      desc: 'Reply to comments and check your analytics — all in one place',
    },
  ];

  // 4 real testimonials from the exact HTML
  const testimonials = [
    {
      name: 'James Bishop',
      profession: 'Founder of OneFinePlay',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      initials: 'JB',
      avatarBg: 'bg-emerald-600',
      title: 'The ultimate social media scheduling app for creatives',
      text: "Planable is hands down the best social media scheduler I've tried. As a creative, its tagging & approvals features are game-changers. Organizing content and collaborating with my team has never been easier for maximizing efficiency and creativity! We actually get stuff posted rather than not posting at all!",
    },
    {
      name: 'Waseem Satardien',
      profession: 'Founder of DTL Studios',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      initials: 'WS',
      avatarBg: 'bg-indigo-600',
      title: 'My clients love it',
      text: 'The cost is far outweighed by the ease of use and functionality that it brings to both company users and clients. Choose Planable for client flexibility and user account flexibility. Easy overview for all parties involved. Clients loved the workspace.',
    },
    {
      name: 'Teryl Brouillette',
      profession: 'Founder of Electric Kite Media',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      initials: 'TB',
      avatarBg: 'bg-amber-600',
      title: 'The easiest tool I have found for approval workflows',
      text: "Planable is the easiest tool I have found for uploading content with a simple approval workflow that makes it easy to go from draft to published, with client's approval. It is cutting down the time required to go from drafted posts, through the necessary approvals and getting things published.",
    },
    {
      name: 'Yan Pierre le Luyer',
      profession: 'Founder of Legrow.studio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      initials: 'YP',
      avatarBg: 'bg-rose-600',
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
    <div className="section-wrapper__content w-full min-h-screen bg-[#F4F6F9] py-8 px-4 sm:px-6">
      <div className="introduction-section introduction-landing max-w-4xl mx-auto space-y-6">

        {/* ===================== ITEM 1: HERO ACTION BOX ===================== */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-8 sm:p-10 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-action flex flex-col items-center text-center">
              
              {/* Planable Logo */}
              <div className="content-col introduction-section-box__logo-wrapper mb-5 flex items-center justify-center">
                <div className="flex items-center gap-2.5">
                  {/* Planable colorful pinwheel icon */}
                  <div className="w-10 h-10 relative flex items-center justify-center">
                    <svg className="w-10 h-10" viewBox="0 0 44 44" fill="none">
                      <path
                        d="M22 6C22 6 29 14 26 21C23 28 15 26 15 26C15 26 14 17 18 10C20 6.5 22 6 22 6Z"
                        fill="#00D2D2"
                      />
                      <path
                        d="M36 21C36 21 28 26 21 23C14 20 16 12 16 12C16 12 25 11 32 15C35.5 17 36 21 36 21Z"
                        fill="#7E57C2"
                      />
                      <path
                        d="M24 37C24 37 17 31 19 23C21 15 29 16 29 16C29 16 31 25 28 32C26.5 35.5 24 37 24 37Z"
                        fill="#FF7043"
                      />
                      <circle cx="22" cy="21" r="3.2" fill="#ffffff" />
                    </svg>
                  </div>
                  <span className="text-2xl font-black tracking-tight text-[#171A1F]">planable</span>
                </div>
              </div>

              {/* Head: Title & Description */}
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head max-w-xl">
                <div className="content-col introduction-section-box__title">
                  <h1 className="text-2xl sm:text-[28px] font-bold text-[#171A1F] leading-snug tracking-tight">
                    Grow your social media with Planable by&nbsp;SE&nbsp;Ranking
                  </h1>
                </div>
                <div className="content-col introduction-section-box__description mt-2">
                  <p className="text-sm text-[#5B6370]">
                    Get <strong className="font-bold text-[#171A1F]">20% off Planable</strong> for the first 12 months, available on all plans
                  </p>
                </div>
              </div>

              {/* Main: Buttons */}
              <div className="content-row content-row_center introduction-section-box__main mt-6 relative">
                <div className="content-layout introduction-section-action__buttons">
                  <div className="content-row content-row_center flex items-center justify-center">
                    <div className="content-col content-col_half relative">
                      <button
                        onClick={() => setIsHeroDropdownOpen(!isHeroDropdownOpen)}
                        className="se-button_icon se-button-2_size-l se-button-2 se-button-2_color-blue inline-flex items-center gap-2.5 px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-semibold text-sm rounded-[8px] shadow-sm transition-all cursor-pointer select-none"
                      >
                        <span className="se-button-2__wrapper flex items-center gap-2">
                          <span className="se-material-icon-2 se-button-2__icon notranslate inline-flex items-center">
                            {/* Material open_in_new icon */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                          </span>
                          <span className="se-button-2__text">Start Planning</span>
                          <span className="se-button-2__arrow inline-flex items-center">
                            {/* Material keyboard_arrow_down icon */}
                            <svg className={`w-4 h-4 transition-transform ${isHeroDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                            </svg>
                          </span>
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      {isHeroDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-[#E1E6EB] rounded-[10px] shadow-lg py-1.5 z-30 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => {
                              setIsHeroDropdownOpen(false);
                              setIsModalOpen(true);
                            }}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#171A1F] font-semibold flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Add Brand to Planable</span>
                            <span className="text-[10px] font-bold text-[#2870ED] bg-blue-50 px-1.5 py-0.5 rounded">20% OFF</span>
                          </button>
                          <a
                            href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setIsHeroDropdownOpen(false)}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#5B6370] hover:text-[#171A1F] flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Open Interactive Tour</span>
                            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ITEM 2: 9 SOCIAL PLATFORMS LIST ===================== */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-6 sm:p-8 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-custom text-center">
              
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head mb-6">
                <div className="content-col introduction-section-box__subtitle text-base sm:text-lg font-bold text-[#171A1F]">
                  Schedule and publish your content on 9 platforms
                </div>
                <div className="content-col introduction-section-box__description">
                  <span></span>
                </div>
              </div>

              <div className="content-row content-row_center introduction-section-box__main">
                <div className="content-row content-row_center introduction-landing__social-list flex flex-wrap items-center justify-center gap-x-6 gap-y-4 max-w-3xl mx-auto">
                  {platforms.map((platform) => (
                    <div
                      key={platform.name}
                      className="content-col content-col_auto introduction-landing__social-list-item flex items-center gap-2 text-xs sm:text-sm font-medium text-[#323842] hover:text-[#171A1F] transition-colors py-1 cursor-default"
                    >
                      <span className="se-icon-2 flex items-center justify-center shrink-0">
                        {platform.icon}
                      </span>
                      <span>{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ITEM 3: TABS & SLIDER VISUALS ===================== */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-6 sm:p-8 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="landing-section-image-tabs">
              <div className="landing-sections-box">
                
                <div className="landing-sections-box__head mb-6 text-center">
                  <div className="landing-sections-box__title text-lg sm:text-xl font-bold text-[#171A1F]">
                    Perfect for agencies and brands that love teamwork
                  </div>
                  <div className="landing-sections-box__description"></div>
                </div>

                <div className="landing-sections-box__main">
                  <div className="slider-images grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Tabs List (Left Column) */}
                    <div className="slider-images__tabs lg:col-span-6 space-y-2">
                      {featureTabs.map((tab, idx) => {
                        const isActive = activeTab === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`slider-images__item p-4 rounded-[12px] transition-all cursor-pointer border select-none ${
                              isActive
                                ? 'slider-images__item-active bg-[#F2F7FF] border-[#2870ED] shadow-xs'
                                : 'border-[#E1E6EB] hover:bg-[#F8FAFC] text-[#5B6370]'
                            }`}
                          >
                            <div className="slider-images__tab-title"></div>
                            <div
                              className={`slider-images__tab-desc text-xs sm:text-sm leading-relaxed ${
                                isActive ? 'text-[#171A1F] font-bold' : 'text-[#323842] font-medium'
                              }`}
                            >
                              {tab.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Visual Mockups (Right Column) */}
                    <div className="slider-images__image lg:col-span-6">
                      <div className="slider-images__img rounded-[14px] bg-gradient-to-br from-[#FFF5F2] via-[#FFF9F6] to-[#FFF0EB] border border-[#FBE6E0] p-5 sm:p-6 shadow-inner min-h-[320px] flex items-center justify-center relative overflow-hidden">
                        
                        {/* Tab 0: Multi-Brand Workspaces */}
                        {activeTab === 0 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-md border border-[#E1E6EB] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2.5">
                              <span className="text-xs font-bold text-[#171A1F]">Workspaces</span>
                              <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-2.5 py-1 bg-[#FF6F3D] hover:bg-[#E85D2D] text-white rounded-[6px] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <span>+</span>
                                <span>New Workspace</span>
                              </button>
                            </div>
                            <div className="space-y-2">
                              {[
                                { name: 'Juice Tokyo', color: 'bg-emerald-500', posts: 14 },
                                { name: 'Juice Sydney', color: 'bg-blue-500', posts: 8 },
                                { name: 'Juice Singapore', color: 'bg-purple-500', posts: 22 },
                                { name: 'Juice Osaka', color: 'bg-rose-500', posts: 6 },
                                { name: 'Juice Buenos Aires', color: 'bg-amber-500', posts: 19 },
                              ].map((ws, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-2 rounded-[8px] hover:bg-[#F8FAFC] border border-[#F0F2F5] transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-5 h-5 rounded-[5px] ${ws.color} text-white flex items-center justify-center text-[10px] font-bold`}>
                                      📁
                                    </div>
                                    <span className="text-xs font-semibold text-[#171A1F]">{ws.name}</span>
                                  </div>
                                  <span className="text-[10px] font-medium text-[#7A8391] bg-[#F2F5F8] px-2 py-0.5 rounded-full">
                                    {ws.posts} posts
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tab 1: Drag-and-drop Calendar */}
                        {activeTab === 1 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-md border border-[#E1E6EB] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                              <span className="text-xs font-bold text-[#171A1F] flex items-center gap-1.5">
                                📅 <span>Social Schedule</span>
                              </span>
                              <span className="text-[10px] font-semibold text-[#2870ED] bg-blue-50 px-2 py-0.5 rounded">Calendar View</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { day: 'Wed 24', channel: 'Instagram', title: 'Product Launch 🚀', status: 'Approved', statusBg: 'bg-emerald-50 text-emerald-700' },
                                { day: 'Thu 25', channel: 'LinkedIn', title: 'Q3 Growth Recap', status: 'In Review', statusBg: 'bg-amber-50 text-amber-700' },
                                { day: 'Fri 26', channel: 'TikTok', title: 'Behind the Scenes', status: 'Scheduled', statusBg: 'bg-blue-50 text-blue-700' },
                              ].map((post, i) => (
                                <div key={i} className="bg-[#F8FAFC] rounded-[8px] p-2 border border-[#E1E6EB]">
                                  <div className="text-[10px] font-bold text-[#7A8391] mb-1.5">{post.day}</div>
                                  <div className="bg-white p-2 rounded-[6px] border border-[#E1E6EB] shadow-2xs space-y-1">
                                    <span className="text-[9px] font-bold text-[#2870ED] bg-blue-50 px-1 rounded block truncate">
                                      {post.channel}
                                    </span>
                                    <p className="text-[10px] text-[#171A1F] font-semibold truncate">
                                      {post.title}
                                    </p>
                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded inline-block ${post.statusBg}`}>
                                      {post.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tab 2: Comments & Approvals */}
                        {activeTab === 2 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-md border border-[#E1E6EB] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                              <span className="text-xs font-bold text-[#171A1F] flex items-center gap-1.5">
                                💬 <span>Approval Workflow</span>
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                1 Pending
                              </span>
                            </div>
                            <div className="space-y-2.5 text-xs">
                              <div className="bg-[#F8FAFC] p-3 rounded-[8px] border border-[#E1E6EB] flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                  JB
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-[#171A1F] text-[11px] flex items-center justify-between">
                                    <span>James Bishop</span>
                                    <span className="text-[#7A8391] font-normal text-[10px]">2m ago</span>
                                  </div>
                                  <p className="text-[#5B6370] text-[11px] mt-1 leading-snug">
                                    Could we update the headline on slide 2 to highlight SE Ranking integration?
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <button className="px-3 py-1.5 bg-white border border-[#E1E6EB] text-[#323842] rounded-[6px] text-[11px] font-semibold hover:bg-gray-50">
                                  Request Edit
                                </button>
                                <button className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-[6px] text-[11px] font-bold shadow-2xs transition-colors">
                                  Approve Post ✓
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab 3: Unified Analytics */}
                        {activeTab === 3 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-md border border-[#E1E6EB] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                              <span className="text-xs font-bold text-[#171A1F] flex items-center gap-1.5">
                                📊 <span>Social Analytics</span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                +34.8% MoM
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-[#F8FAFC] p-2.5 rounded-[8px] border border-[#E1E6EB]">
                                <span className="text-[11px] text-[#7A8391] block">Total Impressions</span>
                                <span className="text-base font-black text-[#171A1F]">482,910</span>
                              </div>
                              <div className="bg-[#F8FAFC] p-2.5 rounded-[8px] border border-[#E1E6EB]">
                                <span className="text-[11px] text-[#7A8391] block">Avg Engagement</span>
                                <span className="text-base font-black text-[#2870ED]">4.82%</span>
                              </div>
                            </div>
                            <div className="bg-blue-50/60 p-2.5 rounded-[8px] border border-blue-100 flex items-center justify-between text-[11px]">
                              <span className="text-blue-900 font-semibold">Inbox Response Rate</span>
                              <span className="font-bold text-blue-700">98.4% (under 5m)</span>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-sections-box__footer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ITEM 4: ARCADE INTERACTIVE DEMO IFRAME ===================== */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] overflow-hidden shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="introduction-section-demo relative">
              
              {/* Browser Header Bar */}
              <div className="bg-[#F8FAFC] border-b border-[#E1E6EB] px-4 py-2.5 flex items-center justify-between text-xs text-[#5B6370]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span>
                  <span className="ml-2 font-medium text-[#323842] text-[11px]">
                    Planable interactive tour
                  </span>
                </div>
                <a
                  href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2870ED] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>Open in full tab</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                  </svg>
                </a>
              </div>

              {/* Exact Arcade Software Iframe Embed */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[420px] bg-gray-900">
                <iframe
                  className="introduction-section-demo__iframe w-full h-full border-0"
                  src="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                  loading="lazy"
                  allowFullScreen
                  allow="clipboard-write"
                  title="Planable Interactive Demo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ITEM 5: TESTIMONIALS CAROUSEL ===================== */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-6 sm:p-8 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-carousel">
              
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head">
                <div className="content-col introduction-section-box__description">
                  <span></span>
                </div>
              </div>

              <div className="content-row content-row_center introduction-section-box__main">
                <div className="carousel-slide introduction-section-carousel__wrapper w-full">
                  <div className="carousel-slide__wrapper overflow-hidden">
                    <div className="carousel-slide__list">
                      
                      {/* Smooth Slides Container */}
                      <div
                        className="carousel-slide__slides flex transition-transform duration-300 ease-out"
                        style={{
                          transform: `translate3d(-${testimonialPage * 100}%, 0px, 0px)`,
                        }}
                      >
                        {/* Slide Page 1: Cards 1 & 2 */}
                        <div className="min-w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[testimonials[0], testimonials[1]].map((t, idx) => (
                            <div key={idx} className="content-col content-col_half testimonial-card flex-1">
                              <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-xl uix-bordered-layer_rad-m testimonial-card__wrapper bg-[#F8FAFC] border border-[#E1E6EB] rounded-[12px] p-5 h-full flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
                                <div className="content-row space-y-3">
                                  {/* Author info */}
                                  <div className="content-col testimonial-card__info-wrapper flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 border border-white shadow-xs shrink-0 flex items-center justify-center">
                                      <img
                                        className="testimonial-card__avatar w-full h-full object-cover"
                                        src={t.avatar}
                                        alt={t.name}
                                        onError={(e) => {
                                          // Fallback to initials if image fails
                                          (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                      <span className="text-xs font-bold text-gray-700">{t.initials}</span>
                                    </div>
                                    <div className="testimonial-card__name-wrapper">
                                      <div className="testimonial-card__name font-bold text-[#171A1F] text-sm">
                                        {t.name}
                                      </div>
                                      <div className="testimonial-card__profession text-xs text-[#5B6370]">
                                        {t.profession}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <div className="content-col testimonial-card__title font-bold text-sm text-[#171A1F] leading-snug pt-1">
                                    {t.title}
                                  </div>

                                  {/* Text */}
                                  <div className="content-col testimonial-card__text text-xs text-[#5B6370] leading-relaxed">
                                    {t.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Slide Page 2: Cards 3 & 4 */}
                        <div className="min-w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[testimonials[2], testimonials[3]].map((t, idx) => (
                            <div key={idx} className="content-col content-col_half testimonial-card flex-1">
                              <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-xl uix-bordered-layer_rad-m testimonial-card__wrapper bg-[#F8FAFC] border border-[#E1E6EB] rounded-[12px] p-5 h-full flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
                                <div className="content-row space-y-3">
                                  {/* Author info */}
                                  <div className="content-col testimonial-card__info-wrapper flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 border border-white shadow-xs shrink-0 flex items-center justify-center">
                                      <img
                                        className="testimonial-card__avatar w-full h-full object-cover"
                                        src={t.avatar}
                                        alt={t.name}
                                        onError={(e) => {
                                          (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                      <span className="text-xs font-bold text-gray-700">{t.initials}</span>
                                    </div>
                                    <div className="testimonial-card__name-wrapper">
                                      <div className="testimonial-card__name font-bold text-[#171A1F] text-sm">
                                        {t.name}
                                      </div>
                                      <div className="testimonial-card__profession text-xs text-[#5B6370]">
                                        {t.profession}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <div className="content-col testimonial-card__title font-bold text-sm text-[#171A1F] leading-snug pt-1">
                                    {t.title}
                                  </div>

                                  {/* Text */}
                                  <div className="content-col testimonial-card__text text-xs text-[#5B6370] leading-relaxed">
                                    {t.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Carousel Navigation (< 1-2 from 4 >) */}
                  <div className="carousel-slide__navigation carousel-slide__navigation_center mt-6 flex items-center justify-center">
                    <div className="carousel-slide__wrapp carousel-slide__wrapp_center flex items-center gap-4">
                      
                      {/* Prev Button */}
                      <button
                        onClick={() => setTestimonialPage(0)}
                        disabled={testimonialPage === 0}
                        aria-label="Previous testimonials"
                        className={`se-button_icon se-button-2_size-l se-button-2_no-text se-button-2 carousel-slide__button carousel__button_prev se-button-2_table p-2 rounded-[8px] border transition-colors select-none ${
                          testimonialPage === 0
                            ? 'se-button-2_disabled opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                            : 'hover:bg-[#F2F5F8] border-[#E1E6EB] text-[#171A1F] cursor-pointer'
                        }`}
                      >
                        <span className="se-button-2__wrapper flex items-center justify-center">
                          <span className="se-material-icon-2 se-button-2__icon notranslate se-button-2__icon_no-text">
                            {/* Material arrow_back_ios icon */}
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z" />
                            </svg>
                          </span>
                        </span>
                      </button>

                      {/* Count Indicator */}
                      <div className="carousel-slide__count text-xs font-semibold text-[#5B6370] select-none">
                        {testimonialPage === 0 ? '1-2 from 4' : '3-4 from 4'}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setTestimonialPage(1)}
                        disabled={testimonialPage === 1}
                        aria-label="Next testimonials"
                        className={`se-button_icon se-button-2_size-l se-button-2_no-text se-button-2 carousel-slide__button carousel__button_next se-button-2_table p-2 rounded-[8px] border transition-colors select-none ${
                          testimonialPage === 1
                            ? 'se-button-2_disabled opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                            : 'hover:bg-[#F2F5F8] border-[#E1E6EB] text-[#171A1F] cursor-pointer'
                        }`}
                      >
                        <span className="se-button-2__wrapper flex items-center justify-center">
                          <span className="se-material-icon-2 se-button-2__icon notranslate se-button-2__icon_no-text">
                            {/* Material arrow_forward_ios icon */}
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5.88 4.12L13.76 12l-7.88 7.88L8 22l10-10L8 2z" />
                            </svg>
                          </span>
                        </span>
                      </button>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== ITEM 6: BOTTOM ACTION BOX ===================== */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-8 sm:p-10 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-action flex flex-col items-center text-center">
              
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head max-w-xl">
                <div className="content-col introduction-section-box__title">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#171A1F] tracking-tight">
                    Start planning and get 20% off
                  </h2>
                </div>
                <div className="content-col introduction-section-box__description mt-1.5">
                  <p className="text-xs sm:text-sm text-[#5B6370]">
                    to any pricing plan for the first year
                  </p>
                </div>
              </div>

              <div className="content-row content-row_center introduction-section-box__main mt-6 relative">
                <div className="content-layout introduction-section-action__buttons">
                  <div className="content-row content-row_center flex items-center justify-center">
                    <div className="content-col content-col_half relative">
                      <button
                        onClick={() => setIsBottomDropdownOpen(!isBottomDropdownOpen)}
                        className="se-button_icon se-button-2_size-l se-button-2 se-button-2_color-blue inline-flex items-center gap-2.5 px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-semibold text-sm rounded-[8px] shadow-sm transition-all cursor-pointer select-none"
                      >
                        <span className="se-button-2__wrapper flex items-center gap-2">
                          <span className="se-material-icon-2 se-button-2__icon notranslate inline-flex items-center">
                            {/* Material open_in_new icon */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                          </span>
                          <span className="se-button-2__text">Add first brand</span>
                          <span className="se-button-2__arrow inline-flex items-center">
                            {/* Material keyboard_arrow_down icon */}
                            <svg className={`w-4 h-4 transition-transform ${isBottomDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                            </svg>
                          </span>
                        </span>
                      </button>

                      {/* Dropdown Menu */}
                      {isBottomDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-[#E1E6EB] rounded-[10px] shadow-lg py-1.5 z-30 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            onClick={() => {
                              setIsBottomDropdownOpen(false);
                              setIsModalOpen(true);
                            }}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#171A1F] font-semibold flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Add Brand to Planable</span>
                            <span className="text-[10px] font-bold text-[#2870ED] bg-blue-50 px-1.5 py-0.5 rounded">20% OFF</span>
                          </button>
                          <a
                            href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setIsBottomDropdownOpen(false)}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#5B6370] hover:text-[#171A1F] flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Open Interactive Tour</span>
                            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer utility links matching SE Ranking */}
        <div className="pt-6 border-t border-[#E1E6EB] flex flex-wrap items-center justify-between text-xs text-[#7A8391] gap-4">
          <div className="flex items-center gap-2 font-bold text-[#323842]">
            <div className="w-4 h-4 rounded bg-[#2870ED] flex items-center justify-center text-white text-[9px] font-black">
              SE
            </div>
            <span>SE Ranking & Planable Integration</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => alert('Feedback submitted! Thank you for helping us improve SE Ranking SMM.')}
              className="hover:text-[#2870ED] transition-colors cursor-pointer"
            >
              Report a bug
            </button>
            <Link href="/landing" className="hover:text-[#2870ED] transition-colors">
              Affiliates
            </Link>
            <Link href="/api-docs" className="hover:text-[#2870ED] transition-colors">
              API
            </Link>
            <button
              onClick={() => alert("What's new: SMM Planable 20% off integration is now live for all plans.")}
              className="hover:text-[#2870ED] transition-colors cursor-pointer"
            >
              What&apos;s new
            </button>
            <Link href="/pricing" className="hover:text-[#2870ED] transition-colors">
              Pricing
            </Link>
          </div>
        </div>

      </div>

      {/* ===================== MODAL: ADD FIRST BRAND ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-base font-bold text-gray-900">Brand Connected!</h3>
                <p className="text-xs text-gray-600">
                  Redirecting to your Planable workspace with 20% discount applied...
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddBrandSubmit} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2870ED] flex items-center justify-center font-bold text-sm">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Add First Brand to Planable</h3>
                    <p className="text-xs text-gray-500">20% exclusive discount will be applied automatically</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2870ED]"
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
                              ? 'border-[#2870ED] bg-blue-50/70 text-blue-900 font-bold'
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
                  <span className="text-amber-600">✨</span>
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
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
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
