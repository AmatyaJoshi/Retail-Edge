const fs = require('fs');
const path = require('path');

// Load the expenses data
const expensesFilePath = path.join(__dirname, 'prisma', 'seedData', 'expenses.json');
const expenses = JSON.parse(fs.readFileSync(expensesFilePath, 'utf8'));

// Update each expense to include createdAt and updatedAt
expenses.forEach(expense => {
  if (!expense.createdAt) {
    // Use the timestamp as the createdAt date
    expense.createdAt = expense.timestamp;
    
    // Use lastPaymentDate as updatedAt if it exists, otherwise use timestamp
    expense.updatedAt = expense.lastPaymentDate || expense.timestamp;
  }
});

// Write the updated data back to the file
fs.writeFileSync(
  expensesFilePath, 
  JSON.stringify(expenses, null, 2),
  'utf8'
);

console.log('Added createdAt and updatedAt fields to all expenses');
