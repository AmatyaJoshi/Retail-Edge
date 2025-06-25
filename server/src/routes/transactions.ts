import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const transactionSchema = z.object({
  associateId: z.string().min(1),
  type: z.enum(['PURCHASE', 'SALE', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  amount: z.number().positive(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const associateId = req.query.associateId as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const where: any = {
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
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create transaction
router.post('/', validateRequest(transactionSchema), async (req, res) => {
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
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

export default router;
