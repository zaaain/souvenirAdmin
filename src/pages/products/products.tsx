import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetProductsQuery, useDeleteProductMutation } from '@store/features/product'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Published', label: 'Published' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Rejected', label: 'Rejected' },
]

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Published: 'bg-primary text-white',
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-600',
}

function ProductIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </span>
  )
}

const ITEMS_PER_PAGE = 10

function mapProductRow(p: Record<string, unknown>, rowIndex: number): Record<string, unknown> {
  const id = p._id ?? p.productId ?? p.id ?? ''
  const name = p.name ?? p.productName ?? p.title ?? ''
  const sku = p.sku ?? p.skuCode ?? ''
  const category = typeof p.category === 'object' && p.category && !Array.isArray(p.category)
    ? (p.category as Record<string, unknown>).name ?? (p.category as Record<string, unknown>).categoryName ?? ''
    : String(p.category ?? p.categoryName ?? '')
  const inventory = p.inventory ?? p.stock ?? p.quantity ?? 0
  const priceRaw = p.price ?? p.unitPrice ?? 0
  const price = typeof priceRaw === 'number' ? `$${Number(priceRaw).toLocaleString()}` : String(priceRaw ?? '')
  const dateRaw = p.createdAt ?? p.updatedAt ?? p.dateAdded ?? ''
  const dateFormatted =
    typeof dateRaw === 'string' && dateRaw.length >= 10
      ? new Date(dateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : String(dateRaw ?? '')
  const status = String(p.status ?? (p.isActive === true ? 'Published' : 'Pending'))
  return {
    productId: id,
    productName: name,
    sku,
    category,
    inventory,
    price,
    dateAdded: dateFormatted,
    dateAddedRaw: typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : dateRaw,
    status,
    rowNum: rowIndex + 1,
  }
}

function buildColumns(onView: (id: string) => void, onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    {
      key: 'productName',
      label: 'Product',
      render: (v) => (
        <span className="inline-flex items-center gap-2">
          <ProductIcon />
          <span>{String(v ?? '')}</span>
        </span>
      ),
    },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'price', label: 'Price' },
    { key: 'dateAdded', label: 'Date Added' },
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
      render: (_, row) => {
        const id = String(row.productId ?? '')
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onView(id)}
              className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-colors"
              aria-label="View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )
      },
    },
  ]
}

const Products = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dateAdded, setDateAdded] = useState('')
  const [page, setPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useGetProductsQuery({ page, pageSize: ITEMS_PER_PAGE })
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  const rawList = useMemo(() => {
    const res = data as Record<string, unknown> | undefined
    if (!res) return []
    const dataObj = res.data as Record<string, unknown> | undefined
    const products = dataObj?.products ?? dataObj?.content ?? (Array.isArray(dataObj) ? dataObj : [])
    return Array.isArray(products) ? (products as Record<string, unknown>[]) : []
  }, [data])

  const start = (page - 1) * ITEMS_PER_PAGE
  const tableData = useMemo(
    () => rawList.map((r, i) => mapProductRow(r, start + i)),
    [rawList, page]
  )

  const total = useMemo(() => {
    const res = data as Record<string, unknown> | undefined
    const dataObj = res?.data as Record<string, unknown> | undefined
    if (dataObj?.totalProducts != null) return Number(dataObj.totalProducts)
    if (dataObj?.totalElements != null) return Number(dataObj.totalElements)
    if (dataObj?.total != null) return Number(dataObj.total)
    return tableData.length
  }, [data, tableData.length])

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => navigate(`/products/${id}`),
        (id) => {
          setDeleteProductId(id)
          setDeleteModalOpen(true)
        }
      ),
    [navigate]
  )

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setDateAdded('')
    setPage(1)
  }
  const handleExport = () => console.log('Export')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Products Portfolio</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage and approve products</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
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
        searchPlaceholder="Search by product name, SKU, or category..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        dateValue={dateAdded}
        onDateChange={setDateAdded}
        dateLabel="Date Added"
        datePlaceholder="Select Date"
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

      {isError && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-red-600">
          {String((error as { data?: { message?: string } })?.data?.message ?? (error as Error)?.message ?? 'Failed to load products')}
        </div>
      )}
      <PaginateTable
        headers={columns}
        data={tableData}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={total}
        onPageChange={setPage}
        loading={isLoading}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteProductId(null) }}
        title="Delete Product"
        description="Deleting the product will permanently remove it from the catalog. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteProductId(null) }, variant: 'secondary' },
          {
            label: isDeleting ? 'Deleting...' : 'Delete Product',
            onClick: async () => {
              if (deleteProductId) {
                try {
                  await deleteProduct(deleteProductId).unwrap()
                  setDeleteModalOpen(false)
                  setDeleteProductId(null)
                } catch {
                  // Error can be shown via toast
                }
              }
            },
            variant: 'danger',
          },
        ]}
      />
    </div>
  )
}

export default Products
