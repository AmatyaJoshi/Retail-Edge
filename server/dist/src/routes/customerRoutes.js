"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controllers/customerController");
const router = express_1.default.Router();
router.get('/', customerController_1.getCustomers);
router.get('/ranking', customerController_1.getBuyerRanking);
router.get('/:customerId', customerController_1.getCustomerById);
router.get('/:customerId/sales', customerController_1.getCustomerSales);
router.post('/', customerController_1.createCustomer);
router.put('/:customerId', customerController_1.updateCustomer);
router.delete('/:customerId', customerController_1.deleteCustomer);
exports.default = router;
