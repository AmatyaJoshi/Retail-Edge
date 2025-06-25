const fs = require('fs');
const path = require('path');

const expensesPath = path.join(__dirname, '../server/prisma/seedData/expenses.json');
const transactionsPath = path.join(__dirname, '../server/prisma/seedData/expenseTransactions.json');

const expenses = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));
const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

const validExpenseIds = new Set(expenses.map(e => e.expenseId));
const cleanedTransactions = transactions.filter(t => validExpenseIds.has(t.expenseId));

console.log(`Original transactions: ${transactions.length}`);
console.log(`Valid transactions: ${cleanedTransactions.length}`);

fs.writeFileSync(transactionsPath, JSON.stringify(cleanedTransactions, null, 2));
console.log('Cleaned transactions written to expenseTransactions.json');
