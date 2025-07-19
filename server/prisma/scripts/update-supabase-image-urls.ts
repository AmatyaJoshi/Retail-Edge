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

// Map of product IDs to their image URLs
const imageUrlMap: { [key: string]: string } = {
  '0c3e80ee-59b3-4fc4-b760-8b07acc2d3ae': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-0c3e80ee-59b3-4fc4-b760-8b07acc2d3ae-1752692197865.jpg',
  '1936d406-e89e-40e4-bff7-1827532269d4': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-1936d406-e89e-40e4-bff7-1827532269d4-1752694651683.jpg',
  '1afc136b-4d9f-4e8e-aace-8e1df908a404': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-1afc136b-4d9f-4e8e-aace-8e1df908a404-1752695471088.webp',
  '26b017c6-06d8-443f-9b4a-d6b1cee6f4c0': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-26b017c6-06d8-443f-9b4a-d6b1cee6f4c0-1752691546926.jpg',
  '2a339fb2-f9f3-43bc-a85a-b217a0a38f12': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-2a339fb2-f9f3-43bc-a85a-b217a0a38f12-1752694444325.webp',
  '440c9e80-6bf8-4eb3-b2d2-f81936d67de3': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-440c9e80-6bf8-4eb3-b2d2-f81936d67de3-1752692430617.jpg',
  '86e3bb1c-2f5d-4774-98f3-4df7cddd0a0f': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-86e3bb1c-2f5d-4774-98f3-4df7cddd0a0f-1752693332131.webp',
  '8a8391b2-b4ac-4847-b652-66ffd8d65875': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-8a8391b2-b4ac-4847-b652-66ffd8d65875-1752694858921.jpg',
  '8ac1ac77-7358-425e-be16-0bdde9f02e59': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-8ac1ac77-7358-425e-be16-0bdde9f02e59-1752694528943.jpg',
  '8d15de86-0e4a-4414-9166-7a33610202d3': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-8d15de86-0e4a-4414-9166-7a33610202d3-1752692071720.png',
  '98255f4e-40a6-470f-89a5-0792729f8947': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-98255f4e-40a6-470f-89a5-0792729f8947-1752691218892.jpg',
  'af84cc12-4fea-4f58-aece-f2ce92ca9580': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-af84cc12-4fea-4f58-aece-f2ce92ca9580-1752695168803.jpg',
  'afded6df-058f-477d-9878-e0e0b1d3dff3': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-afded6df-058f-477d-9878-e0e0b1d3dff3-1752695551601.jpg',
  'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6-1752695614823.jpg',
  'be2157fb-7454-405e-9511-bf7ba81b7726': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-be2157fb-7454-405e-9511-bf7ba81b7726-1752694617983.jpg',
  'c2d3e4f5-g6h7-i8j9-k0l1-m2n3o4p5q6r7': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-c2d3e4f5-g6h7-i8j9-k0l1-m2n3o4p5q6r7-1752694261583.jpg',
  'c849a535-5f8b-47e3-889c-015693a644ac': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-c849a535-5f8b-47e3-889c-015693a644ac-1752622679798.png',
  'ccb83982-71f3-4497-bad8-7e64c6920dc6': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-ccb83982-71f3-4497-bad8-7e64c6920dc6-1752694912150.jpg',
  'd35623ee-bef6-42b2-8776-2f99f8bb4782': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-d35623ee-bef6-42b2-8776-2f99f8bb4782-1752694746069.webp',
  'd3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-d3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8-1752694274525.avif',
  'd8f5bee3-f3eb-4071-a124-6b857e0fd798': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-d8f5bee3-f3eb-4071-a124-6b857e0fd798-1752622808109.jpg',
  'daa29167-82a7-474b-9687-b8b903e7ec69': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-daa29167-82a7-474b-9687-b8b903e7ec69-1752694567719.jpg',
  'e4f5g6h7-i8j9-k0l1-m2n3-o4p5q6r7s8t9': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-e4f5g6h7-i8j9-k0l1-m2n3-o4p5q6r7s8t9-1752695420875.webp',
  'f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0-1752694352053.jpg',
  'fdf1ba3d-fa06-4ce5-90ff-d081c5d37176': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-fdf1ba3d-fa06-4ce5-90ff-d081c5d37176-1752694485385.jpeg',
  'g6h7i8j9-k0l1-m2n3-o4p5-q6r7s8t9u0v1': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-g6h7i8j9-k0l1-m2n3-o4p5-q6r7s8t9u0v1-1752694719324.jpg',
  'h7i8j9k0-l1m2-n3o4-p5q6-r7s8t9u0v1w2': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-h7i8j9k0-l1m2-n3o4-p5q6-r7s8t9u0v1w2-1752691532357.webp',
  'i8j9k0l1-m2n3-o4p5-q6r7-s8t9u0v1w2x3': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-i8j9k0l1-m2n3-o4p5-q6r7-s8t9u0v1w2x3-1752694390250.webp',
  'j9k0l1m2-n3o4-p5q6-r7s8-t9u0v1w2x3y4': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-j9k0l1m2-n3o4-p5q6-r7s8-t9u0v1w2x3y4-1752695508945.jpg',
  'k0l1m2n3-o4p5-q6r7-s8t9-u0v1w2x3y4z5': 'https://retailedgestorage.blob.core.windows.net/product-images/product-image-k0l1m2n3-o4p5-q6r7-s8t9-u0v1w2x3y4z5-1752693281165.png'
};

async function updateSupabaseImageUrls() {
  try {
    console.log('=== UPDATING SUPABASE IMAGE URLS ===');
    
    await supabasePrisma.$connect();
    console.log('✅ Connected to Supabase database');
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each product with its corresponding image URL
    for (const [productId, imageUrl] of Object.entries(imageUrlMap)) {
      try {
        const result = await supabasePrisma.products.update({
          where: { productId },
          data: { imageUrl }
        });
        
        console.log(`✅ Updated: ${result.name} (${productId})`);
        console.log(`   Image URL: ${imageUrl}`);
        updatedCount++;
        
      } catch (error: any) {
        if (error.code === 'P2025') {
          console.log(`⚠️  Skipped: Product ${productId} not found in Supabase`);
          skippedCount++;
        } else {
          console.error(`❌ Error updating ${productId}:`, error.message);
        }
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`⚠️  Skipped (not found): ${skippedCount} products`);
    console.log(`📊 Total processed: ${Object.keys(imageUrlMap).length} products`);
    
    // Verify some updates
    console.log('\n=== VERIFICATION ===');
    const sampleProducts = await supabasePrisma.products.findMany({
      select: {
        productId: true,
        name: true,
        imageUrl: true
      },
      take: 5
    });
    
    console.log('Sample products with image URLs:');
    sampleProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.imageUrl || 'NULL'}`);
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await supabasePrisma.$disconnect();
  }
}

updateSupabaseImageUrls(); 