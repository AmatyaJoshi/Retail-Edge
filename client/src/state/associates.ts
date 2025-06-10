import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Associate } from '../types/business';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const associatesApi = createApi({
  reducerPath: 'associatesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Associate'],
  endpoints: (builder) => ({
    getAssociates: builder.query<Associate[], { type?: string; search?: string }>({
      query: ({ type, search }) => ({
        url: 'associates',
        params: { type, search },
      }),
      providesTags: ['Associate'],
    }),    getAssociate: builder.query<Associate, string>({
      query: (id) => `associates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Associate', id }],
    }),

    createAssociate: builder.mutation<Associate, Partial<Associate>>({
      query: (associate) => ({
        url: 'associates',
        method: 'POST',
        body: associate,
      }),
      invalidatesTags: ['Associate'],
    }),

    updateAssociate: builder.mutation<Associate, { id: string; associate: Partial<Associate> }>({      query: ({ id, associate }) => ({
        url: `associates/${id}`,
        method: 'PUT',
        body: associate,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Associate', id },
        'Associate',
      ],
    }),

    deleteAssociate: builder.mutation<void, string>({
      query: (id) => ({
        url: `associates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Associate'],
    }),
  }),
});

export const associatesSlice = createSlice({
  name: 'associates',
  initialState: {
    associates: [] as Associate[],
    selectedAssociate: null as Associate | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setAssociates: (state, action: PayloadAction<Associate[]>) => {
      state.associates = action.payload;
    },
    setSelectedAssociate: (state, action: PayloadAction<Associate | null>) => {
      state.selectedAssociate = action.payload;
    },
    addAssociate: (state, action: PayloadAction<Associate>) => {
      state.associates.unshift(action.payload);
    },
    updateAssociate: (state, action: PayloadAction<Associate>) => {
      const index = state.associates.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.associates[index] = action.payload;
      }
    },
  },
});

export const {
  useGetAssociatesQuery,
  useGetAssociateQuery,
  useCreateAssociateMutation,
  useUpdateAssociateMutation,
  useDeleteAssociateMutation,
} = associatesApi;

export const {
  setAssociates,
  setSelectedAssociate,
  addAssociate,
  updateAssociate,
} = associatesSlice.actions;
