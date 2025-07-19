export const API_ENDPOINTS = {
  base: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',
  products: '/api/products',
  customers: '/api/customers',
  transactions: '/api/transactions',
  sales: '/api/sales',
  prescriptions: '/api/prescriptions',
  categories: '/api/categories',
  inventory: '/api/inventory',
  reports: '/api/reports',
  auth: '/api/auth',
  settings: '/api/settings',
  expenses: '/api/expenses',
}; 