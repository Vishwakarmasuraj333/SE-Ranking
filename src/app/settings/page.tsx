'use client';

import React, { Suspense } from 'react';
import { SEWizardView } from '@/components/settings/SEWizardView';

export default function ProjectSettingsWizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6F9]" />}>
      <SEWizardView />
    </Suspense>
  );
}
