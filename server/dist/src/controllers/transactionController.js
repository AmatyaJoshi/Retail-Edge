"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransaction = exports.createTransaction = exports.getTransactionById = exports.getTransactions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTransactions = async (req, res) => {
    try {
        const transactions = await prisma.associateTransactions.findMany({
            include: {
                associate: true
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.json(transactions);
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
exports.getTransactions = getTransactions;
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await prisma.associateTransactions.findUnique({
            where: { id },
            include: {
                associate: true
            }
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    }
    catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
};
exports.getTransactionById = getTransactionById;
const createTransaction = async (req, res) => {
    try {
        const { associateId, type, amount, status, date, notes } = req.body;
        // Validate required fields
        if (!associateId || !type || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Validate the associate exists
        const associate = await prisma.associates.findUnique({
            where: { associateId }
        });
        if (!associate) {
            return res.status(404).json({ error: 'Associate not found' });
        }
        const transaction = await prisma.associateTransactions.create({
            data: {
                associateId,
                type,
                amount: parseFloat(amount),
                status: status || 'PENDING',
                date: date ? new Date(date) : new Date(),
                notes: notes || undefined
            },
            include: {
                associate: true
            }
        });
        // Update associate's current balance
        await prisma.associates.update({
            where: { associateId },
            data: {
                currentBalance: {
                    increment: type === 'PURCHASE' ? parseFloat(amount) : -parseFloat(amount)
                }
            }
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, amount, status, date, notes } = req.body;
        // Get the old transaction to calculate balance adjustment
        const oldTransaction = await prisma.associateTransactions.findUnique({
            where: { id }
        });
        if (!oldTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        // Calculate balance adjustment
        let balanceAdjustment = 0;
        if (amount && amount !== oldTransaction.amount) {
            const oldImpact = oldTransaction.type === 'PURCHASE' ? oldTransaction.amount : -oldTransaction.amount;
            const newImpact = type === 'PURCHASE' ? parseFloat(amount) : -parseFloat(amount);
            balanceAdjustment = newImpact - oldImpact;
        }
        else if (type && type !== oldTransaction.type) {
            balanceAdjustment = oldTransaction.amount * 2 * (type === 'PURCHASE' ? 1 : -1);
        }
        const transaction = await prisma.associateTransactions.update({
            where: { id },
            data: {
                type: type || undefined,
                amount: amount ? parseFloat(amount) : undefined,
                status: status || undefined,
                date: date ? new Date(date) : undefined,
                notes: notes || undefined
            },
            include: {
                associate: true
            }
        });
        // Update associate's balance if there was a change in amount or type
        if (balanceAdjustment !== 0) {
            await prisma.associates.update({
                where: { associateId: transaction.associateId },
                data: {
                    currentBalance: {
                        increment: balanceAdjustment
                    }
                }
            });
        }
        res.json(transaction);
    }
    catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
};
exports.updateTransaction = updateTransaction;
