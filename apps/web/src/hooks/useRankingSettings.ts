"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export interface RankingSettingsState {
  showCharts: boolean;
  showAllSearchEngines: boolean;
  defaultChart: string;
  defaultSection: string;
  keywordsPerPage: number;
  webPageUrlDisplay: string;
  tableColumns: string;
  selectedColumns: string[];
  rankingsDataAlignment: string;
  amountOfDisplayedData: string;
  defaultTableViewMode: string;
  sortByColumn: string;
  chartNotes: string;
  selectedChartNotes?: string[];
}

export const DEFAULT_CHART_OPTIONS = [
  "Average position",
  "Traffic forecast",
  "Search visibility",
  "Selected keywords",
  "% in Top (1-30)",
  "SERP features",
] as const;

export const DEFAULT_SECTION_OPTIONS = [
  "Summary",
  "Detailed",
  "Overall",
  "Historical data",
] as const;

export const AMOUNT_OF_DATA_OPTIONS = [
  "Default",
  "2 most recent rankings",
  "3 most recent rankings",
  "4 most recent rankings",
  "5 most recent rankings",
  "6 most recent rankings",
  "7 most recent rankings",
  "30 most recent rankings",
] as const;

export const DEFAULT_TABLE_VIEW_MODE_OPTIONS = [
  "Default",
  "Grouped by URLs",
  "Grouped by tags",
  "Grouped by target URL",
  "Grouped by create date",
] as const;

export const SORT_BY_COLUMN_OPTIONS = [
  "Default",
  "CPC",
  "Results",
  "Traffic Forecast",
  "Tags",
  "Dynamics",
  "Visibility",
  "Date added",
  "Content Score",
  "Clicks",
] as const;

export interface NoteTypeOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const NOTE_TYPE_OPTIONS: NoteTypeOption[] = [
  { id: "Keyword note", label: "Keyword note", icon: "💬", color: "text-slate-500" },
  { id: "Project note", label: "Project note", icon: "🗩", color: "text-slate-900 dark:text-slate-100" },
  { id: "Google update", label: "Google update", icon: "G", color: "text-blue-600" },
  { id: "Important update", label: "Important update", icon: "⚠️", color: "text-amber-500" },
  { id: "Keywords added", label: "Keywords added", icon: "➕", color: "text-emerald-500" },
];

export const DEFAULT_SELECTED_CHART_NOTES: string[] = [
  "Keyword note",
  "Project note",
  "Google update",
  "Important update",
];

export const CHART_NOTES_PRESETS = [
  "Keyword note, Project note, Google update, Important update...",
  "All notes",
  "Project notes only",
  "Algorithm updates only",
  "Disabled",
] as const;

export function formatChartNotesSummary(selectedNotes?: string[]): string {
  const selected = selectedNotes !== undefined ? selectedNotes : DEFAULT_SELECTED_CHART_NOTES;
  if (!selected || selected.length === 0) return "Disabled";
  if (selected.length === 5) return "All notes";
  if (selected.length === 1 && selected[0] === "Project note") return "Project notes only";
  if (
    selected.length === 2 &&
    selected.includes("Google update") &&
    selected.includes("Important update")
  ) {
    return "Algorithm updates only";
  }
  if (
    selected.length === 4 &&
    selected.includes("Keyword note") &&
    selected.includes("Project note") &&
    selected.includes("Google update") &&
    selected.includes("Important update")
  ) {
    return "Keyword note, Project note, Google update, Important update...";
  }
  const joined = selected.join(", ");
  return joined.length > 55 ? `${joined.slice(0, 52)}...` : joined;
}

export const ALL_TABLE_COLUMNS = [
  "Content Score",
  "Tags",
  "SERP features",
  "Group",
  "Date added",
  "Search vol.",
  "Competition",
  "CPC",
  "Results",
  "Traffic Forecast",
  "Dynamics",
  "Visibility",
  "Notes",
  "URL",
  "Clicks",
] as const;

export const DEFAULT_SELECTED_COLUMNS: string[] = [
  "Content Score",
  "SERP features",
  "Search vol.",
  "URL",
];

export const defaultRankingSettings: RankingSettingsState = {
  showCharts: true,
  showAllSearchEngines: false,
  defaultChart: "Average position",
  defaultSection: "Detailed",
  keywordsPerPage: 100,
  webPageUrlDisplay: "Icon",
  tableColumns: "Content Score, SERP features, Search vol., URL",
  selectedColumns: DEFAULT_SELECTED_COLUMNS,
  rankingsDataAlignment: "Left to right",
  amountOfDisplayedData: "Default",
  defaultTableViewMode: "Default",
  sortByColumn: "Default",
  chartNotes: "Keyword note, Project note, Google update, Important update...",
  selectedChartNotes: DEFAULT_SELECTED_CHART_NOTES,
};

export function filterDatesByAmount(dates: string[], amount: string): string[] {
  if (!dates || dates.length === 0) return [];
  if (!amount || amount === "Default") return dates;
  const match = amount.match(/^(\d+)\s+most recent rankings/i);
  if (match && match[1]) {
    const count = parseInt(match[1], 10);
    return dates.slice(-count);
  }
  return dates;
}

export function useRankingSettings(projectId?: string) {
  const [settings, setSettings] = useState<RankingSettingsState>(defaultRankingSettings);

  useEffect(() => {
    if (!projectId) return;
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem(`ranking_settings_${projectId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings((prev) => ({
            ...prev,
            ...parsed,
            selectedColumns: parsed.selectedColumns || prev.selectedColumns || DEFAULT_SELECTED_COLUMNS,
            selectedChartNotes: parsed.selectedChartNotes || prev.selectedChartNotes || DEFAULT_SELECTED_CHART_NOTES,
          }));
        }
      } catch (e) {
        // ignore localStorage errors
      }
    }
  }, [projectId]);

  const updateSettings = useCallback((newSettings: RankingSettingsState) => {
    setSettings(newSettings);
    if (!projectId) return;
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(`ranking_settings_${projectId}`, JSON.stringify(newSettings));
      } catch (e) {
        // ignore
      }
    }
  }, [projectId]);

  const visibleColumns = useMemo(
    () => new Set(settings.selectedColumns || DEFAULT_SELECTED_COLUMNS),
    [settings.selectedColumns]
  );

  const limitDates = useCallback((dates: string[]) => {
    return filterDatesByAmount(dates, settings.amountOfDisplayedData);
  }, [settings.amountOfDisplayedData]);

  return {
    settings,
    setSettings,
    updateSettings,
    visibleColumns,
    limitDates,
  };
}
