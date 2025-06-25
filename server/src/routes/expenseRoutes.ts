import { Router } from "express";
import { 
  getExpensesByCategory, 
  createExpense, 
  getExpenses, 
  getExpenseById, 
  updateExpense, 
  deleteExpense,
  payExpense,
  getPendingExpenses,
  getExpenseCategories
} from "../controllers/expenseController";

const router = Router();

// Base routes
router.get("/by-category", getExpensesByCategory);
router.get("/pending", getPendingExpenses);
router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/categories", getExpenseCategories);

// Single expense routes
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.post("/:id/pay", payExpense);

export default router;