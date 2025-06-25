-- First, drop any views that depend on the tables we're modifying
DROP VIEW IF EXISTS "ExpenseByCategoryView" CASCADE;

-- Then drop any related tables in the correct order
DROP TABLE IF EXISTS "BudgetAllocations" CASCADE;
DROP TABLE IF EXISTS "Budgets" CASCADE;
DROP TABLE IF EXISTS "ExpenseTransactions" CASCADE;
DROP TABLE IF EXISTS "Expenses" CASCADE;
DROP TABLE IF EXISTS "ExpenseCategories" CASCADE;

-- Now we can create the tables with the correct schema
CREATE TABLE "ExpenseCategories" (
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "color" TEXT,
  "icon" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExpenseCategories_pkey" PRIMARY KEY ("categoryId")
);

CREATE TABLE "Expenses" (
  "expenseId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "vendor" TEXT DEFAULT 'Unknown Vendor',
  "dueDate" TIMESTAMP(3),
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lastPaymentDate" TIMESTAMP(3),
  "transactionType" TEXT NOT NULL DEFAULT 'ON_DEMAND',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Expenses_pkey" PRIMARY KEY ("expenseId"),
  CONSTRAINT "Expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Budgets" (
  "budgetId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "period" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "fiscalYear" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Budgets_pkey" PRIMARY KEY ("budgetId")
);

CREATE TABLE "BudgetAllocations" (
  "allocationId" TEXT NOT NULL,
  "budgetId" TEXT NOT NULL,
  "expenseId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "allocatedAt" TIMESTAMP(3) NOT NULL,
  "directPayment" BOOLEAN NOT NULL DEFAULT false,
  "paymentMethod" TEXT,
  "paymentReference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BudgetAllocations_pkey" PRIMARY KEY ("allocationId"),
  CONSTRAINT "BudgetAllocations_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budgets"("budgetId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "BudgetAllocations_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("expenseId") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ExpenseTransactions" (
  "id" TEXT NOT NULL,
  "expenseId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'EXPENSE',
  "amount" DOUBLE PRECISION NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "reference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "date" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExpenseTransactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ExpenseTransactions_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("expenseId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Recreate the view with the new schema
CREATE OR REPLACE VIEW "ExpenseByCategoryView" AS
SELECT 
  ec."name" as "category",
  DATE_TRUNC('month', e."timestamp") AS "month",
  EXTRACT(YEAR FROM e."timestamp") AS "year",
  SUM(e."amount") AS "amount",
  COUNT(*) AS "count",
  SUM(e."amount") * 100.0 / SUM(SUM(e."amount")) OVER (PARTITION BY DATE_TRUNC('month', e."timestamp")) AS "percentage"
FROM "Expenses" e
JOIN "ExpenseCategories" ec ON e."categoryId" = ec."categoryId"
GROUP BY ec."name", DATE_TRUNC('month', e."timestamp"), EXTRACT(YEAR FROM e."timestamp")
ORDER BY "year" DESC, "month" DESC, "amount" DESC;
