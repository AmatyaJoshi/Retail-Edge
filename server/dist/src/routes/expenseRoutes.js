"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseController_1 = require("../controllers/expenseController");
const router = (0, express_1.Router)();
// Base routes
router.get("/by-category", expenseController_1.getExpensesByCategory);
router.get("/pending", expenseController_1.getPendingExpenses);
router.post("/", expenseController_1.createExpense);
router.get("/", expenseController_1.getExpenses);
router.get("/categories", expenseController_1.getExpenseCategories);
// Single expense routes
router.get("/:id", expenseController_1.getExpenseById);
router.patch("/:id", expenseController_1.updateExpense);
router.delete("/:id", expenseController_1.deleteExpense);
router.post("/:id/pay", expenseController_1.payExpense);
exports.default = router;
