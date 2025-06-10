'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import styles from './auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-6xl flex gap-16">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center text-white space-y-10 flex-1">
            <div className="space-y-6">
              <div className="relative group">
                <h1 className="text-6xl font-bold tracking-tight transform transition-transform duration-300 group-hover:scale-105">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200 ${styles.animateGradientX}`}>
                    Retail Edge
                  </span>
                </h1>
                <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transform transition-all duration-300 group-hover:w-40 group-hover:from-blue-300 group-hover:to-blue-500"></div>
              </div>
              <p className="text-2xl text-blue-100 font-light tracking-wide transform transition-all duration-300 group-hover:text-blue-50">
                Enterprise POS System for Modern Retail
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative group">
                <h2 className="text-4xl font-semibold tracking-tight transform transition-transform duration-300 group-hover:scale-105">
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300 ${styles.animateGradientX}`}>
                    Vision Loop
                  </span>
                </h2>
                <div className="absolute -bottom-1 left-0 w-24 h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full transform transition-all duration-300 group-hover:w-32 group-hover:from-blue-200 group-hover:to-blue-300"></div>
              </div>
              <p className="text-xl text-blue-100/90 font-light tracking-wide transform transition-all duration-300 group-hover:text-blue-50">
                Empowering eyewear retail excellence
              </p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <Card className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-3 p-8">
              <CardTitle className="text-4xl font-bold text-center text-blue-900">Welcome back</CardTitle>
              <CardDescription className="text-xl text-center text-blue-700">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 text-base p-4 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-lg text-blue-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="border-blue-200 focus:border-blue-500 h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-lg text-blue-900">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="border-blue-200 focus:border-blue-500 h-12 text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
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
        <p className="text-base">© 2024 Retail Edge - Enterprise POS System | Vision Loop - Eyewear Retail</p>
      </footer>
    </div>
  );
} 