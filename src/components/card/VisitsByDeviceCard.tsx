import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import AnalyticsCardShell from './AnalyticsCardShell'

export type DeviceIconType = 'mobile' | 'laptop' | 'tablet' | 'other'

export interface VisitsByDeviceItem {
  icon: DeviceIconType
  label: string
  percent: string
}

export interface VisitsByDeviceCardProps {
  title?: string
  subtitle?: string
  items: VisitsByDeviceItem[]
  loading?: boolean
}

const deviceIcons: Record<DeviceIconType, React.ReactNode> = {
  mobile: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  laptop: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  tablet: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  other: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
}

function VisitsByDeviceCard({
  title = 'Visits by Device',
  subtitle,
  items,
  loading = false,
}: VisitsByDeviceCardProps) {
  const content = loading ? (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton height={20} width={120} />
          <Skeleton height={16} width={36} />
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            {deviceIcons[item.icon]}
            <span className="text-sm font-Manrope text-gray-800 truncate">
              {item.label}
            </span>
          </div>
          <span className="text-sm font-Manrope text-gray-800 shrink-0">
            {item.percent}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <AnalyticsCardShell title={title} subtitle={subtitle} loading={loading}>
      {content}
    </AnalyticsCardShell>
  )
}

export default VisitsByDeviceCard
