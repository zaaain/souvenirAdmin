import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter } from '@components/filter'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetVendorsQuery, useDeleteVendorMutation } from '@store/features/vendor'
import { eSnack, sSnack } from '@hooks/useToast'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Active', label: 'Active' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Inactive', label: 'Inactive' },
]

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Active: 'bg-blue-100 text-blue-700',
  Rejected: 'bg-red-100 text-red-700',
  Inactive: 'bg-gray-100 text-gray-600',
}

function StoreIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </span>
  )
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

function buildColumns(
  onView: (id: string) => void,
  onApprove: (id: string) => void,
  onDelete: (id: string) => void
): TableColumn[] {
  return [
    { key: 'rowNum', label: '#' },
    {
      key: 'fullName',
      label: 'Full Name',
      render: (v) => (
        <span className="inline-flex items-center gap-2">
          <StoreIcon />
          <span>{String(v ?? '')}</span>
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'dateJoined', label: 'Date Joined' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope capitalize ${STATUS_PILL[String(v ?? '')] ?? 'bg-gray-100 text-gray-600'}`}>
          {String(v ?? '')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const id = String(row.vendorId ?? '')
        const isPending = row.status === 'Pending'
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
            {isPending && (
              <button
                type="button"
                onClick={() => onApprove(id)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                aria-label="Approve"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
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

/** Map API vendor item to table row shape (without rowNum) */
function mapVendorToRow(raw: Record<string, unknown>): Record<string, unknown> {
  const id = String(raw._id ?? raw.id ?? raw.vendorId ?? '')
  const fullName =
    String(raw.fullName ?? raw.businessName ?? '').trim() ||
    [raw.firstname, raw.lastname].filter(Boolean).join(' ').trim() ||
    '-'
  const email = String(raw.email ?? '')
  const phone = String(raw.phone ?? raw.phoneNumber ?? '')
  const revenue = raw.revenue != null ? String(raw.revenue) : '-'
  const dateJoined = raw.dateJoined ?? raw.createdAt ?? '-'
  const dateJoinedRaw = typeof dateJoined === 'string' ? dateJoined.slice(0, 10) : ''
  const status = String(
    raw.status ??
    (raw.isActive === true ? 'Active' : raw.isActive === false ? 'Inactive' : 'Pending')
  )
  return {
    vendorId: id,
    fullName,
    email,
    phone,
    revenue,
    dateJoined: dateJoinedRaw || '-',
    dateJoinedRaw,
    status,
  }
}

const Vendors = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [dateJoined, setDateJoined] = useState('')
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null)

  const { data: apiResponse, isLoading } = useGetVendorsQuery({ page, pageSize })
  const [deleteVendor, { isLoading: isDeleteLoading }] = useDeleteVendorMutation()

  const rawList = useMemo(() => {
    const d = apiResponse?.data
    if (!d) return []
    if (Array.isArray(d)) return d as Record<string, unknown>[]
    const obj = d as Record<string, unknown>
    if (Array.isArray(obj.users)) return obj.users as Record<string, unknown>[]
    if (Array.isArray(obj.vendors)) return obj.vendors as Record<string, unknown>[]
    if (Array.isArray(obj.list)) return obj.list as Record<string, unknown>[]
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[]
    return []
  }, [apiResponse])

  const totalFromApi = useMemo(() => {
    const d = apiResponse?.data as Record<string, unknown> | undefined
    if (!d || Array.isArray(d)) return rawList.length
    const t = (d.totalUsers as number) ?? (d.total as number) ?? (d.totalCount as number) ?? rawList.length
    return Number(t) || rawList.length
  }, [apiResponse, rawList.length])

  const mappedList = useMemo(() => rawList.map(mapVendorToRow), [rawList])

  const filtered = useMemo(() => {
    let list = mappedList
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
    if (dateJoined) {
      list = list.filter((r) => String(r.dateJoinedRaw ?? '') === dateJoined)
    }
    return list
  }, [mappedList, search, status, dateJoined])

  const total = status !== 'all' || search.trim() || dateJoined ? filtered.length : totalFromApi
  const tableData = useMemo(() => {
    if (status !== 'all' || search.trim() || dateJoined) {
      const start = (page - 1) * pageSize
      return filtered.slice(start, start + pageSize).map((r, i) => ({ ...r, rowNum: start + i + 1 }))
    }
    return mappedList.map((r, i) => ({ ...r, rowNum: (page - 1) * pageSize + i + 1 }))
  }, [mappedList, filtered, page, pageSize, status, search, dateJoined])

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => navigate(`/vendors/${id}`),
        (id) => console.log('Approve', id),
        (id) => {
          setDeleteVendorId(id)
          setDeleteModalOpen(true)
        }
      ),
    [navigate]
  )

  const handleApply = () => setPage(1)
  const handleClearAll = () => {
    setSearch('')
    setStatus('all')
    setDateJoined('')
    setPage(1)
  }
  // const handleExport = () => console.log('Export')
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }
  const handleDeleteVendor = async () => {
    if (!deleteVendorId) return
    try {
      const result = await deleteVendor(deleteVendorId).unwrap()
      sSnack(result?.message ?? 'Vendor deleted successfully')
      setDeleteModalOpen(false)
      setDeleteVendorId(null)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete vendor'
      eSnack(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Vendor Management</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage and approve vendor registrations</p>
        </div>
        {/* Export button - commented out */}
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
        onClose={() => { setDeleteModalOpen(false); setDeleteVendorId(null) }}
        title="Delete Vendor"
        description="Deleting the vendor will permanently remove their account, associated data, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setDeleteModalOpen(false); setDeleteVendorId(null) }, variant: 'secondary' },
          { label: 'Delete Vendor', onClick: handleDeleteVendor, variant: 'danger', disabled: isDeleteLoading },
        ]}
      />
    </div>
  )
}

export default Vendors
