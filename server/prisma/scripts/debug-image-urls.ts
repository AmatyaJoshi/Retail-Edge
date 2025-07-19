import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL
    }
  }
});

async function debugImageUrls() {
  try {
    console.log('=== DEBUGGING IMAGE URLS ===');
    
    // Test local database
    console.log('\n--- LOCAL DATABASE ---');
    await localPrisma.$connect();
    
    const localProducts = await localPrisma.products.findMany({
      select: {
        productId: true,
        name: true,
        imageUrl: true
      },
      take: 5
    });
    
    console.log('Local products with imageUrl:');
    localProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.imageUrl || 'NULL'}`);
    });
    
    // Test Supabase database
    console.log('\n--- SUPABASE DATABASE ---');
    await supabasePrisma.$connect();
    
    const supabaseProducts = await supabasePrisma.products.findMany({
      select: {
        productId: true,
        name: true,
        imageUrl: true
      },
      take: 5
    });
    
    console.log('Supabase products with imageUrl:');
    supabaseProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.imageUrl || 'NULL'}`);
    });
    
    // Test raw SQL query
    console.log('\n--- RAW SQL TEST ---');
    const rawResult = await supabasePrisma.$queryRaw`
      SELECT "productId", name, "imageUrl" 
      FROM "Products" 
      LIMIT 3
    `;
    console.log('Raw SQL result:', rawResult);
    
    // Test updating a single product
    console.log('\n--- TEST UPDATE ---');
    const testProduct = localProducts[0];
    if (testProduct && testProduct.imageUrl) {
      console.log(`Testing update for: ${testProduct.name}`);
      console.log(`Image URL to set: ${testProduct.imageUrl}`);
      
      const updateResult = await supabasePrisma.products.update({
        where: { productId: testProduct.productId },
        data: { imageUrl: testProduct.imageUrl }
      });
      
      console.log('Update result:', updateResult);
      
      // Verify the update
      const verifyResult = await supabasePrisma.products.findUnique({
        where: { productId: testProduct.productId },
        select: { name: true, imageUrl: true }
      });
      
      console.log('Verification result:', verifyResult);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

debugImageUrls(); 