-- Reset database and reseed data
-- This script will reset all tables and insert sample data

-- First, drop and recreate all tables to ensure a clean slate
DO $$ 
DECLARE
    tables CURSOR FOR
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT IN ('_prisma_migrations');
BEGIN
    FOR t IN tables LOOP
        EXECUTE 'TRUNCATE TABLE "' || t.tablename || '" CASCADE;';
    END LOOP;
END $$;

-- Insert sample users with clerkId
INSERT INTO "User" ("id", "email", "firstName", "lastName", "role", "pan", "aadhaar", "phone", "address", "createdAt", "updatedAt", "emailVerified", "clerkId") 
VALUES 
  ('admin001', 'admin@example.com', 'Admin', 'User', 'ADMIN', 'ABCDE1234F', '123412341234', '9999999999', '123 Admin Street', NOW(), NOW(), true, 'clerk_001'),
  ('user001', 'user@example.com', 'Regular', 'User', 'USER', 'FGHIJ5678K', '567856785678', '8888888888', '456 User Avenue', NOW(), NOW(), true, 'clerk_002');
