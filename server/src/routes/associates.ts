import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const associateSchema = z.object({
  type: z.enum(['SUPPLIER', 'BUYER', 'BOTH']),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  address: z.string().min(1),
  taxId: z.string().optional(),
  creditLimit: z.number().optional(),
  notes: z.string().optional(),
});

// Get all associates
router.get('/', async (req, res) => {
  try {
    const type = req.query.type as string;
    const search = req.query.search as string;
    
    const where: any = {
      ...(type && type !== 'ALL' ? { type } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const associates = await prisma.associate.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(associates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch associates' });
  }
});

// Get single associate
router.get('/:id', async (req, res) => {
  try {
    const associate = await prisma.associate.findUnique({
      where: { id: req.params.id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!associate) {
      return res.status(404).json({ error: 'Associate not found' });
    }

    res.json(associate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch associate' });
  }
});

// Create associate
router.post('/', validateRequest(associateSchema), async (req, res) => {
  try {
    const associate = await prisma.associate.create({
      data: req.body,
    });
    res.status(201).json(associate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create associate' });
  }
});

// Update associate
router.put('/:id', validateRequest(associateSchema), async (req, res) => {
  try {
    const associate = await prisma.associate.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(associate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update associate' });
  }
});

// Delete associate
router.delete('/:id', async (req, res) => {
  try {
    await prisma.associate.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete associate' });
  }
});

export default router;
