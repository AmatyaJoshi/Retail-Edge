"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const productUtils_1 = require("../lib/productUtils");
const router = express_1.default.Router();
// Purchase order routes - these must come first!
router.post('/purchase-orders', productController_1.createPurchaseOrder);
router.get('/purchase-orders', productController_1.getPurchaseOrders);
router.put('/purchase-orders/:orderId/status', productController_1.updatePurchaseOrderStatus);
router.put('/purchase-orders/:orderId', productController_1.updatePurchaseOrder);
router.delete('/purchase-orders/:orderId', productController_1.deletePurchaseOrder);
// Product CRUD routes
router.get('/', productController_1.getProducts);
router.get('/:productId', productController_1.getProduct);
router.post('/', productController_1.createProduct);
router.put('/:productId/stock', productController_1.updateProductStock);
router.put('/:productId', productController_1.updateProduct);
router.delete('/:productId', productController_1.deleteProduct);
// Auto-generation routes
router.post('/generate-sku', async (req, res) => {
    try {
        const { category, brand } = req.body;
        const sku = await (0, productUtils_1.generateSKU)(category, brand);
        res.json({ sku });
    }
    catch (error) {
        console.error('Error generating SKU:', error);
        res.status(500).json({ error: 'Failed to generate SKU' });
    }
});
router.post('/generate-alternative-sku', async (req, res) => {
    try {
        const { brand } = req.body;
        const sku = await (0, productUtils_1.generateAlternativeSKU)(brand);
        res.json({ sku });
    }
    catch (error) {
        console.error('Error generating alternative SKU:', error);
        res.status(500).json({ error: 'Failed to generate alternative SKU' });
    }
});
router.post('/generate-barcode', async (req, res) => {
    try {
        const { type = 'unique' } = req.body;
        let barcode;
        if (type === 'sequential') {
            barcode = await (0, productUtils_1.generateSequentialBarcode)();
        }
        else {
            barcode = await (0, productUtils_1.generateUniqueBarcode)();
        }
        res.json({ barcode });
    }
    catch (error) {
        console.error('Error generating barcode:', error);
        res.status(500).json({ error: 'Failed to generate barcode' });
    }
});
exports.default = router;
