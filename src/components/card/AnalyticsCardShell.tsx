import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export interface AnalyticsCardShellProps {
  title?: string
  subtitle?: string
  loading?: boolean
  /** When true, card root uses h-full to fill remaining height in a flex parent. */
  fillHeight?: boolean
  children: React.ReactNode
}

/**
 * Shared card shell for Analytics cards (Visits by Device, Users Visits).
 * Keeps UI identical: white bg, rounded-xl, border, shadow, p-5, same title/subtitle styles.
 */
function AnalyticsCardShell({
  title = '',
  subtitle,
  loading = false,
  fillHeight = false,
  children,
}: AnalyticsCardShellProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${fillHeight ? 'h-full w-full' : 'w-full'}`}
    >
      {loading ? (
        <>
          <Skeleton height={20} width={160} className="mb-1" />
          <Skeleton height={14} width={60} className="mb-4" />
          {children}
        </>
      ) : (
        <>
          <h2 className="text-lg font-ManropeBold text-gray-800">{title}</h2>
          {subtitle != null && subtitle !== '' && (
            <p className="text-sm font-Manrope text-gray-500 mt-1">{subtitle}</p>
          )}
          <div className="mt-4">{children}</div>
        </>
      )}
    </div>
  )
}

export default AnalyticsCardShell
