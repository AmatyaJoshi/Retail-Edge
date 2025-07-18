'use client';

import SignupSteps from '@/components/SignupSteps';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentYear } from '@/app/lib/utils';
import Image from 'next/image';

export default function SignupPage() {
  const { isLoaded } = useSignUp();
  const { isSignedIn } = useUser();
  const router = useRouter();

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('User is already signed in, redirecting to POS');
      router.push('/pos');
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-y-auto">
      <div className="flex-1 flex items-center justify-center px-2 md:px-8 py-4">
        <div className="w-full max-w-6xl flex gap-8 xl:gap-16 overflow-hidden">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center items-start text-white space-y-10 flex-1">
            <div className="space-y-6 flex flex-col items-start">
              <div className="relative group flex flex-col items-start mb-2">
                <Image
                  src="/retail-edge-logo-dark.svg"
                  alt="Retail Edge Logo"
                  width={256}
                  height={64}
                />
              </div>
              <p className="text-base font-medium text-slate-100 tracking-normal leading-snug mt-2 mb-0">
                A cutting-edge platform for retail point-of-sale and business management, designed to streamline operations and accelerate growth.
              </p>
            </div>
            <div className="space-y-4 flex flex-col items-start">
              <div className="relative group flex flex-col items-start">
                <Image
                  src="/vision-loop-logo-dark.svg"
                  alt="Vision Loop Logo"
                  width={160}
                  height={64}
                />
              </div>
              <p className="text-base font-normal text-slate-100/80 tracking-normal leading-tight mt-1 mb-0">
                A premier destination for high-quality, diverse eyewear—crafted to suit every style and vision need.
              </p>
            </div>
          </div>

          {/* Right side - Signup Form */}
          <SignupSteps />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-4 text-center text-blue-100 border-t border-blue-800">
        <p className="text-base">© {getCurrentYear()} Retail Edge - Enterprise POS System | Vision Loop - Eyewear Retail</p>
      </footer>
    </div>
  );
}
