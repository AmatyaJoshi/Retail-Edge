const fs = require('fs');
const path = require('path');

// Read the expenseTransactions.json file
const seedDataPath = path.join(__dirname, 'seedData');
const filePath = path.join(seedDataPath, 'expenseTransactions.json');
const expenseTransactions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Clean up the data by removing extra fields
const cleanedTransactions = expenseTransactions.map(transaction => {
  const { 
    id, expenseId, type, amount, paymentMethod, reference, status, 
    date, notes, createdAt, updatedAt 
  } = transaction;
  
  // Only keep the fields we need
  return {
    id, expenseId, type, amount, paymentMethod, reference, status, 
    date, notes, createdAt, updatedAt
  };
});

// Write the cleaned data back to the file
fs.writeFileSync(filePath, JSON.stringify(cleanedTransactions, null, 2), 'utf-8');

console.log(`Cleaned ${expenseTransactions.length} expense transactions`);
