import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Link } from 'react-router-dom'

export interface PendingVendorItem {
  id: string
  imageUrl: string
  vendorName: string
  submittedText: string
}

export interface PendingVendorApprovalsCardProps {
  title?: string
  pendingCount: number
  seeAllHref?: string
  items: PendingVendorItem[]
  onReview?: (id: string) => void
  loading?: boolean
}

function PendingVendorApprovalsCard({
  title = 'Pending Vendor Approvals',
  pendingCount,
  seeAllHref = '#',
  items,
  onReview,
  loading = false,
}: PendingVendorApprovalsCardProps) {
  if (loading) {
    return (
      <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton height={24} width={220} />
          <Skeleton height={20} width={60} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-3">
              <Skeleton height={100} className="rounded mb-3" />
              <Skeleton height={16} width={120} className="mb-2" />
              <Skeleton height={12} width={100} className="mb-3" />
              <Skeleton height={36} width={80} borderRadius={8} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-ManropeBold text-gray-800">{title}</h2>
          <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-sm font-Manrope">
            {pendingCount} Pending
          </span>
        </div>
        <Link
          to={seeAllHref}
          className="text-sm font-Manrope text-primary hover:underline"
        >
          See All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 content-start">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-gray-100 p-3 shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <div className="rounded-lg overflow-hidden bg-gray-100 mb-3">
              <img
                src={item.imageUrl}
                alt={item.vendorName}
                className="w-full h-[150px] object-cover"
              />
            </div>
            <p className="font-ManropeBold text-gray-800 truncate">{item.vendorName}</p>
            <p className="text-xs font-Manrope text-gray-500 mt-0.5">{item.submittedText}</p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onReview?.(item.id)}
                className="px-3 py-1.5 text-sm font-Manrope text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingVendorApprovalsCard
