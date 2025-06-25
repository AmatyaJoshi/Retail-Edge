const fs = require('fs');
const path = require('path');

// Read files
const expensesPath = path.join(__dirname, '../server/prisma/seedData/expenses.json');
const transactionsPath = path.join(__dirname, '../server/prisma/seedData/expenseTransactions.json');
const oldCategoriesPath = path.join(__dirname, '../server/prisma/seedData/expenseCategories.json');
const newCategoriesPath = path.join(__dirname, '../server/prisma/seedData/expenseCategories_updated.json');

const expenses = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));
const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
const oldCategories = JSON.parse(fs.readFileSync(oldCategoriesPath, 'utf8'));
const newCategories = JSON.parse(fs.readFileSync(newCategoriesPath, 'utf8'));

// Create a mapping from old category IDs to new category IDs
const categoryIdMap = {};
oldCategories.forEach((oldCat, index) => {
  categoryIdMap[oldCat.categoryId] = newCategories[index].categoryId;
});

// Update the categoryId in expenses
const updatedExpenses = expenses.map(expense => {
  const oldCategoryId = expense.categoryId;
  const newCategoryId = categoryIdMap[oldCategoryId];
  
  return {
    ...expense,
    categoryId: newCategoryId
  };
});

// Update the categoryId in transactions
const updatedTransactions = transactions.map(transaction => {
  const oldCategoryId = transaction.categoryId;
  const newCategoryId = categoryIdMap[oldCategoryId];
  
  return {
    ...transaction,
    categoryId: newCategoryId
  };
});

// Write updated files
fs.writeFileSync(expensesPath, JSON.stringify(updatedExpenses, null, 2));
fs.writeFileSync(transactionsPath, JSON.stringify(updatedTransactions, null, 2));
fs.writeFileSync(oldCategoriesPath, JSON.stringify(newCategories, null, 2));

// Remove the temporary file
fs.unlinkSync(newCategoriesPath);

console.log('Successfully updated all categoryIds to UUID format in all files.');
