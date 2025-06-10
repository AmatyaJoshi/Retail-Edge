import { Request, Response } from 'express';
import { auth } from '../config/firebase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store OTPs temporarily (in production, use Redis or a database)
const otpStore = new Map<string, { otp: string; timestamp: number }>();
const resendAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds in milliseconds
const OTP_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const sendEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email, isResend } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Check resend attempts and cooldown
    if (isResend) {
      const attemptData = resendAttempts.get(email);
      const now = Date.now();

      if (attemptData) {
        if (now - attemptData.lastAttempt < RESEND_COOLDOWN) {
          const remainingTime = Math.ceil((RESEND_COOLDOWN - (now - attemptData.lastAttempt)) / 1000);
          return res.status(429).json({
            success: false,
            error: `Please wait ${remainingTime} seconds before requesting another OTP`,
          });
        }

        if (attemptData.count >= MAX_RESEND_ATTEMPTS) {
          return res.status(429).json({
            success: false,
            error: 'Maximum resend attempts reached. Please try again later.',
          });
        }

        resendAttempts.set(email, {
          count: attemptData.count + 1,
          lastAttempt: now,
        });
      } else {
        resendAttempts.set(email, {
          count: 1,
          lastAttempt: now,
        });
      }
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with timestamp
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
    });

    // Mock email sending: Log the OTP to console
    console.log(`MOCK OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: isResend ? 'New verification code generated successfully (mocked)' : 'Verification code generated successfully (mocked)',
    });

  } catch (error: any) {
    console.error('Error in sendEmailOTP controller (mocked):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate verification code (mocked)',
      details: error.message,
    });
  }
};

export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        success: false,
        error: 'OTP and email are required',
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found for this email. Please request a new code.',
      });
    }

    if (Date.now() - storedData.timestamp > OTP_EXPIRATION) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new code.',
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please try again.',
      });
    }

    // Clear the OTP after successful verification
    otpStore.delete(email);

    // Check if user exists in database
    const existingUser = await prisma.persona.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.firebaseUid) {
      // User exists, generate a session token or handle login
      const customToken = await auth.createCustomToken(existingUser.firebaseUid);
      return res.json({
        success: true,
        message: 'Email verified successfully',
        isExistingUser: true,
        customToken,
      });
    }

    // For new users, just return success - the actual user creation will happen in a separate step
    res.json({
      success: true,
      message: 'Email verified successfully',
      isExistingUser: false,
    });

  } catch (error: any) {
    console.error('Error in verifyEmailOTP controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify code',
      details: error.message,
    });
  }
};

export const getCustomToken = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'UID is required',
      });
    }

    const customToken = await auth.createCustomToken(uid);

    res.json({
      success: true,
      customToken,
    });
  } catch (error: any) {
    console.error('Error in getCustomToken controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get custom token',
      details: error.message,
    });
  }
}; 