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

const DEFAULT_WORKCOMPOSER_PROJECT: ProjectData = {
  id: 'proj-workcomposer',
  name: 'workcomposer.com',
  domain: 'https://www.workcomposer.com',
  brandName: 'WorkComposer',
  country: 'India',
  countryCode: 'in',
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  analysesCount: 4,
};

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

  const [projects, setProjects] = useState<ProjectData[]>([DEFAULT_WORKCOMPOSER_PROJECT]);
  const [activeProject, setActiveProjectState] = useState<ProjectData | null>(DEFAULT_WORKCOMPOSER_PROJECT);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisOverview | null>(null);
  const [activeRail, setActiveRail] = useState<RailSection>('research');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const setActiveProject = (p: ProjectData | null) => {
    setActiveProjectState(p);
    if (typeof window !== 'undefined') {
      if (p) {
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
        const list: ProjectData[] = (data.projects || []).filter(
          (p: ProjectData) =>
            p.domain.toLowerCase().includes('workcomposer') ||
            p.name.toLowerCase().includes('workcomposer')
        );

        if (list.length > 0) {
          setProjects(list);
          setActiveProject(list[0]);
        } else {
          setProjects([DEFAULT_WORKCOMPOSER_PROJECT]);
          setActiveProject(DEFAULT_WORKCOMPOSER_PROJECT);
        }
      } else {
        setProjects([DEFAULT_WORKCOMPOSER_PROJECT]);
        setActiveProject(DEFAULT_WORKCOMPOSER_PROJECT);
      }
    } catch {
      setProjects([DEFAULT_WORKCOMPOSER_PROJECT]);
      setActiveProject(DEFAULT_WORKCOMPOSER_PROJECT);
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
