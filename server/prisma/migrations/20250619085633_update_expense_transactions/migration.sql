/*
  Warnings:

  - You are about to drop the column `category` on the `ExpenseTransactions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ExpenseTransactions` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `ExpenseTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `ExpenseTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ExpenseTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ExpenseTransactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExpenseTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExpenseTransactions" DROP COLUMN "category",
DROP COLUMN "description",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
