'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import * as React from 'react';
import EyeIcon from "@/components/ui/EyeIcon";
// Remove Clerk imports and hooks
// import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type Role = 'Owner' | 'Manager' | 'Staff' | 'Admin';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  aadhaar: string;
  panCard: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupSteps() {
  const router = useRouter();
  // Remove Clerk signUp, isLoaded, and signUp.create usage
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    aadhaar: '',
    panCard: '',
    password: '',
    confirmPassword: '',
    role: 'Owner',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpExpiration, setEmailOtpExpiration] = useState(0);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [showInvalidOtpPopup, setShowInvalidOtpPopup] = useState(false);
  const [invalidOtpTimer, setInvalidOtpTimer] = useState(0);
  const [showExistingUserPopup, setShowExistingUserPopup] = useState(false);
  const [existingUserMessage, setExistingUserMessage] = useState('');

  // State for Appwrite Email OTP
  const [appwriteUserId, setAppwriteUserId] = useState<string>('');
  const [appwriteSecret, setAppwriteSecret] = useState<string>('');

  // Load Appwrite credentials from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('appwriteUserId');
    const storedSecret = localStorage.getItem('appwriteSecret');
    
    if (storedUserId) {
      setAppwriteUserId(storedUserId);
      console.log('Loaded appwriteUserId from localStorage:', storedUserId);
    }
    if (storedSecret) {
      setAppwriteSecret(storedSecret);
      console.log('Loaded appwriteSecret from localStorage');
    }
  }, []);

  // Save Appwrite credentials to localStorage whenever they change
  useEffect(() => {
    if (appwriteUserId) {
      localStorage.setItem('appwriteUserId', appwriteUserId);
      console.log('Saved appwriteUserId to localStorage:', appwriteUserId);
    }
    if (appwriteSecret) {
      localStorage.setItem('appwriteSecret', appwriteSecret);
      console.log('Saved appwriteSecret to localStorage');
    }
  }, [appwriteUserId, appwriteSecret]);

  // Clear Appwrite credentials from localStorage when verification is complete
  useEffect(() => {
    if (emailOtpVerified) {
      localStorage.removeItem('appwriteSecret');
      console.log('Cleared appwriteSecret from localStorage after verification');
    }
  }, [emailOtpVerified]);

  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[6-9]\d{9}$/,
    aadhaar: /^\d{12}$/,
    panCard: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!patterns.email.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!emailOtpVerified) newErrors.email = 'Please verify your email with OTP';
        break;

      case 2:
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!patterns.phone.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.aadhaar.trim()) {
          newErrors.aadhaar = 'Aadhaar number is required';
        } else if (!patterns.aadhaar.test(formData.aadhaar)) {
          newErrors.aadhaar = 'Please enter a valid 12-digit Aadhaar number';
        }
        if (!formData.panCard.trim()) {
          newErrors.panCard = 'PAN card number is required';
        }
        break;

      case 3:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (!patterns.password.test(formData.password)) {
          newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    console.log('Next button clicked');
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    console.log('Email OTP verified:', emailOtpVerified);
    console.log('Email OTP sent:', emailOtpSent);
    
    if (validateStep(currentStep)) {
      console.log('Validation passed, moving to next step');
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Validation failed, errors:', errors);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Use Appwrite for sending OTP
  const handleSendEmailOTP = async () => {
    setAuthLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      console.log('Send OTP response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP. Please try again.');
      }
      
      // Store the userId and secret from Appwrite
      console.log('Setting appwriteUserId:', data.userId);
      console.log('Setting appwriteSecret:', data.secret ? '***' : 'empty/undefined');
      setAppwriteUserId(data.userId);
      setAppwriteSecret(data.secret || ''); // Handle empty string case
      
      setEmailOtpSent(true);
      setEmailOtpExpiration(300); // 5 minutes
      startOtpTimer();
    } catch (err: any) {
      setErrors({ email: err.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    const otpCode = emailOtp.join('');
    if (otpCode.length !== 6) {
      setErrors({ emailOtp: 'Please enter the complete 6-digit code' });
      return;
    }

    console.log('Verification attempt - appwriteUserId:', appwriteUserId);
    console.log('Verification attempt - appwriteSecret:', appwriteSecret ? '***' : 'empty/undefined');

    if (!appwriteUserId || !appwriteSecret || appwriteSecret.trim() === '') {
      setErrors({ emailOtp: 'OTP session not found. Please request a new OTP.' });
      return;
    }

    setAuthLoading(true);
    setErrors({});

    try {
      // Use Appwrite's Email OTP verification
      // The secret contains the OTP, but we need to verify the user entered the correct code
      // We'll send the userId and secret to our backend, which will use Appwrite's createSession
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: appwriteUserId, 
          secret: appwriteSecret 
        }),
      });

      const data = await response.json();
      console.log('Verify OTP response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code. Please try again.');
      }

      // Email verified successfully - store the actual Appwrite user ID
      setAppwriteUserId(data.appwriteUserId); // Update with the actual Appwrite user ID
      setEmailOtpVerified(true);
      setEmailOtpExpiration(0);
      setErrors({});
      
      // Clear the secret but keep the userId
      setAppwriteSecret('');
      
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const errorMsg = err.message || 'Invalid verification code. Please try again.';
      setErrors({ emailOtp: errorMsg });
      setShowInvalidOtpPopup(true);
      setInvalidOtpTimer(30);
      startInvalidOtpTimer();
    } finally {
      setAuthLoading(false);
    }
  };

  const startOtpTimer = () => {
    const interval = setInterval(() => {
      setEmailOtpExpiration((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startInvalidOtpTimer = () => {
    const interval = setInterval(() => {
      setInvalidOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowInvalidOtpPopup(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate all steps and collect all errors
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    if (!step1Valid || !step2Valid || !step3Valid || !emailOtpVerified) {
      // Don't set a generic error message, let individual field validations show their specific errors
      return;
    }
    
    setLoading(true);
    try {
      // Only call backend registration API
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        aadhaar: formData.aadhaar,
        panCard: formData.panCard,
        password: formData.password,
        role: formData.role,
        appwriteUserId: appwriteUserId,
        emailVerified: true
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        let errorMsg = data.error || 'Failed to create account';
        if (typeof errorMsg === 'object' && errorMsg !== null) {
          if (errorMsg.errors && Array.isArray(errorMsg.errors)) {
            errorMsg = errorMsg.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
          } else {
            errorMsg = JSON.stringify(errorMsg);
          }
        }
        throw new Error(errorMsg);
      }
      // On success, redirect to login
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrors({ submit: err.message || 'Failed to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-base font-medium text-gray-700">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-11 text-base w-full bg-white border-gray-200 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="Owner" className="text-base py-2.5 px-3 hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Owner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Manager" className="text-base py-2.5 px-3 hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Manager</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Staff" className="text-base py-2.5 px-3 hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Staff</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin" className="text-base py-2.5 px-3 hover:bg-blue-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-medium text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-11 text-base"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-medium text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11 text-base"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium text-gray-700">Email Address (for login)</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 text-base"
                  placeholder="name@example.com"
                  disabled={emailOtpVerified}
                />
                <Button
                  type="button"
                  onClick={handleSendEmailOTP}
                  disabled={emailOtpSent || authLoading || !patterns.email.test(formData.email) || emailOtpVerified}
                  className={`whitespace-nowrap h-11 px-4 text-base font-medium border transition-colors shadow-sm
                    ${emailOtpVerified ? 'bg-green-600 border-green-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white border-gray-800 disabled:bg-gray-400 disabled:border-gray-400'}`}
                >
                  {emailOtpVerified ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Verified
                    </span>
                  ) : authLoading ? 'Sending...' : emailOtpSent ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      OTP Sent
                    </span>
                  ) : 'Send OTP'}
                </Button>
              </div>
              <p className="text-xs text-blue-600">
                You will use this email address to log in to your account. Make sure it's correct.
              </p>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {emailOtpSent && !emailOtpVerified && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailOtp" className="text-sm font-medium text-gray-700">Verification Code</Label>
                    <p className="text-xs text-gray-500">
                      {emailOtpExpiration > 0 
                        ? `Expires in ${Math.floor(emailOtpExpiration / 60)}:${(emailOtpExpiration % 60).toString().padStart(2, '0')}`
                        : 'Expired'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Modernized OTP input */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <Input
                        key={i}
                        id={`emailOtp-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={emailOtp[i] || ''}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '');
                          const newOtp = [...emailOtp];
                          newOtp[i] = value;
                          setEmailOtp(newOtp);
                          // Move focus to next box if value entered
                          if (value && i < 5) {
                            const next = document.getElementById(`emailOtp-${i + 1}`);
                            if (next) (next as HTMLInputElement).focus();
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !emailOtp[i] && i > 0) {
                            const prev = document.getElementById(`emailOtp-${i - 1}`);
                            if (prev) (prev as HTMLInputElement).focus();
                          }
                        }}
                        className="h-11 w-10 text-center text-lg font-medium tracking-widest border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all placeholder-gray-400 bg-white mx-0.5"
                        disabled={emailOtpVerified || authLoading || emailOtpExpiration === 0}
                        autoComplete="one-time-code"
                      />
                    ))}
                    <Button
                      type="button"
                      onClick={handleVerifyEmailOTP}
                      disabled={emailOtpVerified || authLoading || emailOtpExpiration === 0 || emailOtp.length !== 6}
                      className={`h-11 px-4 text-base font-medium border transition-colors shadow-sm ml-2
                        ${emailOtpVerified ? 'bg-green-600 border-green-700 text-white animate-pulse' : 'bg-gray-900 hover:bg-gray-800 text-white border-gray-800 disabled:bg-gray-400 disabled:border-gray-400'}`}
                    >
                      {authLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Code sent to {formData.email}
                    </p>
                    <Button
                      type="button"
                      onClick={handleSendEmailOTP}
                      disabled={authLoading || emailOtpExpiration > 0}
                      variant="link"
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400"
                    >
                      {emailOtpExpiration > 0 
                        ? `Resend in ${Math.floor(emailOtpExpiration / 60)}:${(emailOtpExpiration % 60).toString().padStart(2, '0')}`
                        : 'Resend code'}
                    </Button>
                  </div>
                  {errors.emailOtp && (
                    <p className="text-xs text-red-500 text-center mt-1">{errors.emailOtp}</p>
                  )}
                </div>
              </div>
            )}
            {emailOtpVerified && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in-out">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span className="text-green-700 font-medium">Email verified</span>
              </div>
            )}

            {/* Clerk Smart CAPTCHA widget mount point */}
            {/* This div is now rendered only on step 3 */}
            {/* <div id="clerk-captcha" className="mt-4" /> */}
            {/* End Clerk CAPTCHA */}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium text-gray-700">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  // Only allow digits, remove any non-digit characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: value });
                }}
                className="h-11 text-base"
                placeholder="10-digit mobile number (without +)"
                maxLength={10}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar" className="text-base font-medium text-gray-700">Aadhar Card Number</Label>
              <Input
                id="aadhaar"
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                className="h-11 text-base"
                placeholder="12-digit Aadhar number"
                maxLength={12}
              />
              {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="panCard" className="text-base font-medium text-gray-700">PAN Card Number</Label>
              <Input
                id="panCard"
                value={formData.panCard}
                onChange={(e) => setFormData({ ...formData, panCard: e.target.value.toUpperCase() })}
                className="h-11 text-base"
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              {errors.panCard && <p className="text-red-500 text-sm mt-1">{errors.panCard}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700">Password</span>
                <span className="text-xs text-blue-600 font-medium">Minimum 8 characters</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 text-base pr-12 border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all duration-200"
                  placeholder="Enter your password"
                  minLength={8}
                  autoComplete="new-password"
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
              {formData.password && (
                <div className="pt-1">
                  <div className="flex gap-1 items-center">
                    <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>8+ chars</span>
                    <span>Uppercase</span>
                    <span>Number</span>
                    <span>Symbol</span>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    const newConfirmPassword = e.target.value;
                    setFormData({ ...formData, confirmPassword: newConfirmPassword });
                    
                    // Clear confirmPassword error if passwords now match
                    if (newConfirmPassword && formData.password === newConfirmPassword) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.confirmPassword;
                        return newErrors;
                      });
                    }
                  }}
                  className="h-11 text-base pr-12 border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-100 transition-all duration-200"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 focus:outline-none transition-colors duration-200"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirmPassword} size={22} />
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            {/* Clerk Smart CAPTCHA widget mount point - only on final step */}
            <div id="clerk-captcha" className="mt-4" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {showInvalidOtpPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900">Invalid Code</h3>
              </div>
              <button 
                onClick={() => setShowInvalidOtpPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">The verification code you entered is invalid. Please check and try again.</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div 
                  className="h-1.5 rounded-full bg-red-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${Math.round(Math.max(0, Math.min(1, invalidOtpTimer / 30)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="space-y-2 p-5 border-b border-gray-100">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Create an account
          </CardTitle>
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'bg-blue-600 w-8'
                    : currentStep > step
                    ? 'bg-blue-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-600 text-base p-3 rounded-lg shadow-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errors.submit}</span>
              </div>
            )}

            {renderStep()}

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="w-24 h-10 text-base font-medium hover:bg-gray-50"
                  >
                    ← Back
                  </Button>
                ) : (
                  <div className="w-24" />
                )}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-24 h-10 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next →
                  </Button>
                ) : (
                  <div className="w-full flex justify-end">
                    <Button
                      type="submit"
                      className="w-48 h-10 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center p-4 bg-gray-50/50 border-t border-gray-100">
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>

      <ExistingUserPopup
        message={existingUserMessage}
        isOpen={showExistingUserPopup}
        onClose={() => setShowExistingUserPopup(false)}
        onLogin={() => {
          setShowExistingUserPopup(false);
          router.push('/auth/login');
        }}
      />
    </>
  );
}

function ExistingUserPopup({
  message,
  isOpen,
  onClose,
  onLogin
}: {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-900">Account Already Exists</h3>
        </div>
        <div className="p-5">
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={onLogin}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}