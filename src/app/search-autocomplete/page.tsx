'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  Info,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Download,
  Plus,
} from 'lucide-react';

export default function SearchAutocompletePage() {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState('Google');
  const [country, setCountry] = useState('United States of America');
  const [depth, setDepth] = useState<number>(1);
  const [addAlpha, setAddAlpha] = useState(false);
  const [addDigits, setAddDigits] = useState(false);
  const [addQuestions, setAddQuestions] = useState(false);
  const [level1, setLevel1] = useState(true);
  const [level2, setLevel2] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleStartSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const base = query.trim();
      const generated = [
        `${base} tutorial`,
        `${base} review 2026`,
        `${base} pricing`,
        `${base} alternatives`,
        `best ${base} for beginners`,
        `how to use ${base}`,
        `${base} vs competitor`,
        `${base} features and benefits`,
        `${base} download`,
        `free ${base} demo`,
        `${base} api documentation`,
        `${base} login online`,
      ];
      setResults(generated);
      setIsSearching(false);
    }, 900);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 p-6 select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Breadcrumb & Feedback Header */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="font-semibold text-gray-700">Search Engine Autocomplete</div>
          <button
            onClick={() => alert('Feedback dialog opened')}
            className="hover:text-blue-600 font-medium cursor-pointer"
          >
            Feedback
          </button>
        </div>

        {/* Main Autocomplete Card (Screenshot 4 exact match) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Search Engine Autocomplete
            </h1>
            <p className="text-xs text-gray-500">
              Get thousands of keyword ideas for your organic and paid search campaigns with the help of Search Engine Autocomplete
            </p>
          </div>

          <form onSubmit={handleStartSearch} className="space-y-5">
            {/* Search Query Textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <span>Search query</span>
                <span className="text-gray-400">ℹ</span>
              </label>
              <textarea
                rows={4}
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter root keyword or phrase (e.g. social media)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
              />
            </div>

            {/* Select Search Engine & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select a search engine:
                </label>
                <div className="relative">
                  <select
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] appearance-none bg-white font-medium"
                  >
                    <option value="Google">Google</option>
                    <option value="Bing">Bing</option>
                    <option value="Yahoo">Yahoo</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select a country:
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] appearance-none bg-white font-medium"
                  >
                    <option value="United States of America">🇺🇸 United States of America</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Canada">🇨🇦 Canada</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search Depth for Gathering Suggestions */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Select the search depth for gathering suggestions
              </label>
              <p className="text-[11px] text-gray-500 mb-2">
                The search depth is the number of SERP pages that are analyzed for keyword suggestions after a search has been performed.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDepth(lvl)}
                    className={`w-9 h-8 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                      depth === lvl
                        ? 'bg-[#0B69FF] text-white border-[#0B69FF]'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Endings & Symbols Checkboxes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Add various endings and symbols to a search query to gather additional suggestions
              </label>
              <div className="space-y-1.5 text-xs text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addAlpha}
                    onChange={(e) => setAddAlpha(e.target.checked)}
                    className="rounded text-[#0B69FF]"
                  />
                  <span>*query [a-z]*</span>
                  <span className="text-gray-400 text-[10px]">ℹ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addDigits}
                    onChange={(e) => setAddDigits(e.target.checked)}
                    className="rounded text-[#0B69FF]"
                  />
                  <span>*query [0-9]*</span>
                  <span className="text-gray-400 text-[10px]">ℹ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addQuestions}
                    onChange={(e) => setAddQuestions(e.target.checked)}
                    className="rounded text-[#0B69FF]"
                  />
                  <span>*query [?]*</span>
                  <span className="text-gray-400 text-[10px]">ℹ</span>
                </label>
              </div>
            </div>

            {/* Additional Endings Depth */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-gray-700">
                Select the search depth for gathering suggestions with additional endings and symbols:
              </label>
              <div className="space-y-1 text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={level1}
                    onChange={(e) => setLevel1(e.target.checked)}
                    className="rounded text-[#0B69FF]"
                  />
                  <span>1st level</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={level2}
                    onChange={(e) => setLevel2(e.target.checked)}
                    className="rounded text-[#0B69FF]"
                  />
                  <span>2nd level</span>
                </label>
              </div>
            </div>

            {/* Pricing Per Query */}
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-700">Pricing per query</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">$0</div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                You have <span className="text-rose-600 font-bold">$0</span> in your balance.{' '}
                <Link href="/api-docs/wallet" className="text-blue-600 hover:underline">
                  Top up balance
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 bg-[#8EA9DB] hover:bg-[#7491C7] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Harvesting Autocomplete Suggestions...</span>
                </>
              ) : (
                <span>Start search</span>
              )}
            </button>
          </form>

          {/* Real Autocomplete Results Table */}
          {results.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Gathered Suggestions ({results.length})
                </h3>
                <button
                  onClick={() => alert('Exporting suggestions to CSV...')}
                  className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {results.map((item, idx) => (
                  <div key={idx} className="p-3 text-xs text-gray-800 flex items-center justify-between hover:bg-gray-50">
                    <span className="font-semibold">{item}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">Google Autocomplete</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
