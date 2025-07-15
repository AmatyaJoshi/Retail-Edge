import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the current year as a number
 * @returns The current year (e.g., 2025)
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
} 