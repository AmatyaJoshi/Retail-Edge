import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedExpenseSummary() {
  try {
    // Read expense summary data from JSON file
    const expenseSummaryFilePath = path.join(__dirname, 'seedData', 'expenseSummary.json');
    const expenseSummaryData = JSON.parse(fs.readFileSync(expenseSummaryFilePath, 'utf8'));

    console.log(`Found ${expenseSummaryData.length} expense summaries to seed...`);

    // Delete existing expense summaries
    await prisma.expenseSummary.deleteMany({});
    console.log('Deleted existing expense summaries');

    // Insert new expense summaries
    const createdExpenseSummaries = [];
    for (const summary of expenseSummaryData) {
      try {
        await prisma.expenseSummary.create({
          data: {
            expenseSummaryId: summary.expenseSummaryId,
            totalExpenses: summary.totalExpenses,
            date: new Date(summary.date),
            changePercentage: summary.changePercentage
          }
        });
        createdExpenseSummaries.push(summary.expenseSummaryId);
      } catch (error) {
        console.error(`Error inserting expense summary ${summary.expenseSummaryId}:`, error);
      }
    }

    console.log(`Successfully seeded ${createdExpenseSummaries.length} expense summaries.`);
  } catch (error) {
    console.error('Error seeding expense summaries:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedExpenseSummary();
