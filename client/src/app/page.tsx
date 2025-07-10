'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load
    
    // Add a delay to ensure authentication state is fully updated
    const timeoutId = setTimeout(() => {
      if (isSignedIn) {
        // User is signed in, redirect to POS
        console.log('Root page: User is signed in, redirecting to /pos');
        router.replace('/pos');
      } else {
        // User is not signed in, redirect to login
        console.log('Root page: User is not signed in, redirecting to /auth/login');
    router.replace('/auth/login');
      }
    }, 500); // 500ms delay to ensure state is updated

    return () => clearTimeout(timeoutId);
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
