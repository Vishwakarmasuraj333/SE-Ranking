'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClientStatus {
  connected: boolean;
  connectedAt?: string;
}

export default function ApiMcpPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [clientStatuses, setClientStatuses] = useState<Record<string, ClientStatus>>({
    claude: { connected: false },
    claudeCode: { connected: false },
    cursor: { connected: false },
    gemini: { connected: false },
    codex: { connected: false },
  });
  const [loading, setLoading] = useState(false);

  const mcpEndpoint = 'https://api.seranking.com/mcp';
  const apiKey = '12856b00-b1c7-f25b-68b9-294c542738ac';

  // Load real status from backend
  useEffect(() => {
    fetch('/api/mcp')
      .then((res) => res.json())
      .then((data) => {
        if (data.clientStatuses) {
          setClientStatuses(data.clientStatuses);
        }
      })
      .catch((err) => console.error('Error fetching MCP status:', err));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const copyCommandText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleToggleConnection = async (clientKey: string, action: 'connect' | 'disconnect') => {
    setLoading(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: clientKey, action }),
      });
      const data = await res.json();
      if (data.success) {
        setClientStatuses((prev) => ({
          ...prev,
          [clientKey]: {
            connected: action === 'connect',
            connectedAt: action === 'connect' ? new Date().toISOString() : undefined,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to toggle connection:', err);
    } finally {
      setLoading(false);
      setActiveModal(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-6 sm:p-8 lg:p-10 font-sans text-[#1E293B]">
      <div className="max-w-[1080px] space-y-7">

        {/* ===================== SECTION 1: SERVER ENDPOINT ===================== */}
        <section className="space-y-2">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1E293B] tracking-tight">
              Server endpoint
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Copy this URL into any MCP-compatible client.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs">
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              MCP URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                readOnly
                value={mcpEndpoint}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-[14px] font-normal text-[#1E293B] select-all outline-hidden focus:border-[#2563EB] transition-colors"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(mcpEndpoint)}
                className="px-4 py-2 bg-white hover:bg-[#F8FAFC] active:bg-[#F1F5F9] text-[#1E293B] border border-[#CBD5E1] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedEndpoint ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-[#64748B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: CONNECT A CLIENT ===================== */}
        <section className="space-y-2">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1E293B] tracking-tight">
              Connect a client
            </h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              One-click connectors for supported tools.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#F1F5F9] shadow-2xs overflow-hidden">
            
            {/* ROW 1: Claude */}
            <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Claude Logo Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#FFF6F0] border border-[#FED7AA] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-[#D9531E]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a1 1 0 0 1 1 1v2.5a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm6.36 2.64a1 1 0 0 1 0 1.41l-1.77 1.77a1 1 0 0 1-1.41-1.41l1.77-1.77a1 1 0 0 1 1.41 0zM22 11a1 1 0 0 1 1 1v.01a1 1 0 0 1-2 0V12a1 1 0 0 1 1-1zm-2.64 6.36a1 1 0 0 1-1.41 0l-1.77-1.77a1 1 0 0 1 1.41-1.41l1.77 1.77a1 1 0 0 1 0 1.41zM12 20a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm-6.36-1.64a1 1 0 0 1 0-1.41l1.77-1.77a1 1 0 1 1 1.41 1.41l-1.77 1.77a1 1 0 0 1-1.41 0zM2 12a1 1 0 0 1 1-1h1.5a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm2.64-6.36a1 1 0 0 1 1.41 0l1.77 1.77a1 1 0 0 1-1.41 1.41l-1.77-1.77a1 1 0 0 1 0-1.41zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1E293B]">Claude</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FFF4ED] text-[#D9531E] border border-[#FED7AA]">
                      Most popular
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      OAuth
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    Web &amp; Desktop · Turn Claude into your SEO analyst
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('claude')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                  clientStatuses.claude?.connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white hover:bg-[#F8FAFC] text-[#1E293B] border-[#CBD5E1]'
                }`}
              >
                {clientStatuses.claude?.connected ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#64748B] font-bold">+</span>
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>

            {/* ROW 2: Claude code */}
            <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Claude Code Terminal Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#FFF6F0] border border-[#FED7AA] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#D9531E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" x2="20" y1="19" y2="19" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1E293B]">Claude code</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                      Cli
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    Build SEO tools from your terminal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('claude-code')}
                className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow-2xs"
              >
                Set up
              </button>
            </div>

            {/* ROW 3: Cursor */}
            <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Cursor Logo Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1E293B]">Cursor</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                      OAuth
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    Reference SE Ranking data while you code
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('cursor')}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                  clientStatuses.cursor?.connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white hover:bg-[#F8FAFC] text-[#1E293B] border-[#CBD5E1]'
                }`}
              >
                {clientStatuses.cursor?.connected ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#64748B] font-bold">+</span>
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>

            {/* ROW 4: Gemini */}
            <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Gemini 4-Point Sparkle Icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A73E8]/10 via-[#8AB4F8]/10 to-[#9334EA]/10 border border-[#8AB4F8]/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#1A73E8]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 24c-.38 0-.75-.15-1.02-.43C9.07 21.6 0 12.53 0 12c0-.53 9.07-9.6 10.98-11.57A1.44 1.44 0 0 1 12 0c.38 0 .75.15 1.02.43C14.93 2.4 24 11.47 24 12c0 .53-9.07 9.6-10.98 11.57A1.44 1.44 0 0 1 12 24z" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1E293B]">Gemini</span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    Connect SE Ranking to Gemini CLI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('gemini')}
                className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow-2xs"
              >
                Set up
              </button>
            </div>

            {/* ROW 5: Codex (CLI & IDE) */}
            <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Codex Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#4338CA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 18l6-6-6-6" />
                    <path d="M8 6l-6 6 6 6" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1E293B]">Codex (CLI &amp; IDE)</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                      Cli
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    OpenAI Codex with the rmcp client
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('codex')}
                className="px-4 py-2 bg-white hover:bg-[#F8FAFC] text-[#1E293B] border border-[#CBD5E1] rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow-2xs"
              >
                Set up
              </button>
            </div>

            {/* ROW 6: Other MCP-compatible tools */}
            <div className="p-4 sm:px-6 sm:py-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Other Tools Colorful Puzzle/Grid Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="8" height="8" rx="2" fill="#3B82F6" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill="#10B981" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill="#F59E0B" />
                    <rect x="13" y="13" width="8" height="8" rx="2" fill="#EF4444" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[14px] text-[#1E293B]">
                      Other MCP-compatible tools
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    VS Code, Gemini CLI, Windsurf, Zed, n8n, Make, and more
                  </p>
                </div>
              </div>

              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 text-[#1E293B] hover:text-[#2563EB] rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explore</span>
                <svg className="w-3.5 h-3.5 text-[#64748B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
              </a>
            </div>

          </div>
        </section>

      </div>

      {/* ===================== INTERACTIVE MODALS ===================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-[#E2E8F0] relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg cursor-pointer"
            >
              ✕
            </button>

            {/* Modal: Claude */}
            {activeModal === 'claude' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF6F0] border border-[#FED7AA] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D9531E]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a1 1 0 0 1 1 1v2.5a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm6.36 2.64a1 1 0 0 1 0 1.41l-1.77 1.77a1 1 0 0 1-1.41-1.41l1.77-1.77a1 1 0 0 1 1.41 0zM22 11a1 1 0 0 1 1 1v.01a1 1 0 0 1-2 0V12a1 1 0 0 1 1-1zm-2.64 6.36a1 1 0 0 1-1.41 0l-1.77-1.77a1 1 0 0 1 1.41-1.41l1.77 1.77a1 1 0 0 1 0 1.41zM12 20a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm-6.36-1.64a1 1 0 0 1 0-1.41l1.77-1.77a1 1 0 1 1 1.41 1.41l-1.77 1.77a1 1 0 0 1-1.41 0zM2 12a1 1 0 0 1 1-1h1.5a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm2.64-6.36a1 1 0 0 1 1.41 0l1.77 1.77a1 1 0 0 1-1.41 1.41l-1.77-1.77a1 1 0 0 1 0-1.41zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1E293B]">Connect Claude Desktop &amp; Web</h3>
                    <p className="text-xs text-[#64748B]">OAuth &amp; Local Configuration</p>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  Add SE Ranking to your Claude Desktop config (<code>claude_desktop_config.json</code>):
                </p>

                <div className="relative">
                  <pre className="bg-[#0F172A] text-emerald-400 p-3.5 rounded-lg text-xs font-mono overflow-x-auto leading-normal">
{`{
  "mcpServers": {
    "seranking": {
      "command": "npx",
      "args": ["-y", "@seranking/mcp-server"],
      "env": {
        "SERANKING_API_KEY": "${apiKey}"
      }
    }
  }
}`}
                  </pre>
                  <button
                    onClick={() => copyCommandText(`{\n  "mcpServers": {\n    "seranking": {\n      "command": "npx",\n      "args": ["-y", "@seranking/mcp-server"],\n      "env": {\n        "SERANKING_API_KEY": "${apiKey}"\n      }\n    }\n  }\n}`)}
                    className="absolute top-2.5 right-2.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-2 py-1 rounded-md transition-colors"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy JSON'}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
                  <span className="text-xs text-[#64748B]">
                    Status: <strong className={clientStatuses.claude?.connected ? 'text-emerald-600' : 'text-slate-500'}>
                      {clientStatuses.claude?.connected ? 'Connected' : 'Not connected'}
                    </strong>
                  </span>
                  <div className="flex gap-2">
                    {clientStatuses.claude?.connected ? (
                      <button
                        onClick={() => handleToggleConnection('claude', 'disconnect')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleConnection('claude', 'connect')}
                        disabled={loading}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Authorize &amp; Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Claude Code */}
            {activeModal === 'claude-code' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF6F0] border border-[#FED7AA] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#D9531E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" x2="20" y1="19" y2="19" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1E293B]">Set up Claude Code CLI</h3>
                    <p className="text-xs text-[#64748B]">Run one command in your terminal</p>
                  </div>
                </div>

                <p className="text-xs text-[#475569]">
                  Run the following command in your terminal to register SE Ranking with Claude Code:
                </p>

                <div className="bg-[#0F172A] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between gap-3">
                  <span className="truncate">claude mcp add seranking {mcpEndpoint}</span>
                  <button
                    onClick={() => copyCommandText(`claude mcp add seranking ${mcpEndpoint}`)}
                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Cursor */}
            {activeModal === 'cursor' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#0F172A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1E293B]">Connect Cursor IDE</h3>
                    <p className="text-xs text-[#64748B]">Settings &gt; Features &gt; MCP</p>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  In Cursor, navigate to <strong>Settings &gt; Features &gt; MCP</strong> and add a new SSE endpoint with the following URL:
                </p>

                <div className="bg-[#0F172A] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between gap-3">
                  <span className="truncate">{mcpEndpoint}</span>
                  <button
                    onClick={() => copyCommandText(mcpEndpoint)}
                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
                  <span className="text-xs text-[#64748B]">
                    Status: <strong className={clientStatuses.cursor?.connected ? 'text-emerald-600' : 'text-slate-500'}>
                      {clientStatuses.cursor?.connected ? 'Connected' : 'Not connected'}
                    </strong>
                  </span>
                  <div className="flex gap-2">
                    {clientStatuses.cursor?.connected ? (
                      <button
                        onClick={() => handleToggleConnection('cursor', 'disconnect')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleConnection('cursor', 'connect')}
                        disabled={loading}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Authorize &amp; Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Gemini */}
            {activeModal === 'gemini' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1A73E8]/10 to-[#9334EA]/10 border border-[#8AB4F8]/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1A73E8]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 24c-.38 0-.75-.15-1.02-.43C9.07 21.6 0 12.53 0 12c0-.53 9.07-9.6 10.98-11.57A1.44 1.44 0 0 1 12 0c.38 0 .75.15 1.02.43C14.93 2.4 24 11.47 24 12c0 .53-9.07 9.6-10.98 11.57A1.44 1.44 0 0 1 12 24z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1E293B]">Set up Gemini CLI</h3>
                    <p className="text-xs text-[#64748B]">Google Gemini CLI connector</p>
                  </div>
                </div>

                <p className="text-xs text-[#475569]">
                  Run the following command to register SE Ranking with Gemini CLI:
                </p>

                <div className="bg-[#0F172A] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between gap-3">
                  <span className="truncate">gemini mcp add seranking {mcpEndpoint}</span>
                  <button
                    onClick={() => copyCommandText(`gemini mcp add seranking ${mcpEndpoint}`)}
                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Codex */}
            {activeModal === 'codex' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#4338CA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 18l6-6-6-6" />
                      <path d="M8 6l-6 6 6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1E293B]">Set up Codex (CLI &amp; IDE)</h3>
                    <p className="text-xs text-[#64748B]">OpenAI Codex with the rmcp client</p>
                  </div>
                </div>

                <p className="text-xs text-[#475569]">
                  Run this command to add the SE Ranking MCP server to your rmcp client:
                </p>

                <div className="bg-[#0F172A] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between gap-3">
                  <span className="truncate">rmcp add seranking {mcpEndpoint}</span>
                  <button
                    onClick={() => copyCommandText(`rmcp add seranking ${mcpEndpoint}`)}
                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
