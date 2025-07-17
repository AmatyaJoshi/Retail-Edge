import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Customers", "Expenses", "Sales", "Prescription", "Customer", "PurchaseOrders"],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),
    getProducts: build.query<Product[], { searchTerm?: string; sortField?: string; sortOrder?: "asc" | "desc"; } | void>({
      query: (params) => ({
        url: "/products",
        params: params || {},
      }),
      providesTags: ["Products"],
    }),
    getProduct: build.query<Product, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: (_result, _error, productId) => [{ type: 'Products', id: productId }],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    getCustomers: build.query<Customer[], void>({
      query: () => '/customers',
      providesTags: ["Customers"],
    }),
    createCustomer: build.mutation<Customer, Partial<Customer>>({
      query: (customer) => ({
        url: '/customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ["Customers"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], {
      startDate?: string;
      endDate?: string;
      category?: string;
    }>({
      query: (params) => ({
        url: "/expenses/by-category",
        params
      }),
      providesTags: ["Expenses"]
    }),
    getExpenses: build.query<Expense[], { categoryId?: string }>({
      query: (params) => ({
        url: "/expenses",
        params
      }),
      providesTags: ["Expenses"]
    }),
    addExpense: build.mutation<Expense, Partial<Expense>>({
      query: (expense) => ({
        url: "/expenses",
        method: "POST",
        body: expense
      }),
      invalidatesTags: ["Expenses"]
    }),
    updateExpense: build.mutation<Expense, { expenseId: string; expense: Partial<Expense> }>({
      query: ({ expenseId, expense }) => ({
        url: `/expenses/${expenseId}`,
        method: "PATCH",
        body: expense
      }),
      invalidatesTags: ["Expenses"]
    }),
    deleteExpense: build.mutation<void, string>({
      query: (expenseId) => ({
        url: `/expenses/${expenseId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Expenses"]
    }),
    getCustomerSales: build.query<Sale[], string>({
      query: (customerId) => `/customers/${customerId}/sales`,
      providesTags: (_result, _error, customerId) => [{ type: 'Sales', id: customerId }],
    }),
    deleteCustomer: build.mutation<void, string>({
      query: (customerId) => ({
        url: `/customers/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Customers"],
    }),
    updateProductStock: build.mutation<Product, { productId: string; stockQuantity: number }>({
      query: ({ productId, stockQuantity }) => ({
        url: `/products/${productId}/stock`,
        method: "PUT",
        body: { stockQuantity },
      }),
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),
    createSale: build.mutation<Sale, NewSale>({
      query: (newSale) => ({
        url: "/sales",
        method: "POST",
        body: newSale,
      }),
      invalidatesTags: ["Sales", "DashboardMetrics"],
    }),
    getPrescription: build.query<Prescription, string>({
      query: (customerId) => `/prescriptions/${customerId}`,
      providesTags: (_result, _error, customerId) => [{ type: 'Prescription', id: customerId }],
    }),
    createPrescription: build.mutation<Prescription, NewPrescription>({
      query: (prescription) => ({
        url: '/prescriptions',
        method: 'POST',
        body: prescription,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: 'Prescription', id: customerId },
        { type: 'Customer', id: customerId },
      ],
    }),
    updatePrescription: build.mutation<Prescription, { customerId: string; prescription: Partial<NewPrescription> }>({
      query: ({ customerId, prescription }) => ({
        url: `/prescriptions/${customerId}`,
        method: 'PATCH',
        body: prescription,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: 'Prescription', id: customerId },
        { type: 'Customer', id: customerId },
      ],
    }),
    getPrescriptionsByCustomer: build.query<Prescription[], string>({
      query: (customerId) => `/prescriptions/customer/${customerId}`,
      providesTags: (_result, _error, _customerId) => [/* ... */],
    }),
    getPurchaseOrders: build.query<PurchaseOrder[], void>({
      query: () => "/products/purchase-orders",
      providesTags: ["PurchaseOrders"],
    }),
    createPurchaseOrder: build.mutation<PurchaseOrder, NewPurchaseOrder>({
      query: (newOrder) => ({
        url: "/products/purchase-orders",
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ["PurchaseOrders", "Products"],
    }),
    updatePurchaseOrderStatus: build.mutation<PurchaseOrder, { orderId: string; status: PurchaseOrder['status'] }>({
      query: ({ orderId, status }) => ({
        url: `/products/purchase-orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PurchaseOrders", "Products"],
    }),
    updateProduct: build.mutation<Product, { productId: string; updates: Partial<Product> | FormData }>({
      query: ({ productId, updates }) => {
        if (updates instanceof FormData) {
          return {
            url: `/products/${productId}`,
            method: "PUT",
            body: updates,
          };
        } else {
          return {
        url: `/products/${productId}`,
        method: "PUT",
        body: updates,
            headers: { 'Content-Type': 'application/json' },
          };
        }
      },
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),
    getPendingExpenses: build.query<Expense[], void>({
      query: () => ({
        url: "/expenses/pending"
      }),
      providesTags: ["Expenses"]
    }),
    payExpense: build.mutation<Expense, string>({
      query: (expenseId) => ({
        url: `/expenses/${expenseId}/pay`,
        method: "POST"
      }),
      invalidatesTags: ["Expenses"]
    }),
    getExpenseTransactions: build.query<ExpenseTransaction[], string>({
      query: (expenseId) => `/expenses/transactions/${expenseId}`,
      providesTags: (result, error, expenseId) => [
        { type: "Expenses", id: expenseId }
      ]
    }),
    addExpenseTransaction: build.mutation<ExpenseTransaction, Omit<ExpenseTransaction, 'id' | 'createdAt' | 'updatedAt'>>({
      query: ({ expenseId, ...transaction }) => ({
        url: `/expenses/${expenseId}/transactions`,
        method: "POST",
        body: transaction
      }),
      invalidatesTags: (result, error, { expenseId }) => [
        { type: "Expenses", id: expenseId },
        "Expenses"
      ]
    }),
    getAllExpenseTransactions: build.query<ExpenseTransaction[], void>({
      query: () => "/expenses/transactions/all",
      providesTags: ["Expenses"]
    }),
    getAllExpenseCategories: build.query<any[], void>({
      query: () => ({
        url: "/expenses/categories"
      }),
      providesTags: ["Expenses"]
    }),
  }),
});

export const apiSlice = api;

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  brand: string;
  rating: number | null;
  sku: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  revenue?: number;
  revenueChange?: number;
  quantity?: number;
  quantityChange?: number;
  barcode?: string; // <-- Added barcode field
}

export interface NewProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  brand: string;
  rating: number;
  sku: string;
  barcode?: string;
  imageUrl?: string;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategoryId: string;
  category: string;
  amount: string;
  count: number;
  pendingAmount?: number;
  pendingCount?: number;
  date: string;
  allocated: number;
  remaining: number;
  status: 'approved' | 'pending' | 'rejected';
  totalExpenses: number;
  changePercentage: number;
  vendor?: string;
  dueDate?: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  popularProducts: {
    productId: string;
    name: string;
    revenue: number;
    quantity: number;
    revenueChange: number;
    quantityChange: number;
  }[];
  salesSummary: {
    date: string;
    totalValue: number;
    orderCount: number;
    customerCount: number;
    changePercentage: number;
  }[];
  categoryAnalysis: {
    category: string;
    revenue: number;
    quantity: number;
    productCount: number;
  }[];
  totalDues: number;
  repeatCustomerPercentage: number;
  pendingOrders: number;
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
}

export interface NewCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface Sale {
  saleId: string;
  productId: string;
  timestamp: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface NewSale {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerId?: string;
}

export interface NewPrescription {
  customerId: string;
  date: string;
  expiryDate: string;
  rightEye: {
    sphere: number;
    cylinder?: number;
    axis?: number;
    add?: number;
    pd?: number;
  };
  leftEye: {
    sphere: number;
    cylinder?: number;
    axis?: number;
    add?: number;
    pd?: number;
  };
  doctor: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  date: string;
  expiryDate: string;
  rightEye: {
    sphere: number;
    cylinder: number;
    axis: number;
    add: number;
    pd: number;
  };
  leftEye: {
    sphere: number;
    cylinder: number;
    axis: number;
    add: number;
    pd: number;
  };
  doctor: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  supplier: string;
  expectedDeliveryDate: string;
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewPurchaseOrder {
  productId: string;
  quantity: number;
  supplier: string;
  expectedDeliveryDate: string;
  notes?: string;
}

export interface Expense {
  expenseId: string;
  category: string;
  amount: number;
  budget: number;
  timestamp: string;
  description?: string;
  vendor?: string;
  status: 'approved' | 'pending' | 'rejected';
  dueDate?: string;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paidAmount: number;
  lastPaymentDate?: string;
  paymentType: 'Subscription' | 'Prepaid' | 'Postpaid';
}

export interface ExpenseTransaction {
  id: string;
  expenseId: string;
  type: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'UPI' | 'Cash';
  reference?: string;
  status: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummaryResponse {
  byCategory: { [key: string]: number };
  byMonth: { [key: string]: number };
  totalExpenses: number;
  averageExpense: number;
}

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useGetExpensesByCategoryQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetCustomerSalesQuery,
  useDeleteCustomerMutation,
  useUpdateProductStockMutation,
  useDeleteProductMutation,
  useCreateSaleMutation,
  useGetPrescriptionQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useGetPrescriptionsByCustomerQuery,
  useGetPurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useUpdateProductMutation,
  useGetPendingExpensesQuery,
  usePayExpenseMutation,
  useGetExpenseTransactionsQuery,
  useAddExpenseTransactionMutation,
  useGetAllExpenseTransactionsQuery,
  useGetAllExpenseCategoriesQuery,
} = api;