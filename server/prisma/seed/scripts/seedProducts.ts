import { PrismaClient, Products } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Only keep fields that exist in the Products model
const allowedFields = [
  'productId',
  'name',
  'price',
  'rating',
  'stockQuantity',
  'category',
  'brand',
  'sku',
  'description',
  'imageUrl',
  'barcode', // Added barcode field
];

async function main() {
  // Read products from JSON file
  const productsPath = path.join(__dirname, 'seedData/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

  for (const product of products) {
    const upsertProduct = Object.fromEntries(
      Object.entries(product).filter(([key]) => allowedFields.includes(key))
    ) as Products;
    await prisma.products.upsert({
      where: { productId: upsertProduct.productId },
      update: upsertProduct,
      create: upsertProduct,
    });
  }
  console.log('Products upserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
