import { useState, useMemo } from 'react'
import {
  DashboardCard,
  CategoryPerformanceCard,
  PendingVendorApprovalsCard,
  // VisitsByDeviceCard,   // No API data — commented out
  // UsersVisitsCard,      // No API data — commented out
  // AgeDistributionCard,  // No API data — commented out
  // ConversionRateCard,   // No API data — commented out
  SalesTrendsCard,
} from '@components/card'
import type { IconType, ComparisonTrend } from '@components/card'
import { useGetDashboardQuery } from '@store/features/dashboard'
import type { DashboardApiData } from '@store/features/dashboard'
import dashboardChartsJson from '@/data/dashboardCharts.json'
import { formatCurrency } from '@constants/currency'
import moment from 'moment'
import SimpleTable from '@components/table/SimpleTable'
import type { TableColumn } from '@components/table/SimpleTable'

export interface DashboardStatItem {
  id: string
  heading: string
  value: string
  iconType: IconType
  comparisonPercentage: string
  comparisonText: string
  comparisonTrend: ComparisonTrend
  loading: boolean
}

const STAT_CARDS_CONFIG: { id: string; heading: string; iconType: IconType; defaultComparisonText: string }[] = [
  { id: '1', heading: 'Total Orders', iconType: 'cube', defaultComparisonText: 'vs last month' },
  { id: '2', heading: 'Revenue', iconType: 'lineChart', defaultComparisonText: 'vs last month' },
  { id: '3', heading: 'Active Vendors', iconType: 'storefront', defaultComparisonText: 'new this week' },
  { id: '4', heading: 'Total Users', iconType: 'users', defaultComparisonText: 'vs last month' },
]

function formatRevenue(total: number): string {
  if (total == null || Number.isNaN(total)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'QAR',
    maximumFractionDigits: 0,
  }).format(total)
}

function mapApiDataToStats(apiData: DashboardApiData | undefined, loading: boolean): DashboardStatItem[] {
  if (!apiData) {
    return STAT_CARDS_CONFIG.map((c) => ({
      id: c.id,
      heading: c.heading,
      value: '—',
      iconType: c.iconType,
      comparisonPercentage: '—',
      comparisonText: c.defaultComparisonText,
      comparisonTrend: 'positive' as ComparisonTrend,
      loading,
    }))
  }
  const { orders, revenue, vendors, users } = apiData
  return [
    {
      id: '1',
      heading: 'Total Orders',
      value: String(orders?.total ?? '—'),
      iconType: 'cube' as IconType,
      comparisonPercentage: orders?.pending != null ? String(orders.pending) : '—',
      comparisonText: 'pending orders',
      comparisonTrend: 'positive' as ComparisonTrend,
      loading: false,
    },
    {
      id: '2',
      heading: 'Revenue',
      value: formatRevenue(revenue?.total ?? 0),
      iconType: 'lineChart' as IconType,
      comparisonPercentage: orders?.delivered != null ? String(orders.delivered) : '—',
      comparisonText: 'orders delivered',
      comparisonTrend: 'positive' as ComparisonTrend,
      loading: false,
    },
    {
      id: '3',
      heading: 'Active Vendors',
      value: String(vendors?.approved ?? vendors?.total ?? '—'),
      iconType: 'storefront' as IconType,
      comparisonPercentage: vendors?.pending != null ? String(vendors.pending) : '—',
      comparisonText: 'pending approval',
      comparisonTrend: 'positive' as ComparisonTrend,
      loading: false,
    },
    {
      id: '4',
      heading: 'Total Users',
      value: String(users?.total ?? '—'),
      iconType: 'users' as IconType,
      comparisonPercentage: users?.active != null ? String(users.active) : '—',
      comparisonText: 'active users',
      comparisonTrend: 'positive' as ComparisonTrend,
      loading: false,
    },
  ]
}

const CATEGORY_CHART_COLORS = { active: '#22C55E', inactive: '#6b7280' }

