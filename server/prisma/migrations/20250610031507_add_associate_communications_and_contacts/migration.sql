-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'MEETING', 'CALL', 'NOTE');

-- CreateTable
CREATE TABLE "BusinessPartnerContact" (
    "id" TEXT NOT NULL,
    "associateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPartnerCommunication" (
    "id" TEXT NOT NULL,
    "associateId" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPartnerCommunication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BusinessPartnerContact" ADD CONSTRAINT "BusinessPartnerContact_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPartnerCommunication" ADD CONSTRAINT "BusinessPartnerCommunication_associateId_fkey" FOREIGN KEY ("associateId") REFERENCES "BusinessPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
