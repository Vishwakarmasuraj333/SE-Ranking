'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Info,
  X,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface IndexResult {
  url: string;
  isIndexed: boolean;
  cacheDate: string;
  responseCode: number;
}

export default function IndexStatusCheckerPage() {
  const [showBanner, setShowBanner] = useState(true);
  const [engine, setEngine] = useState('Google');
  const [urlList, setUrlList] = useState('');
  const [checkCache, setCheckCache] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<IndexResult[]>([]);

  const urls = urlList
    .split('\n')
    .map((u) => u.trim())
    .filter((u) => u.length > 0);

  const totalCost = (urls.length * 0.005).toFixed(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlList.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generated: IndexResult[] = urls.map((u, i) => ({
        url: u.startsWith('http') ? u : `https://${u}`,
        isIndexed: i % 4 !== 3,
        cacheDate: '24 Sep 2026, 18:22 GMT',
        responseCode: 200,
      }));
      setResults(generated);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 p-6 select-none">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Breadcrumb & Feedback Header */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="font-semibold text-gray-700">Index Status Checker</div>
          <button
            onClick={() => alert('Feedback dialog opened')}
            className="hover:text-blue-600 font-medium cursor-pointer"
          >
            Feedback
          </button>
        </div>

        {/* Info Banner (Screenshot 6 exact match) */}
        {showBanner && (
          <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 relative flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-gray-400 shrink-0" />
              <span>The Index Status Checker tool allows you to verify if a web page has been indexed by a specific search engine</span>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Form Card (Screenshot 6 exact match) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Check page index status in */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Check page index status in:
              </label>
              <div className="relative max-w-xs">
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] appearance-none bg-white font-medium"
                >
                  <option value="Google">Google</option>
                  <option value="Bing">Bing</option>
                  <option value="Yahoo">Yahoo</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Enter a URL list */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Enter a URL list:
              </label>
              <textarea
                rows={5}
                required
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
                placeholder="https://example.com/page-1&#10;https://example.com/page-2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF] font-mono leading-relaxed"
              />
            </div>

            {/* Check a website's URL in search engine cache */}
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkCache}
                  onChange={(e) => setCheckCache(e.target.checked)}
                  className="rounded text-[#0B69FF]"
                />
                <span>Check a website&apos;s URL in search engine cache</span>
              </label>
            </div>

            {/* Price & Total Amount to be charged */}
            <div className="space-y-1 text-xs">
              <div className="text-gray-500">
                Price: <span className="font-bold text-[#0B69FF]">$0.005</span> per URL
              </div>
              <div className="text-sm font-bold text-gray-900">
                Total amount to be charged: <span className="text-[#0B69FF]">${totalCost}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking Index Status...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Real Results Table */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Indexation Status Results ({results.length} URLs)
              </h3>
              <span className="text-xs text-gray-500">Google Search Index</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Webpage URL</th>
                  <th className="px-4 py-3">Google Index Status</th>
                  <th className="px-4 py-3">HTTP Status</th>
                  <th className="px-4 py-3 text-right">Cache Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-sm truncate">
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {r.url}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {r.isIndexed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" /> Not Indexed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600 font-bold">{r.responseCode} OK</td>
                    <td className="px-4 py-3 text-right text-gray-400 font-mono text-[11px]">{r.cacheDate}</td>
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
