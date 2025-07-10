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
  const isAuthPage = Boolean(pathname?.startsWith('/auth'));

  // Debug authentication state
  useEffect(() => {
    console.log('ClientLayout - isSignedIn:', isSignedIn, 'isLoaded:', isLoaded, 'pathname:', pathname, 'isAuthPage:', isAuthPage);
    
    // Check if Clerk is properly configured
    if (isLoaded && typeof isSignedIn === 'undefined') {
      console.error('Clerk authentication state is undefined - check environment variables');
    }
  }, [isSignedIn, isLoaded, pathname, isAuthPage]);

  // Handle redirects for authenticated and unauthenticated users
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    console.log('ClientLayout redirect check - isSignedIn:', isSignedIn, 'isAuthPage:', isAuthPage);

    // Add a small delay to ensure authentication state is fully updated
    const timeoutId = setTimeout(() => {
      // Only redirect unauthenticated users away from protected pages
      // Let auth pages handle their own redirects for authenticated users
      if (!isSignedIn && !isAuthPage) {
        // If user is not signed in and not on auth page, redirect to login
        // Don't redirect from root to avoid infinite loops
        console.log('User is not signed in and not on auth page, redirecting to /auth/login');
        router.replace('/auth/login');
      }
    }, 500); // 500ms delay to ensure state is updated

    return () => clearTimeout(timeoutId);
  }, [isLoaded, isSignedIn, isAuthPage, router, pathname]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if Clerk is loaded but authentication state is undefined
  if (isLoaded && typeof isSignedIn === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            There was an issue loading the authentication system. Please check your environment variables and try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
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