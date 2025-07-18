import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fileUpload from 'express-fileupload';
import path from 'path';
import cookieParser from 'cookie-parser';
/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import prescriptionRoutes from './routes/prescriptionRoutes';
import salesRoutes from './routes/salesRoutes';
import customerRoutes from './routes/customerRoutes';
import authRoutes from './routes/authRoutes';
import associatesRoutes from './routes/associates';
import communicationsRoutes from './routes/communications';
import contactsRoutes from './routes/contacts';
import transactionsRoutes from './routes/transactions';
import analyticsRoutes from './routes/analytics';
import expenseTransactionsRoutes from './routes/expenseTransactionsRoutes';
import barcodeRoutes from './routes/barcode';
import employeesRoutes from './routes/employees';
import storeRoutes from './routes/storeRoutes';
import aiAssistantRoutes from './routes/aiAssistant';
import productImageRoutes from './routes/productImage';
import userAvatarRoutes from './routes/userAvatar';

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // Add cookie parser middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
}));

// Configure file upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../tmp'),
  createParentPath: true,
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached',
  debug: process.env.NODE_ENV === 'development'
}));

/* API ROUTES - These must come BEFORE static file serving */
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/associates', associatesRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/analytics', analyticsRoutes);
// Register expense transactions routes as part of expenses
app.use("/api/expenses/transactions", expenseTransactionsRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/product-image', productImageRoutes);
app.use('/api/user-avatar', userAvatarRoutes);

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

/* SERVER */
const startServer = async (port: number): Promise<void> => {
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        resolve(undefined);
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}...`);
          server.close();
          startServer(port + 1);
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const PORT = Number(process.env.PORT) || 3001;
startServer(PORT);