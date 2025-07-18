"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function roundProductPrices() {
    try {
        const products = await prisma.products.findMany();
        let updatedCount = 0;
        for (const product of products) {
            const roundedPrice = Math.round(product.price);
            if (product.price !== roundedPrice) {
                await prisma.products.update({
                    where: { productId: product.productId },
                    data: { price: roundedPrice },
                });
                updatedCount++;
            }
        }
        console.log(`Updated ${updatedCount} products to have whole number prices.`);
    }
    catch (error) {
        console.error('Error rounding product prices:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
roundProductPrices();
