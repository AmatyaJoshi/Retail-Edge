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
        console.log('Deleted existing expenses'); // Insert new expenses
        const createdExpenses = [];
        for (const expense of expensesData) {
            try {
                // Use raw SQL to insert expense with all fields including vendor and dueDate
                await prisma.$executeRaw `
          INSERT INTO "Expenses" ("expenseId", "category", "amount", "timestamp", "description", "budget", "status", "vendor", "dueDate")
          VALUES (
            ${expense.expenseId}, 
            ${expense.category}, 
            ${expense.amount}, 
            ${new Date(expense.timestamp)}, 
            ${expense.description || null}, 
            ${expense.budget || expense.amount * 1.2}, 
            ${expense.status || "approved"},
            ${expense.vendor || null},
            ${expense.dueDate ? new Date(expense.dueDate) : null}
          )
        `;
                createdExpenses.push(expense.expenseId);
            }
            catch (error) {
                console.error(`Error inserting expense ${expense.expenseId}:`, error);
            }
        }
        console.log(`Successfully seeded ${createdExpenses.length} expenses.`);
    }
    catch (error) {
        console.error('Error seeding expenses:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the seed function
seedExpenses();
// Run the seed function
seedExpenses();
