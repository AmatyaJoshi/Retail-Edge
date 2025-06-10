import { Router } from "express";
import { 
  getExpensesByCategory, 
  createExpense, 
  getExpenses, 
  getExpenseById, 
  updateExpense, 
  deleteExpense 
} from "../controllers/expenseController";

const router = Router();

router.get("/by-category", getExpensesByCategory);
router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;