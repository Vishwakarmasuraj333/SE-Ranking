'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  BarChart2,
  Activity,
  Users,
  Compass,
  Sparkles,
  Link2,
  CheckSquare,
  FileSearch,
  Columns,
  Link as ChainLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  Search as SearchIcon,
  Plus,
  KeyRound,
  Sliders,
  FolderTree,
  CheckCircle2,
  Files,
  Settings,
  Cpu,
  Wallet,
  LayoutDashboard,
  Store,
  Star,
  MapPin,
  HelpCircle,
  ExternalLink,
  Shield,
  Target,
  Building2,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { CreateProjectModal } from '../modals/CreateProjectModal';

export function SecondarySidebar() {
  const pathname = usePathname();
  const {
    activeRail,
    activeProject,
    setActiveProject,
    projects,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useApp();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectFlyoutOpen, setIsProjectFlyoutOpen] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);

  // Expanded sub-sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rankings: false,
    analytics: false,
    competitors: false,
    ai_tracker: false,
    audit: false,
    backlink_monitor: false,
    white_label: true,
    lead_generator: false,
    competitive_research: true,
    keyword_research: false,
  });

  const toggleSection = (key: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.domain.toLowerCase().includes(projectSearch.toLowerCase())
  );

  if (isSidebarCollapsed) {
    return (
      <aside className="w-10 bg-[#222D3B] text-gray-400 flex flex-col items-center py-3 border-r border-[#2C3646] select-none transition-all">
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || '' : '';

  // Determine active section
  const effectiveSection = (() => {
    if (pathname.startsWith('/local-marketing')) return 'local-marketing';
    if (pathname.startsWith('/api') || pathname.startsWith('/api-docs')) return 'api';
    if (pathname.startsWith('/backlinks')) return 'projects';
    if (pathname.startsWith('/website-audit')) return 'audit';
    if (pathname.startsWith('/reports')) return 'projects';
    if (
      pathname.startsWith('/agency-pack') ||
      pathname.startsWith('/admin.user.whitelabel') ||
      pathname.startsWith('/admin.lead_generator') ||
      activeRail === 'agency'
    ) {
      return 'agency';
    }
    if (
      pathname === '/' ||
      pathname === '/projects' ||
      pathname === '/project-overview' ||
      pathname === '/rankings' ||
      pathname === '/analytics' ||
      pathname === '/competitors' ||
      pathname === '/ai-results-tracker' ||
      pathname === '/insights' ||
      pathname === '/marketing-plan' ||
      pathname === '/page-changes' ||
      pathname === '/backlinks-monitor'
    ) {
      return 'projects';
    }
    return activeRail;
  })();

  const getSectionTitle = () => {
    switch (effectiveSection) {
      case 'agency':
        return 'Agency Pack';
      case 'local-marketing':
        return 'Local Marketing';
      case 'api':
        return 'API';
      case 'backlinks':
        return 'Backlinks';
      case 'audit':
        return 'Audit';
      case 'reports':
        return 'Report Builder';
      case 'projects':
        return 'Projects';
      default:
        return 'Research';
    }
  };

  return (
    <>
      <aside className="w-[245px] bg-[#232E3D] text-[#C4C9D3] flex flex-col justify-between border-r border-[#2B3545] select-none shrink-0 text-[14px] z-20 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header row matching screenshot */}
          <div className="h-11 px-3.5 flex items-center justify-between border-b border-[#2C374A] text-white">
            <span className="text-[15px] font-bold text-white tracking-wide">
              {getSectionTitle()}
            </span>
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="w-6 h-6 rounded-full bg-[#18212D] text-gray-400 hover:text-white flex items-center justify-center border border-white/5 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Selector Card (Hidden on API, Local Marketing, & Agency routes) */}
          {effectiveSection !== 'api' && effectiveSection !== 'local-marketing' && effectiveSection !== 'agency' && (
          <div className="p-2.5 relative border-b border-[#2C374A]/60">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs transition-colors border border-transparent cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src={`https://www.google.de/s2/favicons?domain=${activeProject?.domain || 'https://www.workcomposer.com'}`}
                  alt=""
                  className="w-4 h-4 rounded-xs shrink-0"
                />
                <span className="text-[13px] font-semibold text-gray-800 truncate">
                  {activeProject?.domain
                    ? (activeProject.domain.startsWith('http') ? activeProject.domain : `https://${activeProject.domain}/`)
                    : 'https://www.workcomposer.com/'}
                </span>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
            </button>

            {/* Project Dropdown Modal with Cascading Flyout Menu */}
            {isProjectDropdownOpen && (
              <div className="absolute left-2.5 right-2.5 top-12 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 text-xs">
                {/* Search */}
                <div className="p-2 border-b border-gray-100 flex items-center justify-between gap-1.5 bg-gray-50/70 rounded-t-lg">
                  <div className="flex items-center gap-1.5 flex-1">
                    <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="Search project"
                      className="w-full bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-xs"
                      autoFocus
                    />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 rotate-180" />
                </div>

                {/* Active Project Card with hover trigger for flyout */}
                <div
                  className="p-1 relative"
                  onMouseEnter={() => setIsProjectFlyoutOpen(true)}
                  onMouseLeave={() => {
                    setIsProjectFlyoutOpen(false);
                    setHoveredSubmenu(null);
                  }}
                >
                  <div className="w-full px-3 py-2.5 rounded-md bg-[#EDF2F7] hover:bg-[#E2E8F0] text-gray-900 flex items-center justify-between transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={`https://www.google.de/s2/favicons?domain=${activeProject?.domain || 'https://www.workcomposer.com'}`}
                        alt=""
                        className="w-4 h-4 rounded-xs shrink-0"
                      />
                      <span className="truncate font-semibold text-gray-800 text-[13px]">
                        {activeProject?.domain
                          ? (activeProject.domain.startsWith('http') ? activeProject.domain : `https://${activeProject.domain}/`)
                          : 'https://www.workcomposer.com/'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Level 1 Flyout Menu matching exact screenshot */}
                  {isProjectFlyoutOpen && (
                    <div
                      className="absolute left-[calc(100%+4px)] top-0 w-60 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700 animate-in fade-in zoom-in-95 duration-100"
                      onMouseEnter={() => setIsProjectFlyoutOpen(true)}
                    >
                      {/* 1. Project Overview */}
                      <Link
                        href="/project-overview"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4 text-gray-500" />
                        <span>Project Overview</span>
                      </Link>

                      {/* 2. Rankings with Submenu */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('rankings')}
                      >
                        <Link
                          href="/rankings"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BarChart2 className="w-4 h-4 text-gray-500" />
                            <span>Rankings</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        {hoveredSubmenu === 'rankings' && (
                          <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700">
                            <Link href="/rankings" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Summary</Link>
                            <Link href="/rankings" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Detailed</Link>
                            <Link href="/rankings" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Historical data</Link>
                          </div>
                        )}
                      </div>

                      {/* 3. Analytics & Traffic with Submenu */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('analytics')}
                      >
                        <Link
                          href="/analytics"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Activity className="w-4 h-4 text-gray-500" />
                            <span>Analytics &amp; Traffic</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        {hoveredSubmenu === 'analytics' && (
                          <div className="absolute left-full top-0 ml-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700">
                            <Link href="/analytics" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Overview</Link>
                            <Link href="/analytics" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Traffic</Link>
                            <Link href="/analytics" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Snippets</Link>
                            <Link href="/analytics" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Google Search Console Data</Link>
                            <Link href="/analytics" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">SEO potential</Link>
                          </div>
                        )}
                      </div>

                      {/* 4. My Competitors with Submenu */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('competitors')}
                      >
                        <Link
                          href="/competitors"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>My Competitors</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        {hoveredSubmenu === 'competitors' && (
                          <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700">
                            <Link href="/competitors" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Added Competitors</Link>
                            <Link href="/competitors" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">SERP Competitors</Link>
                            <Link href="/competitors" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Share of Voice</Link>
                            <Link href="/competitors" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Visibility Rating</Link>
                          </div>
                        )}
                      </div>

                      {/* 5. AI Results Tracker with Submenu */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('ai')}
                      >
                        <Link
                          href="/ai-results-tracker"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-gray-500" />
                            <span>AI Results Tracker</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        {hoveredSubmenu === 'ai' && (
                          <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700">
                            <Link href="/ai-results-tracker" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Rankings</Link>
                            <Link href="/ai-results-tracker" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Competitors</Link>
                            <Link href="/ai-results-tracker" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Sources</Link>
                          </div>
                        )}
                      </div>

                      {/* 6. Insights */}
                      <Link
                        href="/insights"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-gray-500" />
                        <span>Insights</span>
                      </Link>

                      {/* 7. Backlink Checker */}
                      <Link
                        href="/backlinks"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                      >
                        <Link2 className="w-4 h-4 text-gray-500" />
                        <span>Backlink Checker</span>
                      </Link>

                      {/* 8. Marketing Plan */}
                      <Link
                        href="/marketing-plan"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 text-gray-500" />
                        <span>Marketing Plan</span>
                      </Link>

                      {/* 9. Website Audit with Submenu */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('audit')}
                      >
                        <Link
                          href="/website-audit"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileSearch className="w-4 h-4 text-gray-500" />
                            <span>Website Audit</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        {hoveredSubmenu === 'audit' && (
                          <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700">
                            <Link href="/website-audit" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Overview</Link>
                            <Link href="/website-audit" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Issue Report</Link>
                            <Link href="/website-audit" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Crawled Pages</Link>
                            <Link href="/website-audit" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Found Resources</Link>
                            <Link href="/website-audit" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Found Links</Link>
                            <Link href="/website-audit" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Crawl Comparison</Link>
                          </div>
                        )}
                      </div>

                      {/* 10. Page Changes Monitor */}
                      <Link
                        href="/page-changes"
                        onClick={() => setIsProjectDropdownOpen(false)}
                        className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                      >
                        <Columns className="w-4 h-4 text-gray-500" />
                        <span>Page Changes Monitor</span>
                      </Link>

                      {/* 11. Backlink Monitor with Submenu */}
                      <div
                        className="relative"
                        onMouseEnter={() => setHoveredSubmenu('backlink-mon')}
                      >
                        <Link
                          href="/backlinks-monitor"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center justify-between hover:bg-gray-100/80 hover:text-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <ChainLink className="w-4 h-4 text-gray-500" />
                            <span>Backlink Monitor</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>

                        {hoveredSubmenu === 'backlink-mon' && (
                          <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50 text-[13px] text-gray-700">
                            <Link href="/backlinks-monitor" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Backlinks</Link>
                            <Link href="/backlinks-monitor" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Domains</Link>
                            <Link href="/backlinks-monitor" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Anchor Texts</Link>
                            <Link href="/backlinks-monitor" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Pages</Link>
                            <Link href="/backlinks-monitor" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">IPs/Subnets</Link>
                            <Link href="/backlinks-monitor" onClick={() => setIsProjectDropdownOpen(false)} className="block px-4 py-2 hover:bg-gray-100">Disavow</Link>
                          </div>
                        )}
                      </div>

                      {/* 12. Project Settings */}
                      <div className="pt-1 mt-1 border-t border-gray-100">
                        <Link
                          href="/settings?site_id=12960641"
                          onClick={() => setIsProjectDropdownOpen(false)}
                          className="px-4 py-2 flex items-center gap-3 hover:bg-gray-100/80 hover:text-gray-900 transition-colors font-medium text-gray-800"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Project settings</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Project Button */}
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full p-2.5 flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium border-t border-gray-100 transition-colors cursor-pointer rounded-b-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create project</span>
                </button>
              </div>
            )}
          </div>
          )}

          {/* Navigation Links List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 no-scrollbar">
            {effectiveSection === 'local-marketing' ? (
              /* Local Marketing Mode Menu (Exact match to Screenshots 1, 2, 5, 6) */
              <>
                <Link
                  href="/local-marketing?tab=all-locations"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.includes('admin.local_marketing.html') ||
                    currentTab === 'all-locations' ||
                    (pathname === '/local-marketing' && !currentTab)
                      ? 'bg-[#1E293B] text-white font-semibold shadow-2xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>All Locations</span>
                </Link>

                <Link
                  href="/local-marketing?tab=overview"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'overview'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Compass className="w-4 h-4 text-gray-400" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/local-marketing?tab=rankings"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'rankings'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-gray-400" />
                  <span>Local Rankings</span>
                </Link>

                <Link
                  href="/local-marketing/audit"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.startsWith('/local-marketing/audit') || currentTab === 'audit'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  <span>Local Marketing Audit</span>
                </Link>

                <div>
                  <button
                    onClick={() => toggleSection('gbp')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span>Google Business Profile</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.gbp ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.gbp && (
                    <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5">
                      <Link href="/local-marketing?tab=gbp-insights" className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10">
                        • GBP Insights
                      </Link>
                      <Link href="/local-marketing?tab=gbp-posts" className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10">
                        • GBP Posts
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/local-marketing/business-listings"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.startsWith('/local-marketing/business-listings') || currentTab === 'listings'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Files className="w-4 h-4 text-gray-300" />
                  <span>Business Listings</span>
                </Link>

                <div>
                  <button
                    onClick={() => toggleSection('reviews')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span>Reviews</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.reviews === false ? '' : 'rotate-180'}`} />
                  </button>
                  {expandedSections.reviews !== false && (
                    <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5">
                      <Link
                        href="/local-marketing/reviews/review-list"
                        className={`block px-2 py-1.5 rounded text-xs transition-colors ${
                          pathname.includes('/review-list') || pathname === '/local-marketing/reviews'
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        • Review List
                      </Link>
                      <Link
                        href="/local-marketing/reviews/analytics"
                        className={`block px-2 py-1.5 rounded text-xs transition-colors ${
                          pathname.includes('/analytics')
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        • Analytics
                      </Link>
                      <Link
                        href="/local-marketing/reviews/analytics#insights"
                        className="block px-2 py-1.5 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10"
                      >
                        • Insights
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : effectiveSection === 'api' ? (
              /* API Mode Menu (Exact match to SE Ranking API screenshot) */
              <>
                <Link
                  href="/api-docs"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/api-docs' || pathname === '/api'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/api-docs/wallet"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/api-docs/wallet' || pathname === '/api/wallet'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Wallet</span>
                </Link>

                <Link
                  href="/api-docs/mcp"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/api-docs/mcp' || pathname === '/api/mcp'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>MCP</span>
                </Link>
              </>
            ) : effectiveSection === 'agency' ? (
              /* Agency Pack Menu (Exact match to SE Ranking White Label screenshot) */
              <>
                {/* 1. White Label Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={(e) => toggleSection('white_label', e)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] font-semibold cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          expandedSections.white_label ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                      <span>White Label</span>
                    </div>
                  </button>

                  {expandedSections.white_label && (
                    <div className="ml-5 pl-2.5 border-l border-[#333D52] space-y-1 mt-1 text-[13px]">
                      <Link
                        href="/agency-pack?tab=interface-customization"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'interface-customization'
                            ? 'bg-[#1E293B] text-white font-medium shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Interface customization
                      </Link>
                      <Link
                        href="/agency-pack?tab=personal-domain-names"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'personal-domain-names'
                            ? 'bg-[#1E293B] text-white font-medium shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Personal domain names
                      </Link>
                      <Link
                        href="/agency-pack?tab=login-page"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'login-page' ||
                          pathname.includes('whitelabel') ||
                          (pathname.startsWith('/agency-pack') && (!currentTab || currentTab === 'login-page'))
                            ? 'bg-[#1E293B] text-white font-semibold shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block shrink-0" />
                        <span>Login page</span>
                      </Link>
                      <Link
                        href="/agency-pack?tab=email-settings"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'email-settings'
                            ? 'bg-[#1E293B] text-white font-medium shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Email settings
                      </Link>
                      <Link
                        href="/agency-pack?tab=report-builder"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'report-builder'
                            ? 'bg-[#1E293B] text-white font-medium shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Report Builder
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Lead Generator Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={(e) => toggleSection('lead_generator', e)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] font-semibold cursor-pointer select-none transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                          expandedSections.lead_generator ? 'rotate-90' : 'rotate-0'
                        }`}
                      />
                      <span>Lead Generator</span>
                    </div>
                  </button>

                  {expandedSections.lead_generator && (
                    <div className="ml-5 pl-2.5 border-l border-[#333D52] space-y-1 mt-1 text-[13px]">
                      <Link
                        href="/agency-pack?tab=lead-generator"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'lead-generator'
                            ? 'bg-[#1E293B] text-white font-medium shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Start
                      </Link>
                      <Link
                        href="/agency-pack?tab=lead-widgets"
                        className={`block px-3 py-1.5 rounded-md transition-colors ${
                          currentTab === 'lead-widgets'
                            ? 'bg-[#1E293B] text-white font-medium shadow-2xs'
                            : 'text-[#A0ABC0] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Widgets
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Users External Link */}
                <Link
                  href="/users"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Users</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                {/* 4. Report Builder External Link */}
                <Link
                  href="/reports"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                    <span>Report Builder</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </>
            ) : effectiveSection === 'projects' ? (
              /* Projects Mode Menu (Exact match to uploaded_media_1790348914402.png) */
              <>
                {/* 1. All Projects */}
                <Link
                  href="/projects"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/projects' || pathname === '/'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Home className="w-4 h-4 text-gray-300" />
                  <span>All Projects</span>
                </Link>

                {/* 2. Project Overview */}
                <Link
                  href="/project-overview"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/project-overview'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Project Overview</span>
                </Link>

                {/* 3. Rankings */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/rankings')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/rankings" className="flex items-center gap-2.5 flex-1">
                      <BarChart2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span>Rankings</span>
                    </Link>
                    <button
                      onClick={(e) => toggleSection('rankings', e)}
                      className="p-0.5 hover:text-white text-gray-400 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedSections.rankings ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.rankings && (
                    <div className="ml-6 pl-2 border-l border-[#333E50] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/rankings?tab=detailed" className="block px-2 py-1.5 hover:text-white">
                        • Detailed
                      </Link>
                      <Link href="/rankings?tab=historical" className="block px-2 py-1.5 hover:text-white">
                        • Historical Data
                      </Link>
                      <Link href="/rankings?tab=overview" className="block px-2 py-1.5 hover:text-white">
                        • Overview
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Analytics & Traffic */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/analytics')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/analytics" className="flex items-center gap-2.5 flex-1">
                      <Activity className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span>Analytics &amp; Traffic</span>
                    </Link>
                    <button
                      onClick={(e) => toggleSection('analytics', e)}
                      className="p-0.5 hover:text-white text-gray-400 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedSections.analytics ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.analytics && (
                    <div className="ml-6 pl-2 border-l border-[#333E50] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/analytics?tab=overview" className="block px-2 py-1.5 hover:text-white">
                        • Overview
                      </Link>
                      <Link href="/analytics?tab=traffic" className="block px-2 py-1.5 hover:text-white">
                        • Traffic Channels
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. My Competitors */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/competitors')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/competitors" className="flex items-center gap-2.5 flex-1">
                      <Users className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span>My Competitors</span>
                    </Link>
                    <button
                      onClick={(e) => toggleSection('competitors', e)}
                      className="p-0.5 hover:text-white text-gray-400 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedSections.competitors ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.competitors && (
                    <div className="ml-6 pl-2 border-l border-[#333E50] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/competitors?tab=added" className="block px-2 py-1.5 hover:text-white">
                        • Added Competitors
                      </Link>
                      <Link href="/competitors?tab=serp" className="block px-2 py-1.5 hover:text-white">
                        • SERP Competitors
                      </Link>
                    </div>
                  )}
                </div>

                {/* 6. AI Results Tracker */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/ai-results-tracker')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/ai-results-tracker" className="flex items-center gap-2.5 flex-1">
                      <Compass className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span>AI Results Tracker</span>
                    </Link>
                    <button
                      onClick={(e) => toggleSection('ai_tracker', e)}
                      className="p-0.5 hover:text-white text-gray-400 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedSections.ai_tracker ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.ai_tracker && (
                    <div className="ml-6 pl-2 border-l border-[#333E50] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/ai-results-tracker?tab=chatgpt" className="block px-2 py-1.5 hover:text-white">
                        • ChatGPT Visibility
                      </Link>
                      <Link href="/ai-results-tracker?tab=perplexity" className="block px-2 py-1.5 hover:text-white">
                        • Perplexity Answers
                      </Link>
                      <Link href="/ai-results-tracker?tab=gemini" className="block px-2 py-1.5 hover:text-white">
                        • Gemini Overview
                      </Link>
                    </div>
                  )}
                </div>

                {/* 7. Insights */}
                <Link
                  href="/insights"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.startsWith('/insights')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Insights</span>
                </Link>

                {/* 8. Backlink Checker */}
                <Link
                  href="/backlinks"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/backlinks'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Backlink Checker</span>
                </Link>

                {/* 9. Marketing Plan */}
                <Link
                  href="/marketing-plan"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.startsWith('/marketing-plan')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Marketing Plan</span>
                </Link>

                {/* 10. Website Audit */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/website-audit')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/website-audit" className="flex items-center gap-2.5 flex-1">
                      <FileSearch className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span>Website Audit</span>
                    </Link>
                    <button
                      onClick={(e) => toggleSection('audit', e)}
                      className="p-0.5 hover:text-white text-gray-400 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedSections.audit ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.audit && (
                    <div className="ml-6 pl-2 border-l border-[#333E50] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/website-audit" className="block px-2 py-1.5 hover:text-white">
                        • Overview
                      </Link>
                      <Link href="/website-audit?tab=issues" className="block px-2 py-1.5 hover:text-white">
                        • Issue Report
                      </Link>
                      <Link href="/website-audit?tab=pages" className="block px-2 py-1.5 hover:text-white">
                        • Crawled Pages
                      </Link>
                    </div>
                  )}
                </div>

                {/* 11. Page Changes Monitor */}
                <Link
                  href="/page-changes"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.startsWith('/page-changes')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Columns className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Page Changes Monitor</span>
                </Link>

                {/* 12. Backlink Monitor */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/backlinks-monitor')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/backlinks-monitor" className="flex items-center gap-2.5 flex-1">
                      <ChainLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
                      <span>Backlink Monitor</span>
                    </Link>
                    <button
                      onClick={(e) => toggleSection('backlink_monitor', e)}
                      className="p-0.5 hover:text-white text-gray-400 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          expandedSections.backlink_monitor ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.backlink_monitor && (
                    <div className="ml-6 pl-2 border-l border-[#333E50] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/backlinks-monitor?tab=all" className="block px-2 py-1.5 hover:text-white">
                        • All Monitored Links
                      </Link>
                      <Link href="/backlinks-monitor?tab=disavow" className="block px-2 py-1.5 hover:text-white">
                        • Disavow Tool
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : effectiveSection === 'backlinks' ? (
              /* Backlinks Submenu */
              <>
                <Link
                  href="/backlinks"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/backlinks'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-gray-400" />
                  <span>Backlink Checker</span>
                </Link>

                <Link
                  href="/backlinks/gap-analyzer"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/backlinks/gap-analyzer'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FolderTree className="w-4 h-4 text-gray-400" />
                  <span>Backlink Gap Analyzer</span>
                </Link>
              </>
            ) : effectiveSection === 'audit' ? (
              /* Audit Submenu */
              <>
                <Link
                  href="/website-audit"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/website-audit'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSearch className="w-4 h-4 text-gray-400" />
                    <span>Website Audit</span>
                  </div>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.2 rounded font-semibold">
                    1
                  </span>
                </Link>

                <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5">
                  <Link
                    href="/website-audit?tab=overview"
                    className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  >
                    • Overview
                  </Link>
                  <Link
                    href="/website-audit?tab=issues"
                    className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  >
                    • Issue Report
                  </Link>
                  <Link
                    href="/website-audit?tab=pages"
                    className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10"
                  >
                    • Crawled Pages
                  </Link>
                </div>

                <Link
                  href="/website-audit/on-page"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10"
                >
                  <FileSearch className="w-4 h-4 text-gray-400" />
                  <span>On-Page SEO Checker</span>
                </Link>

                <Link
                  href="/website-audit/serp-analyzer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <span>SERP Analyzer</span>
                </Link>
              </>
            ) : effectiveSection === 'reports' ? (
              /* Reports Submenu */
              <>
                <Link
                  href="/reports"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/reports'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                  <span>Reports</span>
                </Link>

                <Link
                  href="/reports?tab=templates"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10"
                >
                  <Files className="w-4 h-4 text-gray-400" />
                  <span>Templates</span>
                </Link>

                <Link
                  href="/reports?tab=scheduled"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span>Scheduled reporting</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                    1/5
                  </span>
                </Link>
              </>
            ) : (
              /* Research Mode Menu */
              <>
                <div>
                  <button
                    onClick={() => toggleSection('competitive_research')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-gray-400" />
                      <span>Competitive Research</span>
                    </div>
                    {expandedSections.competitive_research ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.competitive_research && (
                    <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5">
                      <Link
                        href="/research/competitive-research"
                        className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
                          pathname === '/research/competitive-research'
                            ? 'text-white font-semibold bg-[#394757]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-2 text-gray-500">•</span>
                        <span>Google Search</span>
                      </Link>

                      <Link
                        href="/research/ai-search"
                        className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                          pathname.startsWith('/research/ai-search')
                            ? 'text-[#60A5FA] font-semibold bg-[#394757]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-2 text-[#60A5FA]">•</span>
                          <span>AI Search</span>
                        </div>
                        <span className="text-[10px] bg-[#145EA8]/40 text-[#8ec5fc] px-1.5 py-0.2 rounded font-semibold border border-[#145EA8]/50">
                          Beta
                        </span>
                      </Link>

                      <Link
                        href="/research/database-expansion"
                        className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
                          pathname === '/research/database-expansion'
                            ? 'text-white font-semibold bg-[#394757]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-2 text-gray-500">•</span>
                        <span>Database Expansion</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => toggleSection('keyword_research')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/10 text-[14px] font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-gray-400" />
                      <span>Keyword Research</span>
                    </div>
                    {expandedSections.keyword_research ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>

                  {expandedSections.keyword_research && (
                    <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5 text-xs text-gray-400">
                      <Link href="/research/keyword-research" className="block px-2 py-1.5 hover:text-white">
                        • Overview
                      </Link>
                      <Link href="/research/keyword-research/suggestions" className="block px-2 py-1.5 hover:text-white">
                        • Keyword Suggestions
                      </Link>
                      <Link href="/research/keyword-research/serp" className="block px-2 py-1.5 hover:text-white">
                        • SERP Overview
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/keyword-manager"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/keyword-manager'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-gray-400" />
                  <span>Keyword Manager</span>
                </Link>

                <Link
                  href="/keyword-grouper"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname === '/keyword-grouper'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FolderTree className="w-4 h-4 text-gray-400" />
                  <span>Keyword Grouper</span>
                </Link>

                <Link
                  href="/research/keyword-research/suggestions"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <span>Search Engine Autocomplete</span>
                </Link>

                <Link
                  href="/research/keyword-research"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] text-[#C4C9D3] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                  <span>Search Volume Checker</span>
                </Link>

                {/* Index Status Checker with Results matching Screenshot 1 */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors ${
                      pathname.startsWith('/index-status-checker')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Link href="/index-status-checker" className="flex items-center gap-2.5 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      <span>Index Status Checker</span>
                    </Link>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5">
                    <Link
                      href="/index-status-checker?tab=results"
                      className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
                        pathname.startsWith('/index-status-checker')
                          ? 'text-white font-semibold bg-[#2C3848]'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      <span className="mr-2 text-gray-500">•</span>
                      <span>Results</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
