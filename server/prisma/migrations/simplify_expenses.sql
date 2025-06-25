-- Update the Expenses model to incorporate all needed fields from ExpenseByCategory
ALTER TABLE "Expenses" 
ADD COLUMN IF NOT EXISTS "remaining" Float DEFAULT 0;

-- Create a new view for ExpenseByCategory that will replace the table
CREATE OR REPLACE VIEW "ExpenseByCategory" AS
SELECT
  "expenseId" as "expenseByCategoryId",
  "category",
  "amount",
  "timestamp" as "date",
  CAST(("amount" / (SELECT SUM("amount") FROM "Expenses" WHERE DATE_TRUNC('month', "timestamp") = DATE_TRUNC('month', e."timestamp"))) * 100 AS FLOAT) as "percentage",
  "status",
  "budget" as "allocated",
  "remaining"
FROM "Expenses" e;

-- Create a new view for ExpenseSummary that will replace the table
CREATE OR REPLACE VIEW "ExpenseSummary" AS
SELECT
  gen_random_uuid() as "expenseSummaryId",
  DATE_TRUNC('month', "timestamp") as "date",
  SUM("amount") as "totalExpenses",
  NULL as "changePercentage"
FROM "Expenses"
GROUP BY DATE_TRUNC('month', "timestamp");

-- Drop the old tables that are no longer needed
-- DROP TABLE IF EXISTS "ExpenseByCategory";
-- DROP TABLE IF EXISTS "ExpenseSummary";
