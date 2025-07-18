"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  type LucideIcon,
  Home,
  Users,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Menu,
  Archive,
  CircleDollarSign,
  Clipboard,
  Layout,
  Receipt,
  UserCog,
  CreditCard,
  Monitor,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs';
import { getCurrentYear } from '@/app/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/pos");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center w-full ${isCollapsed ? "justify-center py-4" : "justify-start px-6 py-4"}
          transition-colors gap-3 rounded-lg
          hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-200
          ${isActive ? "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100" : ""}
        `}
      >
        <Icon className="w-6 h-6 text-gray-700 dark:!text-gray-300" />
        <span className={`${isCollapsed ? "hidden" : "block text-base font-semibold tracking-wide text-gray-700 dark:text-gray-300"}`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState('User');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user?.id) {
        const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
        const res = await fetch(`${backendUrl}/api/auth/user-profile?clerkId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role || 'User');
        }
      }
    };
    if (isLoaded && user) fetchUserRole();
  }, [user, isLoaded]);

  // Helper function to check if navigation item should be visible based on user role
  const isNavigationVisible = (href: string) => {
    if (userRole === 'Staff') {
      // Staff can only access: POS, Transactions, Settings, Profile
      const allowedPaths = ['/pos', '/transactions', '/settings', '/profile'];
      return allowedPaths.includes(href);
    }
    // For Owner, Manager, Admin: hide profile link
    if (href === '/profile') return false;
    // All other roles (Owner, Manager, Admin) can access everything else
    return true;
  };

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"} bg-white dark:bg-gray-800 border-r-2 border-gray-400 dark:border-gray-700 transition-all duration-300 overflow-hidden h-screen z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-4 ${isSidebarCollapsed ? "" : ""
          }`}
      >
        <div className="flex items-center justify-center w-full">
          {/* Collapsed state: show collapse logo */}
          {isSidebarCollapsed ? (
            <>
              {/* Light mode collapsed logo */}
              <img
                src="/retail-edge-collapse-logo-light.svg"
                alt="Retail Edge Collapsed Logo"
                className="block dark:hidden w-14 h-14 object-contain"
              />
              {/* Dark mode collapsed logo */}
              <img
                src="/retail-edge-collapse-logo-dark.svg"
                alt="Retail Edge Collapsed Logo"
                className="hidden dark:block w-14 h-14 object-contain"
              />
            </>
          ) : (
            <>
              {/* Light mode logo */}
              <img
                src="/retail-edge-logo-light.svg"
                alt="Retail Edge Logo"
                className="block dark:hidden w-44 max-h-20 object-contain"
              />
              {/* Dark mode logo */}
              <img
                src="/retail-edge-logo-dark.svg"
                alt="Retail Edge Logo"
                className="hidden dark:block w-44 max-h-20 object-contain"
              />
            </>
          )}
        </div>

        <button
          className="md:hidden px-3 py-3 rounded-full hover:bg-blue-100 bg-gray-100 dark:bg-gray-700"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex flex-col mt-2 flex-1">
        {isNavigationVisible('/pos') && (
          <SidebarLink
            href="/pos"
            icon={Monitor}
            label="POS"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/transactions') && (
          <SidebarLink
            href="/transactions"
            icon={Receipt}
            label="Transactions"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/dashboard') && (
          <SidebarLink
            href="/dashboard"
            icon={Layout}
            label="Dashboard"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/inventory') && (
          <SidebarLink
            href="/inventory"
            icon={Archive}
            label="Inventory"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/associates') && (
          <SidebarLink
            href="/associates"
            icon={UserPlus}
            label="Associates"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/products') && (
          <SidebarLink
            href="/products"
            icon={Package}
            label="Products"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/customers') && (
          <SidebarLink
            href="/customers"
            icon={Users}
            label="Customers"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/expenses') && (
          <SidebarLink
            href="/expenses"
            icon={CircleDollarSign}
            label="Expenses"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {/* Employees link for Owner/Manager only */}
        {(userRole === 'Owner' || userRole === 'Manager') && (
          <SidebarLink
            href="/employees"
            icon={UserCog}
            label="Employees"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/settings') && (
          <SidebarLink
            href="/settings"
            icon={Settings}
            label="Settings"
            isCollapsed={isSidebarCollapsed}
          />
        )}
        {isNavigationVisible('/profile') && (
          <SidebarLink
            href="/profile"
            icon={UserCog}
            label="Profile"
            isCollapsed={isSidebarCollapsed}
          />
        )}
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mt-auto py-4`}>
        <div className="text-center">
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            &copy; {getCurrentYear()} RetailEdge
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;