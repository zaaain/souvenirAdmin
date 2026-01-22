import { SalesTrendsChart } from '@components/chart'
import type { SalesTrendsDataPoint } from '@components/chart'
import { Select } from '@components/select'
import type { SelectOption } from '@components/select'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export type { SalesTrendsDataPoint } from '@components/chart'

export interface SalesTrendsCardProps {
  title?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  data: SalesTrendsDataPoint[]
  /** e.g. "8.5% vs last month" — percentage (before " vs ") is bold green/red, rest is regular gray. */
  comparisonText: string
  comparisonPositive?: boolean
  loading?: boolean
}

function SalesTrendsCard({
  title = 'Sales Trends',
  value,
  onValueChange,
  options,
  data,
  comparisonText,
  comparisonPositive = true,
  loading = false,
}: SalesTrendsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton height={22} width={140} />
          <Skeleton height={36} width={120} className="rounded-full" />
        </div>
        <Skeleton height={240} className="rounded-lg" />
        <div className="mt-4 flex items-center gap-1">
          <Skeleton height={16} width={100} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header: title + month select */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-ManropeBold text-gray-800">{title}</h2>
        <Select
          value={value}
          onValueChange={onValueChange}
          options={options}
          placeholder=""
        />
      </div>

      {/* Area chart — from @components/chart */}
      <SalesTrendsChart data={data} height={240} />

      {/* Footer: e.g. "8.5%" bold green + "vs last month" regular gray */}
      {(() => {
        const vs = comparisonText.match(/\s+vs\s+/)
        const [percentage, suffix] = vs
          ? [comparisonText.slice(0, vs.index), comparisonText.slice(vs.index!)]
          : [comparisonText, '']
        const colorClass = comparisonPositive ? 'text-emerald-600' : 'text-red-600'
        return (
          <div className="mt-4 flex items-center gap-1 flex-wrap">
            {comparisonPositive ? (
              <svg
                className="w-4 h-4 text-emerald-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-red-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span className={`text-sm font-ManropeBold ${colorClass}`}>{percentage}</span>
            {suffix && <span className="text-sm font-Manrope text-gray-500">{suffix}</span>}
          </div>
        )
      })()}
    </div>
  )
}

export default SalesTrendsCard
