"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssociateAnalytics = exports.getOrderFrequency = exports.getPaymentPatterns = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getPaymentPatterns = async (req, res) => {
    try {
        // This is a simplified example. In a real application, you would have more complex logic to determine on-time vs. late payments.
        const transactions = await prisma.associateTransactions.findMany({
            select: {
                status: true,
                date: true,
            },
        });
        const paymentPatterns = transactions.reduce((acc, t) => {
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            if (!acc[month]) {
                acc[month] = { name: month, onTime: 0, late: 0 };
            }
            if (t.status === 'COMPLETED') {
                acc[month].onTime += 1;
            }
            else if (t.status === 'PENDING') {
                acc[month].late += 1;
            }
            return acc;
        }, {});
        res.json(Object.values(paymentPatterns));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment patterns' });
    }
};
exports.getPaymentPatterns = getPaymentPatterns;
const getOrderFrequency = async (req, res) => {
    try {
        const orderFrequency = await prisma.associateTransactions.groupBy({
            by: ['associateId'],
            _count: {
                associateId: true,
            },
            where: {
                type: 'PURCHASE',
            },
        });
        const associates = await prisma.associates.findMany({
            where: {
                associateId: {
                    in: orderFrequency.map((o) => o.associateId),
                },
            },
        });
        const associateMap = associates.reduce((acc, a) => {
            acc[a.associateId] = a.name;
            return acc;
        }, {});
        const result = orderFrequency.map((o) => ({
            name: associateMap[o.associateId],
            orders: o._count.associateId,
        }));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch order frequency' });
    }
};
exports.getOrderFrequency = getOrderFrequency;
const getAssociateAnalytics = async (associateId) => {
    try {
        const associate = await prisma.associates.findUnique({
            where: { associateId },
            include: {
                transactions: true,
                purchaseOrders: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!associate) {
            throw new Error('Associate not found');
        }
        // --- Payment Patterns ---
        const paymentPatterns = associate.transactions.map((t) => ({
            date: t.date,
            amount: t.amount,
            type: t.type,
            status: t.status
        }));
        // --- Order Frequency ---
        let orderFrequency = 'N/A';
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (associate.type === "BUYER" || associate.type === "BOTH") {
            const salesCount = await prisma.sales.count({
                where: {
                    customerId: associateId,
                    timestamp: {
                        gte: thirtyDaysAgo.toISOString(),
                    },
                },
            });
            orderFrequency = `${salesCount} orders in last 30 days`;
        }
        else if (associate.type === "SUPPLIER") {
            const purchaseOrderCount = await prisma.purchaseOrder.count({
                where: {
                    associateId: associateId,
                    createdAt: {
                        gte: thirtyDaysAgo.toISOString(),
                    },
                },
            });
            orderFrequency = `${purchaseOrderCount} purchase orders in last 30 days`;
        }
        // --- Product Preferences ---
        let productPreferences = 'N/A';
        if (associate.type === "BUYER" || associate.type === "BOTH") {
            const salesWithProducts = await prisma.sales.findMany({
                where: { customerId: associateId },
                include: { product: true },
            });
            const productSalesMap = {};
            salesWithProducts.forEach(sale => {
                if (sale.product) {
                    productSalesMap[sale.product.name] = (productSalesMap[sale.product.name] || 0) + sale.totalAmount;
                }
            });
            const topProduct = Object.entries(productSalesMap).sort(([, amountA], [, amountB]) => amountB - amountA)[0];
            if (topProduct) {
                productPreferences = `${topProduct[0]} (Total Sales: ₹${topProduct[1].toLocaleString('en-IN')})`;
            }
        }
        else if (associate.type === "SUPPLIER") {
            const productSupplyMap = {};
            associate.purchaseOrders.forEach(po => {
                if (po.product) {
                    productSupplyMap[po.product.name] = (productSupplyMap[po.product.name] || 0) + (po.quantity * po.product.price);
                }
            });
            const topProduct = Object.entries(productSupplyMap).sort(([, amountA], [, amountB]) => amountB - amountA)[0];
            if (topProduct) {
                productPreferences = `${topProduct[0]} (Total Supply: ₹${topProduct[1].toLocaleString('en-IN')})`;
            }
        }
        // --- Credit Utilization ---
        const creditLimit = associate.creditLimit || 0;
        const currentBalance = associate.currentBalance || 0;
        const creditUtilization = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
        // --- YoY Growth (Placeholder) ---
        // Requires historical data spanning multiple years, which is not readily available in current seed.
        const yoYGrowth = 'N/A';
        const analyticsResult = {
            paymentPatterns,
            orderFrequency,
            productPreferences,
            creditUtilization,
            yoYGrowth,
        };
        return analyticsResult;
    }
    catch (error) {
        console.error('Error fetching associate analytics:', error);
        throw error;
    }
};
exports.getAssociateAnalytics = getAssociateAnalytics;
