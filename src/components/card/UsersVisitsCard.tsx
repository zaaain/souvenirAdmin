import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import AnalyticsCardShell from './AnalyticsCardShell'

export interface UsersVisitsCardProps {
  title?: string
  subtitle?: string
  value: string
  loading?: boolean
  /** When true, card fills remaining height in a flex column (e.g. to match Age Distribution / Conversion Rate). */
  fillHeight?: boolean
}

function UsersVisitsCard({
  title = 'Users Visits',
  subtitle,
  value,
  loading = false,
  fillHeight = false,
}: UsersVisitsCardProps) {
  const content = loading ? (
    <Skeleton height={32} width={100} />
  ) : (
    <p className="text-2xl font-ManropeBold text-primary">{value}</p>
  )

  return (
    <AnalyticsCardShell title={title} subtitle={subtitle} loading={loading} fillHeight={fillHeight}>
      {content}
    </AnalyticsCardShell>
  )
}

export default UsersVisitsCard
