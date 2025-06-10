'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import styles from '../app/auth/auth.module.css';
import { useAuth } from '@/hooks/useAuth';
import * as React from 'react';

type Role = 'Owner' | 'Manager' | 'Staff' | 'Admin';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  aadharCard: string;
  panCard: string;
  password: string;
  confirmPassword: string;
  role: Role;
  shopCode?: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    aadharCard: '',
    panCard: '',
    password: '',
    confirmPassword: '',
    role: 'Owner',
    shopCode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpExpiration, setEmailOtpExpiration] = useState(300); // 5 minutes in seconds
  const [emailVerificationAttempted, setEmailVerificationAttempted] = useState(false);

  const { sendEmailOTP, verifyEmailOTP, loading: authLoading, error: authError, cooldown } = useAuth();

  // Validation patterns
  const patterns = {
    aadhar: /^\d{12}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    phone: /^\d{10}$/,
    email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  };

  // useEffect for OTP expiration countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailOtpSent && !emailOtpVerified && emailOtpExpiration > 0) {
      timer = setInterval(() => {
        setEmailOtpExpiration((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [emailOtpSent, emailOtpVerified, emailOtpExpiration]);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (formData.email && !patterns.email.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (formData.phone && !patterns.phone.test(formData.phone)) {
          newErrors.phone = 'Phone number must be 10 digits';
        }
        break;
      case 2:
        if (!formData.aadharCard) newErrors.aadharCard = 'Aadhar card number is required';
        if (formData.aadharCard && !patterns.aadhar.test(formData.aadharCard)) {
          newErrors.aadharCard = 'Aadhar card must be 12 digits';
        }
        if (!formData.panCard) newErrors.panCard = 'PAN card number is required';
        if (formData.panCard && !patterns.pan.test(formData.panCard)) {
          newErrors.panCard = 'Invalid PAN card format';
        }
        break;
      case 3:
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if ((formData.role === 'Manager' || formData.role === 'Staff') && !formData.shopCode) {
          newErrors.shopCode = 'Shop code is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSendEmailOTP = async () => {
    if (!formData.email) {
      setErrors({ ...errors, email: 'Email is required' });
      return;
    }

    if (!patterns.email.test(formData.email)) {
      setErrors({ ...errors, email: 'Please enter a valid email address' });
      return;
    }

    setEmailVerificationAttempted(true);
    try {
      const result = await sendEmailOTP(formData.email);
      if (result) {
        if (result.isExistingUser) {
          // Show alert for existing user
          alert('This email is already registered. Please sign in instead.');
          // Redirect to login page
          window.location.href = '/auth/login';
          return;
        }
        setEmailOtpSent(true);
        setEmailOtpVerified(false);
        setEmailOtp('');
        setEmailOtpExpiration(300); // Reset to 5 minutes
        setEmailVerificationAttempted(false);
        setErrors({ ...errors, email: '' }); // Clear any previous email errors
      } else if (authError) {
        setErrors({ ...errors, email: authError });
      }
    } catch (error) {
      console.error('Error sending email OTP:', error);
      setErrors({ ...errors, email: 'Failed to send OTP. Please try again.' });
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtp) {
      setErrors({ ...errors, emailOtp: 'Please enter the OTP' });
      return;
    }

    if (emailOtp.length !== 6) {
      setErrors({ ...errors, emailOtp: 'Please enter all 6 digits' });
      return;
    }

    setEmailVerificationAttempted(true);
    try {
      const result = await verifyEmailOTP(emailOtp);
      if (result) {
        if (result.isExistingUser) {
          // Show alert for existing user
          alert('This email is already registered. Please sign in instead.');
          // Redirect to login page
          window.location.href = '/auth/login';
          return;
        }
        setEmailOtpVerified(true);
        setErrors({ ...errors, emailOtp: '' }); // Clear any previous OTP errors
      } else if (authError) {
        setErrors({ ...errors, emailOtp: authError });
      }
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      setErrors({ ...errors, emailOtp: 'Failed to verify OTP. Please try again.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({});
    
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid || !step2Valid || !step3Valid || !emailOtpVerified) {
      setErrors({ 
        submit: 'Please complete all required fields and verify your email correctly before creating your account' 
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        aadharCard: formData.aadharCard,
        panCard: formData.panCard,
        password: formData.password,
        role: formData.role,
        shopCode: formData.role !== 'Owner' ? formData.shopCode : undefined,
        emailVerified: true, // Indicates email has been verified via OTP
      };

      console.log('Signup payload:', payload);
      // TODO: Send to backend to complete user creation / authentication after custom token is handled
    } catch (err: any) {
      setErrors({ ...errors, submit: err.message });
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
              <Label htmlFor="email" className="text-base font-medium text-gray-700">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 text-base"
                  placeholder="name@example.com"
                />
                <Button
                  type="button"
                  onClick={handleSendEmailOTP}
                  disabled={emailOtpSent || authLoading || cooldown > 0 || !patterns.email.test(formData.email)}
                  className="whitespace-nowrap h-11 px-4 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 transition-colors disabled:bg-gray-400 disabled:border-gray-400 shadow-sm"
                >
                  {authLoading ? 'Sending...' : emailOtpSent ? 'OTP Sent' : 'Send OTP'}
                </Button>
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {emailOtpSent && (
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
                  <div className="grid grid-cols-6 gap-2">
                    {[...Array(6)].map((_, index) => (
                      <Input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={emailOtp[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 1);
                          if (value) {
                            const newOtp = emailOtp.split('');
                            newOtp[index] = value;
                            setEmailOtp(newOtp.join(''));
                            if (index < 5) {
                              const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                              nextInput?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
                            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }}
                        data-index={index}
                        className="h-10 w-full text-center text-lg font-medium"
                        disabled={emailOtpVerified || authLoading || emailOtpExpiration === 0}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Code sent to {formData.email}
                    </p>
                    {(emailOtpExpiration === 0 || emailVerificationAttempted) && (
                      <Button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={authLoading || cooldown > 0}
                        variant="link"
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
                        {cooldown > 0 
                          ? `Resend in ${cooldown}s`
                          : 'Resend code'}
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={handleVerifyEmailOTP}
                    disabled={emailOtpVerified || authLoading || emailOtpExpiration === 0 || emailOtp.length !== 6}
                    className="w-full h-9 text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 transition-colors disabled:bg-gray-400 disabled:border-gray-400 shadow-sm"
                  >
                    {authLoading ? 'Verifying...' : emailOtpVerified ? 'Verified' : 'Verify Code'}
                  </Button>
                  {errors.emailOtp && (
                    <p className="text-xs text-red-500 text-center">{errors.emailOtp}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium text-gray-700">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: value });
                }}
                className="h-11 text-base"
                placeholder="10-digit mobile number"
                maxLength={10}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadharCard" className="text-base font-medium text-gray-700">Aadhar Card Number</Label>
              <Input
                id="aadharCard"
                value={formData.aadharCard}
                onChange={(e) => setFormData({ ...formData, aadharCard: e.target.value })}
                className="h-11 text-base"
                placeholder="12-digit Aadhar number"
                maxLength={12}
              />
              {errors.aadharCard && <p className="text-red-500 text-sm mt-1">{errors.aadharCard}</p>}
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
            {(formData.role === 'Manager' || formData.role === 'Staff') && (
              <div className="space-y-2">
                <Label htmlFor="shopCode" className="text-base font-medium text-gray-700">Shop Code</Label>
                <Input
                  id="shopCode"
                  value={formData.shopCode}
                  onChange={(e) => setFormData({ ...formData, shopCode: e.target.value })}
                  className="h-11 text-base"
                  placeholder="Enter shop code"
                />
                {errors.shopCode && <p className="text-red-500 text-sm mt-1">{errors.shopCode}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 text-base"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-11 text-base"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );
    }
  };

  return (
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
                  disabled={currentStep === 1 && !emailOtpVerified}
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
  );
} 