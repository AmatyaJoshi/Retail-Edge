import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyAppwriteJWT } from '../lib/appwriteAuth';

const prisma = new PrismaClient();

/**
 * Checks if the user has a valid Appwrite session and returns the associated user data
 */
export const checkSession = async (req: Request, res: Response) => {
  try {
    console.log('Checking session, cookies:', Object.keys(req.cookies));
    
    // Check if this is an initial request
    const initialSession = req.cookies['initial_session'];
    if (!initialSession) {
      // Set initial_session cookie for first-time visitors
      res.cookie('initial_session', 'true', {
        httpOnly: false, // Allow client middleware to access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });
    }
    
    // Check for Appwrite session cookie
    const appwriteSessionCookie = req.cookies['__session'];
    
    if (appwriteSessionCookie) {
      // Validate the JWT token
      const validation = verifyAppwriteJWT(appwriteSessionCookie);
      
      if (!validation.isValid) {
        console.log(`Invalid JWT: ${validation.reason}`);
        
        // If the token is expired, tell the client to reauthenticate
        if (validation.reason?.includes('Token expired')) {
          return res.status(401).json({ 
            success: false, 
            message: 'Session expired',
            error: validation.reason,
            requiresReauthentication: true,
            sessionExpired: true
          });
        }
        
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid session token',
          error: validation.reason,
          requiresReauthentication: true
        });
      }
      
      // Token is valid, get the user from database
      const userData = validation.parsedToken;
      
      // Try to get user from database using the Appwrite user ID
      const user = await prisma.users.findFirst({
        where: { clerkId: userData.userId } // Fixed: use correct field name from Prisma schema
      });
      
      if (user) {
        // Return success with user data from our database
        return res.status(200).json({
          success: true,
          message: 'Session valid',
          user: user,
          tokenExpiry: userData.exp
        });
      } else {
        // If no user in our database but valid Appwrite session, it means the user 
        // is in process of registering and hasn't completed yet
        console.log('Valid Appwrite session but user not yet in database - still in registration flow');
        return res.status(200).json({ 
          success: true, 
          message: 'Valid Appwrite session, but user registration incomplete',
          registrationIncomplete: true,
          appwriteUserId: userData.userId,
          tokenExpiry: userData.exp
        });
      }
    }

    // No valid Appwrite session found
    console.log('No valid session found');
    return res.status(401).json({ success: false, message: 'No active session' });
    
  } catch (error: any) {
    console.error('Error in checkSession:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to check session' 
    });
  }
};