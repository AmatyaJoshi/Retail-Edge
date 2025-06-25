/*
  Warnings:

  - The primary key for the `ExpensePayments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `ExpensePayments` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ExpensePayments` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `ExpensePayments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ExpensePayments` table. All the data in the column will be lost.
  - Added the required column `paymentDate` to the `ExpensePayments` table without a default value. This is not possible if the table is not empty.
  - The required column `paymentId` was added to the `ExpensePayments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `paymentMethod` to the `ExpensePayments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `ExpensePayments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExpensePayments" DROP CONSTRAINT "ExpensePayments_pkey",
DROP COLUMN "date",
DROP COLUMN "id",
DROP COLUMN "method",
DROP COLUMN "status",
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD CONSTRAINT "ExpensePayments_pkey" PRIMARY KEY ("paymentId");
