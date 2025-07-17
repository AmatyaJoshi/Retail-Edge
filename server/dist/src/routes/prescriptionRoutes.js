"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescriptionController_1 = require("../controllers/prescriptionController");
const router = (0, express_1.Router)();
// Get all prescriptions for a customer (more specific route)
router.get('/customer/:customerId', prescriptionController_1.getPrescriptionsByCustomer);
// Create a new prescription
router.post('/', prescriptionController_1.createPrescription);
// Update a prescription
router.patch('/:customerId', prescriptionController_1.updatePrescription);
// Get prescription for a customer (less specific route)
router.get('/:customerId', prescriptionController_1.getPrescription);
exports.default = router;
