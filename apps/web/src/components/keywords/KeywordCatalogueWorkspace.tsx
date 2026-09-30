"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError } from "../../lib/api";
import {
  KeywordDto,
  KeywordFilters as FilterType,
  KeywordGroupDto,
  PaginatedList,
  TagDto,
} from "../../lib/types";
import { Alert, Badge, Button } from "../ui";
import { AddKeywordModal } from "./AddKeywordModal";
import { BulkActionBar } from "./BulkActionBar";
import { CsvImportModal } from "./CsvImportModal";
import { EditKeywordModal } from "./EditKeywordModal";
import { KeywordFilters } from "./KeywordFilters";
import { KeywordTable } from "./KeywordTable";

interface KeywordCatalogueWorkspaceProps {
  projectId: string;
}

export function KeywordCatalogueWorkspace({ projectId }: KeywordCatalogueWorkspaceProps) {
  const { isSuperAdmin, isSEOExecutive } = useAuth();
  const canEdit = isSuperAdmin || isSEOExecutive;

  // Data state
  const [data, setData] = useState<PaginatedList<KeywordDto>>({
    items: [],
    pageNumber: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [groups, setGroups] = useState<KeywordGroupDto[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);

  // Filter & selection state
  const [filters, setFilters] = useState<FilterType>({
    search: "",
    groupId: undefined,
    tag: undefined,
    device: "all",
    status: "all",
    searchIntent: "all",
    sort: "-created",
    page: 1,
    pageSize: 25,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Loading & error state
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<KeywordDto | null>(null);

  // Fetch keywords
  const loadKeywords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.keywords.list(projectId, filters);
      if (res.data) {
        setData(res.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load keywords.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters]);

  // Fetch groups & tags
  const loadMetadata = useCallback(async () => {
    try {
      const [groupsRes, tagsRes] = await Promise.all([
        api.keywordGroups.list(projectId),
        api.tags.list(projectId),
      ]);
      if (groupsRes.data) setGroups(groupsRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
    } catch {
      // ignore metadata load error
    }
  }, [projectId]);

  useEffect(() => {
    let ignore = false;

    api.keywords
      .list(projectId, filters)
      .then((res) => {
        if (!ignore) {
          if (res.data) {
            setData(res.data);
          }
          setErrorMessage(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          if (err instanceof ApiError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load keywords.");
          }
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId, filters]);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      api.keywordGroups.list(projectId),
      api.tags.list(projectId),
    ])
      .then(([groupsRes, tagsRes]) => {
        if (!ignore) {
          if (groupsRes.data) setGroups(groupsRes.data);
          if (tagsRes.data) setTags(tagsRes.data);
        }
      })
      .catch(() => {
        // ignore metadata load error
      });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (data.items.length === 0) return;
    const allSelected = data.items.every((k) => selectedIds.includes(k.id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.items.map((k) => k.id));
    }
  };

  // Status toggle handler
  const handleToggleStatus = async (keyword: KeywordDto) => {
    try {
      await api.keywords.update(projectId, keyword.id, {
        targetUrl: keyword.targetUrl,
        searchIntent: keyword.searchIntent,
        groupId: keyword.groupId,
        tags: keyword.tags,
        isActive: !keyword.isActive,
      });
      loadKeywords();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      }
    }
  };

  // Delete single keyword
  const handleDeleteKeyword = async (keyword: KeywordDto) => {
    if (confirm(`Are you sure you want to delete the keyword "${keyword.keywordText}"?`)) {
      try {
        await api.keywords.delete(projectId, keyword.id);
        setSelectedIds((prev) => prev.filter((id) => id !== keyword.id));
        loadKeywords();
        loadMetadata();
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        }
      }
    }
  };

  // Bulk status update
  const handleBulkUpdateStatus = async (isActive: boolean) => {
    setIsBulkOperating(true);
    try {
      await api.keywords.bulkStatus(projectId, selectedIds, isActive);
      setSelectedIds([]);
      loadKeywords();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Bulk group assign
  const handleBulkAssignGroup = async (groupId: string | null) => {
    setIsBulkOperating(true);
    try {
      await api.keywords.bulkGroup(projectId, selectedIds, groupId);
      setSelectedIds([]);
      loadKeywords();
      loadMetadata();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setIsBulkOperating(true);
    try {
      await api.keywords.bulkDelete(projectId, selectedIds);
      setSelectedIds([]);
      loadKeywords();
      loadMetadata();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const url = api.keywords.exportCsvUrl(projectId, filters);
    window.open(url, "_blank");
  };

  const activeCount = data.items.filter((k) => k.isActive).length;

  return (
    <div className="space-y-4">
      {/* Workspace Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Keyword Catalogue
            </h1>
            <Badge variant="outline" className="text-xs font-mono">
              Total Tracked: {data.totalCount}
            </Badge>
            {activeCount > 0 && (
              <Badge variant="success" className="text-xs">
                {activeCount} Active
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain monitored search terms, target landing pages, groups, and search intent.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export CSV (Visible to all members) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs flex items-center gap-1.5 h-9"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </Button>

          {/* Import CSV (Requires Project Writer) */}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="text-xs flex items-center gap-1.5 h-9"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>Import CSV</span>
            </Button>
          )}

          {/* Add Keywords CTA (Requires Project Writer) */}
          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="text-xs flex items-center gap-1.5 h-9 font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Keywords</span>
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <Alert variant="error" className="py-2.5 text-xs">
          {errorMessage}
        </Alert>
      )}

      {/* Filters Bar */}
      <KeywordFilters
        filters={filters}
        onFilterChange={setFilters}
        groups={groups}
        tags={tags}
      />

      {/* Data Table */}
      <KeywordTable
        data={data}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onEdit={(kw) => setEditingKeyword(kw)}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteKeyword}
        onSortChange={(sort) => setFilters({ ...filters, sort, page: 1 })}
        currentSort={filters.sort}
        onPageChange={(page) => setFilters({ ...filters, page })}
        onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
        canEdit={canEdit}
        isLoading={isLoading}
      />

      {/* Floating Bulk Action Bar */}
      {canEdit && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          groups={groups}
          onUpdateStatus={handleBulkUpdateStatus}
          onAssignGroup={handleBulkAssignGroup}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds([])}
          isLoading={isBulkOperating}
        />
      )}

      {/* Add Keyword Modal */}
      {isAddOpen && (
        <AddKeywordModal
          projectId={projectId}
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            loadKeywords();
            loadMetadata();
          }}
          groups={groups}
        />
      )}

      {/* Edit Keyword Modal */}
      {editingKeyword && (
        <EditKeywordModal
          keyword={editingKeyword}
          isOpen={Boolean(editingKeyword)}
          onClose={() => setEditingKeyword(null)}
          onSuccess={() => {
            loadKeywords();
            loadMetadata();
          }}
          groups={groups}
        />
      )}

      {/* CSV Import Modal */}
      {isImportOpen && (
        <CsvImportModal
          projectId={projectId}
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => {
            loadKeywords();
            loadMetadata();
          }}
        />
      )}
    </div>
  );
}
