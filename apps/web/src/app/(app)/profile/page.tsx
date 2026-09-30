"use client";

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@internal-seo/ui";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">Your account identity, assigned role, and project permissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{user.fullName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <Badge variant="info" className="text-xs px-3 py-1">
              Role: {user.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">First Name</span>
              <span className="text-sm font-semibold text-slate-800">{user.firstName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Last Name</span>
              <span className="text-sm font-semibold text-slate-800">{user.lastName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Account Status</span>
              <span className="text-sm font-semibold text-emerald-700">Active</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Last Login</span>
              <span className="text-sm font-semibold text-slate-800">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "First active session"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Assigned Projects</h4>
            {user.role === "SuperAdmin" ? (
              <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                As a Super Admin, you have unrestricted operational and administrative access across all managed projects.
              </p>
            ) : user.assignedProjectIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  You are explicitly assigned to {user.assignedProjectIds.length} project(s).
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.assignedProjectIds.map((id: string) => (
                    <a
                      key={id}
                      href={`/projects/${id}`}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-blue-600 rounded border border-slate-200"
                    >
                      {id.substring(0, 8)}...
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                No projects currently assigned. A Super Admin must assign your account to projects before you can view them.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
