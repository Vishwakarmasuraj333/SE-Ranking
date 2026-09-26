'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  Database,
  Layers,
  Sliders,
  Trash2,
  Edit2,
  Check,
  X,
  CreditCard,
  Activity,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

export default function SettingsPage() {
  const { projects, refreshProjects } = useApp();
  const [activeTab, setActiveTab] = useState<'api' | 'projects' | 'general' | 'preferences'>('api');

  // API State
  const [tokenInput, setTokenInput] = useState('');
  const [providerMode, setProviderMode] = useState<'real' | 'mock'>('mock');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  // Usage State
  const [usage, setUsage] = useState<{
    requests: number;
    creditsUsed: number;
    lastRequest: string | null;
    currentMonth: string;
  } | null>(null);

  // Project Rename state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/api-usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/settings/test-connection', { method: 'POST' });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
      });
    } catch {
      setTestResult({
        success: false,
        message: 'Unable to connect to server.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRenameProject = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (res.ok) {
        await refreshProjects();
        setEditingProjectId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project and all its data?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] p-6 text-gray-900 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings & API Configuration</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage SEO provider tokens, project databases, and platform preferences</p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex gap-1 shadow-2xs">
          {[
            { id: 'api', label: 'API & Provider', icon: Key },
            { id: 'projects', label: 'Projects Management', icon: Layers },
            { id: 'general', label: 'General', icon: Sliders },
            { id: 'preferences', label: 'Preferences', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0B69FF] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: API & Credentials */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            {/* Connection Status Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#0B69FF]" />
                  <h3 className="font-bold text-sm text-gray-900">SE Ranking API Provider</h3>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5">
                  {testResult ? (
                    testResult.success ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Not Configured / Invalid</span>
                      </span>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      <span>Ready to Test</span>
                    </span>
                  )}
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  <p className="font-semibold">{testResult.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Provider Execution Mode</label>
                  <select
                    value={providerMode}
                    onChange={(e) => setProviderMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="mock">Sandbox Mock Provider (Instant High-Fidelity Data)</option>
                    <option value="real">Real SE Ranking API (Requires API Token)</option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Configured via <code className="bg-gray-100 px-1 rounded">SEO_PROVIDER_MODE</code>. Real mode verifies against SE Ranking servers.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Base Endpoint</label>
                  <input
                    type="text"
                    disabled
                    value="https://api.seranking.com/v1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  Authentication token is secured server-side and never exposed to client browsers.
                </span>

                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0B69FF] text-white text-xs font-semibold rounded-lg hover:bg-[#005FE0] transition-colors disabled:opacity-50"
                >
                  {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>

            {/* API Credit & Usage Tracking Panel (Requirement 19) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-gray-900">API Credit & Usage Tracking</h3>
                </div>
                <button
                  onClick={fetchUsage}
                  className="text-xs text-[#0B69FF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block mb-1 text-[11px]">Total Requests</span>
                  <span className="text-lg font-bold text-gray-900">{usage?.requests ?? 0}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block mb-1 text-[11px]">Credits Consumed</span>
                  <span className="text-lg font-bold text-purple-700">{usage?.creditsUsed ?? 0}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block mb-1 text-[11px]">Billing Period</span>
                  <span className="text-sm font-bold text-gray-900">{usage?.currentMonth || 'Sep 2026'}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-500 block mb-1 text-[11px]">Last Activity</span>
                  <span className="text-xs font-medium text-gray-700 truncate block">
                    {usage?.lastRequest ? new Date(usage.lastRequest).toLocaleTimeString() : 'No requests yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects Management */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Existing Projects</h3>
                <p className="text-[11px] text-gray-500">{projects.length} projects stored in Prisma database</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {projects.map((p) => {
                const isEditing = editingProjectId === p.id;
                return (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B69FF] font-bold flex items-center justify-center">
                        {p.domain[0].toUpperCase()}
                      </div>

                      <div>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-2 py-1 border border-blue-400 rounded text-xs"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameProject(p.id)}
                              className="p-1 bg-[#0B69FF] text-white rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingProjectId(null)}
                              className="p-1 bg-gray-200 text-gray-700 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="font-bold text-gray-900">{p.name}</p>
                            <p className="text-gray-500 text-[11px]">
                              {p.domain} • {p.country}
                              {p.brandName && ` • Brand: ${p.brandName}`}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProjectId(p.id);
                          setEditingName(p.name);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Rename project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: General & Preferences */}
        {(activeTab === 'general' || activeTab === 'preferences') && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Application Preferences</h3>
            <p className="text-gray-500">
              SE Ranking Research Studio is operating with App Router, TanStack Query caching, and Prisma SQLite/PostgreSQL persistence.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-100 space-y-1">
              <p>• <b>Account:</b> Suraj Vishwakarma (suraj.vishwakarma@gvilab.com)</p>
              <p>• <b>Timezone:</b> UTC+05:30 (India Standard Time)</p>
              <p>• <b>Trial status:</b> 12 days remaining</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
