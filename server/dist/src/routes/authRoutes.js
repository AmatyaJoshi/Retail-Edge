"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const checkSessionController_1 = require("../controllers/checkSessionController");
const client_1 = require("@prisma/client");
const appwriteDiagnostics_1 = require("../lib/appwriteDiagnostics");
const azureBlob_1 = require("../lib/azureBlob");
const path_1 = __importDefault(require("path"));
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Diagnostic route for Appwrite configuration
router.get('/diagnose-appwrite', async (req, res) => {
    try {
        console.log('Running Appwrite diagnostics...');
        const result = await (0, appwriteDiagnostics_1.diagnoseAppwriteConfiguration)();
        if (result) {
            res.json({ success: true, message: 'Appwrite configuration is working correctly' });
        }
        else {
            res.status(500).json({ success: false, message: 'Appwrite configuration has issues. Check server logs for details.' });
        }
    }
    catch (error) {
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
        const result = await (0, appwriteDiagnostics_1.testEmailOTPFlow)(email);
        if (result && typeof result === 'object' && result.success) {
            res.json({
                success: true,
                message: 'Email OTP test successful',
                userId: result.userId,
                secretLength: result.secret ? result.secret.length : 0
            });
        }
        else {
            res.status(500).json({ success: false, message: 'Email OTP test failed. Check server logs for details.' });
        }
    }
    catch (error) {
        console.error('Error testing Email OTP:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// Email authentication routes
router.post('/send-email-otp', authController_1.sendEmailOTP);
router.post('/verify-email-otp', authController_1.verifyEmailOTP);
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.post('/logout', authController_1.logoutUser);
router.get('/check-session', (0, clerk_sdk_node_1.ClerkExpressWithAuth)(), checkSessionController_1.checkSession);
// Get user role by clerkId
router.get('/user-role', async (req, res) => {
    try {
        const { clerkId } = req.query;
        if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }
        const user = await prisma.users.findUnique({
            where: { clerkId: clerkId },
            select: { role: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ role: user.role });
    }
    catch (error) {
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
            where: { clerkId: clerkId },
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
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH user profile by id
router.patch('/user-profile', async (req, res) => {
    try {
        let { id, phone, address, photoUrl } = req.body;
        // Fetch the current user to get the old photoUrl
        const currentUser = await prisma.users.findUnique({ where: { id } });
        // Handle avatar file upload if present
        if (req.files && req.files.avatar) {
            // Delete old avatar if it exists
            if (currentUser && currentUser.photoUrl) {
                await (0, azureBlob_1.deleteFromAzureByUrl)(currentUser.photoUrl);
            }
            const file = req.files.avatar;
            if (!file.mimetype.startsWith('image/')) {
                return res.status(400).json({ error: 'Only image files are allowed for avatar' });
            }
            const ext = path_1.default.extname(file.name);
            const fileName = `user-avatar-${id}-${Date.now()}${ext}`;
            // Use tempFilePath since express-fileupload is configured with useTempFiles: true
            photoUrl = await (0, azureBlob_1.uploadToAzure)('user-avatars', file.tempFilePath, fileName, file.mimetype);
        }
        if (!id) {
            return res.status(400).json({ error: 'id is required' });
        }
        const updatedUser = await prisma.users.update({
            where: { id },
            data: { phone, address, photoUrl },
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
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
