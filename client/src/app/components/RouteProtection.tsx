'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

interface RouteProtectionProps {
  children: React.ReactNode;
}

const RouteProtection = ({ children }: RouteProtectionProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.id) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
          const res = await fetch(`${backendUrl}/api/auth/user-profile?clerkId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role || 'User');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      setIsChecking(false);
    };

    if (isLoaded && user) {
      fetchUserRole();
    } else if (isLoaded && !user) {
      setIsChecking(false);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isChecking && userRole === 'Staff') {
      // Define restricted paths for Staff
      const restrictedPaths = [
        '/dashboard',
        '/inventory', 
        '/associates',
        '/products',
        '/customers',
        '/expenses',
        '/employees'
      ];

      // Check if current path is restricted
      const isRestrictedPath = restrictedPaths.some(path => pathname.startsWith(path));
      
      if (isRestrictedPath) {
        // Redirect to POS (allowed page)
        router.push('/pos');
      }
    }
  }, [userRole, pathname, isChecking, router]);

  // Show loading while checking user role
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteProtection; 