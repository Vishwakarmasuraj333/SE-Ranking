'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Link2,
  CheckCircle2,
  Sparkles,
  FileEdit,
  MapPin,
  PieChart,
  Building2,
  Boxes,
  ThumbsUp,
  Settings,
} from 'lucide-react';
import { useApp, RailSection } from '../providers/AppProviders';

export function LeftRail() {
  const pathname = usePathname();
  const { activeRail, setActiveRail } = useApp();

  const isProjectsActive =
    activeRail === 'projects' ||
    pathname === '/' ||
    pathname === '/projects' ||
    pathname === '/project-overview' ||
    pathname === '/rankings' ||
    pathname === '/analytics' ||
    pathname === '/competitors' ||
    pathname === '/ai-results-tracker' ||
    pathname === '/insights' ||
    pathname === '/marketing-plan' ||
    pathname === '/page-changes' ||
    pathname === '/backlinks-monitor' ||
    pathname.startsWith('/backlinks');

  const railItems: Array<{
    id: RailSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: string;
    badgeColor?: string;
    hasMarker?: boolean;
    isBoxedIcon?: boolean;
    onClick?: () => void;
  }> = [
    {
      id: 'projects',
      label: 'Projects',
      icon: Home,
      href: '/projects',
      onClick: () => setActiveRail('projects'),
    },
    {
      id: 'research',
      label: 'Research',
      icon: Search,
      href: '/research/ai-search',
      onClick: () => setActiveRail('research'),
    },
    {
      id: 'backlinks',
      label: 'Backlinks',
      icon: Link2,
      href: '/backlinks',
      onClick: () => setActiveRail('backlinks'),
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: CheckCircle2,
      hasMarker: true,
      href: '/website-audit',
      onClick: () => setActiveRail('audit'),
    },
    {
      id: 'research',
      label: 'AI Search',
      icon: Sparkles,
      badge: 'New',
      badgeColor: 'bg-[#D1F7C4] text-[#0A5C36]',
      href: '/research/ai-search',
      onClick: () => setActiveRail('research'),
    },
    {
      id: 'content',
      label: 'Content Marketing',
      icon: FileEdit,
      href: '/content-marketing',
      onClick: () => setActiveRail('content'),
    },
    {
      id: 'local',
      label: 'Local Marketing',
      icon: MapPin,
      href: '/local-marketing',
      onClick: () => setActiveRail('local'),
    },
    {
      id: 'reports',
      label: 'Report Builder',
      icon: PieChart,
      href: '/reports',
      onClick: () => setActiveRail('reports'),
    },
    {
      id: 'agency',
      label: 'Agency Pack',
      icon: Building2,
      isBoxedIcon: true,
      href: '/agency-pack',
      onClick: () => setActiveRail('agency'),
    },
    {
      id: 'api',
      label: 'API',
      icon: Boxes,
      href: '/api-docs',
      onClick: () => setActiveRail('api'),
    },
    {
      id: 'smm',
      label: 'SMM',
      icon: ThumbsUp,
      badge: '-20%',
      badgeColor: 'bg-[#EAE6FF] text-[#5E4DB2]',
      href: '/smm',
      onClick: () => setActiveRail('smm'),
    },
  ];

  return (
    <aside className="w-[66px] bg-[#222D3B] text-gray-400 flex flex-col justify-between py-2 border-r border-[#2C3646] select-none shrink-0 z-30">
      {/* Top Navigation Items */}
      <div className="flex flex-col items-center gap-1 overflow-y-auto no-scrollbar">
        {railItems.map((item) => {
          let isActive = false;
          if (item.id === 'projects') {
            isActive = isProjectsActive;
          } else if (item.label === 'AI Search') {
            isActive = pathname.startsWith('/research/ai-search');
          } else if (item.id === 'research') {
            isActive = activeRail === 'research' && pathname.startsWith('/research') && !pathname.startsWith('/research/ai-search');
          } else if (item.id === 'backlinks') {
            isActive = pathname.startsWith('/backlinks') || activeRail === 'backlinks';
          } else if (item.id === 'audit') {
            isActive = pathname.startsWith('/website-audit') || activeRail === 'audit';
          } else if (item.id === 'reports') {
            isActive = pathname.startsWith('/reports') || activeRail === 'reports';
          } else {
            isActive = activeRail === item.id || pathname.startsWith(item.href);
          }

          const Icon = item.icon;

          return (
            <Link
              key={`${item.id}-${item.label}`}
              href={item.href}
              onClick={item.onClick}
              title={item.label}
              className={`w-[58px] min-h-[52px] py-1.5 px-0.5 flex flex-col items-center justify-center rounded-lg transition-all relative group text-center ${
                isActive
                  ? 'bg-[#313E4F] text-white font-medium'
                  : 'hover:bg-white/5 hover:text-gray-200 text-[#9DA8B6]'
              }`}
            >
              {/* Arrow Notch pointing to secondary sidebar when active */}
              {isActive && (
                <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-[#242E3D]" />
              )}

              <div className="relative flex items-center justify-center">
                {item.isBoxedIcon ? (
                  <div className={`p-1 rounded border ${isActive ? 'border-white/40 text-white' : 'border-gray-500/40 text-[#9DA8B6] group-hover:text-white'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <Icon
                    className={`w-[19px] h-[19px] ${
                      isActive ? 'text-white' : 'text-[#9DA8B6] group-hover:text-white'
                    }`}
                  />
                )}

                {item.hasMarker && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] border border-[#222D3B]" />
                )}
              </div>

              <span className="text-[10px] leading-tight px-0.5 mt-1 text-center line-clamp-2 max-w-[56px] font-normal">
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full tracking-tight ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile and Settings */}
      <div className="flex flex-col items-center gap-1 pt-2 border-t border-[#2C3646]">
        <Link
          href="/settings"
          title="Profile & Settings"
          className="w-[50px] h-[48px] rounded-lg flex flex-col items-center justify-center hover:bg-white/5 transition-colors relative group"
        >
          <div className="w-6 h-6 rounded-full bg-blue-600/40 text-blue-200 flex items-center justify-center text-[10px] font-bold border border-blue-400/40">
            SV
          </div>
          <Settings className="w-3 h-3 text-gray-500 group-hover:text-gray-300 mt-0.5" />
        </Link>
      </div>
    </aside>
  );
}
