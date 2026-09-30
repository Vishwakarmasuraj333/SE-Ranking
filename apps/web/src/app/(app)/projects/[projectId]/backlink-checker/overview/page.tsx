"use client";

import React, { use } from "react";
import { BacklinkCheckerOverviewView } from "@/components/backlink-checker/BacklinkCheckerOverviewView";

export default function BacklinkCheckerOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BacklinkCheckerOverviewView projectId={projectId} />
    </div>
  );
}
