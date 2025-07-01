-- Reset and update only the User table
-- This script ensures the User table has the appwriteId field and sample users

-- First clear the User table
TRUNCATE TABLE "User" CASCADE;

-- Insert sample users with appwriteId
INSERT INTO "User" ("id", "email", "firstName", "lastName", "role", "pan", "aadhaar", "phone", "address", "createdAt", "updatedAt", "emailVerified", "clerkId") 
VALUES 
  ('admin001', 'admin@example.com', 'Admin', 'User', 'ADMIN', 'ABCDE1234F', '123412341234', '9999999999', '123 Admin Street', NOW(), NOW(), true, 'appwrite_001'),
  ('user001', 'user@example.com', 'Regular', 'User', 'USER', 'FGHIJ5678K', '567856785678', '8888888888', '456 User Avenue', NOW(), NOW(), true, 'appwrite_002');
