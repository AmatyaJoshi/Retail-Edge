import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset loading state when route changes
    setLoading(true);
    setProgress(0);

    // Simulate progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 10;
      });
    }, 50);

    return () => {
      clearInterval(timer);
      setLoading(false);
      setProgress(0);
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className="h-1 bg-primary transition-all duration-300 ease-in-out"
        style={{
          width: `${progress}%`,
          transition: 'width 300ms ease-in-out',
        }}
      />
    </div>
  );
} 