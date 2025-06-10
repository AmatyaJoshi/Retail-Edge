import { Router } from 'express';
import { getPaymentPatterns, getOrderFrequency } from '../controllers/analyticsController';

const router = Router();

router.get('/payment-patterns', getPaymentPatterns);
router.get('/order-frequency', getOrderFrequency);

export default router;