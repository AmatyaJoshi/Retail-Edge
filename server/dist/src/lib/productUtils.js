"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBarcodeUnique = exports.isSKUUnique = exports.validateBarcode = exports.validateSKU = exports.generateUniqueBarcode = exports.generateRandomBarcode = exports.generateSequentialBarcode = exports.generateEAN13 = exports.generateAlternativeSKU = exports.generateSKU = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// SKU Generation Utilities
const generateSKU = async (category, brand) => {
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
exports.generateSKU = generateSKU;
const generateAlternativeSKU = async (brand) => {
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
exports.generateAlternativeSKU = generateAlternativeSKU;
// Barcode Generation Utilities
const generateEAN13 = (baseNumber) => {
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
exports.generateEAN13 = generateEAN13;
const generateSequentialBarcode = async () => {
    // Get total product count for sequential numbering
    const productCount = await prisma.products.count();
    // Start with a base number (e.g., 123456789000)
    const baseNumber = '123456789000';
    const sequence = (productCount + 1).toString().padStart(3, '0');
    const barcodeBase = baseNumber.substring(0, 9) + sequence;
    return (0, exports.generateEAN13)(barcodeBase);
};
exports.generateSequentialBarcode = generateSequentialBarcode;
const generateRandomBarcode = () => {
    // Generate a random 12-digit number
    const randomDigits = Math.floor(Math.random() * 900000000000) + 100000000000;
    return (0, exports.generateEAN13)(randomDigits.toString());
};
exports.generateRandomBarcode = generateRandomBarcode;
const generateUniqueBarcode = async () => {
    let barcode;
    let attempts = 0;
    const maxAttempts = 10;
    do {
        barcode = (0, exports.generateRandomBarcode)();
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
    return (0, exports.generateSequentialBarcode)();
};
exports.generateUniqueBarcode = generateUniqueBarcode;
// Validation Utilities
const validateSKU = (sku) => {
    // SKU should be alphanumeric with optional hyphens, 3-20 characters
    return /^[A-Z0-9-]{3,20}$/.test(sku.toUpperCase());
};
exports.validateSKU = validateSKU;
const validateBarcode = (barcode) => {
    // Barcode should be exactly 12 or 13 digits
    return /^[0-9]{12,13}$/.test(barcode);
};
exports.validateBarcode = validateBarcode;
const isSKUUnique = async (sku) => {
    const existingProduct = await prisma.products.findFirst({
        where: { sku: sku }
    });
    return !existingProduct;
};
exports.isSKUUnique = isSKUUnique;
const isBarcodeUnique = async (barcode) => {
    const existingProduct = await prisma.products.findFirst({
        where: { barcode: barcode }
    });
    return !existingProduct;
};
exports.isBarcodeUnique = isBarcodeUnique;
