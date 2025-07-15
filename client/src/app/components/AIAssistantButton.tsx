'use client';

import { useAIAssistant } from '../contexts/AIAssistantContext';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function AIAssistantButton() {
  const { openAssistant, isOpen } = useAIAssistant();
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

  if (isOpen) return null;

  return (
    <div className="relative group">
      <button
        onClick={openAssistant}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-blue-200 shadow-lg hover:ring-2 hover:ring-blue-400 transition-all duration-200 focus:outline-none cursor-pointer overflow-hidden"
        title="Open Zayra AI Assistant"
        aria-label="Open Zayra AI Assistant"
      >
        <img src="/zayra-icon.png" alt="Zayra AI" className="w-20 h-18 object-cover rounded-full" />
      </button>
      <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
        Zayra AI
      </span>
    </div>
  );
}