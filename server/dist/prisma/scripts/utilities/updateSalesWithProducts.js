"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function updateSalesWithProducts() {
    try {
        // Get all products
        const products = await prisma.products.findMany();
        const productMap = new Map(products.map(p => [p.productId, p]));
        // Get all sales
        const sales = await prisma.sales.findMany();
        let updatedCount = 0;
        for (const sale of sales) {
            const product = productMap.get(sale.productId);
            if (product) {
                // Update sale with product information
                await prisma.sales.update({
                    where: { saleId: sale.saleId },
                    data: {
                        unitPrice: product.price,
                        totalAmount: product.price * sale.quantity
                    }
                });
                updatedCount++;
            }
            else {
                console.log(`Product not found for sale ${sale.saleId} with productId ${sale.productId}`);
            }
        }
        console.log(`Updated ${updatedCount} sales with valid product information.`);
    }
    catch (error) {
        console.error('Error updating sales:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the update
updateSalesWithProducts();
