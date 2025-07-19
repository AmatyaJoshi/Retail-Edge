import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL
    }
  }
});

async function createMissingUser() {
  try {
    console.log('=== CREATING MISSING USER ===');
    
    await supabasePrisma.$connect();
    console.log('✅ Connected to Supabase database');
    
    const clerkId = 'user_2zNMfWtXyZ0HgQJZkpp6TzS9884';
    
    // Check if user already exists
    const existingUser = await supabasePrisma.users.findUnique({
      where: { clerkId }
    });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser);
      return;
    }
    
    // Create the missing user
    const newUser = await supabasePrisma.users.create({
      data: {
        clerkId: clerkId,
        appwriteId: `appwrite_${clerkId}`, // Generate a unique appwriteId
        firstName: 'User',
        lastName: 'Account',
        email: `user_${Date.now()}@example.com`, // Generate unique email
        role: 'USER',
        phone: '',
        address: '',
        photoUrl: ''
      }
    });
    
    console.log('✅ Created new user:');
    console.log(newUser);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await supabasePrisma.$disconnect();
  }
}

createMissingUser(); 