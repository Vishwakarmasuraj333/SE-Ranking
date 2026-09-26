'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Layers,
  MessageSquare,
  CheckCircle2,
  Users,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Share2,
  Eye,
  Heart,
  Image as ImageIcon,
  Send,
  Building,
  Check,
  Globe,
} from 'lucide-react';

export default function SmmPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'feed' | 'approvals' | 'analytics'>('calendar');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [brandName, setBrandName] = useState('');

  const platforms = [
    { name: 'Facebook', color: '#1877F2', icon: 'f' },
    { name: 'Instagram', color: '#E4405F', icon: '📸' },
    { name: 'LinkedIn', color: '#0A66C2', icon: 'in' },
    { name: 'YouTube', color: '#FF0000', icon: '▶' },
    { name: 'X / Twitter', color: '#000000', icon: '𝕏' },
    { name: 'TikTok', color: '#010101', icon: '♪' },
    { name: 'Pinterest', color: '#BD081C', icon: 'P' },
    { name: 'Threads', color: '#101010', icon: '@' },
    { name: 'Google Business', color: '#4285F4', icon: 'G' },
  ];

  const testimonials = [
    {
      name: 'James Bishop',
      role: 'Marketing Director, Soapbox Agency',
      quote:
        'Planable integrated into SE Ranking revolutionized our client workflows. Feedback loops dropped from 4 business days to under 15 minutes, and our clients love the visual grid preview.',
      avatarBg: 'bg-emerald-500',
    },
    {
      name: 'Waseem Satardien',
      role: 'Head of Growth, NexBrand Global',
      quote:
        'Having our keyword research data and social publishing calendar under one single roof has completely bridged the gap between our SEO writers and our social distribution team.',
      avatarBg: 'bg-blue-600',
    },
    {
      name: 'Elena Rostova',
      role: 'Chief Creative Officer, Kaida Studio',
      quote:
        'Multi-level approval workflows with custom roles prevent accidental posts. It is by far the cleanest social scheduling UI on the market today.',
      avatarBg: 'bg-purple-600',
    },
  ];

  const scheduledPosts = [
    {
      id: 1,
      network: 'Instagram',
      netColor: '#E4405F',
      date: 'Today, 3:30 PM',
      title: 'Top 5 AI Search Trends for 2027',
      copy: 'Are you optimizing for Perplexity and ChatGPT yet? Here are the exact factors that drive AI citations this quarter. 🚀 #SEO #AISearch #Growth',
      status: 'Approved',
      statusBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      likes: 142,
      comments: 29,
    },
    {
      id: 2,
      network: 'LinkedIn',
      netColor: '#0A66C2',
      date: 'Tomorrow, 9:00 AM',
      title: 'Product Launch: SE Ranking MCP Server',
      copy: 'We are thrilled to announce our native Model Context Protocol support. Query rankings and keyword data directly inside Claude and Cursor! ⚡',
      status: 'Scheduled',
      statusBg: 'bg-blue-50 text-blue-700 border-blue-200',
      likes: 384,
      comments: 52,
    },
    {
      id: 3,
      network: 'X / Twitter',
      netColor: '#000000',
      date: 'Sep 28, 11:15 AM',
      title: 'Google Algorithm Update Analysis',
      copy: 'We analyzed over 2.4 million SERPs following the September rollout. Here is what changed in domain authority weightings: 🧵👇',
      status: 'In Review',
      statusBg: 'bg-amber-50 text-amber-700 border-amber-200',
      likes: 89,
      comments: 14,
    },
  ];

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800">
      {/* Top Banner: Planable Promo */}
      <div className="bg-gradient-to-r from-[#5B45F6] via-[#7B57FF] to-[#9B62FF] text-white py-2.5 px-6 flex items-center justify-between text-xs font-medium shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-white font-extrabold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
            Planable by SE Ranking
          </span>
          <span className="font-semibold">Get 20% discount on all plans</span>
          <span className="hidden md:inline text-white/80">
            • Streamline visual content approvals across 9 social networks
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddBrandOpen(true)}
            className="bg-white text-[#5B45F6] hover:bg-gray-100 font-bold px-3 py-1 rounded text-xs transition-colors shadow-2xs cursor-pointer"
          >
            Claim 20% Off
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Social Media Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Plan, collaborate, and approve social content 6x faster.
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Connect your brand accounts, invite team members and clients, preview posts exactly as they appear live, and publish seamlessly across all channels.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsAddBrandOpen(true)}
                className="px-5 py-2.5 bg-[#5B45F6] hover:bg-[#4E39E0] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ADD FIRST BRAND</span>
              </button>
              <button
                onClick={() => setIsTourOpen(true)}
                className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Get a quick tour
              </button>
            </div>
          </div>

          {/* Social Platforms Row */}
          <div className="w-full lg:w-auto bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
            <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Supported Channels
            </div>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs hover:border-purple-300 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Workspace Preview */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Workspace navigation bar */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Workspace:</span>
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Zoho Social Global (zohosocial.com)
              </span>
            </div>

            {/* Tab switchers */}
            <div className="flex items-center bg-gray-200/80 p-1 rounded-xl text-xs font-bold text-gray-600">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'hover:text-gray-900'
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'feed'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'hover:text-gray-900'
                }`}
              >
                Feed Preview
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'approvals'
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'hover:text-gray-900'
                }`}
              >
                Approvals (2)
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-50/60 border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: post.netColor }}
                        />
                        <span className="text-xs font-bold text-gray-800">{post.network}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.statusBg}`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {post.date}
                    </div>

                    <h4 className="text-xs font-bold text-gray-900">{post.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {post.copy}
                    </p>

                    <div className="h-32 bg-gray-200/70 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
                      <ImageIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                      Visual Asset Preview
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 hover:text-red-600 cursor-pointer">
                        <Heart className="w-3.5 h-3.5" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                      </span>
                    </div>
                    <button
                      onClick={() => alert(`Reviewing post: "${post.title}"`)}
                      className="text-xs font-bold text-[#5B45F6] hover:underline cursor-pointer"
                    >
                      Review →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Trusted by 40,000+ Teams
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                What marketers are saying about Planable
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )
                }
                className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev === testimonials.length - 1 ? 0 : prev + 1
                  )
                }
                className="w-9 h-9 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-purple-50/40 border border-purple-100 rounded-xl space-y-4">
            <p className="text-sm font-medium text-gray-800 italic leading-relaxed">
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-xs ${testimonials[activeTestimonial].avatarBg}`}
              >
                {testimonials[activeTestimonial].name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="text-[11px] text-gray-500">
                  {testimonials[activeTestimonial].role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Brand Modal */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#5B45F6]" />
                Add New Brand Workspace
              </h3>
              <button
                onClick={() => setIsAddBrandOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Brand workspace "${brandName || 'My Brand'}" initialized with 20% discount coupon applied!`);
                setIsAddBrandOpen(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Brand / Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp, Nike EMEA"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5B45F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select initial networks to link
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'X', 'TikTok'].map((n) => (
                    <label
                      key={n}
                      className="flex items-center gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      <input type="checkbox" defaultChecked className="rounded text-[#5B45F6]" />
                      <span>{n}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-[11px] text-purple-900 font-medium">
                🎁 20% discount code <strong>PLANABLE20</strong> will be automatically applied at checkout.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5B45F6] hover:bg-[#4E39E0] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tour Walkthrough Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#5B45F6] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Tour: Planable by SE Ranking
              </h3>
              <button
                onClick={() => setIsTourOpen(false)}
                className="text-white/80 hover:text-white text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-gray-700 leading-relaxed">
              <p>
                <strong>1. Unified Content Calendar:</strong> Drag-and-drop posts across 9 social networks in one central month, week, or day view.
              </p>
              <p>
                <strong>2. Exact Mockup Rendering:</strong> Preview pixel-perfect Instagram grids, LinkedIn carousels, and X threads before anything publishes.
              </p>
              <p>
                <strong>3. Client Approvals:</strong> Set up multi-level sign-offs so no post goes live without stakeholder sign-off.
              </p>
              <p>
                <strong>4. SEO &amp; Social Synergy:</strong> Cross-reference ranking performance and trending keywords directly inside post captions.
              </p>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="px-5 py-2 bg-[#5B45F6] text-white font-bold rounded-lg text-xs hover:bg-[#4E39E0] cursor-pointer"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
