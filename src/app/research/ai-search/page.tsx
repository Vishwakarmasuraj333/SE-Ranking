'use client';

import React, { useState } from 'react';
import { AiSearchStartForm } from '@/components/research/AiSearchStartForm';
import { AiSearchDashboard } from '@/components/research/AiSearchDashboard';
import { AnalysisOverview } from '@/lib/types';
import { useApp } from '@/components/providers/AppProviders';
import { ChevronDown } from 'lucide-react';

export default function AiSearchPage() {
  const { currentAnalysis, setCurrentAnalysis } = useApp();
  const [viewState, setViewState] = useState<'start' | 'dashboard'>(
    currentAnalysis ? 'dashboard' : 'start'
  );

  const handleAnalysisSuccess = (data: AnalysisOverview) => {
    setCurrentAnalysis(data);
    setViewState('dashboard');
  };

  const handleNewSearch = () => {
    setViewState('start');
  };

  if (viewState === 'dashboard' && currentAnalysis) {
    return (
      <AiSearchDashboard
        analysis={currentAnalysis}
        onNewSearch={handleNewSearch}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F7F9FC] to-white min-h-[calc(100vh-80px)] flex flex-col justify-between select-none">
      {/* Top Header links matching Screenshot 2: Have any questions? and Feedback */}
      <div className="w-full flex items-center justify-end px-6 py-2.5 gap-4 text-xs text-gray-500 border-b border-gray-100 bg-white/50">
        <button
          onClick={() => alert('Support & Help Center: 24/7 dedicated support available.')}
          className="flex items-center gap-1 hover:text-[#0B69FF] transition-colors cursor-pointer"
        >
          <span>Have any questions?</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
        <button
          onClick={() => alert('Feedback: Tell us how we can make your AI Search experience even better!')}
          className="hover:text-[#0B69FF] transition-colors cursor-pointer"
        >
          Feedback
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center py-6">
        <AiSearchStartForm
          initialSearchType="ai-search"
          onAnalysisSuccess={handleAnalysisSuccess}
        />
      </div>

      {/* Footer matching Screenshot 2 */}
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
    </div>
  );
}
