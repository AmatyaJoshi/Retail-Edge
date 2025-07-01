'use client';

import React from 'react';
import { SignedIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        {/* If user is already signed in, redirect to POS */}
        <AuthRedirect />
      </SignedIn>
      {/* Show auth pages when not signed in */}
      {children}
    </>
  );
}

// Component to handle redirect for signed-in users
function AuthRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/pos');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to POS...</p>
      </div>
    </div>
  );
} 