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

export interface GetProductsParams {
  page?: number
  pageSize?: number
}

export const productSlice = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params: GetProductsParams = {}) => {
        const page = params?.page ?? 1
        const pageSize = params?.pageSize ?? 10
        return {
          url: 'admin/products',
          params: { page, pageSize },
        }
      },
      providesTags: (result) => {
        const list = result?.data?.products ?? result?.data?.content ?? result?.content ?? (Array.isArray(result?.data) ? result.data : [])
        const tags = Array.isArray(list)
          ? list.map((p: { _id?: string; productId?: string; id?: string }) => ({ type: 'Products' as const, id: String(p._id ?? p.productId ?? p.id ?? '') }))
          : []
        return [...tags, { type: 'Products' as const, id: 'LIST' }]
      },
    }),
    getProductById: builder.query({
      query: (id: string) => ({
        url: `admin/products/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Products', id }, { type: 'Products', id: 'LIST' }],
    }),
    updateProductApproval: builder.mutation({
      query: ({ id, body }: { id: string; body: { action: string } }) => ({
        url: `admin/products/${id}/approval`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Products', id }, { type: 'Products', id: 'LIST' }],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, body }: { id: string; body: { action: string } }) => ({
        url: `admin/products/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Products', id }, { type: 'Products', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useUpdateProductApprovalMutation,
  useUpdateProductStatusMutation,
} = productSlice
