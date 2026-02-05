import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { TailSpin } from 'react-loader-spinner'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'
import { SimpleTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetVendorByIdQuery, useUpdateVendorApprovalMutation, useUpdateVendorStatusMutation, useDeleteVendorMutation } from '@store/features/vendor'
import { eSnack, sSnack } from '@hooks/useToast'

const NA = 'N/A'

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Active: 'bg-primary text-white',
  Rejected: 'bg-red-100 text-red-700',
  Inactive: 'bg-gray-100 text-gray-600',
}

interface VendorDetailData {
  fullName: string
  status: string
  website: string
  totalProducts: number
  totalOrders: number
  revenue: string
  business: VendorInfoCardItem[]
  primaryContact: VendorInfoCardItem[]
  bankPayout: VendorInfoCardItem[]
  documents: { documentName: string; documentNumber: string; link: string; expiryDate: string }[]
}

/** Map API vendor object to VendorDetailData; missing keys show N/A */
function mapApiVendorToDetail(raw: Record<string, unknown>): VendorDetailData {
  const id = String(raw._id ?? raw.id ?? '')
  const fullName =
    String(raw.fullName ?? raw.businessName ?? '').trim() ||
    [raw.firstname, raw.lastname].filter(Boolean).join(' ').trim() ||
    NA
  const statusRaw = raw.status ?? (raw.isActive === true ? 'Active' : raw.isActive === false ? 'Inactive' : 'Pending')
  const s = String(statusRaw)
  const status = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  const email = raw.email != null && raw.email !== '' ? String(raw.email) : NA
  const phone = raw.phone != null && raw.phone !== '' ? String(raw.phone) : NA
  return {
    fullName,
    status,
    website: raw.website != null && raw.website !== '' ? String(raw.website) : NA,
    totalProducts: Number(raw.productCount ?? raw.totalProducts ?? raw.productsCount ?? 0) || 0,
    totalOrders: Number(raw.orderCount ?? raw.totalOrders ?? raw.ordersCount ?? 0) || 0,
    revenue: raw.revenue != null && raw.revenue !== '' ? String(raw.revenue) : NA,
    business: [
      { label: 'Vendor ID', value: id || NA },
      { label: 'Legal Entity Type', value: raw.legalEntityType != null && raw.legalEntityType !== '' ? String(raw.legalEntityType) : NA },
      { label: 'Tax ID / EIN', value: raw.taxId != null && raw.taxId !== '' ? String(raw.taxId) : NA },
      { label: 'Business Registration Number', value: raw.businessRegistrationNumber != null && raw.businessRegistrationNumber !== '' ? String(raw.businessRegistrationNumber) : NA },
      { label: 'Business Address', value: raw.businessAddress != null && raw.businessAddress !== '' ? String(raw.businessAddress) : NA, colSpan: 3 },
    ],
    primaryContact: [
      { label: 'Primary Contact', value: fullName !== NA ? fullName : NA },
      { label: 'Contact Email', value: email },
      { label: 'Phone Number', value: phone },
    ],
    bankPayout: [
      { label: 'Bank Name', value: raw.bankName != null && raw.bankName !== '' ? String(raw.bankName) : NA },
      { label: 'Account Holder Name', value: raw.accountHolderName != null && raw.accountHolderName !== '' ? String(raw.accountHolderName) : NA },
      { label: 'Account Number', value: raw.accountNumber != null && raw.accountNumber !== '' ? String(raw.accountNumber) : NA },
      { label: 'Routing Number', value: raw.routingNumber != null && raw.routingNumber !== '' ? String(raw.routingNumber) : NA },
      { label: 'Account Type', value: raw.accountType != null && raw.accountType !== '' ? String(raw.accountType) : NA },
      { label: 'Currency', value: raw.currency != null && raw.currency !== '' ? String(raw.currency) : NA },
    ],
    documents: Array.isArray(raw.documents)
      ? (raw.documents as { documentName?: string; documentNumber?: string; link?: string; expiryDate?: string }[]).map((d) => ({
          documentName: d.documentName != null && d.documentName !== '' ? String(d.documentName) : NA,
          documentNumber: d.documentNumber != null && d.documentNumber !== '' ? String(d.documentNumber) : NA,
          link: d.link != null && d.link !== '' ? String(d.link) : NA,
          expiryDate: d.expiryDate != null && d.expiryDate !== '' ? String(d.expiryDate) : NA,
        }))
      : [],
  }
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-h-[150px] flex">
      <div className="flex items-start justify-between w-full">
        <div>
          <p className="text-base font-ManropeBold text-gray-700">{label}</p>
          <p className="text-2xl font-ManropeBold text-primary mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>
      </div>
    </div>
  )
}

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [inactivateModalOpen, setInactivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data: apiResponse, isLoading, isError, refetch } = useGetVendorByIdQuery(id ?? '', { skip: !id })
  const [updateApproval, { isLoading: isApprovalLoading }] = useUpdateVendorApprovalMutation()
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateVendorStatusMutation()
  const [deleteVendor, { isLoading: isDeleteLoading }] = useDeleteVendorMutation()

  const detail = useMemo(() => {
    if (!apiResponse?.data) return null
    const d = apiResponse.data as Record<string, unknown>
    const vendor = (d.data as Record<string, unknown>) ?? d
    if (!vendor || typeof vendor !== 'object') return null
    return mapApiVendorToDetail(vendor as Record<string, unknown>)
  }, [apiResponse])

  const isActive = detail?.status === 'Active'

  if (!id) {
    return (
      <div className="space-y-4">
        <Link to="/vendors" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Vendors
        </Link>
        <p className="text-gray-600">Vendor not found.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <TailSpin visible height={60} width={60} color="#2466D0" ariaLabel="Loading vendor" />
      </div>
    )
  }

  if (isError || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/vendors" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Vendors
        </Link>
        <p className="text-gray-600">Vendor not found.</p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[detail.status] ?? 'bg-gray-100 text-gray-600'

  const docColumns: TableColumn[] = [
    { key: 'rowNum', label: '#' },
    { key: 'documentName', label: 'Document Name' },
    { key: 'documentNumber', label: 'Document Number' },
    {
      key: 'link',
      label: 'Link',
      render: (v) => (
        <a href={String(v)} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block max-w-[200px]">
          {String(v)}
        </a>
      ),
    },
    { key: 'expiryDate', label: 'Expiry Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => console.log('Download', row)}
          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded"
          aria-label="Download"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      ),
    },
  ]
  const docData = detail.documents.map((d, i) => ({ ...d, rowNum: i + 1 }))

  const handleApprove = async () => {
    if (!id) return
    try {
      const result = await updateApproval({ id, body: { action: 'approve', reason: 'All documents verified' } }).unwrap()
      sSnack(result?.message ?? 'Vendor approved successfully')
      setApproveModalOpen(false)
      refetch()
    } catch (err: unknown) {
      eSnack((err as { data?: { message?: string } })?.data?.message ?? 'Failed to approve vendor')
    }
  }
  const handleReject = async () => {
    if (!id) return
    try {
      const result = await updateApproval({ id, body: { action: 'reject', reason: 'Application rejected' } }).unwrap()
      sSnack(result?.message ?? 'Vendor rejected')
      setRejectModalOpen(false)
      refetch()
    } catch (err: unknown) {
      eSnack((err as { data?: { message?: string } })?.data?.message ?? 'Failed to reject vendor')
    }
  }
  const handleInactivate = async () => {
    if (!id) return
    try {
      const result = await updateStatus({ id, body: { action: 'suspend', reason: 'Inactivated from admin' } }).unwrap()
      sSnack(result?.message ?? 'Vendor inactivated')
      setInactivateModalOpen(false)
      refetch()
    } catch (err: unknown) {
      eSnack((err as { data?: { message?: string } })?.data?.message ?? 'Failed to inactivate vendor')
    }
  }
  const handleDelete = async () => {
    if (!id) return
    try {
      const result = await deleteVendor(id).unwrap()
      sSnack(result?.message ?? 'Vendor deleted successfully')
      setDeleteModalOpen(false)
      navigate('/vendors')
    } catch (err: unknown) {
      eSnack((err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete vendor')
    }
  }

  const initial = detail.fullName ? detail.fullName.charAt(0).toUpperCase() : NA

  return (
    <div className="space-y-6">
      {/* Top: Back | Logo | Name+Status, Website | Reject, Approve */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/vendors"
            className="shrink-0 p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Vendors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="shrink-0 w-[100px] h-[100px] rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-600 text-3xl font-ManropeBold">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">{detail.fullName}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${statusClass}`}>
                {detail.status}
              </span>
            </div>
            {detail.website && detail.website !== NA && (
              <a
                href={detail.website.startsWith('http') ? detail.website : `https://${detail.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm font-Manrope mt-1"
              >
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {detail.website}
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 self-start sm:self-center">
          {isActive ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                aria-label="Delete Vendor"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setInactivateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500 text-red-600 bg-white text-sm font-Manrope hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                Inactivate
              </button>
            </div>
          ) : detail.status === 'Inactive' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                aria-label="Delete Vendor"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ) : detail.status === 'Rejected' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                aria-label="Delete Vendor"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
              >
                Approve Vendor
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="px-4 py-2.5 rounded-lg border border-red-500 bg-red-50 text-red-600 text-sm font-Manrope hover:bg-red-100 transition-colors"
              >
                Reject Vendor
              </button>
              <button
                type="button"
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
              >
                Approve Vendor
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Products"
          value={detail.totalProducts}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={detail.totalOrders.toLocaleString()}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={detail.revenue}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      <VendorInfoCard heading="Business Information" data={detail.business} />
      <VendorInfoCard heading="Primary Contact Information" data={detail.primaryContact} />
      <VendorInfoCard heading="Bank & Payout Details" data={detail.bankPayout} />

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Documents & Verification</h3>
        <SimpleTable headers={docColumns} data={docData} />
      </div>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Vendor"
        description="Rejecting the vendor request will deny their account approval and remove the application from the pending list. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setRejectModalOpen(false), variant: 'secondary' },
          { label: 'Reject Vendor', onClick: handleReject, variant: 'danger', disabled: isApprovalLoading },
        ]}
      />

      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Vendor"
        description="Approving this vendor will grant them access to the platform. They will be able to start selling their products."
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => setApproveModalOpen(false), variant: 'secondary' },
          { label: 'Approve Vendor', onClick: handleApprove, variant: 'primary', disabled: isApprovalLoading },
        ]}
      />

      <Modal
        isOpen={inactivateModalOpen}
        onClose={() => setInactivateModalOpen(false)}
        title="Inactivate Vendor"
        description="Inactivating the vendor will disable their account and restrict their access to the platform. You can reactivate them later if needed."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setInactivateModalOpen(false), variant: 'secondary' },
          { label: 'Inactivate Vendor', onClick: handleInactivate, variant: 'danger', disabled: isStatusLoading },
        ]}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Vendor"
        description="Deleting the vendor will permanently remove their account, associated data, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setDeleteModalOpen(false), variant: 'secondary' },
          { label: 'Delete Vendor', onClick: handleDelete, variant: 'danger', disabled: isDeleteLoading },
        ]}
      />
    </div>
  )
}

export default VendorDetail
