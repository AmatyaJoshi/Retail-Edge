'use client';

import SignupSteps from '@/components/SignupSteps';
import styles from './auth.module.css';

export default function SignupPage() {
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

          {/* Right side - Signup Form */}
          <SignupSteps />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-6 text-center text-blue-100 border-t border-blue-800">
        <p className="text-base">© 2025 Retail Edge - Enterprise POS System | Vision Loop - Eyewear Retail</p>
      </footer>
    </div>
  );
} 