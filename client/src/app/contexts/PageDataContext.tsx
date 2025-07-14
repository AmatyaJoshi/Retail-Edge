'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// Data types that can be tracked across pages
export interface PageData {
  products?: Product[];
  customers?: Customer[];
  sales?: Sale[];
  expenses?: Expense[];
  associates?: Associate[];
  transactions?: Transaction[];
  analytics?: AnalyticsData;
  currentPage?: string;
  lastUpdated?: Date;
}

export interface Product {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  category: string;
  brand?: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  barcode?: string;
  rating?: number;
}

export interface Customer {
  customerId: string;
  name: string;
  email?: string;
  phone: string;
  joinedDate: string;
}

export interface Sale {
  saleId: string;
  productId: string;
  customerId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  paymentMethod: string;
  status: string;
  product?: Product;
  customer?: Customer;
}

export interface Expense {
  expenseId: string;
  categoryId: string;
  amount: number;
  timestamp: string;
  description?: string;
  status: string;
  vendor?: string;
  paymentStatus: string;
  paidAmount: number;
  category?: string;
}

export interface Associate {
  associateId: string;
  type: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  currentBalance: number;
  status: string;
  joinedDate: string;
}

export interface Transaction {
  transactionId: string;
  associateId: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
}

export interface AnalyticsData {
  totalSales?: number;
  totalCustomers?: number;
  totalProducts?: number;
  inventoryValue?: number;
  popularProducts?: Product[];
  salesSummary?: any[];
}

interface PageDataContextType {
  pageData: PageData;
  updatePageData: (data: Partial<PageData>) => void;
  clearPageData: () => void;
  findProduct: (query: string) => Product | null;
  findCustomer: (query: string) => Customer | null;
  findSale: (query: string) => Sale | null;
  findExpense: (query: string) => Expense | null;
  findAssociate: (query: string) => Associate | null;
  getAnalytics: () => AnalyticsData | null;
  answerDataQuery: (question: string) => string | null;
}

const PageDataContext = createContext<PageDataContextType | undefined>(undefined);

