import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'

const STATUS_PILL: Record<string, string> = {
  Active: 'bg-primary text-white',
  Suspended: 'bg-gray-100 text-gray-600',
}

const MOCK_ADMINS: Record<string, unknown>[] = [
  { adminId: 't-001', fullName: 'John Bushmill', email: 'aramirez@skyhigh.com', status: 'Active' },
  { adminId: 't-002', fullName: 'Josh Adam', email: 'josh@company.com', status: 'Active' },
  { adminId: 't-003', fullName: 'Sarah Johnson', email: 'sarah.johnson@email.com', status: 'Active' },
  { adminId: 't-004', fullName: 'Michael Chen', email: 'mchen@admin.com', status: 'Suspended' },
  { adminId: 't-005', fullName: 'Emma Wilson', email: 'emma.w@team.com', status: 'Active' },
  { adminId: 't-006', fullName: 'David Lee', email: 'david.lee@mail.com', status: 'Active' },
]

interface TeamDetailData {
  fullName: string
  email: string
  status: string
  personal: VendorInfoCardItem[]
}

const MOCK_DETAIL: Record<string, TeamDetailData> = {
  't-003': {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    status: 'Active',
    personal: [
      { label: 'User ID', value: 'LD-2025-001' },
      { label: 'Phone', value: '+1 (555) 123-4567' },
      { label: 'Member Since', value: 'March 15, 2023' },
    ],
  },
}

function getTeamDetail(id: string): TeamDetailData | null {
  if (MOCK_DETAIL[id]) return MOCK_DETAIL[id]
  const fromList = MOCK_ADMINS.find((v) => String(v.adminId) === id) as Record<string, unknown> | undefined
  if (!fromList) return null
  return {
    fullName: String(fromList.fullName ?? '—'),
    email: String(fromList.email ?? '—'),
    status: String(fromList.status ?? '—'),
    personal: [
      { label: 'User ID', value: '—' },
      { label: 'Phone', value: String(fromList.phone ?? '—') },
      { label: 'Member Since', value: '—' },
    ],
  }
}

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const detail = id ? getTeamDetail(id) : null
  const isActive = detail?.status === 'Active'
  const isSuspended = detail?.status === 'Suspended'

  if (!id || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/team" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Team
        </Link>
        <p className="text-gray-600">Admin not found.</p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[detail.status] ?? 'bg-gray-100 text-gray-600'
  const initial = detail.fullName ? detail.fullName.charAt(0).toUpperCase() : '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/team"
            className="shrink-0 p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Team"
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
            aria-label="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {isActive && (
            <button
              type="button"
              onClick={() => setSuspendModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-Manrope hover:bg-red-600 transition-colors"
            >
              Suspend
            </button>
          )}
          {isSuspended && (
            <button
              type="button"
              onClick={() => setReactivateModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      <VendorInfoCard heading="Personal Information" data={detail.personal} />

      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title="Inactivate User"
        description="Are you sure you want to inactivate this user? The user's access will be temporarily disabled until reactivated."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setSuspendModalOpen(false), variant: 'secondary' },
          { label: 'Inactivate User', onClick: () => { console.log('Suspend', id); setSuspendModalOpen(false); }, variant: 'danger' },
        ]}
      />

      <Modal
        isOpen={reactivateModalOpen}
        onClose={() => setReactivateModalOpen(false)}
        title="Reactivate User"
        description="Reactivating this user will restore their access to the system."
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => setReactivateModalOpen(false), variant: 'secondary' },
          { label: 'Reactivate User', onClick: () => { console.log('Reactivate', id); setReactivateModalOpen(false); }, variant: 'primary' },
        ]}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        description="Deleting the user will permanently remove their account, associated data, and access from the system. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setDeleteModalOpen(false), variant: 'secondary' },
          { label: 'Delete User', onClick: () => { console.log('Delete', id); setDeleteModalOpen(false); }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default TeamDetail
