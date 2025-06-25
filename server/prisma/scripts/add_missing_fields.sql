-- Add missing fields to ExpenseTransactions table
ALTER TABLE "ExpenseTransactions"
ADD COLUMN IF NOT EXISTS "transactionType" TEXT NOT NULL DEFAULT 'ON_DEMAND',
ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
