import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const contactSchema = z.object({
  associateId: z.string(),
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isPrimary: z.boolean().optional()
});

// Get all contacts for an associate
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.associateContact.findMany({
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ]
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Add new contact
router.post('/', validateRequest(contactSchema), async (req, res) => {
  const { associateId, isPrimary, ...data } = req.body;

  try {
    // If this contact is primary, unset primary for all other contacts
    if (isPrimary) {
      await prisma.associateContact.updateMany({
        where: { associateId },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.associateContact.create({
      data: {
        associateId,
        isPrimary: isPrimary || false,
        ...data
      }
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', validateRequest(contactSchema), async (req, res) => {
  const { id } = req.params;
  const { associateId, isPrimary, ...data } = req.body;

  try {
    // If this contact is being set as primary, unset primary for all other contacts
    if (isPrimary) {
      await prisma.associateContact.updateMany({
        where: {
          associateId,
          id: { not: id }
        },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.associateContact.update({
      where: { id },
      data: {
        isPrimary: isPrimary || false,
        ...data
      }
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await prisma.associateContact.delete({
      where: { id: req.params.id }
    });

    // If this was a primary contact, set the first remaining contact as primary
    if (contact.isPrimary) {
      const firstContact = await prisma.associateContact.findFirst({
        where: { associateId: contact.associateId }
      });

      if (firstContact) {
        await prisma.associateContact.update({
          where: { id: firstContact.id },
          data: { isPrimary: true }
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
