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

// 30 random 12-digit barcodes
const barcodes = [
  '795022481433', '226437131800', '329772578180', '214924637370', '653032444502',
  '923232425310', '353379729163', '570828120716', '344284067144', '171978348317',
  '834566337688', '961446055654', '533598116974', '124473927077', '602551335741',
  '699062600241', '181770489483', '476221961127', '750113045143', '890006384920',
  '426531054573', '577112222972', '382889746321', '240935063296', '591466517048',
  '108697184119', '232334149478', '905835877090', '346588191224', '798631162337'
];

// Corresponding productIds from products.json (in order)
const productIds = [
  'd35623ee-bef6-42b2-8776-2f99f8bb4782', '8ac1ac77-7358-425e-be16-0bdde9f02e59', '1afc136b-4d9f-4e8e-aace-8e1df908a404',
  'af84cc12-4fea-4f58-aece-f2ce92ca9580', '86e3bb1c-2f5d-4774-98f3-4df7cddd0a0f', '26b017c6-06d8-443f-9b4a-d6b1cee6f4c0',
  '440c9e80-6bf8-4eb3-b2d2-f81936d67de3', '98255f4e-40a6-470f-89a5-0792729f8947', '2a339fb2-f9f3-43bc-a85a-b217a0a38f12',
  '8a8391b2-b4ac-4847-b652-66ffd8d65875', 'be2157fb-7454-405e-9511-bf7ba81b7726', 'fdf1ba3d-fa06-4ce5-90ff-d081c5d37176',
  'afded6df-058f-477d-9878-e0e0b1d3dff3', 'daa29167-82a7-474b-9687-b8b903e7ec69', 'ccb83982-71f3-4497-bad8-7e64c6920dc6',
  '1936d406-e89e-40e4-bff7-1827532269d4', 'c849a535-5f8b-47e3-889c-015693a644ac', '0c3e80ee-59b3-4fc4-b760-8b07acc2d3ae',
  'd8f5bee3-f3eb-4071-a124-6b857e0fd798', '8d15de86-0e4a-4414-9166-7a33610202d3', 'b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6',
  'c2d3e4f5-g6h7-i8j9-k0l1-m2n3o4p5q6r7', 'd3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8', 'e4f5g6h7-i8j9-k0l1-m2n3-o4p5q6r7s8t9',
  'f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0', 'g6h7i8j9-k0l1-m2n3-o4p5-q6r7s8t9u0v1', 'h7i8j9k0-l1m2-n3o4-p5q6-r7s8t9u0v1w2',
  'i8j9k0l1-m2n3-o4p5-q6r7-s8t9u0v1w2x3', 'j9k0l1m2-n3o4-p5q6-r7s8-t9u0v1w2x3y4', 'k0l1m2n3-o4p5-q6r7-s8t9-u0v1w2x3y4z5'
];

async function updateBarcodes() {
  try {
    await supabasePrisma.$connect();
    console.log('✅ Connected to Supabase database');
    let updatedCount = 0;
    for (let i = 0; i < barcodes.length; i++) {
      const productId = productIds[i];
      const barcode = barcodes[i];
      try {
        const result = await supabasePrisma.products.update({
          where: { productId },
          data: { barcode }
        });
        console.log(`✅ Updated: ${result.name} (${productId}) with barcode ${barcode}`);
        updatedCount++;
      } catch (error: any) {
        if (error.code === 'P2025') {
          console.log(`⚠️  Skipped: Product ${productId} not found in Supabase`);
        } else {
          console.error(`❌ Error updating ${productId}:`, error.message);
        }
      }
    }
    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`📊 Total processed: ${barcodes.length} products`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await supabasePrisma.$disconnect();
  }
}

updateBarcodes(); 