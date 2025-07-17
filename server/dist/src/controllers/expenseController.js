"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpenseCategories = exports.getPendingExpenses = exports.payExpense = exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.getExpenses = exports.createExpense = exports.getExpensesByCategory = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
const getExpensesByCategory = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const whereClause = {};
        if (startDate && endDate) {
            whereClause.timestamp = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (category && category !== 'All') {
            whereClause.categoryId = category;
        }
        // Get all expenses matching the filter
        const expenses = await prisma.expenses.findMany({
            where: whereClause,
            orderBy: {
                timestamp: 'desc',
            },
        });
        // Group by category
        const byCategory = {};
        expenses.forEach((expense) => {
            const cat = expense.categoryId;
            if (!byCategory[cat]) {
                byCategory[cat] = { amount: 0, count: 0, lastDate: expense.timestamp, pendingAmount: 0, pendingCount: 0 };
            }
            byCategory[cat].amount += Number(expense.amount);
            byCategory[cat].count += 1;
            if (expense.timestamp > byCategory[cat].lastDate) {
                byCategory[cat].lastDate = expense.timestamp;
            }
            if (expense.paymentStatus === 'PENDING' || expense.paymentStatus === 'PARTIAL') {
                byCategory[cat].pendingCount += 1;
                byCategory[cat].pendingAmount += (Number(expense.amount) - Number(expense.paidAmount));
            }
        });
        // Format for frontend
        const expenseByCategorySummary = Object.entries(byCategory).map(([cat, data]) => ({
            expenseByCategoryId: `exp_cat_${cat}`,
            category: typeof cat === 'string' ? cat : '',
            amount: data.amount.toString(),
            count: data.count,
            pendingAmount: data.pendingAmount,
            pendingCount: data.pendingCount,
            date: data.lastDate.toISOString(),
            allocated: Math.round(data.amount * 1.2),
            remaining: Math.round(data.amount * 1.2) - data.amount,
            status: 'approved', // Default to approved since we don't have approval logic yet
            totalExpenses: data.count,
            changePercentage: 0, // Placeholder for now
            vendor: 'Default Vendor',
            dueDate: data.lastDate ? data.lastDate.toISOString() : '',
        }));
        res.json(expenseByCategorySummary);
    }
    catch (error) {
        console.error('Error retrieving expenses by category:', error);
        res.status(500).json({ message: "Error retrieving expenses by category" });
    }
};
exports.getExpensesByCategory = getExpensesByCategory;
const createExpense = async (req, res) => {
    try {
        const { category, amount, date, description, vendor, status, dueDate } = req.body;
        if (!category || !amount || !date) {
            res.status(400).json({ message: "Missing required fields: category, amount, date" });
            return;
        }
        // Generate a UUID for the new expense
        const expenseId = (0, uuid_1.v4)();
        // Prepare the date values
        const timestamp = new Date(date);
        // Create expense with fields that exist in the schema
        const newExpense = await prisma.expenses.create({
            data: {
                expenseId,
                category,
                amount: parseFloat(amount),
                timestamp,
                description: description || null
            }
        });
        // Add the additional fields needed by frontend that don't exist in schema
        const formattedExpense = {
            ...newExpense,
            amount: Number(newExpense.amount),
            timestamp: newExpense.timestamp.toISOString(),
            vendor: vendor || 'Unknown Vendor', // Add virtual field for frontend
            dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(), // Add virtual field for frontend
        };
        res.status(201).json(formattedExpense);
    }
    catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: "Error creating expense", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createExpense = createExpense;
const getExpenses = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const whereClause = {};
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        // Use Prisma's findMany to get expenses based on what fields exist in the schema
        const expensesRaw = await prisma.expenses.findMany({
            where: whereClause,
            orderBy: {
                timestamp: 'desc'
            }
        });
        // Transform to ensure frontend gets all expected fields
        const formattedExpenses = expensesRaw.map(expense => ({
            ...expense,
            amount: Number(expense.amount),
            timestamp: expense.timestamp.toISOString(),
            // Add virtual fields needed by frontend but not in schema
            vendor: typeof expense.vendor === 'string' ? expense.vendor : 'Default Vendor',
            dueDate: expense.timestamp ? new Date(expense.timestamp).toISOString() : '',
            category: typeof expense.categoryId === 'string' ? expense.categoryId : '',
            categoryId: typeof expense.categoryId === 'string' ? expense.categoryId : '',
        }));
        res.json(formattedExpenses);
    }
    catch (error) {
        console.error('Error retrieving expenses:', error);
        res.status(500).json({ message: "Error retrieving expenses", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getExpenses = getExpenses;
const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await prisma.expenses.findUnique({
            where: { expenseId: id }
        });
        if (!expense) {
            res.status(404).json({ message: "Expense not found" });
            return;
        }
        // Transform the result to include virtual fields needed by frontend
        const formattedExpense = {
            ...expense,
            amount: Number(expense.amount),
            timestamp: expense.timestamp.toISOString(),
            // Add virtual fields needed by frontend but not in schema
            vendor: typeof expense.vendor === 'string' ? expense.vendor : 'Default Vendor',
            dueDate: expense.timestamp ? new Date(expense.timestamp).toISOString() : '',
            category: typeof expense.categoryId === 'string' ? expense.categoryId : '',
            categoryId: typeof expense.categoryId === 'string' ? expense.categoryId : '',
        };
        res.json(formattedExpense);
    }
    catch (error) {
        console.error('Error retrieving expense by ID:', error);
        res.status(500).json({ message: "Error retrieving expense", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getExpenseById = getExpenseById;
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, date, description, vendor, status, dueDate } = req.body;
        // Verify expense exists
        const expense = await prisma.expenses.findUnique({
            where: { expenseId: id },
        });
        if (!expense) {
            res.status(404).json({ message: "Expense not found" });
            return;
        }
        // Build the SET clause for the SQL query
        let setClauses = [];
        let params = [];
        if (category !== undefined) {
            setClauses.push(`"category" = $${params.length + 1}`);
            params.push(category);
        }
        if (amount !== undefined) {
            setClauses.push(`"amount" = $${params.length + 1}`);
            params.push(parseFloat(amount));
        }
        if (date !== undefined) {
            setClauses.push(`"timestamp" = $${params.length + 1}`);
            params.push(new Date(date));
        }
        if (description !== undefined) {
            setClauses.push(`"description" = $${params.length + 1}`);
            params.push(description);
        }
        if (vendor !== undefined) {
            setClauses.push(`"vendor" = $${params.length + 1}`);
            params.push(vendor);
        }
        if (status !== undefined) {
            setClauses.push(`"status" = $${params.length + 1}`);
            params.push(status);
        }
        if (dueDate !== undefined) {
            setClauses.push(`"dueDate" = $${params.length + 1}`);
            params.push(new Date(dueDate));
        }
        // No fields to update
        if (setClauses.length === 0) {
            res.status(400).json({ message: "No fields to update" });
            return;
        }
        // Add the WHERE clause parameter
        params.push(id);
        // Construct and execute the SQL query
        const sql = `
      UPDATE "Expenses" 
      SET ${setClauses.join(', ')} 
      WHERE "expenseId" = $${params.length}
      RETURNING *
    `;
        const result = await prisma.$queryRawUnsafe(sql, ...params);
        // Transform the result
        const updatedExpense = Array.isArray(result) && result.length > 0
            ? {
                ...result[0],
                amount: Number(result[0].amount),
                timestamp: result[0].timestamp.toISOString(),
                dueDate: result[0].dueDate ? result[0].dueDate.toISOString() : '',
                category: typeof result[0].categoryId === 'string' ? result[0].categoryId : '',
                categoryId: typeof result[0].categoryId === 'string' ? result[0].categoryId : '',
            }
            : {};
        res.status(200).json(updatedExpense);
    }
    catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: "Error updating expense", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expenses.delete({
            where: { expenseId: id },
        });
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: "Error deleting expense", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteExpense = deleteExpense;
const payExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await prisma.expenses.findUnique({
            where: { expenseId: id },
        });
        if (!expense) {
            res.status(404).json({ message: "Expense not found" });
            return;
        }
        // Since we can't update the status field directly via Prisma (it's not in the schema),
        // we'll use a raw query
        await prisma.$executeRaw `
      UPDATE "Expenses" 
      SET "status" = 'approved' 
      WHERE "expenseId" = ${id}
    `;
        // Get the updated expense
        const updatedExpense = await prisma.expenses.findUnique({
            where: { expenseId: id },
        });
        if (!updatedExpense) {
            res.status(404).json({ message: "Updated expense not found" });
            return;
        }
        // Format the response to include fields needed by UI
        const formattedExpense = {
            ...updatedExpense,
            timestamp: updatedExpense.timestamp ? updatedExpense.timestamp.toISOString() : '',
            amount: Number(updatedExpense.amount),
            // Add virtual fields needed by frontend but not in schema
            vendor: typeof updatedExpense.vendor === 'string' ? updatedExpense.vendor : 'Default Vendor',
            dueDate: updatedExpense.timestamp ? new Date(updatedExpense.timestamp).toISOString() : '',
            status: 'approved',
            category: typeof updatedExpense.categoryId === 'string' ? updatedExpense.categoryId : '',
            categoryId: typeof updatedExpense.categoryId === 'string' ? updatedExpense.categoryId : '',
        };
        res.status(200).json(formattedExpense);
    }
    catch (error) {
        console.error('Error paying expense:', error);
        res.status(500).json({ message: "Error paying expense", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.payExpense = payExpense;
const getPendingExpenses = async (req, res) => {
    try {
        // Use raw query to get expenses with pending status, but only select columns that exist
        const expenses = await prisma.$queryRaw `
      SELECT "expenseId", "category", "amount", "timestamp", "description", "status", "budget"
      FROM "Expenses" 
      WHERE "status" = 'pending'
      ORDER BY "timestamp" ASC
    `;
        // Add vendor and dueDate fields for the frontend
        const formattedExpenses = Array.isArray(expenses) ? expenses.map((expense) => {
            return {
                ...expense,
                vendor: typeof expense.vendor === 'string' ? expense.vendor : 'Default Vendor',
                dueDate: expense.timestamp ? new Date(expense.timestamp).toISOString() : '',
                // Convert amount if it's a BigInt
                amount: typeof expense.amount === 'bigint' ? Number(expense.amount) : Number(expense.amount),
                // Include timestamp in ISO format
                timestamp: expense.timestamp ? expense.timestamp.toISOString() : '',
                category: typeof expense.categoryId === 'string' ? expense.categoryId : '',
                categoryId: typeof expense.categoryId === 'string' ? expense.categoryId : '',
            };
        }) : [];
        res.json(formattedExpenses);
    }
    catch (error) {
        console.error('Error retrieving pending expenses:', error);
        res.status(500).json({ message: "Error retrieving pending expenses", error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getPendingExpenses = getPendingExpenses;
const getExpenseCategories = async (req, res) => {
    try {
        const categories = await prisma.expenseCategories.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Error retrieving expense categories:', error);
        res.status(500).json({ message: 'Error retrieving expense categories' });
    }
};
exports.getExpenseCategories = getExpenseCategories;
