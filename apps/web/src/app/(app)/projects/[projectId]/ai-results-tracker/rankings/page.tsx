"use client";

import React, { use } from "react";
import { RankingsHeader } from "@/components/ai-tracker/RankingsHeader";
import { AiRankingsView } from "@/components/ai-tracker/AiRankingsView";

export default function AiRankingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <RankingsHeader
        projectId={projectId}
        title="AI Overview Rankings"
        description="Monitor keyword visibility and presence across AI Overviews and LLMs"
        activeSubTab="Detailed"
      />
      <AiRankingsView projectId={projectId} />
    </div>
  );
}
