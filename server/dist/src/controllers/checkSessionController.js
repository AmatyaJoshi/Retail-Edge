"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSession = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Checks if the user has a valid Clerk session and returns the associated user data
 */
const checkSession = async (req, res) => {
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
        // ClerkExpressWithAuth middleware attaches auth info to req.auth
        const auth = req.auth;
        if (auth && auth.userId) {
            const userId = auth.userId;
            // Try to get user from database using the Clerk user ID
            const user = await prisma.users.findFirst({
                where: { clerkId: userId }
            });
            if (user) {
                // Return success with user data from our database
                return res.status(200).json({
                    success: true,
                    message: 'Session valid',
                    user: user
                });
            }
            else {
                // If no user in our database but valid Clerk session, it means the user 
                // is in process of registering and hasn't completed yet
                console.log('Valid Clerk session but user not yet in database - still in registration flow');
                return res.status(200).json({
                    success: true,
                    message: 'Valid Clerk session, but user registration incomplete',
                    registrationIncomplete: true,
                    clerkUserId: userId
                });
            }
        }
        // No valid Clerk session found
        console.log('No valid session found');
        return res.status(401).json({ success: false, message: 'No active session' });
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
