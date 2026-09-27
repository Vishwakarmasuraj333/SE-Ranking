'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Info,
  ChevronDown,
  Plus,
  Check,
  Search,
  Globe,
  Sparkles,
  BarChart3,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { refreshProjects, setActiveProject } = useApp();

  // Active Wizard Step: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);

  // Form State (Step 1: General information)
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [domainType, setDomainType] = useState('*.domain/* (Recommended)');
  const [isDomainTypeOpen, setIsDomainTypeOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [group, setGroup] = useState('No group selected');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupsList, setGroupsList] = useState<string[]>(['No group selected']);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [projectColor, setProjectColor] = useState('#1771F1');
  const [access, setAccess] = useState('Only me');
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  // Additional settings toggles
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [websiteAudit, setWebsiteAudit] = useState(true);
  const [backlinkReport, setBacklinkReport] = useState(true);

  // Left sidebar status
  const [projectActive, setProjectActive] = useState(true);
  const [advancedSettings, setAdvancedSettings] = useState(false);

  // Step 2: Search engines
  const [searchEngine, setSearchEngine] = useState('Google');
  const [country, setCountry] = useState('United States');
  const [language, setLanguage] = useState('English');

  // Step 3: Keywords
  const [keywordsText, setKeywordsText] = useState('');

  // Step 4: Prompts
  const [promptsText, setPromptsText] = useState('');

  // Step 5: Competitors
  const [competitorsText, setCompetitorsText] = useState('');

  // Step 6: Analytics
  const [connectGSC, setConnectGSC] = useState(false);
  const [connectGA, setConnectGA] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!websiteUrl.trim()) {
        setError('Please specify the Website URL.');
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Step 6 completed: submit project to real backend
      await handleFinishProject();
    }
  };

  const handleFinishProject = async () => {
    setIsSubmitting(true);
    setError(null);

    const cleanDomain = websiteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .trim();

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim() || cleanDomain,
          domain: cleanDomain,
          color: projectColor,
          country,
          weeklyReport,
          websiteAudit,
          backlinkReport,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      await refreshProjects();
      if (data.project) {
        setActiveProject(data.project);
      }

      onClose();
      router.push('/project-overview');
    } catch (err: any) {
      setError(err?.message || 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'General information' },
    { num: 2, title: 'Search engines' },
    { num: 3, title: 'Keywords' },
    { num: 4, title: 'Prompts' },
    { num: 5, title: 'Competitors' },
    { num: 6, title: 'Statistics and Analytics services' },
  ];

  const colorPalette = [
    '#1771F1',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-white text-gray-900 font-sans overflow-hidden animate-in fade-in duration-200">
      {/* ==================== LEFT BLUE SIDEBAR (Exact Match to Screenshot 2) ==================== */}
      <div className="w-[320px] bg-[#2870ED] text-white flex flex-col justify-between p-8 shrink-0 select-none">
        <div>
          {/* White SE Ranking Logo */}
          <div className="mb-10">
            <SeRankingLogo variant="white" width={130} height={30} />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-white mb-8">
            Create project
          </h1>

          {/* Numbered Stepper */}
          <div className="space-y-6 relative">
            {stepsList.map((step, idx) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <div key={step.num} className="relative flex items-center gap-3.5">
                  {/* Connecting line */}
                  {idx < stepsList.length - 1 && (
                    <div
                      className={`absolute left-[13px] top-[26px] w-[2px] h-[34px] ${
                        isPast ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  )}

                  {/* Circle number */}
                  <div
                    onClick={() => {
                      if (websiteUrl.trim() || step.num === 1) {
                        setCurrentStep(step.num);
                      }
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all cursor-pointer z-10 ${
                      isActive
                        ? 'bg-[#FFBC00] text-gray-900 shadow-md ring-4 ring-white/20'
                        : isPast
                        ? 'bg-white text-[#2870ED]'
                        : 'border border-white/60 text-white/90'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                  </div>

                  {/* Step Title */}
                  <span
                    onClick={() => {
                      if (websiteUrl.trim() || step.num === 1) {
                        setCurrentStep(step.num);
                      }
                    }}
                    className={`text-sm cursor-pointer transition-colors ${
                      isActive
                        ? 'font-bold text-white'
                        : isPast
                        ? 'text-white font-medium'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Status Card (Exact match to screenshot) */}
        <div className="bg-white rounded-lg p-3 shadow-md flex items-center justify-between text-gray-900">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
            <span>Project status:</span>
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setProjectActive(!projectActive)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                projectActive ? 'bg-[#2870ED]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  projectActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-gray-800">
              {projectActive ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* ==================== RIGHT MAIN WIZARD AREA ==================== */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Top Header Bar */}
        <div className="h-16 border-b border-gray-100 px-10 flex items-center justify-between select-none">
          <h2 className="text-base font-bold text-gray-900">
            {stepsList.find((s) => s.num === currentStep)?.title}
          </h2>

          <div className="flex items-center gap-8">
            {/* Advanced settings toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdvancedSettings(!advancedSettings)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                  advancedSettings ? 'bg-[#2870ED]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    advancedSettings ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                <span>Advanced settings</span>
                <Info className="w-3.5 h-3.5 text-gray-400 italic" />
              </div>
            </div>

            {/* ESC Close button */}
            <button
              onClick={onClose}
              className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
              title="Close wizard (Esc)"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                ESC
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 max-w-4xl px-10 py-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* ==================== STEP 1: General information ==================== */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-150">
              {/* Set up website Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Set up website</h3>
                <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                  Track the ranking positions of your site in real time in all major search engines. You are free to customize the project parameter and position tracking settings according to your requirements
                </p>
              </div>

              {/* Row 1: Website URL & Domain type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      if (!projectName) {
                        const clean = e.target.value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
                        setProjectName(clean);
                      }
                    }}
                    placeholder="mycompany.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED] focus:ring-1 focus:ring-[#2870ED]"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Domain type <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDomainTypeOpen(!isDomainTypeOpen)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 flex items-center justify-between cursor-pointer focus:outline-hidden focus:border-[#2870ED]"
                  >
                    <span>{domainType}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isDomainTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 text-xs">
                      {['*.domain/* (Recommended)', 'domain/*', 'exact URL'].map((t) => (
                        <div
                          key={t}
                          onClick={() => {
                            setDomainType(t);
                            setIsDomainTypeOpen(false);
                          }}
                          className="px-3.5 py-2 hover:bg-blue-50 text-gray-800 cursor-pointer"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Project name, Group, Project color */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-5">
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">Project name</label>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED]"
                  />
                </div>

                <div className="md:col-span-5 relative">
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">Group</label>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGroupOpen(!isGroupOpen)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 flex items-center justify-between cursor-pointer focus:outline-hidden"
                  >
                    <span>{group}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isGroupOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-30 py-1 text-xs overflow-hidden">
                      {/* Search box inside dropdown matching screenshot */}
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          value={groupSearch}
                          onChange={(e) => setGroupSearch(e.target.value)}
                          placeholder="Search"
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED]"
                          autoFocus
                        />
                      </div>

                      {/* Items */}
                      <div className="max-h-40 overflow-y-auto">
                        {groupsList
                          .filter((g) => g.toLowerCase().includes(groupSearch.toLowerCase()))
                          .map((g) => (
                            <div
                              key={g}
                              onClick={() => {
                                setGroup(g);
                                setIsGroupOpen(false);
                                setGroupSearch('');
                              }}
                              className={`px-3 py-2 hover:bg-gray-50 text-gray-800 cursor-pointer ${
                                group === g ? 'bg-blue-50/60 font-semibold text-[#2870ED]' : ''
                              }`}
                            >
                              {g}
                            </div>
                          ))}
                      </div>

                      {/* + Create new... action matching screenshot */}
                      <div className="border-t border-gray-100 p-1.5">
                        {isCreatingGroup ? (
                          <div className="flex items-center gap-1.5 p-1">
                            <input
                              type="text"
                              value={newGroupName}
                              onChange={(e) => setNewGroupName(e.target.value)}
                              placeholder="Group name"
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newGroupName.trim()) {
                                  setGroupsList((prev) => [...prev, newGroupName.trim()]);
                                  setGroup(newGroupName.trim());
                                  setNewGroupName('');
                                  setIsCreatingGroup(false);
                                  setIsGroupOpen(false);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newGroupName.trim()) {
                                  setGroupsList((prev) => [...prev, newGroupName.trim()]);
                                  setGroup(newGroupName.trim());
                                  setNewGroupName('');
                                  setIsCreatingGroup(false);
                                  setIsGroupOpen(false);
                                }
                              }}
                              className="px-2 py-1 bg-[#2870ED] text-white rounded text-[11px] font-bold"
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsCreatingGroup(true)}
                            className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:text-[#2870ED] hover:bg-gray-50 rounded flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-400" />
                            <span>Create new...</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-1 mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">Project color</label>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg border border-gray-300 shadow-2xs shrink-0 cursor-pointer"
                      style={{ backgroundColor: projectColor }}
                    />
                    <div className="flex items-center gap-1">
                      {colorPalette.slice(0, 4).map((c) => (
                        <div
                          key={c}
                          onClick={() => setProjectColor(c)}
                          className="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Access to the project & + Add account */}
              <div className="max-w-md">
                <div className="flex items-center gap-1 mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">Access to the project</label>
                  <Info className="w-3 h-3 text-gray-400" />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccessOpen(!isAccessOpen)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 flex items-center justify-between cursor-pointer focus:outline-hidden"
                  >
                    <span>{access}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isAccessOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 text-xs">
                      {['Only me', 'All team members', 'Custom role access'].map((a) => (
                        <div
                          key={a}
                          onClick={() => {
                            setAccess(a);
                            setIsAccessOpen(false);
                          }}
                          className="px-3.5 py-2 hover:bg-blue-50 text-gray-800 cursor-pointer"
                        >
                          {a}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => alert('Add account dialog: invite team members')}
                  className="mt-2 text-xs font-semibold text-[#2870ED] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add account</span>
                </button>
              </div>

              {/* Row 4: Additional settings */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Additional settings</h4>
                  <p className="text-[11px] text-gray-500">
                    Select additional options to enable for the project
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Weekly report */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setWeeklyReport(!weeklyReport)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        weeklyReport ? 'bg-[#2870ED]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          weeklyReport ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                      <span>Weekly report</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Website Audit */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setWebsiteAudit(!websiteAudit)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        websiteAudit ? 'bg-[#2870ED]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          websiteAudit ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                      <span>Website Audit</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Backlink report */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBacklinkReport(!backlinkReport)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        backlinkReport ? 'bg-[#2870ED]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          backlinkReport ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                      <span>Backlink report</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: Search engines ==================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Add search engines</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Choose which search engines and geographic regions you want to track keywords rankings for.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search Engine</label>
                  <select
                    value={searchEngine}
                    onChange={(e) => setSearchEngine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                  >
                    <option>Google</option>
                    <option>Google Mobile</option>
                    <option>Bing</option>
                    <option>Yahoo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country / Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: Keywords ==================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Add keywords</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your target keywords manually (one per line) or import from CSV or Google Search Console.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Keywords list
                </label>
                <textarea
                  rows={8}
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="seo ranking tool&#10;keyword research&#10;backlink tracker"
                  className="w-full p-3.5 border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:outline-hidden focus:border-[#2870ED]"
                />
              </div>
            </div>
          )}

          {/* ==================== STEP 4: Prompts ==================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">AI Search Prompts</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Track brand visibility and citations across ChatGPT, Google AI Overviews, and Perplexity.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Add target AI prompts
                </label>
                <textarea
                  rows={6}
                  value={promptsText}
                  onChange={(e) => setPromptsText(e.target.value)}
                  placeholder="best seo platforms for agencies&#10;top backlink checker software"
                  className="w-full p-3.5 border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:outline-hidden focus:border-[#2870ED]"
                />
              </div>
            </div>
          )}

          {/* ==================== STEP 5: Competitors ==================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Add Competitors</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Monitor up to 5 major competitors directly in ranking comparison and SERP features.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Competitor domains (one per line)
                </label>
                <textarea
                  rows={6}
                  value={competitorsText}
                  onChange={(e) => setCompetitorsText(e.target.value)}
                  placeholder="ahrefs.com&#10;semrush.com&#10;moz.com"
                  className="w-full p-3.5 border border-gray-300 rounded-lg text-xs text-gray-900 font-mono focus:outline-hidden focus:border-[#2870ED]"
                />
              </div>
            </div>
          )}

          {/* ==================== STEP 6: Statistics and Analytics services ==================== */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Connect Statistics and Analytics
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Synchronize Google Search Console and Google Analytics 4 to view real organic visits, impressions, and CTR.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#2870ED]" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Google Search Console</h4>
                      <p className="text-[11px] text-gray-500">Import clicks, CTR, and average positions</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConnectGSC(!connectGSC)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      connectGSC ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {connectGSC ? 'Connected' : 'Connect'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Google Analytics 4</h4>
                      <p className="text-[11px] text-gray-500">Track organic conversions, revenue, and traffic</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConnectGA(!connectGA)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      connectGA ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {connectGA ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Controls (Matching Screenshot 2) */}
        <div className="h-18 border-t border-gray-100 px-10 flex items-center justify-between bg-white select-none shrink-0">
          <div className="w-24">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                BACK
              </button>
            )}
          </div>

          {/* Stepper position indicator: 1 / 6 */}
          <div className="text-xs font-bold text-gray-400 tracking-widest">
            {currentStep} / 6
          </div>

          {/* Next Step / Finish Button */}
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C5ECC] text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-70"
          >
            {isSubmitting
              ? 'Creating...'
              : currentStep === 6
              ? 'Finish'
              : 'NEXT STEP'}
          </button>
        </div>
      </div>
    </div>
  );
}
