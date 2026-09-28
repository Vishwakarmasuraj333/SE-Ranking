'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

export default function ApiMcpPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
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

  return (
    <div className="mcp-page w-full min-h-screen bg-[#F4F6F9] py-4 px-4 sm:px-6 font-sans text-[#171B24] flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-4">

        {/* ===================== TOP ROW: BREADCRUMB + FEEDBACK + CREDITS ===================== */}
        <div className="flex items-center justify-between py-1 text-xs">
          <Link
            href="/api-docs"
            className="flex items-center gap-1.5 font-bold text-[#5B6370] hover:text-[#171B24] transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-white border border-[#E1E6EB] flex items-center justify-center text-gray-500 shadow-2xs text-sm font-bold">
              ‹
            </span>
            <span>API Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#2870ED] hover:underline font-semibold text-xs cursor-pointer"
            >
              Feedback
            </button>
            <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-bold border border-[#FDE68A] shadow-2xs">
              <span>🪙</span>
              <span>Credits 100K / 100K ▾</span>
            </div>
          </div>
        </div>

        {/* ===================== MCP BANNER ===================== */}
        <section className="mcp-page__banner mcp-banner bg-[#F0F7FF] border border-[#B8D7FF] rounded-[14px] p-5 shadow-xs flex items-start gap-3.5">
          <span className="shrink-0 mt-0.5 text-[#1976D2]">
            {/* mdi info icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="2rem"
              height="2rem"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              style={{ color: 'rgb(25, 118, 210)' }}
            >
              <path
                fill="currentColor"
                d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
              />
            </svg>
          </span>

          <div className="mcp-banner__body space-y-2 flex-1">
            <div className="mcp-banner__title font-bold text-base text-[#171B24]">
              Connect SE Ranking to your AI tools
            </div>
            <div className="mcp-banner__text text-xs text-[#1E3A8A] leading-relaxed">
              The SE Ranking MCP connects your AI tools to live SEO data in minutes. Analyze backlink profiles, research competitor domains, track AI search visibility, and more — all in natural language, without exporting CSVs, copying dashboards, or copy-pasting data into your AI chat.
            </div>
            <button
              onClick={() => setActiveModal('docs')}
              className="ui-link ui-link_s-m ui-link_a-primary mcp-banner__link inline-flex items-center gap-1 text-xs font-bold text-[#2870ED] hover:underline cursor-pointer pt-1"
              type="button"
            >
              <span className="ui-link__text">View documentation</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16px"
                height="16px"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  fill="currentColor"
                  d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
                />
              </svg>
            </button>
          </div>
        </section>

        {/* ===================== SECTION 1: DATA API KEY ===================== */}
        <section className="mcp-page__section mcp-keys space-y-3">
          <div className="mcp-page__section-header">
            <h2 className="mcp-page__section-title text-base font-bold text-[#171B24]">
              Data API key
            </h2>
            <p className="mcp-page__section-description text-xs text-[#5B6370] mt-0.5">
              The MCP Server uses your API keys to authenticate calls. Keys are managed on the{' '}
              <Link href="/api-docs" className="text-[#2870ED] hover:underline font-semibold">
                API Dashboard
              </Link>.
            </p>
          </div>

          <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-l mcp-keys__card bg-white border border-[#E1E6EB] rounded-[14px] p-5 shadow-xs">
            <div className="mcp-key-row mcp-key-row_active flex flex-wrap items-center justify-between gap-4" data-key-active="true">
              <div className="flex items-center gap-3.5">
                {/* Green Key Icon */}
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-emerald-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                  </svg>
                </div>

                <div className="mcp-key-row__info">
                  <div className="mcp-key-row__title font-bold text-sm text-[#171B24]">
                    API key
                  </div>
                  <div className="mcp-key-row__description text-xs text-[#5B6370] mt-0.5">
                    Research domains, analyze backlinks, track rankings, run audits, monitor AI Search
                  </div>
                </div>
              </div>

              <div className="mcp-key-row__active flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="mcp-key-row__dot w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="mcp-key-row__active-label">Active</span>
                </div>
                <span className="mcp-key-row__divider text-gray-300">•</span>
                <span className="mcp-key-row__tools font-semibold text-[#5B6370]">
                  160+ tools available
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: SERVER ENDPOINT ===================== */}
        <section className="mcp-page__section mcp-server space-y-3">
          <div className="mcp-page__section-header">
            <h2 className="mcp-page__section-title text-base font-bold text-[#171B24]">
              Server endpoint
            </h2>
            <p className="mcp-page__section-description text-xs text-[#5B6370] mt-0.5">
              Copy this URL into any MCP-compatible client.
            </p>
          </div>

          <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-xl uix-bordered-layer_rad-l mcp-server__card bg-white border border-[#E1E6EB] rounded-[14px] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="mcp-server__input flex-1 min-w-[280px]">
              <label className="mcp-server__label block text-[11px] font-bold text-[#7A8391] uppercase tracking-wider mb-1">
                MCP URL
              </label>
              <input
                className="mcp-server__field w-full bg-[#F8FAFC] border border-[#E1E6EB] rounded-[8px] px-3.5 py-2 font-mono text-xs font-semibold text-[#171B24] select-all focus:outline-hidden"
                readOnly
                value={mcpEndpoint}
              />
            </div>

            <button
              onClick={() => copyToClipboard(mcpEndpoint)}
              className="ui-button ui-button_s-l ui-button_a-secondary mcp-server__copy self-end px-5 py-2.5 bg-white border border-[#E1E6EB] hover:bg-[#F2F5F8] text-[#171B24] font-semibold text-xs rounded-[8px] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              type="button"
            >
              <span className="ui-button__content-box">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-[#5D5F65]"
                >
                  <path
                    fill="currentColor"
                    d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
                  />
                </svg>
              </span>
              <span className="ui-button__text font-bold">
                {copiedEndpoint ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
        </section>

        {/* ===================== SECTION 3: CONNECT A CLIENT ===================== */}
        <section className="mcp-page__section mcp-clients space-y-3">
          <div className="mcp-page__section-header">
            <h2 className="mcp-page__section-title text-base font-bold text-[#171B24]">
              Connect a client
            </h2>
            <p className="mcp-page__section-description text-xs text-[#5B6370] mt-0.5">
              One-click connectors for supported tools.
            </p>
          </div>

          <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-l mcp-clients__list bg-white border border-[#E1E6EB] rounded-[14px] divide-y divide-[#F0F2F5] shadow-xs overflow-hidden">
            
            {/* ROW 1: Claude */}
            <div className="mcp-clients__row p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-[#CC785C]/10 border border-[#CC785C]/20 flex items-center justify-center font-bold text-sm text-[#CC785C] shrink-0">
                  <span className="text-lg">✦</span>
                </div>
                <div className="mcp-clients__info">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name font-bold text-sm text-[#171B24]">
                      Claude
                    </span>
                    <span className="mcp-clients__tag mcp-clients__tag_orange text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#E05A1F]">
                      Most popular
                    </span>
                    <span className="mcp-clients__tag mcp-clients__tag_blue text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3FF] text-[#2870ED]">
                      OAuth
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#5B6370] mt-0.5">
                    Web &amp; Desktop · Turn Claude into your SEO analyst
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('claude')}
                className={`ui-button ui-button_s-l ui-button_a-secondary mcp-clients__button px-4 py-2 rounded-[8px] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  connectedClients.claude
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white hover:bg-[#F2F5F8] text-[#171B24] border-[#E1E6EB]'
                }`}
                type="button"
              >
                <span className="ui-button__content-box">
                  {connectedClients.claude ? (
                    <span>✓</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                    >
                      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                    </svg>
                  )}
                </span>
                <span className="ui-button__text font-bold">
                  {connectedClients.claude ? 'Connected' : 'Connect'}
                </span>
              </button>
            </div>

            {/* ROW 2: Claude code */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-[#6E56CF]/10 border border-[#6E56CF]/20 flex items-center justify-center font-bold text-sm text-[#6E56CF] shrink-0">
                  <span className="font-mono text-sm">&gt;_</span>
                </div>
                <div className="mcp-clients__info">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name font-bold text-sm text-[#171B24]">
                      Claude code
                    </span>
                    <span className="mcp-clients__tag mcp-clients__tag_violet text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#6E56CF]">
                      Cli
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#5B6370] mt-0.5">
                    Build SEO tools from your terminal
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('claude-code')}
                className="ui-button ui-button_s-l ui-button_a-secondary mcp-clients__button px-4 py-2 bg-white hover:bg-[#F2F5F8] text-[#171B24] border border-[#E1E6EB] rounded-[8px] font-bold text-xs transition-colors cursor-pointer"
                type="button"
              >
                <span className="ui-button__text">Set up</span>
              </button>
            </div>

            {/* ROW 3: Cursor */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-[#000000]/10 border border-gray-200 flex items-center justify-center font-bold text-sm text-black shrink-0">
                  <span className="text-base font-black">▲</span>
                </div>
                <div className="mcp-clients__info">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name font-bold text-sm text-[#171B24]">
                      Cursor
                    </span>
                    <span className="mcp-clients__tag mcp-clients__tag_blue text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3FF] text-[#2870ED]">
                      OAuth
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#5B6370] mt-0.5">
                    Reference SE Ranking data while you code
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('cursor')}
                className={`ui-button ui-button_s-l ui-button_a-secondary mcp-clients__button px-4 py-2 rounded-[8px] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  connectedClients.cursor
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white hover:bg-[#F2F5F8] text-[#171B24] border-[#E1E6EB]'
                }`}
                type="button"
              >
                <span className="ui-button__content-box">
                  {connectedClients.cursor ? (
                    <span>✓</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16px"
                      height="16px"
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                    >
                      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
                    </svg>
                  )}
                </span>
                <span className="ui-button__text font-bold">
                  {connectedClients.cursor ? 'Connected' : 'Connect'}
                </span>
              </button>
            </div>

            {/* ROW 4: Gemini */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#1E88E5]/20 to-[#8E24AA]/20 border border-[#1E88E5]/30 flex items-center justify-center font-bold text-sm text-[#1E88E5] shrink-0">
                  <span className="text-base">✦</span>
                </div>
                <div className="mcp-clients__info">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name font-bold text-sm text-[#171B24]">
                      Gemini
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#5B6370] mt-0.5">
                    Connect SE Ranking to Gemini CLI
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('gemini')}
                className="ui-button ui-button_s-l ui-button_a-secondary mcp-clients__button px-4 py-2 bg-white hover:bg-[#F2F5F8] text-[#171B24] border border-[#E1E6EB] rounded-[8px] font-bold text-xs transition-colors cursor-pointer"
                type="button"
              >
                <span className="ui-button__text">Set up</span>
              </button>
            </div>

            {/* ROW 5: Codex (CLI & IDE) */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-[#10A37F]/10 border border-[#10A37F]/20 flex items-center justify-center font-bold text-sm text-[#10A37F] shrink-0">
                  <span className="text-base font-mono">{}</span>
                </div>
                <div className="mcp-clients__info">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name font-bold text-sm text-[#171B24]">
                      Codex (CLI &amp; IDE)
                    </span>
                    <span className="mcp-clients__tag mcp-clients__tag_violet text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3EEFF] text-[#6E56CF]">
                      Cli
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#5B6370] mt-0.5">
                    OpenAI Codex with the rmcp client
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal('codex')}
                className="ui-button ui-button_s-l ui-button_a-secondary mcp-clients__button px-4 py-2 bg-white hover:bg-[#F2F5F8] text-[#171B24] border border-[#E1E6EB] rounded-[8px] font-bold text-xs transition-colors cursor-pointer"
                type="button"
              >
                <span className="ui-button__text">Set up</span>
              </button>
            </div>

            {/* ROW 6: Other MCP-compatible tools */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-700 shrink-0">
                  <span className="text-lg">⚙</span>
                </div>
                <div className="mcp-clients__info">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name font-bold text-sm text-[#171B24]">
                      Other MCP-compatible tools
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#5B6370] mt-0.5">
                    VS Code, Gemini CLI, Windsurf, Zed, n8n, Make, and more
                  </div>
                </div>
              </div>

              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noreferrer"
                className="ui-button ui-button_s-l ui-button_a-tertiary mcp-clients__button px-4 py-2 bg-white hover:bg-[#F2F5F8] text-[#171B24] border border-[#E1E6EB] rounded-[8px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="ui-button__text">Explore</span>
                <span className="ui-button__content-box">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 text-[#5D5F65]"
                  >
                    <path
                      fill="currentColor"
                      d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
                    />
                  </svg>
                </span>
              </a>
            </div>

          </div>
        </section>

      </div>

      {/* Footer matching standard SE Ranking in-app footer */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between mt-12">
        <Link href="/projects" className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
          <span>SE Ranking</span>
        </Link>
        <div className="flex items-center gap-5">
          <button onClick={() => setIsBugModalOpen(true)} className="hover:underline text-gray-600 cursor-pointer">
            Report a bug
          </button>
          <Link href="/affiliate" className="hover:underline text-gray-600">
            Affiliates
          </Link>
          <Link href="/api-docs" className="hover:underline text-gray-600">
            API
          </Link>
          <Link href="/whats-new" className="hover:underline text-gray-600">
            What&apos;s new
          </Link>
          <Link href="/help" className="hover:underline text-gray-600">
            Help
          </Link>
        </div>
      </footer>

      {/* Internal Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* ===================== MODAL: CLIENT CONFIGURATION ===================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            {activeModal === 'claude' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">Connect Claude Desktop</h3>
                <p className="text-xs text-[#5B6370]">
                  Add SE Ranking MCP to your <code>claude_desktop_config.json</code>:
                </p>
                <pre className="bg-[#1E293B] text-emerald-400 p-3.5 rounded-lg text-xs font-mono overflow-x-auto">
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
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => toggleConnect('claude')}
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    {connectedClients.claude ? 'Disconnect' : 'Mark as Connected'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'claude-code' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">Set up Claude Code (CLI)</h3>
                <p className="text-xs text-[#5B6370]">Run this command in your terminal:</p>
                <div className="bg-[#1E293B] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between">
                  <code>claude mcp add seranking https://api.seranking.com/mcp</code>
                  <button
                    onClick={() => copyToClipboard('claude mcp add seranking https://api.seranking.com/mcp')}
                    className="ml-2 text-xs text-white hover:text-emerald-300 font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'cursor' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">Connect Cursor IDE</h3>
                <p className="text-xs text-[#5B6370]">
                  Navigate to Cursor Settings → Features → MCP Servers → Add new server:
                </p>
                <div className="bg-[#F8FAFC] border border-[#E1E6EB] p-3 rounded-lg text-xs space-y-1.5 font-mono">
                  <div>Type: <b>SSE</b></div>
                  <div>URL: <b>https://api.seranking.com/mcp</b></div>
                  <div>Header: <b>Authorization: Bearer {apiKey.substring(0, 10)}...</b></div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => toggleConnect('cursor')}
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    {connectedClients.cursor ? 'Disconnect' : 'Mark as Connected'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'gemini' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">Set up Gemini CLI</h3>
                <p className="text-xs text-[#5B6370]">Run this command to bind SE Ranking MCP:</p>
                <div className="bg-[#1E293B] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between">
                  <code>gemini mcp add seranking --url https://api.seranking.com/mcp</code>
                  <button
                    onClick={() => copyToClipboard('gemini mcp add seranking --url https://api.seranking.com/mcp')}
                    className="ml-2 text-xs text-white hover:text-emerald-300 font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'codex' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">Set up Codex / rmcp client</h3>
                <p className="text-xs text-[#5B6370]">Add to rmcp config:</p>
                <div className="bg-[#1E293B] text-emerald-400 p-3.5 rounded-lg text-xs font-mono flex items-center justify-between">
                  <code>rmcp install --server https://api.seranking.com/mcp</code>
                  <button
                    onClick={() => copyToClipboard('rmcp install --server https://api.seranking.com/mcp')}
                    className="ml-2 text-xs text-white hover:text-emerald-300 font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'docs' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171B24]">SE Ranking MCP Documentation</h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  The SE Ranking MCP server exposes 160+ tools covering Keyword Research, Backlinks, Domain Analysis, Rank Tracking, and Website Audit directly to LLMs.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
                  <div className="font-bold">Popular MCP Tool Functions:</div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    <li><code>get_keyword_data(keyword, country_code)</code></li>
                    <li><code>get_domain_backlinks(domain, limit)</code></li>
                    <li><code>get_competitor_rankings(domain)</code></li>
                    <li><code>get_ai_search_overview(query)</code></li>
                  </ul>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 bg-[#2870ED] text-white text-xs font-semibold rounded-lg"
                  >
                    Close
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
