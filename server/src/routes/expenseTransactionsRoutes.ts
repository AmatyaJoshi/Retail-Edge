import { Router } from "express";
import { getExpenseTransactions, addExpenseTransaction, getAllExpenseTransactions } from "../controllers/expenseTransactionsController";

const router = Router();

// GET /api/expenses/transactions/all (all transactions)
router.get("/all", getAllExpenseTransactions);
// GET /api/expenses/transactions/:expenseId
router.get("/:expenseId", getExpenseTransactions);
// POST /api/expenses/transactions/:expenseId
router.post("/:expenseId", addExpenseTransaction);

export default router;
