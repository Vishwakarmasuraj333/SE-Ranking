'use client';

import React, { useState } from 'react';
import { Info, X, ChevronDown, Upload, CheckCircle2 } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';

export default function KeywordGrouperPage() {
  const [showInfo, setShowInfo] = useState(true);
  const [reportTitle, setReportTitle] = useState('');
  const [searchEngine, setSearchEngine] = useState('Google');
  const [country, setCountry] = useState('United States of America');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('English');
  const [accuracy, setAccuracy] = useState(3);
  const [method, setMethod] = useState('Soft');
  const [queriesText, setQueriesText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const queryCount = queriesText.trim().split('\n').filter((l) => l.trim().length > 0).length;
  const estimatedCost = (queryCount * 0.004).toFixed(3);

  const handleStartGrouping = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryCount === 0) {
      alert('Please enter at least one search query to cluster.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(`Successfully clustered ${queryCount} keywords into groups with accuracy level ${accuracy}.`);
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] p-6 text-gray-900 select-none pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Keyword Grouper</h1>
        </div>

        {/* Info Notification Box matching Screenshot 9 */}
        {showInfo && (
          <div className="p-4 bg-gray-50/90 border border-gray-200 rounded-xl relative text-xs text-gray-700 space-y-1.5">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed pr-6">
                The Keyword Grouper tool automatically buckets keywords into groups based on their SERP result similarity. Keywords are put together into clusters if they get similar results in Google&apos;s top 10 SERPs. Keyword grouping allows you to distribute keywords wisely across a website&apos;s pages which is particularly important for SEO and contextual advertising.
              </p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleStartGrouping} className="space-y-6 text-xs">
          {/* Report Title */}
          <div>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter the report title"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-[#0B69FF]"
            />
          </div>

          {/* Search Engine Settings Header */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Search engine settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Search engine:</label>
                <div className="relative">
                  <select
                    value={searchEngine}
                    onChange={(e) => setSearchEngine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Google">Google</option>
                    <option value="Bing">Bing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Country:</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Location:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City/town or postcode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Enter the location and we will check rankings for the selected region
                </span>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">Google interface language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Hindi">Hindi</option>
                </select>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  You may choose the Google interface language for your country
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Grouping Accuracy (Screenshot 9 & 10) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>Keyword grouping accuracy</span>
              <span className="text-gray-400 text-xs">ℹ</span>
            </h3>

            <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden divide-x divide-gray-300">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setAccuracy(num)}
                  className={`w-9 h-9 font-semibold text-xs transition-colors ${
                    accuracy === num
                      ? 'bg-[#3E8BFF] text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Method (Screenshot 10) */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-gray-900">Method</h3>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="Soft">Soft</option>
              <option value="Hard">Hard</option>
            </select>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-2xl">
              All search queries are compared against the search query with the largest search volume. If the number of top 10 URLs matches the set accuracy level, the search queries are clustered into a group.
            </p>
          </div>

          {/* Search Queries Textarea & Upload (Screenshot 10 & 11) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900">Search volume check</h3>
            <p className="text-[11px] text-gray-500">
              Please enter each search query in a separate row that need to be clustered.
            </p>

            <textarea
              rows={5}
              value={queriesText}
              onChange={(e) => setQueriesText(e.target.value)}
              placeholder="Enter your search queries (one per line)"
              className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#0B69FF]"
            />

            {/* Drag & Drop Dotted Box (Screenshot 11) */}
            <div className="border-2 border-dashed border-blue-300 bg-blue-50/20 rounded-xl p-8 text-center space-y-2">
              <p className="text-xs text-gray-600">
                XLS, XLSX, CSV and text file formats are supported and loadable. Just make sure each new search query is placed in a new row.
              </p>
              <button
                type="button"
                onClick={() => alert('File upload selector opened.')}
                className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
              >
                Choose the file
              </button>
            </div>
          </div>

          {/* Cost & Submit (Screenshot 11) */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-gray-800">Your balance will be charged: </span>
              <span className="font-bold text-emerald-600">${estimatedCost}</span>
              <div className="text-[10px] text-gray-400 mt-0.5">
                * Cost per query: $0.004 | Cost for search volume check: $0.005
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Grouping Keywords...' : 'Start Grouping'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
