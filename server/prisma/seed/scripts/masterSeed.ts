import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);
const prisma = new PrismaClient();

async function runSeedScript(scriptPath: string): Promise<void> {
  try {
    console.log(`Running ${scriptPath}...`);
    const { stdout, stderr } = await execPromise(`npx ts-node ${scriptPath}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`Completed ${scriptPath}`);
  } catch (error) {
    console.error(`Error running ${scriptPath}:`, error);
  }
}

async function masterSeed() {
  try {
    console.log('Starting database seeding process...');
    
    // Reset database tables (optional - comment out if you want to keep existing data)
    console.log('Clearing database tables...');
    await prisma.expenses.deleteMany({});
    console.log('Database tables cleared.');    // Define the order of seed scripts
    const seedScripts = [
      path.join(__dirname, 'seedExpenses.ts'),
      path.join(__dirname, 'seedExpenseTransactions.ts'),
      // Add other seed scripts here in the correct order
    ];
    
    // Run each seed script in sequence
    for (const script of seedScripts) {
      await runSeedScript(script);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error in master seed process:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the master seed function
masterSeed();
