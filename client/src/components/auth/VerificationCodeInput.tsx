import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface VerificationCodeInputProps {
  email: string;
  onVerificationSuccess: (isExistingUser: boolean) => void;
  onBack: () => void;
}

interface VerificationResult {
  isExistingUser: boolean;
  customToken?: string;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  email,
  onVerificationSuccess,
  onBack,
}) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyEmailOTP, loading, cooldown, sendEmailOTP } = useAuth();

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    try {
      const result = await verifyEmailOTP(verificationCode);
      if (result) {
        onVerificationSuccess(result.isExistingUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    
    try {
      const result = await sendEmailOTP(email);
      if (result?.isExistingUser) {
        // Show alert for existing user
        alert('This email is already registered. Please sign in instead.');
        // Redirect to login page
        window.location.href = '/auth/login';
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
      <p className="text-gray-600 text-center mb-6">
        We've sent a verification code to <span className="font-semibold">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={cooldown > 0 || loading}
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : 'Resend verification code'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-700 focus:outline-none focus:underline transition-colors"
          >
            Back to email input
          </button>
        </div>
      </form>
    </div>
  );
}; 