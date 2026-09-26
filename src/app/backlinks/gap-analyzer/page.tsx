'use client';

import React, { useState } from 'react';
import {
  Info,
  X,
  Plus,
  Trash2,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface GapDomainItem {
  id: string;
  domain: string;
  domainTrust: number;
  mainDomainCount: number;
  competitorCounts: Record<string, number>;
  opportunityScore: 'High' | 'Medium' | 'Low';
  commonAnchor: string;
}

export default function BacklinkGapAnalyzerPage() {
  const { activeProject } = useApp();

  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [mainType, setMainType] = useState('*.domain.com/*');
  const [mainDomain, setMainDomain] = useState(activeProject?.domain || 'zohosocial.com');

  // Competitor rows
  const [competitors, setCompetitors] = useState<Array<{ id: string; type: string; url: string }>>([
    { id: 'comp-1', type: '*.domain.com/*', url: 'hootsuite.com' },
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<GapDomainItem[] | null>(null);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'common' | 'all'>('opportunities');

  const addCompetitor = () => {
    if (competitors.length >= 5) return;
    setCompetitors([
      ...competitors,
      { id: `comp-${Date.now()}`, type: '*.domain.com/*', url: '' },
    ]);
  };

  const removeCompetitor = (id: string) => {
    if (competitors.length <= 1) return;
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  const updateCompetitor = (id: string, field: 'type' | 'url', val: string) => {
    setCompetitors(
      competitors.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainDomain) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      // Deterministic gap analysis generation
      const comp1 = competitors[0]?.url || 'competitor.com';
      const comp2 = competitors[1]?.url;

      const generated: GapDomainItem[] = [
        {
          id: 'gap-1',
          domain: 'techcrunch.com',
          domainTrust: 93,
          mainDomainCount: 0,
          competitorCounts: { [comp1]: 4, ...(comp2 ? { [comp2]: 3 } : {}) },
          opportunityScore: 'High',
          commonAnchor: 'best social media tools',
        },
        {
          id: 'gap-2',
          domain: 'forbes.com',
          domainTrust: 91,
          mainDomainCount: 1,
          competitorCounts: { [comp1]: 7, ...(comp2 ? { [comp2]: 5 } : {}) },
          opportunityScore: 'High',
          commonAnchor: 'marketing software suite',
        },
        {
          id: 'gap-3',
          domain: 'socialmediaexaminer.com',
          domainTrust: 86,
          mainDomainCount: 0,
          competitorCounts: { [comp1]: 12, ...(comp2 ? { [comp2]: 9 } : {}) },
          opportunityScore: 'High',
          commonAnchor: 'post scheduler and calendar',
        },
        {
          id: 'gap-4',
          domain: 'hubspot.com',
          domainTrust: 89,
          mainDomainCount: 2,
          competitorCounts: { [comp1]: 3, ...(comp2 ? { [comp2]: 2 } : {}) },
          opportunityScore: 'Medium',
          commonAnchor: 'integrations guide',
        },
        {
          id: 'gap-5',
          domain: 'g2.com',
          domainTrust: 88,
          mainDomainCount: 1,
          competitorCounts: { [comp1]: 1, ...(comp2 ? { [comp2]: 1 } : {}) },
          opportunityScore: 'Low',
          commonAnchor: 'reviews and ratings',
        },
        {
          id: 'gap-6',
          domain: 'businessinsider.com',
          domainTrust: 90,
          mainDomainCount: 0,
          competitorCounts: { [comp1]: 6, ...(comp2 ? { [comp2]: 4 } : {}) },
          opportunityScore: 'High',
          commonAnchor: 'enterprise marketing tools',
        },
      ];

      setResults(generated);
      setIsAnalyzing(false);
    }, 700);
  };

  const filteredResults = results?.filter((item) => {
    if (activeTab === 'opportunities') return item.mainDomainCount === 0;
    if (activeTab === 'common') return item.mainDomainCount > 0;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F6F9] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-16 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full px-6 py-5 space-y-6">
        {/* Dismissable Info Banner matching Screenshot 3 */}
        {showInfoBanner && (
          <div className="p-4 bg-white border border-[#0B69FF]/20 rounded-xl relative text-xs text-gray-700 flex items-start gap-3 shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-[#0B69FF]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5 text-[#0B69FF]" />
            </div>
            <div className="pr-6 space-y-1">
              <p className="leading-relaxed">
                Backlink Gap Analyzer discovers domains/URLs that are already linking to your
                competitors but not to the main domain/URL, and finds backlinks that you have in common.
                It will help you build high-quality links, rank better in search engines, and drive more
                traffic to your website.
              </p>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Breadcrumb & Limit Badge */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="text-gray-600 font-medium">Backlink Gap Analyzer</span>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Account limit 0 / 10</span>
            <span className="text-gray-400 cursor-help" title="Daily backlink check credits">
              ⓘ
            </span>
          </div>
        </div>

        {/* Main Form Card matching Screenshot 3 & 4 */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-2xs space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Backlink Gap Analyzer</h1>
          </div>

          <form onSubmit={handleRunAnalysis} className="space-y-4 max-w-2xl mx-auto">
            {/* Main Domain Row */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-4">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Type</label>
                <select
                  value={mainType}
                  onChange={(e) => setMainType(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-[#0B69FF]"
                >
                  <option value="*.domain.com/*">*.domain.com/* (Domain with subdomains)</option>
                  <option value="URL">URL (Exact URL)</option>
                  <option value="domain.com/*">domain.com/* (Domain without subdomains)</option>
                </select>
              </div>

              <div className="col-span-8">
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  The main domain/URL for comparison
                </label>
                <input
                  type="text"
                  value={mainDomain}
                  onChange={(e) => setMainDomain(e.target.value)}
                  placeholder="Domain/URL"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#0B69FF]"
                  required
                />
              </div>
            </div>

            {/* Competitor Rows */}
            {competitors.map((comp, idx) => (
              <div key={comp.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Type</label>
                  <select
                    value={comp.type}
                    onChange={(e) => updateCompetitor(comp.id, 'type', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-[#0B69FF]"
                  >
                    <option value="*.domain.com/*">*.domain.com/*</option>
                    <option value="URL">URL</option>
                    <option value="domain.com/*">domain.com/*</option>
                  </select>
                </div>

                <div className="col-span-8 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {idx === 0 ? "Competitor's domain/URL" : `Competitor #${idx + 1}`}
                    </label>
                    <input
                      type="text"
                      value={comp.url}
                      onChange={(e) => updateCompetitor(comp.id, 'url', e.target.value)}
                      placeholder="Domain/URL"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#0B69FF]"
                      required
                    />
                  </div>

                  {competitors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCompetitor(comp.id)}
                      className="text-gray-400 hover:text-red-500 mt-5 p-1 cursor-pointer"
                      title="Remove competitor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Competitor Action */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={addCompetitor}
                disabled={competitors.length >= 5}
                className={`font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  competitors.length >= 5
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-[#0B69FF] hover:underline'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add competitor</span>
              </button>
              <span className="text-gray-400 text-[11px]">You can add up to 5 competitors</span>
            </div>

            {/* Plan Info Card matching Screenshot 3 */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0B69FF] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Your subscription plan allows checking up to 10 domains/URLs per day. 1 domain/URL
                analysis equals 1 limit. Limits are shared between Backlink Checker and Backlink Gap
                Analyzer. Adding a domain/URL over the limit will cost you $1.
              </p>
            </div>

            {/* Bottom Submit Action */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 font-medium">Account limit 0 / 10</div>
              <button
                type="submit"
                disabled={isAnalyzing || !mainDomain}
                className={`px-8 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  !isAnalyzing && mainDomain
                    ? 'bg-[#0B69FF] hover:bg-[#005FE0] text-white shadow-xs'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? 'Analyzing gap...' : 'RUN ANALYSIS'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">
                  Gap Analysis Results ({filteredResults?.length || 0})
                </span>
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'opportunities'
                        ? 'bg-white shadow-2xs text-[#0B69FF]'
                        : 'text-gray-600'
                    }`}
                  >
                    Opportunities (Only Competitors)
                  </button>
                  <button
                    onClick={() => setActiveTab('common')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'common'
                        ? 'bg-white shadow-2xs text-emerald-700'
                        : 'text-gray-600'
                    }`}
                  >
                    Common Backlinks
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-white shadow-2xs text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    All Domains
                  </button>
                </div>
              </div>

              <a
                href={`/api/export?format=csv&domain=${mainDomain}&type=backlink-gap`}
                download
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-gray-200">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Referring Domain</th>
                      <th className="p-3 text-center">DT</th>
                      <th className="p-3 text-center">{mainDomain} (You)</th>
                      {competitors.map((c) => (
                        <th key={c.id} className="p-3 text-center">
                          {c.url || 'Competitor'}
                        </th>
                      ))}
                      <th className="p-3 text-center">Opportunity</th>
                      <th className="p-3">Anchor Concept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredResults?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-semibold text-gray-900 flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.domain}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-50 text-[#0B69FF]">
                            {item.domainTrust}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              item.mainDomainCount > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {item.mainDomainCount}
                          </span>
                        </td>
                        {competitors.map((c) => (
                          <td key={c.id} className="p-3 text-center font-bold text-gray-700">
                            {item.competitorCounts[c.url] || 0}
                          </td>
                        ))}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.opportunityScore === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : item.opportunityScore === 'Medium'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.opportunityScore}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 italic truncate max-w-xs">
                          &ldquo;{item.commonAnchor}&rdquo;
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer matching SE Ranking screenshots */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between mt-8">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
          <span>SE Ranking</span>
        </div>
        <div className="flex items-center gap-5">
          <button className="hover:underline text-gray-600">Report a bug</button>
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
