import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://18.130.102.234:9078/api/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    window.dispatchEvent(new CustomEvent('unauthorized', {
      detail: { status: result.error.status },
    }))
  }
  return result
}

export interface GetVendorsParams {
  page?: number
  pageSize?: number
}

export const vendorSlice = createApi({
  reducerPath: 'vendorApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vendors'],
  endpoints: (builder) => ({
    getVendors: builder.query({
      query: (params: GetVendorsParams) => {
        const page = params?.page ?? 1
        const pageSize = params?.pageSize ?? 10
        return {
          url: 'admin/vendors',
          params: { page, pageSize },
        }
      },
      providesTags: ['Vendors'],
    }),
    getVendorById: builder.query({
      query: (id: string) => ({
        url: `admin/vendors/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Vendors', id }],
    }),
    updateVendorApproval: builder.mutation({
      query: ({ id, body }: { id: string; body: { action: string; reason: string } }) => ({
        url: `admin/vendors/${id}/approval`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendors' }, { type: 'Vendors', id }],
    }),
    updateVendorStatus: builder.mutation({
      query: ({ id, body }: { id: string; body: { action: string; reason: string } }) => ({
        url: `admin/vendors/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendors' }, { type: 'Vendors', id }],
    }),
    deleteVendor: builder.mutation({
      query: (id: string) => ({
        url: `admin/vendors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendors'],
    }),
  }),
})

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useUpdateVendorApprovalMutation,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,
} = vendorSlice
