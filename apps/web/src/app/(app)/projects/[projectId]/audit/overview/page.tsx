"use client";

import React, { use } from "react";
import { AuditOverviewView } from "@/components/audit/AuditOverviewView";

export default function AuditOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AuditOverviewView projectId={projectId} />
    </div>
  );
}
