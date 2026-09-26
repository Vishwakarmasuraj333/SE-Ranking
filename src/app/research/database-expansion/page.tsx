'use client';

import React, { useState } from 'react';
import { Info, X, Globe, Tag, ChevronDown } from 'lucide-react';
import { SCOPE_OPTIONS, SUPPORTED_COUNTRIES } from '@/lib/constants';

export default function DatabaseExpansionPage() {
  const [showAlert, setShowAlert] = useState(true);
  const [domain, setDomain] = useState('');
  const [scope, setScope] = useState('*.domain.com/*');
  const [isScopeOpen, setIsScopeOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] p-6 text-gray-900 select-none">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Info Box matching Screenshot 6 */}
        {showAlert && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl relative text-xs text-gray-700 space-y-2">
            <button
              onClick={() => setShowAlert(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Info className="w-4 h-4 text-[#0B69FF]" />
              <span>How does it work?</span>
            </div>
            <p className="leading-relaxed">
              We aim to keep our databases squeaky clean and are constantly expanding them. But, of course, we still have a long way to go before we cover every single search request out there 🎯; This is where you come in! Help us help you by submitting additional search queries for analysis.
            </p>
            <p className="leading-relaxed">
              Suppose you have a specific niche that the relevant database doesn&apos;t have any keyword data on. Don&apos;t panic! Just upload a list of all the relevant search queries, and in a month&apos;s time, you&apos;ll get all the information you need, including a complete overview of organic and paid traffic, search queries and competitors.{' '}
              <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="text-[#0B69FF] font-semibold hover:underline">
                Learn more
              </a>
            </p>
          </div>
        )}

        {/* Title */}
        <div>
          <div className="text-xs text-gray-400 mb-1">Competitive Research &gt; Database Expansion</div>
          <h1 className="text-xl font-bold text-gray-900">Database Expansion</h1>
        </div>

        {/* Form Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white flex-1 min-w-[280px]">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain or URL"
                className="px-3.5 py-2 text-xs flex-1 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setIsScopeOpen(!isScopeOpen)}
                className="px-3 py-2 border-l border-gray-200 text-xs text-gray-600 flex items-center gap-1 bg-gray-50"
              >
                <span>{scope}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white flex items-center gap-1.5">
              <span>🇺🇸</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            <div className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-500">
              Enter or select brand
            </div>

            <button className="px-5 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded cursor-not-allowed">
              Analyze
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
            <div className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white flex items-center gap-1">
              <span>September 2026</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            <div className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white flex items-center gap-1">
              <span>$ USD</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Diagonal stripes upgrade container matching Screenshot 6 */}
        <div className="relative rounded-xl border border-gray-200 overflow-hidden p-12 text-center bg-repeating-linear-gradient">
          <div className="max-w-md mx-auto space-y-3 z-10 relative">
            <h3 className="text-base font-bold text-gray-900">Want to submit your search queries for analysis?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This feature is only available under the Pro and Business pricing plans. Upgrade your subscription plan to get a comprehensive SERP analysis of your search queries.
            </p>
            <button
              onClick={() => alert('Upgrade modal: Business plan unlocks database query expansion.')}
              className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-wider shadow-sm"
            >
              UPGRADE SUBSCRIPTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
