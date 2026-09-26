'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Info,
  HelpCircle,
  Upload,
  RotateCcw,
  Check,
  ExternalLink,
  Lock,
  Globe,
  Palette,
  Layout,
  Sliders,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
} from 'lucide-react';

type AgencyViewTab = 'lead-generator' | 'interface-customization' | 'personal-domain-names';

interface LeadWidget {
  id: string;
  name: string;
  targetDomain: string;
  created: string;
  leadsCount: number;
  status: 'Active' | 'Paused';
}

export default function AgencyPackPage() {
  const [activeTab, setActiveTab] = useState<AgencyViewTab>('lead-generator');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Lead Generator State
  const [widgets, setWidgets] = useState<LeadWidget[]>([]);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [newWidgetName, setNewWidgetName] = useState('');
  const [newWidgetDomain, setNewWidgetDomain] = useState('zohosocial.com');
  const [newWidgetTitle, setNewWidgetTitle] = useState('Free SEO Audit Widget');

  // Interface Customization State (Screenshot 3)
  const [headerName, setHeaderName] = useState('SE Ranking');
  const [companyName, setCompanyName] = useState('SE Ranking');
  const [selectedColor, setSelectedColor] = useState('#1976D2');
  const [customColor, setCustomColor] = useState('#1976D2');
  const [footerName, setFooterName] = useState('SE Ranking');
  const [showFooterLinks, setShowFooterLinks] = useState(true);
  const [useCustomLinks, setUseCustomLinks] = useState(false);
  const [customLinks, setCustomLinks] = useState([
    { id: 'l1', label: 'Report a bug', url: 'https://help.seranking.com' },
    { id: 'l2', label: 'Affiliates', url: 'https://seranking.com/affiliate.html' },
    { id: 'l3', label: 'API', url: 'https://seranking.com/api.html' },
    { id: 'l4', label: "What's new", url: 'https://seranking.com/whats-new.html' },
    { id: 'l5', label: 'Help', url: 'https://help.seranking.com' },
  ]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Personal Domain Names State (Screenshot 4)
  const [domainInput, setDomainInput] = useState('');
  const [isSslActive, setIsSslActive] = useState(false);
  const [sslVerifying, setSslVerifying] = useState(false);

  // System Colors (8 swatches from Screenshot 3)
  const systemColors = [
    '#1976D2', // Royal Blue
    '#0D47A1', // Deep Navy
    '#FFA000', // Amber Gold
    '#7B1FA2', // Purple
    '#D32F2F', // Red
    '#37474F', // Slate Gray
    '#388E3C', // Green
    '#00897B', // Teal
  ];

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetName.trim()) return;

    const newW: LeadWidget = {
      id: `w-${Date.now()}`,
      name: newWidgetName.trim(),
      targetDomain: newWidgetDomain.trim() || 'zohosocial.com',
      created: 'Sep 26, 2026',
      leadsCount: 0,
      status: 'Active',
    };

    setWidgets([...widgets, newW]);
    setNewWidgetName('');
    setIsAddWidgetModalOpen(false);
  };

  const handleApplyInterfaceChanges = () => {
    setSaveSuccessMessage('Interface settings successfully applied!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleResetInterfaceSettings = () => {
    setHeaderName('SE Ranking');
    setCompanyName('SE Ranking');
    setSelectedColor('#1976D2');
    setCustomColor('#1976D2');
    setFooterName('SE Ranking');
    setShowFooterLinks(true);
    setUseCustomLinks(false);
    setSaveSuccessMessage('Settings reset to default values.');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleActivateSsl = () => {
    if (!domainInput.trim()) return;
    setSslVerifying(true);
    setTimeout(() => {
      setSslVerifying(false);
      setIsSslActive(true);
      setSaveSuccessMessage(`SSL Certificate issued and active for ${domainInput.trim()}!`);
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    }, 1500);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      setIsFeedbackOpen(false);
    }, 1800);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 flex flex-col justify-between font-sans">
      <div>
        {/* Top Green Trial Banner (Matching Screenshot 1, 2, 3, 4) */}
        <div className="bg-[#10B981] px-4 py-2 text-white flex items-center justify-between text-xs select-none shadow-2xs">
          <div className="flex items-center gap-2">
            <span>You have 11 days of free trial left.</span>
            <span className="opacity-90 hidden sm:inline">
              Choose your preferred subscription plan to unlock all features.
            </span>
          </div>
          <button
            onClick={() => alert('Opening pricing plans...')}
            className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-900 rounded font-bold text-[11px] uppercase transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            SEE PRICING PLANS
          </button>
        </div>

        {/* Agency Navigation Tabs Bar (Enables effortless switching between Screenshot 1, 3, 4) */}
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('lead-generator')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'lead-generator'
                  ? 'bg-[#0B69FF] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Lead Generator
            </button>
            <button
              onClick={() => setActiveTab('interface-customization')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'interface-customization'
                  ? 'bg-[#0B69FF] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Interface Customization
            </button>
            <button
              onClick={() => setActiveTab('personal-domain-names')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'personal-domain-names'
                  ? 'bg-[#0B69FF] text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Personal Domain Names
            </button>
          </div>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="text-xs text-gray-500 hover:text-[#0B69FF] font-medium cursor-pointer transition-colors"
          >
            Feedback
          </button>
        </div>

        {/* Success Alert Toast */}
        {saveSuccessMessage && (
          <div className="max-w-4xl mx-auto px-6 pt-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2 shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMessage}</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: LEAD GENERATOR (Exact Match to Screenshot 1) */}
        {/* ============================================================== */}
        {activeTab === 'lead-generator' && (
          <div>
            {/* Sub-header Bar (Screenshot 1) */}
            <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between">
              <div className="text-xs font-medium text-gray-600">Lead Generator</div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-xs text-gray-500 hover:text-blue-600 font-medium cursor-pointer"
                >
                  Feedback
                </button>
                <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 rounded-md text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Account limits (daily): {widgets.length} / 5</span>
                  <Info className="w-3 h-3 text-[#B45309] cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Main Center Area */}
            <div className="p-6 max-w-5xl mx-auto min-h-[550px] flex flex-col items-center justify-center text-center">
              {widgets.length === 0 ? (
                <div className="space-y-4 max-w-md flex flex-col items-center">
                  {/* Clean SVG Vector Illustration matching Screenshot 1 (Person with laptop & floating charts) */}
                  <div className="relative w-56 h-48 flex items-center justify-center">
                    <svg viewBox="0 0 240 200" className="w-full h-full">
                      {/* Background floating charts */}
                      <g opacity="0.9">
                        {/* Left floating card with chart */}
                        <rect x="25" y="40" width="60" height="50" rx="6" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
                        <path d="M35 75 Q 50 50, 75 60" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="3" fill="#22C55E" />
                        <circle cx="75" cy="60" r="3" fill="#22C55E" />

                        {/* Right floating card with bar chart */}
                        <rect x="155" y="40" width="60" height="50" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
                        <rect x="165" y="65" width="7" height="15" fill="#3B82F6" rx="2" />
                        <rect x="176" y="55" width="7" height="25" fill="#3B82F6" rx="2" />
                        <rect x="187" y="50" width="7" height="30" fill="#3B82F6" rx="2" />
                        <rect x="198" y="60" width="7" height="20" fill="#3B82F6" rx="2" />

                        {/* Floating circle badge */}
                        <circle cx="120" cy="30" r="14" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1.5" />
                        <path d="M115 30 L119 34 L126 26" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      {/* Person illustration */}
                      <g>
                        {/* Body / Torso (Teal shirt) */}
                        <path d="M100 100 Q 120 90, 140 100 L145 130 L95 130 Z" fill="#0D9488" />
                        {/* Head & Hair (Black hair, skin tone) */}
                        <circle cx="120" cy="72" r="12" fill="#FCD34D" />
                        <path d="M110 70 Q 120 58, 130 70 Q 120 62, 110 70 Z" fill="#1E293B" />
                        <path d="M108 72 Q 106 82, 112 85" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                        <path d="M132 72 Q 134 82, 128 85" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

                        {/* Legs (Purple trousers) */}
                        <path d="M96 130 L80 165 L95 168 L110 135 Z" fill="#6366F1" />
                        <path d="M144 130 L160 165 L145 168 L130 135 Z" fill="#6366F1" />

                        {/* Shoes */}
                        <ellipse cx="85" cy="168" rx="8" ry="4" fill="#1E293B" />
                        <ellipse cx="155" cy="168" rx="8" ry="4" fill="#1E293B" />

                        {/* Laptop (White/gray tilted laptop) */}
                        <rect x="105" y="115" width="30" height="18" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                        <path d="M102 133 L138 133" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>

                  <h2 className="text-base font-bold text-gray-900">Lead Generator</h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    You haven&apos;t added any widgets yet. Create your first widget to get started.
                  </p>

                  {/* Green ADD WIDGET Button (Screenshot 1) */}
                  <button
                    onClick={() => setIsAddWidgetModalOpen(true)}
                    className="mt-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                  >
                    ADD WIDGET
                  </button>
                </div>
              ) : (
                /* Dynamic Widgets Table when created */
                <div className="w-full bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden text-left">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Active Lead Widgets</h3>
                      <p className="text-xs text-gray-500">Embedded widgets capturing client leads</p>
                    </div>
                    <button
                      onClick={() => setIsAddWidgetModalOpen(true)}
                      className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Widget</span>
                    </button>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Widget Name</th>
                        <th className="px-4 py-3">Target Domain</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Leads Captured</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Embed Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {widgets.map((w) => (
                        <tr key={w.id} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3 font-semibold text-gray-900">{w.name}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-gray-600">
                            {w.targetDomain}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{w.created}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">{w.leadsCount}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {w.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `<script src="https://online.seranking.com/lead-widget.js" data-widget-id="${w.id}"></script>`
                                );
                                alert('Embed script copied to clipboard!');
                              }}
                              className="text-xs text-[#0B69FF] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              Copy Code
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INTERFACE CUSTOMIZATION (Exact Match to Screenshot 3) */}
        {/* ============================================================== */}
        {activeTab === 'interface-customization' && (
          <div>
            {/* Sub-header Bar (Screenshot 3) */}
            <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="hover:text-gray-900 cursor-pointer">Settings</span>
                <span>›</span>
                <span className="hover:text-gray-900 cursor-pointer">White Label</span>
                <span>›</span>
                <span className="text-gray-900 font-medium">Interface customization</span>
              </div>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-xs text-gray-500 hover:text-blue-600 font-medium cursor-pointer"
              >
                Feedback
              </button>
            </div>

            {/* Main Form Area */}
            <div className="p-6 max-w-4xl mx-auto space-y-8">
              <div>
                <h1 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  Interface customization
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </h1>
              </div>

              {/* 1. HEADER SETTINGS */}
              <div className="space-y-4">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  HEADER SETTINGS
                </div>

                {/* Header name */}
                <div className="space-y-1">
                  <label className="block text-xs text-gray-600 font-medium">Header name:</label>
                  <input
                    type="text"
                    value={headerName}
                    onChange={(e) => setHeaderName(e.target.value)}
                    className="max-w-md w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Header logo */}
                <div className="space-y-1">
                  <label className="block text-xs text-gray-600 font-medium">Header logo:</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 bg-white border border-gray-200 rounded-md flex items-center justify-center p-2 shadow-2xs">
                      <span className="text-xs font-black text-gray-800 tracking-tighter">
                        {headerName || 'SE Ranking'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => alert('Select an image file (JPEG, PNG, WEBP, GIF < 100KB)')}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                        <span>UPDATE LOGO</span>
                      </button>
                      <p className="text-[10px] text-gray-400 italic">
                        Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company name */}
                <div className="space-y-1">
                  <label className="block text-xs text-gray-600 font-medium">Company name:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="max-w-md w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 2. UI COLOR SCHEME */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  UI COLOR SCHEME
                </div>

                {/* System colors swatches */}
                <div className="space-y-1.5">
                  <label className="block text-xs text-gray-600 font-medium">System colors</label>
                  <div className="flex items-center gap-2">
                    {systemColors.map((hex) => {
                      const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                      return (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => {
                            setSelectedColor(hex);
                            setCustomColor(hex);
                          }}
                          className={`w-7 h-7 rounded-[4px] cursor-pointer transition-transform ${
                            isSelected ? 'ring-2 ring-offset-2 ring-gray-900 scale-105' : 'hover:opacity-90'
                          }`}
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Custom color input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs text-gray-600 font-medium">Custom color</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-[3px] border border-gray-300 shrink-0"
                      style={{ backgroundColor: customColor }}
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedColor(e.target.value);
                      }}
                      className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. FOOTER SETTINGS */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  FOOTER SETTINGS
                </div>

                {/* Footer logo */}
                <div className="space-y-1">
                  <label className="block text-xs text-gray-600 font-medium">Footer logo:</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-14 bg-white border border-gray-200 rounded-md flex items-center justify-center p-2 shadow-2xs">
                      {/* Black SE Ranking mark */}
                      <span className="w-6 h-6 rounded bg-gray-900 text-white flex items-center justify-center text-xs font-black">
                        S
                      </span>
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => alert('Select a footer logo image')}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                        <span>UPDATE LOGO</span>
                      </button>
                      <p className="text-[10px] text-gray-400 italic">
                        Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer name */}
                <div className="space-y-1">
                  <label className="block text-xs text-gray-600 font-medium">Footer name:</label>
                  <input
                    type="text"
                    value={footerName}
                    onChange={(e) => setFooterName(e.target.value)}
                    className="max-w-md w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-8 pt-2 text-xs">
                  {/* Show footer links */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Show footer links:</span>
                    <button
                      type="button"
                      onClick={() => setShowFooterLinks(!showFooterLinks)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        showFooterLinks ? 'bg-[#0B69FF]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          showFooterLinks ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="font-semibold text-gray-800">{showFooterLinks ? 'On' : 'Off'}</span>
                  </div>

                  {/* Use custom links */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 flex items-center gap-1">
                      Use custom links:
                      <Info className="w-3 h-3 text-gray-400 cursor-pointer" />
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCustomLinks(!useCustomLinks)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        useCustomLinks ? 'bg-[#0B69FF]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          useCustomLinks ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="font-semibold text-gray-800">{useCustomLinks ? 'On' : 'Off'}</span>
                  </div>
                </div>

                {/* 5 Custom Link Input Rows */}
                <div className="space-y-3 pt-3">
                  {customLinks.map((link, idx) => (
                    <div key={link.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-0.5">
                          Text shown for the link:
                        </label>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => {
                            const updated = [...customLinks];
                            updated[idx].label = e.target.value;
                            setCustomLinks(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-500 mb-0.5">
                          Where should the link go:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...customLinks];
                              updated[idx].url = e.target.value;
                              setCustomLinks(updated);
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs pr-7 text-gray-600 font-mono text-[11px]"
                          />
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500 absolute right-2.5 top-2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FAVICON */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  FAVICON
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-white border border-gray-300 flex items-center justify-center p-1 shadow-2xs">
                    <span className="w-4 h-4 rounded bg-[#0B69FF] text-white flex items-center justify-center text-[9px] font-black">
                      S
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => alert('Select a 16x16 to 48x48 icon file')}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3 h-3 text-gray-500" />
                      <span>UPDATE LOGO</span>
                    </button>
                    <p className="text-[10px] text-gray-400 italic">
                      Must be ICO, PNG, or GIF/16x16 px to 48x48 px
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Screenshot 3) */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleResetInterfaceSettings}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
                >
                  RESET SETTINGS
                </button>
                <button
                  type="button"
                  onClick={handleApplyInterfaceChanges}
                  className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>APPLY CHANGES</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: PERSONAL DOMAIN NAMES (Exact Match to Screenshot 4) */}
        {/* ============================================================== */}
        {activeTab === 'personal-domain-names' && (
          <div>
            {/* Sub-header Bar (Screenshot 4) */}
            <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="hover:text-gray-900 cursor-pointer">Settings</span>
                <span>›</span>
                <span className="hover:text-gray-900 cursor-pointer">White Label</span>
                <span>›</span>
                <span className="text-gray-900 font-medium">Personal domain names</span>
              </div>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-xs text-gray-500 hover:text-blue-600 font-medium cursor-pointer"
              >
                Feedback
              </button>
            </div>

            {/* Main Content Area */}
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <h1 className="text-base font-bold text-gray-900">Personal domain names</h1>

              <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                You can personalise the domain name you use to access the SE Ranking platform by adding your own brand to it (<strong>yourbrand.online.seranking.com</strong>). Another option is to set up access to the platform under your own domain name with no mention of SE Ranking—you won&apos;t have to set up anything on your server. Whichever option you choose, you can get a free SSL certificate to protect your White Label SEO platform.
              </p>

              {/* Domain Input Section Box */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="font-bold text-xs text-gray-800">
                  Personal domain name of your company:
                </div>
                <p className="text-[11.5px] text-gray-500 leading-relaxed max-w-2xl">
                  To access the platform with no mention of SE Ranking in the URL, use your own domain name. Go to the DNS settings of your domain and create a CNAME record with the <code>online.seranking.com</code> value. Then, enter your domain name here without specifying http:// or www. For example, <code>top.richweb.org</code>.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl pt-1">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g. seo.myagency.com"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={!domainInput.trim() || sslVerifying}
                    onClick={handleActivateSsl}
                    className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs ${
                      domainInput.trim()
                        ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                        : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {sslVerifying ? 'VERIFYING DNS...' : 'ACTIVATE SSL CERTIFICATE'}
                  </button>
                </div>

                {isSslActive && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 max-w-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SSL Certificate is active and HTTPS is enforced for <strong>{domainInput}</strong>.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Screenshot 4) */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setDomainInput('');
                    setIsSslActive(false);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
                >
                  RESET SETTINGS
                </button>
                <button
                  type="button"
                  disabled={!domainInput.trim()}
                  onClick={() => {
                    setSaveSuccessMessage('Domain settings saved successfully!');
                    setTimeout(() => setSaveSuccessMessage(null), 3000);
                  }}
                  className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                    domainInput.trim()
                      ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>APPLY CHANGES</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Matching Screenshot 1, 3, 4 */}
      <footer className="mt-12 py-5 px-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[13px]">
            <span className="w-4 h-4 rounded bg-[#0B69FF] flex items-center justify-center text-white text-[10px] font-black">
              S
            </span>
            <span>SE Ranking</span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-500 text-[11.5px]">
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Report a bug
          </a>
          <a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Affiliates
          </a>
          <Link href="/api-docs" className="hover:text-gray-900 transition-colors">
            API
          </Link>
          <a href="https://seranking.com/blog/whats-new/" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            What&apos;s new
          </a>
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Help
          </a>
        </div>
      </footer>

      {/* Add Lead Widget Modal */}
      {isAddWidgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Create New Lead Generator Widget
              </h3>
              <button
                onClick={() => setIsAddWidgetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWidget} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Widget Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free On-Page Audit Form"
                  value={newWidgetName}
                  onChange={(e) => setNewWidgetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Connected Project Domain</label>
                <input
                  type="text"
                  required
                  value={newWidgetDomain}
                  onChange={(e) => setNewWidgetDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Call to Action Heading</label>
                <input
                  type="text"
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] leading-relaxed">
                🎯 When visitors enter their URL and email on your website, SE Ranking will automatically generate an audit report and email it to them with your agency branding.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWidgetModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Create Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0B69FF]" />
                Send Feedback
              </h3>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {feedbackSent ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-gray-900">Thank you!</div>
                <div className="text-xs text-gray-500">Your feedback has been submitted.</div>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="p-5 space-y-3">
                <p className="text-xs text-gray-600">
                  Have feedback about Agency Pack features?
                </p>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3.5 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Submit
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
