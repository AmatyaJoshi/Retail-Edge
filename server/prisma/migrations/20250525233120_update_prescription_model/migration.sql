/*
  Warnings:

  - You are about to drop the column `customerId` on the `prescriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `prescriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_customerId_fkey";

-- DropIndex
DROP INDEX "prescriptions_customerId_key";

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "customerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_userId_key" ON "prescriptions"("userId");

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
