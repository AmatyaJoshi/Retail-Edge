import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const transactionSchema = z.object({
  partnerId: z.string().min(1),
  type: z.enum(['PURCHASE', 'SALE']),
  amount: z.number().positive(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const partnerId = req.query.partnerId as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const where: any = {
      ...(partnerId ? { partnerId } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    };

    const transactions = await prisma.associateTransaction.findMany({
      where,
      include: {
        partner: {
          select: {
            name: true,
            type: true,
          },
        },
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
    const transaction = await prisma.associateTransaction.findUnique({
      where: { id: req.params.id },
      include: {
        partner: true,
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
  const { partnerId, amount, type, ...rest } = req.body;

  try {
    // Start a transaction to update both the transaction and partner balance
    const result = await prisma.$transaction(async (tx) => {
      const partner = await tx.associate.findUnique({
        where: { id: partnerId },
      });

      if (!partner) {
        throw new Error('Business partner not found');
      }

      // Update partner's balance
      const balanceChange = type === 'SALE' ? amount : -amount;
      await tx.associate.update({
        where: { id: partnerId },
        data: {
          currentBalance: {
            increment: balanceChange,
          },
        },
      });

      // Create the transaction
      const transaction = await tx.associateTransaction.create({
        data: {
          partnerId,
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
    const transaction = await prisma.associateTransaction.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

export default router;
