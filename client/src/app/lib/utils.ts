import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format = 'PP') {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatIndianNumber = (num: number) => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num}`;
};

// SKU Generation Utilities
export const generateSKU = (category: string, brand: string, productCount: number = 1): string => {
  const categoryCode = (category || 'GEN').toUpperCase().substring(0, 3);
  const brandCode = (brand || 'BRAND').toUpperCase().substring(0, 4).replace(/\s+/g, '');
  const sequence = productCount.toString().padStart(4, '0');
  return `${categoryCode}-${brandCode}-${sequence}`;
};

export const generateAlternativeSKU = (brand: string, productCount: number = 1): string => {
  const brandCode = (brand || 'BRAND').toUpperCase().substring(0, 6).replace(/\s+/g, '');
  const date = new Date().toISOString().slice(2, 8); // YYMMDD
  const sequence = productCount.toString().padStart(3, '0');
  return `${brandCode}-${date}-${sequence}`;
};

// Barcode Generation Utilities
export const generateEAN13 = (baseNumber: string): string => {
  // Ensure base number is 12 digits
  const paddedBase = baseNumber.padStart(12, '0').substring(0, 12);
  
  // Calculate check digit for EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(paddedBase[i] || '0');
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return paddedBase + checkDigit;
};

export const generateSequentialBarcode = (productCount: number = 1): string => {
  // Start with a base number (e.g., 123456789000)
  const baseNumber = '123456789000';
  const sequence = productCount.toString().padStart(3, '0');
  const barcodeBase = baseNumber.substring(0, 9) + sequence;
  return generateEAN13(barcodeBase);
};

export const generateRandomBarcode = (): string => {
  // Generate a random 12-digit number
  const randomDigits = Math.floor(Math.random() * 900000000000) + 100000000000;
  return generateEAN13(randomDigits.toString());
};

// Validation Utilities
export const validateSKU = (sku: string): boolean => {
  // SKU should be alphanumeric with optional hyphens, 3-20 characters
  return /^[A-Z0-9-]{3,20}$/.test(sku.toUpperCase());
};

export const validateBarcode = (barcode: string): boolean => {
  // Barcode should be exactly 12 or 13 digits
  return /^[0-9]{12,13}$/.test(barcode);
};

/**
 * Get the current year as a number
 * @returns The current year (e.g., 2025)
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
