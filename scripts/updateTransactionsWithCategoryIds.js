const fs = require('fs');
const path = require('path');

// Read files
const transactionsPath = path.join(__dirname, '../server/prisma/seedData/expenseTransactions.json');
const categoriesPath = path.join(__dirname, '../server/prisma/seedData/expenseCategories.json');

const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// Create a mapping of category names to categoryIds
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name] = cat.categoryId;
});

// Update transactions with categoryId instead of category name
const updatedTransactions = transactions.map(transaction => {
  const currentCategory = transaction.category;
  const categoryId = categoryMap[currentCategory];
  
  // Create a new object without the category property
  const { category, ...rest } = transaction;
  
  // Return a new object with categoryId instead
  return {
    ...rest,
    categoryId
  };
});

// Write updated transactions back to file
fs.writeFileSync(
  path.join(__dirname, '../server/prisma/seedData/expenseTransactions_with_categoryId.json'), 
  JSON.stringify(updatedTransactions, null, 2)
);

console.log('Successfully updated transactions with categoryIds');
