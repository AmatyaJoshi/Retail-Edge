-- This is a Prisma migration file to update the database structure
-- for expenses to be more streamlined and efficient

/*
  Warnings:

  - You are about to drop the `ExpenseByCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseSummary` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `allocated` to the `Expenses` table without a default value.
  - Added the required column `remaining` to the `Expenses` table without a default value.
  - Added the required column `updatedAt` to the `Expenses` table without a default value.

*/

-- DropForeignKey
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey";

-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "allocated" FLOAT NOT NULL DEFAULT 0,
ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "auditLog" JSONB,
ADD COLUMN     "costCenter" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fiscalPeriod" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "percentage" FLOAT,
ADD COLUMN     "remaining" FLOAT NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ExpenseByCategory";

-- DropTable
DROP TABLE "ExpenseSummary";

-- CreateView for expense summaries
CREATE OR REPLACE VIEW "ExpenseSummaryView" AS
SELECT 
  DATE_TRUNC('month', "timestamp") AS "month",
  EXTRACT(YEAR FROM "timestamp") AS "year",
  SUM("amount") AS "totalExpenses",
  COUNT(*) AS "totalCount"
FROM "Expenses"
GROUP BY DATE_TRUNC('month', "timestamp"), EXTRACT(YEAR FROM "timestamp")
ORDER BY "year" DESC, "month" DESC;

-- CreateView for expenses by category
CREATE OR REPLACE VIEW "ExpenseByCategoryView" AS
SELECT 
  "category",
  DATE_TRUNC('month', "timestamp") AS "month",
  EXTRACT(YEAR FROM "timestamp") AS "year",
  SUM("amount") AS "amount",
  COUNT(*) AS "count",
  SUM("amount") * 100.0 / SUM(SUM("amount")) OVER (PARTITION BY DATE_TRUNC('month', "timestamp")) AS "percentage"
FROM "Expenses"
GROUP BY "category", DATE_TRUNC('month', "timestamp"), EXTRACT(YEAR FROM "timestamp")
ORDER BY "year" DESC, "month" DESC, "amount" DESC;
