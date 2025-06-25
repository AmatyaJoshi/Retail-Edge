import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedExpenseByCategory() {
  try {
    // Read expense by category data from JSON file
    const expenseByCategoryFilePath = path.join(__dirname, 'seedData', 'expenseByCategory.json');
    const expenseByCategoryData = JSON.parse(fs.readFileSync(expenseByCategoryFilePath, 'utf8'));

    console.log(`Found ${expenseByCategoryData.length} expense categories to seed...`);

    // Delete existing expense categories
    await prisma.expenseByCategory.deleteMany({});
    console.log('Deleted existing expense categories');

    // Insert new expense categories
    const createdCategories = [];
    for (const category of expenseByCategoryData) {
      try {
        await prisma.expenseByCategory.create({
          data: {
            expenseByCategoryId: category.expenseByCategoryId,
            expenseSummaryId: category.expenseSummaryId,
            category: category.category,
            amount: BigInt(category.amount),
            date: new Date(category.date),
            percentage: category.percentage,
            status: category.status || 'approved',
            allocated: category.allocated || 0,
            remaining: category.remaining || 0
          }
        });
        createdCategories.push(category.expenseByCategoryId);
      } catch (error) {
        console.error(`Error inserting expense category ${category.expenseByCategoryId}:`, error);
      }
    }

    console.log(`Successfully seeded ${createdCategories.length} expense categories.`);
  } catch (error) {
    console.error('Error seeding expense categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedExpenseByCategory();
