'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Monitor,
  Smartphone,
  MoreVertical,
  KeyRound,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import {
  GoogleIcon,
  ChatGptIcon,
  AiOverviewsIcon,
  AiModeIcon,
  GeminiIcon,
  PerplexityIcon,
  BingIcon,
  YahooIcon,
  YandexIcon,
  DuckDuckGoIcon,
  YouTubeIcon,
} from '@/components/ui/SearchEngineIcons';

const ADDITIONAL_ENGINES = [
  { id: 'gemini', label: 'Gemini', icon: GeminiIcon },
  { id: 'perplexity', label: 'Perplexity', icon: PerplexityIcon },
  { id: 'yahoo', label: 'Yahoo', icon: YahooIcon },
  { id: 'bing', label: 'Bing', icon: BingIcon },
  { id: 'duckduckgo', label: 'DuckDuckGo', icon: DuckDuckGoIcon },
  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { id: 'yandex', label: 'Yandex', icon: YandexIcon },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newProject?: any) => void;
}

import { getAllCountries, getCountryInfo } from '@/lib/countryUtils';
import { getAllLanguages } from '@/lib/languageUtils';

const POPULAR_COUNTRIES = [
  { name: 'India', code: 'in' },
  { name: 'India Hook, South Carolina, United States', code: 'us' },
  { name: 'India Urban, India', code: 'in' },
  { name: 'Indianapolis, Indiana, United States', code: 'us' },
  { name: 'Indian Orchard, Massachusetts, United States', code: 'us' },
  { name: 'Indian Head, Saskatchewan, Canada', code: 'ca' },
  { name: 'Indian Wells, California, United States', code: 'us' },
  ...getAllCountries().map((c) => ({
    name: c.name,
    code: c.flagCode,
  })),
];

const LANGUAGES = getAllLanguages().map((l) => l.name);

