'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Info,
  X,
  ChevronDown,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface VolumeResult {
  keyword: string;
  volume: number;
  cpc: string;
  competition: string;
}

export default function SearchVolumeCheckerPage() {
  const [showBanner, setShowBanner] = useState(true);
  const [source, setSource] = useState('Google Keyword Planner');
  const [country, setCountry] = useState('India');
  const [keywordsText, setKeywordsText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<VolumeResult[]>([]);

  const keywordCount = keywordsText
    .split('\n')
    .map((k) => k.trim())
    .filter((k) => k.length > 0).length;

  const totalCost = (keywordCount * 0.005).toFixed(3);

  const handleStartCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordsText.trim()) return;

    setIsChecking(true);
    setTimeout(() => {
      const lines = keywordsText
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const generated: VolumeResult[] = lines.map((k) => ({
        keyword: k,
        volume: Math.floor(Math.random() * 18000) + 1200,
        cpc: `$${(Math.random() * 3 + 0.8).toFixed(2)}`,
        competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      }));

      setResults(generated);
      setIsChecking(false);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Breadcrumb & Feedback Header */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="font-semibold text-gray-700">Search Volume Checker</div>
          <button
            onClick={() => alert('Feedback dialog opened')}
            className="hover:text-blue-600 font-medium cursor-pointer"
          >
            Feedback
          </button>
        </div>

        {/* Blue Info Banner (Screenshot 5 exact match) */}
        {showBanner && (
          <div className="p-4 bg-[#EDF3FC] border border-[#D5E3F7] rounded-xl text-xs text-gray-700 relative flex items-start gap-3">
            <Info className="w-4 h-4 text-[#0B69FF] shrink-0 mt-0.5" />
            <p className="leading-relaxed flex-1">
              Our Search Volume Checker offers statistics on the search volume a specific keyword gets on Google per month. This data will help you predict the traffic volume, evaluate the quality of your semantic core, and discover which keywords can be removed so that you don&apos;t waste resources on promotion.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main 2-Column Interface (Screenshot 5 exact match) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Payment For Checking */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Payment for checking</h3>

              {/* Green Price Box */}
              <div className="bg-[#EAFBF3] border border-[#BCEEDA] rounded-xl p-4 text-center">
                <div className="text-xl font-black text-[#00A86B]">$0.005</div>
                <div className="text-[11px] text-gray-600 mt-0.5 font-medium">Per search query</div>
              </div>

              {/* Gray Balance Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-gray-800">$0</div>
                <div className="text-[11px] text-gray-500 mt-0.5 font-medium">Current balance</div>
              </div>

              {/* Top Up Balance Button */}
              <Link
                href="/api-docs/wallet"
                className="w-full py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors block text-center uppercase tracking-wider shadow-2xs"
              >
                TOP UP BALANCE
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100 text-center">
              <div className="text-xs font-semibold text-gray-700">Total amount to be charged</div>
              <div className="text-2xl font-black text-gray-900 mt-1">${totalCost}</div>
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <form onSubmit={handleStartCheck} className="space-y-4">
              {/* Select a source */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select a source:
                </label>
                <div className="relative">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] appearance-none bg-white font-medium"
                  >
                    <option value="Google Keyword Planner">Google Keyword Planner</option>
                    <option value="Bing Ads Intelligence">Bing Ads Intelligence</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Select country and region */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select country and region:
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] appearance-none bg-white font-medium"
                  >
                    <option value="India">🇮🇳 India</option>
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* List keywords */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <span>List keywords:</span>
                    <span className="text-gray-400 text-[10px]">ℹ</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setKeywordsText("zoho social\nsocial media management\npost scheduler\ninstagram buffer\nhootsuite pricing")}
                    className="text-xs text-[#0B69FF] hover:underline font-semibold cursor-pointer"
                  >
                    Import keywords
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="Enter keywords (one per line)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] font-mono leading-relaxed"
                />
              </div>

              {/* Start Check Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChecking}
                  className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Volumes...</span>
                    </>
                  ) : (
                    <span>START CHECK</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Real Dynamic Results Table */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Volume Analysis Results ({results.length} Keywords)
              </h3>
              <button
                onClick={() => alert('Exporting volume report to CSV...')}
                className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-4 py-3">Monthly Search Volume</th>
                  <th className="px-4 py-3">Estimated CPC</th>
                  <th className="px-4 py-3 text-right">Competition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.keyword}</td>
                    <td className="px-4 py-3 font-bold text-[#0B69FF]">{r.volume.toLocaleString()} / mo</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{r.cpc}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {r.competition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
