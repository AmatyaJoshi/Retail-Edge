import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
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

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

/* ROUTES */
app.use("/dashboard", dashboardRoutes); // http://localhost:8000/dashboard
app.use("/products", productRoutes); // http://localhost:8000/products
app.use("/customers", customerRoutes); // http://localhost:8000/customers
app.use("/expenses", expenseRoutes); // http://localhost:8000/expenses
app.use("/prescriptions", prescriptionRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/associates', associatesRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/analytics', analyticsRoutes);

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

const PORT = Number(process.env.PORT) || 8000;
startServer(PORT);