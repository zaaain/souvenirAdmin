import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { DonutChart } from '@components/chart'
import type { DonutChartDataItem } from '@components/chart'

export interface ConversionRateTab {
  value: string
  label: string
}

export interface ConversionRateCardProps {
  title?: string
  subtitle?: string
  tabs: ConversionRateTab[]
  selectedTab: string
  onTabChange?: (value: string) => void
  centerLabel: string
  data: DonutChartDataItem[]
  loading?: boolean
}

function ConversionRateCard({
  title = 'Conversion Rate',
  subtitle,
  tabs,
  selectedTab,
  onTabChange,
  centerLabel,
  data,
  loading = false,
}: ConversionRateCardProps) {
  if (loading) {
    return (
      <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <Skeleton height={20} width={140} className="mb-1" />
            <Skeleton height={14} width={70} />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={32} width={60} borderRadius={8} />
            ))}
          </div>
        </div>
        <Skeleton height={200} className="rounded-lg flex-1 min-h-0 mt-2" />
        <div className="mt-4 space-y-2 flex-shrink-0">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={16} width={120} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 flex-shrink-0">
        <div>
          <h2 className="text-lg font-ManropeBold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-sm font-Manrope text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange?.(tab.value)}
              className={`px-3 py-1.5 text-sm font-Manrope rounded-md transition-colors ${
                selectedTab === tab.value
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex-1 flex items-center justify-center min-h-0">
        <DonutChart
          data={data}
          size={200}
          showLabel={false}
          centerLabel={centerLabel}
          ringThickness="thinMedium"
        />
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

export default ConversionRateCard
