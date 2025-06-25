import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AssociateCommunication } from '../types/business';

export const communicationsApi = createApi({
  reducerPath: 'communicationsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Communication'],
  endpoints: (builder) => ({
    getCommunications: builder.query<AssociateCommunication[], void>({
      query: () => 'communications',
      providesTags: ['Communication'],
    }),
    createCommunication: builder.mutation<AssociateCommunication, Partial<AssociateCommunication>>({
      query: (communication) => ({
        url: 'communications',
        method: 'POST',
        body: communication,
      }),
      invalidatesTags: ['Communication'],
    }),
    updateCommunication: builder.mutation<AssociateCommunication, Partial<AssociateCommunication> & { id: string }>({
      query: ({ id, ...communication }) => ({
        url: `communications/${id}`,
        method: 'PUT',
        body: communication,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Communication', id }, 'Communication'],
    }),
    deleteCommunication: builder.mutation<void, string>({
      query: (id) => ({
        url: `communications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Communication'],
    }),
  })
});

export const {
  useGetCommunicationsQuery,
  useCreateCommunicationMutation,
  useUpdateCommunicationMutation,
  useDeleteCommunicationMutation,
} = communicationsApi;