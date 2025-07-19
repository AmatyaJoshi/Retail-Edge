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

async function testApiConnection() {
  try {
    console.log('=== TESTING API CONNECTION ===');
    
    await supabasePrisma.$connect();
    console.log('✅ Connected to Supabase database');
    
    // Test 1: Check products
    console.log('\n📦 Testing Products API...');
    const products = await supabasePrisma.products.findMany({
      select: {
        productId: true,
        name: true,
        price: true,
        stockQuantity: true,
        imageUrl: true
      },
      take: 5
    });
    
    console.log(`✅ Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ${product.name}: ₹${product.price} (Stock: ${product.stockQuantity})`);
      console.log(`  Image: ${product.imageUrl ? '✅ Has image' : '❌ No image'}`);
    });
    
    // Test 2: Check users
    console.log('\n👥 Testing Users API...');
    const users = await supabasePrisma.users.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        clerkId: true
      },
      take: 5
    });
    
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
      console.log(`  Clerk ID: ${user.clerkId}`);
    });
    
    // Test 3: Check specific user that was causing issues
    console.log('\n🔍 Testing specific user...');
    const specificUser = await supabasePrisma.users.findUnique({
      where: { clerkId: 'user_2zNMfWtXyZ0HgQJZkpp6TzS9884' }
    });
    
    if (specificUser) {
      console.log('✅ Specific user found:');
      console.log(`- ${specificUser.firstName} ${specificUser.lastName} (${specificUser.email})`);
      console.log(`- Role: ${specificUser.role}`);
      console.log(`- Clerk ID: ${specificUser.clerkId}`);
    } else {
      console.log('❌ Specific user not found!');
    }
    
    // Test 4: Check customers
    console.log('\n👤 Testing Customers API...');
    const customers = await supabasePrisma.customers.findMany({
      select: {
        customerId: true,
        name: true,
        email: true,
        phone: true
      },
      take: 3
    });
    
    console.log(`✅ Found ${customers.length} customers:`);
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email}) - ${customer.phone}`);
    });
    
    console.log('\n🎉 All API tests completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await supabasePrisma.$disconnect();
  }
}

testApiConnection(); 