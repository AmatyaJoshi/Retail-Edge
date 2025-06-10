import { useState, useCallback } from 'react';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import app from '@/lib/firebase';

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  customToken?: string;
  isExistingUser?: boolean;
}

interface VerificationResult {
  isExistingUser: boolean;
  customToken?: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = useCallback(() => {
    setCooldown(60); // 60 seconds cooldown for email OTP
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendEmailOTP = async (email: string): Promise<AuthResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP (mocked)');
      }

      setCurrentEmail(email);
      return data;
    } catch (error) {
      console.error('Error sending email OTP (mocked):', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP (mocked)');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async (otp: string): Promise<VerificationResult | null> => {
    try {
      setLoading(true);
      setError(null);

      if (!currentEmail) {
        throw new Error('Please send OTP first');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, email: currentEmail }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP (mocked)');
      }

      if (data.customToken) {
        // Sign in with Firebase client SDK using the custom token
        const auth = getAuth(app);
        await signInWithCustomToken(auth, data.customToken);
        localStorage.setItem('authToken', data.customToken); // Store custom token
      }

      return {
        isExistingUser: data.isExistingUser || false,
        customToken: data.customToken,
      };
    } catch (err: any) {
      console.error('Error verifying email OTP (mocked):', err);
      setError(err.message || 'Failed to verify OTP (mocked)');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendEmailOTP,
    verifyEmailOTP,
    loading,
    error,
    cooldown,
  };
}; 