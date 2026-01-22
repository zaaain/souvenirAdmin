import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'

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

const MOCK_PRODUCTS: Record<string, unknown>[] = [
  { productId: 'p-001', productName: 'Amoxicillin 50MG', sku: '302012', category: 'Vitamins', inventory: 0, price: '$123,000', dateAdded: 'Jan 15, 2025', dateAddedRaw: '2025-01-15', status: 'Pending' },
  { productId: 'p-002', productName: 'PetCalcium Plus', sku: '302013', category: 'Animal Medicines', inventory: 120, price: '$45.99', dateAdded: 'Jan 15, 2025', dateAddedRaw: '2025-01-15', status: 'Published' },
  { productId: 'p-003', productName: 'Multi-Vitamin Drops', sku: '302014', category: 'Feed & Nutrition', inventory: 142, price: '$28.50', dateAdded: 'Jan 14, 2025', dateAddedRaw: '2025-01-14', status: 'Published' },
  { productId: 'p-004', productName: 'Joint Care Supplement', sku: '302015', category: 'Supplements', inventory: 429, price: '$67.00', dateAdded: 'Jan 13, 2025', dateAddedRaw: '2025-01-13', status: 'Suspended' },
  { productId: 'p-005', productName: 'Amoxicillin 50MG', sku: '302016', category: 'Animal Medicines', inventory: 123, price: '$52.00', dateAdded: 'Jan 12, 2025', dateAddedRaw: '2025-01-12', status: 'Suspended' },
  { productId: 'p-006', productName: 'Omega Fish Oil', sku: '302017', category: 'Vitamins', inventory: 532, price: '$34.99', dateAdded: 'Jan 11, 2025', dateAddedRaw: '2025-01-11', status: 'Rejected' },
  { productId: 'p-007', productName: 'Probiotic Blend', sku: '302018', category: 'Supplements', inventory: 89, price: '$41.50', dateAdded: 'Jan 10, 2025', dateAddedRaw: '2025-01-10', status: 'Published' },
  { productId: 'p-008', productName: 'Dewormer Tablets', sku: '302019', category: 'Animal Medicines', inventory: 256, price: '$19.99', dateAdded: 'Jan 9, 2025', dateAddedRaw: '2025-01-09', status: 'Pending' },
  { productId: 'p-009', productName: 'Organic Feed Mix', sku: '302020', category: 'Feed & Nutrition', inventory: 78, price: '$89.00', dateAdded: 'Jan 8, 2025', dateAddedRaw: '2025-01-08', status: 'Published' },
  { productId: 'p-010', productName: 'Skin & Coat Formula', sku: '302021', category: 'Supplements', inventory: 312, price: '$56.75', dateAdded: 'Jan 7, 2025', dateAddedRaw: '2025-01-07', status: 'Suspended' },
  { productId: 'p-011', productName: 'Flea & Tick Spray', sku: '302022', category: 'Animal Medicines', inventory: 205, price: '$22.00', dateAdded: 'Jan 6, 2025', dateAddedRaw: '2025-01-06', status: 'Published' },
  { productId: 'p-012', productName: 'Digestive Enzymes', sku: '302023', category: 'Supplements', inventory: 167, price: '$38.50', dateAdded: 'Jan 5, 2025', dateAddedRaw: '2025-01-05', status: 'Pending' },
  { productId: 'p-013', productName: 'Premium Dog Food', sku: '302024', category: 'Feed & Nutrition', inventory: 89, price: '$72.99', dateAdded: 'Jan 4, 2025', dateAddedRaw: '2025-01-04', status: 'Published' },
  { productId: 'p-014', productName: 'Antibiotic Ointment', sku: '302025', category: 'Animal Medicines', inventory: 0, price: '$15.99', dateAdded: 'Jan 3, 2025', dateAddedRaw: '2025-01-03', status: 'Rejected' },
  { productId: 'p-015', productName: 'Vitamin B Complex', sku: '302026', category: 'Vitamins', inventory: 445, price: '$29.00', dateAdded: 'Jan 2, 2025', dateAddedRaw: '2025-01-02', status: 'Suspended' },
]

const ITEMS_PER_PAGE = 10

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

  const filtered = useMemo(() => {
    let list = [...MOCK_PRODUCTS]
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          String(r.productName).toLowerCase().includes(q) ||
          String(r.sku).toLowerCase().includes(q) ||
          String(r.category).toLowerCase().includes(q)
      )
    }
    if (dateAdded) {
      list = list.filter((r) => String(r.dateAddedRaw ?? '') === dateAdded)
    }
    return list
  }, [search, status, dateAdded])

  const total = filtered.length
  const start = (page - 1) * ITEMS_PER_PAGE
  const sliced = filtered.slice(start, start + ITEMS_PER_PAGE).map((r, i) => ({
    ...r,
    rowNum: start + i + 1,
  }))

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

      <PaginateTable
        headers={columns}
        data={sliced}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={total}
        onPageChange={setPage}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteProductId(null) }}
        title="Delete Product"
        description="Deleting the product will permanently remove it from the catalog. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteProductId(null) }, variant: 'secondary' },
          { label: 'Delete Product', onClick: () => { console.log('Delete', deleteProductId); setDeleteModalOpen(false); setDeleteProductId(null) }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default Products
