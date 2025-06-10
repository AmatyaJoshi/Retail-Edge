-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CARD',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'COMPLETED';

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
