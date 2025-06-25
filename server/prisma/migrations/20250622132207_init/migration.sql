/*
  Warnings:

  - The primary key for the `ExpenseTransactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ExpenseTransactions` table. All the data in the column will be lost.
  - You are about to drop the `ExpenseByCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpenseSummary` table. If the table is not empty, all the data it contains will be lost.
  - The required column `expenseTransactionId` was added to the `ExpenseTransactions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey";

-- AlterTable
ALTER TABLE "ExpenseTransactions" DROP CONSTRAINT "ExpenseTransactions_pkey",
DROP COLUMN "id",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "expenseTransactionId" TEXT NOT NULL,
ADD COLUMN     "transactionType" TEXT,
ADD CONSTRAINT "ExpenseTransactions_pkey" PRIMARY KEY ("expenseTransactionId");

-- DropTable
DROP TABLE "ExpenseByCategory";

-- DropTable
DROP TABLE "ExpenseSummary";
