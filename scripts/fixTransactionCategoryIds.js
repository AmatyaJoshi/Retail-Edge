const fs = require('fs');
const path = require('path');

// Read files
const transactionsPath = path.join(__dirname, '../server/prisma/seedData/expenseTransactions.json');
const expensesPath = path.join(__dirname, '../server/prisma/seedData/expenses.json');

const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
const expenses = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));

// Create a mapping of expenseIds to categoryIds
const expenseCategoryMap = {};
expenses.forEach(expense => {
  expenseCategoryMap[expense.expenseId] = expense.categoryId;
});

// Update transactions with correct categoryId from their associated expense
const updatedTransactions = transactions.map(transaction => {
  const expenseId = transaction.expenseId;
  const correctCategoryId = expenseCategoryMap[expenseId];
  
  return {
    ...transaction,
    categoryId: correctCategoryId
  };
});

// Write updated transactions back to file
fs.writeFileSync(transactionsPath, JSON.stringify(updatedTransactions, null, 2));
console.log('Successfully updated all transactions with correct categoryIds from their associated expenses');
