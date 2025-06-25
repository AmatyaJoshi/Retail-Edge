import express from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getBuyerRanking, getCustomerSales } from '../controllers/customerController';

const router = express.Router();

router.get('/', getCustomers);
router.get('/ranking', getBuyerRanking);
router.get('/:customerId', getCustomerById);
router.get('/:customerId/sales', getCustomerSales);
router.post('/', createCustomer);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);

export default router;