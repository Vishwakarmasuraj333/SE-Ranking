'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  // Expanded sub-sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rankings: false,
    analytics: false,
    competitors: false,
    ai_tracker: false,
    audit: false,
    backlink_monitor: false,
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

  // Determine active section
  const effectiveSection = (() => {
    if (pathname.startsWith('/local-marketing')) return 'local-marketing';
    if (pathname.startsWith('/api') || pathname.startsWith('/api-docs')) return 'api';
    if (pathname.startsWith('/backlinks')) return 'projects';
    if (pathname.startsWith('/website-audit')) return 'audit';
    if (pathname.startsWith('/reports')) return 'reports';
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
      <aside className="w-[245px] bg-[#232E3D] text-[#C4C9D3] flex flex-col justify-between border-r border-[#2B3545] select-none shrink-0 text-[13.5px] z-20 overflow-hidden">
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

          {/* Project Selector Card (Hidden on API & Local Marketing routes) */}
          {effectiveSection !== 'api' && effectiveSection !== 'local-marketing' && (
          <div className="p-2.5 relative border-b border-[#2C374A]/60">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-lg px-3 py-2 flex items-center justify-between shadow-xs transition-colors border border-transparent cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                {/* Zoho 4-color square logo */}
                <div className="w-5 h-5 rounded-[4px] border border-gray-200 overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0 shadow-2xs">
                  <div className="bg-[#E53935]" />
                  <div className="bg-[#FB8C00]" />
                  <div className="bg-[#1E88E5]" />
                  <div className="bg-[#43A047]" />
                </div>
                <span className="text-[13.5px] font-semibold text-gray-800 truncate">
                  {activeProject?.domain || 'zohosocial.com'}
                </span>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
            </button>

            {/* Project Dropdown Modal */}
            {isProjectDropdownOpen && (
              <div className="absolute left-2.5 right-2.5 top-12 bg-[#1C2431] border border-[#343F54] rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
                {/* Search */}
                <div className="p-2 border-b border-[#2E374A] flex items-center gap-1.5 bg-[#151C26]">
                  <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search project"
                    className="w-full bg-transparent text-gray-200 focus:outline-hidden text-xs"
                    autoFocus
                  />
                </div>

                {/* List */}
                <div className="max-h-48 overflow-y-auto py-1 divide-y divide-[#283244]/40">
                  {filteredProjects.map((p) => {
                    const isSelected = activeProject?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveProject(p);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-[#0B69FF]/20 text-[#60A5FA]' : 'hover:bg-white/5 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shrink-0" />
                          <span className="truncate font-medium">{p.domain}</span>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0B69FF]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Create Project Button */}
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full p-2.5 flex items-center justify-center gap-1.5 text-[#3E8BFF] bg-[#171D28] hover:bg-[#121721] font-medium border-t border-[#2E374A] transition-colors cursor-pointer"
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
              /* Local Marketing Mode Menu (Exact match to Screenshot 2) */
              <>
                <Link
                  href="/local-marketing"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FolderTree className="w-4 h-4 text-gray-400" />
                  <span>All Locations</span>
                </Link>

                <Link
                  href="/local-marketing"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/local-marketing'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-300" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/local-marketing?tab=rankings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LayoutGrid className="w-4 h-4 text-gray-400" />
                  <span>Local Rankings</span>
                </Link>

                <Link
                  href="/local-marketing/audit"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname.startsWith('/local-marketing/audit')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  <span>Local Marketing Audit</span>
                </Link>

                <div>
                  <button
                    onClick={() => toggleSection('gbp')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span>Google Business Profile</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.gbp ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.gbp && (
                    <div className="ml-5 pl-2 border-l border-[#333D52] space-y-0.5 mt-0.5">
                      <Link href="/local-marketing#gbp-stats" className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5">
                        • Performance &amp; Views
                      </Link>
                      <Link href="/local-marketing#gbp-keywords" className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5">
                        • Searches by Keywords
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/local-marketing/business-listings"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname.startsWith('/local-marketing/business-listings')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Files className="w-4 h-4 text-gray-300" />
                  <span>Business Listings</span>
                </Link>

                <div>
                  <button
                    onClick={() => toggleSection('reviews')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        • Review List
                      </Link>
                      <Link
                        href="/local-marketing/reviews/analytics"
                        className={`block px-2 py-1.5 rounded text-xs transition-colors ${
                          pathname.includes('/analytics')
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        • Analytics
                      </Link>
                      <Link
                        href="/local-marketing/reviews/analytics#insights"
                        className="block px-2 py-1.5 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5"
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/api-docs' || pathname === '/api'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/api-docs/wallet"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/api-docs/wallet' || pathname === '/api/wallet'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Wallet</span>
                </Link>

                <Link
                  href="/api-docs/mcp"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/api-docs/mcp' || pathname === '/api/mcp'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>MCP</span>
                </Link>
              </>
            ) : effectiveSection === 'projects' ? (
              /* Projects Mode Menu (Exact match to uploaded_media_1790348914402.png) */
              <>
                {/* 1. All Projects */}
                <Link
                  href="/projects"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/projects' || pathname === '/'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Home className="w-4 h-4 text-gray-300" />
                  <span>All Projects</span>
                </Link>

                {/* 2. Project Overview */}
                <Link
                  href="/project-overview"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/project-overview'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Project Overview</span>
                </Link>

                {/* 3. Rankings */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/rankings')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/analytics')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/competitors')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/ai-results-tracker')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname.startsWith('/insights')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Insights</span>
                </Link>

                {/* 8. Backlink Checker */}
                <Link
                  href="/backlinks"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/backlinks'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Backlink Checker</span>
                </Link>

                {/* 9. Marketing Plan */}
                <Link
                  href="/marketing-plan"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname.startsWith('/marketing-plan')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Marketing Plan</span>
                </Link>

                {/* 10. Website Audit */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/website-audit')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname.startsWith('/page-changes')
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Columns className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <span>Page Changes Monitor</span>
                </Link>

                {/* 12. Backlink Monitor */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors group cursor-pointer ${
                      pathname.startsWith('/backlinks-monitor')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/backlinks'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Link2 className="w-4 h-4 text-gray-400" />
                  <span>Backlink Checker</span>
                </Link>

                <Link
                  href="/backlinks/gap-analyzer"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/backlinks/gap-analyzer'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/website-audit'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                    className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  >
                    • Overview
                  </Link>
                  <Link
                    href="/website-audit?tab=issues"
                    className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  >
                    • Issue Report
                  </Link>
                  <Link
                    href="/website-audit?tab=pages"
                    className="block px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  >
                    • Crawled Pages
                  </Link>
                </div>

                <Link
                  href="/website-audit/on-page"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5"
                >
                  <FileSearch className="w-4 h-4 text-gray-400" />
                  <span>On-Page SEO Checker</span>
                </Link>

                <Link
                  href="/website-audit/serp-analyzer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5"
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/reports'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                  <span>Reports</span>
                </Link>

                <Link
                  href="/reports?tab=templates"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5"
                >
                  <Files className="w-4 h-4 text-gray-400" />
                  <span>Templates</span>
                </Link>

                <Link
                  href="/reports?tab=scheduled"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5"
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
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/5 text-[13.5px] font-semibold cursor-pointer"
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
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
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
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
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
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
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
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#C4C9D3] hover:text-white hover:bg-white/5 text-[13.5px] font-semibold cursor-pointer"
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/keyword-manager'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-gray-400" />
                  <span>Keyword Manager</span>
                </Link>

                <Link
                  href="/keyword-grouper"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    pathname === '/keyword-grouper'
                      ? 'bg-[#394757] text-white font-medium'
                      : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FolderTree className="w-4 h-4 text-gray-400" />
                  <span>Keyword Grouper</span>
                </Link>

                <Link
                  href="/research/keyword-research/suggestions"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <span>Search Engine Autocomplete</span>
                </Link>

                <Link
                  href="/research/keyword-research"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#C4C9D3] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                  <span>Search Volume Checker</span>
                </Link>

                {/* Index Status Checker with Results matching Screenshot 1 */}
                <div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                      pathname.startsWith('/index-status-checker')
                        ? 'bg-[#394757] text-white font-medium'
                        : 'text-[#C4C9D3] hover:text-white hover:bg-white/5'
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
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
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
