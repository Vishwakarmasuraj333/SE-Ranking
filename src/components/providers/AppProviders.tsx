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
  hasCreatedProject: boolean;
  setHasCreatedProject: (v: boolean) => void;
  isAddWebsiteModalOpen: boolean;
  setIsAddWebsiteModalOpen: (o: boolean) => void;
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

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeProject, setActiveProjectState] = useState<ProjectData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisOverview | null>(null);
  const [activeRail, setActiveRail] = useState<RailSection>('projects');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hasCreatedProject, setHasCreatedProjectState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('se_ranking_has_project');
      if (stored !== null) return stored === 'true';
    }
    return true; // Default to true so sidebars and navigation are instantly accessible
  });
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);

  const setHasCreatedProject = (v: boolean) => {
    setHasCreatedProjectState(v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('se_ranking_has_project', v ? 'true' : 'false');
    }
  };

  const setActiveProject = (p: ProjectData | null) => {
    setActiveProjectState(p);
    if (typeof window !== 'undefined') {
      if (p) {
        localStorage.setItem('se_ranking_active_project_id', p.id);
        localStorage.setItem('se_ranking_has_project', 'true');
        setHasCreatedProjectState(true);
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
        const list: ProjectData[] = data.projects || [];
        setProjects(list);

        if (list.length > 0) {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('se_ranking_active_project_id') : null;
          const matched = savedId ? list.find((p) => p.id === savedId) : null;
          const current = matched || list[0];
          setActiveProjectState(current);
          setHasCreatedProjectState(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('se_ranking_has_project', 'true');
            if (!savedId) {
              localStorage.setItem('se_ranking_active_project_id', current.id);
            }
          }
        }
      }
    } catch {
      // network fallback
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
          hasCreatedProject,
          setHasCreatedProject,
          isAddWebsiteModalOpen,
          setIsAddWebsiteModalOpen,
        }}
      >
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
