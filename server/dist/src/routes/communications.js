"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const communicationSchema = zod_1.z.object({
    associateId: zod_1.z.string(),
    type: zod_1.z.enum(['EMAIL', 'MEETING', 'CALL', 'NOTE']),
    subject: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    date: zod_1.z.string(), // ISO date string
    createdBy: zod_1.z.string()
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch communications' });
    }
});
// Get recent communications across all associates
router.get('/', async (req, res) => {
    try {
        const { limit = '10', type } = req.query;
        const communications = await prisma.associateCommunication.findMany({
            where: type ? { type: type } : undefined,
            take: parseInt(limit),
            orderBy: { date: 'desc' },
            include: {
                associate: {
                    select: { name: true }
                }
            }
        });
        res.json(communications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch communications' });
    }
});
// Add new communication
router.post('/', (0, validate_1.validateRequest)(communicationSchema), async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create communication' });
    }
});
// Update communication
router.put('/:id', (0, validate_1.validateRequest)(communicationSchema), async (req, res) => {
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
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete communication' });
    }
});
exports.default = router;
