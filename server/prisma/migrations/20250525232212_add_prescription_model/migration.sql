/*
  Warnings:

  - You are about to drop the `Prescription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_customerId_fkey";

-- DropTable
DROP TABLE "Prescription";

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "rightEye" JSONB NOT NULL,
    "leftEye" JSONB NOT NULL,
    "doctor" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_customerId_key" ON "prescriptions"("customerId");

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
