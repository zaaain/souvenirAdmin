import { Link } from 'react-router-dom'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const statusPillClass: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Active: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Inactive: 'bg-gray-100 text-gray-700',
}

function getStatusClass(status: string): string {
  return statusPillClass[status] ?? 'bg-gray-100 text-gray-700'
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function UserIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </span>
  )
}

function ShopIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </span>
  )
}

function buildRecentOrdersColumns(): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    {
      key: 'orderId',
      label: 'Order ID',
      render: (value, row) => (
        <Link
          to={String(row.orderLink ?? '#')}
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          {String(value ?? '')}
          <ExternalLinkIcon />
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value) => (
        <span className="inline-flex items-center gap-2">
          <UserIcon />
          <span>{String(value ?? '')}</span>
        </span>
      ),
    },
    { key: 'product', label: 'Product' },
    {
      key: 'vendor',
      label: 'Vendor',
      render: (value) => (
        <span className="inline-flex items-center gap-2">
          <ShopIcon />
          <span>{String(value ?? '')}</span>
        </span>
      ),
    },
    { key: 'amount', label: 'Amount' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${getStatusClass(String(value ?? ''))}`}
        >
          {String(value ?? '')}
        </span>
      ),
    },
    { key: 'date', label: 'Date' },
  ]
}

const RECENT_ORDERS_COLUMNS = buildRecentOrdersColumns()

export interface RecentOrdersCardProps {
  title?: string
  pendingCount?: number
  seeAllHref: string
  data: Record<string, unknown>[]
  currentPage: number
  itemsPerPage: number
  totalResults: number
  onPageChange: (page: number) => void
  loading?: boolean
}

function RecentOrdersCard({
  title = 'Recent Orders',
  pendingCount = 0,
  seeAllHref,
  data,
  currentPage,
  itemsPerPage,
  totalResults,
  onPageChange,
  loading = false,
}: RecentOrdersCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Skeleton height={24} width={140} />
            <Skeleton height={24} width={70} className="rounded-full" />
          </div>
          <Skeleton height={20} width={60} />
        </div>
        <Skeleton height={280} className="rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-ManropeBold text-gray-800">{title}</h2>
          {pendingCount > 0 && (
            <span className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-Manrope">
              {pendingCount} Pending
            </span>
          )}
        </div>
        <Link
          to={seeAllHref}
          className="text-sm font-Manrope text-primary hover:underline"
        >
          See All
        </Link>
      </div>

      <PaginateTable
        headers={RECENT_ORDERS_COLUMNS}
        data={data}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalResults={totalResults}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export default RecentOrdersCard
