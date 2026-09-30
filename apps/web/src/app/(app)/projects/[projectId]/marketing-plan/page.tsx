"use client";

import React, { use } from "react";
import { MarketingPlanView } from "@/components/marketing-plan/MarketingPlanView";

export default function MarketingPlanPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <MarketingPlanView projectId={projectId} />
    </div>
  );
}
