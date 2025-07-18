"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardMetrics = async (req, res) => {
    try {
        // Get date range from query params (default to last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
        console.log("Dashboard Metrics - startDate:", startDate.toISOString());
        console.log("Dashboard Metrics - endDate:", endDate.toISOString());
        // Get total customers count
        const totalCustomers = await prisma.customers.count();
        // Get total products count and inventory value
        const products = await prisma.products.findMany();
        const totalProducts = products.length;
        const inventoryValue = products.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);
        // Get sales data for the period
        const sales = await prisma.sales.findMany({
            // Removing the where clause for debugging timestamp issues
            include: {
                product: true,
            },
        });
        console.log("Dashboard Metrics - Sales fetched:", sales.length, "records.");
        if (sales.length === 0) {
            console.log("No sales data found for the current date range.");
        }
        else {
            console.log("First sales record timestamp:", sales[0].timestamp);
            console.log("Last sales record timestamp:", sales[sales.length - 1].timestamp);
        }
        // Calculate total sales and average order value
        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalOrders = sales.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        // Get popular products by revenue and quantity
        const productSales = sales.reduce((acc, sale) => {
            const productId = sale.productId;
            if (!acc[productId]) {
                acc[productId] = {
                    productId,
                    name: sale.product.name,
                    revenue: 0,
                    quantity: 0,
                };
            }
            acc[productId].revenue += sale.totalAmount;
            acc[productId].quantity += sale.quantity;
            return acc;
        }, {});
        const popularProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 15)
            .map(product => ({
            ...product,
            revenueChange: 0, // TODO: Calculate change from previous period
            quantityChange: 0, // TODO: Calculate change from previous period
        }));
        // Get sales summary by date
        const salesByDate = sales.reduce((acc, sale) => {
            const date = sale.timestamp.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {
                    totalValue: 0,
                    orderCount: 0,
                    customerCount: new Set(),
                };
            }
            acc[date].totalValue += sale.totalAmount;
            acc[date].orderCount += 1;
            if (sale.customerId) {
                acc[date].customerCount.add(sale.customerId);
            }
            return acc;
        }, {});
        const salesSummary = Object.entries(salesByDate).map(([date, data]) => ({
            date,
            totalValue: data.totalValue,
            orderCount: data.orderCount,
            customerCount: data.customerCount.size,
            changePercentage: 0, // TODO: Calculate change from previous period
        }));
        // Get category analysis
        const categoryAnalysis = products.reduce((acc, product) => {
            const category = product.category;
            if (!acc[category]) {
                acc[category] = {
                    category,
                    revenue: 0,
                    quantity: 0,
                    productCount: 0,
                };
            }
            acc[category].revenue += product.price * product.stockQuantity;
            acc[category].quantity += product.stockQuantity;
            acc[category].productCount += 1;
            return acc;
        }, {});
        // Get total dues (sum of all pending purchase orders)
        const totalDues = await prisma.purchaseOrder.aggregate({
            where: {
                status: "PENDING",
            },
            _sum: {
                quantity: true,
            },
        });
        // Get repeat customers count
        const customerOrderCounts = sales.reduce((acc, sale) => {
            if (sale.customerId) {
                acc[sale.customerId] = (acc[sale.customerId] || 0) + 1;
            }
            return acc;
        }, {});
        const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
        const repeatCustomerPercentage = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
        // Get pending orders count
        const pendingOrders = await prisma.purchaseOrder.count({
            where: {
                status: "PENDING",
            },
        });
        res.json({
            totalCustomers,
            totalProducts,
            inventoryValue,
            totalSales,
            totalOrders,
            averageOrderValue,
            popularProducts,
            salesSummary,
            categoryAnalysis: Object.values(categoryAnalysis),
            totalDues: totalDues._sum.quantity || 0,
            repeatCustomerPercentage,
            pendingOrders,
        });
    }
    catch (error) {
        console.error("Error in getDashboardMetrics:", error);
        res.status(500).json({ message: "Error retrieving dashboard metrics" });
    }
};
exports.getDashboardMetrics = getDashboardMetrics;
