"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuyerRanking = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerSales = exports.getCustomerById = exports.getCustomers = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
const getCustomers = async (req, res) => {
    try {
        const customers = await prisma.customers.findMany();
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving customers" });
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await prisma.customers.findUnique({
            where: { customerId },
        });
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.json(customer);
    }
    catch (error) {
        console.error('Error fetching customer by ID:', error);
        res.status(500).json({ message: "Error retrieving customer" });
    }
};
exports.getCustomerById = getCustomerById;
const getCustomerSales = async (req, res) => {
    try {
        const { customerId } = req.params;
        const sales = await prisma.sales.findMany({
            where: {
                customerId,
            },
            orderBy: {
                timestamp: 'desc'
            }
        });
        res.json(sales);
    }
    catch (error) {
        console.error('Error fetching customer sales:', error);
        res.status(500).json({ message: "Error retrieving customer sales" });
    }
};
exports.getCustomerSales = getCustomerSales;
const createCustomer = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        // Validate required fields
        if (!name || !phone) {
            res.status(400).json({ message: "Name and phone are required" });
            return;
        }
        // Validate phone number format (Indian mobile number)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            res.status(400).json({ message: "Invalid phone number format" });
            return;
        }
        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }
        const customerData = {
            customerId: (0, uuid_1.v4)(),
            name,
            phone,
            joinedDate: new Date(),
            ...(email && { email }),
        };
        const newCustomer = await prisma.customers.create({
            data: customerData,
        });
        res.status(201).json(newCustomer);
    }
    catch (error) {
        console.error('Error creating customer:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ message: "Email already exists" });
        }
        else {
            res.status(500).json({ message: "Error creating customer" });
        }
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { name, email, phone } = req.body;
        // Validate required fields
        if (!name || !phone) {
            res.status(400).json({ message: "Name and phone are required" });
            return;
        }
        // Validate phone number format (Indian mobile number)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            res.status(400).json({ message: "Invalid phone number format" });
            return;
        }
        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }
        const updatedCustomer = await prisma.customers.update({
            where: { customerId },
            data: {
                name,
                email,
                phone,
            },
        });
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        console.error('Error updating customer:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ message: "Email already exists or phone number is in use" });
        }
        else {
            res.status(500).json({ message: "Error updating customer" });
        }
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        await prisma.customers.delete({
            where: { customerId },
        });
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: "Error deleting customer" });
    }
};
exports.deleteCustomer = deleteCustomer;
const getBuyerRanking = async (req, res) => {
    try {
        const buyerRanking = await prisma.customers.findMany({
            select: {
                customerId: true,
                name: true,
                _count: {
                    select: { sales: true },
                },
                sales: {
                    select: {
                        totalAmount: true,
                    },
                },
            },
        });
        const rankedBuyers = buyerRanking
            .map((customer) => {
            const totalSpent = customer.sales.reduce((sum, sale) => sum + (sale.totalAmount ? Number(sale.totalAmount) : 0), 0);
            return {
                customerId: customer.customerId,
                name: customer.name,
                purchases: customer._count.sales,
                totalSpent: totalSpent,
            };
        })
            .sort((a, b) => b.totalSpent - a.totalSpent) // Sort by total spent descending
            .map((buyer, index) => ({
            rank: index + 1,
            buyer: buyer.name,
            purchases: buyer.purchases,
            totalSpent: buyer.totalSpent,
        }));
        res.json(rankedBuyers);
    }
    catch (error) {
        console.error('Error fetching buyer ranking:', error);
        res.status(500).json({ message: "Error retrieving buyer ranking" });
    }
};
exports.getBuyerRanking = getBuyerRanking;
