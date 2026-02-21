import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import {
  useGetSubadminsQuery,
  useDeleteSubadminMutation,
} from '@store/features/team'
import { eSnack, sSnack } from '@hooks/useToast'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Inactive' },
]

const STATUS_PILL: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  Active: 'bg-primary/10 text-primary',
  suspended: 'bg-red-100 text-red-700',
  Suspended: 'bg-red-100 text-red-700',
  inactive: 'bg-red-100 text-red-700',
  Inactive: 'bg-red-100 text-red-700',
}

const ITEMS_PER_PAGE = 10

function mapSubadminToRow(raw: Record<string, unknown>, index: number, startIndex: number): Record<string, unknown> {
  const id = String(raw._id ?? raw.id ?? '')
  const firstname = String(raw.firstname ?? '').trim()
  const lastname = String(raw.lastname ?? '').trim()
  const fullName = [firstname, lastname].filter(Boolean).join(' ') || '—'
  const email = String(raw.email ?? '')
  const phone = String(raw.phone ?? raw.phoneNumber ?? '')
  const createdAt = raw.createdAt ?? raw.dateAdded ?? raw.created_at ?? ''
  const dateStr = typeof createdAt === 'string' ? createdAt.slice(0, 10) : ''
  const dateAdded = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const status = String(raw.status ?? (raw.isActive === true ? 'active' : raw.isActive === false ? 'suspended' : 'active'))
  return {
    adminId: id,
    userId: raw.userId ?? id,
    fullName,
    email,
    emailSecondary: email,
    phone,
    dateAdded,
    dateAddedRaw: dateStr,
    status,
    rowNum: startIndex + index + 1,
  }
}

function buildColumns(onView: (id: string) => void, onEdit: (id: string) => void, onDelete: (id: string) => void): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    {
      key: 'fullName',
      label: 'Full Name',
      render: (v) => <span className="text-sm font-ManropeBold text-gray-800">{String(v ?? '')}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'dateAdded', label: 'Date Added' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => {
        const val = String(v ?? '')
        const display = val.toLowerCase() === 'suspended' ? 'Inactive' : val
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope capitalize ${STATUS_PILL[val] ?? 'bg-gray-100 text-gray-600'}`}>
            {display}
          </span>
        )
      },
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
              onClick={() => onEdit(id)}
              className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-colors"
              aria-label="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
  const [page, setPage] = useState(1)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null)

  const { data: apiResponse, isLoading } = useGetSubadminsQuery({
    page,
    pageSize: ITEMS_PER_PAGE,
    status: status !== 'all' ? status : undefined,
    text: search.trim() || undefined,
  })
  const [deleteSubadmin, { isLoading: isDeleteLoading }] = useDeleteSubadminMutation()

  const rawList = useMemo(() => {
    const d = apiResponse?.data
    if (!d) return []
    if (Array.isArray(d)) return d as Record<string, unknown>[]
    const obj = d as Record<string, unknown>
    if (Array.isArray(obj.subadmins)) return obj.subadmins as Record<string, unknown>[]
    if (Array.isArray(obj.content)) return obj.content as Record<string, unknown>[]
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
    if (Array.isArray(obj.list)) return obj.list as Record<string, unknown>[]
    return []
  }, [apiResponse])

  const totalFromApi = useMemo(() => {
    const d = apiResponse?.data as Record<string, unknown> | undefined
    if (!d || Array.isArray(d)) return rawList.length
    const t = (d.total as number) ?? (d.totalCount as number) ?? (d.totalSubadmins as number) ?? rawList.length
    return Number(t) ?? rawList.length
  }, [apiResponse, rawList.length])

  const tableData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return rawList.map((r, i) => mapSubadminToRow(r, i, start))
  }, [rawList, page])

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => navigate(`/team/${id}`),
        (id) => navigate(`/team/${id}/edit`),
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
    setPage(1)
  }
  // const handleExport = () => console.log('Export')
  const handleAddAdmin = () => navigate('/team/add')

  const handleDeleteConfirm = async () => {
    if (!deleteAdminId) return
    try {
      await deleteSubadmin(deleteAdminId).unwrap()
      sSnack('Subadmin deleted successfully.')
      setDeleteModalOpen(false)
      setDeleteAdminId(null)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : 'Failed to delete subadmin.'
      eSnack(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Team Management</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your teams.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button> */}
          <button
            type="button"
            onClick={handleAddAdmin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Team Member
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
        showDate={false}
        onApply={handleApply}
        onClearAll={handleClearAll}
      />

      <PaginateTable
        headers={columns}
        data={tableData}
        currentPage={page}
        itemsPerPage={ITEMS_PER_PAGE}
        totalResults={totalFromApi}
        onPageChange={setPage}
        loading={isLoading}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteAdminId(null) }}
        title="Delete User"
        description="Deleting the user will permanently remove their account, associated data, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteAdminId(null) }, variant: 'secondary' },
          { label: 'Delete User', onClick: handleDeleteConfirm, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default Team
