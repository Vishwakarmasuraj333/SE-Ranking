"use client";

import React from "react";
import { KeywordDto, PaginatedList } from "../../lib/types";
import { Badge, Button } from "../ui";

interface KeywordTableProps {
  data: PaginatedList<KeywordDto>;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (keyword: KeywordDto) => void;
  onToggleStatus: (keyword: KeywordDto) => void;
  onDelete: (keyword: KeywordDto) => void;
  onSortChange: (sortField: string) => void;
  currentSort?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  canEdit: boolean;
  isLoading?: boolean;
}

export function KeywordTable({
  data,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onToggleStatus,
  onDelete,
  onSortChange,
  currentSort,
  onPageChange,
  onPageSizeChange,
  canEdit,
  isLoading = false,
}: KeywordTableProps) {
  const allSelected = data.items.length > 0 && data.items.every((k) => selectedIds.includes(k.id));
  const someSelected = data.items.some((k) => selectedIds.includes(k.id)) && !allSelected;

  const renderSortArrow = (field: string) => {
    if (currentSort === field) return <span className="ml-1 text-blue-600">▲</span>;
    if (currentSort === `-${field}`) return <span className="ml-1 text-blue-600">▼</span>;
    return <span className="ml-1 text-slate-300 group-hover:text-slate-500">⇅</span>;
  };

  const handleHeaderSort = (field: string) => {
    if (currentSort === field) {
      onSortChange(`-${field}`);
    } else {
      onSortChange(field);
    }
  };

  const getIntentBadgeVariant = (intent?: string) => {
    switch (intent?.toLowerCase()) {
      case "commercial":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "transactional":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "navigational":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "informational":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Area */}
      <div className="overflow-x-auto min-h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Loading catalogue...</span>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 select-none">
            <tr>
              {/* Select All */}
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all keywords"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  disabled={data.items.length === 0 || !canEdit}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                />
              </th>

              {/* Keyword & Intent */}
              <th className="p-3">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("keyword")}
                  className="group flex items-center font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  <span>Keyword Target</span>
                  {renderSortArrow("keyword")}
                </button>
              </th>

              {/* Group */}
              <th className="p-3">Group</th>

              {/* Tags */}
              <th className="p-3">Tags</th>

              {/* Engine & Device */}
              <th className="p-3">Engine / Device</th>

              {/* Location */}
              <th className="p-3">Location</th>

              {/* Target Landing Page */}
              <th className="p-3">Target URL</th>

              {/* Volume & KD */}
              <th className="p-3">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("volume")}
                  className="group flex items-center font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  <span>Volume / KD</span>
                  {renderSortArrow("volume")}
                </button>
              </th>

              {/* Status */}
              <th className="p-3">Status</th>

              {/* Actions */}
              {canEdit && <th className="p-3 text-right pr-4">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 10 : 9} className="py-16 text-center text-slate-400">
                  <div className="max-w-sm mx-auto space-y-2">
                    <svg
                      className="w-8 h-8 text-slate-300 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="font-semibold text-slate-700 text-sm">No keywords found</p>
                    <p className="text-xs text-slate-500">
                      No tracked keywords match the selected filter criteria or no keywords have been added yet.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.items.map((kw) => {
                const isSelected = selectedIds.includes(kw.id);

                return (
                  <tr
                    key={kw.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Select ${kw.keywordText}`}
                        checked={isSelected}
                        onChange={() => onToggleSelect(kw.id)}
                        disabled={!canEdit}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>

                    {/* Keyword */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{kw.keywordText}</span>
                        {kw.searchIntent && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getIntentBadgeVariant(
                              kw.searchIntent
                            )}`}
                          >
                            {kw.searchIntent}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Group */}
                    <td className="p-3">
                      {kw.groupName ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-50"
                          style={{
                            borderColor: kw.groupColor ? `${kw.groupColor}40` : "#E2E8F0",
                            color: kw.groupColor || "#334155",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: kw.groupColor || "#3B82F6" }}
                          />
                          <span>{kw.groupName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="p-3">
                      {kw.tags && kw.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {kw.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Engine & Device */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-semibold capitalize text-[11px]">
                          {kw.searchEngine}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="capitalize text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {kw.device}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-3 text-slate-600">
                      <span>{kw.countryCode}</span>
                      {kw.locationName && (
                        <span className="text-slate-400 truncate max-w-[100px] inline-block align-bottom ml-1">
                          • {kw.locationName}
                        </span>
                      )}
                    </td>

                    {/* Target URL */}
                    <td className="p-3">
                      {kw.targetUrl ? (
                        <a
                          href={kw.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={kw.targetUrl}
                          className="text-blue-600 hover:text-blue-800 underline truncate max-w-[140px] inline-block align-bottom text-[11px]"
                        >
                          {kw.targetUrl.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Volume & KD */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800">
                          {kw.monthlySearchVolume != null
                            ? kw.monthlySearchVolume.toLocaleString()
                            : "—"}
                        </span>
                        {kw.keywordDifficulty != null && (
                          <span
                            className={`text-[10px] px-1 rounded font-semibold ${
                              kw.keywordDifficulty > 50
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            KD {Math.round(kw.keywordDifficulty)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <Badge variant={kw.isActive ? "success" : "default"}>
                        {kw.isActive ? "Active" : "Paused"}
                      </Badge>
                    </td>

                    {/* Actions Menu */}
                    {canEdit && (
                      <td className="p-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Edit keyword"
                            onClick={() => onEdit(kw)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            title={kw.isActive ? "Pause tracking" : "Activate tracking"}
                            onClick={() => onToggleStatus(kw)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                          >
                            {kw.isActive ? (
                              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>

                          <button
                            type="button"
                            title="Delete keyword"
                            onClick={() => onDelete(kw)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Total: <strong>{data.totalCount}</strong> keywords
          </span>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <label htmlFor="select-page-size" className="text-slate-500">Rows per page:</label>
            <select
              id="select-page-size"
              value={data.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>
            Page <strong>{data.pageNumber}</strong> of{" "}
            <strong>{data.totalPages || 1}</strong>
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasPreviousPage}
              onClick={() => onPageChange(data.pageNumber - 1)}
              className="h-7 px-2.5 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.hasNextPage}
              onClick={() => onPageChange(data.pageNumber + 1)}
              className="h-7 px-2.5 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
