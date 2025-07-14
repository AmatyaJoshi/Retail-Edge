'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePageData } from '../contexts/PageDataContext';
import type { PageData } from '../contexts/PageDataContext';

export function usePageDataUpdater(data: Partial<PageData>, pageName?: string) {
  const { updatePageData } = usePageData();
  const lastDataRef = useRef<string>('');
  const lastPageNameRef = useRef<string>('');

  // Memoize the data to prevent unnecessary updates
  const memoizedData = useMemo(() => {
    const dataString = JSON.stringify(data);
    if (dataString !== lastDataRef.current || pageName !== lastPageNameRef.current) {
      lastDataRef.current = dataString;
      lastPageNameRef.current = pageName || '';
      return {
        ...data,
        ...(pageName && { currentPage: pageName }),
      };
    }
    return null;
  }, [data, pageName]);

  useEffect(() => {
    if (memoizedData) {
      updatePageData(memoizedData);
    }
  }, [memoizedData, updatePageData]);
}

// Helper function to create stable references for arrays
function createStableArray<T>(array: T[] | undefined): T[] | undefined {
  if (!array) return undefined;
  return array.length > 0 ? array : undefined;
}

// Specific hooks for different data types
export function useProductsDataUpdater(products: any[] | undefined, pageName?: string) {
  const stableProducts = useMemo(() => createStableArray(products), [products]);
  usePageDataUpdater(stableProducts ? { products: stableProducts } : {}, pageName);
}

export function useCustomersDataUpdater(customers: any[] | undefined, pageName?: string) {
  const stableCustomers = useMemo(() => createStableArray(customers), [customers]);
  usePageDataUpdater(stableCustomers ? { customers: stableCustomers } : {}, pageName);
}

export function useSalesDataUpdater(sales: any[] | undefined, pageName?: string) {
  const stableSales = useMemo(() => createStableArray(sales), [sales]);
  usePageDataUpdater(stableSales ? { sales: stableSales } : {}, pageName);
}

export function useExpensesDataUpdater(expenses: any[] | undefined, pageName?: string) {
  const stableExpenses = useMemo(() => createStableArray(expenses), [expenses]);
  usePageDataUpdater(stableExpenses ? { expenses: stableExpenses } : {}, pageName);
}

export function useAssociatesDataUpdater(associates: any[] | undefined, pageName?: string) {
  const stableAssociates = useMemo(() => createStableArray(associates), [associates]);
  usePageDataUpdater(stableAssociates ? { associates: stableAssociates } : {}, pageName);
}

export function useAnalyticsDataUpdater(analytics: any, pageName?: string) {
  const stableAnalytics = useMemo(() => analytics || null, [analytics]);
  usePageDataUpdater(stableAnalytics ? { analytics: stableAnalytics } : {}, pageName);
} 