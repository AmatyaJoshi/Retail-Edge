import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPaymentPatterns = async (req: Request, res: Response) => {
  try {
    // This is a simplified example. In a real application, you would have more complex logic to determine on-time vs. late payments.
    const transactions = await prisma.associateTransaction.findMany({
      select: {
        status: true,
        date: true,
      },
    });

    const paymentPatterns = transactions.reduce((acc: Record<string, { name: string; onTime: number; late: number }>, t: { status: string; date: Date }) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { name: month, onTime: 0, late: 0 };
      }
      if (t.status === 'COMPLETED') {
        acc[month].onTime += 1;
      } else if (t.status === 'PENDING') {
        acc[month].late += 1;
      }
      return acc;
    }, {});

    res.json(Object.values(paymentPatterns));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment patterns' });
  }
};

export const getOrderFrequency = async (req: Request, res: Response) => {
  try {
    const orderFrequency = await prisma.associateTransaction.groupBy({
      by: ['partnerId'],
      _count: {
        partnerId: true,
      },
      where: {
        type: 'PURCHASE',
      },
    });

    const associates = await prisma.associate.findMany({
      where: {
        id: {
          in: orderFrequency.map((o: { partnerId: string }) => o.partnerId),
        },
      },
    });

    const associateMap = associates.reduce((acc: Record<string, string>, a: { id: string; name: string }) => {
      acc[a.id] = a.name;
      return acc;
    }, {});

    const result = orderFrequency.map((o: { partnerId: string; _count: { partnerId: number } }) => ({
      name: associateMap[o.partnerId],
      orders: o._count.partnerId,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order frequency' });
  }
};