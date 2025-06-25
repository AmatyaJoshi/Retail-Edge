import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AssociateContact } from '../types/business';

export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Contact'],
  endpoints: (builder) => ({
    getContacts: builder.query<AssociateContact[], void>({
      query: () => 'contacts',
      providesTags: ['Contact'],
    }),
    createContact: builder.mutation<AssociateContact, Partial<AssociateContact>>({
      query: (contact) => ({
        url: 'contacts',
        method: 'POST',
        body: contact,
      }),
      invalidatesTags: ['Contact'],
    }),
    updateContact: builder.mutation<AssociateContact, Partial<AssociateContact> & { id: string }>({
      query: ({ id, ...contact }) => ({
        url: `contacts/${id}`,
        method: 'PUT',
        body: contact,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Contact', id }, 'Contact'],
    }),
    deleteContact: builder.mutation<void, string>({
      query: (id) => ({
        url: `contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contact'],
    }),
  })
});

export const {
  useGetContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;