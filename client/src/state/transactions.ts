import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from './api';
import { AssociateTransaction } from '@/types/business';

interface TransactionsState {
  transactions: AssociateTransaction[];
  selectedTransaction: AssociateTransaction | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  selectedTransaction: null,
  loading: false,
  error: null,
};

export const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<AssociateTransaction[]>) => {
      state.transactions = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<AssociateTransaction | null>) => {
      state.selectedTransaction = action.payload;
    },
    addTransaction: (state, action: PayloadAction<AssociateTransaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<AssociateTransaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
  },
});

export const transactionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<AssociateTransaction[], void>({
      query: () => '/transactions',
    }),
    getTransactionById: builder.query<AssociateTransaction, string>({
      query: (id) => `/transactions/${id}`,
    }),
    createTransaction: builder.mutation<AssociateTransaction, Partial<AssociateTransaction>>({
      query: (data) => ({
        url: '/transactions',
        method: 'POST',
        body: data,
      }),
    }),
    updateTransaction: builder.mutation<AssociateTransaction, { id: string; data: Partial<AssociateTransaction> }>({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  setTransactions,
  setSelectedTransaction,
  addTransaction,
  updateTransaction,
} = transactionsSlice.actions;

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} = transactionsApi;

export default transactionsSlice.reducer;
