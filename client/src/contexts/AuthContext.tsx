'use client';

import { 
  createContext, 
  useCallback, 
  useEffect, 
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSession, ClerkLoaded, useClerk } from '@clerk/nextjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clerkId?: string;
  storeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  sendEmailOTP: (email: string) => Promise<any>;
  verifyEmailOTP: (code: string, email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmailOTP = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmailOTP = useCallback(async (code: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: code, email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify OTP';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Handle successful login - redirect to POS page
      router.push('/pos');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    // Use Clerk's signOut to properly clear the session
    signOut(() => {
      // Clear any local storage or session storage if needed
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login page
      router.push('/auth/login');
    });
  }, [signOut, router]);

  const updateUser = useCallback((user: User) => {
    // Handle user update logic
  }, []);

  const value = {
    user: user ? {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      role: String(user.publicMetadata.role || ''),
      clerkId: user.id,
    } : null,
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    loading: loading || !isLoaded,
    error,
    login,
    logout,
    updateUser,
    sendEmailOTP,
    verifyEmailOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      <ClerkLoaded>{children}</ClerkLoaded>
    </AuthContext.Provider>
  );
};

export { AuthContext };
