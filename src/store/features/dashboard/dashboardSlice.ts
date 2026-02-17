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

/** API response shape for GET admin/dashboard */
export interface DashboardUsersStats {
  total: number
  active: number
  blocked: number
}

export interface DashboardVendorsStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface DashboardCategoriesStats {
  active: number
  total: number
}

export interface DashboardOrdersStats {
  delivered: number
  pending: number
  total: number
}

export interface DashboardProductsStats {
  approved: number
  pending: number
  rejected: number
  total: number
}

export interface DashboardRevenueStats {
  total: number
}

export interface RecentActivityProduct {
  _id: string
  vendorId: string | null
  name: string
  price: number
  status: string
  createdAt: string
}

export interface RecentActivityUser {
  _id: string
  firstname: string
  lastname: string
  createdAt?: string
}

export interface RecentActivityVendor {
  _id: string
  email: string
  firstname: string
  lastname: string
}

export interface DashboardRecentActivities {
  products: RecentActivityProduct[]
  users: RecentActivityUser[]
  vendors: RecentActivityVendor[]
}

export interface DashboardApiData {
  users?: DashboardUsersStats
  vendors?: DashboardVendorsStats
  categories?: DashboardCategoriesStats
  orders?: DashboardOrdersStats
  products?: DashboardProductsStats
  recentActivities?: DashboardRecentActivities
  revenue?: DashboardRevenueStats
}

export interface GetDashboardResponse {
  status?: number
  message?: string
  data?: DashboardApiData
}

export const dashboardSlice = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboard: builder.query<GetDashboardResponse, void>({
      query: () => ({
        url: 'admin/dashboard',
      }),
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardQuery } = dashboardSlice
