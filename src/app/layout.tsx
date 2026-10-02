import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'SE Ranking Research Studio | AI Search & Competitive Research',
  description:
    'Monitor domain citations and brand mentions in AI answers, and identify their sources with SE Ranking AI Search Studio.',
};

import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased bg-[#F4F6F9] text-gray-900 min-h-screen font-sans">
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="lazyOnload"
        />
        <AuthProvider>
          <AppProviders>
            <AppShell>{children}</AppShell>
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}

