-- ExpensePayment table creation
CREATE TABLE IF NOT EXISTS "ExpensePayment" (
  "paymentId" TEXT NOT NULL,
  "expenseId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "ExpensePayment_pkey" PRIMARY KEY ("paymentId"),
  CONSTRAINT "ExpensePayment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expenses"("expenseId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add new columns to Expenses table
ALTER TABLE "Expenses" 
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3);
