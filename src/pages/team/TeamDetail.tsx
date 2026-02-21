import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { TailSpin } from 'react-loader-spinner'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'
import {
  useGetSubadminByIdQuery,
  useUpdateSubadminStatusMutation,
  useDeleteSubadminMutation,
} from '@store/features/team'
import { eSnack, sSnack } from '@hooks/useToast'

const STATUS_PILL: Record<string, string> = {
  active: 'bg-primary text-white',
  Active: 'bg-primary text-white',
  suspended: 'bg-gray-100 text-gray-600',
  Suspended: 'bg-gray-100 text-gray-600',
  inactive: 'bg-gray-100 text-gray-600',
  Inactive: 'bg-gray-100 text-gray-600',
}

function buildPersonalItems(raw: Record<string, unknown>): VendorInfoCardItem[] {
  const id = String(raw._id ?? raw.id ?? '')
  const role = String(raw.role ?? raw.roleName ?? raw.roleType ?? '—').trim() || '—'
  const createdAt = raw.createdAt ?? raw.created_at ?? raw.dateAdded
  const memberSince =
    typeof createdAt === 'string'
      ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '—'
  return [
    { label: 'User ID', value: id || '—' },
    { label: 'Role', value: role },
    { label: 'Member Since', value: memberSince },
  ]
}

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data: apiResponse, isLoading, isError } = useGetSubadminByIdQuery(id!, { skip: !id })
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateSubadminStatusMutation()
  const [deleteSubadmin, { isLoading: isDeleteLoading }] = useDeleteSubadminMutation()

  const raw = apiResponse?.data as Record<string, unknown> | undefined
  const firstname = String(raw?.firstname ?? '').trim()
  const lastname = String(raw?.lastname ?? '').trim()
  const fullName = [firstname, lastname].filter(Boolean).join(' ') || '—'
  const email = String(raw?.email ?? '—')
  const status = String(raw?.status ?? (raw?.isActive === true ? 'active' : raw?.isActive === false ? 'suspended' : 'active'))
  const personal = raw ? buildPersonalItems(raw) : []

  const isActive = status.toLowerCase() === 'active'
  const isSuspended = status.toLowerCase() === 'suspended'

  if (!id) {
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <TailSpin visible height={60} width={60} color="#2466D0" ariaLabel="Loading team member" />
      </div>
    )
  }

  if (isError || !raw) {
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

  const statusClass = STATUS_PILL[status] ?? 'bg-gray-100 text-gray-600'
  const initial = fullName !== '—' ? fullName.charAt(0).toUpperCase() : '—'

  const handleSuspend = async () => {
    try {
      await updateStatus({ id, body: { action: 'deactivate' } }).unwrap()
      sSnack('User set to inactive.')
      setSuspendModalOpen(false)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : 'Failed to suspend user.'
      eSnack(message)
    }
  }

  const handleReactivate = async () => {
    try {
      await updateStatus({ id, body: { action: 'activate' } }).unwrap()
      sSnack('User reactivated.')
      setReactivateModalOpen(false)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : 'Failed to reactivate user.'
      eSnack(message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSubadmin(id).unwrap()
      sSnack('Subadmin deleted successfully.')
      setDeleteModalOpen(false)
      navigate('/team')
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
              <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">{fullName}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope capitalize ${statusClass}`}>
                {status.toLowerCase() === 'suspended' ? 'Inactive' : status}
              </span>
            </div>
            {email && email !== '—' && (
              <p className="inline-flex items-center gap-1.5 text-sm font-Manrope text-gray-600 mt-1">
                <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => navigate(`/team/${id}/edit`)}
            className="px-4 py-2.5 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            disabled={isDeleteLoading}
            className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
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
              disabled={isStatusLoading}
              className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-Manrope hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Inactive
            </button>
          )}
          {isSuspended && (
            <button
              type="button"
              onClick={() => setReactivateModalOpen(true)}
              disabled={isStatusLoading}
              className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      <VendorInfoCard heading="Personal Information" data={personal} />

      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title="Inactivate User"
        description="Are you sure you want to inactivate this user? The user's access will be temporarily disabled until reactivated."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setSuspendModalOpen(false), variant: 'secondary' },
          { label: 'Inactivate User', onClick: handleSuspend, variant: 'danger' },
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
          { label: 'Reactivate User', onClick: handleReactivate, variant: 'primary' },
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
          { label: 'Delete User', onClick: handleDelete, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default TeamDetail
