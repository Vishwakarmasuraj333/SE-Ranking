'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Sparkles, BarChart2, Globe, ArrowRight } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';

export default function KeywordResearchPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(SUPPORTED_COUNTRIES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] p-6 text-gray-900 select-none pb-16">
      <div className="max-w-4xl mx-auto space-y-12 pt-4">
        {/* Header Block matching User HTML */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Keyword Research</h1>
          <p className="text-xs text-gray-500">Find the most profitable keywords to rank for</p>
        </div>

        {/* Big Search Input */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-xs p-1.5 flex items-center gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keywords or drop a TXT/CSV file"
            className="flex-1 px-4 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
          />

          <div className="relative border-l border-gray-200 pl-2">
            <button
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-100 text-xs font-medium"
            >
              <span>{selectedCountry.flag}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isCountryOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto w-48 text-xs">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c);
                      setIsCountryOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50 text-gray-700"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => alert(`Analyzing keyword: ${keyword || 'seo software'}`)}
            className="px-5 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>ANALYZE</span>
          </button>
        </div>

        {/* Feature Cards Carousel Block matching Screenshot */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 text-center">
            Investigate keyword parameters down to the core
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-200/80 hover:border-blue-300 transition-colors">
              <div className="text-xl font-extrabold text-[#0B69FF] mb-1">18 / 100</div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Difficulty score</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                See how difficult it will be to rank a web page at the top of Google for a specific keyword.
              </p>
            </div>

            <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-200/80 hover:border-blue-300 transition-colors">
              <div className="text-xl font-extrabold text-[#00A86B] mb-1">880 / mo</div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Search volume</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Find out how many monthly organic searches the selected keyword gets on Google.
              </p>
            </div>

            <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-200/80 hover:border-blue-300 transition-colors">
              <div className="text-xl font-extrabold text-purple-600 mb-1">$1.45 CPC</div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">CPC & Paid Competition</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Discover the average price of a click for a pay-per-click (PPC) Google Ads marketing campaign.
              </p>
            </div>

            <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-200/80 hover:border-blue-300 transition-colors">
              <div className="text-xl font-extrabold text-amber-600 mb-1">190+</div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Global Volume</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Total monthly searches a keyword gets on average across all available regions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
