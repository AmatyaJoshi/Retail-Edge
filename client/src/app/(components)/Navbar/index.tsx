"use client";

import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Menu, Moon, Settings, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import NotificationDropdown from "../NotificationDropdown";
import type { RootState } from "@/state/store";

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
  const isSidebarCollapsed = useAppSelector(
    (state: RootState) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className={`px-3 py-3 rounded-full hover:bg-blue-100 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          onClick={toggleSidebar}
        >
          <Menu className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} />
        </button>

        <div className="relative">
          <input
            type="search"
            placeholder="Start type to search groups & products"
            className={`pl-10 pr-4 py-2 w-50 md:w-60 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${
              isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
          />
        </div>
      </div>

      {/* CENTER */}
      <div className="flex items-center">
        {/* Temporarily commented out due to Next.js image configuration
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        */}
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
        <div className="flex items-center gap-3 cursor-pointer">
          <span className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
            Log Out
          </span>
        </div>
        <Link href="/settings">
          <Settings className={`cursor-pointer ${isDarkMode ? "text-gray-300" : "text-gray-500"}`} size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;