"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
async function updateDatabase() {
    try {
        // Read seed data files
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'users.json'), 'utf-8'));
        const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'products.json'), 'utf-8'));
        const salesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'sales.json'), 'utf-8'));
        const prescriptionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'prescriptions.json'), 'utf-8'));
        const expensesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'expenses.json'), 'utf-8'));
        const salesSummaryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'salesSummary.json'), 'utf-8'));
        const purchaseSummaryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'purchaseSummary.json'), 'utf-8'));
        console.log('Starting database update...');
        // Delete existing data in reverse order of dependencies
        console.log('Deleting existing data...');
        await prisma.sales.deleteMany();
        await prisma.purchases.deleteMany();
        await prisma.prescriptions.deleteMany();
        await prisma.products.deleteMany();
        await prisma.customers.deleteMany();
        await prisma.salesSummary.deleteMany();
        await prisma.purchaseSummary.deleteMany();
        // Insert new data in order of dependencies
        console.log('Inserting new data...');
        // Insert Users first
        console.log('Inserting users...');
        try {
            await prisma.customers.createMany({
                data: usersData,
            });
            console.log(`Successfully inserted ${usersData.length} users`);
        }
        catch (error) {
            console.error('Error inserting users:', error);
            throw error;
        }
        // Insert Products
        console.log('Inserting products...');
        try {
            await prisma.products.createMany({
                data: productsData,
            });
            console.log(`Successfully inserted ${productsData.length} products`);
        }
        catch (error) {
            console.error('Error inserting products:', error);
            throw error;
        }
        // Insert Sales
        console.log('Inserting sales...');
        try {
            await prisma.sales.createMany({
                data: salesData.map((sale) => ({
                    saleId: sale.saleId,
                    productId: sale.productId,
                    customerId: sale.customerId,
                    timestamp: new Date(sale.timestamp),
                    quantity: sale.quantity,
                    unitPrice: sale.unitPrice,
                    totalAmount: sale.totalAmount,
                    paymentMethod: sale.paymentMethod,
                    status: sale.status,
                })),
            });
            console.log(`Successfully inserted ${salesData.length} sales`);
        }
        catch (error) {
            console.error('Error inserting sales:', error);
            throw error;
        }
        // Insert Prescriptions
        console.log('Inserting prescriptions...');
        await prisma.prescriptions.createMany({
            data: prescriptionsData.map((prescription) => ({
                ...prescription,
                date: new Date(prescription.date),
                expiryDate: new Date(prescription.expiryDate),
            })),
        });
        // Insert Expenses
        console.log('Inserting expenses...');
        await prisma.expenses.createMany({
            data: expensesData.map((expense) => ({
                ...expense,
                timestamp: new Date(expense.timestamp),
            })),
        });
        // Insert Sales Summary
        console.log('Inserting sales summary...');
        await prisma.salesSummary.createMany({
            data: salesSummaryData.map((summary) => ({
                ...summary,
                date: new Date(summary.date),
            })),
        });
        // Insert Purchase Summary
        console.log('Inserting purchase summary...');
        await prisma.purchaseSummary.createMany({
            data: purchaseSummaryData.map((summary) => ({
                ...summary,
                date: new Date(summary.date),
            })),
        });
        console.log('Database update completed successfully!');
    }
    catch (error) {
        console.error('Error updating database:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
updateDatabase()
    .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
