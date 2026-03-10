import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetOrdersQuery } from '@store/features/order'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-gray-100 text-gray-600',
  packed: 'bg-primary/10 text-primary',
  shipping: 'bg-orange-100 text-orange-600',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
}

function ProductIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </span>
  )
}

function mapOrderRow(raw: Record<string, unknown>, rowIndex: number): Record<string, unknown> {
  const id = raw._id ?? raw.orderId ?? raw.id ?? ''

  const products = Array.isArray(raw.products) ? (raw.products as Record<string, unknown>[]) : []
  const firstProduct = products[0] ?? {}
  const productName =
    raw.productName ??
    firstProduct.productName ??
    firstProduct.name ??
    firstProduct.title ??
    '—'
  const otherCount = products.length > 1 ? products.length - 1 : 0

  const user = (raw.userId ?? raw.user) as Record<string, unknown> | undefined
  const customerName =
    raw.customerName ??
    ([user?.firstname, user?.lastname].filter(Boolean).join(' ') ||
      (user?.fullName as string | undefined) ||
      '—')
  const customerEmail =
    raw.customerEmail ??
    (user?.email as string | undefined) ??
    ''

  const totalAmountRaw = raw.totalAmount ?? raw.total ?? raw.amount ?? 0
  const totalAmount =
    typeof totalAmountRaw === 'number'
      ? `QAR ${Number(totalAmountRaw).toLocaleString()}`
      : String(totalAmountRaw ?? '')

  const paymentMethodRaw = String(raw.paymentMethod ?? raw.paymentMode ?? '')
  const paymentMethod =
    paymentMethodRaw.length > 0
      ? paymentMethodRaw.charAt(0).toUpperCase() + paymentMethodRaw.slice(1)
      : ''
  const dateRaw = raw.orderDate ?? raw.createdAt ?? raw.updatedAt ?? ''
  const orderDate =
    typeof dateRaw === 'string' && dateRaw.length >= 10
      ? new Date(dateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : String(dateRaw ?? '')
  const orderDateRaw = typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : dateRaw

  const statusRaw = String(raw.status ?? raw.orderStatus ?? 'pending').toLowerCase()
  const statusLabel = statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1) : '—'

  return {
    orderId: String(id ?? ''),
    productName,
    otherCount,
    customerName,
    customerEmail,
    totalAmount,
    paymentMethod,
    orderDate,
    orderDateRaw,
    status: statusLabel,
    statusRaw,
    rowNum: rowIndex + 1,
  }
}

const ITEMS_PER_PAGE = 10

function buildColumns(onView: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    { key: 'orderId', label: 'Order ID', render: (v) => `#${String(v ?? '')}` },
    {
      key: 'productName',
      label: 'Products',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <ProductIcon />
          <div>
            <p className="text-sm font-Manrope text-gray-800">{String(v ?? '')}</p>
            {(row.otherCount as number) > 0 && (
              <p className="text-xs text-gray-500">+{(row.otherCount as number)} other products</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (v, row) => (
        <div>
          <p className="text-sm font-Manrope text-gray-800">{String(v ?? '')}</p>
          <a href={`mailto:${row.customerEmail}`} className="text-xs text-primary hover:underline">
            {String(row.customerEmail ?? '')}
          </a>
        </div>
      ),
    },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { key: 'orderDate', label: 'Order Date' },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => {
        const raw = String((row as Record<string, unknown>).statusRaw ?? '').toLowerCase()
        const cls = STATUS_PILL[raw] ?? 'bg-gray-100 text-gray-600'
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${cls}`}>
            {String(v ?? '')}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => onView(String(row.orderId ?? ''))}
          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded"
          aria-label="View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      ),
    },
  ]
}

const Orders = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE)

  const { data: apiResponse, isLoading, isError, error } = useGetOrdersQuery({
    page,
    pageSize,
    status: status === 'all' ? undefined : status,
    text: search.trim() || undefined,
  })

  const rawList = useMemo(() => {
    const res = apiResponse as Record<string, unknown> | undefined
    if (!res) return []
    const dataObj = res.data as Record<string, unknown> | undefined
    const orders = dataObj?.orders ?? dataObj?.content ?? (Array.isArray(dataObj) ? dataObj : [])
    return Array.isArray(orders) ? (orders as Record<string, unknown>[]) : []
  }, [apiResponse])

  const total = useMemo(() => {
    const res = apiResponse as Record<string, unknown> | undefined
    const dataObj = res?.data as Record<string, unknown> | undefined
    if (dataObj?.totalOrders != null) return Number(dataObj.totalOrders)
    if (dataObj?.totalElements != null) return Number(dataObj.totalElements)
    if (dataObj?.total != null) return Number(dataObj.total)
    return rawList.length
  }, [apiResponse, rawList.length])

  const start = (page - 1) * pageSize
  const tableData = useMemo(
    () => rawList.map((r, i) => mapOrderRow(r, start + i)),
    [rawList, page],
  )

  const columns = useMemo(() => buildColumns((id) => navigate(`/orders/${id}`)), [navigate])

  const handleApply = () => setPage(1)
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }
const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Orders</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your orders</p>
        </div>
        {/* <button
          type="button"
          onClick={handleExport}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </button> */}
      </div>

      <Filter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by id..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        showDate={false}
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

      {isError && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-red-600">
          {String((error as { data?: { message?: string } })?.data?.message ?? (error as Error)?.message ?? 'Failed to load orders')}
        </div>
      )}
      <PaginateTable
        headers={columns}
        data={tableData}
        currentPage={page}
        itemsPerPage={pageSize}
        totalResults={total}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        loading={isLoading}
      />
    </div>
  )
}

export default Orders
