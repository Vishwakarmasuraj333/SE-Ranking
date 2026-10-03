'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SEWizardView } from '@/components/settings/SEWizardView';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

function WizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const siteId = searchParams.get('site_id');

  if (!siteId) {
    return (
      <CreateProjectModal
        isOpen={true}
        onClose={() => router.push('/admin.dashboard.html')}
        onCreated={() => router.push('/admin.dashboard.html')}
      />
    );
  }

  return <SEWizardView />;
}

export default function WizardStandalonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6F9]" />}>
      <WizardContent />
    </Suspense>
  );
}
