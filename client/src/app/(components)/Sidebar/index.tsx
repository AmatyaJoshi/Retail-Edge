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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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
    pathname === href || (pathname === "/" && href === "/dashboard");
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
          }
        transition-colors gap-3 ${isDarkMode
            ? "hover:bg-gray-700 hover:text-blue-300"
            : "hover:bg-blue-100 hover:text-blue-500"
          } ${isActive
            ? isDarkMode
              ? "bg-blue-900 text-blue-100"
              : "bg-blue-200 text-blue-900"
            : ""
          }
      }`}
      >
        <Icon className={`w-6 h-6 ${isDarkMode ? "!text-gray-300" : "!text-gray-700"}`} />

        <span
          className={`${isCollapsed ? "hidden" : "block"
            } font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
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

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
    } ${isDarkMode ? "bg-gray-800" : "bg-white"} transition-all duration-300 overflow-hidden h-screen shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-6 ${isSidebarCollapsed ? "px-5" : "px-8"
          }`}
      >
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
          <EyewearIcon />
          <span className="ml-2 text-xl font-semibold">Retail Edge</span>
        </div>

        <button
          className={`md:hidden px-3 py-3 rounded-full hover:bg-blue-100 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          onClick={toggleSidebar}
        >
          <Menu className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex flex-col mt-6 flex-1 overflow-y-auto">
        <SidebarLink
          href="/pos"
          icon={Home}
          label="POS"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/transactions"
          icon={Receipt}
          label="Transactions"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/inventory"
          icon={Archive}
          label="Inventory"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/associates"
          icon={Users}
          label="Associates"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/products"
          icon={ShoppingCart}
          label="Products"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/customers"
          icon={Home}
          label="Customers"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/expenses"
          icon={CircleDollarSign}
          label="Expenses"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={Settings}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mt-auto py-4`}>
        <div className="text-center">
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            &copy; 2025 RetailEdge
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