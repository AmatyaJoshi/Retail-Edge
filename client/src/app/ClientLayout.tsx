'use client';

import { usePathname } from 'next/navigation';
import DashboardWrapper from './dashboardWrapper';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <DashboardWrapper>{children}</DashboardWrapper>;
} 