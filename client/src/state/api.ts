import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
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
        params: params || undefined,
      }),
      providesTags: ["Products"],
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
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    getCustomerSales: build.query<Sale[], string>({
      query: (customerId) => `/customers/${customerId}/sales`,
      providesTags: (result, error, customerId) => [{ type: 'Sales', id: customerId }],
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
        method: "PATCH",
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
      query: (customerId) => `api/prescriptions/${customerId}`,
      providesTags: (result, error, customerId) => [{ type: 'Prescription', id: customerId }],
    }),
    createPrescription: build.mutation<Prescription, NewPrescription>({
      query: (prescription) => ({
        url: 'api/prescriptions',
        method: 'POST',
        body: prescription,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Prescription', id: customerId },
        { type: 'Customer', id: customerId },
      ],
    }),
    updatePrescription: build.mutation<Prescription, { customerId: string; prescription: Partial<NewPrescription> }>({
      query: ({ customerId, prescription }) => ({
        url: `api/prescriptions/${customerId}`,
        method: 'PATCH',
        body: prescription,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'Prescription', id: customerId },
        { type: 'Customer', id: customerId },
      ],
    }),
    getPrescriptionsByCustomer: build.query<Prescription[], string>({
      query: (customerId) => `api/prescriptions/customer/${customerId}`,
      providesTags: (result, error, customerId) =>
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Prescription' as const, id })),
              { type: 'Prescription', id: 'LIST' },
            ]
          : [{ type: 'Prescription', id: 'LIST' }],
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
    updateProduct: build.mutation<Product, { productId: string; updates: Partial<Product> }>({
      query: ({ productId, updates }) => ({
        url: `/products/${productId}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Products", "DashboardMetrics"],
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
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
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
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
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

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useGetExpensesByCategoryQuery,
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
} = api;