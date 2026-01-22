import SimpleTable from './SimpleTable'
import type { TableColumn } from './SimpleTable'

export interface PaginateTableProps {
  headers: TableColumn[]
  data: Record<string, unknown>[]
  /** 1-based current page */
  currentPage: number
  /** Items per page (page size) */
  itemsPerPage: number
  /** Total number of results across all pages */
  totalResults: number
  onPageChange: (page: number) => void
}

function PaginateTable({
  headers,
  data,
  currentPage,
  itemsPerPage,
  totalResults,
  onPageChange,
}: PaginateTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage))
  const start = totalResults === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalResults)

  // Build page numbers to show: 1, ..., p-1, p, p+1, ..., last
  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages)
  }

  return (
    <div>
      <SimpleTable headers={headers} data={data} />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm font-Manrope text-gray-600 order-2 sm:order-1">
          Showing{' '}
          <span className="font-ManropeBold text-primary">{start}-{end}</span>
          {' '}of{' '}
          <span className="font-ManropeBold text-primary">{totalResults}</span>
          {' '}results
        </p>
        <div className="flex items-center gap-1 order-1 sm:order-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-Manrope transition-colors ${
                  p === currentPage
                    ? 'bg-primary text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaginateTable
