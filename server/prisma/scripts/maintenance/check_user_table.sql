-- Query to check the User table structure and data
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;

-- Check the user data
SELECT * FROM "User";
