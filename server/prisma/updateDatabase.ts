import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function updateDatabase() {
  try {
    // Read seed data files
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'users.json'), 'utf-8'));
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'products.json'), 'utf-8'));
    const salesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'sales.json'), 'utf-8'));
    const prescriptionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'prescriptions.json'), 'utf-8'));
    const expensesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'expenses.json'), 'utf-8'));
    const expenseSummaryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'expenseSummary.json'), 'utf-8'));
    const expenseByCategoryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'expenseByCategory.json'), 'utf-8'));
    const salesSummaryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'salesSummary.json'), 'utf-8'));
    const purchaseSummaryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData', 'purchaseSummary.json'), 'utf-8'));

    console.log('Starting database update...');

    // Delete existing data in reverse order of dependencies
    console.log('Deleting existing data...');
    await prisma.expenseByCategory.deleteMany();
    await prisma.expenseSummary.deleteMany();
    await prisma.expenses.deleteMany();
    await prisma.salesSummary.deleteMany();
    await prisma.purchaseSummary.deleteMany();
    await prisma.sales.deleteMany();
    await prisma.purchases.deleteMany();
    await prisma.prescriptions.deleteMany();
    await prisma.products.deleteMany();
    await prisma.customers.deleteMany();

    // Insert new data in order of dependencies
    console.log('Inserting new data...');

    // Insert Users first
    console.log('Inserting users...');
    try {
      await prisma.customers.createMany({
        data: usersData,
      });
      console.log(`Successfully inserted ${usersData.length} users`);
    } catch (error) {
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
    } catch (error) {
      console.error('Error inserting products:', error);
      throw error;
    }

    // Insert Sales
    console.log('Inserting sales...');
    try {
      await prisma.sales.createMany({
        data: salesData.map((sale: any) => ({
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
    } catch (error) {
      console.error('Error inserting sales:', error);
      throw error;
    }

    // Insert Prescriptions
    console.log('Inserting prescriptions...');
    await prisma.prescriptions.createMany({
      data: prescriptionsData.map((prescription: any) => ({
        ...prescription,
        date: new Date(prescription.date),
        expiryDate: new Date(prescription.expiryDate),
      })),
    });

    // Insert Expenses
    console.log('Inserting expenses...');
    await prisma.expenses.createMany({
      data: expensesData.map((expense: any) => ({
        ...expense,
        timestamp: new Date(expense.timestamp),
      })),
    });

    // Insert Expense Summary
    console.log('Inserting expense summary...');
    for (const summary of expenseSummaryData) {
      await prisma.expenseSummary.create({
        data: {
          expenseSummaryId: summary.expenseSummaryId,
          totalExpenses: summary.totalExpenses,
          date: new Date(summary.date),
        },
      });
    }

    // Insert Expense By Category
    console.log('Inserting expense by category...');
    for (const category of expenseByCategoryData) {
      await prisma.expenseByCategory.create({
        data: {
          expenseByCategoryId: category.expenseByCategoryId,
          expenseSummaryId: category.expenseSummaryId,
          category: category.category,
          amount: BigInt(category.amount),
          date: new Date(), // Use current date since it's not in the seed data
        },
      });
    }

    // Insert Sales Summary
    console.log('Inserting sales summary...');
    await prisma.salesSummary.createMany({
      data: salesSummaryData.map((summary: any) => ({
        ...summary,
        date: new Date(summary.date),
      })),
    });

    // Insert Purchase Summary
    console.log('Inserting purchase summary...');
    await prisma.purchaseSummary.createMany({
      data: purchaseSummaryData.map((summary: any) => ({
        ...summary,
        date: new Date(summary.date),
      })),
    });

    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabase()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 