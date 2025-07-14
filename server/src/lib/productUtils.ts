import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SKU Generation Utilities
export const generateSKU = async (category: string, brand: string): Promise<string> => {
  const categoryCode = (category || 'GEN').toUpperCase().substring(0, 3);
  const brandCode = (brand || 'BRAND').toUpperCase().substring(0, 4).replace(/\s+/g, '');
  
  // Get count of existing products with same category and brand
  const productCount = await prisma.products.count({
    where: {
      category: category,
      brand: brand
    }
  });
  
  const sequence = (productCount + 1).toString().padStart(4, '0');
  return `${categoryCode}-${brandCode}-${sequence}`;
};

export const generateAlternativeSKU = async (brand: string): Promise<string> => {
  const brandCode = (brand || 'BRAND').toUpperCase().substring(0, 6).replace(/\s+/g, '');
  const date = new Date().toISOString().slice(2, 8); // YYMMDD
  
  // Get total product count for this brand
  const productCount = await prisma.products.count({
    where: {
      brand: brand
    }
  });
  
  const sequence = (productCount + 1).toString().padStart(3, '0');
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

export const generateSequentialBarcode = async (): Promise<string> => {
  // Get total product count for sequential numbering
  const productCount = await prisma.products.count();
  
  // Start with a base number (e.g., 123456789000)
  const baseNumber = '123456789000';
  const sequence = (productCount + 1).toString().padStart(3, '0');
  const barcodeBase = baseNumber.substring(0, 9) + sequence;
  return generateEAN13(barcodeBase);
};

export const generateRandomBarcode = (): string => {
  // Generate a random 12-digit number
  const randomDigits = Math.floor(Math.random() * 900000000000) + 100000000000;
  return generateEAN13(randomDigits.toString());
};

export const generateUniqueBarcode = async (): Promise<string> => {
  let barcode: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    barcode = generateRandomBarcode();
    attempts++;
    
    // Check if barcode already exists
    const existingProduct = await prisma.products.findFirst({
      where: { barcode: barcode }
    });
    
    if (!existingProduct) {
      return barcode;
    }
  } while (attempts < maxAttempts);
  
  // If we can't find a unique random barcode, use sequential
  return generateSequentialBarcode();
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

export const isSKUUnique = async (sku: string): Promise<boolean> => {
  const existingProduct = await prisma.products.findFirst({
    where: { sku: sku }
  });
  return !existingProduct;
};

export const isBarcodeUnique = async (barcode: string): Promise<boolean> => {
  const existingProduct = await prisma.products.findFirst({
    where: { barcode: barcode }
  });
  return !existingProduct;
}; 