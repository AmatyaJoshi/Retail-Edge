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

async function checkUser() {
  try {
    console.log('=== CHECKING USER IN SUPABASE ===');
    
    await supabasePrisma.$connect();
    console.log('✅ Connected to Supabase database');
    
    const clerkId = 'user_2zNMfWtXyZ0HgQJZkpp6TzS9884';
    
    // Check if user exists
    const user = await supabasePrisma.users.findUnique({
      where: { clerkId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        clerkId: true
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(user);
    } else {
      console.log('❌ User not found with clerkId:', clerkId);
      
      // Show all users in the database
      console.log('\n=== ALL USERS IN DATABASE ===');
      const allUsers = await supabasePrisma.users.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          clerkId: true
        },
        take: 10
      });
      
      console.log('Users in database:');
      allUsers.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Clerk ID: ${user.clerkId}`);
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await supabasePrisma.$disconnect();
  }
}

checkUser(); 