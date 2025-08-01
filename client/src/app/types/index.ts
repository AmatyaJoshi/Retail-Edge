// Types for the POS system

export interface Product {
    id: string;
    name: string;
    barcode: string; 
    price: number;
    category: string;
    stock: number;
    imageUrl?: string;
    description?: string;
    cost?: number;
    brand?: string;
    supplier?: string;
    reorderPoint?: number;
    tax?: number;
    discountable?: boolean;
  }
  
  export interface CartItem extends Product {
    quantity: number;
    discount?: number;
    taxAmount?: number;
  }
  
  export interface Customer {
    customerId: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    prescription?: import('./prescriptions').Prescription;
    loyaltyPoints?: number;
    lastVisit?: string;
    joinedDate: string;
  }
    // Prescription types moved to types/prescriptions.ts
  export interface Sale {
    id: string;
    invoiceNumber: string;
    date: string;
    items: CartItem[];
    customer?: Customer;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
    staffId: string;
    notes?: string;
  }
  
  export interface Staff {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'sales' | 'optician';
    pin: string;
  }
  
  export interface PaymentMethod {
    id: string;
    name: string;
    icon?: string;
    enabled: boolean;
  }

  export interface User {
    userId: string;
    name: string;
    email: string;
    phone: string;
  }