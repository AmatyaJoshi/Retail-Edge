"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrescriptionsByCustomer = exports.updatePrescription = exports.createPrescription = exports.getPrescription = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getPrescription = async (req, res) => {
    try {
        const { customerId } = req.params;
        const prescription = await prisma.prescriptions.findFirst({
            where: { customerId: customerId },
            orderBy: { date: 'desc' },
        });
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        res.json(prescription);
    }
    catch (error) {
        console.error('Error fetching prescription:', error);
        res.status(500).json({ message: 'Error fetching prescription' });
    }
};
exports.getPrescription = getPrescription;
const createPrescription = async (req, res) => {
    try {
        const { customerId, date, expiryDate, rightEye, leftEye, doctor, notes } = req.body;
        // Check if customer exists
        const customer = await prisma.customers.findUnique({
            where: { customerId },
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const prescription = await prisma.prescriptions.create({
            data: {
                customerId: customerId,
                date: new Date(date),
                expiryDate: new Date(expiryDate),
                rightEye,
                leftEye,
                doctor,
                notes,
            },
        });
        res.status(201).json(prescription);
    }
    catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ message: 'Error creating prescription' });
    }
};
exports.createPrescription = createPrescription;
const updatePrescription = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { date, expiryDate, rightEye, leftEye, doctor, notes } = req.body;
        const prescription = await prisma.prescriptions.findFirst({
            where: { customerId: customerId },
            orderBy: { date: 'desc' },
        });
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        const updatedPrescription = await prisma.prescriptions.update({
            where: { id: prescription.id },
            data: {
                date: date ? new Date(date) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                rightEye,
                leftEye,
                doctor,
                notes,
            },
        });
        res.json(updatedPrescription);
    }
    catch (error) {
        console.error('Error updating prescription:', error);
        res.status(500).json({ message: 'Error updating prescription' });
    }
};
exports.updatePrescription = updatePrescription;
const getPrescriptionsByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        console.log('Fetching prescriptions for customer:', customerId);
        // Check if customer exists
        const customer = await prisma.customers.findUnique({
            where: { customerId },
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const prescriptions = await prisma.prescriptions.findMany({
            where: { customerId: customerId },
            orderBy: { date: 'desc' },
        });
        res.json(prescriptions);
    }
    catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Error fetching prescriptions' });
    }
};
exports.getPrescriptionsByCustomer = getPrescriptionsByCustomer;
