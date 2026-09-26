'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  Copy,
  Check,
  Plus,
  ExternalLink,
  BookOpen,
  FileText,
  Share2,
  Layers,
  Gauge,
  LifeBuoy,
  Clock,
  HelpCircle,
  Coins,
  ChevronDown,
  Info,
  X,
  CreditCard,
  Building2,
  Trash2,
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  token: string;
  created: string;
  lastUsed: string;
}

export default function ApiDashboardPage() {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<'addon' | 'standalone'>('addon');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreditsDropdownOpen, setIsCreditsDropdownOpen] = useState(false);

  // Dynamic API Keys list matching Screenshot 3
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Data API Key',
      token: '12856b00-b1c7-f25b-68b9-294c542738ac',
      created: 'Sep 25, 2026',
      lastUsed: 'Sep 26, 2026',
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    ).join('-');

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      token: `${randomHex}-b1c7-f25b-${Math.floor(1000 + Math.random() * 9000)}ac`,
      created: 'Sep 26, 2026',
      lastUsed: 'Just now',
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
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
        {/* Sub-header Bar (Matching Screenshot 1 & 3 exact) */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Breadcrumb & Title */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <span className="text-gray-400">›</span>
                <span className="text-gray-700 font-medium">API Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  API Dashboard
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                <span>{apiKeys.length} / 10 API keys</span>
                <span>•</span>
                <span>Last used Sep 26, 2026</span>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-3">
              {/* Feedback Button */}
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-xs text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors"
              >
                Feedback
              </button>

              {/* Credits Gold Pill */}
              <div className="relative">
                <button
                  onClick={() => setIsCreditsDropdownOpen(!isCreditsDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Credits: 100K / 100K</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#B45309]" />
                </button>

                {isCreditsDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-xs">
                    <div className="font-bold text-gray-900 mb-1">Data API Balance</div>
                    <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                      <span>Trial Credits:</span>
                      <span className="font-semibold text-emerald-600">100,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                      <span>Wallet Balance:</span>
                      <span className="font-semibold text-gray-800">0</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-600">
                      <span>Expiry:</span>
                      <span className="font-semibold text-gray-800">Oct 07, 2026</span>
                    </div>
                    <Link
                      href="/api-docs/wallet"
                      onClick={() => setIsCreditsDropdownOpen(false)}
                      className="block text-center mt-2.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded font-medium text-[11px]"
                    >
                      Top Up Wallet
                    </Link>
                  </div>
                )}
              </div>

              {/* + CREATE API KEY Blue Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-md text-xs font-bold shadow-2xs transition-colors cursor-pointer tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>CREATE API KEY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page Main Content Area */}
        <div className="p-6 max-w-7xl mx-auto space-y-5">
          {/* Trial Ends In 11 Days Notice Banner (Exact match to Screenshot 3) */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0B69FF] flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-[13px]">Trial ends in 11 days</div>
                <div className="text-gray-600 text-[11.5px] mt-0.5">
                  Still have 100,000 credits to explore. Want to keep going?{' '}
                  <button
                    onClick={() => {
                      setUpgradeType('addon');
                      setIsUpgradeModalOpen(true);
                    }}
                    className="text-[#0B69FF] font-semibold hover:underline cursor-pointer"
                  >
                    Get full access
                  </button>
                </div>
              </div>
            </div>

            <div className="text-gray-500 font-medium text-[11.5px] md:text-right">
              Access to the Data API only
            </div>
          </div>

          {/* Two-Column Cards: Credits Usage & Get Full API Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Credits usage */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-3">Credits usage</h2>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500">100,000 credits left from 100,000</div>

                  {/* Solid Blue Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0B69FF] h-full rounded-full w-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-500 text-[11.5px]">Credit expire Oct 07, 2026</span>
                    <button
                      onClick={() => {
                        setUpgradeType('addon');
                        setIsUpgradeModalOpen(true);
                      }}
                      className="text-[#0B69FF] font-medium text-[11.5px] hover:underline cursor-pointer"
                    >
                      Upgrade plan
                    </button>
                  </div>
                </div>

                {/* Wallet Balance Row */}
                <div className="mt-4 p-3 bg-gray-50/70 border border-gray-100 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-800 font-medium">
                    <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                      ●
                    </div>
                    <span>Wallet balance</span>
                    <span className="font-bold text-gray-900 ml-1">0</span>
                  </div>
                  <Link
                    href="/api-docs/wallet"
                    className="text-xs font-semibold text-[#0B69FF] hover:underline"
                  >
                    Top up
                  </Link>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <a
                  href="https://seranking.com/api.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#0B69FF] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  View credit costs per endpoint
                </a>
              </div>
            </div>

            {/* Card 2: Get full API access */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-3">Get full API access</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* API Add-on */}
                  <div className="flex flex-col justify-between bg-white p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-xs font-bold text-gray-900">API Add-on</div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Get a SE Ranking subscription with Data API credits included, plus extra credits on top.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUpgradeType('addon');
                        setIsUpgradeModalOpen(true);
                      }}
                      className="mt-4 w-full bg-[#1E293B] hover:bg-[#0F172A] text-white text-[11px] font-bold py-2 px-3 rounded uppercase transition-colors cursor-pointer"
                    >
                      GET API ADD-ON
                    </button>
                  </div>

                  {/* API Standalone */}
                  <div className="flex flex-col justify-between bg-white p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-xs font-bold text-gray-900">API Standalone</div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        API-only access to SE Ranking datasets. No web app, no subscription required.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUpgradeType('standalone');
                        setIsUpgradeModalOpen(true);
                      }}
                      className="mt-4 w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-[11px] font-bold py-2 px-3 rounded uppercase transition-colors cursor-pointer"
                    >
                      GET API STANDALONE
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 text-xs text-gray-500">
                Custom plans are available.{' '}
                <a
                  href="https://seranking.com/contact-us.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0B69FF] font-medium hover:underline"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>

          {/* API Keys Table (Exact layout from Screenshot 3) */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">API Keys</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs text-[#0B69FF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add key
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3">NAME</th>
                    <th className="px-5 py-3">KEY</th>
                    <th className="px-5 py-3">CREATED</th>
                    <th className="px-5 py-3">LAST USED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {apiKeys.map((k) => {
                    const isCopied = copiedKeyId === k.id;
                    return (
                      <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4 font-semibold text-gray-900 text-xs">
                          {k.name}
                        </td>
                        <td className="px-5 py-4 font-mono text-[11.5px] text-gray-800">
                          <div className="flex items-center gap-2">
                            <span>{k.token}</span>
                            <button
                              onClick={() => copyToClipboard(k.token, k.id)}
                              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer transition-colors"
                              title="Copy API key"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {apiKeys.length > 1 && (
                              <button
                                onClick={() => handleDeleteKey(k.id)}
                                className="text-gray-300 hover:text-red-500 p-1 cursor-pointer ml-1"
                                title="Revoke key"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{k.created}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{k.lastUsed}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Links Section (Exact 6 Cards from Screenshot 3) */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Data API Documentation */}
              <a
                href="https://seranking.com/api.html"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Data API Documentation
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Quickstarts, endpoints &amp; examples for the Data API.
                </p>
              </a>

              {/* 2. Project API Documentation */}
              <a
                href="https://seranking.com/api.html#project"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Project API Documentation
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Endpoints to manage projects data.
                </p>
              </a>

              {/* 3. Postman Workspace */}
              <a
                href="https://www.postman.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center font-bold">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Postman Workspace
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Run requests and explore examples without coding.
                </p>
              </a>

              {/* 4. Integrations */}
              <a
                href="https://seranking.com/integrations.html"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4 text-gray-600" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Integrations
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Connect SE Ranking with BI tools and services.
                </p>
              </a>

              {/* 5. Rate Limits */}
              <a
                href="https://seranking.com/api.html#limits"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center font-bold">
                    <Gauge className="w-4 h-4 text-gray-600" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Rate Limits
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Know your credit cost per call and scale safely without 429 surprises.
                </p>
              </a>

              {/* 6. API Help Center */}
              <a
                href="https://help.seranking.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center font-bold">
                    <LifeBuoy className="w-4 h-4 text-gray-600" />
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  API Help Center
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  FAQs, troubleshooting, and support articles.
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Matching Screenshot 3 */}
      <footer className="mt-12 py-5 px-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-2">
          {/* SE Ranking brand mark */}
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

      {/* Create API Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#0B69FF]" />
                Create New API Key
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Data Pipeline"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] focus:border-[#0B69FF]"
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  A descriptive name to distinguish this key on your dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  API Scope
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]">
                  <option>Data API (Keyword, Backlink, Competitor)</option>
                  <option>Project API (Projects, Site Audit)</option>
                  <option>Full Access (Data + Project)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800">
                🔒 Keep your API key safe. Anyone with this key can make requests using your account&apos;s quota.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade / Plan Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">
                {upgradeType === 'addon' ? 'SE Ranking API Add-on' : 'SE Ranking API Standalone'}
              </h3>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="text-xs font-bold text-blue-900">
                  {upgradeType === 'addon'
                    ? 'Extend your current plan with API access'
                    : 'Developer-only Data API Plan'}
                </div>
                <div className="text-[11.5px] text-blue-700 mt-1 leading-relaxed">
                  {upgradeType === 'addon'
                    ? 'Get 500,000 monthly credits added directly to your account with full web platform access included.'
                    : 'Direct REST API & MCP Server access without web dashboards. Pay only for the credits you consume.'}
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>160+ endpoints for Keyword, Backlink, Competitor research</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>MCP Server integration for Claude, Cursor &amp; Gemini</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Standard 5 req/sec rate limit with zero 429 delays</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <div className="text-lg font-black text-gray-900">
                  {upgradeType === 'addon' ? '$49 / mo' : '$99 / mo'}
                </div>
                <button
                  onClick={() => {
                    alert('Redirecting to secure checkout...');
                    setIsUpgradeModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                >
                  Activate Now
                </button>
              </div>
            </div>
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
                <div className="text-xs text-gray-500">Your feedback has been submitted to the product team.</div>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="p-5 space-y-3">
                <p className="text-xs text-gray-600">
                  Have a suggestion or request for the SE Ranking API? Let us know below:
                </p>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think or what endpoints you need..."
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
                    Submit Feedback
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
