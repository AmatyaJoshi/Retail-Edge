"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const router = (0, express_1.Router)();
router.get('/payment-patterns', analyticsController_1.getPaymentPatterns);
router.get('/order-frequency', analyticsController_1.getOrderFrequency);
exports.default = router;
