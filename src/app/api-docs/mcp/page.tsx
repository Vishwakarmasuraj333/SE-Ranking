'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Copy,
  Check,
  Sparkles,
  Terminal,
  Code2,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function ApiMcpPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<'claude' | 'cursor' | 'cli' | 'gemini'>('claude');

  const mcpEndpoint = 'https://api.seranking.com/mcp';
  const apiKey = '12856b00-b1c7-f25b-b8b9-294c542738ac';

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id === 'endpoint') {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2500);
    } else {
      setCopiedConfig(id);
      setTimeout(() => setCopiedConfig(null), 2500);
    }
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        seranking: {
          url: mcpEndpoint,
          headers: {
            Authorization: `Token ${apiKey}`,
          },
        },
      },
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      name: 'SE Ranking MCP',
      type: 'sse',
      url: mcpEndpoint,
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    },
    null,
    2
  );

  const cliCommand = `claude mcp add seranking ${mcpEndpoint} --header "Authorization: Token ${apiKey}"`;

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/api-docs" className="text-gray-500 hover:text-gray-900">
            API
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Model Context Protocol (MCP)</span>
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
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#18212D] via-[#232E3D] to-[#1E293B] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Model Context Protocol Server</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Connect SE Ranking to your AI tools
            </h1>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              Enable Claude, Cursor, Gemini, and autonomous AI agents to query keyword volumes, real-time SERP rankings, backlink health, and LLM visibility directly inside your chat window or IDE.
            </p>
          </div>
        </div>

        {/* Server Endpoint Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0B69FF]" />
                MCP Server Endpoint (SSE / HTTP POST)
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Paste this URL into your MCP client configuration along with your active API key.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                160+ Tools Ready
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 select-all">
              {mcpEndpoint}
            </div>
            <button
              onClick={() => copyText(mcpEndpoint, 'endpoint')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                copiedEndpoint
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0B69FF] hover:bg-[#0052D4] text-white shadow-xs'
              }`}
            >
              {copiedEndpoint ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Client Configuration Tabs & Box */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Setup Instructions by Client</h2>
              <p className="text-xs text-gray-500">
                Choose your AI platform to view the automatic JSON configuration.
              </p>
            </div>
          </div>

          {/* Client Selector Pills */}
          <div className="flex border-b border-gray-200 bg-gray-50/70 px-6 gap-2 pt-2">
            <button
              onClick={() => setSelectedClient('claude')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                selectedClient === 'claude'
                  ? 'border-[#0B69FF] text-[#0B69FF] bg-white rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Claude Desktop
            </button>
            <button
              onClick={() => setSelectedClient('cursor')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                selectedClient === 'cursor'
                  ? 'border-[#0B69FF] text-[#0B69FF] bg-white rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Cursor IDE
            </button>
            <button
              onClick={() => setSelectedClient('cli')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                selectedClient === 'cli'
                  ? 'border-[#0B69FF] text-[#0B69FF] bg-white rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Claude Code CLI
            </button>
            <button
              onClick={() => setSelectedClient('gemini')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                selectedClient === 'gemini'
                  ? 'border-[#0B69FF] text-[#0B69FF] bg-white rounded-t-lg'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Google Gemini / Antigravity
            </button>
          </div>

          {/* Active Config Content */}
          <div className="p-6">
            {selectedClient === 'claude' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Open your Claude Desktop config file at{' '}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono text-[11px]">
                    %APPDATA%\Claude\claude_desktop_config.json
                  </code>{' '}
                  and add the SE Ranking MCP server block:
                </p>

                <div className="relative">
                  <pre className="bg-[#1E293B] text-gray-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {claudeConfig}
                  </pre>
                  <button
                    onClick={() => copyText(claudeConfig, 'claude')}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedConfig === 'claude' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedClient === 'cursor' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  In Cursor, navigate to <strong>Settings → Features → MCP Servers</strong>, click <strong>+ Add New MCP Server</strong>, and enter these values:
                </p>

                <div className="relative">
                  <pre className="bg-[#1E293B] text-gray-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {cursorConfig}
                  </pre>
                  <button
                    onClick={() => copyText(cursorConfig, 'cursor')}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedConfig === 'cursor' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Config</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedClient === 'cli' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Run this single command in your PowerShell or bash terminal to register SE Ranking with the Claude CLI:
                </p>

                <div className="relative">
                  <pre className="bg-[#1E293B] text-gray-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {cliCommand}
                  </pre>
                  <button
                    onClick={() => copyText(cliCommand, 'cli')}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedConfig === 'cli' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectedClient === 'gemini' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  In Google Antigravity or Google AI Studio, add an MCP extension with transport <strong>SSE</strong> targeting <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-mono text-[11px]">https://api.seranking.com/mcp</code> and pass your Bearer token in the request headers.
                </p>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                  ✓ Antigravity-compatible: Automatically provides 160+ live tools to Gemini for autonomous SEO research.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Featured Available MCP Tools */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Available Tools in this MCP Server</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50">
              <div className="text-xs font-bold text-gray-900 font-mono flex items-center gap-1.5 text-blue-700">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                get_keyword_overview
              </div>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Query search volume, competition difficulty score (0-100), CPC, search intent (Informational, Transactional), and trend history for any keyword and country.
              </p>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50">
              <div className="text-xs font-bold text-gray-900 font-mono flex items-center gap-1.5 text-blue-700">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                get_serp_positions
              </div>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Retrieve historical and live ranking positions for tracked target URLs across Google, Bing, and Yahoo with SERP feature breakdowns.
              </p>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50">
              <div className="text-xs font-bold text-gray-900 font-mono flex items-center gap-1.5 text-blue-700">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                get_ai_search_overview
              </div>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Check whether your domain is cited in ChatGPT, Perplexity, Google Gemini, and Google AI Overviews with mention counts and link presence.
              </p>
            </div>

            <div className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50">
              <div className="text-xs font-bold text-gray-900 font-mono flex items-center gap-1.5 text-blue-700">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                get_backlink_profile
              </div>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Extract total referring domains, backlinks, Domain Trust (DT), Page Trust (PT), and dofollow/nofollow ratio for any root domain or URL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
