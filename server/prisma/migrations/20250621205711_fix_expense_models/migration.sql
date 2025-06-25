/*
  Warnings:

  - You are about to drop the column `allocated` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `approvalDate` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `auditLog` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `costCenter` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalPeriod` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `remaining` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Expenses` table. All the data in the column will be lost.
  - You are about to drop the `ExpensePayments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExpensePayments" DROP CONSTRAINT "ExpensePayments_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "ExpenseTransactions" DROP CONSTRAINT "ExpenseTransactions_expenseId_fkey";

-- AlterTable
ALTER TABLE "ExpenseTransactions" ALTER COLUMN "reference" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'COMPLETED',
ALTER COLUMN "type" SET DEFAULT 'EXPENSE';

-- AlterTable
ALTER TABLE "Expenses" DROP COLUMN "allocated",
DROP COLUMN "approvalDate",
DROP COLUMN "approvedBy",
DROP COLUMN "auditLog",
DROP COLUMN "budget",
DROP COLUMN "category",
DROP COLUMN "costCenter",
DROP COLUMN "fiscalPeriod",
DROP COLUMN "metadata",
DROP COLUMN "percentage",
DROP COLUMN "remaining",
DROP COLUMN "tags",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "transactionType" TEXT NOT NULL DEFAULT 'ON_DEMAND',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "ExpensePayments";

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

    CONSTRAINT "BudgetAllocations_pkey" PRIMARY KEY ("allocationId")
);

-- CreateTable
CREATE TABLE "ExpenseSummary" (
    "expenseSummaryId" TEXT NOT NULL,
    "totalExpenses" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "changePercentage" DOUBLE PRECISION,

    CONSTRAINT "ExpenseSummary_pkey" PRIMARY KEY ("expenseSummaryId")
);

-- CreateTable
CREATE TABLE "ExpenseByCategory" (
    "expenseByCategoryId" TEXT NOT NULL,
    "expenseSummaryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "percentage" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "allocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ExpenseByCategory_pkey" PRIMARY KEY ("expenseByCategoryId")
);

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategories"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocations" ADD CONSTRAINT "BudgetAllocations_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budgets"("budgetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocations" ADD CONSTRAINT "BudgetAllocations_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("expenseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseByCategory" ADD CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey" FOREIGN KEY ("expenseSummaryId") REFERENCES "ExpenseSummary"("expenseSummaryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseTransactions" ADD CONSTRAINT "ExpenseTransactions_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("expenseId") ON DELETE CASCADE ON UPDATE CASCADE;
