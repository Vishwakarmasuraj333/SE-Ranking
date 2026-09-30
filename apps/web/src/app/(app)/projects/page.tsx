"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { ProjectDto } from "../../../lib/types";
import { isProjectActive, formatProjectStatus } from "../../../lib/formatters";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Alert } from "@internal-seo/ui";

export default function ProjectsDirectoryPage() {
  const { user, canManageProjects } = useAuth();

  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.projects.list(search || undefined, statusFilter || undefined);
      if (res.data) {
        setProjects(res.data.items);
        setTotalCount(res.data.totalCount);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects. Please verify backend API connectivity.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects Directory</h1>
          <p className="text-sm text-slate-500">
            {user?.role === "SuperAdmin"
              ? "All company websites and digital properties across the organization"
              : "Company websites assigned to your account for SEO operations"}
          </p>
        </div>

        {/* Permission-derived action */}
        {canManageProjects ? (
          <div className="flex items-center gap-3">
            {user?.role === "SuperAdmin" && (
              <Link href="/admin/users">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  User Management
                </Button>
              </Link>
            )}
            <Link href="/projects/create">
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
            {user?.role === "Viewer" ? "Viewer Mode (Read Only)" : "SEO Specialist"}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Search by project name or primary domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="1">Active</option>
            <option value="2">Paused</option>
            <option value="3">Archived</option>
          </select>
        </div>
        <div className="ml-auto text-xs text-slate-500 font-medium">
          Showing {projects.length} of {totalCount} projects
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900">No projects found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            {search || statusFilter
              ? "No projects match your current filter criteria. Try adjusting your search term."
              : user?.role === "SuperAdmin"
              ? "Get started by registering your company's first website project."
              : "You do not have any projects assigned yet. Contact your Super Admin for access."}
          </p>
          {canManageProjects && !search && (
            <div className="mt-6">
              <Link href="/projects/create">
                <Button>Create First Project</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Populated Project List Grid */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block transition transform hover:-translate-y-0.5"
            >
              <Card className="h-full border border-slate-200 hover:border-blue-500 hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base group-hover:text-blue-600 transition">
                      {project.name}
                    </CardTitle>
                    <Badge variant={isProjectActive(project.status) ? "success" : "default"}>
                      {formatProjectStatus(project.status)}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-1">
                    <span className="text-slate-400">{project.protocol}</span>
                    <span className="font-semibold text-slate-700">{project.primaryDomain}</span>
                  </p>
                </CardHeader>
                <CardContent className="pt-2 text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Target Country:</span>
                      <span className="font-medium text-slate-800">{project.countryCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Members:</span>
                      <span className="font-medium text-slate-800">{project.memberCount} assigned</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
                    <span>Engine: {project.defaultSearchEngine}</span>
                    <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
