/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Products_sku_key" ON "Products"("sku");
