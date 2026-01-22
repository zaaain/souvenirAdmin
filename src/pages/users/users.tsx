import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const STATUS_PILL: Record<string, string> = {
  Active: 'bg-primary text-white',
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

const MOCK_USERS: Record<string, unknown>[] = [
  { userId: '2025-001', fullName: 'Sarah Johnson', email: 'AkachiOkoro@gmail.com', phone: '+1 415 555 0123', totalOrders: 12, lastOrder: 'Jan 15, 2025', lastOrderRaw: '2025-01-15', status: 'Active' },
  { userId: '2025-002', fullName: 'Michael Chen', email: 'RicardoEstevan@gmail.com', phone: '+1 415 555 0123', totalOrders: 3, lastOrder: 'Jan 15, 2025', lastOrderRaw: '2025-01-15', status: 'Active' },
  { userId: '2025-003', fullName: 'Emma Rodriguez', email: 'DeepaSingh@gmail.com', phone: '+1 415 555 0123', totalOrders: 42, lastOrder: 'Jan 15, 2025', lastOrderRaw: '2025-01-15', status: 'Active' },
  { userId: '2025-004', fullName: 'David Thompson', email: 'KenjiTanaka@gmail.com', phone: '+1 415 555 0123', totalOrders: 42, lastOrder: 'Jan 15, 2025', lastOrderRaw: '2025-01-15', status: 'Inactive' },
  { userId: '2025-005', fullName: 'Lisa Anderson', email: 'LiesTorres@gmail.com', phone: '+1 415 555 0123', totalOrders: 12, lastOrder: 'Jan 15, 2025', lastOrderRaw: '2025-01-15', status: 'Inactive' },
  { userId: '2025-006', fullName: 'Lisa Anderson', email: 'RicardoEstevan@gmail.com', phone: '+1 415 555 0123', totalOrders: 32, lastOrder: 'Jan 15, 2025', lastOrderRaw: '2025-01-15', status: 'Inactive' },
  { userId: '2025-007', fullName: 'James Wilson', email: 'james.w@example.com', phone: '+1 415 555 0124', totalOrders: 8, lastOrder: 'Jan 14, 2025', lastOrderRaw: '2025-01-14', status: 'Active' },
  { userId: '2025-008', fullName: 'Maria Garcia', email: 'maria.g@example.com', phone: '+1 415 555 0125', totalOrders: 25, lastOrder: 'Jan 13, 2025', lastOrderRaw: '2025-01-13', status: 'Active' },
  { userId: '2025-009', fullName: 'Robert Brown', email: 'robert.b@example.com', phone: '+1 415 555 0126', totalOrders: 5, lastOrder: 'Jan 12, 2025', lastOrderRaw: '2025-01-12', status: 'Inactive' },
  { userId: '2025-010', fullName: 'Jennifer Lee', email: 'jennifer.lee@example.com', phone: '+1 415 555 0127', totalOrders: 19, lastOrder: 'Jan 11, 2025', lastOrderRaw: '2025-01-11', status: 'Active' },
  { userId: '2025-011', fullName: 'Christopher Davis', email: 'chris.d@example.com', phone: '+1 415 555 0128', totalOrders: 7, lastOrder: 'Jan 10, 2025', lastOrderRaw: '2025-01-10', status: 'Inactive' },
  { userId: '2025-012', fullName: 'Amanda White', email: 'amanda.w@example.com', phone: '+1 415 555 0129', totalOrders: 31, lastOrder: 'Jan 9, 2025', lastOrderRaw: '2025-01-09', status: 'Active' },
  { userId: '2025-013', fullName: 'Daniel Martinez', email: 'daniel.m@example.com', phone: '+1 415 555 0130', totalOrders: 4, lastOrder: 'Jan 8, 2025', lastOrderRaw: '2025-01-08', status: 'Inactive' },
  { userId: '2025-014', fullName: 'Jessica Taylor', email: 'jessica.t@example.com', phone: '+1 415 555 0131', totalOrders: 18, lastOrder: 'Jan 7, 2025', lastOrderRaw: '2025-01-07', status: 'Active' },
  { userId: '2025-015', fullName: 'Kevin Robinson', email: 'kevin.r@example.com', phone: '+1 415 555 0132', totalOrders: 9, lastOrder: 'Jan 6, 2025', lastOrderRaw: '2025-01-06', status: 'Inactive' },
]

const ITEMS_PER_PAGE = 10

function buildColumns(onView: (id: string) => void, onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    { key: 'userId', label: 'User ID' },
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
    { key: 'email', label: 'Email' },
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
  const [lastOrderOn, setLastOrderOn] = useState('')
  const [page, setPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...MOCK_USERS]
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          String(r.fullName).toLowerCase().includes(q) ||
          String(r.email).toLowerCase().includes(q) ||
          String(r.phone).toLowerCase().includes(q)
      )
    }
    if (lastOrderOn) {
      list = list.filter((r) => String(r.lastOrderRaw ?? '') === lastOrderOn)
    }
    return list
  }, [search, status, lastOrderOn])

  const total = filtered.length
  const start = (page - 1) * ITEMS_PER_PAGE
  const sliced = filtered.slice(start, start + ITEMS_PER_PAGE).map((r, i) => ({
    ...r,
    rowNum: start + i + 1,
  }))

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
    setLastOrderOn('')
    setPage(1)
  }
  const handleExport = () => console.log('Export')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Users Management</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage users</p>
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
        searchPlaceholder="Search by name, email, or phone..."
        statusValue={status}
        onStatusChange={setStatus}
        statusOptions={STATUS_OPTIONS}
        dateValue={lastOrderOn}
        onDateChange={setLastOrderOn}
        dateLabel="Last Order On"
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
        onClose={() => { setDeleteModalOpen(false); setDeleteUserId(null) }}
        title="Delete User"
        description="Deleting the user will permanently remove their account, order history, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteUserId(null) }, variant: 'secondary' },
          { label: 'Delete User', onClick: () => { console.log('Delete', deleteUserId); setDeleteModalOpen(false); setDeleteUserId(null) }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default Users
