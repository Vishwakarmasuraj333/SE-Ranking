'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Layers,
  ChevronDown,
  Tag,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';
import { SCOPE_OPTIONS, SUPPORTED_COUNTRIES } from '@/lib/constants';
import { useApp } from '@/components/providers/AppProviders';

export default function DatabaseExpansionPage() {
  const { activeProject } = useApp();
  const [showAlert, setShowAlert] = useState(true);
  const [domain, setDomain] = useState(activeProject?.domain || '');
  const [scope, setScope] = useState('*.domain.com/*');
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(SUPPORTED_COUNTRIES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [brandName, setBrandName] = useState(activeProject?.brandName || '');
  const [currency, setCurrency] = useState('$ USD');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // Upgrade Modal & Submit Queries Modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitQueriesOpen, setIsSubmitQueriesOpen] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmitQueries = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setSubmittedMessage(
      `Successfully submitted ${
        queryInput.split('\n').filter(Boolean).length
      } search queries for ${domain || 'your domain'}. Analysis will be added within 48 hours.`
    );
    setTimeout(() => {
      setIsSubmitQueriesOpen(false);
      setSubmittedMessage(null);
      setQueryInput('');
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none flex flex-col justify-between">
      <div className="p-4 sm:p-6 w-full space-y-3.5 max-w-[1400px] mx-auto">
        {/* Dismissible Notice Banner matching Screenshot 3 */}
        {showAlert && (
          <div className="p-3.5 sm:p-4 bg-[#F0F6FD] border border-[#D5E6F7] rounded-lg relative text-[12px] text-gray-700 leading-relaxed">
            <button
              onClick={() => setShowAlert(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Close notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="pr-6 mb-1.5">
              We keep our databases squeaky clean and are constantly expanding them. But, of course, we still have a long way to go before we cover every single search request. That&apos;s where you come in! Help us help you by submitting additional search queries for analysis.
            </p>
            <p className="pr-6">
              Have a specific niche that the relevant database doesn&apos;t have any keyword data on? Don&apos;t panic! Just upload a list of all the relevant search queries, and in a few days you&apos;ll get all the information you need, including a complete overview of organic and paid traffic, search queries and competitors.{' '}
              <a
                href="https://help.seranking.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#0B69FF] font-medium hover:underline inline-flex items-center gap-0.5"
              >
                <span>Learn more</span>
              </a>
            </p>
          </div>
        )}

        {/* Header bar matching Screenshot 3: Title left, Questions & Feedback right */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="text-[13px] font-semibold text-gray-800">
            Database Expansion
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button
              onClick={() => alert('Support & Help: 24/7 technical assistance for database requests.')}
              className="flex items-center gap-1 hover:text-[#0B69FF] transition-colors cursor-pointer"
            >
              <span>Have any questions?</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={() => alert('Feedback: Tell us what search engines or queries you need expanded!')}
              className="hover:text-[#0B69FF] transition-colors cursor-pointer"
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Search Controls Row 1 & Row 2 matching Screenshot 3 */}
        <div className="space-y-2">
          {/* Row 1: Domain input, scope, country, brand, analyze */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Input with scope */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white max-w-sm flex-1 min-w-[260px] focus-within:border-[#0B69FF]">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain or URL"
                className="px-3 py-1.5 text-xs flex-1 focus:outline-hidden text-gray-900"
              />
              <div className="relative border-l border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsScopeOpen(!isScopeOpen)}
                  className="px-2.5 py-1.5 text-xs text-gray-600 flex items-center gap-1 hover:bg-gray-100 font-medium cursor-pointer"
                >
                  <Layers className="w-3 h-3 text-gray-500" />
                  <span>{scope}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isScopeOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setScope(opt.id);
                          setIsScopeOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{opt.label}</span>
                        {scope === opt.id && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Country Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white hover:border-gray-400 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <span>{selectedCountry.flag}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isCountryOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto py-1 text-xs">
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c);
                        setIsCountryOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Input */}
            <div className="relative min-w-[180px] max-w-xs flex-1">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter or select brand"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:border-[#0B69FF]"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={() => setIsSubmitQueriesOpen(true)}
              className="px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Analyze
            </button>
          </div>

          {/* Row 2: Currency Selector matching Screenshot 3 */}
          <div className="flex items-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="px-2.5 py-1 border border-gray-300 rounded-md text-xs bg-white hover:border-gray-400 flex items-center gap-1 cursor-pointer font-medium text-gray-700"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isCurrencyOpen && (
                <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                  {['$ USD', '€ EUR', '£ GBP', '₹ INR'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 font-medium"
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diagonal Striped Background Area matching Screenshot 3 */}
        <div
          className="relative rounded-lg border border-gray-200 overflow-hidden min-h-[500px] flex items-center justify-center p-6 text-center"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #F9FBFC 0, #F9FBFC 9px, #FFFFFF 9px, #FFFFFF 18px)',
          }}
        >
          {/* Faint watermark chart elements matching Screenshot 3 background */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              <div className="w-48 h-6 bg-gray-300 rounded-sm" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-400" />
                <div className="w-6 h-6 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-sm" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="w-32 h-4 bg-gray-300 rounded-sm" />
              <div className="w-40 h-4 bg-gray-300 rounded-sm" />
            </div>
          </div>

          {/* Centered Upgrade Card matching Screenshot 3 */}
          <div className="max-w-md mx-auto bg-white/95 rounded-xl p-8 border border-gray-200/90 shadow-sm space-y-3.5 relative z-10">
            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
              Want to submit your search queries for analysis?
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed">
              This feature is only available under the Pro and Business pricing plans. Upgrade your subscription plan to get a comprehensive SERP analysis of your search queries.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-6 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
              >
                UPGRADE SUBSCRIPTION
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer matching Screenshot 3 */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
          <span>SE Ranking</span>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => alert('Bug report dialog opened.')}
            className="hover:underline text-gray-600 cursor-pointer"
          >
            Report a bug
          </button>
          <a
            href="https://seranking.com/affiliate.html"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-gray-600"
          >
            Affiliates
          </a>
          <a href="/api-docs" className="hover:underline text-gray-600">
            API
          </a>
          <a
            href="https://seranking.com/whats-new.html"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-gray-600"
          >
            What&apos;s new
          </a>
          <a
            href="https://help.seranking.com"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-gray-600"
          >
            Help
          </a>
        </div>
      </footer>

      {/* Upgrade Subscription Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B69FF] text-[11px] font-bold uppercase tracking-wider">
                Business Plan
              </span>
              <h3 className="text-lg font-bold text-gray-900 pt-2">
                Business plan unlocks database query expansion
              </h3>
              <p className="text-xs text-gray-500">
                Upgrade to the Business plan or higher to submit custom search queries and keywords to our database expansion engine.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60 space-y-2">
              <div className="flex items-center justify-between font-bold text-sm text-gray-900">
                <span>Pro Plan</span>
                <span className="text-[#0B69FF]">$55 / mo</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Submit up to 5,000 queries / month</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Historical organic & paid search tracking</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Google, Bing & AI search engine coverage</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/pricing"
                className="flex-1 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-lg text-center transition-colors uppercase tracking-wider"
              >
                Go to Pricing Plans
              </Link>
              <button
                type="button"
                onClick={() => {
                  alert('Pro Trial activated for Database Expansion!');
                  setIsUpgradeModalOpen(false);
                }}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Queries Modal */}
      {isSubmitQueriesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setIsSubmitQueriesOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Submit Search Queries for Analysis
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Target Domain: <span className="font-semibold text-gray-800">{domain || 'None entered'}</span> ({selectedCountry.name})
              </p>
            </div>

            {submittedMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{submittedMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitQueries} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Enter Search Queries (one per line)
                  </label>
                  <textarea
                    rows={6}
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder={`employee time tracking software\nremote work productivity tools\nhow to track billable agency hours\nbest alternative to timedoctor in 2026`}
                    className="w-full p-3 text-xs border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#0B69FF] font-mono leading-relaxed"
                  />
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
                    <span>
                      {queryInput.split('\n').filter(Boolean).length} queries entered
                    </span>
                    <span>Max 500 queries per batch</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitQueriesOpen(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!queryInput.trim()}
                    className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Submit for Expansion
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
