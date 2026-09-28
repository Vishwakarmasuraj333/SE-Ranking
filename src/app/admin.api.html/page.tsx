'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ApiDashboardPage from '@/app/api-docs/page';
import ApiWalletPage from '@/app/api-docs/wallet/page';
import ApiMcpPage from '@/app/api-docs/mcp/page';

function AdminApiHtmlContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const [hash, setHash] = useState('');

  useEffect(() => {
    const handleHash = () => {
      setHash(window.location.hash);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (hash.includes('/mcp') || tabParam === 'mcp') {
    return <ApiMcpPage />;
  }

  if (hash.includes('/wallet') || tabParam === 'wallet') {
    return <ApiWalletPage />;
  }

  return <ApiDashboardPage />;
}

export default function AdminApiHtmlPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading API...</div>}>
      <AdminApiHtmlContent />
    </Suspense>
  );
}
