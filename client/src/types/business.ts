export type PartnerType = 'SUPPLIER' | 'BUYER' | 'BOTH';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type TransactionType = 'PURCHASE' | 'SALE';
export type CommunicationType = 'EMAIL' | 'MEETING' | 'CALL' | 'NOTE';

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
  id: string;
  type: PartnerType;
  name: string;
  email?: string;
  phone: string;
  address: string;
  taxId?: string;
  creditLimit?: number;
  currentBalance: number;
  joinedDate: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
  contacts?: AssociateContact[];
  communications?: AssociateCommunication[];
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
