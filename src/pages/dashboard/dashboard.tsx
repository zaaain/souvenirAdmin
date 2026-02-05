import { useState } from 'react'
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
import dashboardStatsJson from '@/data/dashboardStats.json'
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

const DASHBOARD_STATS = dashboardStatsJson as DashboardStatItem[]

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {DASHBOARD_STATS.map((item) => (
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
            title={CHARTS_DATA.categoryPerformance.title}
            subtitle={CHARTS_DATA.categoryPerformance.subtitle}
            tag={CHARTS_DATA.categoryPerformance.tag}
            data={CHARTS_DATA.categoryPerformance.data}
            loading={CHARTS_DATA.categoryPerformance.loading}
          />
        </div>
        <div className="col-span-12 md:col-span-8 min-h-0 flex">
          <PendingVendorApprovalsCard
            title={CHARTS_DATA.pendingVendorApprovals.title}
            pendingCount={CHARTS_DATA.pendingVendorApprovals.pendingCount}
            seeAllHref={CHARTS_DATA.pendingVendorApprovals.seeAllHref}
            items={CHARTS_DATA.pendingVendorApprovals.items}
            onReview={handleReview}
            loading={CHARTS_DATA.pendingVendorApprovals.loading}
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
            loading={CHARTS_DATA.analyticsCards.visitsByDevice.loading}
          />
          <div className="flex-1 min-h-0 flex">
            <UsersVisitsCard
              title={CHARTS_DATA.analyticsCards.usersVisits.title}
              subtitle={CHARTS_DATA.analyticsCards.usersVisits.subtitle}
              value={CHARTS_DATA.analyticsCards.usersVisits.value}
              loading={CHARTS_DATA.analyticsCards.usersVisits.loading}
              fillHeight
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 min-h-0 flex">
          <AgeDistributionCard
            title={CHARTS_DATA.analyticsCards.ageDistribution.title}
            subtitle={CHARTS_DATA.analyticsCards.ageDistribution.subtitle}
            data={CHARTS_DATA.analyticsCards.ageDistribution.data}
            loading={CHARTS_DATA.analyticsCards.ageDistribution.loading}
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
            loading={CHARTS_DATA.analyticsCards.conversionRate.loading}
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
          loading={CHARTS_DATA.salesTrends.loading}
        />
      )}

      {/* Recent Orders — table with pagination (below Sales Trends) */}
      {CHARTS_DATA.recentOrders && (() => {
        const ro = CHARTS_DATA.recentOrders
        const ip = ro.itemsPerPage ?? 10
        const full = ro.data ?? []
        const start = (recentOrdersPage - 1) * ip
        const sliced = full.slice(start, start + ip).map((r, i) => ({ ...r, rowNum: start + i + 1 }))
        return (
          <RecentOrdersCard
            title={ro.title}
            pendingCount={ro.pendingCount}
            seeAllHref={ro.seeAllHref}
            data={sliced}
            currentPage={recentOrdersPage}
            itemsPerPage={ip}
            totalResults={full.length}
            onPageChange={setRecentOrdersPage}
            loading={ro.loading}
          />
        )
      })()}
    </div>
  )
}

export default Dashboard
