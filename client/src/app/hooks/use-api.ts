import { useCallback } from 'react';
import { useLoading } from '@/contexts/loading-context';

interface ApiOptions {
  showLoading?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi() {
  const { withLoading } = useLoading();

  const apiCall = useCallback(async <T,>(
    url: string,
    options: RequestInit & ApiOptions = {}
  ): Promise<T> => {
    const { showLoading = true, onSuccess, onError, ...fetchOptions } = options;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onSuccess?.(data);
      return data;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, []);

  const get = useCallback(<T,>(url: string, options: ApiOptions = {}) => {
    const { showLoading = true, ...rest } = options;
    const promise = apiCall<T>(url, { method: 'GET', ...rest });
    return showLoading ? withLoading(promise) : promise;
  }, [apiCall, withLoading]);

  const post = useCallback(<T,>(url: string, data: any, options: ApiOptions = {}) => {
    const { showLoading = true, ...rest } = options;
    const promise = apiCall<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...rest,
    });
    return showLoading ? withLoading(promise) : promise;
  }, [apiCall, withLoading]);

  const put = useCallback(<T,>(url: string, data: any, options: ApiOptions = {}) => {
    const { showLoading = true, ...rest } = options;
    const promise = apiCall<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...rest,
    });
    return showLoading ? withLoading(promise) : promise;
  }, [apiCall, withLoading]);

  const del = useCallback(<T,>(url: string, options: ApiOptions = {}) => {
    const { showLoading = true, ...rest } = options;
    const promise = apiCall<T>(url, { method: 'DELETE', ...rest });
    return showLoading ? withLoading(promise) : promise;
  }, [apiCall, withLoading]);

  return {
    get,
    post,
    put,
    delete: del,
  };
} 