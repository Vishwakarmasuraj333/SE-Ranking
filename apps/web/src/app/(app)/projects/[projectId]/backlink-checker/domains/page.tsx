"use client";

import React, { use } from "react";
import { BacklinkReferringDomainsView } from "@/components/backlink-checker/BacklinkReferringDomainsView";

export default function BacklinkReferringDomainsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BacklinkReferringDomainsView projectId={projectId} />
    </div>
  );
}
