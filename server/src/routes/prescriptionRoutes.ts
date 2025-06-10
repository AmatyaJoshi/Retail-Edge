import { Router } from 'express';
import { getPrescription, createPrescription, updatePrescription, getPrescriptionsByCustomer } from '../controllers/prescriptionController';
import { RequestHandler } from 'express';

const router = Router();

// Get all prescriptions for a customer (more specific route)
router.get('/customer/:customerId', getPrescriptionsByCustomer as RequestHandler);

// Create a new prescription
router.post('/', createPrescription as RequestHandler);

// Update a prescription
router.patch('/:customerId', updatePrescription as RequestHandler);

// Get prescription for a customer (less specific route)
router.get('/:customerId', getPrescription as RequestHandler);

export default router; 