-- Clear existing users
DELETE FROM "User";

-- Insert sample users with the new column order
INSERT INTO "User" ("id", "clerkId", "email", "emailVerified", "firstName", "lastName", "role", "pan", "aadhaar", "phone", "address", "createdAt", "updatedAt") 
VALUES 
  ('admin001', 'appwrite_001', 'admin@example.com', true, 'Admin', 'User', 'ADMIN', 'ABCDE1234F', '123412341234', '9999999999', '123 Admin Street', NOW(), NOW()),
  ('user001', 'appwrite_002', 'user@example.com', true, 'Regular', 'User', 'USER', 'FGHIJ5678K', '567856785678', '8888888888', '456 User Avenue', NOW(), NOW());
