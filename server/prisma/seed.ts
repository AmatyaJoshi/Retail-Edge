import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Deletion order: child tables first, then parent tables
const deletionOrder = [
  "sales.json",
  "purchaseOrder.json",
  "purchases.json",
  "expenseByCategory.json",
  "expenseSummary.json",
  "salesSummary.json",
  "purchaseSummary.json",
  "prescriptions.json",
  "customers.json",
  "expenses.json",
  "products.json"
];

// Seeding order: parent tables first, then child tables
const seedingOrder = [
  "products.json",
  "customers.json",
  "expenses.json",
  "expenseSummary.json",
  "expenseByCategory.json",
  "salesSummary.json",
  "purchaseSummary.json",
  "sales.json",
  "purchases.json",
  "prescriptions.json"
];

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    // Special case for users.json -> Users model
    if (modelName === 'users') return 'Users';
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // First delete all existing data
  await deleteAllData(deletionOrder);

  // Then seed data in the correct order
  for (const fileName of seedingOrder) {
    const filePath = path.join(dataDirectory, fileName);
    if (!fs.existsSync(filePath)) continue;
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Get model name from filename (remove .json extension)
    const modelName = path.basename(fileName, '.json');

    // Convert model name to Prisma model name
    let prismaModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    if (modelName === 'prescriptions') prismaModelName = 'Prescriptions';

    // Get the Prisma model
    const model = (prisma as any)[prismaModelName];

    if (!model) {
      console.error(`Model ${prismaModelName} not found in Prisma schema`);
      continue;
    }

    // Handle array of data
    if (Array.isArray(data)) {
      for (const item of data) {
        try {
          // Special handling for prescriptions
          if (modelName === 'prescriptions') {
            await prisma.prescriptions.create({
              data: {
                ...item,
                date: new Date(item.date),
                expiryDate: new Date(item.expiryDate),
                rightEye: item.rightEye,
                leftEye: item.leftEye,
              },
            });
          } else if (modelName === 'sales') {
            await prisma.sales.create({
              data: {
                ...item,
                timestamp: new Date(item.timestamp)
              }
            });
          } else if (modelName === 'customers') {
            await prisma.customers.create({
              data: {
                ...item,
                joinedDate: new Date(item.joinedDate)
              }
            });
          } else {
            // Handle other models
            const { changePercentage, percentage, prescription, ...cleanData } = item;
            
            // Convert amount to BigInt for ExpenseByCategory
            if (modelName === 'expenseByCategory') {
              cleanData.amount = BigInt(cleanData.amount);
              if (!cleanData.date) {
                cleanData.date = new Date();
              }
            }

            await model.create({
              data: cleanData,
            });
          }
        } catch (error) {
          console.error(`Error creating ${modelName} record:`, error);
        }
      }
    }

    console.log(`Seeded ${prismaModelName} with data from ${fileName}`);
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });