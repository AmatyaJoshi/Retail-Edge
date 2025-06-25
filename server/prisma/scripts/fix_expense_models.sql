-- Drop the ExpenseByCategoryView
DROP VIEW IF EXISTS "ExpenseByCategoryView" CASCADE;

-- Then add the map directives for our models
ALTER TABLE "ExpenseCategories" ADD CONSTRAINT fk_expenses_category 
FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategories"("categoryId");

-- Recreate the view if needed with the new schema
CREATE OR REPLACE VIEW "ExpenseByCategoryView" AS
SELECT 
  ec."name" as "category",
  DATE_TRUNC('month', e."timestamp") AS "month",
  EXTRACT(YEAR FROM e."timestamp") AS "year",
  SUM(e."amount") AS "amount",
  COUNT(*) AS "count",
  SUM(e."amount") * 100.0 / SUM(SUM(e."amount")) OVER (PARTITION BY DATE_TRUNC('month', e."timestamp")) AS "percentage"
FROM "Expenses" e
JOIN "ExpenseCategories" ec ON e."categoryId" = ec."categoryId"
GROUP BY ec."name", DATE_TRUNC('month', e."timestamp"), EXTRACT(YEAR FROM e."timestamp")
ORDER BY "year" DESC, "month" DESC, "amount" DESC;
