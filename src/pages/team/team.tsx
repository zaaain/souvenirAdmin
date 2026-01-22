import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
]

const STATUS_PILL: Record<string, string> = {
  Active: 'bg-primary/10 text-primary',
  Suspended: 'bg-red-100 text-red-700',
}

const MOCK_ADMINS: Record<string, unknown>[] = [
  { adminId: 't-001', userId: '#12345678901', fullName: 'John Bushmill', email: 'aramirez@skyhigh.com', emailSecondary: 'johnb@mail.com', phone: '+1 555 123 4567', dateAdded: 'Jan 15, 2025', dateAddedRaw: '2025-01-15', status: 'Active' },
  { adminId: 't-002', userId: '#12345678902', fullName: 'Josh Adam', email: 'josh@company.com', emailSecondary: 'josh_adam@mail.com', phone: '+1 555 123 4568', dateAdded: 'Jan 15, 2025', dateAddedRaw: '2025-01-15', status: 'Active' },
  { adminId: 't-003', userId: '#12345678903', fullName: 'Sarah Johnson', email: 'sarah.johnson@email.com', emailSecondary: 'sarah.j@mail.com', phone: '+1 555 123 4569', dateAdded: 'Jan 15, 2025', dateAddedRaw: '2025-01-15', status: 'Active' },
  { adminId: 't-004', userId: '#12345678904', fullName: 'Michael Chen', email: 'mchen@admin.com', emailSecondary: 'm.chen@mail.com', phone: '+1 555 123 4570', dateAdded: 'Jan 14, 2025', dateAddedRaw: '2025-01-14', status: 'Suspended' },
  { adminId: 't-005', userId: '#12345678905', fullName: 'Emma Wilson', email: 'emma.w@team.com', emailSecondary: 'emma.wilson@mail.com', phone: '+1 555 123 4571', dateAdded: 'Jan 13, 2025', dateAddedRaw: '2025-01-13', status: 'Active' },
  { adminId: 't-006', userId: '#12345678906', fullName: 'David Lee', email: 'david.lee@mail.com', emailSecondary: 'd.lee@mail.com', phone: '+1 555 123 4572', dateAdded: 'Jan 12, 2025', dateAddedRaw: '2025-01-12', status: 'Active' },
]

const ITEMS_PER_PAGE = 10

function buildColumns(onView: (id: string) => void, onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    { key: 'userId', label: 'User ID' },
    {
      key: 'fullName',
      label: 'Full Name',
      render: (v, row) => {
        const name = String(v ?? '')
        const initial = name ? name.charAt(0).toUpperCase() : '—'
        const secondary = String(row.emailSecondary ?? row.email ?? '')
        return (
          <div className="inline-flex items-center gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-600 text-sm font-ManropeBold">
              {initial}
            </div>
            <div>
              <p className="text-sm font-ManropeBold text-gray-800">{name}</p>
              {secondary && <p className="text-xs font-Manrope text-primary">{secondary}</p>}
            </div>
          </div>
        )
      },
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Number' },
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
        const id = String(row.adminId ?? '')
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

const Team = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dateAdded, setDateAdded] = useState('')
  const [page, setPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...MOCK_ADMINS]
    if (status !== 'all') list = list.filter((r) => r.status === status)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          String(r.fullName).toLowerCase().includes(q) ||
          String(r.adminId).toLowerCase().includes(q) ||
          String(r.userId).toLowerCase().includes(q) ||
          String(r.email).toLowerCase().includes(q)
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
        (id) => navigate(`/team/${id}`),
        (id) => {
          setDeleteAdminId(id)
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
  const handleAddAdmin = () => navigate('/team/add')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Team Management</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your admins.</p>
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
            onClick={handleAddAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Admin
          </button>
        </div>
      </div>

      <Filter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, id, email..."
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
        onClose={() => { setDeleteModalOpen(false); setDeleteAdminId(null) }}
        title="Delete User"
        description="Deleting the user will permanently remove their account, associated data, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteAdminId(null) }, variant: 'secondary' },
          { label: 'Delete User', onClick: () => { console.log('Delete', deleteAdminId); setDeleteModalOpen(false); setDeleteAdminId(null) }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default Team
