'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Terminal,
  Cpu,
  Shield,
  Layers,
  HelpCircle,
  AlertCircle,
  Wallet,
  ArrowRight,
  Trash2,
  Lock,
  ChevronDown,
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  token: string;
  created: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
  scope: string;
}

export default function ApiDashboardPage() {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('Data API (Read-only)');
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Default Production Key',
      token: '12856b00-b1c7-f25b-b8b9-294c542738ac',
      created: 'Sep 23, 2026',
      lastUsed: 'Just now',
      status: 'Active',
      scope: 'Data API (Full)',
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeyIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
      token: `${randomHex}-a9f1-4b2e-${Math.floor(1000 + Math.random() * 9000)}`,
      created: 'Just now',
      lastUsed: 'Never',
      status: 'Active',
      scope: newKeyScope,
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800">
      {/* Top Header Bar for API */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">API</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-700 font-medium">Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://help.seranking.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Feedback
          </a>

          {/* Credits pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200/80 rounded-lg text-xs font-semibold text-gray-800 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Credits: 100K / 100K</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </div>

          {/* Create Key Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE API KEY</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Trial ends banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                You have 12 days of free trial left.
              </p>
              <p className="text-xs text-amber-700">
                You currently have trial access to the Data API only. Upgrade to unlock full Project API capabilities.
              </p>
            </div>
          </div>
          <Link
            href="/api-docs/wallet"
            className="px-3.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/50 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs transition-colors shrink-0"
          >
            Buy Credits
          </Link>
        </div>

        {/* Top Cards: Credits Usage & Full API Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Credits Usage */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#0B69FF]" />
                  Credits usage
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  100% available
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Available Credits</span>
                  <span className="text-gray-900">100,000 / 100,000</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0B69FF] h-full rounded-full w-full" />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                  <span>Trial credits valid until Oct 07, 2026</span>
                  <span>Wallet balance: 0 credits</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Need more quota for high-volume pipelines?</span>
              <Link
                href="/api-docs/wallet"
                className="text-xs font-bold text-[#0B69FF] hover:underline flex items-center gap-1"
              >
                Top up Wallet <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Full API Access */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0B69FF]" />
                  Full API access
                </h3>
                <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                  Project + Data
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mt-2">
                Gain programmatic access to create, audit, track positions, and export custom reports across all domains. Available with an API Add-on or Standalone developer plan.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-[11px] text-gray-500">Data API</div>
                  <div className="text-xs font-bold text-gray-800 mt-0.5">Active (Trial)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-[11px] text-gray-500">Project API</div>
                  <div className="text-xs font-bold text-gray-400 mt-0.5">Subscription Required</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={() => alert('Opening API Add-on subscription options...')}
                className="px-3 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Explore API Add-on
              </button>
              <Link
                href="/api-docs/mcp"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                Connect MCP
              </Link>
            </div>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-600" />
                Active API Keys
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Use these bearer tokens in your HTTP headers: <code className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-[11px]">Authorization: Token &#123;API_KEY&#125;</code>
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create API Key</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3">Key Name</th>
                  <th className="px-5 py-3">API Token</th>
                  <th className="px-5 py-3">Scope</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Last Used</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {apiKeys.map((k) => {
                  const isRevealed = revealedKeyIds[k.id];
                  const isCopied = copiedKeyId === k.id;
                  const displayToken = isRevealed
                    ? k.token
                    : `${k.token.substring(0, 8)}••••••••••••••••••••${k.token.substring(k.token.length - 4)}`;

                  return (
                    <tr key={k.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {k.name}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 select-all">
                            {displayToken}
                          </span>
                          <button
                            onClick={() => toggleReveal(k.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                            title={isRevealed ? 'Hide Token' : 'Reveal Token'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(k.token, k.id)}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Copy to clipboard"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {k.scope}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{k.created}</td>
                      <td className="px-5 py-4 text-gray-500">{k.lastUsed}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {k.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6 Quick Links Cards */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Resources &amp; Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1 */}
            <a
              href="https://seranking.com/api.html"
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Data API Documentation
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Explore 160+ endpoints for keyword research, backlink metrics, SERP results, and AI search presence.
              </p>
            </a>

            {/* 2 */}
            <a
              href="https://seranking.com/api.html"
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Project API Reference
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Programmatically manage tracking campaigns, site rankings, competitors, and crawl configurations.
              </p>
            </a>

            {/* 3 */}
            <Link
              href="/api-docs/mcp"
              className="bg-white border border-gray-200 hover:border-amber-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">New</span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                Model Context Protocol (MCP)
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Connect Claude, Cursor, and Gemini directly to SE Ranking data for instant AI context.
              </p>
            </Link>

            {/* 4 */}
            <Link
              href="/api-docs/wallet"
              className="bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                API Wallet &amp; Top-up
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Recharge credits, view usage history, configure automatic recharge thresholds, and download receipts.
              </p>
            </Link>

            {/* 5 */}
            <a
              href="https://seranking.com/api.html#limits"
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Rate Limits &amp; Quotas
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Standard concurrency of 5 requests/sec. Review response headers, throttling rules, and batch limits.
              </p>
            </a>

            {/* 6 */}
            <a
              href="https://help.seranking.com"
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Developer Support
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Join our developer Discord community or submit tickets to our dedicated API engineering squad.
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#0B69FF]" />
                Generate New API Key
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Key Description / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Data Pipeline, Zapier Bot"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Permission Scope
                </label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                >
                  <option value="Data API (Read-only)">Data API (Read-only)</option>
                  <option value="Data API (Full)">Data API (Full Access)</option>
                  <option value="Full Access (Data + Project)">Full Access (Data + Project)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 leading-relaxed">
                🔒 Keep your API key secret. Do not expose it in browser clients or public GitHub repositories.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
