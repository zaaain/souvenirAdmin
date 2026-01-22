import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { DonutChart } from '@components/chart'
import type { DonutChartDataItem } from '@components/chart'

export interface AgeDistributionCardProps {
  title?: string
  subtitle?: string
  data: DonutChartDataItem[]
  loading?: boolean
}

function AgeDistributionCard({
  title = 'Age Distribution',
  subtitle,
  data,
  loading = false,
}: AgeDistributionCardProps) {
  if (loading) {
    return (
      <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Skeleton height={20} width={160} className="mb-1" />
        <Skeleton height={14} width={60} className="mb-4" />
        <Skeleton height={180} className="rounded-lg flex-1 min-h-0" />
        <div className="mt-4 space-y-2 flex-shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={16} width={140} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-lg font-ManropeBold text-gray-800">{title}</h2>
      {subtitle && (
        <p className="text-sm font-Manrope text-gray-500 mt-1">{subtitle}</p>
      )}
      <div className="mt-4 flex-1 flex items-center justify-center min-h-0">
        <DonutChart data={data} size={180} showLabel={false} ringThickness="thin" />
      </div>
      <div className="mt-4 space-y-2 flex-shrink-0">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-Manrope text-gray-800">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-Manrope text-gray-800 shrink-0">
              {(item.value / data.reduce((s, d) => s + d.value, 0) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgeDistributionCard
