"use client";

import { useAppSelector } from "@/state/hooks";
import type { RootState } from "@/state/store";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDarkMode = useAppSelector((state: RootState) => state.global.isDarkMode);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="flex-grow container mx-auto px-4 py-6 h-full">
        {children}
      </div>
    </div>
  );
}
