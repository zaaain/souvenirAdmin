import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '@store/features/category'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

const STATUS_PILL: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  Active: 'bg-primary/10 text-primary',
  suspended: 'bg-red-100 text-red-700',
  Suspended: 'bg-red-100 text-red-700',
}

const ITEMS_PER_PAGE = 10

function mapCategoryRow(c: Record<string, unknown>, rowIndex: number): Record<string, unknown> {
  const id = c._id ?? c.categoryId ?? c.id ?? ''
  const name = c.name ?? ''
  const isActive = c.isActive !== false
  const dateRaw = c.createdAt ?? c.updatedAt ?? c.dateAdded ?? ''
  const dateFormatted =
    typeof dateRaw === 'string' && dateRaw.length >= 10
      ? new Date(dateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : String(dateRaw)
  return {
    categoryId: id,
    name,
    activeProducts: c.productCount ?? c.activeProducts ?? 0,
    dateAdded: dateFormatted,
    dateAddedRaw: typeof dateRaw === 'string' ? dateRaw.slice(0, 10) : dateRaw,
    status: isActive ? 'Active' : 'Suspended',
    rowNum: rowIndex + 1,
  }
}

function buildColumns(onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    { key: 'name', label: 'Category' },
    { key: 'activeProducts', label: 'Active Products' },
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
        const id = String(row.categoryId ?? '')
        return (
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
        )
      },
    },
  ]
}

const Categories = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dateAdded, setDateAdded] = useState('')
  const [page, setPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: ITEMS_PER_PAGE,
      ...(status !== 'all' && { status: status.toLowerCase() }),
      ...(search.trim() && { text: search.trim() }),
    }),
    [page, status, search]
  )

  const { data, isLoading, isError, error } = useGetCategoriesQuery(queryParams)
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

  const rawList = useMemo(() => {
    const res = data as Record<string, unknown> | undefined
    if (!res) return []
    const dataObj = res.data as Record<string, unknown> | undefined
    const categories = dataObj?.categories as Record<string, unknown>[] | undefined
    return Array.isArray(categories) ? categories : []
  }, [data])

  const filtered = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    let list = rawList.map((r, i) => mapCategoryRow(r, start + i))
    if (dateAdded) {
      list = list.filter((r) => String(r.dateAddedRaw ?? '') === dateAdded)
    }
    return list
  }, [rawList, dateAdded, page])

  const total = useMemo(() => {
    const res = data as Record<string, unknown> | undefined
    const dataObj = res?.data as Record<string, unknown> | undefined
    if (dataObj?.totalCategories != null) return Number(dataObj.totalCategories)
    if (res?.totalElements != null) return Number(res.totalElements)
    if (res?.total != null) return Number(res.total)
    return filtered.length
  }, [data, filtered.length])

  const sliced = filtered

  const columns = useMemo(
    () =>
      buildColumns((id) => {
        setDeleteCategoryId(id)
        setDeleteModalOpen(true)
      }),
    []
  )

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setDateAdded('')
    setPage(1)
  }
  const handleExport = () => console.log('Export')
  const handleAddCategory = () => navigate('/categories/add')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Categories</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your categories</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      <Filter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name..."
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
          {String((error as { data?: { message?: string } })?.data?.message ?? (error as Error)?.message ?? 'Failed to load categories')}
        </div>
      )}
      <PaginateTable
        headers={columns}
        data={sliced}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={total}
        onPageChange={setPage}
        loading={isLoading}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteCategoryId(null) }}
        title="Delete Category"
        description="This action will permanently remove the category and its products from your store. Products will revert to draft status. This cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteCategoryId(null) }, variant: 'secondary' },
          {
            label: isDeleting ? 'Deleting...' : 'Delete Category',
            onClick: async () => {
              if (deleteCategoryId) {
                try {
                  await deleteCategory(deleteCategoryId).unwrap()
                  setDeleteModalOpen(false)
                  setDeleteCategoryId(null)
                } catch {
                  // Error handled by RTK / toast can be added
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

export default Categories
