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
        className={`p-2 rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
          hover:shadow-xl hover:scale-110 cursor-pointer`}
        title="Open Zayra AI Assistant"
        aria-label="Open Zayra AI Assistant"
      >
        <div className="w-6 h-6 relative">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
            <path d="M12 6 L13 10 L17 12 L13 14 L12 18 L11 14 L7 12 L11 10 Z" fill="white"/>
          </svg>
        </div>
      </button>
      <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
        Zayra AI
      </span>
    </div>
  );
}