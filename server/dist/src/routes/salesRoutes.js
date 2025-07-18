"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesController_1 = require("../controllers/salesController");
const router = express_1.default.Router();
// Get all sales with optional date range filter
router.get('/', salesController_1.getSales);
// Get a specific sale by ID
router.get('/:saleId', salesController_1.getSaleById);
// Create a new sale
router.post('/', salesController_1.createSale);
// Update sale status
router.patch('/:saleId/status', salesController_1.updateSaleStatus);
// Update a sale
router.patch('/:saleId', salesController_1.updateSale);
// Delete a sale
router.delete('/:saleId', salesController_1.deleteSale);
exports.default = router;
