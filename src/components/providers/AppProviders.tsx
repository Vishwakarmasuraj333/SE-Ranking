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
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisOverview | null>(null);
  const [activeRail, setActiveRail] = useState<RailSection>('research');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const refreshProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0 && !activeProject) {
          setActiveProject(data.projects[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load projects', e);
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
