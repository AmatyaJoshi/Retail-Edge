'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import EyeIcon from "@/components/ui/EyeIcon";
import styles from './auth.module.css';
import { useSignIn, useUser, useClerk } from '@clerk/nextjs';
import { getCurrentYear } from '@/app/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const [formData, setFormData] = useState({
    identifier: '', // email only for Clerk authentication
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Debug authentication state
  useEffect(() => {
    console.log('Login page - isSignedIn:', isSignedIn, 'isLoaded:', isLoaded);
    console.log('Clerk configuration check:', {
      hasSignIn: !!signIn,
      hasRouter: !!router,
      pathname: window.location.pathname,
      searchParams: window.location.search
    });
  }, [isSignedIn, isLoaded, signIn, router]);

  // Handle automatic redirect if user is already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('User is already signed in, redirecting to /pos');
      const returnUrl = searchParams?.get('returnUrl') || '/pos';
      
      // Add a delay to ensure state is stable
      setTimeout(() => {
        console.log('Executing automatic redirect to:', returnUrl);
        window.location.href = returnUrl;
      }, 500);
    }
  }, [isLoaded, isSignedIn, router, searchParams]);

  // Set initial_session cookie and check for various error params
  useEffect(() => {
    // Set initial_session cookie if not already set
    if (!document.cookie.includes('initial_session')) {
      document.cookie = 'initial_session=true; path=/; max-age=604800'; // 7 days
    }
    
    // Safe access to searchParams
    if (!searchParams) return;
    
    const isExpired = searchParams.get('expired') === 'true';
    const isInvalid = searchParams.get('invalid') === 'true';
    
    if (isExpired) {
      setError('Your session has expired. Please login again to continue.');
    } else if (isInvalid) {
      setError('Your session is invalid. Please login again to continue.');
    }
    
    // Check for return URL
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      console.log(`Will redirect to ${returnUrl} after successful login`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Clerk state:', { isLoaded, hasSignIn: !!signIn });
    
    if (!isLoaded || !signIn) {
      setError('Authentication system is not ready. Please try again.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to sign in with:', formData.identifier);
      // Use Clerk's signIn method
      const result = await signIn.create({
        identifier: formData.identifier,
        password: formData.password,
      });

      console.log('Sign in result:', result);
      console.log('Sign in status:', result.status);

      if (result.status === 'complete') {
        // Sign in successful
        console.log('Sign in completed successfully');
        setAuthSuccess(true);
        
        // Set the session as active if we have a session ID
        if (result.createdSessionId) {
          try {
            await clerk.setActive({ session: result.createdSessionId });
            console.log('Session set as active');
          } catch (error) {
            console.error('Error setting active session:', error);
          }
        }
        
        // Get the return URL or default to /pos
        const returnUrl = searchParams?.get('returnUrl') || '/pos';
        console.log('Redirecting to:', returnUrl);
        
        // Add a delay to ensure authentication state is fully updated
        setTimeout(() => {
          console.log('Executing redirect to:', returnUrl);
          // Use window.location for a full page reload to ensure clean state
          window.location.href = returnUrl;
        }, 1000); // 1 second delay to ensure state is updated
      } else {
        // Handle multi-factor authentication or other steps if needed
        console.log('Sign in not complete, status:', result.status);
        setError('Additional verification required. Please check your email.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        errors: err.errors,
        status: err.status,
        statusCode: err.statusCode
      });
      setError(err.errors?.[0]?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-6xl flex gap-16">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center items-start text-white space-y-10 flex-1">
            <div className="space-y-6 flex flex-col items-start">
              <div className="relative group flex flex-col items-start mb-2">
                <img
                  src="/retail-edge-logo-dark.svg"
                  alt="Retail Edge Logo"
                  className="w-64 h-auto object-contain"
                  style={{ padding: 0, margin: 0 }}
                />
              </div>
              <p className="text-base font-medium text-slate-100 tracking-normal leading-snug mt-2 mb-0">
                A cutting-edge platform for retail point-of-sale and business management, designed to streamline operations and accelerate growth.
              </p>
            </div>
            <div className="space-y-4 flex flex-col items-start">
              <div className="relative group flex flex-col items-start">
                <img
                  src="/vision-loop-logo-dark.svg"
                  alt="Vision Loop Logo"
                  className="w-40 h-auto object-contain"
                  style={{ padding: 0, margin: 0 }}
                />
              </div>
              <p className="text-base font-normal text-slate-100/80 tracking-normal leading-tight mt-1 mb-0">
                A premier destination for high-quality, diverse eyewear—crafted to suit every style and vision need.
              </p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <Card className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-3 p-8">
              <CardTitle className="text-4xl font-bold text-center text-blue-900">Welcome back</CardTitle>
              <CardDescription className="text-xl text-center text-blue-700">
                Enter your email and password to sign in
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email Address</Label>
                  <Input
                    id="identifier"
                    type="email"
                    value={formData.identifier}
                    onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                    placeholder="Enter your email address"
                    className="h-11 text-base"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Use your email address only, phone numbers are not supported for login
                  </p>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="password" className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-700">Password</span>
                    <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Forgot password?
                    </Link>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="h-11 text-base pr-12 border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all duration-200"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none transition-colors duration-200"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon open={showPassword} size={22} />
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                {authSuccess && <p className="text-green-500 text-center text-sm">Authentication successful! Redirecting to POS...</p>}
                <Button 
                  type="submit" 
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                  disabled={loading || !isLoaded || authSuccess}
                >
                  {authSuccess ? 'Authentication Successful! Redirecting...' : loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center p-8">
              <p className="text-base text-blue-700">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-lg">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-6 text-center text-blue-100 border-t border-blue-800">
        <p className="text-base">© {getCurrentYear()} Retail Edge - Enterprise POS System | Vision Loop - Eyewear Retail</p>
      </footer>
    </div>
  );
}
