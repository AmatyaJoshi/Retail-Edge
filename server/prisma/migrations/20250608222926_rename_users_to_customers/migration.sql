/*
  Warnings:

  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prescriptions" DROP CONSTRAINT "Prescriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_customerId_fkey";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "customers" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- AddForeignKey
ALTER TABLE "Prescriptions" ADD CONSTRAINT "Prescriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customers"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
