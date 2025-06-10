import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const getExpensesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
      {
        orderBy: {
          date: "desc",
        },
      }
    );
    const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
      (item) => ({
        ...item,
        amount: item.amount.toString(),
      })
    );

    res.json(expenseByCategorySummary);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving expenses by category" });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, amount, date, description } = req.body;
    const newExpense = await prisma.expenses.create({
      data: {
        expenseId: uuidv4(),
        category,
        amount: parseFloat(amount),
        timestamp: new Date(date),
        description: description || null,
      },
    });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: "Error creating expense", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await prisma.expenses.findMany();
    res.json(expenses);
  } catch (error) {
    console.error('Error retrieving expenses:', error);
    res.status(500).json({ message: "Error retrieving expenses", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await prisma.expenses.findUnique({
      where: { expenseId: id },
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.json(expense);
  } catch (error) {
    console.error('Error retrieving expense by ID:', error);
    res.status(500).json({ message: "Error retrieving expense", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, amount, date, description } = req.body;

    const updatedExpense = await prisma.expenses.update({
      where: { expenseId: id },
      data: {
        category: category || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        timestamp: date ? new Date(date) : undefined,
        description: description || undefined,
      },
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: "Error updating expense", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.expenses.delete({
      where: { expenseId: id },
    });

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: "Error deleting expense", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};