"use client";

import React, { use } from "react";
import { ProjectInsightsView } from "@/components/insights/ProjectInsightsView";

export default function ProjectInsightsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ProjectInsightsView projectId={projectId} />
    </div>
  );
}
