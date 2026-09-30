"use client";

import React, { use } from "react";
import { AiSourcesView } from "@/components/ai-tracker/AiSourcesView";

export default function AiSourcesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AiSourcesView projectId={projectId} />
    </div>
  );
}
