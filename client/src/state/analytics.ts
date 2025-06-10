import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/analytics' }),
  endpoints: (builder) => ({
    getPaymentPatterns: builder.query<any, void>({
      query: () => 'payment-patterns',
    }),
    getOrderFrequency: builder.query<any, void>({
      query: () => 'order-frequency',
    }),
  }),
});

export const {
  useGetPaymentPatternsQuery,
  useGetOrderFrequencyQuery,
} = analyticsApi;