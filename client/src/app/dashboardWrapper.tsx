"use client";

import React, { useEffect } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";

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
        className={`flex w-full min-h-screen ${
          isDarkMode 
            ? 'bg-gray-900 text-gray-50' 
            : 'bg-gray-50 text-gray-900'
        }`}
      >
        <Sidebar />
        <main
          className={`flex flex-col w-full h-full py-7 px-9 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          } ${
            isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
          }`}
        >
          <Navbar />
          {children}
        </main>
      </div>
    </NotificationProvider>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;