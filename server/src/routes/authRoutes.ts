import express from 'express';
import { sendEmailOTP, verifyEmailOTP, getCustomToken } from '../controllers/authController';

const router = express.Router();

// Email authentication routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/get-custom-token', getCustomToken);

export default router; 