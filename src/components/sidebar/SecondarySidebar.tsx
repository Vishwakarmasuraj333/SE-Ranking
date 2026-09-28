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
  PenLine,
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

  // Expanded sub-sections matching exact screenshot (all project dropdowns expanded by default)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('se_ranking_sidebar_sections');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      rankings: true,
      analytics: true,
      competitors: true,
      ai_tracker: true,
      audit: true,
      backlink_monitor: true,
      white_label: true,
      lead_generator: false,
      competitive_research: true,
      keyword_research: true,
      keyword_grouper: true,
      search_volume: true,
      index_status: true,
    };
  });

  const toggleSection = (key: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('se_ranking_sidebar_sections', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
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
      pathname.startsWith('/research') ||
      pathname.startsWith('/keyword-') ||
      pathname.startsWith('/search-') ||
      pathname.startsWith('/index-status-checker') ||
      activeRail === 'research'
    ) {
      return 'research';
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

          {/* Project Selector Card (Visible ONLY on Projects mode matching screenshot) */}
          {effectiveSection === 'projects' && (
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
            {effectiveSection === 'api' ? (
              /* API Mode Menu matching Screenshot 1 */
              <>
                <Link
                  href="/api-docs"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    (pathname === '/api-docs' || pathname === '/api' || pathname.includes('admin.api.html')) && !currentTab
                      ? 'bg-[#1E293B] text-white font-semibold shadow-2xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/api-docs?tab=wallet"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    currentTab === 'wallet'
                      ? 'bg-[#1E293B] text-white font-semibold shadow-2xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span>Wallet</span>
                </Link>

                <Link
                  href="/api-docs/mcp"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition-colors ${
                    pathname.startsWith('/api-docs/mcp') || currentTab === 'mcp'
                      ? 'bg-[#1E293B] text-white font-semibold shadow-2xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-gray-400" />
                  <span>MCP</span>
                </Link>
              </>
            ) : effectiveSection === 'local-marketing' ? (
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
              /* Projects Mode Menu (Exact 1:1 match to uploaded SE Ranking screenshot) */
              <div className="space-y-0.5">
                {/* 1. All Projects */}
                <Link
                  href="/projects"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname === '/projects' || pathname === '/'
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">All Projects</span>
                </Link>

                {/* 2. Project Overview */}
                <Link
                  href="/project-overview"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname === '/project-overview'
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Project Overview</span>
                </Link>

                {/* 3. Rankings (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('rankings', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/rankings')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/rankings"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <BarChart2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Rankings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('rankings', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Rankings menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.rankings ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.rankings && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/rankings?tab=summary"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'summary' || (pathname === '/rankings' && !currentTab)
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Summary</span>
                      </Link>
                      <Link
                        href="/rankings?tab=detailed"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'detailed'
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Detailed</span>
                      </Link>
                      <Link
                        href="/rankings?tab=historical"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'historical'
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Historical data</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Analytics & Traffic (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('analytics', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/analytics')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/analytics"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Activity className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Analytics &amp; Traffic</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('analytics', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Analytics & Traffic menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.analytics ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.analytics && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/analytics?tab=overview"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'overview' || (pathname === '/analytics' && !currentTab)
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Overview</span>
                      </Link>
                      <Link
                        href="/analytics?tab=traffic"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'traffic'
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Traffic</span>
                      </Link>
                      <Link
                        href="/analytics?tab=snippets"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'snippets'
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Snippets</span>
                      </Link>
                      <Link
                        href="/analytics?tab=gsc"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'gsc'
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>Google Search Console Data</span>
                      </Link>
                      <Link
                        href="/analytics?tab=potential"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'potential'
                            ? 'text-white font-medium bg-white/10'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
                        <span>SEO potential</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. My Competitors (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('competitors', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/competitors')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/competitors"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Users className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">My Competitors</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('competitors', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle My Competitors menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.competitors ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.competitors && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/competitors?tab=added"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'added' || (pathname === '/competitors' && !currentTab)
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Added Competitors</span>
                      </Link>
                      <Link
                        href="/competitors?tab=serp"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'serp'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>SERP Competitors</span>
                      </Link>
                      <Link
                        href="/competitors?tab=sov"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'sov'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Share of Voice</span>
                      </Link>
                      <Link
                        href="/competitors?tab=visibility"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'visibility'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Visibility Rating</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 6. AI Results Tracker (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('ai_tracker', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/ai-results-tracker')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/ai-results-tracker"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Compass className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">AI Results Tracker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('ai_tracker', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle AI Results Tracker menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.ai_tracker ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.ai_tracker && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/ai-results-tracker?tab=rankings"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'rankings' || (pathname === '/ai-results-tracker' && !currentTab)
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Rankings</span>
                      </Link>
                      <Link
                        href="/ai-results-tracker?tab=competitors"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'competitors'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Competitors</span>
                      </Link>
                      <Link
                        href="/ai-results-tracker?tab=sources"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'sources'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Sources</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 7. Insights */}
                <Link
                  href="/insights"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/insights')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Insights</span>
                </Link>

                {/* 8. Backlink Checker */}
                <Link
                  href="/backlinks"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname === '/backlinks'
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Backlink Checker</span>
                </Link>

                {/* 9. Marketing Plan */}
                <Link
                  href="/marketing-plan"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/marketing-plan')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Marketing Plan</span>
                </Link>

                {/* 10. Website Audit (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('audit', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/website-audit')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/website-audit"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FileSearch className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Website Audit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('audit', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Website Audit menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.audit ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.audit && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/website-audit?tab=overview"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'overview' || (pathname === '/website-audit' && !currentTab)
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Overview</span>
                      </Link>
                      <Link
                        href="/website-audit?tab=issues"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'issues'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Issue Report</span>
                      </Link>
                      <Link
                        href="/website-audit?tab=pages"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'pages'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Crawled Pages</span>
                      </Link>
                      <Link
                        href="/website-audit?tab=resources"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'resources'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Found Resources</span>
                      </Link>
                      <Link
                        href="/website-audit?tab=links"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'links'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Found Links</span>
                      </Link>
                      <Link
                        href="/website-audit?tab=comparison"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'comparison'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Crawl Comparison</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 11. Page Changes Monitor */}
                <Link
                  href="/page-changes"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/page-changes')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Columns className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Page Changes Monitor</span>
                </Link>

                {/* 12. Backlink Monitor (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('backlink_monitor', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/backlinks-monitor')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/backlinks-monitor"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <ChainLink className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Backlink Monitor</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('backlink_monitor', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Backlink Monitor menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.backlink_monitor ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.backlink_monitor && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/backlinks-monitor?tab=backlinks"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'backlinks' || (pathname === '/backlinks-monitor' && !currentTab)
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Backlinks</span>
                      </Link>
                      <Link
                        href="/backlinks-monitor?tab=domains"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'domains'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Domains</span>
                      </Link>
                      <Link
                        href="/backlinks-monitor?tab=anchor-texts"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'anchor-texts'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Anchor Texts</span>
                      </Link>
                      <Link
                        href="/backlinks-monitor?tab=pages"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'pages'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Pages</span>
                      </Link>
                      <Link
                        href="/backlinks-monitor?tab=ips-subnets"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'ips-subnets'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>IPs/Subnets</span>
                      </Link>
                      <Link
                        href="/backlinks-monitor?tab=disavow"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'disavow'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Disavow</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
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
              /* Audit Submenu (Exact 1:1 match to screenshot) */
              <div className="space-y-0.5">
                {/* Website Audit Dropdown */}
                <div>
                  <div
                    onClick={(e) => toggleSection('audit', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Link
                      href="/website-audit"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FileSearch className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Website Audit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('audit', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Website Audit menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.audit ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>

                  {expandedSections.audit && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      {/* All reports (active in screenshot) */}
                      <Link
                        href="/website-audit"
                        className={`flex items-center gap-2 py-1.5 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          pathname === '/website-audit' && (!currentTab || currentTab === 'all-reports')
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-[#8C98A9]">📋</span>
                        <span>All reports</span>
                      </Link>

                      <Link
                        href="/website-audit?tab=overview"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'overview'
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>-</span>
                        <span>Overview</span>
                      </Link>

                      <Link
                        href="/website-audit?tab=issues"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'issues'
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>-</span>
                        <span>Issue Report</span>
                      </Link>

                      <Link
                        href="/website-audit?tab=pages"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'pages'
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>-</span>
                        <span>Crawled Pages</span>
                      </Link>

                      <Link
                        href="/website-audit?tab=resources"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'resources'
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>-</span>
                        <span>Found Resources</span>
                      </Link>

                      <Link
                        href="/website-audit?tab=links"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'links'
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>-</span>
                        <span>Found Links</span>
                      </Link>

                      <Link
                        href="/website-audit?tab=comparison"
                        className={`flex items-center gap-2 py-1 px-2.5 rounded transition-colors text-xs tracking-tight ${
                          currentTab === 'comparison'
                            ? 'bg-[#394757] text-white font-medium shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>-</span>
                        <span>Crawl Comparison</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* On-Page SEO Checker */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-[#C4C9D3] hover:text-white hover:bg-[#2C384A] cursor-pointer">
                  <Link
                    href="/website-audit/on-page"
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                  >
                    <FileSearch className="w-4 h-4 text-[#8C98A9]" />
                    <span className="truncate">On-Page SEO Checker</span>
                  </Link>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C98A9]" />
                </div>

                {/* SERP Analyzer */}
                <Link
                  href="/website-audit/serp-analyzer"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                    pathname === '/website-audit/serp-analyzer'
                      ? 'bg-[#394757] text-white'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <SearchIcon className="w-4 h-4 text-[#8C98A9]" />
                  <span>SERP Analyzer</span>
                </Link>
              </div>
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
              /* Research Mode Menu (Exact 1:1 match to uploaded Research screenshot) */
              <div className="space-y-0.5">
                {/* 1. Competitive Research (Dropdown matching Screenshot 1, 2 & 3) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('competitive_research', e)}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]"
                  >
                    <Link
                      href="/research/competitive-research"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <Compass className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Competitive Research</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('competitive_research', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Competitive Research menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.competitive_research ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.competitive_research && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      {/* Google Search subitem matching Screenshot 1 */}
                      <Link
                        href="/research/competitive-research"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          pathname === '/research' || pathname === '/research/competitive-research'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Google Search</span>
                      </Link>

                      {/* AI Search subitem matching Screenshot 2 */}
                      <Link
                        href="/research/ai-search"
                        className={`group flex items-center justify-between py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          pathname.startsWith('/research/ai-search')
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                          <span>AI Search</span>
                        </div>
                        <span className="text-[10px] bg-[#145EA8]/50 text-[#8ec5fc] px-1.5 py-0.2 rounded font-semibold border border-[#145EA8]/60">
                          Beta
                        </span>
                      </Link>

                      {/* Database Expansion subitem matching Screenshot 3 */}
                      <Link
                        href="/research/database-expansion"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          pathname === '/research/database-expansion'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Database Expansion</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Keyword Research (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('keyword_research', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/research/keyword')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/research/keyword-research"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <KeyRound className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Keyword Research</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('keyword_research', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Keyword Research menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.keyword_research ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.keyword_research && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/research/keyword-research?tab=overview"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'overview' || (pathname === '/research/keyword-research' && !currentTab)
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Overview</span>
                      </Link>
                      <Link
                        href="/research/keyword-research/suggestions"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          pathname.includes('suggestions') || currentTab === 'suggestions'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Keyword Suggestions</span>
                      </Link>
                      <Link
                        href="/research/keyword-research/serp"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          pathname.includes('serp') || currentTab === 'serp'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>SERP Overview</span>
                      </Link>
                      <Link
                        href="/research/keyword-research?tab=organic-serp-history"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'organic-serp-history'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Organic SERP History</span>
                      </Link>
                      <Link
                        href="/research/keyword-research?tab=ads-history"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'ads-history'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Ads History</span>
                      </Link>
                      <Link
                        href="/research/keyword-research?tab=database-expansion"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'database-expansion'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Database Expansion</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Keyword Manager */}
                <Link
                  href="/keyword-manager"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/keyword-manager')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Keyword Manager</span>
                </Link>

                {/* 4. Keyword Grouper (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('keyword_grouper', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/keyword-grouper')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/keyword-grouper"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <FolderTree className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Keyword Grouper</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('keyword_grouper', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Keyword Grouper menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.keyword_grouper ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.keyword_grouper && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/keyword-grouper?tab=results"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'results' || pathname === '/keyword-grouper'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Results</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. Search Engine Autocomplete */}
                <Link
                  href="/search-autocomplete"
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer ${
                    pathname.startsWith('/search-autocomplete')
                      ? 'bg-[#394757] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                  }`}
                >
                  <PenLine className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                  <span className="truncate">Search Engine Autocomplete</span>
                </Link>

                {/* 6. Search Volume Checker (Dropdown) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('search_volume', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/search-volume-checker')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/search-volume-checker"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <BarChart2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Search Volume Checker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('search_volume', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Search Volume Checker menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.search_volume ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.search_volume && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/search-volume-checker?tab=results"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'results' || pathname === '/search-volume-checker'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Results</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 7. Index Status Checker (Dropdown - Active highlight matching screenshot) */}
                <div>
                  <div
                    onClick={(e) => toggleSection('index_status', e)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
                      pathname.startsWith('/index-status-checker')
                        ? 'bg-[#394757] text-white font-semibold shadow-xs'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-[#2C384A]'
                    }`}
                  >
                    <Link
                      href="/index-status-checker"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#8C98A9] group-hover:text-white transition-colors shrink-0" />
                      <span className="truncate">Index Status Checker</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => toggleSection('index_status', e)}
                      className="p-1 rounded hover:bg-white/10 text-[#8C98A9] group-hover:text-white transition-all cursor-pointer shrink-0 ml-1"
                      title="Toggle Index Status Checker menu"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          expandedSections.index_status ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>
                  </div>
                  {expandedSections.index_status && (
                    <div className="ml-5 pl-2.5 border-l border-[#333E50]/80 space-y-0.5 mt-0.5 py-0.5 text-[13px] animate-in fade-in duration-150">
                      <Link
                        href="/index-status-checker?tab=results"
                        className={`group flex items-center gap-2 py-1 px-2.5 rounded transition-all duration-150 text-xs tracking-tight ${
                          currentTab === 'results' || pathname === '/index-status-checker'
                            ? 'text-white font-medium bg-white/10 shadow-2xs'
                            : 'text-[#9AA5B8] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 shrink-0 transition-opacity"></span>
                        <span>Results</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
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
