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

export interface CreateSubadminBody {
  firstname: string
  lastname: string
  email: string
  password: string
}

export interface GetSubadminsParams {
  page?: number
  pageSize?: number
  status?: string
  text?: string
}

export interface UpdateSubadminBody {
  firstname?: string
  lastname?: string
  email?: string
}

export interface UpdateSubadminStatusBody {
  action: 'activate' | 'deactivate'
}

export const teamSlice = createApi({
  reducerPath: 'teamApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    getSubadmins: builder.query({
      query: (params: GetSubadminsParams = {}) => {
        const { page = 1, pageSize = 10, status, text } = params
        const query: Record<string, string | number> = { page, pageSize }
        if (status) query.status = status
        if (text?.trim()) query.text = text.trim()
        return {
          url: 'admin/subadmins',
          params: query,
        }
      },
      providesTags: (result) => {
        const list = result?.data?.content ?? result?.data?.subadmins ?? result?.data?.data ?? (Array.isArray(result?.data) ? result.data : [])
        const tags = Array.isArray(list)
          ? list.map((s: { _id?: string; id?: string }) => ({ type: 'Team' as const, id: String(s._id ?? s.id ?? '') }))
          : []
        return [...tags, { type: 'Team' as const, id: 'LIST' }]
      },
    }),
    getSubadminById: builder.query({
      query: (id: string) => ({
        url: `admin/subadmins/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Team', id }],
    }),
    createSubadmin: builder.mutation({
      query: (body: CreateSubadminBody) => ({
        url: 'admin/subadmins',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),
    updateSubadmin: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdateSubadminBody }) => ({
        url: `admin/subadmins/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Team', id }, { type: 'Team', id: 'LIST' }],
    }),
    updateSubadminStatus: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdateSubadminStatusBody }) => ({
        url: `admin/subadmins/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Team', id }, { type: 'Team', id: 'LIST' }],
    }),
    deleteSubadmin: builder.mutation({
      query: (id: string) => ({
        url: `admin/subadmins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Team', id }, { type: 'Team', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetSubadminsQuery,
  useGetSubadminByIdQuery,
  useCreateSubadminMutation,
  useUpdateSubadminMutation,
  useUpdateSubadminStatusMutation,
  useDeleteSubadminMutation,
} = teamSlice
