import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Published', label: 'Published' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const STATUS_PILL: Record<string, string> = {
  Processing: 'bg-gray-100 text-gray-600',
  Published: 'bg-primary/10 text-primary',
  Shipped: 'bg-orange-100 text-orange-600',
  Delivered: 'bg-red-100 text-red-600',
  Cancelled: 'bg-red-100 text-red-600',
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

const MOCK_ORDERS: Record<string, unknown>[] = [
  { orderId: '302012', productName: 'Amoxicillin 50MG', otherCount: 3, customerName: 'John Bushmill', customerEmail: 'johnb@mail.com', totalAmount: '$123,000', paymentMethod: 'MasterCard', orderDate: '1 min ago', orderDateRaw: '', status: 'Processing' },
  { orderId: '302012', productName: 'Amoxicillin 50MG', otherCount: 3, customerName: 'Josh Adam', customerEmail: 'josh_adam@mail.com', totalAmount: '$123,000', paymentMethod: 'VISA', orderDate: '5 hour ago', orderDateRaw: '', status: 'Published' },
  { orderId: '302012', productName: 'Amoxicillin 50MG', otherCount: 3, customerName: 'Sarah Miller', customerEmail: 'sarah.m@mail.com', totalAmount: '$123,000', paymentMethod: 'COD', orderDate: 'Jan 15, 2025', orderDateRaw: '2025-01-15', status: 'Shipped' },
  { orderId: '302012', productName: 'Amoxicillin 50MG', otherCount: 3, customerName: 'Michael Chen', customerEmail: 'm.chen@mail.com', totalAmount: '$123,000', paymentMethod: 'MasterCard', orderDate: 'Jan 15, 2025', orderDateRaw: '2025-01-15', status: 'Delivered' },
  { orderId: '302012', productName: 'Amoxicillin 50MG', otherCount: 3, customerName: 'Emma Wilson', customerEmail: 'emma.w@mail.com', totalAmount: '$123,000', paymentMethod: 'VISA', orderDate: 'Jan 14, 2025', orderDateRaw: '2025-01-14', status: 'Cancelled' },
  { orderId: '302012', productName: 'Amoxicillin 50MG', otherCount: 3, customerName: 'David Lee', customerEmail: 'd.lee@mail.com', totalAmount: '$123,000', paymentMethod: 'COD', orderDate: 'Jan 14, 2025', orderDateRaw: '2025-01-14', status: 'Processing' },
]

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
      render: (v) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${STATUS_PILL[String(v ?? '')] ?? 'bg-gray-100 text-gray-600'}`}>
          {String(v ?? '')}
        </span>
      ),
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
  const [orderDate, setOrderDate] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = [...MOCK_ORDERS]
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((r) => String(r.orderId).toLowerCase().includes(q))
    }
    if (orderDate) {
      list = list.filter((r) => String(r.orderDateRaw ?? '') === orderDate)
    }
    return list
  }, [search, status, orderDate])

  const total = filtered.length
  const start = (page - 1) * ITEMS_PER_PAGE
  const sliced = filtered.slice(start, start + ITEMS_PER_PAGE).map((r, i) => ({
    ...r,
    rowNum: start + i + 1,
  }))

  const columns = useMemo(() => buildColumns((id) => navigate(`/orders/${id}`)), [navigate])

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setOrderDate('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Orders</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your orders</p>
        </div>
        <button
          type="button"
          onClick={() => console.log('Export')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </button>
      </div>

      <Filter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by id..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        dateValue={orderDate}
        onDateChange={setOrderDate}
        dateLabel="Order Date"
        datePlaceholder="Select Date"
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

      <PaginateTable
        headers={columns}
        data={sliced}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={total}
        onPageChange={setPage}
      />
    </div>
  )
}

export default Orders
