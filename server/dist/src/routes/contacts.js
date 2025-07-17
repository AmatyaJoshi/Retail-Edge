"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const contactSchema = zod_1.z.object({
    associateId: zod_1.z.string(),
    name: zod_1.z.string().min(1),
    role: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    isPrimary: zod_1.z.boolean().optional()
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});
// Add new contact
router.post('/', (0, validate_1.validateRequest)(contactSchema), async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create contact' });
    }
});
// Update contact
router.put('/:id', (0, validate_1.validateRequest)(contactSchema), async (req, res) => {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});
exports.default = router;
