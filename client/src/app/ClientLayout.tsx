'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import DashboardWrapper from './dashboardWrapper';
import ReduxProvider from '@/providers/ReduxProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SignedIn, useUser } from '@clerk/nextjs';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const isAuthPage = pathname?.startsWith('/auth');

  // Debug authentication state
  useEffect(() => {
    console.log('ClientLayout - isSignedIn:', isSignedIn, 'isLoaded:', isLoaded, 'pathname:', pathname, 'isAuthPage:', isAuthPage);
  }, [isSignedIn, isLoaded, pathname, isAuthPage]);

  // Handle redirects for authenticated and unauthenticated users
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    console.log('ClientLayout redirect check - isSignedIn:', isSignedIn, 'isAuthPage:', isAuthPage);

    if (isSignedIn && isAuthPage) {
      // If user is signed in and on auth page, redirect to POS
      console.log('User is signed in on auth page, redirecting to /pos');
      router.push('/pos');
    } else if (!isSignedIn && !isAuthPage) {
      // If user is not signed in and not on auth page, redirect to login
      console.log('User is not signed in and not on auth page, redirecting to /auth/login');
      router.push('/auth/login');
    }
  }, [isLoaded, isSignedIn, isAuthPage, router]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    // Auth pages are handled by their own layout
    return (
      <ReduxProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ReduxProvider>
    );
  }

  // All other pages are protected and get the dashboard wrapper
  return (
    <ReduxProvider>
      <AuthProvider>
        <SignedIn>
          <DashboardWrapper>{children}</DashboardWrapper>
        </SignedIn>
      </AuthProvider>
    </ReduxProvider>
  );
} 