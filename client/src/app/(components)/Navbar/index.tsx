"use client";

import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { ChevronDown, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "../NotificationDropdown";
import type { RootState } from "@/state/store";
import { useClerk, useUser } from '@clerk/nextjs';

// Eyewear SVG icon from svgrepo.com
const EyewearIcon: React.FC = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const isSidebarCollapsed = useAppSelector(
    (state: RootState) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('User');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user role from database
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/user-role?clerkId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role || 'User');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    if (isLoaded && user) {
      fetchUserRole();
    }
  }, [user, isLoaded]);

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
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-5">
        <button
          className={`px-3 py-3 rounded-full hover:bg-blue-100 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
          onClick={toggleSidebar}
        >
          <Menu className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} />
        </button>
      </div>

      {/* CENTER */}
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <EyewearIcon />
        </div>
        <span className="ml-2 text-xl font-semibold">Vision Loop</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full hover:bg-opacity-80 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
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
            className={`flex items-center gap-2 rounded-full ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isDarkMode ? "border-gray-600 bg-blue-600" : "border-gray-300 bg-blue-600"} flex items-center justify-center transition-all duration-200 shadow-sm`}>
              <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
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
                  <span className="text-white font-semibold text-base">{getUserInitials()}</span>
                </div>
                <div>
                  <h3 className={`text-base font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{getUserDisplayName()}</h3>
                  <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{user?.emailAddresses[0]?.emailAddress || 'No email'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}`}>{userRole}</span>
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