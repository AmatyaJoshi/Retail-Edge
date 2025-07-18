"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSession = exports.logoutUser = exports.loginUser = exports.registerUser = exports.verifyEmailOTP = exports.sendEmailOTP = void 0;
const client_1 = require("@prisma/client");
const clerkAdmin_1 = require("../lib/clerkAdmin");
const appwriteAuth_1 = require("../lib/appwriteAuth");
const prisma = new client_1.PrismaClient();
// Temporary mock auth object while working on expenses feature
const mockAuth = {
    createCustomToken: async (uid) => {
        return `mock_token_${uid}`;
    }
};
const auth = mockAuth; // Use mock auth instead of Firebase auth
// Store OTPs temporarily (in production, use Redis or a database)
const otpStore = new Map();
const resendAttempts = new Map();
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds in milliseconds
const OTP_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }
        // Use Appwrite Email OTP API
        const result = await (0, appwriteAuth_1.sendEmailOTP)(email);
        console.log('sendAppwriteEmailOTP result:', result);
        if (result.success) {
            // Store the userId and secret for verification step
            // You might want to store this temporarily in your database or session
            const responseData = {
                success: true,
                message: result.message,
                userId: result.userId,
                secret: result.secret
            };
            console.log('Sending response to frontend:', responseData);
            return res.status(200).json(responseData);
        }
        else {
            return res.status(500).json({
                success: false,
                error: result.message,
            });
        }
    }
    catch (error) {
        console.error('Error in sendEmailOTP:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send Email OTP',
        });
    }
};
exports.sendEmailOTP = sendEmailOTP;
const verifyEmailOTP = async (req, res) => {
    try {
        const { userId, secret } = req.body;
        if (!userId || !secret) {
            return res.status(400).json({
                success: false,
                error: 'User ID and secret are required',
            });
        }
        // Use Appwrite's Email OTP verification system
        // The secret from Appwrite contains the OTP, so we use it directly
        const result = await (0, appwriteAuth_1.verifyEmailOTP)(userId, secret);
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                session: result.session,
                appwriteUserId: userId // Return the actual Appwrite user ID
            });
        }
        else {
            return res.status(401).json({
                success: false,
                error: result.message,
            });
        }
    }
    catch (error) {
        console.error('Error verifying Email OTP:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify Email OTP',
        });
    }
};
exports.verifyEmailOTP = verifyEmailOTP;
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, // Only for DB
        role, aadhaar, panCard, emailVerified, appwriteUserId // New field for Appwrite user ID
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
        // Create user in Clerk (with verified email, using backend API)
        let clerkUser;
        try {
            clerkUser = await (0, clerkAdmin_1.createClerkUserWithVerifiedEmail)({
                email,
                password,
                firstName,
                lastName
            });
        }
        catch (clerkError) {
            let errorMessage = clerkError.message || 'Registration with authentication provider failed';
            if (clerkError.errors && Array.isArray(clerkError.errors)) {
                errorMessage = clerkError.errors.map((e) => e.message || JSON.stringify(e)).join(', ');
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
                appwriteId: appwriteUserId, // Store the actual Appwrite user ID
                aadhaar: aadhaar || null,
                pan: panCard || null, // No validation, allow any string
                address: '',
                emailVerified: false // Will be set to true after successful registration
            },
        });
        // Mark email as verified in Clerk (since we use Appwrite for verification)
        try {
            await (0, clerkAdmin_1.markClerkEmailAsVerified)(clerkUser.id);
            console.log('Clerk email marked as verified via backend API');
        }
        catch (error) {
            console.error('Failed to mark Clerk email as verified:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to mark email as verified in Clerk. Please contact support.'
            });
        }
        // Optionally update Appwrite user metadata to keep it in sync
        if (appwriteUserId) {
            try {
                await (0, appwriteAuth_1.updateAppwriteUserMetadata)(appwriteUserId, {
                    firstName,
                    lastName,
                    emailVerified: true
                });
                console.log('Appwrite user metadata updated successfully');
            }
            catch (error) {
                console.error('Failed to update Appwrite user metadata:', error);
                // Don't fail registration if Appwrite metadata update fails
            }
        }
        // Mark email as verified in Appwrite and update database
        if (appwriteUserId) {
            try {
                await (0, appwriteAuth_1.markEmailAsVerified)(appwriteUserId);
                console.log('Appwrite email verified successfully');
                // Update database to mark email as verified
                await prisma.users.update({
                    where: { id: newUser.id },
                    data: { emailVerified: true }
                });
                console.log('Database email verification status updated');
            }
            catch (error) {
                console.error('Failed to mark email as verified in Appwrite:', error);
                // Don't fail registration if Appwrite email verification fails
            }
        }
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
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
        // TODO: Implement Clerk authentication for login if needed, or use Clerk SDK/session middleware on the frontend
        // Remove authenticateClerkUser usage
        // let clerkUser;
        // try {
        //   clerkUser = await authenticateClerkUser({
        //     email: identifier,
        //     password
        //   });
        // } catch (clerkError: any) {
        //   return res.status(401).json({ 
        //     success: false, 
        //     error: 'Invalid credentials or authentication failed.' 
        //   });
        // }
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
    }
    catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid credentials or authentication failed.' });
    }
};
exports.loginUser = loginUser;
const logoutUser = async (req, res) => {
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
                // The original code had deleteAppwriteSession(sessionToken);
                // This function is no longer imported, so it's removed.
                // If Appwrite session deletion is still needed, it must be re-added or handled differently.
                // For now, commenting out to avoid errors.
                // await deleteAppwriteSession(sessionToken); 
                console.log('Appwrite session deletion logic removed as per new imports.');
            }
            catch (error) {
                console.error('Failed to delete Appwrite session:', error);
                // Continue with logout even if Appwrite deletion fails
            }
        }
        else if (clientSessionToken) {
            try {
                // The original code had deleteAppwriteSession(clientSessionToken);
                // This function is no longer imported, so it's removed.
                // If Appwrite client session deletion is still needed, it must be re-added or handled differently.
                // For now, commenting out to avoid errors.
                // await deleteAppwriteSession(clientSessionToken); 
                console.log('Appwrite client session deletion logic removed as per new imports.');
            }
            catch (error) {
                console.error('Failed to delete Appwrite client session:', error);
            }
        }
        else {
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
            ] // List of client-side cookies to clear
        });
    }
    catch (error) {
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
exports.logoutUser = logoutUser;
const checkSession = async (req, res) => {
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
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('Error parsing user cookie:', error);
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }
    }
    catch (error) {
        console.error('Error in checkSession:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to check session'
        });
    }
};
exports.checkSession = checkSession;