function mapCategoriesToChartData(apiData: DashboardApiData | undefined): { name: string; value: number; color: string }[] {
  const cat = apiData?.categories
  if (!cat) return []
  const active = cat.active ?? 0
  const total = cat.total ?? 0
  const inactive = Math.max(0, total - active)
  if (total === 0) return []
  return [
    { name: 'Active', value: active, color: CATEGORY_CHART_COLORS.active },
    { name: 'Inactive', value: inactive, color: CATEGORY_CHART_COLORS.inactive },
  ]
}

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/placeholder/200/200'

function mapRecentVendorsToItems(apiData: DashboardApiData | undefined): { id: string; imageUrl: string; vendorName: string; submittedText: string }[] {
  const list = apiData?.recentActivities?.vendors
  if (!Array.isArray(list)) return []
  return list.map((v) => ({
    id: v._id,
    imageUrl: PLACEHOLDER_IMAGE,
    vendorName: [v.firstname, v.lastname].filter(Boolean).join(' ') || 'Vendor',
    submittedText: v.email || 'Pending',
  }))
}

function formatTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

type DashboardChartsData = {
  salesTrends?: {
    title: string
    selectedMonth: string
    months: { value: string; label: string }[]
    data: { day: number; value: number }[]
    comparisonText: string
    comparisonPositive?: boolean
    loading: boolean
  }
  recentOrders?: {
    title: string
    pendingCount: number
    seeAllHref: string
    itemsPerPage: number
    data: { orderId: string; orderLink: string; customer: string; product: string; vendor: string; amount: string; status: string; date: string }[]
    loading: boolean
  }
  categoryPerformance: {
    title: string
    subtitle?: string
    tag?: string
    data: { name: string; value: number; color: string }[]
    loading: boolean
  }
  pendingVendorApprovals: {
    title: string
    pendingCount: number
    seeAllHref: string
    items: { id: string; imageUrl: string; vendorName: string; submittedText: string }[]
    loading: boolean
  }
  analyticsCards: {
    visitsByDevice: {
      title: string
      subtitle?: string
      items: { icon: string; label: string; percent: string }[]
      loading: boolean
    }
    usersVisits: {
      title: string
      subtitle?: string
      value: string
      loading: boolean
    }
    ageDistribution: {
      title: string
      subtitle?: string
      data: { name: string; value: number; color: string }[]
      loading: boolean
    }
    conversionRate: {
      title: string
      subtitle?: string
      tabs: { value: string; label: string }[]
      selectedTab: string
      centerLabel: string
      data: { name: string; value: number; color: string }[]
      loading: boolean
    }
  }
}

const CHARTS_DATA = dashboardChartsJson as DashboardChartsData

