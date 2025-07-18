"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
/* ROUTE IMPORTS */
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const prescriptionRoutes_1 = __importDefault(require("./routes/prescriptionRoutes"));
const salesRoutes_1 = __importDefault(require("./routes/salesRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const associates_1 = __importDefault(require("./routes/associates"));
const communications_1 = __importDefault(require("./routes/communications"));
const contacts_1 = __importDefault(require("./routes/contacts"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const expenseTransactionsRoutes_1 = __importDefault(require("./routes/expenseTransactionsRoutes"));
const barcode_1 = __importDefault(require("./routes/barcode"));
const employees_1 = __importDefault(require("./routes/employees"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const aiAssistant_1 = __importDefault(require("./routes/aiAssistant"));
const productImage_1 = __importDefault(require("./routes/productImage"));
const userAvatar_1 = __importDefault(require("./routes/userAvatar"));
/* CONFIGURATIONS */
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)()); // Add cookie parser middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Set-Cookie']
}));
// Configure file upload middleware
app.use((0, express_fileupload_1.default)({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
    useTempFiles: true,
    tempFileDir: path_1.default.join(__dirname, '../tmp'),
    createParentPath: true,
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached',
    debug: process.env.NODE_ENV === 'development'
}));
/* MIDDLEWARES */
// Middleware to check for initial session and set cookie
app.use((req, res, next) => {
    // Skip for API and static routes
    if (req.path.startsWith('/api') ||
        req.path.startsWith('/_next') ||
        req.path.includes('.')) {
        return next();
    }
    // Check if this is an initial session
    if (!req.cookies['initial_session']) {
        // Set initial_session cookie
        res.cookie('initial_session', 'true', {
            httpOnly: false, // Allow client middleware to access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });
        // Only redirect if not already going to login
        if (!req.path.includes('/auth/login') && !req.path.startsWith('/api')) {
            console.log('First-time visitor, redirecting to login');
            return res.redirect('/auth/login');
        }
    }
    next();
});
/* ROUTES */
app.use("/api/dashboard", dashboardRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/customers", customerRoutes_1.default);
app.use("/api/expenses", expenseRoutes_1.default);
app.use("/api/prescriptions", prescriptionRoutes_1.default);
app.use('/api/sales', salesRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/associates', associates_1.default);
app.use('/api/communications', communications_1.default);
app.use('/api/contacts', contacts_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/analytics', analytics_1.default);
// Register expense transactions routes as part of expenses
app.use("/api/expenses/transactions", expenseTransactionsRoutes_1.default);
app.use('/api/barcode', barcode_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/store', storeRoutes_1.default);
app.use('/api/ai-assistant', aiAssistant_1.default);
app.use('/api/product-image', productImage_1.default);
app.use('/api/user-avatar', userAvatar_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});
/* SERVER */
const startServer = async (port) => {
    try {
        await new Promise((resolve, reject) => {
            const server = app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
                resolve(undefined);
            });
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.log(`Port ${port} is busy, trying ${port + 1}...`);
                    server.close();
                    startServer(port + 1);
                }
                else {
                    reject(error);
                }
            });
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
const PORT = Number(process.env.PORT) || 3001;
startServer(PORT);
