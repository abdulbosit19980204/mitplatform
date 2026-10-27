'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard routes have their own full-screen sidebar and header layout
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/kabinet');

  if (isDashboard) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA]" />}>
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}
