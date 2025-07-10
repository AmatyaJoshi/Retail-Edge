'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import AIAssistantWidget from './AIAssistantWidget';

export default function ConditionalAIAssistant() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const isAuthPage = Boolean(pathname?.startsWith('/auth'));

  // Don't render if:
  // 1. Clerk is still loading
  // 2. User is not signed in
  // 3. User is on an auth page (login/signup)
  if (!isLoaded || !isSignedIn || isAuthPage) {
    return null;
  }

  // Only render the AI assistant for authenticated users on non-auth pages
  return <AIAssistantWidget />;
} 