import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const communicationSchema = z.object({
  associateId: z.string(),
  type: z.enum(['EMAIL', 'MEETING', 'CALL', 'NOTE']),
  subject: z.string().min(1),
  content: z.string().min(1),
  date: z.string(), // ISO date string
  createdBy: z.string()
});

// Get all communications for an associate
router.get('/associate/:id', async (req, res) => {
  try {
    const communications = await prisma.associateCommunication.findMany({
      where: { associateId: req.params.id },
      orderBy: { date: 'desc' },
      include: {
        associate: {
          select: { name: true }
        }
      }
    });
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Get recent communications across all associates
router.get('/', async (req, res) => {
  try {
    const { limit = '10', type } = req.query;
    const communications = await prisma.associateCommunication.findMany({
      where: type ? { type: type as any } : undefined,
      take: parseInt(limit as string),
      orderBy: { date: 'desc' },
      include: {
        associate: {
          select: { name: true }
        }
      }
    });
    res.json(communications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Add new communication
router.post('/', validateRequest(communicationSchema), async (req, res) => {
  try {
    const communication = await prisma.associateCommunication.create({
      data: {
        ...req.body,
        date: new Date(req.body.date)
      },
      include: {
        associate: {
          select: { name: true }
        }
      }
    });
    res.status(201).json(communication);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create communication' });
  }
});

// Update communication
router.put('/:id', validateRequest(communicationSchema), async (req, res) => {
  try {
    const communication = await prisma.associateCommunication.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        date: new Date(req.body.date)
      },
      include: {
        associate: {
          select: { name: true }
        }
      }
    });
    res.json(communication);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update communication' });
  }
});

// Delete communication
router.delete('/:id', async (req, res) => {
  try {
    await prisma.associateCommunication.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete communication' });
  }
});

export default router;
