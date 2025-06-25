const fs = require('fs');
const path = require('path');

// Read files
const expensesPath = path.join(__dirname, '../server/prisma/seedData/expenses.json');
const categoriesPath = path.join(__dirname, '../server/prisma/seedData/expenseCategories.json');

const expenses = JSON.parse(fs.readFileSync(expensesPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// Create a mapping of category names to categoryIds
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name] = cat.categoryId;
});

// Update expenses with categoryId instead of category name
const updatedExpenses = expenses.map(expense => {
  const currentCategory = expense.category;
  const categoryId = categoryMap[currentCategory];
  
  // Create a new object without the category property
  const { category, ...rest } = expense;
  
  // Return a new object with categoryId instead
  return {
    ...rest,
    categoryId
  };
});

// Write updated expenses back to file
fs.writeFileSync(
  path.join(__dirname, '../server/prisma/seedData/expenses_with_categoryId.json'), 
  JSON.stringify(updatedExpenses, null, 2)
);

console.log('Successfully updated expenses with categoryIds');
