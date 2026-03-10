import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'
import { useGetUserByIdQuery, useUpdateUserStatusMutation, useDeleteUserMutation } from '@store/features/user'
import { eSnack, sSnack } from '@hooks/useToast'

const NA = '—'

const STATUS_PILL: Record<string, string> = {
  Active: 'bg-primary text-white',
  Inactive: 'bg-gray-100 text-gray-600',
  active: 'bg-primary text-white',
  suspended: 'bg-gray-100 text-gray-600',
}

interface UserDetailData {
  fullName: string
  email: string
  status: string
  statusApi: 'active' | 'suspended'
  business: VendorInfoCardItem[]
  creditCard: VendorInfoCardItem[]
}

function mapApiUserToDetail(raw: Record<string, unknown>): UserDetailData {
  const id = String(raw._id ?? raw.id ?? '')
  const fullName =
    String(raw.fullName ?? '').trim() ||
    [raw.firstname, raw.lastname].filter(Boolean).join(' ').trim() ||
    NA
  const email = raw.email != null && raw.email !== '' ? String(raw.email) : NA
  // Prefer isActive: when false → show Inactive + Activate button; when true → Active + Inactivate button
  const inactiveStatuses = ['blocked', 'suspended', 'inactive']
  const statusFromField = String(raw.status ?? '').toLowerCase()
  const isInactiveFromApi = raw.isActive === false || inactiveStatuses.includes(statusFromField)
  const statusApi = isInactiveFromApi ? 'suspended' : 'active'
  const status = statusApi === 'suspended' ? 'Inactive' : 'Active'
  const phone = raw.phone != null && raw.phone !== '' ? String(raw.phone) : NA
  const memberSince = raw.createdAt ?? raw.memberSince ?? raw.dateJoined ?? ''
  const memberSinceFormatted = typeof memberSince === 'string' && memberSince.length >= 10
    ? new Date(memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : NA
  const address = raw.address ?? raw.businessAddress ?? raw.billingAddress ?? NA
  return {
    fullName,
    email,
    status,
    statusApi,
    business: [
      { label: 'User ID', value: id || NA },
      { label: 'Phone', value: phone },
      { label: 'Member Since', value: memberSinceFormatted },
      { label: 'Business Address', value: address !== NA ? String(address) : NA, colSpan: 3 },
    ],
    creditCard: [
      { label: 'Card Holder Name', value: raw.cardHolderName != null ? String(raw.cardHolderName) : NA },
      { label: 'Card Number', value: raw.cardNumber != null ? String(raw.cardNumber) : NA },
      { label: 'Card Type', value: raw.cardType != null ? String(raw.cardType) : NA },
    ],
  }
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inactivateModalOpen, setInactivateModalOpen] = useState(false)
  const [activateModalOpen, setActivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  const { data: apiResponse, isLoading, isError } = useGetUserByIdQuery(id!, { skip: !id })
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateUserStatusMutation()
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation()

  const detail = useMemo(() => {
    if (!apiResponse?.data) return null
    const raw = apiResponse.data as Record<string, unknown>
    return mapApiUserToDetail(raw)
  }, [apiResponse])

  const isActive = detail?.status === 'Active' || detail?.statusApi === 'active'
  const isInactive = detail?.status === 'Inactive' || detail?.statusApi === 'suspended'

  const handleSuspend = async () => {
    if (!id) return
    try {
      await updateStatus({ id, body: { action: 'suspend', reason: suspendReason || undefined } }).unwrap()
      sSnack('User suspended successfully')
      setInactivateModalOpen(false)
      setSuspendReason('')
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to suspend user'
      eSnack(msg)
    }
  }

  const handleActivate = async () => {
    if (!id) return
    try {
      await updateStatus({ id, body: { action: 'activate' } }).unwrap()
      sSnack('User activated successfully')
      setActivateModalOpen(false)
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to activate user'
      eSnack(msg)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteUser(id).unwrap()
      sSnack('User deleted successfully')
      setDeleteModalOpen(false)
      navigate('/users')
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete user'
      eSnack(msg)
    }
  }

  if (!id) {
    return (
      <div className="space-y-4">
        <Link to="/users" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </Link>
        <p className="text-gray-600">User ID is missing.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
            <div className="shrink-0 w-[100px] h-[100px] rounded-full bg-gray-100 animate-pulse" />
            <div className="min-w-0 space-y-2">
              <div className="h-7 w-52 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-4 w-36 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Business Information card skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="h-4 w-44 bg-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
            {[1, 2, 3].map((k) => (
              <div key={k} className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-36 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
            <div className="space-y-2 lg:col-span-3">
              <div className="h-3 w-28 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Credit Card Information card skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="h-4 w-44 bg-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
            {[1, 2, 3].map((k) => (
              <div key={k} className="space-y-2">
                <div className="h-3 w-24 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-4 w-36 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !detail) {
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
        onClose={() => { setInactivateModalOpen(false); setSuspendReason('') }}
        title="Inactivate User"
        description="Inactivating the user will disable their account and restrict their access to the platform. You can reactivate them later if needed."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => { setInactivateModalOpen(false); setSuspendReason('') }, variant: 'secondary' },
          { label: 'Inactivate User', onClick: handleSuspend, variant: 'danger', disabled: isStatusLoading },
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
          { label: 'Activate User', onClick: handleActivate, variant: 'primary', disabled: isStatusLoading },
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
          { label: 'Delete User', onClick: handleDelete, variant: 'danger', disabled: isDeleteLoading },
        ]}
      />
    </div>
  )
}

export default UserDetail
