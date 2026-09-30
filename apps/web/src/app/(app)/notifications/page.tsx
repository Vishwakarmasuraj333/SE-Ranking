"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { NotificationDto } from "../../../lib/types";
import { Button, Badge } from "@internal-seo/ui";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const loadNotifications = useCallback(async (targetPage = 1, currentFilter = filter) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.notifications.list({
        page: targetPage,
        pageSize: 20,
        unreadOnly: currentFilter === "unread" ? true : undefined,
      });

      if (res.success && res.data) {
        setNotifications(res.data.items);
        setPage(res.data.pageNumber);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      } else {
        setError(res.message || "Failed to load notifications.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching notifications.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        loadNotifications(page, filter);
      }
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [page, filter, loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await api.notifications.markRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
      }
    } catch {
      // Ignored
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await api.notifications.markAllRead();
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark all as read.";
      setError(msg);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <Badge variant="danger">Critical</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  const unreadCountOnPage = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6" data-testid="notifications-feed-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical activity log, system alerts, rank movement alerts, and task assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || (filter === "unread" ? notifications.length === 0 : unreadCountOnPage === 0)}
            data-testid="page-mark-all-read-button"
          >
            {isMarkingAll ? "Marking..." : "Mark All as Read"}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            data-testid="page-filter-all"
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Notifications
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
            data-testid="page-filter-unread"
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${
              filter === "unread"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Unread Only
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Total: {totalCount} notification(s)
        </span>
      </div>

      {/* Notifications Table / Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading && (
          <div className="py-20 text-center" data-testid="page-loading">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-3" />
            <span className="text-sm text-slate-500">Loading notifications...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="p-6 text-center" data-testid="page-error">
            <p className="text-sm font-semibold text-red-600 mb-1">Failed to load feed</p>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadNotifications(page, filter)}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="py-20 text-center" data-testid="page-empty">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filter === "unread"
                ? "There are no unread notifications right now."
                : "No notifications have been recorded yet."}
            </p>
          </div>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                data-testid={`page-notification-row-${item.id}`}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  item.isRead ? "bg-white hover:bg-slate-50/50" : "bg-blue-50/30 hover:bg-blue-50/50"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">{getSeverityBadge(item.severity)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {item.projectName}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
                    <div className="text-[11px] text-slate-400">
                      Received {formatTimestamp(item.createdAt)}
                      {item.isRead && item.readAt && (
                        <span className="ml-2">&bull; Read {formatTimestamp(item.readAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {item.targetUrl && (
                    <Link
                      href={item.targetUrl}
                      data-testid={`page-notification-link-${item.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Details
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}

                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(item.id)}
                      data-testid={`page-mark-read-btn-${item.id}`}
                      className="text-xs h-7 px-2 text-slate-500 hover:text-slate-900"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs h-7 px-2.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="text-xs h-7 px-2.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
