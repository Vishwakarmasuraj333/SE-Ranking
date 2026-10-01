'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Upload,
  Check,
  Info,
  ChevronDown,
  Building2,
  Plus,
  ShieldCheck,
  ExternalLink,
  Code2,
  Trash2,
  Search,
  Users,
  Eye,
  FileText,
  Mail,
  Sliders,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

export type AgencyViewTab =
  | 'interface-customization'
  | 'personal-domain-names'
  | 'login-page'
  | 'email-settings'
  | 'report-builder'
  | 'lead-generator'
  | 'lead-widgets'
  | 'users';

interface LeadWidget {
  id: string;
  name: string;
  type: 'Button' | 'Pop-up' | 'Push notification' | 'Webform' | 'Modal window';
  targetDomain: string;
  created: string;
  leadsCount: number;
  status: 'Active' | 'Paused';
}

interface UserSeat {
  id: string;
  index: number;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Analyst' | 'Viewer';
}

function AgencyPackContent({ initialTab = 'login-page' }: { initialTab?: AgencyViewTab }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams ? (searchParams.get('tab') as AgencyViewTab) : null;
  const [activeTab, setActiveTab] = useState<AgencyViewTab>(tabParam || initialTab);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Modal states
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // TAB 1: LOGIN PAGE STATE (Screenshots 1 & 2)
  // ==========================================
  const [loginLogoUrl, setLoginLogoUrl] = useState<string | null>(null);
  const [showCompanyNameOnLogin, setShowCompanyNameOnLogin] = useState(true);
  const [loginColorScheme, setLoginColorScheme] = useState<'dark' | 'light'>('dark');
  const [showLiveHelpWidgets, setShowLiveHelpWidgets] = useState(true);
  const [loginPageLanguage, setLoginPageLanguage] = useState('English');
  const [isLoginModified, setIsLoginModified] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024) {
        alert('File size exceeds 100KB limit.');
        return;
      }
      const url = URL.createObjectURL(file);
      setLoginLogoUrl(url);
      setIsLoginModified(true);
      showToast('Logo preview updated. Click Apply Changes to save.');
    }
  };

  const handleResetLoginSettings = () => {
    setLoginLogoUrl(null);
    setShowCompanyNameOnLogin(true);
    setLoginColorScheme('dark');
    setShowLiveHelpWidgets(true);
    setLoginPageLanguage('English');
    setIsLoginModified(false);
    showToast('Login page settings reset to default.');
  };

  const handleApplyLoginChanges = () => {
    setIsLoginModified(false);
    showToast('Login page settings successfully applied!');
  };

  // ==========================================
  // TAB 2: INTERFACE CUSTOMIZATION STATE
  // ==========================================
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
  const [isInterfaceModified, setIsInterfaceModified] = useState(false);

  const systemColors = [
    '#1976D2',
    '#0D47A1',
    '#FFA000',
    '#7B1FA2',
    '#D32F2F',
    '#37474F',
    '#388E3C',
    '#00897B',
  ];

  // ==========================================
  // TAB 3: PERSONAL DOMAIN NAMES STATE
  // ==========================================
  const [domainInput, setDomainInput] = useState('');
  const [isSslActive, setIsSslActive] = useState(false);
  const [sslVerifying, setSslVerifying] = useState(false);

  const handleActivateSsl = () => {
    if (!domainInput.trim()) return;
    setSslVerifying(true);
    setTimeout(() => {
      setSslVerifying(false);
      setIsSslActive(true);
      showToast(`SSL Certificate issued and active for ${domainInput.trim()}!`);
    }, 1200);
  };

  // ==========================================
  // TAB 4: EMAIL SETTINGS STATE
  // ==========================================
  const [useCustomEmailTemplate, setUseCustomEmailTemplate] = useState(false);
  const [smtpHost, setSmtpHost] = useState('smtp.myagency.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSenderEmail, setSmtpSenderEmail] = useState('reports@myagency.com');
  const [smtpSenderName, setSmtpSenderName] = useState('SEO Agency Reports');
  const [smtpAuth, setSmtpAuth] = useState(true);
  const [isEmailModified, setIsEmailModified] = useState(false);

  // ==========================================
  // TAB 5: REPORT BUILDER (WHITE LABEL) STATE
  // ==========================================
  const [reportOrientation, setReportOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [reportTitle, setReportTitle] = useState('Monthly SEO Performance Report');
  const [reportSubtitle, setReportSubtitle] = useState('Prepared for WorkCo Digital');
  const [reportAccentColor, setReportAccentColor] = useState('#0B69FF');
  const [isReportModified, setIsReportModified] = useState(false);

  // ==========================================
  // TAB 6 & 7: LEAD GENERATOR STATE
  // ==========================================
  const [widgets, setWidgets] = useState<LeadWidget[]>([
    {
      id: 'w-1',
      name: 'WorkCo Digital Audit Widget',
      type: 'Pop-up',
      targetDomain: 'workco.com',
      created: 'Sep 26, 2026',
      leadsCount: 14,
      status: 'Active',
    },
  ]);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [newWidgetName, setNewWidgetName] = useState('');
  const [newWidgetType, setNewWidgetType] = useState<LeadWidget['type']>('Pop-up');
  const [newWidgetDomain, setNewWidgetDomain] = useState('workco.com');

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetName.trim()) return;

    const newW: LeadWidget = {
      id: `w-${Date.now()}`,
      name: newWidgetName.trim(),
      type: newWidgetType,
      targetDomain: newWidgetDomain.trim() || 'workco.com',
      created: 'Sep 27, 2026',
      leadsCount: 0,
      status: 'Active',
    };

    setWidgets([...widgets, newW]);
    setNewWidgetName('');
    setIsAddWidgetModalOpen(false);
    showToast('Lead Widget created successfully!');
  };

  // ==========================================
  // TAB 8: USERS STATE
  // ==========================================
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Manager' | 'Analyst' | 'Viewer'>('Manager');
  const [usersList, setUsersList] = useState<UserSeat[]>([
    {
      id: 'u-1',
      index: 1,
      name: 'Suraj Vishwakarma',
      email: 'suraj.vishwakarma@gvilab.com',
      role: 'Owner',
    },
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (usersList.length >= 3) {
      alert('You have reached the maximum 3 user seats for your current plan.');
      return;
    }

    const newUser: UserSeat = {
      id: `u-${Date.now()}`,
      index: usersList.length + 1,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
    };

    setUsersList([...usersList, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserModalOpen(false);
    showToast(`Invitation sent to ${newUser.email}!`);
  };

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'login-page':
        return 'Login page';
      case 'interface-customization':
        return 'Interface customization';
      case 'personal-domain-names':
        return 'Personal domain names';
      case 'email-settings':
        return 'Email settings';
      case 'report-builder':
        return 'Report Builder';
      case 'lead-generator':
        return 'Start';
      case 'lead-widgets':
        return 'Widgets';
      case 'users':
        return 'Users';
      default:
        return 'Login page';
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-white text-[#1E293B] flex flex-col justify-between font-sans relative">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-white stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div>
        {/* Top Breadcrumb Bar matching Screenshot 1 */}
        <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Link href="/settings" className="hover:text-[#0B69FF] transition-colors">
              Settings
            </Link>
            <span className="text-[#94A3B8]">›</span>
            {activeTab.startsWith('lead') ? (
              <span className="font-normal text-[#64748B]">Lead Generator</span>
            ) : (
              <Link
                href="/agency-pack?tab=interface-customization"
                className="hover:text-[#0B69FF] transition-colors"
              >
                White Label
              </Link>
            )}
            <span className="text-[#94A3B8]">›</span>
            <span className="text-[#1E293B] font-medium">{getBreadcrumbTitle()}</span>
          </div>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="text-xs text-[#0B69FF] hover:text-[#0052D4] font-medium transition-colors cursor-pointer"
          >
            Feedback
          </button>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: LOGIN PAGE (Exact match to Screenshots 1 & 2)           */}
        {/* ============================================================== */}
        {activeTab === 'login-page' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Title with info icon */}
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-[#1E293B]">Login page</h1>
              <div className="relative group cursor-pointer">
                <div className="w-4 h-4 rounded-full border border-[#94A3B8] text-[#94A3B8] flex items-center justify-center text-[10px] italic font-serif">
                  i
                </div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1E293B] text-white text-[11px] rounded py-1 px-2.5 whitespace-nowrap shadow-lg z-20">
                  Customize the appearance and branding of your White Label login page
                </div>
              </div>
            </div>

            {/* APPEARENCE SETTINGS: */}
            <div className="space-y-4 pt-1">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                APPEARENCE SETTINGS:
              </div>

              {/* Login logo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1E293B]">Login logo:</label>
                <div className="flex items-center gap-4">
                  {/* Logo preview card with origami ribbons */}
                  <div className="w-[88px] h-[76px] bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shadow-2xs">
                    {loginLogoUrl ? (
                      <img src={loginLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <svg width="42" height="42" viewBox="0 0 32 32" fill="none">
                        <path
                          d="M19.2618 8.02075L14.6489 12.6337C13.7654 13.5172 12.5667 14.0138 11.3171 14.0138H0L12.6275 1.38638C12.8748 1.139 13.2103 1 13.5604 1H18.6116C19.1841 1 19.6482 1.46412 19.6482 2.03662V7.08779C19.6482 7.43789 19.5092 7.77338 19.2618 8.02075Z"
                          fill="#0B69FF"
                        />
                        <path
                          d="M11.1871 29.8199V24.2221C11.1871 23.6496 10.723 23.1855 10.1505 23.1855H4.55273L11.7097 16.0286C12.5931 15.1451 13.7919 14.6484 15.0415 14.6484H26.3585L11.1871 29.8199Z"
                          fill="#0B69FF"
                        />
                      </svg>
                    )}
                  </div>

                  {/* UPDATE LOGO Button & Caption */}
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#1E293B]" />
                      <span>UPDATE LOGO</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    <p className="text-[11px] text-[#64748B] italic">
                      Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Show company name on login page */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Show your company name on the login page:
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyNameOnLogin(!showCompanyNameOnLogin);
                      setIsLoginModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                      showCompanyNameOnLogin ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        showCompanyNameOnLogin ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium text-[#1E293B]">
                    {showCompanyNameOnLogin ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0] my-5" />

            {/* COLOR SCHEME */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                COLOR SCHEME
              </div>
              <div className="flex items-center gap-2.5">
                {/* Dark scheme square #2C3A5B */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginColorScheme('dark');
                    setIsLoginModified(true);
                  }}
                  className={`w-7 h-7 rounded-[4px] bg-[#2C3A5B] cursor-pointer transition-all ${
                    loginColorScheme === 'dark'
                      ? 'ring-2 ring-offset-2 ring-[#0B69FF]'
                      : 'border border-[#CBD5E1]'
                  }`}
                  title="Dark Scheme"
                />
                {/* Light scheme square #FFFFFF */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginColorScheme('light');
                    setIsLoginModified(true);
                  }}
                  className={`w-7 h-7 rounded-[4px] bg-white border border-[#334155] cursor-pointer transition-all ${
                    loginColorScheme === 'light' ? 'ring-2 ring-offset-2 ring-[#0B69FF]' : ''
                  }`}
                  title="Light Scheme"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0] my-5" />

            {/* Live help and Feedback widgets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1E293B]">
                Show Live help and Feedback widgets:
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowLiveHelpWidgets(!showLiveHelpWidgets);
                    setIsLoginModified(true);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                    showLiveHelpWidgets ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      showLiveHelpWidgets ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-[#1E293B]">
                  {showLiveHelpWidgets ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            {/* Page language dropdown */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-[#1E293B]">Page language:</label>
              <div className="max-w-[280px] relative">
                <select
                  value={loginPageLanguage}
                  onChange={(e) => {
                    setLoginPageLanguage(e.target.value);
                    setIsLoginModified(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B] appearance-none cursor-pointer focus:outline-hidden focus:border-[#0B69FF]"
                >
                  <option value="English">🇺🇸 English</option>
                  <option value="Spanish">🇪🇸 Spanish</option>
                  <option value="German">🇩🇪 German</option>
                  <option value="French">🇫🇷 French</option>
                  <option value="Italian">🇮🇹 Italian</option>
                  <option value="Dutch">🇳🇱 Dutch</option>
                  <option value="Polish">🇵🇱 Polish</option>
                  <option value="Portuguese">🇧🇷 Portuguese</option>
                  <option value="Ukrainian">🇺🇦 Ukrainian</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons matching Screenshot 2 */}
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={handleResetLoginSettings}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
              >
                RESET SETTINGS
              </button>
              <button
                type="button"
                disabled={!isLoginModified}
                onClick={handleApplyLoginChanges}
                className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors ${
                  isLoginModified
                    ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INTERFACE CUSTOMIZATION                                */}
        {/* ============================================================== */}
        {activeTab === 'interface-customization' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-[22px] font-bold text-[#1E293B]">Interface customization</h1>

            {/* System Color Scheme */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                COLOR SCHEME
              </div>
              <div className="flex items-center gap-2">
                {systemColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setCustomColor(color);
                      setIsInterfaceModified(true);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-[4px] cursor-pointer transition-transform ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-[#0B69FF] scale-105'
                        : 'hover:opacity-90'
                    }`}
                  />
                ))}
                <div className="ml-2 flex items-center gap-1.5">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedColor(e.target.value);
                      setIsInterfaceModified(true);
                    }}
                    className="w-7 h-7 rounded-[4px] border border-gray-300 cursor-pointer p-0.5"
                  />
                  <span className="text-xs text-gray-500 font-mono">{customColor}</span>
                </div>
              </div>
            </div>

            {/* Header & Company Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#E2E8F0]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1E293B]">Header name:</label>
                <input
                  type="text"
                  value={headerName}
                  onChange={(e) => {
                    setHeaderName(e.target.value);
                    setIsInterfaceModified(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1E293B]">Company name:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setIsInterfaceModified(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B]"
                />
              </div>
            </div>

            {/* Footer Settings */}
            <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                FOOTER SETTINGS
              </div>
              <div className="space-y-1.5 max-w-md">
                <label className="block text-xs font-semibold text-[#1E293B]">Footer text:</label>
                <input
                  type="text"
                  value={footerName}
                  onChange={(e) => {
                    setFooterName(e.target.value);
                    setIsInterfaceModified(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs text-[#1E293B]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Show footer links:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFooterLinks(!showFooterLinks);
                      setIsInterfaceModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      showFooterLinks ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                        showFooterLinks ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium">{showFooterLinks ? 'On' : 'Off'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748B]">Use custom links:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomLinks(!useCustomLinks);
                      setIsInterfaceModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      useCustomLinks ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                        useCustomLinks ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium">{useCustomLinks ? 'On' : 'Off'}</span>
                </div>
              </div>

              {useCustomLinks && (
                <div className="space-y-2.5 pt-3">
                  {customLinks.map((link, idx) => (
                    <div key={link.id} className="grid grid-cols-2 gap-4 max-w-xl">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...customLinks];
                          updated[idx].label = e.target.value;
                          setCustomLinks(updated);
                          setIsInterfaceModified(true);
                        }}
                        className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-xs"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...customLinks];
                          updated[idx].url = e.target.value;
                          setCustomLinks(updated);
                          setIsInterfaceModified(true);
                        }}
                        className="px-3 py-1.5 bg-white border border-[#CBD5E1] rounded text-xs font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setHeaderName('SE Ranking');
                  setCompanyName('SE Ranking');
                  setSelectedColor('#1976D2');
                  setIsInterfaceModified(false);
                  showToast('Interface settings reset to default.');
                }}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                RESET SETTINGS
              </button>
              <button
                type="button"
                disabled={!isInterfaceModified}
                onClick={() => {
                  setIsInterfaceModified(false);
                  showToast('Interface customization applied successfully!');
                }}
                className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                  isInterfaceModified
                    ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: PERSONAL DOMAIN NAMES                                  */}
        {/* ============================================================== */}
        {activeTab === 'personal-domain-names' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-[22px] font-bold text-[#1E293B]">Personal domain names</h1>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl">
              You can personalise the domain name you use to access the SE Ranking platform by adding
              your own brand to it (<strong>yourbrand.online.seranking.com</strong>). Another option is to
              set up access to the platform under your own domain name with no mention of SE
              Ranking—you won&apos;t have to set up anything on your server. Whichever option you
              choose, you can get a free SSL certificate to protect your White Label SEO platform.
            </p>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
              <div className="font-semibold text-xs text-[#1E293B]">
                Personal domain name of your company:
              </div>
              <p className="text-[11.5px] text-[#64748B] leading-relaxed max-w-2xl">
                To access the platform with no mention of SE Ranking in the URL, use your own domain
                name. Go to the DNS settings of your domain and create a CNAME record with the{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#0B69FF]">
                  online.seranking.com
                </code>{' '}
                value. Then, enter your domain name here without specifying http:// or www. For
                example, <code className="bg-gray-100 px-1.5 py-0.5 rounded">top.richweb.org</code>.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl pt-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. seo.myagency.com"
                  className="flex-1 px-3 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs focus:outline-hidden focus:border-[#0B69FF]"
                />
                <button
                  type="button"
                  disabled={!domainInput.trim() || sslVerifying}
                  onClick={handleActivateSsl}
                  className={`px-4 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs ${
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
                  <span>
                    SSL Certificate is active and HTTPS is enforced for <strong>{domainInput}</strong>.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setDomainInput('');
                  setIsSslActive(false);
                  showToast('Domain settings cleared.');
                }}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                RESET SETTINGS
              </button>
              <button
                type="button"
                disabled={!domainInput.trim()}
                onClick={() => showToast('Domain settings saved successfully!')}
                className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                  domainInput.trim()
                    ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: EMAIL SETTINGS                                         */}
        {/* ============================================================== */}
        {activeTab === 'email-settings' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-[22px] font-bold text-[#1E293B]">Email settings</h1>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl">
              Configure SMTP details so all automated client reports, notifications, and audit summaries
              are delivered from your own branded email address without any mention of SE Ranking.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomEmailTemplate(!useCustomEmailTemplate);
                    setIsEmailModified(true);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    useCustomEmailTemplate ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                      useCustomEmailTemplate ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-[#1E293B]">
                  Use custom SMTP server for outgoing emails
                </span>
              </div>

              {useCustomEmailTemplate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1E293B]">SMTP Host:</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => {
                        setSmtpHost(e.target.value);
                        setIsEmailModified(true);
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1E293B]">SMTP Port:</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => {
                        setSmtpPort(e.target.value);
                        setIsEmailModified(true);
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1E293B]">Sender Name:</label>
                    <input
                      type="text"
                      value={smtpSenderName}
                      onChange={(e) => {
                        setSmtpSenderName(e.target.value);
                        setIsEmailModified(true);
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1E293B]">Sender Email:</label>
                    <input
                      type="text"
                      value={smtpSenderEmail}
                      onChange={(e) => {
                        setSmtpSenderEmail(e.target.value);
                        setIsEmailModified(true);
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setUseCustomEmailTemplate(false);
                  setIsEmailModified(false);
                  showToast('Email settings reset.');
                }}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                RESET SETTINGS
              </button>
              <button
                type="button"
                disabled={!isEmailModified}
                onClick={() => {
                  setIsEmailModified(false);
                  showToast('Email settings successfully saved!');
                }}
                className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                  isEmailModified
                    ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: REPORT BUILDER (WHITE LABEL)                           */}
        {/* ============================================================== */}
        {activeTab === 'report-builder' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-[#1E293B]">Report Builder branding</h1>
                <p className="text-xs text-[#64748B]">
                  Customize headers, cover page style, and orientation for PDF reports generated for clients.
                </p>
              </div>

              {/* Portrait / Landscape switcher */}
              <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => setReportOrientation('portrait')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    reportOrientation === 'portrait'
                      ? 'bg-white text-[#1E293B] shadow-2xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  PORTRAIT
                </button>
                <button
                  type="button"
                  onClick={() => setReportOrientation('landscape')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                    reportOrientation === 'landscape'
                      ? 'bg-white text-[#1E293B] shadow-2xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  LANDSCAPE
                </button>
              </div>
            </div>

            {/* Live PDF Cover Page Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1E293B]">Cover Page Preview:</label>
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-6 flex justify-center">
                <div
                  className={`bg-white border border-[#CBD5E1] rounded shadow-md p-6 flex flex-col justify-between transition-all ${
                    reportOrientation === 'portrait' ? 'w-[320px] h-[420px]' : 'w-[480px] h-[320px]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-black"
                        style={{ backgroundColor: reportAccentColor }}
                      >
                        SE
                      </div>
                      <span className="font-bold text-xs text-[#1E293B]">Your Agency</span>
                    </div>
                    <span className="text-[10px] text-[#64748B]">Sep 2026</span>
                  </div>

                  <div className="space-y-2 text-center my-auto">
                    <h2
                      className="text-base font-extrabold"
                      style={{ color: reportAccentColor }}
                    >
                      {reportTitle}
                    </h2>
                    <p className="text-xs text-[#64748B]">{reportSubtitle}</p>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between text-[10px] text-[#94A3B8]">
                    <span>Confidential</span>
                    <span>Page 1 of 12</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Color & Title controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1E293B]">Report Title:</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => {
                    setReportTitle(e.target.value);
                    setIsReportModified(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1E293B]">Subtitle / Client:</label>
                <input
                  type="text"
                  value={reportSubtitle}
                  onChange={(e) => {
                    setReportSubtitle(e.target.value);
                    setIsReportModified(true);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setReportTitle('Monthly SEO Performance Report');
                  setReportSubtitle('Prepared for WorkCo Digital');
                  setReportAccentColor('#0B69FF');
                  setIsReportModified(false);
                  showToast('Report branding reset.');
                }}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                RESET SETTINGS
              </button>
              <button
                type="button"
                disabled={!isReportModified}
                onClick={() => {
                  setIsReportModified(false);
                  showToast('Report branding applied successfully!');
                }}
                className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                  isReportModified
                    ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: LEAD GENERATOR (START)                                 */}
        {/* ============================================================== */}
        {activeTab === 'lead-generator' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6 text-center flex flex-col items-center justify-center min-h-[500px]">
            <div className="space-y-4 max-w-md flex flex-col items-center">
              {/* Illustration matching SE Ranking Lead Gen hero */}
              <div className="w-48 h-40 flex items-center justify-center">
                <svg viewBox="0 0 240 200" className="w-full h-full">
                  <g opacity="0.9">
                    <rect x="25" y="40" width="60" height="50" rx="6" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1.5" />
                    <path d="M35 75 Q 50 50, 75 60" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="3" fill="#22C55E" />
                    <circle cx="75" cy="60" r="3" fill="#22C55E" />
                    <rect x="155" y="40" width="60" height="50" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
                    <rect x="165" y="65" width="7" height="15" fill="#3B82F6" rx="2" />
                    <rect x="176" y="55" width="7" height="25" fill="#3B82F6" rx="2" />
                    <rect x="187" y="50" width="7" height="30" fill="#3B82F6" rx="2" />
                    <rect x="198" y="60" width="7" height="20" fill="#3B82F6" rx="2" />
                    <circle cx="120" cy="30" r="14" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1.5" />
                    <path d="M115 30 L119 34 L126 26" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <g>
                    <path d="M100 100 Q 120 90, 140 100 L145 130 L95 130 Z" fill="#0D9488" />
                    <circle cx="120" cy="72" r="12" fill="#FCD34D" />
                    <path d="M110 70 Q 120 58, 130 70 Q 120 62, 110 70 Z" fill="#1E293B" />
                    <rect x="105" y="115" width="30" height="18" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>

              <h2 className="text-lg font-bold text-[#1E293B]">Lead Generator</h2>
              <p className="text-xs text-[#64748B] leading-relaxed">
                You haven&apos;t added any widgets yet. Create your first widget to get started capturing
                qualified client leads directly from your agency website.
              </p>

              <button
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="mt-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
              >
                ADD WIDGET
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: LEAD GENERATOR (WIDGETS CARDS)                         */}
        {/* ============================================================== */}
        {activeTab === 'lead-widgets' && (
          <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-[#1E293B]">Lead Generator Widgets</h1>
                <p className="text-xs text-[#64748B]">Choose from 5 widget formats to embed on your website</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-3 py-1 rounded text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Account limits (daily) {widgets.length} / 3</span>
              </div>
            </div>

            {/* 5 Widget Format Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { type: 'Button', desc: 'Compact floating button triggering an audit form' },
                { type: 'Pop-up', desc: 'High-converting interactive overlay popup' },
                { type: 'Push notification', desc: 'Subtle slide-in notification bar' },
                { type: 'Webform', desc: 'Seamless embedded form inside page layout' },
                { type: 'Modal window', desc: 'Full-featured modal with instant audit report' },
              ].map((card) => (
                <div
                  key={card.type}
                  className="bg-white border border-[#CBD5E1] rounded-lg p-4 flex flex-col justify-between hover:border-[#0B69FF] hover:shadow-md transition-all group"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#1E293B] block">{card.type}</span>
                    <p className="text-[11px] text-[#64748B] leading-snug">{card.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewWidgetType(card.type as LeadWidget['type']);
                      setNewWidgetName(`${card.type} Widget`);
                      setIsAddWidgetModalOpen(true);
                    }}
                    className="mt-4 w-full py-1.5 bg-[#F1F5F9] group-hover:bg-[#0B69FF] group-hover:text-white text-[#1E293B] text-xs font-bold rounded transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    + ADD
                  </button>
                </div>
              ))}
            </div>

            {/* Active Widgets Table */}
            <div className="pt-6">
              <h2 className="text-sm font-bold text-[#1E293B] mb-3">Active Widgets ({widgets.length})</h2>
              <div className="bg-white border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-semibold uppercase text-[10.5px]">
                    <tr>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Target Domain</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5">Leads</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Embed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                    {widgets.map((w) => (
                      <tr key={w.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-2.5 font-semibold">{w.name}</td>
                        <td className="px-4 py-2.5 text-[#64748B]">{w.type}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px]">{w.targetDomain}</td>
                        <td className="px-4 py-2.5 text-[#64748B]">{w.created}</td>
                        <td className="px-4 py-2.5 font-bold text-[#10B981]">{w.leadsCount}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {w.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `<script src="https://online.seranking.com/lead-widget.js" data-widget-id="${w.id}"></script>`
                              );
                              showToast('Embed code copied to clipboard!');
                            }}
                            className="text-[#0B69FF] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 8: USERS                                                  */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-[#1E293B]">User Management</h1>
                <p className="text-xs text-[#64748B]">Manage agency seats and role permissions (1/3 seats used)</p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD USER</span>
              </button>
            </div>

            <div className="bg-white border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-semibold uppercase text-[10.5px]">
                  <tr>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-semibold text-[#1E293B]">{u.name}</td>
                      <td className="px-4 py-3 text-[#64748B]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'Owner' && (
                          <button
                            onClick={() => {
                              setUsersList(usersList.filter((x) => x.id !== u.id));
                              showToast('User removed.');
                            }}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>



      {/* Report Bug Modal */}
      <ReportBugModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Send Feedback</h3>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {feedbackSuccess ? (
              <div className="py-6 text-center space-y-2 text-[#10B981]">
                <Check className="w-8 h-8 mx-auto" />
                <p className="text-sm font-bold">Thank you for your feedback!</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!feedbackText.trim()) return;
                  setFeedbackSuccess(true);
                  setTimeout(() => {
                    setFeedbackSuccess(false);
                    setFeedbackText('');
                    setIsFeedbackOpen(false);
                    showToast('Feedback submitted successfully!');
                  }, 1200);
                }}
                className="space-y-4"
              >
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts or suggest an improvement..."
                  rows={4}
                  className="w-full p-3 border border-[#CBD5E1] rounded text-xs focus:outline-hidden focus:border-[#0B69FF]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Widget Modal */}
      {isAddWidgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Create Lead Generator Widget</h3>
              <button onClick={() => setIsAddWidgetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddWidget} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Widget Name:</label>
                <input
                  type="text"
                  required
                  value={newWidgetName}
                  onChange={(e) => setNewWidgetName(e.target.value)}
                  placeholder="e.g. Free SEO Audit Pop-up"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Target Domain:</label>
                <input
                  type="text"
                  required
                  value={newWidgetDomain}
                  onChange={(e) => setNewWidgetDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Widget Type:</label>
                <select
                  value={newWidgetType}
                  onChange={(e) => setNewWidgetType(e.target.value as LeadWidget['type'])}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                >
                  <option value="Button">Button</option>
                  <option value="Pop-up">Pop-up</option>
                  <option value="Push notification">Push notification</option>
                  <option value="Webform">Webform</option>
                  <option value="Modal window">Modal window</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWidgetModalOpen(false)}
                  className="px-3 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded font-bold uppercase tracking-wider"
                >
                  CREATE WIDGET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Add New User Seat</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Email Address:</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. john@agency.com"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Role:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                >
                  <option value="Manager">Manager (Can manage projects & audits)</option>
                  <option value="Analyst">Analyst (Can view & export reports)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded font-bold uppercase tracking-wider"
                >
                  SEND INVITATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgencyPackPage({ initialTab }: { initialTab?: AgencyViewTab }) {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Agency Pack...</div>}>
      <AgencyPackContent initialTab={initialTab} />
    </Suspense>
  );
}
