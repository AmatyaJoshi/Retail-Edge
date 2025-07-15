"use client";

import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { ChevronDown, LogOut, Menu, Moon, Settings, Sun, User, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "../NotificationDropdown";
import type { RootState } from "@/state/store";
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AIAssistantButton from '../AIAssistantButton';

// Eyewear SVG icon from svgrepo.com
const EyewearIcon: React.FC = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

interface NavbarProps {
  showBackButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showBackButton }) => {
  const dispatch = useAppDispatch();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector(
    (state: RootState) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('User');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Calculate left offset and width for the navbar
  const leftOffset = showBackButton ? '' : (isSidebarCollapsed ? 'md:left-16' : 'md:left-64');
  const widthClass = showBackButton ? 'w-full' : (isSidebarCollapsed ? 'md:w-[calc(100%-4rem)]' : 'md:w-[calc(100%-16rem)]');

  // Fetch user role and photo from database
  const fetchUserData = async () => {
      if (user?.id) {
        try {
        // Fetch user profile data
        const profileResponse = await fetch(`/api/user-profile?clerkId=${user.id}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserPhotoUrl(profileData.photoUrl || null);
        }
        
        // Fetch user role
        const roleResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/user-role?clerkId=${user.id}`);
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setUserRole(roleData.role || 'User');
          }
        } catch (error) {
        console.error('Error fetching user data:', error);
        }
      }
    };

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [user, isLoaded]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'User';
  };

  return (
    <div
      className={`flex justify-between items-center mb-7 bg-white border-b-2 border-gray-400 dark:bg-gray-800 dark:border-b-2 dark:border-gray-700 fixed top-0 z-30 shadow-md h-20 px-8 transition-all duration-300 ${leftOffset} ${widthClass}`}
      style={{ minHeight: '5rem' }}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-5">
        <>
          {showBackButton ? (
            <div className="relative group">
              <button
                className="flex items-center justify-center w-11 h-11 rounded-full shadow-md border-none bg-[#1e293b] hover:bg-[#334155] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                onClick={() => router.back()}
                aria-label="Back"
              >
                <ArrowLeft className="w-7 h-7 text-white" />
              </button>
            </div>
          ) : (
        <button
          className={`px-3 py-3 rounded-full border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} hover:bg-blue-100 cursor-pointer`}
          onClick={toggleSidebar}
        >
          <Menu className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} />
        </button>
          )}
        </>
      </div>

      {/* CENTER */}
      <div className="flex items-center">
        {pathname === "/settings" ? (
          <div className="flex items-center justify-center w-44 max-h-16">
            {/* Light mode logo */}
            <img
              src="/retail-edge-logo-light.svg"
              alt="Retail Edge Logo"
              className="block dark:hidden w-44 max-h-16 object-contain"
            />
            {/* Dark mode logo */}
            <img
              src="/retail-edge-logo-dark.svg"
              alt="Retail Edge Logo"
              className="hidden dark:block w-44 max-h-16 object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-44 max-h-16">
            {/* Light mode logo */}
            <img
              src="/vision-loop-logo-light.svg"
              alt="Vision Loop Logo"
              className="block dark:hidden w-44 max-h-16 object-contain"
            />
            {/* Dark mode logo */}
            <img
              src="/vision-loop-logo-dark.svg"
              alt="Vision Loop Logo"
              className="hidden dark:block w-44 max-h-16 object-contain"
            />
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <LanguageSwitcher />
        <AIAssistantButton />
        <div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'} hover:bg-blue-50 cursor-pointer`}
          >
            {isDarkMode ? (
              <Sun className={`cursor-pointer ${isDarkMode ? "text-yellow-400" : "text-gray-500"}`} size={24} />
            ) : (
              <Moon className={`cursor-pointer ${isDarkMode ? "text-gray-300" : "text-gray-500"}`} size={24} />
            )}
          </button>
        </div>
        <NotificationDropdown />
        <hr className={`w-0 h-7 border border-solid border-l ${isDarkMode ? "border-gray-700" : "border-gray-300"} mx-3`} />
        
        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={toggleProfileMenu}
            className={`flex items-center gap-2 rounded-full border ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-blue-50'} p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer`}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isDarkMode ? "border-gray-600 bg-blue-600" : "border-gray-300 bg-blue-600"} flex items-center justify-center transition-all duration-200 shadow-sm`}>
              {userPhotoUrl ? (
                <img src={userPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
              <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start ml-2 mr-1">
              <span className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{getUserDisplayName()}</span>
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{userRole}</span>
            </div>
            <ChevronDown className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"} transition-transform duration-200 ${isProfileMenuOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          {isProfileMenuOpen && (
            <div 
              className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 z-10 ${
                isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              } ring-1 ring-black ring-opacity-5 focus:outline-none transform origin-top-right transition-all duration-200 ease-out animate-fadeIn`}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <div className="p-4 flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${isDarkMode ? "border-gray-600 bg-blue-600" : "border-gray-300 bg-blue-600"} flex items-center justify-center`}>
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                  <span className="text-white font-semibold text-base">{getUserInitials()}</span>
                  )}
                </div>
                <div>
                  <h3 className={`text-base font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{getUserDisplayName()}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${userRole === 'Owner' ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') : userRole === 'Manager' ? (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') : (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700')}`}>{userRole}</span>
                  <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{user?.emailAddresses[0]?.emailAddress || 'No email'}</p>
                </div>
              </div>
              
              <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} mb-1`}></div>
              
              <div className="px-1 py-1">
                <Link href="/profile" className={`flex items-center px-4 py-2.5 text-sm rounded-md ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`} role="menuitem">
                  <User className="w-4 h-4 mr-3" />
                  Your Profile
                </Link>
                <Link href="/settings" className={`flex items-center px-4 py-2.5 text-sm rounded-md ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`} role="menuitem">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
              </div>
              
              <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} my-1`}></div>
              
              <div className="px-1 py-1">
                <button 
                  onClick={() => {
                    signOut(() => {
                      window.location.href = '/auth/login';
                    });
                  }}
                  className={`flex items-center px-4 py-2.5 text-sm rounded-md w-full text-left ${
                    isDarkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"
                  }`} 
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;