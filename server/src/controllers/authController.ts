import { Request, Response } from 'express';
// Temporarily commented out Firebase auth while working on expenses feature
// import { auth } from '../config/firebase';
import { PrismaClient, Users } from '@prisma/client';
import { sendOtpEmail, deleteAppwriteUserByEmail } from '../lib/sendOtpEmail';
import { 
  createAppwriteUser, 
  generateAppwriteSession, 
  findAppwriteUserByEmail,
  deleteAppwriteSession
} from '../lib/appwriteAuth';
import axios from 'axios'; // Keep for now, we'll remove when all Clerk code is replaced
import { createClerkUser, authenticateClerkUser } from '../lib/clerkAuth';

const prisma = new PrismaClient();

// Temporary mock auth object while working on expenses feature
const mockAuth = {
  createCustomToken: async (uid: string) => {
    return `mock_token_${uid}`;
  }
};

const auth = mockAuth; // Use mock auth instead of Firebase auth

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

    // Check if email already exists in our database
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: 'This email is already registered. Please log in instead.',
        isExistingUser: true,
        shouldRedirectToLogin: true
      });
    }
    
    // Check if the user has exceeded the maximum number of resend attempts
    if (isResend) {
      const resendData = resendAttempts.get(email);
      if (resendData) {
        const { count, lastAttempt } = resendData;
        const currentTime = Date.now();
        
        if (count >= MAX_RESEND_ATTEMPTS && currentTime - lastAttempt < RESEND_COOLDOWN) {
          return res.status(429).json({
            success: false,
            error: `Too many resend attempts. Please try again in ${Math.ceil((RESEND_COOLDOWN - (currentTime - lastAttempt)) / 1000)} seconds.`,
          });
        }
        
        resendAttempts.set(email, {
          count: count + 1,
          lastAttempt: currentTime,
        });
      } else {
        resendAttempts.set(email, {
          count: 1,
          lastAttempt: Date.now(),
        });
      }
    }
    
    // Delete existing Appwrite user if present (for OTP resending)
    try {
      await deleteAppwriteUserByEmail(email);
      console.log(`Deleted existing Appwrite user for ${email}`);
    } catch (error) {
      console.log('No existing Appwrite user to delete (normal for first OTP)');
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the OTP with its timestamp
    otpStore.set(email, {
      otp,
      timestamp: Date.now(),
    });
    
    // Send the OTP via email using Appwrite
    const emailSent = await sendOtpEmail({ to: email, otp });
    
    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP. Please try again.',
      });
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send OTP',
    });
  }
};

