"use client";

import React, { use } from "react";
import { AiCompetitorsView } from "@/components/ai-tracker/AiCompetitorsView";

export default function AiCompetitorsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AiCompetitorsView projectId={projectId} />
    </div>
  );
}
