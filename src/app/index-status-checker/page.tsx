'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Info,
  X,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface IndexResult {
  url: string;
  isIndexed: boolean;
  cacheDate: string;
  responseCode: number;
}

function IndexStatusCheckerContent() {
  const { activeProject } = useApp();
  const searchParams = useSearchParams();
  const isResultsTab = searchParams.get('tab') === 'results';

  const [showBanner, setShowBanner] = useState(true);
  const [engine, setEngine] = useState('Google');
  const [urlList, setUrlList] = useState('');
  const [checkCache, setCheckCache] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<IndexResult[]>([]);

  const urls = urlList
    .split(/[\r\n]+/)
    .map((u) => u.trim())
    .filter(Boolean);

  const totalCost = urls.length > 0 ? (urls.length * 0.005).toFixed(3) : '0';

  const loadSampleUrls = () => {
    const domain = activeProject?.domain || 'https://www.workcomposer.com/';
    const base = domain.replace(/\/$/, '');
    setUrlList(`${base}/\n${base}/features/time-tracking\n${base}/pricing\n${base}/blog/remote-work-productivity-tips\n${base}/contact`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urls.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generated: IndexResult[] = urls.map((u, i) => ({
        url: u.startsWith('http') ? u : `https://${u}`,
        isIndexed: i !== 3,
        cacheDate: checkCache ? '24 Sep 2026, 18:22 GMT' : 'Not requested',
        responseCode: 200,
      }));
      setResults(generated);
      setIsSubmitting(false);
    }, 800);
  };

  const handleExportCsv = () => {
    const headers = ['URL', 'Search Engine', 'Index Status', 'HTTP Code', 'Cache Timestamp'];
    const rows = results.map((r) => [
      `"${r.url}"`,
      engine,
      r.isIndexed ? 'Indexed' : 'Not Indexed',
      `${r.responseCode} OK`,
      `"${r.cacheDate}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'index_status_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none pb-20 relative flex flex-col justify-between">

      <div className="max-w-[1240px] mx-auto p-4 sm:p-6 sm:pt-4 space-y-4 w-full">
        {/* Title / Breadcrumb matching Screenshot 1 */}
        <div className="text-[14px] text-[#8C98A9] font-normal">Index Status Checker</div>

        {/* Notice Info Box matching Screenshot 1 */}
        {showBanner && (
          <div className="p-3 bg-[#F8F9FA] border border-[#E4E8EE] rounded text-[13px] text-[#4E5D78] relative flex items-center justify-between shadow-2xs leading-relaxed max-w-4xl">
            <div className="flex items-center gap-2.5 pr-6">
              <span className="w-4 h-4 rounded-full bg-[#8C98A9] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                i
              </span>
              <span>
                The Index Status Checker tool allows you to verify if a web page has been indexed by a specific search engine
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="text-[#8C98A9] hover:text-gray-700 p-0.5 cursor-pointer shrink-0 font-bold"
              title="Close notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Form matching Screenshot 1 */}
        <div className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Check page index status in */}
            <div>
              <label className="block text-[13px] text-[#4E5D78] font-normal mb-1.5">
                Check page index status in:
              </label>
              <div className="relative w-[280px]">
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-[13px] text-gray-800 bg-white hover:border-[#94A3B8] focus:border-[#0B69FF] focus:outline-hidden appearance-none cursor-pointer pr-8 font-normal"
                >
                  <option value="Google">Google</option>
                  <option value="Yahoo">Yahoo</option>
                  <option value="Bing">Bing</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* URLs Textarea matching Screenshot 1 */}
            <div>
              <div className="flex items-center justify-between w-[440px] max-w-full mb-1">
                <span className="text-[11px] text-gray-400">Enter one URL per line</span>
                <button
                  type="button"
                  onClick={loadSampleUrls}
                  className="text-[11px] text-[#0B69FF] hover:underline font-medium cursor-pointer"
                >
                  + Load sample URLs
                </button>
              </div>
              <textarea
                rows={5}
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
                placeholder=""
                className="w-[440px] max-w-full p-2.5 border border-[#CBD5E1] rounded text-[12px] focus:outline-hidden focus:border-[#0B69FF] font-normal leading-relaxed bg-white text-gray-900"
              />
            </div>

            {/* Check a website's URL in search engine cache */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-[13px] text-[#4E5D78] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checkCache}
                  onChange={(e) => setCheckCache(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                />
                <span>Check a website&apos;s URL in search engine cache</span>
              </label>
            </div>

            {/* Price line matching Screenshot 1 */}
            <div className="text-[13px] text-[#4E5D78] pt-1">
              Price: <span className="font-semibold text-[#0B69FF]">$0.005</span> per URL
            </div>

            {/* Total amount to be charged line matching Screenshot 1 */}
            <div className="text-[16px] text-[#2C384A] font-medium flex items-center gap-1.5 pt-1">
              <span>Total amount to be charged:</span>
              <span className="text-[26px] font-normal text-[#0B69FF]">${totalCost}</span>
            </div>

            {/* Submit Button matching Screenshot 1 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || urls.length === 0}
                className={`w-[140px] py-2 rounded text-[13px] font-normal transition-all cursor-pointer ${
                  urls.length > 0 && !isSubmitting
                    ? 'bg-[#0B69FF] hover:bg-[#005FE0] text-white shadow-xs font-semibold'
                    : 'bg-[#DDE2EA] text-[#8C98A9] cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Checking index...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Real Dynamic Results Table */}
        {results.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200 mt-6">
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Indexation Status Results ({results.length} URLs)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Search Engine: {engine} • Cache Check: {checkCache ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Webpage URL</th>
                    <th className="px-4 py-3 text-center">{engine} Index Status</th>
                    <th className="px-4 py-3 text-center">HTTP Status</th>
                    <th className="px-4 py-3 text-right">Cache Timestamp</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 max-w-md truncate">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#0B69FF] flex items-center gap-1.5"
                        >
                          <span>{r.url}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.isIndexed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Indexed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Not Indexed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-gray-700 font-bold">
                        {r.responseCode} OK
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 font-mono text-[11px]">
                        {r.cacheDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`https://www.google.com/search?q=site:${encodeURIComponent(r.url)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0B69FF] hover:underline font-medium text-xs"
                        >
                          Inspect SERP
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer matching Screenshot 1 */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between mt-12">
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
    </div>
  );
}

export default function IndexStatusCheckerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Index Status Checker...</div>}>
      <IndexStatusCheckerContent />
    </Suspense>
  );
}
