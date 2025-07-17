"use strict";
/**
 * Script to add "+" prefix to phone numbers in the User table for Appwrite compatibility
 * Run with: npx ts-node formatPhoneNumbers.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const prisma = new client_1.PrismaClient();
async function formatPhoneNumbers() {
    try {
        console.log('Starting phone number formatting for Appwrite compatibility...');
        // Get all users
        const users = await prisma.users.findMany();
        console.log(`Found ${users.length} users to process`);
        let updatedCount = 0;
        // Process each user
        for (const user of users) {
            if (user.phone) {
                // Skip if already formatted with "+" prefix
                if (user.phone.startsWith('+')) {
                    console.log(`User ${user.id}: Phone number already formatted`);
                    continue;
                }
                // Add "+" prefix to phone number
                const formattedPhone = `+${user.phone}`;
                // Update user with formatted phone number
                await prisma.users.update({
                    where: { id: user.id },
                    data: { phone: formattedPhone }
                });
                console.log(`User ${user.id}: Updated phone number from ${user.phone} to ${formattedPhone}`);
                updatedCount++;
            }
            else {
                console.log(`User ${user.id}: No phone number to format`);
            }
        }
        console.log(`Phone number formatting complete. Updated ${updatedCount} users.`);
    }
    catch (error) {
        console.error('Error formatting phone numbers:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the function
formatPhoneNumbers()
    .then(() => console.log('Phone number formatting script completed'))
    .catch(error => console.error('Script error:', error));
