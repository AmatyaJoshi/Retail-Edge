-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "rightEye" JSONB NOT NULL,
    "leftEye" JSONB NOT NULL,
    "doctor" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_customerId_key" ON "Prescription"("customerId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
