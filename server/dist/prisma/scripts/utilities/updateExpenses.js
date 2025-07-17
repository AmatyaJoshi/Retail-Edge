"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
async function seedExpenses() {
    try {
        // Read expense data from JSON file
        const expensesFilePath = path_1.default.join(__dirname, 'seedData', 'expenses.json');
        const expensesData = JSON.parse(fs_1.default.readFileSync(expensesFilePath, 'utf8'));
        console.log(`Found ${expensesData.length} expenses to seed...`);
        // Delete existing expenses
        await prisma.expenses.deleteMany({});
        console.log('Deleted existing expenses');
        // Insert new expenses
        for (const expense of expensesData) {
            await prisma.expenses.create({
                data: {
                    expenseId: expense.expenseId,
                    category: expense.category,
                    amount: expense.amount,
                    timestamp: new Date(expense.timestamp),
                    description: expense.description || null,
                    vendor: expense.vendor || "Unknown Vendor",
                    status: expense.status || "pending",
                    dueDate: new Date(expense.dueDate || expense.timestamp),
                }
            });
        }
        console.log(`Successfully seeded ${expensesData.length} expenses.`);
    }
    catch (error) {
        console.error('Error seeding expenses:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedExpenses();
