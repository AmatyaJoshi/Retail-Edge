import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBarcodesTo12Digits() {
  // Find all products with a barcode that is not null and not 12 digits
  const products = await prisma.products.findMany({
    where: {
      NOT: [
        { barcode: null },
        { barcode: { length: 12 } },
      ],
    },
    select: {
      productId: true,
      barcode: true,
    },
  });

  for (const product of products) {
    if (product.barcode && product.barcode.length !== 12) {
      const newBarcode = product.barcode.slice(0, 12);
      await prisma.products.update({
        where: { productId: product.productId },
        data: { barcode: newBarcode },
      });
      console.log(`Updated product ${product.productId}: ${product.barcode} -> ${newBarcode}`);
    }
  }
}

fixBarcodesTo12Digits()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
