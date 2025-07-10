/**
 * Script to add "+" prefix to phone numbers in the User table for Appwrite compatibility
 * Run with: npx ts-node formatPhoneNumbers.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

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
      } else {
        console.log(`User ${user.id}: No phone number to format`);
      }
    }
    
    console.log(`Phone number formatting complete. Updated ${updatedCount} users.`);
  } catch (error) {
    console.error('Error formatting phone numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
formatPhoneNumbers()
  .then(() => console.log('Phone number formatting script completed'))
  .catch(error => console.error('Script error:', error));
