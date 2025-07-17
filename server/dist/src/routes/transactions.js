"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const transactionSchema = zod_1.z.object({
    associateId: zod_1.z.string().min(1),
    type: zod_1.z.enum(['PURCHASE', 'SALE', 'CREDIT_NOTE', 'DEBIT_NOTE']),
    amount: zod_1.z.number().positive(),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
});
// Get all transactions
router.get('/', async (req, res) => {
    try {
        const associateId = req.query.associateId;
        const type = req.query.type;
        const status = req.query.status;
        const where = {
            ...(associateId ? { associateId } : {}),
            ...(type ? { type } : {}),
            ...(status ? { status } : {}),
        };
        const transactions = await prisma.associateTransactions.findMany({
            where,
            include: {
                associate: true
            },
            orderBy: { date: 'desc' },
        });
        res.json(transactions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});
// Get single transaction
router.get('/:id', async (req, res) => {
    try {
        const transaction = await prisma.associateTransactions.findUnique({
            where: { id: req.params.id },
            include: {
                associate: true
            },
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});
// Create transaction
router.post('/', (0, validate_1.validateRequest)(transactionSchema), async (req, res) => {
    const { associateId, amount, type, ...rest } = req.body;
    try {
        // Start a transaction to update both the transaction and partner balance
        const result = await prisma.$transaction(async (tx) => {
            const partner = await tx.associates.findUnique({
                where: { associateId },
            });
            if (!partner) {
                throw new Error('Business partner not found');
            }
            // Update partner's balance
            const balanceChange = type === 'SALE' ? amount : -amount;
            await tx.associates.update({
                where: { associateId },
                data: {
                    currentBalance: {
                        increment: balanceChange,
                    },
                },
            });
            // Create the transaction
            const transaction = await tx.associateTransactions.create({
                data: {
                    associateId,
                    amount,
                    type,
                    ...rest,
                },
            });
            return transaction;
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});
// Update transaction status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!status || !['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const transaction = await prisma.associateTransactions.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(transaction);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update transaction status' });
    }
});
exports.default = router;
