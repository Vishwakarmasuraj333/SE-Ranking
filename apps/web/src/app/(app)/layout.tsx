"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Badge, Button } from "@internal-seo/ui";
import { NotificationBell } from "../../components/notifications/NotificationBell";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isSuperAdmin, isSEOExecutive } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadgeVariant = () => {
    if (isSuperAdmin) return "info";
    if (isSEOExecutive) return "success";
    return "default";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/projects" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm group-hover:bg-blue-700 transition">
                SEO
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm tracking-tight block">
                  Internal SEO Platform
                </span>
                <span className="text-xs text-slate-500 font-medium block">Operations Control Center</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/projects"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname.startsWith("/projects")
                    ? "bg-slate-100 text-blue-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Projects Directory
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  pathname === "/profile"
                    ? "bg-slate-100 text-blue-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                My Profile
              </Link>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs flex items-center justify-center">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  {user.email}
                </span>
              </div>
              <Badge variant={getRoleBadgeVariant()} className="ml-1 text-[10px]">
                {user.role}
              </Badge>
            </div>

            {/* In-App Notifications Bell */}
            <NotificationBell />

            <Button variant="outline" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {pathname.startsWith("/projects/") && pathname !== "/projects/create" ? (
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      )}
    </div>
  );
}
