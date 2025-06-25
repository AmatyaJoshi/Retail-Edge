const fs = require('fs');
const path = require('path');

// Read files
const expensesPath = path.join(__dirname, '../server/prisma/seedData/expenses.json');
const transactionsPath = path.join(__dirname, '../server/prisma/seedData/expenseTransactions.json');
const categoriesPath = path.join(__dirname, '../server/prisma/seedData/expenseCategories.json');

const expenses = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));
const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// Create sets for validation
const validCategoryIds = new Set(categories.map(c => c.categoryId));
const validExpenseIds = new Set(expenses.map(e => e.expenseId));

// Validation results
console.log('=== DATA VALIDATION REPORT ===');
console.log(`Total expense categories: ${categories.length}`);
console.log(`Total expenses: ${expenses.length}`);
console.log(`Total transactions: ${transactions.length}`);

// Validate expenses have valid category IDs
const expensesWithInvalidCategoryIds = expenses.filter(e => !validCategoryIds.has(e.categoryId));
console.log(`\nExpenses with invalid category IDs: ${expensesWithInvalidCategoryIds.length}`);
if (expensesWithInvalidCategoryIds.length > 0) {
  console.log(expensesWithInvalidCategoryIds.map(e => e.expenseId));
}

// Validate transactions have valid expense IDs
const transactionsWithInvalidExpenseIds = transactions.filter(t => !validExpenseIds.has(t.expenseId));
console.log(`\nTransactions with invalid expense IDs: ${transactionsWithInvalidExpenseIds.length}`);
if (transactionsWithInvalidExpenseIds.length > 0) {
  console.log(transactionsWithInvalidExpenseIds.map(t => t.id));
}

// Validate transactions have valid category IDs
const transactionsWithInvalidCategoryIds = transactions.filter(t => !validCategoryIds.has(t.categoryId));
console.log(`\nTransactions with invalid category IDs: ${transactionsWithInvalidCategoryIds.length}`);
if (transactionsWithInvalidCategoryIds.length > 0) {
  console.log(transactionsWithInvalidCategoryIds.map(t => t.id));
}

// Check for null values in expenses
const expensesWithNullValues = expenses.filter(e => 
  Object.values(e).some(v => v === null)
);
console.log(`\nExpenses with null values: ${expensesWithNullValues.length}`);
if (expensesWithNullValues.length > 0) {
  console.log(expensesWithNullValues.map(e => e.expenseId));
}

// Check for null values in transactions
const transactionsWithNullValues = transactions.filter(t => 
  Object.values(t).some(v => v === null)
);
console.log(`\nTransactions with null values: ${transactionsWithNullValues.length}`);
if (transactionsWithNullValues.length > 0) {
  console.log(transactionsWithNullValues.map(t => t.id));
}

// Check date distribution (by month)
const expenseMonths = {};
expenses.forEach(e => {
  const month = new Date(e.timestamp).getMonth();
  expenseMonths[month] = (expenseMonths[month] || 0) + 1;
});

console.log('\nExpense date distribution by month:');
for (let i = 0; i < 12; i++) {
  console.log(`Month ${i+1}: ${expenseMonths[i] || 0} expenses`);
}

console.log('\n=== END OF VALIDATION REPORT ===');