function hsvToHex(h: number, s: number, v: number): string {
  s = s / 100;
  v = v / 100;
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return (
    '#' +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (clean.length !== 6) return { h: 344, s: 100, v: 100 };
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

interface AuthenticColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

function AuthenticColorPicker({ color, onChange, onClose }: AuthenticColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const initialHsv = useMemo(() => hexToHsv(color), [color]);
  const [h, setH] = useState(initialHsv.h);
  const [s, setS] = useState(initialHsv.s);
  const [v, setV] = useState(initialHsv.v);
  const [hexInput, setHexInput] = useState(color.replace('#', '').toUpperCase());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Sync hex input when color prop changes
  useEffect(() => {
    setHexInput(color.replace('#', '').toUpperCase());
    const hsv = hexToHsv(color);
    setH(hsv.h);
    setS(hsv.s);
    setV(hsv.v);
  }, [color]);

  // 2D Canvas Drag Interaction
  const handleCanvasDrag = (e: MouseEvent | React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const newS = Math.round((x / rect.width) * 100);
    const newV = Math.round((1 - y / rect.height) * 100);
    setS(newS);
    setV(newV);
    const newHex = hsvToHex(h, newS, newV);
    setHexInput(newHex.replace('#', ''));
    onChange(newHex);
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleCanvasDrag(e);
    const onMouseMove = (moveEvent: MouseEvent) => handleCanvasDrag(moveEvent);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Hue Slider Drag Interaction
  const handleHueDrag = (e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const newH = Math.round((y / rect.height) * 360) % 360;
    setH(newH);
    const newHex = hsvToHex(newH, s, v);
    setHexInput(newHex.replace('#', ''));
    onChange(newHex);
  };

  const onHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleHueDrag(e);
    const onMouseMove = (moveEvent: MouseEvent) => handleHueDrag(moveEvent);
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleHexInputChange = (val: string) => {
    const clean = val.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
    setHexInput(clean);
    if (clean.length === 6) {
      const fullHex = '#' + clean;
      const hsv = hexToHsv(fullHex);
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
      onChange(fullHex);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl p-2.5 z-50 select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ width: '224px' }}
    >
      {/* 2D Canvas + Vertical Rainbow Hue Slider */}
      <div className="flex gap-2 mb-2.5">
        {/* 2D Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown}
          className="relative w-[172px] h-[132px] rounded-xs cursor-crosshair overflow-hidden shadow-inner"
          style={{
            backgroundColor: `hsl(${h}, 100%, 50%)`,
            backgroundImage: `
              linear-gradient(to top, #000 0%, transparent 100%),
              linear-gradient(to right, #fff 0%, transparent 100%)
            `,
          }}
        >
          {/* Pointer Dot */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${s}%`,
              top: `${100 - v}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* Rainbow Hue Bar */}
        <div
          ref={hueRef}
          onMouseDown={onHueMouseDown}
          className="relative w-3.5 h-[132px] rounded-xs cursor-pointer shadow-inner"
          style={{
            background:
              'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
        >
          {/* Slider Thumb Handle */}
          <div
            className="absolute left-0 right-0 h-1.5 bg-white border border-gray-500 rounded-xs shadow pointer-events-none -translate-y-1/2"
            style={{ top: `${(h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Bar: Swatch Preview Box + Hex Code Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <div
          className="w-12 h-6.5 rounded-xs border border-gray-300 shadow-inner shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex items-center flex-1 border border-gray-300 rounded px-2 py-1 bg-white focus-within:border-[#2870ED] focus-within:ring-1 focus-within:ring-[#2870ED]">
          <span className="text-gray-400 font-mono text-xs font-semibold mr-1 select-none">#</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInputChange(e.target.value)}
            maxLength={6}
            placeholder="FF0044"
            className="w-full text-xs font-mono font-bold text-gray-800 uppercase focus:outline-hidden tracking-wider"
          />
        </div>
      </div>
    </div>
  );
}

export function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const router = useRouter();
  const { refreshProjects, setActiveProject } = useApp();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Blue 6-step project wizard (Enabled when Advanced settings toggle is ON)
  const [advancedSettings, setAdvancedSettings] = useState(false);

  // Active Wizard Step: 1 to 6 (for advanced mode)
  const [currentStep, setCurrentStep] = useState(1);

  // Shared Form State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [domainType, setDomainType] = useState('*.domain/* (Recommended)');
  const [isDomainTypeOpen, setIsDomainTypeOpen] = useState(false);
  const [group, setGroup] = useState('No group selected');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupsList, setGroupsList] = useState<string[]>(['No group selected']);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [projectColor, setProjectColor] = useState('#FF0044');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorHue, setColorHue] = useState(90);
  const [access, setAccess] = useState('Only me');
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  // Search Engine & Tracking Options
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['google']);
  const [isMoreEnginesOpen, setIsMoreEnginesOpen] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [country, setCountry] = useState('India');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [language, setLanguage] = useState('English');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Keywords
  const [keywordsText, setKeywordsText] = useState('');

  // Additional settings toggles (Step 1 advanced)
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [websiteAudit, setWebsiteAudit] = useState(true);
  const [backlinkReport, setBacklinkReport] = useState(true);

  // Left sidebar status
  const [projectActive, setProjectActive] = useState(true);

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

  // Dynamic Real Keyword Suggestions based on Website URL
  const [suggestedKeywords, setSuggestedKeywords] = useState<{ keyword: string; vol: string | number }[]>([]);
  const [suggestionSearch, setSuggestionSearch] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    const clean = websiteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .trim();

    if (!clean || clean.length < 3) {
      setSuggestedKeywords([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(
          `/api/keywords/suggestions?domain=${encodeURIComponent(clean)}&country=${encodeURIComponent(
            country
          )}&lang=${encodeURIComponent(language)}`
        );
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          const mapped = data.suggestions.map((s: { keyword: string; volume: number }) => ({
            keyword: s.keyword,
            vol: s.volume,
          }));
          setSuggestedKeywords(mapped);

          // If textarea is currently empty, prefill top 5 seeds matching SE Ranking screenshot
          setKeywordsText((prev) => {
            if (!prev.trim() && mapped.length >= 3) {
              return mapped.slice(0, 5).map((m: { keyword: string }) => m.keyword).join('\n');
            }
            return prev;
          });
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [websiteUrl, country, language]);

  const filteredSuggestions = useMemo(() => {
    if (!suggestionSearch.trim()) return suggestedKeywords;
    const query = suggestionSearch.toLowerCase().trim();
    return suggestedKeywords.filter((s) => s.keyword.toLowerCase().includes(query));
  }, [suggestedKeywords, suggestionSearch]);

  // Keyword counts and lines
  const keywordLines = useMemo(() => {
    const list = keywordsText.split('\n');
    return list.length > 0 ? list : [''];
  }, [keywordsText]);

  const keywordCount = useMemo(() => {
    return keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0).length;
  }, [keywordsText]);

  const handleToggleKeyword = (kw: string) => {
    const lines = keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);
    const exists = lines.some((k) => k.toLowerCase() === kw.trim().toLowerCase());
    if (exists) {
      setKeywordsText(lines.filter((k) => k.toLowerCase() !== kw.trim().toLowerCase()).join('\n'));
    } else {
      setKeywordsText(lines.length > 0 ? `${keywordsText.trim()}\n${kw.trim()}` : kw.trim());
    }
  };

  const isKeywordSelected = (kw: string) => {
    return keywordsText
      .split('\n')
      .some((k) => k.trim().toLowerCase() === kw.trim().toLowerCase());
  };

  const handleAddAllSuggestions = () => {
    const existing = keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);
    const toAdd = suggestedKeywords
      .map((s) => s.keyword)
      .filter((k) => !existing.some((e) => e.toLowerCase() === k.toLowerCase()));
    if (toAdd.length > 0) {
      const merged = [...existing, ...toAdd].join('\n');
      setKeywordsText(merged);
    }
  };

  const toggleEngine = (id: string) => {
    if (selectedEngines.includes(id)) {
      if (selectedEngines.length > 1) {
        setSelectedEngines(selectedEngines.filter((e) => e !== id));
      }
    } else {
      setSelectedEngines([...selectedEngines, id]);
    }
  };

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
      await handleFinishProject();
    }
  };

  const handleFinishProject = async () => {
    if (!websiteUrl.trim()) {
      setError('Please specify the Website URL.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const cleanDomain = websiteUrl
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .trim();

    try {
      const cInfo = getCountryInfo(country);
      let payload: any = {};

      if (advancedSettings) {
        payload = {
          general: {
            websiteUrl: websiteUrl.trim(),
            projectName: projectName.trim() || cleanDomain,
            projectColor,
            weeklyReport,
            websiteAudit,
            backlinkReport,
          },
          searchEngines: selectedEngines.map((eng) => ({
            engine: eng,
            country: cInfo?.name || country || 'India',
            countryCode: cInfo?.flagCode || 'in',
            language: language || 'English',
            languageCode: 'en',
            device: 'desktop',
          })),
          keywords: keywordsText
            .split('\n')
            .map((k) => k.trim())
            .filter(Boolean)
            .map((kw) => ({ keyword: kw, group: 'General' })),
          competitors: competitorsText
            .split('\n')
            .map((c) => c.trim())
            .filter(Boolean)
            .map((domain) => ({ domain, name: domain })),
        };
      } else {
        payload = {
          name: projectName.trim() || cleanDomain,
          websiteUrl: websiteUrl.trim(),
          domain: cleanDomain,
          brandName: projectName.trim() || cleanDomain,
          color: projectColor,
          country: cInfo?.name || country || 'India',
          countryCode: cInfo?.flagCode || 'in',
          searchEngine: selectedEngines[0] || 'google',
          searchEngines: selectedEngines.map((eng) => ({
            engine: eng,
            country: cInfo?.name || country || 'India',
            countryCode: cInfo?.flagCode || 'in',
            language: language || 'English',
            device,
          })),
          language,
          device,
          weeklyReport,
          websiteAudit,
          backlinkReport,
          keywords: keywordsText
            .split('\n')
            .map((k) => k.trim())
            .filter(Boolean),
        };
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create project.');
        setIsSubmitting(false);
        return;
      }

      await refreshProjects();
      if (onCreated && data.project) {
        onCreated(data.project);
      }
      if (data.project) {
        setActiveProject(data.project);
      }
      onClose();
      router.push('/projects');
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while creating project.');
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
    '#2870ED', // SE Ranking Blue
    '#10B981', // Emerald Green
    '#F59E0B', // Amber Gold
    '#EF4444', // Coral Red
    '#8B5CF6', // Royal Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#64748B', // Slate
    '#1E293B', // Dark Navy
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-white text-gray-900 font-sans overflow-hidden animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* MODE 1: ADVANCED SETTINGS (6-Step Wizard matching Image 2)                */}
      {/* ========================================================================= */}
      {advancedSettings ? (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT BLUE SIDEBAR */}
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
                      {idx < stepsList.length - 1 && (
                        <div
                          className={`absolute left-[13px] top-[26px] w-[2px] h-[34px] ${
                            isPast ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      )}

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
                            : 'border border-white text-white'
                        }`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                      </div>

                      <span
                        onClick={() => {
                          if (websiteUrl.trim() || step.num === 1) {
                            setCurrentStep(step.num);
                          }
                        }}
                        className={`text-sm cursor-pointer transition-colors ${
                          isActive
                            ? 'font-semibold text-[#FFBC00]'
                            : isPast
                            ? 'text-white font-medium'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Card */}
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

          {/* RIGHT MAIN WIZARD AREA */}
          <div className="flex-1 flex flex-col bg-white overflow-y-auto">
            {/* Top Header Bar */}
            <div className="h-16 border-b border-gray-100 px-10 flex items-center justify-between select-none shrink-0 bg-white">
              <h2 className="text-base font-bold text-gray-900">
                {stepsList.find((s) => s.num === currentStep)?.title}
              </h2>

              <div className="flex items-center gap-8">
                {/* Advanced settings toggle */}
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => setAdvancedSettings(!advancedSettings)}
                >
                  <button
                    type="button"
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      advancedSettings ? 'bg-[#2870ED]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className="bg-white w-4 h-4 rounded-full shadow-md pointer-events-none"
                      style={{
                        transform: advancedSettings ? 'translateX(16px)' : 'translateX(0px)',
                        transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </button>
                  <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                    <span>Advanced settings</span>
                    <Info className="w-3.5 h-3.5 text-gray-400" />
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

              {/* STEP 1: General information */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Set up website</h3>
                    <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                      Track the ranking positions of your site in real time in all major search engines. You are free to customize the project parameter and position tracking settings according to your requirements
                    </p>
                  </div>

                  {/* Row 1: Website URL & Domain type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Website URL</label>
                        <span className="text-red-500 text-xs">*</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
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
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Domain type</label>
                        <span className="text-red-500 text-xs">*</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDomainTypeOpen(!isDomainTypeOpen)}
                        className="w-full px-3.5 py-2.5 bg-[#E9ECF0] hover:bg-[#DFE3E8] border border-gray-300 rounded-lg text-xs font-medium text-gray-900 flex items-center justify-between cursor-pointer focus:outline-hidden"
                      >
                        <span>{domainType}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDomainTypeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDomainTypeOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#E9ECF0] border border-gray-300 rounded-lg shadow-xl z-30 py-1 text-xs divide-y divide-gray-200/60 overflow-hidden">
                          {[
                            { label: '*.domain/* (Recommended)', value: '*.domain/* (Recommended)' },
                            { label: 'domain/*', value: 'domain/*' },
                            { label: 'domain/path/*', value: 'domain/path/*' },
                            { label: 'url', value: 'url' },
                          ].map((item) => (
                            <div
                              key={item.value}
                              onClick={() => {
                                setDomainType(item.value);
                                setIsDomainTypeOpen(false);
                              }}
                              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                                domainType === item.value
                                  ? 'bg-[#DDE2E8] font-bold text-gray-900'
                                  : 'hover:bg-[#DFE3E8] text-gray-800'
                              }`}
                            >
                              <span className="font-mono text-[12px]">{item.label}</span>
                              <div className="w-3.5 h-3.5 rounded-full border border-gray-400 flex items-center justify-center text-[9px] text-gray-600 font-serif">
                                i
                              </div>
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
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED] focus:ring-1 focus:ring-[#2870ED]"
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
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                      >
                        <span className="truncate">{group}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isGroupOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isGroupOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2 text-xs">
                          <input
                            type="text"
                            value={groupSearch}
                            onChange={(e) => setGroupSearch(e.target.value)}
                            placeholder="Search or add group..."
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg mb-2 text-xs focus:outline-hidden focus:border-[#2870ED]"
                          />
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {groupsList.map((g) => (
                              <div
                                key={g}
                                onClick={() => {
                                  setGroup(g);
                                  setIsGroupOpen(false);
                                }}
                                className="px-2.5 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer font-medium text-gray-800"
                              >
                                {g}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 relative">
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-xs font-semibold text-gray-700">Project color</label>
                        <Info className="w-3 h-3 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center p-1 cursor-pointer shadow-2xs hover:border-gray-400 transition-colors bg-white"
                        title="Choose project color"
                      >
                        <div
                          className="w-full h-full rounded-xs shadow-inner transition-colors"
                          style={{ backgroundColor: projectColor }}
                        />
                      </button>

                      {isColorPickerOpen && (
                        <AuthenticColorPicker
                          color={projectColor}
                          onChange={(newCol) => setProjectColor(newCol)}
                          onClose={() => setIsColorPickerOpen(false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Access to the project */}
                  <div className="max-w-md relative">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Access to the project</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAccessOpen(!isAccessOpen)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                    >
                      <span>{access}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAccessOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAccessOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 text-xs divide-y divide-gray-100">
                        {['Only me', 'All users in account', 'Specific clients / managers'].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => {
                              setAccess(opt);
                              setIsAccessOpen(false);
                            }}
                            className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer text-gray-800 font-medium"
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => alert('Add account feature: You can invite team members under Users & Permissions.')}
                      className="mt-2 text-xs font-semibold text-[#2870ED] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add account</span>
                    </button>
                  </div>

                  {/* Additional settings */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Additional settings</h4>
                      <p className="text-[11px] text-gray-500">Select additional options to enable for the project</p>
                    </div>

                    <div className="space-y-3">
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
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <span>Weekly report</span>
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

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
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <span>Website Audit</span>
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>

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
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <span>Backlink report</span>
                          <Info className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Search engines */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Search engines</h3>
                    <p className="text-xs text-gray-500">
                      Configure the search engines and target geographical regions you want to track for {websiteUrl || 'your website'}.
                    </p>
                  </div>

                  {/* Search Engine Selector */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-800">Tracked Search Engines</label>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {selectedEngines.length} selected
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Google */}
                      <button
                        type="button"
                        onClick={() => toggleEngine('google')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedEngines.includes('google')
                            ? 'border-[#2870ED] bg-white text-[#2870ED] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <GoogleIcon size={16} />
                        <span>Google</span>
                        {selectedEngines.includes('google') && <Check className="w-3.5 h-3.5 text-[#2870ED]" />}
                      </button>

                      {/* AI Overviews */}
                      <button
                        type="button"
                        onClick={() => toggleEngine('ai-overviews')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedEngines.includes('ai-overviews')
                            ? 'border-[#2870ED] bg-white text-[#2870ED] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <AiOverviewsIcon size={16} />
                        <span>AI Overviews</span>
                        {selectedEngines.includes('ai-overviews') && <Check className="w-3.5 h-3.5 text-[#2870ED]" />}
                      </button>

                      {/* AI Mode */}
                      <button
                        type="button"
                        onClick={() => toggleEngine('ai-mode')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedEngines.includes('ai-mode')
                            ? 'border-[#2870ED] bg-white text-[#2870ED] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <AiModeIcon size={16} />
                        <span>AI Mode</span>
                        {selectedEngines.includes('ai-mode') && <Check className="w-3.5 h-3.5 text-[#2870ED]" />}
                      </button>

                      {/* ChatGPT */}
                      <button
                        type="button"
                        onClick={() => toggleEngine('chatgpt')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedEngines.includes('chatgpt')
                            ? 'border-[#2870ED] bg-white text-[#2870ED] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <ChatGptIcon size={16} />
                        <span>ChatGPT</span>
                        {selectedEngines.includes('chatgpt') && <Check className="w-3.5 h-3.5 text-[#2870ED]" />}
                      </button>

                      {/* Extra active engines */}
                      {ADDITIONAL_ENGINES.filter((eng) => selectedEngines.includes(eng.id)).map((eng) => {
                        const IconComp = eng.icon;
                        return (
                          <button
                            key={eng.id}
                            type="button"
                            onClick={() => toggleEngine(eng.id)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#2870ED] bg-white text-[#2870ED] text-xs font-semibold cursor-pointer transition-all shadow-xs"
                          >
                            <IconComp size={16} />
                            <span>{eng.label}</span>
                            <X className="w-3.5 h-3.5 ml-0.5 text-gray-400 hover:text-red-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Country / Region</label>
                      <div className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg">
                        <CountryFlag countryName={country} size="sm" />
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="bg-transparent text-xs text-gray-900 flex-1 focus:outline-hidden cursor-pointer"
                        >
                          {POPULAR_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-hidden"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Keywords */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Keywords</h3>
                    <p className="text-xs text-gray-500">
                      Add keywords manually (one per line) or pick suggestions.
                    </p>
                  </div>

                  <textarea
                    rows={8}
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="Enter keywords, one per line..."
                    className="w-full p-4 border border-gray-300 rounded-xl text-xs text-gray-900 font-sans focus:outline-hidden focus:border-[#2870ED]"
                  />
                </div>
              )}

              {/* STEP 4: Prompts */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Prompts</h3>
                    <p className="text-xs text-gray-500">
                      Track your brand presence across ChatGPT, Gemini, Perplexity, and AI Overviews.
                    </p>
                  </div>

                  <textarea
                    rows={6}
                    value={promptsText}
                    onChange={(e) => setPromptsText(e.target.value)}
                    placeholder="e.g. What are the best tools for time tracking?&#10;Which software provides automated employee attendance?"
                    className="w-full p-4 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-[#2870ED]"
                  />
                </div>
              )}

              {/* STEP 5: Competitors */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Competitors</h3>
                    <p className="text-xs text-gray-500">
                      Add competitor domains to track side-by-side rankings.
                    </p>
                  </div>

                  <textarea
                    rows={6}
                    value={competitorsText}
                    onChange={(e) => setCompetitorsText(e.target.value)}
                    placeholder="e.g. semrush.com&#10;ahrefs.com&#10;moz.com"
                    className="w-full p-4 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-[#2870ED]"
                  />
                </div>
              )}

              {/* STEP 6: Analytics */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Statistics and Analytics services</h3>
                    <p className="text-xs text-gray-500">
                      Connect Google Search Console and Google Analytics 4.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-blue-500" />
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

            {/* Bottom Navigation Controls (Matching Image 2) */}
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

              <div className="text-xs font-bold text-gray-400 tracking-widest">
                {currentStep} / 6
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C5ECC] text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isSubmitting
                    ? 'Creating...'
                    : currentStep === 6
                    ? 'Finish'
                    : 'NEXT STEP'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: SIMPLE 1-PAGE CREATE PROJECT (Exact 1:1 Match to Image 1)         */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Top Header Bar */}
          <div className="h-16 border-b border-gray-100 px-8 sm:px-12 flex items-center justify-between select-none shrink-0 bg-white">
            <h2 className="text-base font-bold text-gray-900">
              Create project
            </h2>

            <div className="flex items-center gap-8">
              {/* Advanced settings toggle */}
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setAdvancedSettings(!advancedSettings)}
              >
                <button
                  type="button"
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    advancedSettings ? 'bg-[#2870ED]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className="bg-white w-4 h-4 rounded-full shadow-md pointer-events-none"
                    style={{
                      transform: advancedSettings ? 'translateX(16px)' : 'translateX(0px)',
                      transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </button>
                <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                  <span>Advanced settings</span>
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>

              {/* ESC Close button */}
              <button
                onClick={onClose}
                className="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  ESC
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-8 sm:px-12 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* SECTION 1: Website URL */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Website URL</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Either enter a website address or the URL of the video or a YouTube channel
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Domain/URL</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={websiteUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWebsiteUrl(val);
                        const clean = val
                          .replace(/^https?:\/\//i, '')
                          .replace(/^www\./i, '')
                          .replace(/\/.*$/, '')
                          .trim();
                        setProjectName(clean);
                      }}
                      placeholder="Enter domain or URL"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED] focus:ring-1 focus:ring-[#2870ED]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Project name (optional)</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED] focus:ring-1 focus:ring-[#2870ED]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Search engine */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Search engine</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Track website and brand rankings on classic and AI search engines in any region. Add more search engines, enable Google Maps results, and customize keyword lists in Advanced settings (toggle at the top)
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Search engine</label>
                    <Info className="w-3 h-3 text-gray-400" />
                  </div>

                  {/* Search Engine Pills matching Screenshot 1 */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('google')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        selectedEngines.includes('google')
                          ? 'border-[#2870ED] bg-blue-50/50 text-[#2870ED]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <GoogleIcon size={16} />
                      <span>Google</span>
                    </button>

                    {/* AI Overviews */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('ai-overviews')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        selectedEngines.includes('ai-overviews')
                          ? 'border-[#2870ED] bg-blue-50/50 text-[#2870ED]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <AiOverviewsIcon size={16} />
                      <span>AI Overviews</span>
                    </button>

                    {/* AI Mode */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('ai-mode')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        selectedEngines.includes('ai-mode')
                          ? 'border-[#2870ED] bg-blue-50/50 text-[#2870ED]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <AiModeIcon size={16} />
                      <span>AI Mode</span>
                    </button>

                    {/* ChatGPT */}
                    <button
                      type="button"
                      onClick={() => toggleEngine('chatgpt')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        selectedEngines.includes('chatgpt')
                          ? 'border-[#2870ED] bg-blue-50/50 text-[#2870ED]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ChatGptIcon size={16} />
                      <span>ChatGPT</span>
                    </button>

                    {/* Additional selected engines */}
                    {ADDITIONAL_ENGINES.filter((eng) => selectedEngines.includes(eng.id)).map((eng) => {
                      const IconComp = eng.icon;
                      return (
                        <button
                          key={eng.id}
                          type="button"
                          onClick={() => toggleEngine(eng.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2870ED] bg-blue-50/50 text-[#2870ED] text-xs font-medium cursor-pointer transition-colors"
                        >
                          <IconComp size={16} />
                          <span>{eng.label}</span>
                          <X className="w-3 h-3 ml-0.5 text-gray-400 hover:text-red-500" />
                        </button>
                      );
                    })}

                    {/* More icon dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMoreEnginesOpen(!isMoreEnginesOpen)}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 cursor-pointer flex items-center justify-center transition-colors"
                        title="More search engines"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {isMoreEnginesOpen && (
                        <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 animate-in fade-in duration-100">
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            More Search Engines
                          </div>
                          {ADDITIONAL_ENGINES.map((eng) => {
                            const IconComp = eng.icon;
                            const isSelected = selectedEngines.includes(eng.id);
                            return (
                              <button
                                key={eng.id}
                                type="button"
                                onClick={() => {
                                  toggleEngine(eng.id);
                                  setIsMoreEnginesOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 text-left cursor-pointer transition-colors"
                              >
                                <span className="flex items-center gap-2">
                                  <IconComp size={15} />
                                  <span>{eng.label}</span>
                                </span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2870ED]" />}
                                  <Info className="w-3 h-3 text-gray-400" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-[1px] bg-gray-200 mx-1" />

                    {/* Device toggles: Desktop / Mobile */}
                    <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50/60">
                      <button
                        type="button"
                        onClick={() => setDevice('desktop')}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                          device === 'desktop'
                            ? 'bg-white shadow-2xs text-[#2870ED]'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        title="Desktop"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDevice('mobile')}
                        className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                          device === 'mobile'
                            ? 'bg-white shadow-2xs text-[#2870ED]'
                            : 'text-gray-400 hover:text-gray-700'
                        }`}
                        title="Mobile"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location & Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Selector */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Location</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                    >
                      <div className="flex items-center gap-2">
                        {country && country !== 'Enter country, city or postal code' ? (
                          <>
                            <CountryFlag countryName={country} size="sm" />
                            <span className="font-medium text-gray-900">{country}</span>
                          </>
                        ) : (
                          <span className="text-gray-700">Enter country, city or postal code</span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLocationOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2 text-xs">
                        <div className="relative mb-2">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            placeholder="Enter country, city or postal code"
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-[#2870ED]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-0.5">
                          {POPULAR_COUNTRIES.filter((c) =>
                            c.name.toLowerCase().includes(locationSearch.toLowerCase())
                          ).map((c, i) => (
                            <div
                              key={`${c.code}-${i}`}
                              onClick={() => {
                                setCountry(c.name);
                                setIsLocationOpen(false);
                                setLocationSearch('');
                              }}
                              className="px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-800 text-xs"
                            >
                              <CountryFlag countryName={c.name} size="sm" />
                              <span className="font-medium truncate">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Language Selector */}
                  <div className="relative">
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Google interface language</label>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden"
                    >
                      <span className="font-medium text-gray-900">{language}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLanguageOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 text-xs divide-y divide-gray-100 max-h-48 overflow-y-auto">
                        {LANGUAGES.map((lang) => (
                          <div
                            key={lang}
                            onClick={() => {
                              setLanguage(lang);
                              setIsLanguageOpen(false);
                            }}
                            className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer text-gray-800 font-medium"
                          >
                            {lang}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Keywords */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Keywords</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add keywords manually or copy and paste them below from a text editor.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Numbered lines keywords textarea */}
                  <div>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#2870ED] focus-within:ring-1 focus-within:ring-[#2870ED] bg-white min-h-[240px]">
                      {/* Line numbers gutter */}
                      <div className="bg-gray-50 border-r border-gray-200 py-3 px-2 text-right select-none text-[11px] font-mono text-gray-400 w-8 shrink-0 space-y-1">
                        {keywordLines.map((_, i) => (
                          <div key={i} className="leading-[18px]">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      {/* Textarea */}
                      <textarea
                        value={keywordsText}
                        onChange={(e) => setKeywordsText(e.target.value)}
                        placeholder="Enter keywords"
                        className="flex-1 p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden resize-none font-sans leading-[18px] min-h-[240px]"
                      />
                    </div>
                  </div>

                  {/* Right: Keyword suggestions box (Exact match to official SE Ranking screenshot) */}
                  <div className="border border-gray-200 rounded-lg bg-[#FAFBFD] p-4 flex flex-col min-h-[240px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>Keyword suggestions</span>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      {websiteUrl.trim() && suggestedKeywords.length > 0 && (
                        <button
                          type="button"
                          onClick={handleAddAllSuggestions}
                          className="text-[11px] font-bold text-[#0B69FF] hover:underline cursor-pointer"
                        >
                          + Add all
                        </button>
                      )}
                    </div>

                    {/* Domain + Engine + Country Pill */}
                    <div className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs flex items-center justify-between shadow-2xs mb-2">
                      <span className="font-semibold text-gray-800 truncate">
                        {websiteUrl.trim() || 'teams.com'}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <GoogleIcon size={15} />
                        <CountryFlag countryName={country || 'India'} size="xs" />
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>

                    {/* Suggestions search bar */}
                    <div className="relative mb-2">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={suggestionSearch}
                        onChange={(e) => setSuggestionSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#2870ED]"
                      />
                    </div>

                    {/* Checkbox keyword list */}
                    {!websiteUrl.trim() && suggestedKeywords.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <Search className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                          Suggested keywords will appear after you enter website URL
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto max-h-[160px] border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
                        {isLoadingSuggestions && suggestedKeywords.length === 0 ? (
                          <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2870ED]" />
                            <span>Loading suggestions...</span>
                          </div>
                        ) : filteredSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">
                            No suggestions found
                          </div>
                        ) : (
                          filteredSuggestions.map((sug, idx) => {
                            const checked = isKeywordSelected(sug.keyword);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleToggleKeyword(sug.keyword)}
                                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs transition-colors select-none"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {}}
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#2870ED] focus:ring-0 cursor-pointer accent-[#2870ED]"
                                  />
                                  <span
                                    className={`truncate ${
                                      checked ? 'font-medium text-gray-900' : 'text-gray-700'
                                    }`}
                                  >
                                    {sug.keyword}
                                  </span>
                                </div>
                                <span className="text-[11px] text-gray-400 font-mono shrink-0">
                                  {sug.vol}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Keyword limits summary footer matching screenshot 4 */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 pt-2 select-none">
                  <div>
                    <span>{keywordCount} of 750 remaining keywords limits will be used</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9E6] border border-[#FFE8A3] text-[#B45309] font-medium text-[11px]">
                    <KeyRound className="w-3 h-3 text-[#D97706]" />
                    <span>Keyword limits {keywordCount} / 750</span>
                    <Info className="w-3 h-3 text-[#D97706]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar (Matching Image 1) */}
          <div className="border-t border-gray-100 px-8 sm:px-12 py-4 flex items-center justify-between bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded text-xs font-bold text-gray-700 uppercase tracking-wider transition-colors cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleFinishProject}
              disabled={isSubmitting || !websiteUrl.trim()}
              className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C5ECC] text-white rounded font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>START TRACKING</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
