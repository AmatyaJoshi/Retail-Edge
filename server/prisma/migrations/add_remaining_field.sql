-- Add remaining field to Expenses table
ALTER TABLE "Expenses" 
ADD COLUMN IF NOT EXISTS "remaining" Float DEFAULT 0;

-- Create a function to calculate the remaining amount
CREATE OR REPLACE FUNCTION calculate_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW."remaining" := NEW."budget" - NEW."amount";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set the remaining field
CREATE OR REPLACE TRIGGER set_remaining
BEFORE INSERT OR UPDATE ON "Expenses"
FOR EACH ROW
EXECUTE FUNCTION calculate_remaining();

-- Update existing records
UPDATE "Expenses" 
SET "remaining" = "budget" - "amount"
WHERE "remaining" IS NULL OR "remaining" = 0;
