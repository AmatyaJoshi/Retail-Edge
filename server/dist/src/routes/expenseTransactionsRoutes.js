"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseTransactionsController_1 = require("../controllers/expenseTransactionsController");
const router = (0, express_1.Router)();
// GET /api/expenses/transactions/all (all transactions)
router.get("/all", expenseTransactionsController_1.getAllExpenseTransactions);
// GET /api/expenses/transactions/:expenseId
router.get("/:expenseId", expenseTransactionsController_1.getExpenseTransactions);
// POST /api/expenses/transactions/:expenseId
router.post("/:expenseId", expenseTransactionsController_1.addExpenseTransaction);
exports.default = router;
