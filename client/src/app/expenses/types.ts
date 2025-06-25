export interface Expense {
  expenseId: string;
  category: string;
  amount: number;
  description?: string;
  vendor?: string;
  dueDate?: string;
  budget: number;
  status: "pending" | "approved" | "rejected";
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  paidAmount: number;
  lastPaymentDate?: string;
  timestamp: string;
  paymentType: "Subscription" | "Prepaid" | "Postpaid";
}

export interface ExpenseByCategorySummary {
  expenseByCategoryId: string;
  category: string;
  amount: string;
  count: number;
  pendingAmount?: number;
  pendingCount?: number;
  allocated: number;
  remaining: number;
  totalAmount: string;
  percentageChange: number;
  transactions: number;
  date?: string;
  dueDate?: string;
  status: "pending" | "approved" | "rejected";
  description?: string;
  vendor?: string;
  budget?: number;
  paymentStatus?: "PENDING" | "PARTIAL" | "PAID";
  paidAmount?: number;
  lastPaymentDate?: string;
  timestamp?: string;
}

export type PaymentMethod = "Bank Transfer" | "Cheque" | "UPI" | "Cash";

export interface ExpenseTransaction {
  id?: string;
  expenseId: string;
  type: "EXPENSE";
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  status: "COMPLETED";
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
