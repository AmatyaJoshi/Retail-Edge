import { useState, useCallback } from 'react';
import type { Associate } from '@/types/business';
import type { PartnerType, AssociateStatus, Transaction, AssociateContact, AssociateCommunication, Contract, Document, PurchaseOrder, Persona, SalesSummary, PurchaseSummary, ExpenseSummary, ExpenseByCategory, ContactPayload } from '@/types/business';
import { toast } from 'sonner';
import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { FormValues } from '@/app/associates/associate-form';

interface AnalyticsData {
  paymentPatterns: {
    pattern: string;
    frequency: number;
    averageAmount: number;
  }[];
  orderFrequency: string;
  productPreferences: string;
  creditUtilization: number;
  yoYGrowth: string;
}

interface SalesHistoryItem {
  saleId: string;
  productId: string;
  timestamp: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  product: {
    productId: string;
    name: string;
    price: number;
  };
}

interface PrescriptionDetailsItem {
  id: string;
  date: string;
  expiryDate: string;
  doctor: string;
  notes?: string;
  rightEye: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
  leftEye: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
}

interface CustomerHistoryData {
  salesHistory: SalesHistoryItem[];
  prescriptionDetails: PrescriptionDetailsItem[];
  framePreferences: string;
  insuranceInformation: string;
  appointmentHistory: string;
  followUpDates: string;
  specialRequirements: string;
}

interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  associateId: string;
  expectedDeliveryDate: string;
  status: string;
  product: {
    productId: string;
    name: string;
  };
}

interface SupplierInfoData {
  productCategoriesSupplied: string;
  priceHistory: string;
  orderHistoryWithStatus: PurchaseOrderItem[];
  qualityRatings: string;
  paymentTerms: string;
  leadTimes: string;
  returnPolicy: string;
  warrantyInformation: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export const useAssociates = () => {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [customerHistory, setCustomerHistory] = useState<CustomerHistoryData | null>(null);
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfoData | null>(null);

  const handleError = (err: unknown, defaultMessage: string): void => {
    const error = err as AxiosError<ApiError>;
    const errorMessage = error.response?.data?.message || defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
    console.error(err);
  };

  const getAssociates = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<Associate[]> = await axios.get(
        `${API_BASE_URL}/api/associates`,
        {
          params: {
            include: 'contacts,transactions,communications,contracts,documents,purchaseOrders'
          }
        }
      );
      setAssociates(response.data);
    } catch (err) {
      handleError(err, 'Failed to fetch associates.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAssociate = useCallback(async (newAssociate: FormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<Associate> = await axios.post(
        `${API_BASE_URL}/api/associates`,
        newAssociate
      );
      setAssociates((prev) => [...prev, response.data]);
      toast.success('Associate created successfully!');
    } catch (err) {
      handleError(err, 'Failed to create associate.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAssociate = useCallback(async (
    associateId: string,
    updatedAssociateData: Partial<Associate>
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<Associate> = await axios.put(
        `${API_BASE_URL}/api/associates/${associateId}`,
        updatedAssociateData
      );
      setAssociates((prev) =>
        prev.map((assoc) => (assoc.associateId === associateId ? response.data : assoc))
      );
      toast.success('Associate updated successfully!');
    } catch (err) {
      handleError(err, 'Failed to update associate.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAssociate = useCallback(async (associateId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/associates/${associateId}`);
      setAssociates((prev) => prev.filter((assoc) => assoc.associateId !== associateId));
      toast.success('Associate deleted successfully!');
    } catch (err) {
      handleError(err, 'Failed to delete associate.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAssociateAnalytics = useCallback(async (associateId: string): Promise<AnalyticsData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<AnalyticsData> = await axios.get(
        `${API_BASE_URL}/api/associates/${associateId}/analytics`
      );
      setAnalyticsData(response.data);
      return response.data;
    } catch (err) {
      handleError(err, 'Failed to fetch analytics data.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCustomerHistory = useCallback(async (associateId: string): Promise<CustomerHistoryData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<CustomerHistoryData> = await axios.get(
        `${API_BASE_URL}/api/associates/${associateId}/customer-history`
      );
      setCustomerHistory(response.data);
      return response.data;
    } catch (err) {
      handleError(err, 'Failed to fetch customer history.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSupplierInfo = useCallback(async (associateId: string): Promise<SupplierInfoData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<SupplierInfoData> = await axios.get(
        `${API_BASE_URL}/api/associates/${associateId}/supplier-info`
      );
      setSupplierInfo(response.data);
      return response.data;
    } catch (err) {
      handleError(err, 'Failed to fetch supplier information.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addContact = useCallback(async (associateId: string, contactData: ContactPayload): Promise<AssociateContact> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<AssociateContact> = await axios.post(
        `${API_BASE_URL}/api/associates/${associateId}/contacts`,
        contactData
      );
      setAssociates((prev) =>
        prev.map((assoc) =>
          assoc.associateId === associateId
            ? { ...assoc, contacts: [...(assoc.contacts || []), response.data] }
            : assoc
        )
      );
      toast.success('Contact added successfully!');
      return response.data;
    } catch (err) {
      handleError(err, 'Failed to add contact.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (
    associateId: string,
    contactId: string,
    contactData: Partial<ContactPayload>
  ): Promise<AssociateContact> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<AssociateContact> = await axios.put(
        `${API_BASE_URL}/api/associates/${associateId}/contacts/${contactId}`,
        contactData
      );
      setAssociates((prev) =>
        prev.map((assoc) =>
          assoc.associateId === associateId
            ? {
                ...assoc,
                contacts: (assoc.contacts || []).map((contact) =>
                  contact.id === contactId ? response.data : contact
                ),
              }
            : assoc
        )
      );
      toast.success('Contact updated successfully!');
      return response.data;
    } catch (err) {
      handleError(err, 'Failed to update contact.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteContact = useCallback(async (associateId: string, contactId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/associates/${associateId}/contacts/${contactId}`
      );
      setAssociates((prev) =>
        prev.map((assoc) =>
          assoc.associateId === associateId
            ? {
                ...assoc,
                contacts: (assoc.contacts || []).filter((contact) => contact.id !== contactId),
              }
            : assoc
        )
      );
      toast.success('Contact deleted successfully!');
    } catch (err) {
      handleError(err, 'Failed to delete contact.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    associates,
    analyticsData,
    customerHistory,
    supplierInfo,
    isLoading,
    error,
    getAssociates,
    createAssociate,
    updateAssociate,
    deleteAssociate,
    getAssociateAnalytics,
    getCustomerHistory,
    getSupplierInfo,
    addContact,
    updateContact,
    deleteContact,
  };
};