const Dashboard = () => {
  const { data: dashboardResponse, isLoading: dashboardLoading } = useGetDashboardQuery()
  const apiData = dashboardResponse?.data

  const dashboardStats = useMemo(
    () => mapApiDataToStats(apiData, dashboardLoading),
    [apiData, dashboardLoading]
  )
  const categoryChartData = useMemo(() => mapCategoriesToChartData(apiData), [apiData])
  const pendingVendorItems = useMemo(() => mapRecentVendorsToItems(apiData), [apiData])

  const [salesMonth, setSalesMonth] = useState(
    CHARTS_DATA.salesTrends?.selectedMonth ?? 'october'
  )

  const handleReview = (id: string) => {
    console.log('Review vendor:', id)
  }

  const cp = CHARTS_DATA.categoryPerformance
  const pv = CHARTS_DATA.pendingVendorApprovals

  const recentOrders = apiData?.recentActivities?.orders ?? []

  const STATUS_COLORS: Record<string, string> = {
    delivered: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    processing: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
  }

  const recentOrdersColumns: TableColumn[] = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const s = String(value ?? '').toLowerCase()
        const cls = STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-600'
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-Manrope capitalize ${cls}`}>
            {String(value ?? '')}
          </span>
        )
      },
    },
    { key: 'date', label: 'Date' },
  ]

  const recentOrdersRows = recentOrders.map((order) => ({
    orderId: order.orderId || order._id,
    customer: order.userId
      ? [order.userId.firstname, order.userId.lastname].filter(Boolean).join(' ').trim() || '—'
      : '—',
    amount: formatCurrency(order.totalAmount),
    status: order.status,
    date: moment(order.createdAt).format('DD/MM/YY'),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {dashboardStats.map((item) => (
          <div
            key={item.id}
            className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 xl:col-span-3"
          >
            <DashboardCard
              heading={item.heading}
              value={item.value}
              iconType={item.iconType}
              comparisonPercentage={item.comparisonPercentage}
              comparisonText={item.comparisonText}
              comparisonTrend={item.comparisonTrend}
              loading={item.loading}
            />
          </div>
        ))}
      </div>

      {/* Category Performance (md:4) + Pending Vendor Approvals (md:8), sm/xs: 12 */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 md:col-span-4 min-h-0 flex">
          <CategoryPerformanceCard
            title={cp.title}
            subtitle={cp.subtitle}
            tag={cp.tag}
            data={categoryChartData.length > 0 ? categoryChartData : cp.data}
            loading={dashboardLoading}
          />
        </div>
        <div className="col-span-12 md:col-span-8 min-h-0 flex">
          <PendingVendorApprovalsCard
            title={pv.title}
            pendingCount={apiData?.vendors?.pending ?? pv.pendingCount}
            seeAllHref={pv.seeAllHref}
            items={pendingVendorItems.length > 0 ? pendingVendorItems : pv.items}
            onReview={handleReview}
            loading={dashboardLoading}
          />
        </div>
      </div>

      {/* VisitsByDeviceCard — commented out (no API data) */}
      {/* UsersVisitsCard    — commented out (no API data) */}
      {/* AgeDistributionCard — commented out (no API data) */}
      {/* ConversionRateCard  — commented out (no API data) */}

      {/* Recent Activities — Users & Products from API */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Recent Users */}
        <div className="col-span-12 md:col-span-6 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-ManropeBold text-gray-800">Recent Users</h3>
            <a href="/users" className="text-sm text-primary font-Manrope hover:underline">See All</a>
          </div>
          {dashboardLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (apiData?.recentActivities?.users ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No recent users</p>
          ) : (
            <ul className="space-y-3">
              {(apiData?.recentActivities?.users ?? []).map((u) => {
                const name = [u.firstname, u.lastname].filter(Boolean).join(' ') || 'User'
                const initial = name.charAt(0).toUpperCase()
                return (
                  <li key={u._id} className="flex items-center gap-3">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-ManropeBold flex items-center justify-center">
                      {initial}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-Manrope text-gray-800 truncate">{name}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(u.createdAt)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Recent Products */}
        <div className="col-span-12 md:col-span-6 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-ManropeBold text-gray-800">Recent Products</h3>
            <a href="/products" className="text-sm text-primary font-Manrope hover:underline">See All</a>
          </div>
          {dashboardLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2 w-24 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : (apiData?.recentActivities?.products ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No recent products</p>
          ) : (
            <ul className="space-y-3">
              {(apiData?.recentActivities?.products ?? []).map((p) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="shrink-0 w-8 h-8 rounded border border-red-200 bg-red-50 text-red-500 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-Manrope text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">QAR {p.price} · {formatTimeAgo(p.createdAt)}</p>
                  </div>
                  <span className="shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-Manrope bg-primary/10 text-primary capitalize">
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom: Sales Trends — full width */}
      {CHARTS_DATA.salesTrends && (
        <SalesTrendsCard
          title={CHARTS_DATA.salesTrends.title}
          value={salesMonth}
          onValueChange={setSalesMonth}
          options={CHARTS_DATA.salesTrends.months}
          data={CHARTS_DATA.salesTrends.data}
          comparisonText={CHARTS_DATA.salesTrends.comparisonText}
          comparisonPositive={CHARTS_DATA.salesTrends.comparisonPositive ?? true}
          loading={dashboardLoading}
        />
      )}

      {/* Recent Orders — SimpleTable from API */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-ManropeBold text-gray-800">Recent Orders</h3>
          <a href="/orders" className="text-sm text-primary font-Manrope hover:underline">See All</a>
        </div>
        <div className="p-5">
          <SimpleTable
            headers={recentOrdersColumns}
            data={recentOrdersRows}
            loading={dashboardLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
