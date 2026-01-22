import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'

const STATUS_PILL: Record<string, string> = {
  Active: 'bg-primary text-white',
  Inactive: 'bg-gray-100 text-gray-600',
}

const MOCK_USERS: Record<string, unknown>[] = [
  { userId: '2025-001', fullName: 'Sarah Johnson', email: 'AkachiOkoro@gmail.com', phone: '+1 415 555 0123', status: 'Active' },
  { userId: '2025-002', fullName: 'Michael Chen', email: 'RicardoEstevan@gmail.com', phone: '+1 415 555 0123', status: 'Active' },
  { userId: '2025-003', fullName: 'Emma Rodriguez', email: 'DeepaSingh@gmail.com', phone: '+1 415 555 0123', status: 'Active' },
  { userId: '2025-004', fullName: 'David Thompson', email: 'KenjiTanaka@gmail.com', phone: '+1 415 555 0123', status: 'Inactive' },
  { userId: '2025-005', fullName: 'Lisa Anderson', email: 'LiesTorres@gmail.com', phone: '+1 415 555 0123', status: 'Inactive' },
  { userId: '2025-006', fullName: 'Lisa Anderson', email: 'RicardoEstevan@gmail.com', phone: '+1 415 555 0123', status: 'Inactive' },
  { userId: '2025-007', fullName: 'James Wilson', email: 'james.w@example.com', phone: '+1 415 555 0124', status: 'Active' },
  { userId: '2025-008', fullName: 'Maria Garcia', email: 'maria.g@example.com', phone: '+1 415 555 0125', status: 'Active' },
  { userId: '2025-009', fullName: 'Robert Brown', email: 'robert.b@example.com', phone: '+1 415 555 0126', status: 'Inactive' },
  { userId: '2025-010', fullName: 'Jennifer Lee', email: 'jennifer.lee@example.com', phone: '+1 415 555 0127', status: 'Active' },
  { userId: '2025-011', fullName: 'Christopher Davis', email: 'chris.d@example.com', phone: '+1 415 555 0128', status: 'Inactive' },
  { userId: '2025-012', fullName: 'Amanda White', email: 'amanda.w@example.com', phone: '+1 415 555 0129', status: 'Active' },
  { userId: '2025-013', fullName: 'Daniel Martinez', email: 'daniel.m@example.com', phone: '+1 415 555 0130', status: 'Inactive' },
  { userId: '2025-014', fullName: 'Jessica Taylor', email: 'jessica.t@example.com', phone: '+1 415 555 0131', status: 'Active' },
  { userId: '2025-015', fullName: 'Kevin Robinson', email: 'kevin.r@example.com', phone: '+1 415 555 0132', status: 'Inactive' },
]

interface UserDetailData {
  fullName: string
  email: string
  status: string
  business: VendorInfoCardItem[]
  creditCard: VendorInfoCardItem[]
}

const MOCK_DETAIL: Record<string, UserDetailData> = {
  '2025-001': {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    status: 'Active',
    business: [
      { label: 'User ID', value: 'LD-2025-001' },
      { label: 'Phone', value: '+1 (555) 123-4567' },
      { label: 'Member Since', value: 'March 15, 2023' },
      { label: 'Business Address', value: '1234 Market Street, Suite 500, San Francisco, CA 94103', colSpan: 3 },
    ],
    creditCard: [
      { label: 'Card Holder Name', value: 'Sarah Johnson' },
      { label: 'Card Number', value: '**** **** **** 1234' },
      { label: 'Card Type', value: 'VISA' },
    ],
  },
}

function getUserDetail(id: string): UserDetailData | null {
  if (MOCK_DETAIL[id]) return MOCK_DETAIL[id]
  const fromList = MOCK_USERS.find((v) => String(v.userId) === id) as Record<string, unknown> | undefined
  if (!fromList) return null
  return {
    fullName: String(fromList.fullName ?? '—'),
    email: String(fromList.email ?? '—'),
    status: String(fromList.status ?? '—'),
    business: [
      { label: 'User ID', value: String(fromList.userId ?? '—') },
      { label: 'Phone', value: String(fromList.phone ?? '—') },
      { label: 'Member Since', value: '—' },
      { label: 'Business Address', value: '—', colSpan: 3 },
    ],
    creditCard: [
      { label: 'Card Holder Name', value: '—' },
      { label: 'Card Number', value: '—' },
      { label: 'Card Type', value: '—' },
    ],
  }
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [inactivateModalOpen, setInactivateModalOpen] = useState(false)
  const [activateModalOpen, setActivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const detail = id ? getUserDetail(id) : null
  const isActive = detail?.status === 'Active'
  const isInactive = detail?.status === 'Inactive'

  if (!id || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/users" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </Link>
        <p className="text-gray-600">User not found.</p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[detail.status] ?? 'bg-gray-100 text-gray-600'
  const initial = detail.fullName ? detail.fullName.charAt(0).toUpperCase() : '—'

  return (
    <div className="space-y-6">
      {/* Header: Back | Avatar | Name+Status, Email | Delete, Inactivate */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/users"
            className="shrink-0 p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Users"
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
            {detail.email && detail.email !== '—' && (
              <p className="inline-flex items-center gap-1.5 text-sm font-Manrope text-gray-600 mt-1">
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {detail.email}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            aria-label="Delete User"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {isActive && (
            <button
              type="button"
              onClick={() => setInactivateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-Manrope hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
              Inactivate
            </button>
          )}
          {isInactive && (
            <button
              type="button"
              onClick={() => setActivateModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
            >
              Activate
            </button>
          )}
        </div>
      </div>

      <VendorInfoCard heading="Business Information" data={detail.business} />
      <VendorInfoCard heading="Credit Card Information" data={detail.creditCard} />

      <Modal
        isOpen={inactivateModalOpen}
        onClose={() => setInactivateModalOpen(false)}
        title="Inactivate User"
        description="Inactivating the user will disable their account and restrict their access to the platform. You can reactivate them later if needed."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setInactivateModalOpen(false), variant: 'secondary' },
          { label: 'Inactivate User', onClick: () => { console.log('Inactivate', id); setInactivateModalOpen(false); }, variant: 'danger' },
        ]}
      />

      <Modal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        title="Activate User"
        description="Activating the user will restore their account and grant them full access to the platform."
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => setActivateModalOpen(false), variant: 'secondary' },
          { label: 'Activate User', onClick: () => { console.log('Activate', id); setActivateModalOpen(false); }, variant: 'primary' },
        ]}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        description="Deleting the user will permanently remove their account, order history, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setDeleteModalOpen(false), variant: 'secondary' },
          { label: 'Delete User', onClick: () => { console.log('Delete', id); setDeleteModalOpen(false); }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default UserDetail
