-- Create a temporary table with the desired column order
CREATE TABLE "User_temp" (
  "id" TEXT NOT NULL,
  "clerkId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "role" TEXT NOT NULL,
  "pan" TEXT,
  "aadhaar" TEXT,
  "phone" TEXT NOT NULL,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_temp_pkey" PRIMARY KEY ("id")
);

-- Copy data from the original table to the temporary table
INSERT INTO "User_temp" 
SELECT 
  "id",
  "clerkId",
  "email",
  "emailVerified",
  "firstName",
  "lastName",
  "role",
  "pan",
  "aadhaar",
  "phone",
  "address",
  "createdAt",
  "updatedAt"
FROM "User";

-- Drop the original table
DROP TABLE "User";

-- Rename the temporary table to the original name
ALTER TABLE "User_temp" RENAME TO "User";

-- Add unique constraints back
ALTER TABLE "User" ADD CONSTRAINT "User_clerkId_key" UNIQUE ("clerkId");
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
