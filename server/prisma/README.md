# Prisma Database Management

This folder contains all database-related files for the Retail Edge application.

## Structure

```
prisma/
├── migrations/           # Prisma-managed database migrations
├── schema.prisma        # Main database schema definition
├── seed/                # Database seeding and data management
│   ├── index.ts         # Main seed file (runs all seeding)
│   ├── data/            # JSON data files for seeding
│   └── scripts/         # Individual seeding scripts
├── scripts/             # Database maintenance and utilities
│   ├── maintenance/     # SQL maintenance scripts
│   └── utilities/       # TypeScript utility scripts
└── README.md           # This file
```

## Usage

### Database Schema
- **schema.prisma**: Main database schema definition
- **migrations/**: Auto-generated migration files (don't edit manually)

### Seeding Database
```bash
# Run main seed file
npx prisma db seed

# Run individual seed scripts
npx ts-node prisma/seed/scripts/seedProducts.ts
```

### Database Maintenance
```bash
# Run maintenance scripts
npx ts-node prisma/scripts/utilities/updateDatabase.ts

# Run SQL scripts
psql -d your_database -f prisma/scripts/maintenance/reset_users.sql
```

### Utilities
- **formatPhoneNumbers.ts**: Format phone number data
- **updateDatabase.ts**: Update database structure
- **roundProductPrices.ts**: Round product prices
- **deleteHighStockProducts.ts**: Clean up high stock products

## Seed Data Files
All JSON data files are located in `seed/data/` and include:
- Products, customers, associates
- Expenses, transactions, sales
- Budgets, categories, prescriptions
- And more...

## Maintenance Scripts
SQL scripts in `scripts/maintenance/` for:
- Table resets and updates
- Data cleanup operations
- Schema modifications 