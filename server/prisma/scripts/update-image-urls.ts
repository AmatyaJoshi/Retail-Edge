import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

// Create two Prisma clients
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL  // Your local database
    }
  }
});

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SUPABASE_DATABASE_URL  // Your Supabase database
    }
  }
});

async function updateImageUrls() {
  try {
    console.log('Starting image URL update...');
    console.log('Source DB (local):', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
    console.log('Target DB (Supabase):', process.env.SUPABASE_DATABASE_URL?.split('@')[1]?.split('/')[0]);

    // Test connections
    await localPrisma.$connect();
    await supabasePrisma.$connect();
    console.log('✅ Both databases connected');

    // Get products from local database with image URLs
    const localProducts = await localPrisma.products.findMany({
      select: {
        productId: true,
        name: true,
        imageUrl: true
      }
    });

    console.log(`Found ${localProducts.length} products in local database`);

    // Update each product in Supabase with the image URL from local
    let updatedCount = 0;
    let skippedCount = 0;

    for (const localProduct of localProducts) {
      if (localProduct.imageUrl) {
        try {
          await supabasePrisma.products.update({
            where: { productId: localProduct.productId },
            data: { imageUrl: localProduct.imageUrl }
          });
          console.log(`✅ Updated ${localProduct.name} with image URL`);
          updatedCount++;
        } catch (error: any) {
          console.log(`⚠️ Could not update ${localProduct.name}: ${error.message}`);
        }
      } else {
        console.log(`ℹ️ Skipped ${localProduct.name} (no image URL in local DB)`);
        skippedCount++;
      }
    }

    console.log('\n🎉 Image URL update completed!');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`ℹ️ Skipped: ${skippedCount} products (no image URL)`);

  } catch (error: any) {
    console.error('❌ Error updating image URLs:', error.message);
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

updateImageUrls(); 