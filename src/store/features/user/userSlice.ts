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

export interface GetUsersParams {
  page?: number
  pageSize?: number
  status?: string
  isActive?: boolean
  text?: string
}

export interface UpdateUserBody {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
}

export interface UpdateUserStatusBody {
  action: 'suspend' | 'activate'
  reason?: string
}

export const userSlice = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params: GetUsersParams = {}) => {
        const { page = 1, pageSize = 10, status, isActive, text } = params
        const query: Record<string, string | number | boolean> = { page, pageSize }
        if (status && status !== 'all') query.status = status
        if (isActive !== undefined) query.isActive = isActive
        if (text?.trim()) query.text = text.trim()
        return {
          url: 'admin/users',
          params: query,
        }
      },
      providesTags: (result) => {
        const list = result?.data?.content ?? result?.data?.users ?? result?.data?.data ?? (Array.isArray(result?.data) ? result.data : [])
        const tags = Array.isArray(list)
          ? list.map((u: { _id?: string; id?: string }) => ({ type: 'User' as const, id: String(u._id ?? u.id ?? '') }))
          : []
        return [...tags, { type: 'User' as const, id: 'LIST' }]
      },
    }),
    getUserById: builder.query({
      query: (id: string) => ({
        url: `admin/users/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdateUserBody }) => ({
        url: `admin/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdateUserStatusBody }) => ({
        url: `admin/users/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userSlice
