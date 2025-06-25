export type PartnerType = "SUPPLIER" | "BUYER" | "BOTH";
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type TransactionType = 'PURCHASE' | 'SALE';
export type CommunicationType = 'EMAIL' | 'MEETING' | 'CALL' | 'NOTE';
export type AssociateStatus = "ACTIVE" | "INACTIVE";

export interface AssociateContact {
  id: string;
  associateId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssociateCommunication {
  id: string;
  associateId: string;
  associate?: {
    name: string;
  };
  type: CommunicationType;
  subject: string;
  content: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Associate {
  associateId: string;
  type: PartnerType;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  currentBalance: number;
  status: AssociateStatus;
  notes?: string;
  joinedDate: string;
  paymentTerms?: string;
  customPaymentTerms?: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
  totalTransactions?: number;
  contacts?: AssociateContact[];
  transactions?: Transaction[];
  communications?: AssociateCommunication[];
  contracts?: Contract[];
  documents?: Document[];
  purchaseOrders?: PurchaseOrder[];
}

export interface AssociateTransaction {
  id: string;
  partnerId: string;
  partner?: Associate;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
  dueDate?: string;
  description?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  associateId?: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description: string;
}

export interface Contract {
  id: string;
  associateId: string;
  startDate: string;
  endDate?: string;
  contractDuration?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  contractId?: string;
  associateId?: string;
  name: string;
  url: string;
  fileType: string;
  category?: string;
  uploadDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  quantity: number;
  associateId: string;
  expectedDeliveryDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Persona {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  firebaseUid?: string;
  createdAt: string;
  updatedAt: string;
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
  expenseSummaryId: string;
  totalExpenses: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseByCategory {
  expenseByCategoryId: string;
  expenseSummaryId: string;
  category: string;
  amount: number;
  percentage?: number;
  date: string;
}

export interface ContactPayload {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}
