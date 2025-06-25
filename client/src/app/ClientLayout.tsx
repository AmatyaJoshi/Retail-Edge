'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardWrapper from './dashboardWrapper';
import ReduxProvider from '@/providers/ReduxProvider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <ReduxProvider>{children}</ReduxProvider>;
  }

  return (
    <ReduxProvider>
      <DashboardWrapper>{children}</DashboardWrapper>
    </ReduxProvider>
  );
} 