import { Request, Response } from "express";
import { PrismaClient, TransactionStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.associateTransaction.findMany({
      include: {
        partner: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.associateTransaction.findUnique({
      where: { id },
      include: {
        partner: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { partnerId, type, amount, status, date, dueDate, description, reference } = req.body;

    // Validate required fields
    if (!partnerId || !type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate the associate exists
    const partner = await prisma.associate.findUnique({
      where: { id: partnerId }
    });

    if (!partner) {
      return res.status(404).json({ error: 'Associate not found' });
    }

    const transaction = await prisma.associateTransaction.create({
      data: {
        partnerId,
        type,
        amount: parseFloat(amount),
        status: status || 'PENDING',
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        description,
        reference
      },
      include: {
        partner: true
      }
    });

    // Update associate's current balance
    await prisma.associate.update({
      where: { id: partnerId },
      data: {
        currentBalance: {
          increment: type === 'PURCHASE' ? parseFloat(amount) : -parseFloat(amount)
        }
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, amount, status, date, dueDate, description, reference } = req.body;

    // Get the old transaction to calculate balance adjustment
    const oldTransaction = await prisma.associateTransaction.findUnique({
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
    } else if (type && type !== oldTransaction.type) {
      balanceAdjustment = oldTransaction.amount * 2 * (type === 'PURCHASE' ? 1 : -1);
    }

    const transaction = await prisma.associateTransaction.update({
      where: { id },
      data: {
        type: type || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        status: status || undefined,
        date: date ? new Date(date) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description: description || undefined,
        reference: reference || undefined
      },
      include: {
        partner: true
      }
    });

    // Update associate's balance if there was a change in amount or type
    if (balanceAdjustment !== 0) {
      await prisma.associate.update({
        where: { id: transaction.partnerId },
        data: {
          currentBalance: {
            increment: balanceAdjustment
          }
        }
      });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};
