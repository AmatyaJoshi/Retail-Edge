"use client";
import { useEffect } from "react";
import { useAppSelector } from "../hooks/useAppSelector";

export default function DarkModeSync() {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);
  return null;
} 