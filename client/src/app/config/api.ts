export const API_ENDPOINTS = {
  base: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  products: '/products',
  customers: '/customers',
  transactions: '/transactions',
  sales: '/sales',
  prescriptions: '/prescriptions',
  categories: '/categories',
  inventory: '/inventory',
  reports: '/reports',
  auth: '/auth',
  settings: '/settings',
  expenses: '/expenses',
}; 