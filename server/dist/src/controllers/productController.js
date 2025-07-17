"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePurchaseOrder = exports.updatePurchaseOrder = exports.updatePurchaseOrderStatus = exports.getPurchaseOrders = exports.createPurchaseOrder = exports.deleteProduct = exports.updateProduct = exports.updateProductStock = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const productUtils_1 = require("../lib/productUtils");
const azureBlob_1 = require("../lib/azureBlob");
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const getProducts = async (req, res) => {
    try {
        const { searchTerm, sortField, sortOrder } = req.query;
        const where = {};
        const orderBy = {};
        if (searchTerm) {
            const searchString = searchTerm.toString();
            where.OR = [
                { name: { contains: searchString, mode: 'insensitive' } },
                { category: { contains: searchString, mode: 'insensitive' } },
                { brand: { contains: searchString, mode: 'insensitive' } },
                { sku: { contains: searchString, mode: 'insensitive' } },
                { barcode: { contains: searchString, mode: 'insensitive' } },
                { description: { contains: searchString, mode: 'insensitive' } },
            ];
        }
        if (sortField) {
            orderBy[sortField.toString()] = sortOrder === "desc" ? "desc" : "asc";
        }
        else {
            // Default sorting if no sortField is provided
            orderBy.name = "asc"; // Default to alphabetical by name
        }
        const products = await prisma.products.findMany({
            where,
            orderBy,
        });
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: "Error retrieving products", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await prisma.products.findUnique({
            where: { productId },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: "Error retrieving product", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    try {
        let { productId, name, price, rating, stockQuantity, category, brand, sku, description, imageUrl, barcode } = req.body;
        // Handle image file upload if present
        if (req.files && req.files.image) {
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/')) {
                res.status(400).json({ error: 'Only image files are allowed for product image' });
                return;
            }
            const ext = path_1.default.extname(file.name);
            const fileName = `product-image-${name.replace(/\s+/g, '-')}-${Date.now()}${ext}`;
            // Use tempFilePath since express-fileupload is configured with useTempFiles: true
            imageUrl = await (0, azureBlob_1.uploadToAzure)('product-images', file.tempFilePath, fileName, file.mimetype);
        }
        // Check if a product with the same name already exists
        let product = await prisma.products.findUnique({
            where: { name: name },
        });
        if (product) {
            // If product exists, update its stock quantity
            product = await prisma.products.update({
                where: { name: name },
                data: {
                    stockQuantity: product.stockQuantity + stockQuantity,
                    price,
                    rating,
                    category,
                    brand,
                    sku: sku || product.sku,
                    description,
                    imageUrl,
                    barcode: barcode || product.barcode
                },
            });
            res.status(200).json({ message: "Product stock updated successfully", product });
            return;
        }
        else {
            // Generate SKU and barcode if not provided
            let generatedSKU = sku;
            let generatedBarcode = barcode;
            if (!generatedSKU) {
                generatedSKU = await (0, productUtils_1.generateSKU)(category, brand);
                // Ensure SKU is unique
                let counter = 1;
                while (!(await (0, productUtils_1.isSKUUnique)(generatedSKU))) {
                    generatedSKU = await (0, productUtils_1.generateSKU)(category, brand);
                    counter++;
                    if (counter > 100)
                        break; // Prevent infinite loop
                }
            }
            else {
                // Check if provided SKU is unique
                if (!(await (0, productUtils_1.isSKUUnique)(generatedSKU))) {
                    res.status(400).json({
                        message: "SKU already exists",
                        error: "SKU_DUPLICATE"
                    });
                    return;
                }
            }
            if (!generatedBarcode) {
                generatedBarcode = await (0, productUtils_1.generateUniqueBarcode)();
            }
            else {
                // Check if provided barcode is unique
                if (!(await (0, productUtils_1.isBarcodeUnique)(generatedBarcode))) {
                    res.status(400).json({
                        message: "Barcode already exists",
                        error: "BARCODE_DUPLICATE"
                    });
                    return;
                }
            }
            // If product does not exist, create a new one
            product = await prisma.products.create({
                data: {
                    productId,
                    name,
                    price,
                    rating,
                    stockQuantity,
                    category: category || 'uncategorized',
                    brand,
                    sku: generatedSKU,
                    description,
                    imageUrl,
                    barcode: generatedBarcode
                },
            });
            res.status(201).json({ message: "Product created successfully", product });
            return;
        }
    }
    catch (error) {
        console.error('Error creating/updating product:', error);
        res.status(500).json({ message: "Error creating/updating product", error: error instanceof Error ? error.message : 'Unknown error' });
        return;
    }
};
exports.createProduct = createProduct;
const updateProductStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stockQuantity } = req.body;
        const product = await prisma.products.update({
            where: { productId },
            data: { stockQuantity },
        });
        res.status(200).json(product);
    }
    catch (error) {
        console.error('Error updating product stock:', error);
        res.status(500).json({
            message: "Error updating product stock",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateProductStock = updateProductStock;
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        let { name, price, rating, stockQuantity, category, brand, sku, description, imageUrl, barcode } = req.body;
        // Fetch the current product to get the old imageUrl
        const currentProduct = await prisma.products.findUnique({ where: { productId } });
        // Handle image file upload if present
        if (req.files && req.files.image) {
            // Delete old image if it exists
            if (currentProduct && currentProduct.imageUrl) {
                await (0, azureBlob_1.deleteFromAzureByUrl)(currentProduct.imageUrl);
            }
            const file = req.files.image;
            if (!file.mimetype.startsWith('image/')) {
                res.status(400).json({ error: 'Only image files are allowed for product image' });
                return;
            }
            const ext = path_1.default.extname(file.name);
            const fileName = `product-image-${name?.replace(/\s+/g, '-') || productId}-${Date.now()}${ext}`;
            imageUrl = await (0, azureBlob_1.uploadToAzure)('product-images', file.tempFilePath, fileName, file.mimetype);
        }
        // Handle image removal (imageUrl set to empty string)
        if (imageUrl === "" && currentProduct && currentProduct.imageUrl) {
            await (0, azureBlob_1.deleteFromAzureByUrl)(currentProduct.imageUrl);
        }
        // Check if SKU or barcode already exists for another product
        if (sku) {
            const existingProductWithSKU = await prisma.products.findFirst({
                where: {
                    sku: sku,
                    productId: { not: productId }
                }
            });
            if (existingProductWithSKU) {
                res.status(400).json({
                    message: "SKU already exists for another product",
                    error: "SKU_DUPLICATE"
                });
                return;
            }
        }
        if (barcode) {
            const existingProductWithBarcode = await prisma.products.findFirst({
                where: {
                    barcode: barcode,
                    productId: { not: productId }
                }
            });
            if (existingProductWithBarcode) {
                res.status(400).json({
                    message: "Barcode already exists for another product",
                    error: "BARCODE_DUPLICATE"
                });
                return;
            }
        }
        const updatedProduct = await prisma.products.update({
            where: { productId },
            data: {
                name,
                price,
                rating,
                stockQuantity,
                category,
                brand,
                sku,
                description,
                imageUrl,
                barcode
            },
        });
        res.status(200).json(updatedProduct);
        return;
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            message: "Error updating product",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        await prisma.products.delete({
            where: { productId },
        });
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            message: "Error deleting product",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteProduct = deleteProduct;
const createPurchaseOrder = async (req, res) => {
    try {
        const { productId, quantity, associateId, expectedDeliveryDate, notes } = req.body;
        // Create purchase order
        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                productId,
                quantity,
                associateId,
                expectedDeliveryDate: new Date(expectedDeliveryDate),
                notes,
                status: 'PENDING'
            },
        });
        res.status(201).json(purchaseOrder);
    }
    catch (error) {
        console.error('Error creating purchase order:', error);
        res.status(500).json({
            message: "Error creating purchase order",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createPurchaseOrder = createPurchaseOrder;
const getPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await prisma.purchaseOrder.findMany({
            include: {
                product: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(purchaseOrders);
    }
    catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({
            message: "Error retrieving purchase orders",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getPurchaseOrders = getPurchaseOrders;
const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const purchaseOrder = await prisma.purchaseOrder.update({
            where: { id: orderId },
            data: { status },
            include: {
                product: true
            }
        });
        // If order is received, update product stock
        if (status === 'RECEIVED') {
            await prisma.products.update({
                where: { productId: purchaseOrder.productId },
                data: {
                    stockQuantity: {
                        increment: purchaseOrder.quantity
                    }
                }
            });
        }
        res.json(purchaseOrder);
    }
    catch (error) {
        console.error('Error updating purchase order:', error);
        res.status(500).json({
            message: "Error updating purchase order",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updatePurchaseOrderStatus = updatePurchaseOrderStatus;
const updatePurchaseOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { productId, quantity, associateId, expectedDeliveryDate, status, notes } = req.body;
        const updatedPurchaseOrder = await prisma.purchaseOrder.update({
            where: { id: orderId },
            data: {
                productId,
                quantity,
                associateId,
                expectedDeliveryDate: new Date(expectedDeliveryDate),
                status,
                notes
            },
        });
        res.status(200).json(updatedPurchaseOrder);
    }
    catch (error) {
        console.error('Error updating purchase order:', error);
        res.status(500).json({
            message: "Error updating purchase order",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updatePurchaseOrder = updatePurchaseOrder;
const deletePurchaseOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        await prisma.purchaseOrder.delete({
            where: { id: orderId },
        });
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        console.error('Error deleting purchase order:', error);
        res.status(500).json({
            message: "Error deleting purchase order",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deletePurchaseOrder = deletePurchaseOrder;
