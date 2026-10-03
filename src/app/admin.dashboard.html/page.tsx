'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BarChart2,
  KeyRound,
  Search,
  ExternalLink,
  Play,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { AppFooter } from '@/components/layout/AppFooter';
import ProjectsDashboardPage from '@/app/projects/page';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { setActiveProject, projects } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  if (projects && projects.length > 0) {
    return <ProjectsDashboardPage />;
  }

  const handleProjectCreated = (newProject?: any) => {
    setIsCreateModalOpen(false);
    if (newProject) {
      setActiveProject(newProject);
    }
    router.push('/project-overview');
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F4F6F9] flex flex-col justify-between relative text-gray-900 select-none">
      {/* Top Free Trial Banner matching official SE Ranking screenshot */}
      <div className="w-full bg-[#00A86B] bg-gradient-to-r from-[#00A86B] via-[#059669] to-[#00A86B] text-white px-6 py-2.5 flex items-center justify-between shadow-xs select-none shrink-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <span>You have 4 days of free trial left. Choose your preferred subscription plan to unlock all features.</span>
        </div>
        <a
          href="https://online.seranking.com/admin.subscription.html"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs uppercase px-4 py-1.5 rounded shadow-xs transition-colors shrink-0 tracking-wider ml-4 cursor-pointer"
        >
          SEE PRICING PLANS
        </a>
      </div>

      {/* Floating Feedback button on right margin matching screenshot */}
      <button
        type="button"
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-r-0 border-gray-300 shadow-md text-gray-600 hover:text-[#0B69FF] font-medium text-xs py-2 px-3 rounded-l-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer [writing-mode:vertical-rl] rotate-180"
        title="Leave feedback"
      >
        <span className="rotate-90">
          <MessageSquare className="w-3.5 h-3.5" />
        </span>
        <span className="tracking-wide text-[11px] font-semibold">Feedback</span>
      </button>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto w-full">
        {/* Hero Title & Subtitle */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            All essential SEO tools on one platform
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            SE Ranking will help you fix any SEO related issue—from checking search volume to finding broken links
          </p>
        </div>

        {/* Emerald Green Hero Card (Exact match to uploaded user screenshot) */}
        <div className="w-full bg-[#00A86B] rounded-2xl p-7 sm:p-9 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight">
              Add your first website
            </h2>
            <p className="text-white/90 text-sm font-normal">
              Track your search rankings, audit your site, monitor your competitors
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white hover:bg-gray-50 text-[#00A86B] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider self-start sm:self-center"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ADD WEBSITE</span>
          </button>
        </div>

        {/* 3 SEO Tool Feature Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Card 1: Rankings */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white mb-5 shadow-2xs">
                <BarChart2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Rankings</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Track website rankings and analyze search results to evaluate your SEO strategy
              </p>
            </div>
            <Link
              href="/rankings?tab=summary"
              onClick={() => {
                if (projects && projects.length > 0) {
                  setActiveProject(projects[0]);
                }
              }}
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline"
            >
              <span>Learn more</span>
              <Play className="w-3 h-3 fill-current text-[#0B69FF]" />
            </Link>
          </div>

          {/* Card 2: Keyword Research */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center text-white mb-5 shadow-2xs">
                <KeyRound className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Keyword Research</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Create a target keyword list from scratch or expand your current list of keywords
              </p>
            </div>
            <Link
              href="/research/keyword-research"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline"
            >
              <span>Learn more</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Website Audit */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#10B981] flex items-center justify-center text-white mb-5 shadow-2xs">
                <Search className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Website Audit</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Check 130 website parameters and get tips on how to fix all of the found issues
              </p>
            </div>
            <Link
              href="/audit"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B69FF] hover:underline"
            >
              <span>Learn more</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleProjectCreated}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

    </div>
  );
}
