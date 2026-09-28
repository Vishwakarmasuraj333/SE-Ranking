'use client';

import React, { useState } from 'react';
import { AiSearchStartForm } from '@/components/research/AiSearchStartForm';
import { CompetitiveResearchDashboard } from '@/components/research/CompetitiveResearchDashboard';
import { useApp } from '@/components/providers/AppProviders';
import { ChevronDown, MessageSquare, HelpCircle } from 'lucide-react';

export default function CompetitiveResearchGooglePage() {
  const { activeProject } = useApp();
  const [viewState, setViewState] = useState<'start' | 'dashboard'>('start');
  const [searchTarget, setSearchTarget] = useState({
    domain: activeProject?.domain || 'https://www.workcomposer.com/',
    scope: '*.domain.com/*',
    country: 'United States of America',
    brandName: activeProject?.brandName || 'WorkComposer',
  });

  const handleAnalysisSuccess = (data: any) => {
    setSearchTarget({
      domain: data.domain || activeProject?.domain || 'https://www.workcomposer.com/',
      scope: data.scope || '*.domain.com/*',
      country: data.country || 'United States of America',
      brandName: data.brandName || activeProject?.brandName || '',
    });
    setViewState('dashboard');
  };

  const handleNewSearch = () => {
    setViewState('start');
  };

  if (viewState === 'dashboard') {
    return (
      <CompetitiveResearchDashboard
        domain={searchTarget.domain}
        scope={searchTarget.scope}
        country={searchTarget.country}
        brandName={searchTarget.brandName}
        onNewSearch={handleNewSearch}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F7F9FC] to-white min-h-[calc(100vh-80px)] flex flex-col justify-between select-none">
      {/* Top Header links matching Screenshot 1: Have any questions? and Feedback */}
      <div className="w-full flex items-center justify-end px-6 py-2.5 gap-4 text-xs text-gray-500 border-b border-gray-100 bg-white/50">
        <button
          onClick={() => alert('Support & Help Center: 24/7 dedicated support available.')}
          className="flex items-center gap-1 hover:text-[#0B69FF] transition-colors cursor-pointer"
        >
          <span>Have any questions?</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
        <button
          onClick={() => alert('Feedback: Tell us how we can make your SEO research even better!')}
          className="hover:text-[#0B69FF] transition-colors cursor-pointer"
        >
          Feedback
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center py-6">
        <AiSearchStartForm
          initialSearchType="google-search"
          onAnalysisSuccess={handleAnalysisSuccess}
        />
      </div>

      {/* Footer matching Screenshot 1 */}
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
