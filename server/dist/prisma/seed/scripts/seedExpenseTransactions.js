"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
async function seedExpenseTransactions() {
    try {
        // Load the expense transactions from the JSON file
        const expenseTransactionsData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, './seedData/expenseTransactions_v2.json'), 'utf8'));
        console.log(`Found ${expenseTransactionsData.length} expense transactions to seed.`);
        // Delete existing data
        await prisma.expenseTransactions.deleteMany({});
        console.log('Deleted existing expense transactions.');
        // Seed new data
        for (const transaction of expenseTransactionsData) {
            await prisma.expenseTransactions.create({
                data: {
                    expenseId: transaction.expenseId,
                    type: transaction.type,
                    amount: transaction.amount,
                    paymentMethod: transaction.paymentMethod,
                    reference: transaction.reference,
                    status: transaction.status,
                    date: new Date(transaction.date),
                    notes: transaction.notes,
                    createdAt: new Date(transaction.createdAt),
                    updatedAt: new Date(transaction.updatedAt)
                }
            });
        }
        console.log(`Successfully seeded ${expenseTransactionsData.length} expense transactions.`);
    }
    catch (error) {
        console.error('Error seeding expense transactions:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedExpenseTransactions();