export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'OTP and email are required',
      });
    }

    // Check if the OTP exists for the email
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      return res.status(404).json({
        success: false,
        error: 'No OTP found for this email. Please request a new OTP.',
      });
    }

    const { otp: storedOTP, timestamp } = storedOTPData;
    const currentTime = Date.now();

    // Check if OTP is expired
    if (currentTime - timestamp > OTP_EXPIRATION) {
      otpStore.delete(email);
      return res.status(401).json({
        success: false,
        error: 'OTP has expired. Please request a new one.',
      });
    }

    // Verify the OTP
    if (storedOTP !== otp) {
      return res.status(401).json({
        success: false,
        error: 'Invalid verification code. Please try again.',
      });
    }

    // OTP is valid, delete it to prevent reuse
    otpStore.delete(email);
    resendAttempts.delete(email);

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify OTP',
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { 
      firstName,
      lastName,
      email,
      password,
      phone, // Only for DB
      role,
      aadhaar,
      panCard,
      emailVerified 
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: First name, last name, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate phone number (must be exactly 10 digits, no plus sign)
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must be exactly 10 digits.'
      });
    }

    // Check if email is already registered in our database
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: 'Email already registered. Please login instead.' 
      });
    }

    // Create user in Clerk
    let clerkUser;
    try {
      clerkUser = await createClerkUser({
        email,
        password,
        firstName,
        lastName
      });
    } catch (clerkError: any) {
      let errorMessage = clerkError.message || 'Registration with authentication provider failed';
      if (clerkError.errors && Array.isArray(clerkError.errors)) {
        errorMessage = clerkError.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
      }
      return res.status(400).json({ 
        success: false, 
        error: errorMessage,
        details: clerkError.errors || []
      });
    }

    // Store phone and other info in your own DB only
    const newUser = await prisma.users.create({
      data: {
        firstName,
        lastName,
        email,
        phone, // Store as is
        role,
        clerkId: clerkUser.id,
        appwriteId: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique placeholder until Appwrite user is created
        aadhaar: aadhaar || null,
        pan: panCard || null,
        address: '',
        emailVerified: true // Set to true since we verified via OTP
      },
    });

    // Return success with limited user details
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Registration failed' 
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    // First check if a user with this email exists in our database
    const existingUser = await prisma.users.findUnique({
      where: { email: identifier }
    });
    // For security, always return 401 for any login failure
    if (!existingUser) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or authentication failed.' });
    }
    // Authenticate with Clerk (fetch user by email)
    let clerkUser;
    try {
      clerkUser = await authenticateClerkUser({
        email: identifier,
        password
      });
    } catch (clerkError: any) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials or authentication failed.' 
      });
    }
    // Set user data cookie for server-side use (HttpOnly for security)
    res.cookie('user', JSON.stringify({
      id: existingUser.id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      role: existingUser.role,
      clerkId: existingUser.clerkId
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    return res.status(200).json({ 
      success: true, 
      user: {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        role: existingUser.role,
        clerkId: existingUser.clerkId
      }
    });
  } catch (error: any) {
    return res.status(401).json({ success: false, error: 'Invalid credentials or authentication failed.' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Get the session token from cookies
    const sessionToken = req.cookies?.session;
    const clientSessionToken = req.cookies?.['__session'];
    
    // Clear server-side cookies
    res.clearCookie('user', { path: '/' });
    res.clearCookie('session', { path: '/' });
    res.clearCookie('token', { path: '/' });
    
    // Clear all Clerk cookies to ensure complete migration
    res.clearCookie('__session_gsnn-2Gz', { path: '/' });
    res.clearCookie('__refresh_gsnn-2Gz', { path: '/' });
    res.clearCookie('__client_uat_gsnn-2Gz', { path: '/' });
    res.clearCookie('__clerk_db_jwt_gsnn-2Gz', { path: '/' });
    res.clearCookie('__refresh_t_085zT2', { path: '/' });
    res.clearCookie('__refresh_Iqk3meOC', { path: '/' });
    res.clearCookie('__refresh_QeNH9JUq', { path: '/' });
    res.clearCookie('__clerk_keys_0', { path: '/' });
    res.clearCookie('__clerk_db_jwt_CBnpQuRX', { path: '/' });
    res.clearCookie('__clerk_db_jwt', { path: '/' });
    res.clearCookie('__client_uat_CBnpQuRX', { path: '/' });
    res.clearCookie('__client_uat', { path: '/' });
    
    // Clear Appwrite session cookie
    res.clearCookie('__session', { path: '/' });
    
    // Try to delete the session in Appwrite
    if (sessionToken) {
      try {
        await deleteAppwriteSession(sessionToken);
        console.log('Appwrite session deleted successfully');
      } catch (error) {
        console.error('Failed to delete Appwrite session:', error);
        // Continue with logout even if Appwrite deletion fails
      }
    } else if (clientSessionToken) {
      try {
        await deleteAppwriteSession(clientSessionToken);
        console.log('Appwrite client session deleted successfully');
      } catch (error) {
        console.error('Failed to delete Appwrite client session:', error);
      }
    } else {
      console.log('No session token available for deletion with Appwrite');
    }
    
    // Return success with instructions to clear client-side cookies
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully',
      clearCookies: [
        '__session', 
        '__session_gsnn-2Gz',
        '__refresh_gsnn-2Gz',
        '__client_uat_gsnn-2Gz',
        '__clerk_db_jwt_gsnn-2Gz',
        '__refresh_t_085zT2',
        '__refresh_Iqk3meOC',
        '__refresh_QeNH9JUq',
        '__clerk_keys_0',
        '__clerk_db_jwt_CBnpQuRX',
        '__clerk_db_jwt',
        '__client_uat_CBnpQuRX',
        '__client_uat'
      ]  // List of client-side cookies to clear
    });
  } catch (error: any) {
    console.error('Error in logoutUser:', error);
    // Even if there's an error, try to clear cookies and proceed with logout
    res.clearCookie('user', { path: '/' });
    res.clearCookie('session', { path: '/' });
    res.clearCookie('__session', { path: '/' });
    
    // Clear all Clerk cookies
    res.clearCookie('__session_gsnn-2Gz', { path: '/' });
    res.clearCookie('__refresh_gsnn-2Gz', { path: '/' });
    res.clearCookie('__client_uat_gsnn-2Gz', { path: '/' });
    res.clearCookie('__clerk_db_jwt_gsnn-2Gz', { path: '/' });
    res.clearCookie('__refresh_t_085zT2', { path: '/' });
    res.clearCookie('__refresh_Iqk3meOC', { path: '/' });
    res.clearCookie('__refresh_QeNH9JUq', { path: '/' });
    res.clearCookie('__clerk_keys_0', { path: '/' });
    res.clearCookie('__clerk_db_jwt_CBnpQuRX', { path: '/' });
    res.clearCookie('__clerk_db_jwt', { path: '/' });
    res.clearCookie('__client_uat_CBnpQuRX', { path: '/' });
    res.clearCookie('__client_uat', { path: '/' });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Partial logout completed with errors',
      error: error.message,
      clearCookies: [
        '__session', 
        '__session_gsnn-2Gz',
        '__refresh_gsnn-2Gz',
        '__client_uat_gsnn-2Gz',
        '__clerk_db_jwt_gsnn-2Gz',
        '__refresh_t_085zT2',
        '__refresh_Iqk3meOC',
        '__refresh_QeNH9JUq',
        '__clerk_keys_0',
        '__clerk_db_jwt_CBnpQuRX',
        '__clerk_db_jwt',
        '__client_uat_CBnpQuRX',
        '__client_uat'
      ]
    });
  }
};

export const checkSession = async (req: Request, res: Response) => {
  try {
    // Get user from request cookies
    console.log('Checking session, cookies:', req.cookies);
    console.log('Headers:', req.headers);
    
    const userCookie = req.cookies?.user;
    
    if (!userCookie) {
      console.log('No user cookie found');
      
      // Check localStorage fallback from Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const userData = JSON.parse(Buffer.from(token, 'base64').toString());
          
          if (userData && userData.user) {
            console.log('Using Authorization header for session');
            return res.status(200).json({ 
              success: true, 
              message: 'Active session found via Authorization header',
              user: userData.user
            });
          }
        } catch (error) {
          console.error('Error parsing Authorization token:', error);
        }
      }
      
      return res.status(401).json({ success: false, message: 'No active session' });
    }
    
    try {
      // Parse the user cookie
      const userData = JSON.parse(userCookie);
      console.log('User data from cookie:', userData);
      
      if (!userData) {
        console.log('Invalid user data in cookie');
        return res.status(401).json({ success: false, message: 'Invalid user session' });
      }
      
      // Return the user data
      return res.status(200).json({ 
        success: true, 
        message: 'Active session found',
        user: userData
      });
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
  } catch (error: any) {
    console.error('Error in checkSession:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to check session' 
    });
  }
};


