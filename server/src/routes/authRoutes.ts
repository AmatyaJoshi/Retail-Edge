import express from 'express';
import { sendEmailOTP, verifyEmailOTP, registerUser, loginUser, logoutUser } from '../controllers/authController';
import { checkSession } from '../controllers/checkSessionController';
import { PrismaClient } from '@prisma/client';
import { diagnoseAppwriteConfiguration, testEmailOTPFlow } from '../lib/appwriteDiagnostics';

const router = express.Router();
const prisma = new PrismaClient();

// Diagnostic route for Appwrite configuration
router.get('/diagnose-appwrite', async (req, res) => {
  try {
    console.log('Running Appwrite diagnostics...');
    const result = await diagnoseAppwriteConfiguration();
    
    if (result) {
      res.json({ success: true, message: 'Appwrite configuration is working correctly' });
    } else {
      res.status(500).json({ success: false, message: 'Appwrite configuration has issues. Check server logs for details.' });
    }
  } catch (error: any) {
    console.error('Error running diagnostics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Email OTP flow
router.post('/test-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    const result = await testEmailOTPFlow(email);
    
    if (result && typeof result === 'object' && result.success) {
      res.json({ 
        success: true, 
        message: 'Email OTP test successful',
        userId: result.userId,
        secretLength: result.secret ? result.secret.length : 0
      });
    } else {
      res.status(500).json({ success: false, message: 'Email OTP test failed. Check server logs for details.' });
    }
  } catch (error: any) {
    console.error('Error testing Email OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Email authentication routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/check-session', checkSession);

// Get user role by clerkId
router.get('/user-role', async (req, res) => {
  try {
    const { clerkId } = req.query;
    
    if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
    }

    const user = await prisma.users.findUnique({
      where: { clerkId: clerkId as string },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile by clerkId
router.get('/user-profile', async (req, res) => {
  try {
    const { clerkId } = req.query;
    
    if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required' });
    }

    const user = await prisma.users.findUnique({
      where: { clerkId: clerkId as string },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        address: true,
        photoUrl: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH user profile by id
router.patch('/user-profile', async (req, res) => {
  try {
    const { id, phone, address, photoUrl } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        phone,
        address,
        photoUrl
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        address: true,
        photoUrl: true
      }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;