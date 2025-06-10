import express, { RequestHandler } from 'express';
import {
  getSales,
  getSaleById,
  createSale,
  updateSaleStatus,
  updateSale,
  deleteSale
} from '../controllers/salesController';

const router = express.Router();

// Get all sales with optional date range filter
router.get('/', getSales as RequestHandler);

// Get a specific sale by ID
router.get('/:saleId', getSaleById as RequestHandler);

// Create a new sale
router.post('/', createSale as RequestHandler);

// Update sale status
router.patch('/:saleId/status', updateSaleStatus as RequestHandler);

// Update a sale
router.patch('/:saleId', updateSale as RequestHandler);

// Delete a sale
router.delete('/:saleId', deleteSale as RequestHandler);

export default router; 