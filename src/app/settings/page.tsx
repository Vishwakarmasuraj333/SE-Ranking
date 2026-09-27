'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Settings,
  Search,
  Key,
  Sparkles,
  Users,
  BarChart3,
  X,
  Trash2,
  Check,
  ChevronDown,
  Info,
  Globe,
  Plus,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { useApp } from '@/components/providers/AppProviders';

type WizardTab =
  | 'general'
  | 'search-engines'
  | 'keywords'
  | 'prompts'
  | 'competitors'
  | 'analytics';

export default function ProjectSettingsWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, refreshProjects } = useApp();

  const siteIdParam = searchParams.get('site_id');

  // Match or default project matching screenshot (https://www.workcomposer.com/)
  const currentProject =
    (siteIdParam ? projects.find((p) => String(p.id) === String(siteIdParam)) : null) ||
    projects.find((p) => p.name?.toLowerCase().includes('workcomposer') || p.name?.toLowerCase().includes('zohosocial') || p.domain?.toLowerCase().includes('workcomposer')) || {
      id: '12960641',
      name: 'https://www.workcomposer.com/',
      domain: 'workcomposer.com',
      url: 'https://www.workcomposer.com/',
    };

  const [activeTab, setActiveTab] = useState<WizardTab>('general');

  // Form State matching screenshot
  const [websiteUrl, setWebsiteUrl] = useState(
    (currentProject as any)?.url || 'https://www.workcomposer.com/'
  );
  const [domainType, setDomainType] = useState('*.domain/* (Recommended)');
  const [projectName, setProjectName] = useState(
    currentProject?.name || 'https://www.workcomposer.com/'
  );
  const [sidebarTitle, setSidebarTitle] = useState(
    currentProject?.name || websiteUrl || 'https://www.workcomposer.com/'
  );
  const [group, setGroup] = useState('No group selected');
  const [projectColor, setProjectColor] = useState('#00E676'); // vibrant green from screenshot
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [backlinkReport, setBacklinkReport] = useState(true);
  const [projectStatus, setProjectStatus] = useState(true); // Active

  // UI feedback & delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if currentProject changes
  useEffect(() => {
    if (currentProject) {
      if (currentProject.name) setSidebarTitle(currentProject.name);
    }
  }, [currentProject]);

  // Tab 2: Search engines state
  const [searchEngines, setSearchEngines] = useState([
    { engine: 'Google', country: 'United States', lang: 'English', device: 'Desktop' },
    { engine: 'Google Mobile', country: 'United States', lang: 'English', device: 'Mobile' },
    { engine: 'Bing', country: 'United States', lang: 'English', device: 'Desktop' },
  ]);

  // Tab 3: Keywords state
  const [keywords, setKeywords] = useState([
    { keyword: 'social media management tool', searchVolume: '22,200', tag: 'Core' },
    { keyword: 'social media scheduling software', searchVolume: '14,800', tag: 'High-Intent' },
    { keyword: 'zoho social alternative', searchVolume: '6,600', tag: 'Competitor' },
    { keyword: 'workcomposer productivity', searchVolume: '2,900', tag: 'Brand' },
  ]);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // Tab 4: Prompts state
  const [prompts, setPrompts] = useState([
    { query: 'best social media management software for agencies in 2026', trackedIn: 'ChatGPT, Copilot, Perplexity' },
    { query: 'top employee productivity and time tracking tools', trackedIn: 'Google AI Overview, Gemini' },
  ]);
  const [newPromptInput, setNewPromptInput] = useState('');

  // Tab 5: Competitors state
  const [competitors, setCompetitors] = useState([
    { domain: 'hootsuite.com', visibility: '78.4%', backlinks: '3.4M' },
    { domain: 'sproutsocial.com', visibility: '84.1%', backlinks: '5.1M' },
    { domain: 'buffer.com', visibility: '72.3%', backlinks: '2.8M' },
  ]);
  const [newCompetitorInput, setNewCompetitorInput] = useState('');

  // Color palette options
  const colorOptions = [
    '#00E676', // Screenshot green
    '#1351D8', // SE Ranking Blue
    '#9A00FF', // Purple
    '#FF9F00', // Orange
    '#E61952', // Crimson
    '#00C4FF', // Cyan
    '#FFD600', // Yellow
    '#4F46E5', // Indigo
  ];

  // Keyboard shortcut: ESC to go back to projects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/projects');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Handle Save / Apply
  const handleApply = async () => {
    setIsSaving(true);
    // Update the sidebar title immediately to reflect changes
    setSidebarTitle(projectName || websiteUrl || 'https://www.workcomposer.com/');
    try {
      if (currentProject?.id) {
        await fetch(`/api/projects/${currentProject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: projectName,
            url: websiteUrl,
            status: projectStatus ? 'Active' : 'Inactive',
            color: projectColor,
          }),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 4000);
      if (refreshProjects) refreshProjects();
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async () => {
    try {
      if (currentProject.id) {
        await fetch(`/api/projects/${currentProject.id}`, { method: 'DELETE' });
      }
      setIsDeleteModalOpen(false);
      router.push('/projects');
    } catch (e) {
      console.error(e);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'General information';
      case 'search-engines':
        return 'Search engines';
      case 'keywords':
        return 'Keywords';
      case 'prompts':
        return 'Prompts';
      case 'competitors':
        return 'Competitors';
      case 'analytics':
        return 'Statistics and Analytics services';
      default:
        return 'General information';
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F6F9] font-sans text-gray-900 select-none">
      {/* 1. Left Sidebar: SE Ranking Royal Blue exact match */}
      <aside className="w-64 sm:w-72 md:w-80 bg-[#1054E2] text-white flex flex-col justify-between shrink-0 shadow-lg min-h-screen">
        <div className="p-6 sm:p-7">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push('/projects')}>
            <SeRankingLogo variant="white" width={135} height={32} />
          </div>

          {/* Project Title & Subtitle */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-snug truncate">
              {currentProject.name || 'zohosocial.com'}
            </h1>
            <p className="text-white/80 text-sm mt-0.5 font-normal tracking-wide">
              Settings
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {/* General information */}
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'general' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>General information</span>
            </button>

            {/* Search engines */}
            <button
              type="button"
              onClick={() => setActiveTab('search-engines')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'search-engines'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Search className={`w-5 h-5 shrink-0 ${activeTab === 'search-engines' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Search engines</span>
            </button>

            {/* Keywords */}
            <button
              type="button"
              onClick={() => setActiveTab('keywords')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'keywords'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Key className={`w-5 h-5 shrink-0 ${activeTab === 'keywords' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Keywords</span>
            </button>

            {/* Prompts */}
            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'prompts'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Sparkles className={`w-5 h-5 shrink-0 ${activeTab === 'prompts' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Prompts</span>
            </button>

            {/* Competitors */}
            <button
              type="button"
              onClick={() => setActiveTab('competitors')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'competitors'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Users className={`w-5 h-5 shrink-0 ${activeTab === 'competitors' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Competitors</span>
            </button>

            {/* Statistics and Analytics services */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <BarChart3 className={`w-5 h-5 shrink-0 ${activeTab === 'analytics' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Statistics and Analytics services</span>
            </button>
          </nav>
        </div>

        {/* Bottom capsule dock: Project status */}
        <div className="p-6 sm:p-7 pb-8">
          <div className="bg-white rounded-xl px-4 py-3 text-gray-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Project status:</span>
              <span className="italic text-gray-400 font-serif text-sm">i</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProjectStatus(!projectStatus)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  projectStatus ? 'bg-[#1054E2]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    projectStatus ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-gray-700">
                {projectStatus ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col justify-between bg-white min-h-screen overflow-y-auto">
        <div>
          {/* Top Bar with Title and ESC close */}
          <div className="border-b border-gray-100 flex items-center justify-between px-8 sm:px-12 py-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#101423]">
              {getTabTitle()}
            </h2>

            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
              title="Close (ESC)"
            >
              <X className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 group-hover:text-gray-600">
                ESC
              </span>
            </button>
          </div>

          {/* Toast Notification */}
          {showSaveToast && (
            <div className="mx-8 sm:mx-12 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Project settings applied successfully!</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveToast(false)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tab 1: General information */}
          {activeTab === 'general' && (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-9">
              {/* Set up website Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#101423] tracking-tight">
                    Set up website
                  </h3>
                  <p className="text-xs sm:text-[13px] text-gray-500 mt-1 leading-relaxed max-w-3xl">
                    Track the ranking positions of your site in real time in all major search engines. You are free to customize the
                    project parameter and position tracking settings according to your requirements
                  </p>
                </div>

                {/* Row 1: Website URL & Domain type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Website URL */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                      <span>Website URL</span>
                      <span className="italic text-gray-400 font-serif text-xs">i</span>
                    </label>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2] focus:ring-1 focus:ring-[#1054E2] transition-colors"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Domain type */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                      <span>Domain type</span>
                      <span className="italic text-gray-400 font-serif text-xs">i</span>
                    </label>
                    <div className="relative">
                      <select
                        value={domainType}
                        onChange={(e) => setDomainType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2] focus:ring-1 focus:ring-[#1054E2] appearance-none pr-9 cursor-pointer transition-colors"
                      >
                        <option value="*.domain/* (Recommended)">*.domain/* (Recommended)</option>
                        <option value="domain/* (without subdomains)">domain/* (without subdomains)</option>
                        <option value="Exact URL">Exact URL</option>
                        <option value="URL with path">URL with path</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Project name, Group, Project color */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
                  {/* Project name */}
                  <div className="sm:col-span-6">
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                      <span>Project name</span>
                      <span className="italic text-gray-400 font-serif text-xs">i</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2] focus:ring-1 focus:ring-[#1054E2] transition-colors"
                      placeholder="Project name"
                    />
                  </div>

                  {/* Group */}
                  <div className="sm:col-span-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                      <span>Group</span>
                      <span className="italic text-gray-400 font-serif text-xs">i</span>
                    </label>
                    <div className="relative">
                      <select
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2] focus:ring-1 focus:ring-[#1054E2] appearance-none pr-9 cursor-pointer transition-colors"
                      >
                        <option value="No group selected">No group selected</option>
                        <option value="Client Projects">Client Projects</option>
                        <option value="E-commerce Brands">E-commerce Brands</option>
                        <option value="Internal SEO">Internal SEO</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Project color */}
                  <div className="sm:col-span-2 relative">
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                      <span>Project color</span>
                      <span className="italic text-gray-400 font-serif text-xs">i</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                      className="w-10 h-10 rounded-md border border-gray-300 shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: projectColor }}
                      title="Choose project color"
                    />

                    {/* Color palette dropdown */}
                    {isColorPickerOpen && (
                      <div className="absolute left-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2.5 z-50 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                        {colorOptions.map((c) => (
                          <div
                            key={c}
                            onClick={() => {
                              setProjectColor(c);
                              setIsColorPickerOpen(false);
                            }}
                            className={`w-7 h-7 rounded-md cursor-pointer hover:scale-110 transition-transform ${
                              projectColor === c ? 'ring-2 ring-black ring-offset-1' : ''
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional settings Section */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#101423] tracking-tight">
                    Additional settings
                  </h3>
                  <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
                    Select additional options to enable for the project
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBacklinkReport(!backlinkReport)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      backlinkReport ? 'bg-[#1054E2]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        backlinkReport ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <label
                    onClick={() => setBacklinkReport(!backlinkReport)}
                    className="flex items-center gap-1.5 text-sm text-gray-800 font-medium cursor-pointer"
                  >
                    <span>Backlink report</span>
                    <span className="italic text-gray-400 font-serif text-xs">i</span>
                  </label>
                </div>
              </div>

              {/* Delete project Section */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#101423] tracking-tight">
                    Delete project
                  </h3>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-5 py-2.5 bg-white border border-gray-300 hover:border-red-400 hover:text-red-600 rounded-lg text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                    <span>DELETE PROJECT</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Search engines */}
          {activeTab === 'search-engines' && (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-[#101423]">Target Search Engines</h3>
                <p className="text-xs text-gray-500 mt-1">Configure search engines and geographical locations for position tracking</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">SEARCH ENGINE</th>
                      <th className="py-3 px-4">COUNTRY</th>
                      <th className="py-3 px-4">LANGUAGE</th>
                      <th className="py-3 px-4">DEVICE</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {searchEngines.map((se, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/70">
                        <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#1054E2]" />
                          <span>{se.engine}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{se.country}</td>
                        <td className="py-3 px-4 text-gray-700">{se.lang}</td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className="px-2 py-0.5 rounded bg-gray-100 font-medium text-xs">{se.device}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSearchEngines(searchEngines.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchEngines([...searchEngines, { engine: 'Google', country: 'United Kingdom', lang: 'English', device: 'Desktop' }])}
                  className="px-4 py-2 bg-[#1054E2]/10 hover:bg-[#1054E2]/20 text-[#1054E2] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Search Engine</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Keywords */}
          {activeTab === 'keywords' && (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-[#101423]">Tracked Keywords</h3>
                <p className="text-xs text-gray-500 mt-1">Manage target keywords to monitor daily rank fluctuations</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  placeholder="Enter keyword to add..."
                  className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newKeywordInput.trim()) return;
                    setKeywords([...keywords, { keyword: newKeywordInput.trim(), searchVolume: '1,200', tag: 'Custom' }]);
                    setNewKeywordInput('');
                  }}
                  className="px-5 py-2 bg-[#1054E2] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Add Keyword
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">KEYWORD</th>
                      <th className="py-3 px-4">SEARCH VOLUME</th>
                      <th className="py-3 px-4">TAG</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {keywords.map((kw, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/70">
                        <td className="py-3 px-4 font-semibold text-gray-900">{kw.keyword}</td>
                        <td className="py-3 px-4 font-mono text-gray-700">{kw.searchVolume}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs">{kw.tag}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Prompts */}
          {activeTab === 'prompts' && (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-[#101423]">AI Overview & LLM Prompts</h3>
                <p className="text-xs text-gray-500 mt-1">Track generative AI prompts across ChatGPT, Perplexity, Copilot, and Gemini</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newPromptInput}
                  onChange={(e) => setNewPromptInput(e.target.value)}
                  placeholder="Enter prompt to track..."
                  className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPromptInput.trim()) return;
                    setPrompts([...prompts, { query: newPromptInput.trim(), trackedIn: 'Google AI Overview, ChatGPT' }]);
                    setNewPromptInput('');
                  }}
                  className="px-5 py-2 bg-[#1054E2] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Track Prompt
                </button>
              </div>

              <div className="space-y-3">
                {prompts.map((p, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{p.query}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Engines: {p.trackedIn}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrompts(prompts.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Competitors */}
          {activeTab === 'competitors' && (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-[#101423]">Tracked Competitors</h3>
                <p className="text-xs text-gray-500 mt-1">Direct competitors benchmarked against {currentProject.name}</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newCompetitorInput}
                  onChange={(e) => setNewCompetitorInput(e.target.value)}
                  placeholder="domain.com"
                  className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCompetitorInput.trim()) return;
                    setCompetitors([...competitors, { domain: newCompetitorInput.trim(), visibility: '65.0%', backlinks: '1.2M' }]);
                    setNewCompetitorInput('');
                  }}
                  className="px-5 py-2 bg-[#1054E2] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Add Competitor
                </button>
              </div>

              <div className="space-y-3">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                        {comp.domain[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{comp.domain}</div>
                        <div className="text-xs text-gray-500">Visibility: {comp.visibility} • Backlinks: {comp.backlinks}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Statistics and Analytics services */}
          {activeTab === 'analytics' && (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-7">
              <div>
                <h3 className="text-base font-bold text-[#101423]">Integrations & Analytics Services</h3>
                <p className="text-xs text-gray-500 mt-1">Connect your Google services to sync live traffic and organic impression data</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Google Analytics 4 */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-lg">
                      📊
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Google Analytics 4</h4>
                      <p className="text-xs text-gray-500">Sync sessions and revenue</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#1054E2] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Connect GA4
                  </button>
                </div>

                {/* Google Search Console */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                      🔍
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Google Search Console</h4>
                      <p className="text-xs text-gray-500">Sync impressions and queries</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#1054E2] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Connect Search Console
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom Action Bar matching exact screenshot */}
        <div className="border-t border-gray-100 bg-white px-8 sm:px-12 py-4 flex items-center justify-between sticky bottom-0 z-30">
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-700 uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
          >
            BACK TO PROJECT
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleApply}
            className="px-8 py-2.5 bg-[#1054E2] hover:bg-[#0c44b8] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'APPLYING...' : 'APPLY'}
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">Delete Project?</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{projectName}</strong>? All ranking data, keywords, audit reports, and competitor benchmarks will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer shadow-xs"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
