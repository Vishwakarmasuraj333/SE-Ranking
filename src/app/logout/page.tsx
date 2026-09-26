'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear cookies and local sessions
    if (typeof document !== 'undefined') {
      document.cookie = 'user_email=; path=/; max-age=0;';
      document.cookie = 'user_name=; path=/; max-age=0;';
      document.cookie = 'user_domain=; path=/; max-age=0;';
    }
    // Redirect to login page
    setTimeout(() => {
      router.push('/login');
    }, 600);
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-4">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Signing out...</h2>
      <p className="text-xs text-gray-500 mt-1">Please wait while your session is cleared.</p>
    </div>
  );
}
