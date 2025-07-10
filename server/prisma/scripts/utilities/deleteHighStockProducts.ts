import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteHighStockProducts() {
  try {
    // First, get the count of products to be deleted
    const count = await prisma.products.count({
      where: {
        stockQuantity: {
          gt: 500
        }
      }
    });

    console.log(`Found ${count} products with stock quantity > 500`);

    // Get the product IDs to be deleted
    const productsToDelete = await prisma.products.findMany({
      where: {
        stockQuantity: {
          gt: 500
        }
      },
      select: {
        productId: true
      }
    });

    const productIds = productsToDelete.map(p => p.productId);

    // Delete related sales records first
    const salesResult = await prisma.sales.deleteMany({
      where: {
        productId: {
          in: productIds
        }
      }
    });

    console.log(`Deleted ${salesResult.count} related sales records`);

    // Delete related purchases
    const purchasesResult = await prisma.purchases.deleteMany({
      where: {
        productId: {
          in: productIds
        }
      }
    });

    console.log(`Deleted ${purchasesResult.count} related purchase records`);

    // Now delete the products
    const result = await prisma.products.deleteMany({
      where: {
        stockQuantity: {
          gt: 500
        }
      }
    });

    console.log(`Successfully deleted ${result.count} products`);
  } catch (error) {
    console.error('Error deleting products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteHighStockProducts(); 