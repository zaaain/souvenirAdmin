import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'
import { SimpleTable } from '@components/table'
import type { TableColumn } from '@components/table'

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Active: 'bg-primary text-white',
  Rejected: 'bg-red-100 text-red-700',
  Inactive: 'bg-gray-100 text-gray-600',
}

const MOCK_VENDORS: Record<string, unknown>[] = [
  { vendorId: '2025-001', fullName: 'Petclinics', email: 'contact@petclinics.com', status: 'Pending' },
  { vendorId: '2025-002', fullName: 'PetShop', email: 'info@petshop.com', status: 'Pending' },
  { vendorId: '2025-003', fullName: 'Vet Care', status: 'Rejected' },
  { vendorId: '2025-004', fullName: 'Care.it', status: 'Inactive' },
  { vendorId: '2025-005', fullName: 'Petclinics', status: 'Pending' },
  { vendorId: '2025-006', fullName: 'Animal Health', status: 'Active' },
  { vendorId: '2025-007', fullName: 'VetCare Plus', status: 'Pending' },
  { vendorId: '2025-008', fullName: 'PetFeed Co', status: 'Active' },
  { vendorId: '2025-009', fullName: 'FarmVet', status: 'Rejected' },
  { vendorId: '2025-010', fullName: 'PetStore Online', status: 'Active' },
  { vendorId: '2025-011', fullName: 'Vet Solutions', status: 'Inactive' },
  { vendorId: '2025-012', fullName: 'Care Plus', status: 'Active' },
]

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

/** Dummy documents for Documents & Verification SimpleTable — use when vendor has no docs */
const DOCUMENTS_DUMMY_DATA: { documentName: string; documentNumber: string; link: string; expiryDate: string }[] = [
  { documentName: 'Business License', documentNumber: '1232141232121', link: 'https://veritas.com/verify/doc/98765432109876543210', expiryDate: 'Jan 15, 2025' },
  { documentName: 'Tax Registration Certificate', documentNumber: '1232141232121', link: 'https://acme.com/verify/doc/56789012345678901234', expiryDate: 'Jan 15, 2025' },
  { documentName: 'Bank Account Verification', documentNumber: '1232141232121', link: 'https://veritas.com/verify/doc/11223344556677889900', expiryDate: 'Jan 15, 2025' },
]

const MOCK_DETAIL: Record<string, VendorDetailData> = {
  '2025-002': {
    fullName: 'PetShop',
    status: 'Active',
    website: 'www.techgearsolutions.com',
    totalProducts: 14,
    totalOrders: 2847,
    revenue: '$123,000',
    business: [
      { label: 'Vendor ID', value: 'LD-2025-001' },
      { label: 'Legal Entity Type', value: 'Corporation (C-Corp)' },
      { label: 'Tax ID / EIN', value: '12-123123456' },
      { label: 'Business Registration Number', value: 'BRN-2847392847' },
      { label: 'Business Address', value: '1234 Market Street, Suite 500, San Francisco, CA 94103', colSpan: 3 },
    ],
    primaryContact: [
      { label: 'Primary Contact', value: 'Michael Chen' },
      { label: 'Contact Email', value: 'michael.chen@techgear.com' },
      { label: 'Phone Number', value: '+1 (415) 555-0198' },
    ],
    bankPayout: [
      { label: 'Bank Name', value: 'Wells Fargo Bank' },
      { label: 'Account Holder Name', value: 'PetShop' },
      { label: 'Account Number', value: '********1234' },
      { label: 'Routing Number', value: '121000248' },
      { label: 'Account Type', value: 'Business Checking' },
      { label: 'Currency', value: 'USD' },
    ],
    documents: [
      { documentName: 'Business License', documentNumber: '1232141232121', link: 'https://veritas.com/verify/doc/98765432109876543210', expiryDate: 'Jan 15, 2025' },
      { documentName: 'Tax Registration Certificate', documentNumber: '1232141232121', link: 'https://acme.com/verify/doc/56789012345678901234', expiryDate: 'Jan 15, 2025' },
      { documentName: 'Bank Account Verification', documentNumber: '1232141232121', link: 'https://veritas.com/verify/doc/11223344556677889900', expiryDate: 'Jan 15, 2025' },
    ],
  },
}

function getVendorDetail(id: string): VendorDetailData | null {
  if (MOCK_DETAIL[id]) return MOCK_DETAIL[id]
  const fromList = MOCK_VENDORS.find((v) => String(v.vendorId) === id) as Record<string, unknown> | undefined
  if (!fromList) return null
  return {
    fullName: String(fromList.fullName ?? '—'),
    status: String(fromList.status ?? '—'),
    website: '—',
    totalProducts: 0,
    totalOrders: 0,
    revenue: '—',
    business: [
      { label: 'Vendor ID', value: String(fromList.vendorId ?? '—') },
      { label: 'Legal Entity Type', value: '—' },
      { label: 'Tax ID / EIN', value: '—' },
      { label: 'Business Registration Number', value: '—' },
      { label: 'Business Address', value: '—', colSpan: 3 },
    ],
    primaryContact: [
      { label: 'Primary Contact', value: '—' },
      { label: 'Contact Email', value: String(fromList.email ?? '—') },
      { label: 'Phone Number', value: '—' },
    ],
    bankPayout: [
      { label: 'Bank Name', value: '—' },
      { label: 'Account Holder Name', value: '—' },
      { label: 'Account Number', value: '—' },
      { label: 'Routing Number', value: '—' },
      { label: 'Account Type', value: '—' },
      { label: 'Currency', value: '—' },
    ],
    documents: [],
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [inactivateModalOpen, setInactivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const detail = id ? getVendorDetail(id) : null
  const isActive = detail?.status === 'Active'

  if (!id || !detail) {
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
  const docRows = detail.documents.length > 0 ? detail.documents : DOCUMENTS_DUMMY_DATA
  const docData = docRows.map((d, i) => ({ ...d, rowNum: i + 1 }))

  const initial = detail.fullName ? detail.fullName.charAt(0).toUpperCase() : '—'

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
            {detail.website && detail.website !== '—' && (
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
          { label: 'Reject Vendor', onClick: () => { console.log('Reject', id); setRejectModalOpen(false); }, variant: 'danger' },
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
          { label: 'Approve Vendor', onClick: () => { console.log('Approve', id); setApproveModalOpen(false); }, variant: 'primary' },
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
          { label: 'Inactivate Vendor', onClick: () => { console.log('Inactivate', id); setInactivateModalOpen(false); }, variant: 'danger' },
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
          { label: 'Delete Vendor', onClick: () => { console.log('Delete', id); setDeleteModalOpen(false); }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default VendorDetail
