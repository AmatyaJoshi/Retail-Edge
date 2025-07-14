import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProductStock,
  updateProduct,
  deleteProduct,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderStatus,
  updatePurchaseOrder,
  deletePurchaseOrder
} from '../controllers/productController';
import { generateSKU, generateAlternativeSKU, generateUniqueBarcode, generateSequentialBarcode } from '../lib/productUtils';

const router = express.Router();

// Purchase order routes - these must come first!
router.post('/purchase-orders', createPurchaseOrder);
router.get('/purchase-orders', getPurchaseOrders);
router.put('/purchase-orders/:orderId/status', updatePurchaseOrderStatus);
router.put('/purchase-orders/:orderId', updatePurchaseOrder);
router.delete('/purchase-orders/:orderId', deletePurchaseOrder);

// Product CRUD routes
router.get('/', getProducts);
router.get('/:productId', getProduct);
router.post('/', createProduct);
router.put('/:productId/stock', updateProductStock);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

// Auto-generation routes
router.post('/generate-sku', async (req, res) => {
  try {
    const { category, brand } = req.body;
    const sku = await generateSKU(category, brand);
    res.json({ sku });
  } catch (error) {
    console.error('Error generating SKU:', error);
    res.status(500).json({ error: 'Failed to generate SKU' });
  }
});

router.post('/generate-alternative-sku', async (req, res) => {
  try {
    const { brand } = req.body;
    const sku = await generateAlternativeSKU(brand);
    res.json({ sku });
  } catch (error) {
    console.error('Error generating alternative SKU:', error);
    res.status(500).json({ error: 'Failed to generate alternative SKU' });
  }
});

router.post('/generate-barcode', async (req, res) => {
  try {
    const { type = 'unique' } = req.body;
    let barcode: string;
    
    if (type === 'sequential') {
      barcode = await generateSequentialBarcode();
    } else {
      barcode = await generateUniqueBarcode();
    }
    
    res.json({ barcode });
  } catch (error) {
    console.error('Error generating barcode:', error);
    res.status(500).json({ error: 'Failed to generate barcode' });
  }
});

export default router;