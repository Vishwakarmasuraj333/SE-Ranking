'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

export default function WizardStandalonePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <CreateProjectModal
        isOpen={true}
        onClose={() => router.push('/projects')}
      />
    </div>
  );
}
