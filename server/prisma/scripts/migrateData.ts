import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create two Prisma clients
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL  // This should be your local database
    }
  }
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL  // This should be your Supabase database
    }
  }
});

async function migrateData() {
  try {
    console.log('Starting data migration...');
    console.log('Source DB (should be local):', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
    console.log('Target DB (should be Supabase):', process.env.SUPABASE_DATABASE_URL?.split('@')[1]?.split('/')[0]);

    // Test connections
    await sourcePrisma.$connect();
    await targetPrisma.$connect();
    console.log('✅ Both databases connected');

    // Test data counts
    const sourceUserCount = await sourcePrisma.users.count();
    const sourceProductCount = await sourcePrisma.products.count();
    console.log(`Source database has: ${sourceUserCount} users, ${sourceProductCount} products`);

    // Migrate tables individually to avoid TypeScript errors
    
    // 1. Users
    console.log('Migrating users...');
    const users = await sourcePrisma.users.findMany();
    if (users.length > 0) {
      await targetPrisma.users.createMany({
        data: users,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${users.length} users`);
    }

    // 2. Customers
    console.log('Migrating customers...');
    const customers = await sourcePrisma.customers.findMany();
    if (customers.length > 0) {
      await targetPrisma.customers.createMany({
        data: customers,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${customers.length} customers`);
    }

    // 3. Products
    console.log('Migrating products...');
    const products = await sourcePrisma.products.findMany();
    if (products.length > 0) {
      await targetPrisma.products.createMany({
        data: products,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${products.length} products`);
    }

    // 4. Associates
    console.log('Migrating associates...');
    const associates = await sourcePrisma.associates.findMany();
    if (associates.length > 0) {
      await targetPrisma.associates.createMany({
        data: associates,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${associates.length} associates`);
    }

    // 5. ExpenseCategories
    console.log('Migrating expenseCategories...');
    const expenseCategories = await sourcePrisma.expenseCategories.findMany();
    if (expenseCategories.length > 0) {
      await targetPrisma.expenseCategories.createMany({
        data: expenseCategories,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${expenseCategories.length} expenseCategories`);
    }

    // 6. Expenses
    console.log('Migrating expenses...');
    const expenses = await sourcePrisma.expenses.findMany();
    if (expenses.length > 0) {
      await targetPrisma.expenses.createMany({
        data: expenses,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${expenses.length} expenses`);
    }

    // 7. Sales
    console.log('Migrating sales...');
    const sales = await sourcePrisma.sales.findMany();
    if (sales.length > 0) {
      await targetPrisma.sales.createMany({
        data: sales,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${sales.length} sales`);
    }

    // 8. Purchases
    console.log('Migrating purchases...');
    const purchases = await sourcePrisma.purchases.findMany();
    if (purchases.length > 0) {
      await targetPrisma.purchases.createMany({
        data: purchases,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${purchases.length} purchases`);
    }

    // 9. Prescriptions - Handle JSON fields properly
    console.log('Migrating prescriptions...');
    const prescriptions = await sourcePrisma.prescriptions.findMany();
    if (prescriptions.length > 0) {
      try {
        await targetPrisma.prescriptions.createMany({
          data: prescriptions.map(prescription => ({
            id: prescription.id,
            customerId: prescription.customerId,
            date: prescription.date,
            expiryDate: prescription.expiryDate,
            rightEye: prescription.rightEye as any,
            leftEye: prescription.leftEye as any,
            doctor: prescription.doctor,
            notes: prescription.notes
          })),
          skipDuplicates: true
        });
        console.log(`✅ Migrated ${prescriptions.length} prescriptions`);
      } catch (error: any) {
        console.log(`⚠️ Prescriptions migration had issues (likely duplicates): ${error.message}`);
      }
    }

    // 10. AssociateTransactions
    console.log('Migrating associateTransactions...');
    const associateTransactions = await sourcePrisma.associateTransactions.findMany();
    if (associateTransactions.length > 0) {
      await targetPrisma.associateTransactions.createMany({
        data: associateTransactions,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${associateTransactions.length} associateTransactions`);
    }

    // 11. AssociateContact
    console.log('Migrating associateContact...');
    const associateContact = await sourcePrisma.associateContact.findMany();
    if (associateContact.length > 0) {
      await targetPrisma.associateContact.createMany({
        data: associateContact,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${associateContact.length} associateContact`);
    }

    // 12. AssociateCommunication
    console.log('Migrating associateCommunication...');
    const associateCommunication = await sourcePrisma.associateCommunication.findMany();
    if (associateCommunication.length > 0) {
      await targetPrisma.associateCommunication.createMany({
        data: associateCommunication,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${associateCommunication.length} associateCommunication`);
    }

    // 13. Contract
    console.log('Migrating contract...');
    const contract = await sourcePrisma.contract.findMany();
    if (contract.length > 0) {
      await targetPrisma.contract.createMany({
        data: contract,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${contract.length} contract`);
    }

    // 14. Document
    console.log('Migrating document...');
    const document = await sourcePrisma.document.findMany();
    if (document.length > 0) {
      await targetPrisma.document.createMany({
        data: document,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${document.length} document`);
    }

    // 15. PurchaseOrder
    console.log('Migrating purchaseOrder...');
    const purchaseOrder = await sourcePrisma.purchaseOrder.findMany();
    if (purchaseOrder.length > 0) {
      await targetPrisma.purchaseOrder.createMany({
        data: purchaseOrder,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${purchaseOrder.length} purchaseOrder`);
    }

    // 16. ExpenseTransactions
    console.log('Migrating expenseTransactions...');
    const expenseTransactions = await sourcePrisma.expenseTransactions.findMany();
    if (expenseTransactions.length > 0) {
      await targetPrisma.expenseTransactions.createMany({
        data: expenseTransactions,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${expenseTransactions.length} expenseTransactions`);
    }

    // 17. Budgets
    console.log('Migrating budgets...');
    const budgets = await sourcePrisma.budgets.findMany();
    if (budgets.length > 0) {
      await targetPrisma.budgets.createMany({
        data: budgets,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${budgets.length} budgets`);
    }

    // 18. BudgetAllocations
    console.log('Migrating budgetAllocations...');
    const budgetAllocations = await sourcePrisma.budgetAllocations.findMany();
    if (budgetAllocations.length > 0) {
      await targetPrisma.budgetAllocations.createMany({
        data: budgetAllocations,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${budgetAllocations.length} budgetAllocations`);
    }

    // 19. SalesSummary
    console.log('Migrating salesSummary...');
    const salesSummary = await sourcePrisma.salesSummary.findMany();
    if (salesSummary.length > 0) {
      await targetPrisma.salesSummary.createMany({
        data: salesSummary,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${salesSummary.length} salesSummary`);
    }

    // 20. PurchaseSummary
    console.log('Migrating purchaseSummary...');
    const purchaseSummary = await sourcePrisma.purchaseSummary.findMany();
    if (purchaseSummary.length > 0) {
      await targetPrisma.purchaseSummary.createMany({
        data: purchaseSummary,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${purchaseSummary.length} purchaseSummary`);
    }

    // 21. Stores
    console.log('Migrating stores...');
    const stores = await sourcePrisma.stores.findMany();
    if (stores.length > 0) {
      await targetPrisma.stores.createMany({
        data: stores,
        skipDuplicates: true
      });
      console.log(`✅ Migrated ${stores.length} stores`);
    }

    console.log('🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

migrateData();