"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Clearing all tables...');
        // Helper function to safely delete many
        async function safeDeleteMany(tableName, model) {
            try {
                await model.deleteMany();
                console.log(`Cleared ${tableName}`);
            }
            catch (error) {
                console.warn(`Failed to clear ${tableName}: ${error.message}`);
            }
        }
        // Clear all tables in the correct order (child tables first)
        await safeDeleteMany('AssociateCommunication', prisma.associateCommunication);
        await safeDeleteMany('AssociateContact', prisma.associateContact);
        await safeDeleteMany('AssociateTransactions', prisma.associateTransactions);
        await safeDeleteMany('Document', prisma.document);
        await safeDeleteMany('Contract', prisma.contract);
        await safeDeleteMany('PurchaseOrder', prisma.purchaseOrder);
        await safeDeleteMany('Purchases', prisma.purchases);
        await safeDeleteMany('Sales', prisma.sales);
        await safeDeleteMany('Prescriptions', prisma.prescriptions);
        // Clear budget-related tables using raw SQL to handle potential missing tables
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM "BudgetAllocations"`);
            console.log('Cleared BudgetAllocations');
        }
        catch (error) {
            console.warn(`Failed to clear BudgetAllocations: ${error.message}`);
        }
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM "Budgets"`);
            console.log('Cleared Budgets');
        }
        catch (error) {
            console.warn(`Failed to clear Budgets: ${error.message}`);
        }
        await safeDeleteMany('ExpenseTransactions', prisma.expenseTransactions);
        await safeDeleteMany('PurchaseSummary', prisma.purchaseSummary);
        await safeDeleteMany('SalesSummary', prisma.salesSummary);
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM "ExpenseCategories"`);
            console.log('Cleared ExpenseCategories');
        }
        catch (error) {
            console.warn(`Failed to clear ExpenseCategories: ${error.message}`);
        }
        await safeDeleteMany('Expenses', prisma.expenses);
        await safeDeleteMany('Products', prisma.products);
        await safeDeleteMany('Customers', prisma.customers);
        await safeDeleteMany('Associates', prisma.associates);
        await safeDeleteMany('Users', prisma.users); // Clear Users table
        // Remove Persona table if it exists
        try {
            await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Persona" CASCADE;');
            console.log('Dropped Persona table if it existed.');
        }
        catch (error) {
            console.warn('Could not drop Persona table:', error instanceof Error ? error.message : error);
        }
        console.log('All tables cleared successfully');
        // Read JSON files
        const seedDataPath = path_1.default.join(__dirname, 'seedData');
        const associates = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'associates.json'), 'utf-8'));
        const associateContacts = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'associateContacts.json'), 'utf-8'));
        const associateTransactions = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'associateTransactions.json'), 'utf-8'));
        const associateCommunications = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'associateCommunications.json'), 'utf-8'));
        const documents = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'documents.json'), 'utf-8'));
        const contracts = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'contracts.json'), 'utf-8'));
        const purchaseOrder = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'purchaseOrder.json'), 'utf-8'));
        const purchases = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'purchases.json'), 'utf-8'));
        const sales = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'sales.json'), 'utf-8'));
        const prescriptions = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'prescriptions.json'), 'utf-8'));
        const purchaseSummary = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'purchaseSummary.json'), 'utf-8'));
        const salesSummary = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'salesSummary.json'), 'utf-8'));
        const expenses = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'expenses.json'), 'utf-8'));
        const expenseTransactions = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'expenseTransactions.json'), 'utf-8'));
        const products = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'products.json'), 'utf-8'));
        const customers = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'customers.json'), 'utf-8'));
        // const users = JSON.parse(fs.readFileSync(path.join(seedDataPath, 'users.json'), 'utf-8'));
        // Load new budget-related JSON files
        let expenseCategories = [];
        let budgets = [];
        let budgetAllocations = [];
        try {
            console.log('Loading budget-related JSON files...');
            expenseCategories = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'expenseCategories.json'), 'utf-8'));
            console.log(`Loaded ${expenseCategories.length} expense categories`);
            budgets = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'budgets.json'), 'utf-8'));
            console.log(`Loaded ${budgets.length} budgets`);
            budgetAllocations = JSON.parse(fs_1.default.readFileSync(path_1.default.join(seedDataPath, 'budgetAllocations.json'), 'utf-8'));
            console.log(`Loaded ${budgetAllocations.length} budget allocations`);
        }
        catch (error) {
            console.warn('Some budget files could not be loaded:', error.message);
        }
        console.log('Seeding data...');
        try {
            // Seed tables in the correct order (parent tables first)
            console.log('Seeding Associates...');
            await prisma.associates.createMany({ data: associates });
            console.log('Seeding Customers...');
            await prisma.customers.createMany({ data: customers });
            console.log('Seeding Products...');
            await prisma.products.createMany({ data: products });
            // Seed new budget-related tables
            if (expenseCategories.length > 0) {
                console.log('Seeding ExpenseCategories...');
                // Use prisma.$executeRawUnsafe for direct database access
                for (const category of expenseCategories) {
                    await prisma.$executeRawUnsafe(`INSERT INTO "ExpenseCategories" ("categoryId", "name", "description", "isActive", "displayOrder", "color", "icon", "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, category.categoryId, category.name, category.description || null, category.isActive || true, category.displayOrder || 0, category.color || null, category.icon || null, new Date(category.createdAt || new Date()), // Convert to Date object
                    new Date(category.updatedAt || new Date()) // Convert to Date object
                    );
                }
            }
            console.log('Seeding Expenses...');
            const parsedExpenses = expenses.map((expense) => ({
                ...expense,
                timestamp: new Date(expense.timestamp),
                dueDate: expense.dueDate ? new Date(expense.dueDate) : null,
                lastPaymentDate: expense.lastPaymentDate ? new Date(expense.lastPaymentDate) : null,
                createdAt: new Date(expense.createdAt || new Date()),
                updatedAt: new Date(expense.updatedAt || new Date())
            }));
            await prisma.expenses.createMany({ data: parsedExpenses });
            if (budgets.length > 0) {
                console.log('Seeding Budgets...');
                // Use prisma.$executeRawUnsafe for direct database access
                for (const budget of budgets) {
                    await prisma.$executeRawUnsafe(`INSERT INTO "Budgets" ("budgetId", "categoryId", "name", "description", "amount", "period", "startDate", "endDate", "fiscalYear", "status", "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, budget.budgetId, budget.categoryId, budget.name, budget.description || null, budget.amount, budget.period, new Date(budget.startDate), new Date(budget.endDate), budget.fiscalYear, budget.status || "ACTIVE", new Date(budget.createdAt || new Date()), new Date(budget.updatedAt || new Date()));
                }
            }
            if (budgetAllocations.length > 0) {
                console.log('Seeding BudgetAllocations...');
                // Use prisma.$executeRawUnsafe for direct database access
                for (const allocation of budgetAllocations) {
                    await prisma.$executeRawUnsafe(`INSERT INTO "BudgetAllocations" ("allocationId", "budgetId", "expenseId", "amount", "status", "allocatedAt", "directPayment", "paymentMethod", "paymentReference", "notes", "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, allocation.allocationId, allocation.budgetId, allocation.expenseId, allocation.amount, allocation.status || "PENDING", new Date(allocation.allocatedAt), allocation.directPayment || false, allocation.paymentMethod || null, allocation.paymentReference || null, allocation.notes || null, new Date(allocation.createdAt || new Date()), new Date(allocation.updatedAt || new Date()));
                }
            }
            // Seed User table with sample users
            console.log('Seeding User...');
            await prisma.$executeRawUnsafe(`DELETE FROM "Users"`);
            await prisma.$executeRawUnsafe(`INSERT INTO "Users" ("id", "clerkId", "appwriteId", "email", "emailVerified", "firstName", "lastName", "role", "pan", "aadhaar", "phone", "address", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, 'admin001', 'clerk_001', 'appwrite_001', 'admin@example.com', true, 'Admin', 'User', 'ADMIN', 'ABCDE1234F', '123412341234', '9999999999', // Removed "+" prefix for database storage
            '123 Admin Street', new Date(), new Date());
            await prisma.$executeRawUnsafe(`INSERT INTO "Users" ("id", "clerkId", "appwriteId", "email", "emailVerified", "firstName", "lastName", "role", "pan", "aadhaar", "phone", "address", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, 'user001', 'clerk_002', 'appwrite_002', 'user@example.com', true, 'Regular', 'User', 'USER', 'FGHIJ5678K', '567856785678', '8888888888', // Removed "+" prefix for database storage
            '456 User Avenue', new Date(), new Date());
            // Fix prescription data: replace userId with customerId for prescriptions only
            const prescriptionsWithCustomerId = prescriptions.map((p) => {
                if (p.userId) {
                    p.customerId = p.userId;
                    delete p.userId;
                }
                return p;
            });
            console.log('Seeding Prescriptions...');
            await prisma.prescriptions.createMany({ data: prescriptionsWithCustomerId });
            // Continue with other seeding
            console.log('Seeding ExpenseTransactions...');
            const parsedExpenseTransactions = expenseTransactions.map((transaction) => ({
                ...transaction,
                date: new Date(transaction.date),
                createdAt: new Date(transaction.createdAt),
                updatedAt: new Date(transaction.updatedAt)
            }));
            await prisma.expenseTransactions.createMany({ data: parsedExpenseTransactions });
            console.log('Seeding SalesSummary...');
            await prisma.salesSummary.createMany({ data: salesSummary });
            console.log('Seeding PurchaseSummary...');
            await prisma.purchaseSummary.createMany({ data: purchaseSummary });
            console.log('Seeding Sales...');
            await prisma.sales.createMany({ data: sales });
            console.log('Seeding Purchases...');
            await prisma.purchases.createMany({ data: purchases });
            console.log('Seeding PurchaseOrder...');
            await prisma.purchaseOrder.createMany({ data: purchaseOrder });
            console.log('Seeding Contract...');
            await prisma.contract.createMany({ data: contracts });
            console.log('Seeding Document...');
            await prisma.document.createMany({ data: documents });
            console.log('Seeding Transaction...');
            await prisma.associateTransactions.createMany({ data: associateTransactions });
            console.log('Seeding AssociateContact...');
            await prisma.associateContact.createMany({ data: associateContacts });
            console.log('Seeding AssociateCommunication...');
            await prisma.associateCommunication.createMany({ data: associateCommunications });
            // Seed a default store if none exists
            const existingStore = await prisma.stores.findFirst();
            if (!existingStore) {
                await prisma.stores.create({
                    data: {
                        name: 'Vision Loop Opticals',
                        owner: 'admin001',
                        address: '123 Vision Street, Pune, India',
                        phone: '9898983298',
                        email: 'info@visionloop.com',
                        website: 'https://visionloop.com',
                        logoUrl: '',
                        timezone: 'Asia/Kolkata',
                        currency: 'INR',
                        language: 'en',
                        dateFormat: 'DD/MM/YYYY',
                        numberFormat: '##,##,###.##',
                        gstNumber: '27AAAPL1234C1ZV',
                        taxId: 'TAX123456',
                        invoicePrefix: 'INV-',
                        receiptFooter: 'Thank you for shopping with us!',
                        defaultPaymentMethod: 'cash',
                        taxRate: 8,
                        lowStockThreshold: 5,
                        autoReorder: true,
                        sessionTimeout: 30,
                        enable2FA: false,
                        roleBasedAccess: true,
                        notificationEmail: 'notify@visionloop.com',
                        sendLowStockEmail: false,
                        notes: 'Default store created by seed script.'
                    }
                });
                console.log('Seeded default store.');
            }
            console.log('Seeding complete.');
        }
        catch (error) {
            console.error('Error during seeding:', error.message);
            console.error(error);
            process.exit(1);
        }
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
