"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { ActivityLogWorkspace } from "../../../../components/admin/ActivityLogWorkspace";
import { Alert, Skeleton } from "@internal-seo/ui";

export default function AdminActivityLogPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "SuperAdmin")) {
      router.push("/projects");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user || user.role !== "SuperAdmin") {
    return (
      <div className="p-8">
        <Alert variant="error">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Access Denied</h3>
            <p className="text-xs">You must be a Super Administrator to view the Activity Audit Trail.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <ActivityLogWorkspace />
    </div>
  );
}
