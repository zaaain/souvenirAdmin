import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://api.souvenir.live/api/',
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

export interface GetCategoriesParams {
  page?: number
  pageSize?: number
  status?: string
  text?: string
}

/** API category shape: { _id, name, description, isActive, productCount, createdAt, updatedAt } */
export interface CategoryItem {
  _id: string
  name: string
  description?: string
  isActive: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

/** API response: { status, message, data: { categories, totalPages, page, pageSize, totalCategories } } */
export interface GetCategoriesResponse {
  status: number
  message: string
  data: {
    categories: CategoryItem[]
    totalPages: number
    page: number
    pageSize: number
    totalCategories: number
  }
}

export const categorySlice = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Categories'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (params: GetCategoriesParams = {}) => {
        const page = params?.page ?? 1
        const pageSize = params?.pageSize ?? 10
        const queryParams: Record<string, string | number> = { page, pageSize }
        if (params?.status) queryParams.status = params.status
        if (params?.text) queryParams.text = params.text
        return {
          url: 'admin/categories',
          params: queryParams,
        }
      },
      providesTags: (result) => {
        const list = result?.data?.categories ?? result?.content ?? result?.data ?? (Array.isArray(result) ? result : [])
        const tags = Array.isArray(list)
          ? list.map((c: { _id?: string; categoryId?: string; id?: string }) => ({ type: 'Categories' as const, id: String(c._id ?? c.categoryId ?? c.id ?? '') }))
          : []
        return [...tags, { type: 'Categories' as const, id: 'LIST' }]
      },
    }),
    getCategoryById: builder.query({
      query: (id: string) => ({
        url: `admin/categories/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Categories', id }],
    }),
    createCategory: builder.mutation({
      query: (body: { name: string; description?: string }) => ({
        url: 'admin/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, body }: { id: string; body: { name?: string; status?: string } }) => ({
        url: `admin/categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Categories', id }, { type: 'Categories', id: 'LIST' }],
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Categories', id }, { type: 'Categories', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categorySlice
