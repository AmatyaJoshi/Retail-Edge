DROP TABLE IF EXISTS "Users";
CREATE TABLE "Users" (
  "userId" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT
); 