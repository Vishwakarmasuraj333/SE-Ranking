'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Coins,
  ChevronDown,
  Info,
  X,
  Sparkles,
  Terminal,
  Bot,
  Zap,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function ApiMcpPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isCreditsDropdownOpen, setIsCreditsDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [connectedClients, setConnectedClients] = useState<Record<string, boolean>>({
    claude: false,
    cursor: false,
  });

  const mcpEndpoint = 'https://api.seranking.com/mcp';
  const apiKey = '12856b00-b1c7-f25b-68b9-294c542738ac';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const toggleConnect = (client: string) => {
    setConnectedClients((prev) => ({ ...prev, [client]: !prev[client] }));
    setActiveModal(null);
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
        {/* Top Header Bar Matching Screenshot 2 exact */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Breadcrumb to API Dashboard */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="text-gray-400">›</span>
                <Link
                  href="/api-docs"
                  className="text-gray-700 font-medium hover:text-[#0B69FF] transition-colors"
                >
                  API Dashboard
                </Link>
              </div>
            </div>

            {/* Right side: Feedback & Credits pill */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-xs text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors"
              >
                Feedback
              </button>

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
            </div>
          </div>
        </div>

        {/* MCP Page Body Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Blue Notice Banner (Exact match to Screenshot 2) */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 flex items-start gap-3 shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0B69FF] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              ⓘ
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-sm text-gray-900">
                Connect SE Ranking to your AI tools
              </h2>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                The SE Ranking MCP connects your AI tools to live SEO data in minutes. Analyze backlink profiles, research competitor domains, track AI search visibility, and more — all in natural language, without exporting CSVs, copying dashboards, or copy-pasting data into your AI chat.
              </p>
              <a
                href="https://seranking.com/api.html#mcp"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#0B69FF] font-semibold text-xs mt-2 hover:underline"
              >
                <span>View documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Section 1: Data API key */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">Data API key</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-2.5">
              The MCP Server uses your API keys to authenticate calls. Keys are managed on the API Dashboard.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Key className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">API key</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Research domains, analyze backlinks, track rankings, run audits, monitor AI Search
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0 pl-13 sm:pl-0">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active
                </span>
                <Link
                  href="/api-docs"
                  className="text-[#0B69FF] font-medium hover:underline"
                >
                  160+ tools available
                </Link>
              </div>
            </div>
          </div>

          {/* Section 2: Server endpoint */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">Server endpoint</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-2.5">
              Copy this URL into any MCP-compatible client.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-0.5">
                  MCP URL
                </span>
                <div className="font-mono text-xs text-gray-800 truncate select-all">
                  {mcpEndpoint}
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(mcpEndpoint)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-2xs"
              >
                {copiedEndpoint ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Connect a client (Exact 6 rows from Screenshot 2) */}
          <div>
            <h3 className="text-sm font-bold text-gray-900">Connect a client</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-2.5">
              One-click connectors for supported tools.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 shadow-2xs overflow-hidden">
              {/* Row 1: Claude */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Claude Sparkle Icon */}
                  <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Claude</span>
                      <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-semibold px-2 py-0.5 rounded">
                        Most popular
                      </span>
                      <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-semibold px-2 py-0.5 rounded">
                        OAuth
                      </span>
                      {connectedClients.claude && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Connected
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">
                      Web &amp; Desktop: Turn Claude into your SEO analyst
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('claude')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  {connectedClients.claude ? 'Configured' : '+ Connect'}
                </button>
              </div>

              {/* Row 2: Claude code */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Claude code terminal icon */}
                  <div className="w-9 h-9 rounded-lg bg-amber-900/10 border border-amber-900/20 flex items-center justify-center shrink-0">
                    <Terminal className="w-4 h-4 text-amber-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Claude code</span>
                      <span className="bg-[#F3E8FF] text-[#7E22CE] text-[10px] font-semibold px-2 py-0.5 rounded">
                        CLI
                      </span>
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">
                      Build SEO tools from your terminal
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('claude-code')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Set up
                </button>
              </div>

              {/* Row 3: Cursor */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Cursor Cube icon */}
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Code2 className="w-4 h-4 text-[#0B69FF]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Cursor</span>
                      <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-semibold px-2 py-0.5 rounded">
                        OAuth
                      </span>
                      {connectedClients.cursor && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Connected
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">
                      Reference SE Ranking data while you code
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('cursor')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  {connectedClients.cursor ? 'Configured' : '+ Connect'}
                </button>
              </div>

              {/* Row 4: Gemini */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Gemini 4-color Star */}
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Gemini</span>
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">
                      Connect SE Ranking to Gemini CLI
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('gemini')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Set up
                </button>
              </div>

              {/* Row 5: Codex (CLI & IDE) */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Codex Icon */}
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Codex (CLI &amp; IDE)</span>
                      <span className="bg-[#F3E8FF] text-[#7E22CE] text-[10px] font-semibold px-2 py-0.5 rounded">
                        CLI
                      </span>
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">
                      Operate Codex with the mcp client
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('codex')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Set up
                </button>
              </div>

              {/* Row 6: Other MCP-compatible tools */}
              <div className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  {/* Puzzle / tools icon */}
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">Other MCP-compatible tools</span>
                    </div>
                    <div className="text-[11.5px] text-gray-500 mt-0.5">
                      VS Code, Gemini CLI, Windsurf, Zed, n8n, Make, and more
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('explore')}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Matching Screenshot 2 */}
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

      {/* Client Setup Modal (Claude, Cursor, CLI, Codex, etc.) */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0B69FF]" />
                {activeModal === 'claude' && 'Connect Claude (Desktop & Web)'}
                {activeModal === 'claude-code' && 'Setup Claude Code CLI'}
                {activeModal === 'cursor' && 'Connect Cursor Editor'}
                {activeModal === 'gemini' && 'Connect Gemini CLI'}
                {activeModal === 'codex' && 'Setup OpenAI Codex MCP'}
                {activeModal === 'explore' && 'Other Supported MCP Tools'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {activeModal === 'claude' && (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    Add SE Ranking tools to your Claude Desktop configuration file (<code>claude_desktop_config.json</code>):
                  </p>
                  <pre className="bg-[#1E293B] text-gray-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
{`{
  "mcpServers": {
    "seranking": {
      "url": "${mcpEndpoint}",
      "headers": {
        "Authorization": "Token ${apiKey}"
      }
    }
  }
}`}
                  </pre>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`{
  "mcpServers": {
    "seranking": {
      "url": "${mcpEndpoint}",
      "headers": {
        "Authorization": "Token ${apiKey}"
      }
    }
  }
}`);
                        alert('Config snippet copied!');
                      }}
                      className="text-[#0B69FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy JSON Config
                    </button>
                    <button
                      onClick={() => toggleConnect('claude')}
                      className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                    >
                      {connectedClients.claude ? 'Disconnect' : 'Mark as Connected'}
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'claude-code' && (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    Run the following command in your terminal to register the SE Ranking MCP server:
                  </p>
                  <div className="bg-[#1E293B] text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
                    claude mcp add seranking {mcpEndpoint} --header &quot;Authorization: Token {apiKey}&quot;
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`claude mcp add seranking ${mcpEndpoint} --header "Authorization: Token ${apiKey}"`);
                        alert('Terminal command copied!');
                      }}
                      className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Copy CLI Command
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'cursor' && (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    In Cursor Settings &gt; Features &gt; MCP, click &ldquo;Add New MCP Server&rdquo; and configure:
                  </p>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div><strong>Name:</strong> <code>SE Ranking MCP</code></div>
                    <div><strong>Type:</strong> <code>SSE</code></div>
                    <div><strong>URL:</strong> <code>{mcpEndpoint}</code></div>
                    <div><strong>Headers:</strong> <code>Authorization: Token {apiKey}</code></div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => toggleConnect('cursor')}
                      className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg font-semibold cursor-pointer"
                    >
                      {connectedClients.cursor ? 'Disconnect' : 'Save & Connect'}
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'gemini' && (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    Connect SE Ranking MCP with Gemini CLI using the standard SSE adapter:
                  </p>
                  <pre className="bg-[#1E293B] text-gray-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
{`gemini mcp connect --url ${mcpEndpoint} --auth "${apiKey}"`}
                  </pre>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 bg-[#0B69FF] text-white rounded-lg font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'codex' && (
                <>
                  <p className="text-gray-600 leading-relaxed">
                    Add to your <code>codex.config.json</code> under the <code>mcp</code> key:
                  </p>
                  <pre className="bg-[#1E293B] text-gray-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
{`{
  "servers": [{
    "name": "se-ranking",
    "url": "${mcpEndpoint}",
    "auth": "Token ${apiKey}"
  }]
}`}
                  </pre>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 bg-[#0B69FF] text-white rounded-lg font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'explore' && (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    SE Ranking supports any client compatible with the Model Context Protocol (MCP) standard:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-medium">⚡ VS Code (Copilot)</div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-medium">⚡ Windsurf (Codeium)</div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-medium">⚡ Zed Editor</div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-medium">⚡ n8n Workflow Automation</div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-medium">⚡ Make.com Integration</div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 font-medium">⚡ LangChain &amp; LlamaIndex</div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 bg-[#0B69FF] text-white rounded-lg font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
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
                <div className="text-xs text-gray-500">Your feedback has been submitted.</div>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="p-5 space-y-3">
                <p className="text-xs text-gray-600">
                  Have feedback about the SE Ranking MCP server? Let us know below:
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
