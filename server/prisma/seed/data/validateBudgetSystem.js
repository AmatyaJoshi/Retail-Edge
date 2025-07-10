const fs = require('fs');
const path = require('path');

// Load all data
const expenses = JSON.parse(fs.readFileSync(path.join(__dirname, 'expenses.json'), 'utf8'));
const budgets = JSON.parse(fs.readFileSync(path.join(__dirname, 'budgets.json'), 'utf8'));
const budgetAllocations = JSON.parse(fs.readFileSync(path.join(__dirname, 'budgetAllocations.json'), 'utf8'));
const expenseCategories = JSON.parse(fs.readFileSync(path.join(__dirname, 'expenseCategories.json'), 'utf8'));

console.log(`Loaded ${expenses.length} expenses`);
console.log(`Loaded ${budgets.length} budgets`);
console.log(`Loaded ${budgetAllocations.length} budget allocations`);
console.log(`Loaded ${expenseCategories.length} expense categories`);

// Validate each expense has a valid categoryId
const categoryIds = new Set(expenseCategories.map(category => category.categoryId));
const invalidCategoryExpenses = expenses.filter(expense => !categoryIds.has(expense.categoryId));

if (invalidCategoryExpenses.length > 0) {
    console.error(`Found ${invalidCategoryExpenses.length} expenses with invalid categoryId`);
    invalidCategoryExpenses.forEach(expense => {
        console.error(`- Expense ${expense.expenseId} has invalid categoryId: ${expense.categoryId}`);
    });
} else {
    console.log('All expenses have valid categoryIds ✅');
}

// Validate each budget allocation has a valid budgetId and expenseId
const budgetIds = new Set(budgets.map(budget => budget.budgetId));
const expenseIds = new Set(expenses.map(expense => expense.expenseId));

const invalidBudgetAllocations = budgetAllocations.filter(allocation => 
    !budgetIds.has(allocation.budgetId) || !expenseIds.has(allocation.expenseId)
);

if (invalidBudgetAllocations.length > 0) {
    console.error(`Found ${invalidBudgetAllocations.length} invalid budget allocations`);
    invalidBudgetAllocations.forEach(allocation => {
        if (!budgetIds.has(allocation.budgetId)) {
            console.error(`- Allocation ${allocation.allocationId} has invalid budgetId: ${allocation.budgetId}`);
        }
        if (!expenseIds.has(allocation.expenseId)) {
            console.error(`- Allocation ${allocation.allocationId} has invalid expenseId: ${allocation.expenseId}`);
        }
    });
} else {
    console.log('All budget allocations have valid budgetIds and expenseIds ✅');
}

// Validate budget periods and fiscal years
budgets.forEach(budget => {
    const startYear = new Date(budget.startDate).getFullYear();
    const endYear = new Date(budget.endDate).getFullYear();
    
    if (budget.fiscalYear !== startYear && budget.fiscalYear !== endYear) {
        console.error(`Budget ${budget.budgetId} has fiscal year ${budget.fiscalYear} but covers ${startYear}-${endYear}`);
    }
    
    if (new Date(budget.endDate) < new Date(budget.startDate)) {
        console.error(`Budget ${budget.budgetId} has endDate before startDate`);
    }
});

// Validate budgets have correct categoryIds
const budgetsWithInvalidCategories = budgets.filter(budget => !categoryIds.has(budget.categoryId));
if (budgetsWithInvalidCategories.length > 0) {
    console.error(`Found ${budgetsWithInvalidCategories.length} budgets with invalid categoryId`);
    budgetsWithInvalidCategories.forEach(budget => {
        console.error(`- Budget ${budget.budgetId} has invalid categoryId: ${budget.categoryId}`);
    });
} else {
    console.log('All budgets have valid categoryIds ✅');
}

console.log('Validation complete');
