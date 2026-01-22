import type { ReactNode } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export type IconType = 'cube' | 'lineChart' | 'storefront' | 'users'
export type ComparisonTrend = 'positive' | 'negative'

export interface DashboardCardProps {
  heading: string
  value: string
  iconType: IconType
  comparisonPercentage: string
  comparisonText: string
  comparisonTrend: ComparisonTrend
  loading?: boolean
}

const icons: Record<IconType, ReactNode> = {
  cube: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  lineChart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  storefront: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
}

function DashboardCard({
  heading,
  value,
  iconType,
  comparisonPercentage,
  comparisonText,
  comparisonTrend,
  loading = false,
}: DashboardCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Skeleton height={14} width={96} className="mb-3" />
            <Skeleton height={24} width={80} />
          </div>
          <Skeleton height={40} width={40} borderRadius={8} className="shrink-0" />
        </div>
        <div className="mt-4">
          <Skeleton height={12} width={128} />
        </div>
      </div>
    )
  }

  const Icon = icons[iconType]
  const isPositive = comparisonTrend === 'positive'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-ManropeBold text-gray-700 text-[20px]">{heading}</p>
          <p className="text-xl font-ManropeBold text-primary mt-2 text-[19px]">{value}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
          {Icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        {isPositive ? (
          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        <span className={`text-xs font-Manrope ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {comparisonPercentage} {comparisonText}
        </span>
      </div>
    </div>
  )
}

export default DashboardCard
