"use client";

import React from "react";
import { KeywordFilters as FilterType, KeywordGroupDto, TagDto } from "../../lib/types";
import { Button } from "../ui";

interface KeywordFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  groups: KeywordGroupDto[];
  tags: TagDto[];
}

export function KeywordFilters({
  filters,
  onFilterChange,
  groups,
  tags,
}: KeywordFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.groupId ||
    filters.tag ||
    (filters.device && filters.device !== "all") ||
    (filters.status && filters.status !== "all") ||
    (filters.searchIntent && filters.searchIntent !== "all")
  );

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center gap-2.5 text-xs">
      {/* Search Input */}
      <div className="relative min-w-[220px] flex-1">
        <svg
          className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
          placeholder="Filter keywords, target URLs..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, search: "", page: 1 })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Group Selector */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-group" className="text-slate-500 font-medium whitespace-nowrap">Group:</label>
        <select
          id="filter-group"
          value={filters.groupId || ""}
          onChange={(e) => onFilterChange({ ...filters, groupId: e.target.value || undefined, page: 1 })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.keywordCount})
            </option>
          ))}
        </select>
      </div>

      {/* Device Filter */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-device" className="text-slate-500 font-medium whitespace-nowrap">Device:</label>
        <select
          id="filter-device"
          value={filters.device || "all"}
          onChange={(e) => onFilterChange({ ...filters, device: e.target.value, page: 1 })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Devices</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-status" className="text-slate-500 font-medium whitespace-nowrap">Status:</label>
        <select
          id="filter-status"
          value={filters.status || "all"}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value, page: 1 })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="paused">Paused Only</option>
        </select>
      </div>

      {/* Search Intent Filter */}
      <div className="flex items-center gap-1">
        <label htmlFor="filter-intent" className="text-slate-500 font-medium whitespace-nowrap">Intent:</label>
        <select
          id="filter-intent"
          value={filters.searchIntent || "all"}
          onChange={(e) => onFilterChange({ ...filters, searchIntent: e.target.value, page: 1 })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Intents</option>
          <option value="Informational">Informational</option>
          <option value="Navigational">Navigational</option>
          <option value="Commercial">Commercial</option>
          <option value="Transactional">Transactional</option>
        </select>
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1">
          <label htmlFor="filter-tag" className="text-slate-500 font-medium whitespace-nowrap">Tag:</label>
          <select
            id="filter-tag"
            value={filters.tag || ""}
            onChange={(e) => onFilterChange({ ...filters, tag: e.target.value || undefined, page: 1 })}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>
                #{t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFilterChange({
              search: "",
              groupId: undefined,
              tag: undefined,
              device: "all",
              status: "all",
              searchIntent: "all",
              page: 1,
            })
          }
          className="text-xs py-1 h-8 text-slate-600 hover:text-slate-900 border-dashed"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