export function PageDataProvider({ children }: { children: ReactNode }) {
  const [pageData, setPageData] = useState<PageData>({});

  const updatePageData = useCallback((data: Partial<PageData>) => {
    setPageData(prev => ({
      ...prev,
      ...data,
      lastUpdated: new Date()
    }));
  }, []);

  const clearPageData = useCallback(() => {
    setPageData({});
  }, []);

  // Fuzzy search function for finding items by name or other identifiers
  const fuzzySearch = (query: string, items: any[], searchFields: string[]): any | null => {
    if (!items || items.length === 0) return null;
    
    const lowerQuery = query.toLowerCase().trim();
    
    // First try exact match
    for (const item of items) {
      for (const field of searchFields) {
        if (item[field] && item[field].toLowerCase() === lowerQuery) {
          return item;
        }
      }
    }
    
    // Then try contains match
    for (const item of items) {
      for (const field of searchFields) {
        if (item[field] && item[field].toLowerCase().includes(lowerQuery)) {
          return item;
        }
      }
    }
    
    // Finally try partial word match
    const queryWords = lowerQuery.split(/\s+/);
    for (const item of items) {
      for (const field of searchFields) {
        if (item[field]) {
          const fieldValue = item[field].toLowerCase();
          if (queryWords.every(word => fieldValue.includes(word))) {
            return item;
          }
        }
      }
    }
    
    return null;
  };

  const findProduct = useCallback((query: string): Product | null => {
    if (!pageData.products) return null;
    return fuzzySearch(query, pageData.products, ['name', 'brand', 'sku', 'barcode']);
  }, [pageData.products]);

  const findCustomer = useCallback((query: string): Customer | null => {
    if (!pageData.customers) return null;
    return fuzzySearch(query, pageData.customers, ['name', 'email', 'phone']);
  }, [pageData.customers]);

  const findSale = useCallback((query: string): Sale | null => {
    if (!pageData.sales) return null;
    return fuzzySearch(query, pageData.sales, ['saleId']);
  }, [pageData.sales]);

  const findExpense = useCallback((query: string): Expense | null => {
    if (!pageData.expenses) return null;
    return fuzzySearch(query, pageData.expenses, ['description', 'vendor']);
  }, [pageData.expenses]);

  const findAssociate = useCallback((query: string): Associate | null => {
    if (!pageData.associates) return null;
    return fuzzySearch(query, pageData.associates, ['name', 'contactPerson', 'email', 'phone']);
  }, [pageData.associates]);

  const getAnalytics = useCallback((): AnalyticsData | null => {
    return pageData.analytics || null;
  }, [pageData.analytics]);

  // Main function to answer data queries
  const answerDataQuery = useCallback((question: string): string | null => {
    const lowerQuestion = question.toLowerCase();
    
    // Product queries
    if (lowerQuestion.includes('product') || lowerQuestion.includes('price') || lowerQuestion.includes('stock')) {
      // Extract product name from question
      const productMatch = question.match(/(?:price|stock|details?|info|information)\s+(?:of|for|about)\s+([^?]+)/i) ||
                          question.match(/([A-Za-z0-9\s\/\-]+)\s+(?:price|cost|stock|details?)/i) ||
                          question.match(/(?:what|how much|tell me about)\s+([A-Za-z0-9\s\/\-]+)/i);
      
             if (productMatch && productMatch[1]) {
         const productName = productMatch[1].trim();
         const product = findProduct(productName);
         
         if (product) {
           let response = `**${product.name}**\n`;
           response += `• **Price:** ₹${product.price.toLocaleString()}\n`;
           response += `• **Stock:** ${product.stockQuantity} units\n`;
           response += `• **Category:** ${product.category}\n`;
           if (product.brand) response += `• **Brand:** ${product.brand}\n`;
           if (product.description) response += `• **Description:** ${product.description}\n`;
           if (product.rating) response += `• **Rating:** ${product.rating}/5\n`;
           if (product.sku) response += `• **SKU:** ${product.sku}\n`;
           if (product.barcode) response += `• **Barcode:** ${product.barcode}\n`;
           
           return response;
         }
       }
    }
    
    // Customer queries
    if (lowerQuestion.includes('customer') || lowerQuestion.includes('client')) {
      const customerMatch = question.match(/(?:customer|client)\s+(?:named?|called?)\s+([^?]+)/i) ||
                           question.match(/([A-Za-z\s]+)\s+(?:customer|client|contact)/i);
      
             if (customerMatch && customerMatch[1]) {
         const customerName = customerMatch[1].trim();
         const customer = findCustomer(customerName);
         
         if (customer) {
           let response = `**${customer.name}**\n`;
           response += `• **Phone:** ${customer.phone}\n`;
           if (customer.email) response += `• **Email:** ${customer.email}\n`;
           response += `• **Joined:** ${new Date(customer.joinedDate).toLocaleDateString()}\n`;
           
           return response;
         }
       }
    }
    
    // Sales queries
    if (lowerQuestion.includes('sale') || lowerQuestion.includes('transaction') || lowerQuestion.includes('revenue')) {
      const analytics = getAnalytics();
      if (analytics && analytics.totalSales !== undefined) {
        let response = `**Sales Overview**\n`;
        response += `• **Total Sales:** ₹${analytics.totalSales?.toLocaleString() || '0'}\n`;
        if (analytics.totalCustomers) response += `• **Total Customers:** ${analytics.totalCustomers}\n`;
        if (analytics.popularProducts && analytics.popularProducts.length > 0 && analytics.popularProducts[0]?.name) {
          response += `• **Top Product:** ${analytics.popularProducts[0].name}\n`;
        }
        
        return response;
      }
    }
    
    // Inventory queries
    if (lowerQuestion.includes('inventory') || lowerQuestion.includes('stock') || lowerQuestion.includes('products')) {
      const analytics = getAnalytics();
      if (analytics) {
        let response = `**Inventory Overview**\n`;
        if (analytics.totalProducts) response += `• **Total Products:** ${analytics.totalProducts}\n`;
        if (analytics.inventoryValue) response += `• **Total Value:** ₹${analytics.inventoryValue.toLocaleString()}\n`;
        
        return response;
      }
    }
    
    // Expense queries
    if (lowerQuestion.includes('expense') || lowerQuestion.includes('cost') || lowerQuestion.includes('spending')) {
      const analytics = getAnalytics();
      if (analytics) {
        let response = `**Expense Overview**\n`;
        // Add expense-related analytics here when available
        return response;
      }
    }
    
    // Associate queries
    if (lowerQuestion.includes('associate') || lowerQuestion.includes('supplier') || lowerQuestion.includes('vendor')) {
      const associateMatch = question.match(/(?:associate|supplier|vendor)\s+(?:named?|called?)\s+([^?]+)/i) ||
                            question.match(/([A-Za-z\s]+)\s+(?:associate|supplier|vendor)/i);
      
             if (associateMatch && associateMatch[1]) {
         const associateName = associateMatch[1].trim();
         const associate = findAssociate(associateName);
         
         if (associate) {
           let response = `**${associate.name}**\n`;
           response += `• **Type:** ${associate.type}\n`;
           response += `• **Status:** ${associate.status}\n`;
           if (associate.contactPerson) response += `• **Contact:** ${associate.contactPerson}\n`;
           if (associate.email) response += `• **Email:** ${associate.email}\n`;
           if (associate.phone) response += `• **Phone:** ${associate.phone}\n`;
           response += `• **Balance:** ₹${associate.currentBalance.toLocaleString()}\n`;
           if (associate.creditLimit) response += `• **Credit Limit:** ₹${associate.creditLimit.toLocaleString()}\n`;
           
           return response;
         }
       }
    }
    
    // General analytics queries
    if (lowerQuestion.includes('dashboard') || lowerQuestion.includes('overview') || lowerQuestion.includes('summary')) {
      const analytics = getAnalytics();
      if (analytics) {
        let response = `**Dashboard Summary**\n`;
        if (analytics.totalSales) response += `• **Total Sales:** ₹${analytics.totalSales.toLocaleString()}\n`;
        if (analytics.totalCustomers) response += `• **Total Customers:** ${analytics.totalCustomers}\n`;
        if (analytics.totalProducts) response += `• **Total Products:** ${analytics.totalProducts}\n`;
        if (analytics.inventoryValue) response += `• **Inventory Value:** ₹${analytics.inventoryValue.toLocaleString()}\n`;
        
        return response;
      }
    }
    
    return null; // No data answer found, will fallback to LLM
  }, [findProduct, findCustomer, findSale, findExpense, findAssociate, getAnalytics]);

  return (
    <PageDataContext.Provider value={{
      pageData,
      updatePageData,
      clearPageData,
      findProduct,
      findCustomer,
      findSale,
      findExpense,
      findAssociate,
      getAnalytics,
      answerDataQuery,
    }}>
      {children}
    </PageDataContext.Provider>
  );
}

export function usePageData() {
  const context = useContext(PageDataContext);
  if (context === undefined) {
    throw new Error('usePageData must be used within a PageDataProvider');
  }
  return context;
} 