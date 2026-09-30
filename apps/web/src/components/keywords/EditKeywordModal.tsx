"use client";

import React, { useState } from "react";
import { KeywordDto, KeywordGroupDto } from "../../lib/types";
import { api, ApiError } from "../../lib/api";
import { Alert, Button, Input } from "../ui";

interface EditKeywordModalProps {
  keyword: KeywordDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: KeywordGroupDto[];
}

export function EditKeywordModal({
  keyword,
  isOpen,
  onClose,
  onSuccess,
  groups,
}: EditKeywordModalProps) {
  const [targetUrl, setTargetUrl] = useState(keyword.targetUrl || "");
  const [searchIntent, setSearchIntent] = useState(keyword.searchIntent || "");
  const [groupId, setGroupId] = useState(keyword.groupId || "");
  const [tagsInput, setTagsInput] = useState((keyword.tags || []).join(", "));
  const [isActive, setIsActive] = useState(keyword.isActive);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const tagList = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.keywords.update(keyword.projectId, keyword.id, {
        targetUrl: targetUrl.trim() || undefined,
        searchIntent: searchIntent || undefined,
        groupId: groupId || undefined,
        tags: tagList,
        isActive,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update keyword.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Edit Keyword Target</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-slate-900 text-xs">{keyword.keywordText}</span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                {keyword.device} • {keyword.countryCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto">
          {errorMessage && (
            <Alert variant="error" className="py-2 text-xs">
              {errorMessage}
            </Alert>
          )}

          {/* Target URL */}
          <div>
            <label htmlFor="edit-modal-target-url" className="block text-slate-700 font-medium mb-1">Target Landing Page URL</label>
            <Input
              id="edit-modal-target-url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com/target-page"
              className="text-xs py-1.5"
            />
          </div>

          {/* Search Intent */}
          <div>
            <label htmlFor="edit-modal-intent" className="block text-slate-700 font-medium mb-1">Search Intent</label>
            <select
              id="edit-modal-intent"
              value={searchIntent}
              onChange={(e) => setSearchIntent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="">(None / Unclassified)</option>
              <option value="Informational">Informational</option>
              <option value="Navigational">Navigational</option>
              <option value="Commercial">Commercial</option>
              <option value="Transactional">Transactional</option>
            </select>
          </div>

          {/* Group */}
          <div>
            <label htmlFor="edit-modal-group" className="block text-slate-700 font-medium mb-1">Keyword Group</label>
            <select
              id="edit-modal-group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
            >
              <option value="">(No Group)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="edit-modal-tags" className="block text-slate-700 font-medium mb-1">Tags (Comma-separated)</label>
            <Input
              id="edit-modal-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="brand, q3-focus, core"
              className="text-xs py-1.5"
            />
          </div>

          {/* Status Checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="is-active-check"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is-active-check" className="text-slate-800 font-medium cursor-pointer">
              Active for Rank Tracking
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
