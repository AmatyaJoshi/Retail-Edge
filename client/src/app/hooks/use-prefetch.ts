import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PrefetchOptions {
  prefetchData?: boolean | undefined;
  priority?: 'high' | 'low';
  timeout?: number;
}

export function usePrefetch() {
  const router = useRouter();
  const prefetchedPaths = useRef<Set<string>>(new Set());
  const prefetchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const prefetchPath = useCallback((path: string, options: PrefetchOptions = {}) => {
    const { prefetchData = false, priority = 'low', timeout = 2000 } = options;

    // Clear existing timeout if any
    const existingTimeout = prefetchTimeouts.current.get(path);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      prefetchTimeouts.current.delete(path);
    }

    // Skip if already prefetched
    if (prefetchedPaths.current.has(path)) {
      return;
    }

    const prefetch = () => {
      // Prefetch the page
      router.prefetch(path);

      // Prefetch related data if needed
      if (prefetchData) {
        // Add your data prefetching logic here
        // For example: prefetchAPI(path);
      }

      // Mark as prefetched
      prefetchedPaths.current.add(path);
    };

    if (priority === 'high') {
      prefetch();
    } else {
      const timeoutId = setTimeout(prefetch, timeout);
      prefetchTimeouts.current.set(path, timeoutId);
    }
  }, [router]);

  const getRelatedPaths = useCallback((currentPath: string): string[] => {
    // Add logic to determine related paths based on current path
    // For example, if on /dashboard, you might want to prefetch /dashboard/details
    const relatedPaths: Record<string, string[]> = {
      '/dashboard': ['/dashboard/details', '/dashboard/analytics'],
      '/associates': ['/associates/details', '/associates/analytics'],
      // Add more mappings as needed
    };

    return relatedPaths[currentPath] || [];
  }, []);

  return {
    prefetchPath,
    getRelatedPaths,
  };
} 