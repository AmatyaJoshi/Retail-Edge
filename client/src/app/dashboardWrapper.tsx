"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import RouteProtection from "@/app/components/RouteProtection";
import StoreProvider, { useAppSelector } from "./redux";
import { NotificationProvider, useNotifications } from "./contexts/NotificationContext";
import { usePathname } from "next/navigation";

// Example notifications component
const NotificationInitializer = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Add some example notifications
    addNotification({
      title: "Welcome to Vision Loop",
      message: "Your optical store management system is ready to use.",
      type: "info"
    });

    addNotification({
      title: "Low Stock Alert",
      message: "5 products are running low on stock. Check inventory management.",
      type: "warning"
    });

    addNotification({
      title: "New Sale",
      message: "A new sale of ₹2,500 was completed successfully.",
      type: "success"
    });
  }, [addNotification]);

  return null;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const pathname = usePathname();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <NotificationProvider>
      <NotificationInitializer />
      <div
        className={`flex w-full h-screen overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-900 text-gray-50' 
            : 'bg-white text-gray-900'
        }`}
      >
        {pathname !== "/settings" && <Sidebar />}
        <main
          className={`flex flex-col w-full h-full min-h-0 flex-1 overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${pathname === "/pos" || pathname === "/profile" ? (isSidebarCollapsed ? "md:pl-24" : "md:pl-64") : ""} ${pathname === "/products" ? (isSidebarCollapsed ? "md:pl-16" : "md:pl-64") : pathname !== "/settings" && pathname !== "/pos" && pathname !== "/profile" ? (isSidebarCollapsed ? "md:pl-24" : "md:pl-72") : ""} p-0 m-0`}
        >
          <Navbar showBackButton={pathname === "/settings"} />
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <RouteProtection>
        <DashboardLayout>{children}</DashboardLayout>
      </RouteProtection>
    </StoreProvider>
  );
};

export default DashboardWrapper;