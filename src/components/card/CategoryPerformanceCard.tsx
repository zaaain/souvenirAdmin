import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { DonutChart } from '@components/chart'
import type { DonutChartDataItem } from '@components/chart'

export interface CategoryPerformanceCardProps {
  title?: string
  subtitle?: string
  tag?: string
  data: DonutChartDataItem[]
  loading?: boolean
}

function CategoryPerformanceCard({
  title = 'Category Performance',
  subtitle,
  tag,
  data,
  loading = false,
}: CategoryPerformanceCardProps) {
  if (loading) {
    return (
      <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Skeleton height={20} width={180} className="mb-1" />
        <Skeleton height={14} width={70} className="mb-4" />
        <Skeleton height={220} className="rounded-lg" />
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={16} width={72} />
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
      {!subtitle && tag && (
        <span className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-Manrope">
          <span>#</span>
          {tag}
        </span>
      )}
      <div className="mt-4 flex-1 flex items-center justify-center min-h-0">
        <DonutChart data={data} size={220} showLabel ringThickness="mediumThick" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 flex-shrink-0">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-Manrope text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryPerformanceCard
