import { useState, useMemo } from 'react'
import {
  DashboardCard,
  CategoryPerformanceCard,
  PendingVendorApprovalsCard,
  VisitsByDeviceCard,
  UsersVisitsCard,
  AgeDistributionCard,
  ConversionRateCard,
  SalesTrendsCard,
  RecentOrdersCard,
} from '@components/card'
import type { IconType, ComparisonTrend, VisitsByDeviceItem } from '@components/card'
import { useGetDashboardQuery } from '@store/features/dashboard'
import type { DashboardApiData } from '@store/features/dashboard'
import dashboardChartsJson from '@/data/dashboardCharts.json'

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total)
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
  const values: string[] = [
    String(orders?.total ?? '—'),
    formatRevenue(revenue?.total ?? 0),
    String(vendors?.approved ?? vendors?.total ?? '—'),
    String(users?.total ?? '—'),
  ]
  return STAT_CARDS_CONFIG.map((c, i) => ({
    id: c.id,
    heading: c.heading,
    value: values[i] ?? '—',
    iconType: c.iconType,
    comparisonPercentage: '—',
    comparisonText: c.defaultComparisonText,
    comparisonTrend: 'positive' as ComparisonTrend,
    loading: false,
  }))
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

  const [conversionTab, setConversionTab] = useState(
    CHARTS_DATA.analyticsCards?.conversionRate?.selectedTab ?? 'weekly'
  )
  const [salesMonth, setSalesMonth] = useState(
    CHARTS_DATA.salesTrends?.selectedMonth ?? 'october'
  )
  const [recentOrdersPage, setRecentOrdersPage] = useState(1)

  const handleReview = (id: string) => {
    console.log('Review vendor:', id)
  }

  const cp = CHARTS_DATA.categoryPerformance
  const pv = CHARTS_DATA.pendingVendorApprovals
  const ro = CHARTS_DATA.recentOrders
  const ip = ro?.itemsPerPage ?? 10
  const recentOrdersFull = ro?.data ?? []
  const recentOrdersSliced = recentOrdersFull.slice((recentOrdersPage - 1) * ip, recentOrdersPage * ip).map((r, i) => ({ ...r, rowNum: (recentOrdersPage - 1) * ip + i + 1 }))
  const ordersPendingCount = apiData?.orders?.pending ?? ro?.pendingCount ?? 0
  const usersVisitValue = apiData?.users?.total != null ? String(apiData.users.total) : CHARTS_DATA.analyticsCards.usersVisits.value

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

      {/* Top: Analytics — Visits by Device + Users Visits | Age Distribution | Conversion Rate */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4 min-h-0">
          <VisitsByDeviceCard
            title={CHARTS_DATA.analyticsCards.visitsByDevice.title}
            subtitle={CHARTS_DATA.analyticsCards.visitsByDevice.subtitle}
            items={CHARTS_DATA.analyticsCards.visitsByDevice.items as VisitsByDeviceItem[]}
            loading={dashboardLoading}
          />
          <div className="flex-1 min-h-0 flex">
            <UsersVisitsCard
              title={CHARTS_DATA.analyticsCards.usersVisits.title}
              subtitle={CHARTS_DATA.analyticsCards.usersVisits.subtitle}
              value={usersVisitValue}
              loading={dashboardLoading}
              fillHeight
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 min-h-0 flex">
          <AgeDistributionCard
            title={CHARTS_DATA.analyticsCards.ageDistribution.title}
            subtitle={CHARTS_DATA.analyticsCards.ageDistribution.subtitle}
            data={CHARTS_DATA.analyticsCards.ageDistribution.data}
            loading={dashboardLoading}
          />
        </div>
        <div className="col-span-12 md:col-span-4 min-h-0 flex">
          <ConversionRateCard
            title={CHARTS_DATA.analyticsCards.conversionRate.title}
            subtitle={CHARTS_DATA.analyticsCards.conversionRate.subtitle}
            tabs={CHARTS_DATA.analyticsCards.conversionRate.tabs}
            selectedTab={conversionTab}
            onTabChange={setConversionTab}
            centerLabel={CHARTS_DATA.analyticsCards.conversionRate.centerLabel}
            data={CHARTS_DATA.analyticsCards.conversionRate.data}
            loading={dashboardLoading}
          />
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

      {/* Recent Orders — table with pagination (below Sales Trends) */}
      {ro && (
        <RecentOrdersCard
          title={ro.title}
          pendingCount={ordersPendingCount}
          seeAllHref={ro.seeAllHref}
          data={recentOrdersSliced}
          currentPage={recentOrdersPage}
          itemsPerPage={ip}
          totalResults={recentOrdersFull.length}
          onPageChange={setRecentOrdersPage}
          loading={dashboardLoading}
        />
      )}
    </div>
  )
}

export default Dashboard
