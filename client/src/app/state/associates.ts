import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Associate } from '@/types/business';

interface GetAssociatesParams {
  type?: string;
  search?: string;
}

interface UpdateAssociateParams {
  id: string;
  associate: Partial<Associate>;
}

interface AssociatesState {
  associates: Associate[];
  selectedAssociate: Associate | null;
  loading: boolean;
  error: string | null;
}

export const associatesApi = createApi({
  reducerPath: 'associatesApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_SERVER_URL + '/api' }),
  tagTypes: ['Associate'],
  endpoints: (builder) => ({
    getAssociates: builder.query<Associate[], GetAssociatesParams>({
      query: ({ type, search }) => ({
        url: 'associates',
        params: { type, search },
      }),
      providesTags: ['Associate'],
    }),

    getAssociate: builder.query<Associate, string>({
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

    updateAssociate: builder.mutation<Associate, UpdateAssociateParams>({
      query: ({ id, associate }) => ({
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

const initialState: AssociatesState = {
  associates: [],
  selectedAssociate: null,
  loading: false,
  error: null,
};

export const associatesSlice = createSlice({
  name: 'associates',
  initialState,
  reducers: {
    setAssociates: (state, action: PayloadAction<Associate[]>) => {
      state.associates = action.payload;
      state.error = null;
    },
    setSelectedAssociate: (state, action: PayloadAction<Associate | null>) => {
      state.selectedAssociate = action.payload;
      state.error = null;
    },
    addAssociate: (state, action: PayloadAction<Associate>) => {
      state.associates.unshift(action.payload);
      state.error = null;
    },
    updateAssociate: (state, action: PayloadAction<Associate>) => {
      const index = state.associates.findIndex(a => a.associateId === action.payload.associateId);
      if (index !== -1) {
        state.associates[index] = action.payload;
      }
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
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
  setError,
  setLoading,
} = associatesSlice.actions;

export default associatesSlice.reducer;
