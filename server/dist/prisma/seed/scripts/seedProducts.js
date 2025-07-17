"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
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
    const productsPath = path_1.default.join(__dirname, 'seedData/products.json');
    const products = JSON.parse(fs_1.default.readFileSync(productsPath, 'utf-8'));
    for (const product of products) {
        const upsertProduct = Object.fromEntries(Object.entries(product).filter(([key]) => allowedFields.includes(key)));
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
