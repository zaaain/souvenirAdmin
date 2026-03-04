import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetUsersQuery, useDeleteUserMutation } from '@store/features/user'
import { eSnack, sSnack } from '@hooks/useToast'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Inactive' },
]

const STATUS_PILL: Record<string, string> = {
  active: 'bg-primary text-white',
  Active: 'bg-primary text-white',
  suspended: 'bg-gray-100 text-gray-600',
  Inactive: 'bg-gray-100 text-gray-600',
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

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

/** Map API user item to table row shape */
function mapUserToRow(raw: Record<string, unknown>): Record<string, unknown> {
  const id = String(raw._id ?? raw.id ?? raw.userId ?? '')
  const fullName =
    String(raw.fullName ?? '').trim() ||
    [raw.firstname, raw.lastname].filter(Boolean).join(' ').trim() ||
    '—'
  const email = String(raw.email ?? '')
  const phone = String(raw.phone ?? raw.phoneNumber ?? '')
  const totalOrders = raw.totalOrders ?? raw.orderCount ?? raw.ordersCount ?? 0
  const lastOrderRaw = raw.lastOrder ?? raw.lastOrderDate ?? raw.updatedAt ?? ''
  const lastOrder = typeof lastOrderRaw === 'string' && lastOrderRaw.length >= 10
    ? new Date(lastOrderRaw).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
    : '—'
  // Base status on isActive: true → Active, false → Inactive (also treat status blocked/suspended as Inactive)
  const inactiveStatuses = ['blocked', 'suspended', 'inactive']
  const statusFromField = String(raw.status ?? '').toLowerCase()
  const isInactive = raw.isActive === false || inactiveStatuses.includes(statusFromField)
  const statusLabel = isInactive ? 'Inactive' : 'Active'
  return {
    userId: id,
    fullName,
    email,
    phone,
    totalOrders,
    lastOrder,
    lastOrderRaw: typeof lastOrderRaw === 'string' ? lastOrderRaw.slice(0, 10) : '',
    status: statusLabel,
  }
}

function buildColumns(onView: (id: string) => void, onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    {
      key: 'fullName',
      label: 'Full Name',
      render: (v) => (
        <span className="inline-flex items-center gap-2">
          <UserIcon />
          <span>{String(v ?? '')}</span>
        </span>
      ),
    },
    { key: 'phone', label: 'Phone Number' },
    { key: 'totalOrders', label: 'Total Orders' },
    { key: 'lastOrder', label: 'Last Order' },
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
        const id = String(row.userId ?? '')
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

const Users = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  // Filter by isActive: Active → isActive=true, Inactive → isActive=false (backend filters by isActive)
  const isActiveFilter = status === 'all' ? undefined : status === 'suspended' ? false : true
  const { data: apiResponse, isLoading } = useGetUsersQuery({
    page,
    pageSize,
    isActive: isActiveFilter,
    text: search.trim() || undefined,
  })
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation()

  const rawList = useMemo(() => {
    const d = apiResponse?.data
    if (!d) return []
    if (Array.isArray(d)) return d as Record<string, unknown>[]
    const obj = d as Record<string, unknown>
    if (Array.isArray(obj.users)) return obj.users as Record<string, unknown>[]
    if (Array.isArray(obj.content)) return obj.content as Record<string, unknown>[]
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
    return []
  }, [apiResponse])

  const totalFromApi = useMemo(() => {
    const d = apiResponse?.data as Record<string, unknown> | undefined
    if (!d || Array.isArray(d)) return rawList.length
    const t = (d.totalUsers as number) ?? (d.total as number) ?? (d.totalCount as number) ?? rawList.length
    return Number(t) || rawList.length
  }, [apiResponse, rawList.length])

  const mappedList = useMemo(() => rawList.map(mapUserToRow), [rawList])
  const total = totalFromApi
  const tableData = useMemo(
    () => mappedList.map((r, i) => ({ ...r, rowNum: (page - 1) * pageSize + i + 1 })),
    [mappedList, page, pageSize]
  )

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => navigate(`/users/${id}`),
        (id) => {
          setDeleteUserId(id)
          setDeleteModalOpen(true)
        }
      ),
    [navigate]
  )

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setPage(1)
  }
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }
  const handleExport = () => console.log('Export')

  const handleDeleteUser = async () => {
    if (!deleteUserId) return
    try {
      const result = await deleteUser(deleteUserId).unwrap()
      sSnack(result?.message ?? 'User deleted successfully')
      setDeleteModalOpen(false)
      setDeleteUserId(null)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete user'
      eSnack(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Users Management</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage users</p>
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
        searchPlaceholder="Search by name, email, or phone..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        showDate={false}
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

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

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteUserId(null) }}
        title="Delete User"
        description="Deleting the user will permanently remove their account, order history, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteUserId(null) }, variant: 'secondary' },
          { label: 'Delete User', onClick: handleDeleteUser, variant: 'danger', disabled: isDeleteLoading },
        ]}
      />
    </div>
  )
}

export default Users
