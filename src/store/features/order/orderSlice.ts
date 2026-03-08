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

export interface GetOrdersParams {
  page?: number
  pageSize?: number
  status?: string
  paymentStatus?: string
  userId?: string
  vendorId?: string
  text?: string
}

export interface UpdateOrderStatusBody {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

export interface UpdatePaymentStatusBody {
  status: string
}

export const orderSlice = createApi({
  reducerPath: 'orderApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params: GetOrdersParams = {}) => {
        const { page = 1, pageSize = 10, status, paymentStatus, userId, vendorId, text } = params
        const query: Record<string, string | number> = { page, pageSize }
        if (status && status !== 'all') query.status = status
        if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus
        if (userId) query.userId = userId
        if (vendorId) query.vendorId = vendorId
        if (text?.trim()) query.text = text.trim()
        return {
          url: 'admin/orders',
          params: query,
        }
      },
      providesTags: (result) => {
        const list =
          result?.data?.orders ??
          result?.data?.content ??
          result?.content ??
          (Array.isArray(result?.data) ? result.data : [])
        const tags = Array.isArray(list)
          ? list.map((o: { _id?: string; orderId?: string; id?: string }) => ({
            type: 'Orders' as const,
            id: String(o._id ?? o.orderId ?? o.id ?? ''),
          }))
          : []
        return [...tags, { type: 'Orders' as const, id: 'LIST' }]
      },
    }),
    getOrderById: builder.query({
      query: (id: string) => ({
        url: `admin/orders/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdateOrderStatusBody }) => ({
        url: `admin/orders/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, body }: { id: string; body: UpdatePaymentStatusBody }) => ({
        url: `admin/orders/${id}/payment-status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }],
    }),
    approveDelivery: builder.mutation({
      query: (id: string) => ({
        url: `admin/orders/${id}/approve-delivery`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }],
    }),
    deleteOrder: builder.mutation({
      query: (id: string) => ({
        url: `admin/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useApproveDeliveryMutation,
  useDeleteOrderMutation,
} = orderSlice

