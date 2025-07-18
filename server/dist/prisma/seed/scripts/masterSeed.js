"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
const prisma = new client_1.PrismaClient();
async function runSeedScript(scriptPath) {
    try {
        console.log(`Running ${scriptPath}...`);
        const { stdout, stderr } = await execPromise(`npx ts-node ${scriptPath}`);
        if (stdout)
            console.log(stdout);
        if (stderr)
            console.error(stderr);
        console.log(`Completed ${scriptPath}`);
    }
    catch (error) {
        console.error(`Error running ${scriptPath}:`, error);
    }
}
async function masterSeed() {
    try {
        console.log('Starting database seeding process...');
        // Reset database tables (optional - comment out if you want to keep existing data)
        console.log('Clearing database tables...');
        await prisma.expenses.deleteMany({});
        console.log('Database tables cleared.'); // Define the order of seed scripts
        const seedScripts = [
            path_1.default.join(__dirname, 'seedExpenses.ts'),
            path_1.default.join(__dirname, 'seedExpenseTransactions.ts'),
            // Add other seed scripts here in the correct order
        ];
        // Run each seed script in sequence
        for (const script of seedScripts) {
            await runSeedScript(script);
        }
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error in master seed process:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the master seed function
masterSeed();
