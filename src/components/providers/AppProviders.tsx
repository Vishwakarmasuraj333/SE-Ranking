'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectData, AnalysisOverview } from '@/lib/types';

export type RailSection =
  | 'projects'
  | 'research'
  | 'backlinks'
  | 'audit'
  | 'reports'
  | 'content'
  | 'local'
  | 'agency'
  | 'api'
  | 'smm';

interface AppContextType {
  activeProject: ProjectData | null;
  setActiveProject: (p: ProjectData | null) => void;
  projects: ProjectData[];
  refreshProjects: () => Promise<void>;
  currentAnalysis: AnalysisOverview | null;
  setCurrentAnalysis: (a: AnalysisOverview | null) => void;
  activeRail: RailSection;
  setActiveRail: (r: RailSection) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (c: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (o: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProviders');
  }
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeProject, setActiveProjectState] = useState<ProjectData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisOverview | null>(null);
  const [activeRail, setActiveRail] = useState<RailSection>('research');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const setActiveProject = (p: ProjectData | null) => {
    setActiveProjectState(p);
    if (typeof window !== 'undefined') {
      if (p?.id) {
        localStorage.setItem('se_ranking_active_project_id', p.id);
      } else {
        localStorage.removeItem('se_ranking_active_project_id');
      }
    }
  };

  const refreshProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        let list: ProjectData[] = data.projects || [];

        // Merge any client-created projects from localStorage
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('se_ranking_user_projects') : null;
          if (stored) {
            const localList: ProjectData[] = JSON.parse(stored);
            const existingIds = new Set(list.map((p) => p.id));
            const existingDomains = new Set(list.map((p) => p.domain.toLowerCase()));
            for (const lp of localList) {
              if (!existingIds.has(lp.id) && !existingDomains.has(lp.domain.toLowerCase())) {
                list = [lp, ...list];
              }
            }
          }
        } catch (e) {
          // ignore
        }

        setProjects(list);
        if (list.length > 0) {
          let selected = null;
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('se_ranking_active_project_id') : null;
          if (savedId) {
            selected = list.find((p: ProjectData) => p.id === savedId);
          }
          if (!selected) {
            selected = list.find(
              (p: ProjectData) =>
                p.domain.toLowerCase().includes('workcomposer') ||
                p.name.toLowerCase().includes('workcomposer')
            );
          }
          setActiveProject(selected || list[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load projects from server, loading from local cache:', e);
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('se_ranking_user_projects') : null;
        if (stored) {
          const localList: ProjectData[] = JSON.parse(stored);
          if (localList.length > 0) {
            setProjects(localList);
            setActiveProject(localList[0]);
          }
        }
      } catch (err) {
        // ignore
      }
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          activeProject,
          setActiveProject,
          projects,
          refreshProjects,
          currentAnalysis,
          setCurrentAnalysis,
          activeRail,
          setActiveRail,
          isSidebarCollapsed,
          setIsSidebarCollapsed,
          isMobileDrawerOpen,
          setIsMobileDrawerOpen,
        }}
      >
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
