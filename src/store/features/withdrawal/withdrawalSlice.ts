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
    window.dispatchEvent(
      new CustomEvent('unauthorized', {
        detail: { status: result.error.status },
      })
    )
  }
  return result
}

export interface GetWithdrawalsParams {
  page?: number
  pageSize?: number
  status?: string
  vendorId?: string
}

export const withdrawalSlice = createApi({
  reducerPath: 'withdrawalApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Withdrawals'],
  endpoints: (builder) => ({
    getWithdrawals: builder.query({
      query: (params: GetWithdrawalsParams = {}) => {
        const { page = 1, pageSize = 10, status, vendorId } = params
        const query: Record<string, string | number> = { page, pageSize }
        if (status && status !== 'all') query.status = status
        if (vendorId) query.vendorId = vendorId
        return {
          url: 'admin/withdrawals',
          params: query,
        }
      },
      providesTags: (result) => {
        const data = (result as { data?: unknown } | undefined)?.data as Record<string, unknown> | undefined
        let list: unknown = data
        if (data && !Array.isArray(data)) {
          list =
            data.withdrawals ??
            data.requests ??
            data.items ??
            data.content ??
            data.data ??
            data.list
        }
        const arr = Array.isArray(list) ? (list as { _id?: string; id?: string; withdrawalId?: string }[]) : []
        const tags = arr.map((w) => ({
          type: 'Withdrawals' as const,
          id: String(w._id ?? w.withdrawalId ?? w.id ?? ''),
        }))
        return [...tags, { type: 'Withdrawals' as const, id: 'LIST' }]
      },
    }),
    approveWithdrawal: builder.mutation({
      query: (id: string) => ({
        url: `admin/withdrawals/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Withdrawals', id },
        { type: 'Withdrawals', id: 'LIST' },
      ],
    }),
    rejectWithdrawal: builder.mutation({
      query: (id: string) => ({
        url: `admin/withdrawals/${id}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Withdrawals', id },
        { type: 'Withdrawals', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetWithdrawalsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} = withdrawalSlice

