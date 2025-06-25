import { Request, Response } from "express";
import { PrismaClient, Prisma, ExpenseTransactions } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

type ExpenseTransactionInput = {
  expenseId: string;
  type: "EXPENSE";
  amount: number;
  date: Date;
  paymentMethod: string;
  reference: string;
  notes: string;
  status: "COMPLETED";
};

type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

// GET /api/expenses/:expenseId/transactions
export const getExpenseTransactions = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  try {
    // Check if the expense exists
    const expense = await prisma.expenses.findUnique({
      where: { expenseId }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Get the transactions for this expense
    const transactions = await prisma.expenseTransactions.findMany({
      where: { expenseId },
      orderBy: { date: "desc" },
    });
    
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching expense transactions:", error);
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

// POST /api/expenses/:expenseId/transactions
export const addExpenseTransaction = async (req: Request, res: Response) => {
  const { expenseId } = req.params;
  const { amount, date, paymentMethod, notes } = req.body;
  
  try {
    // Check if the expense exists
    const expense = await prisma.expenses.findUnique({
      where: { expenseId }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount. Amount must be a positive number." });
    }

    // Generate a unique reference on the backend
    const reference = `TXN-${uuidv4().split('-')[0].toUpperCase()}`;

    // Create the transaction data
    const transactionData: ExpenseTransactionInput = {
      expenseId,
      type: "EXPENSE",
      amount: parsedAmount,
      date: new Date(date),
      paymentMethod,
      reference,
      notes: notes || "",
      status: "COMPLETED"
    };

    // Create the transaction
    const transaction = await prisma.expenseTransactions.create({
      data: transactionData
    });
    
    // Update the expense payment info
    const allTransactions = await prisma.expenseTransactions.findMany({ 
      where: { 
        expenseId,
        status: "COMPLETED"
      } 
    });
    
    const totalPaid = allTransactions.reduce((sum: number, p: ExpenseTransactions) => sum + Number(p.amount), 0);
    
    let paymentStatus: PaymentStatus = "PARTIAL";
    if (totalPaid >= Number(expense.amount)) {
      paymentStatus = "PAID";
    } else if (totalPaid === 0) {
      paymentStatus = "PENDING";
    }
    
    await prisma.expenses.update({
      where: { expenseId },
      data: {
        paidAmount: totalPaid,
        paymentStatus,
        lastPaymentDate: new Date(date),
      },
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Error adding transaction", error });
  }
};

// GET /api/expenses/transactions
export const getAllExpenseTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.expenseTransactions.findMany({
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching all expense transactions:", error);
    res.status(500).json({ message: "Error fetching all transactions", error });
  }
};
