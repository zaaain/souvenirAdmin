import { useState, useMemo } from 'react'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'
import { useGetWithdrawalsQuery, useApproveWithdrawalMutation, useRejectWithdrawalMutation } from '@store/features/withdrawal'
import { eSnack, sSnack } from '@hooks/useToast'

const ITEMS_PER_PAGE = 10

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

function VendorCell({ name, site }: { name: string; site: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-xs font-ManropeBold">
          P
        </span>
        <span className="font-ManropeBold text-gray-800">{name}</span>
      </div>
      {site && (
        <a href={`https://${site}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-0.5 block truncate max-w-[180px]">
          {site}
        </a>
      )}
    </div>
  )
}

const EarningPayout = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: apiResponse, isLoading } = useGetWithdrawalsQuery({
    page,
    pageSize,
  })
  const [approveWithdrawal, { isLoading: isApproveLoading }] = useApproveWithdrawalMutation()
  const [rejectWithdrawal, { isLoading: isRejectLoading }] = useRejectWithdrawalMutation()

  const list = useMemo(() => {
    const res = apiResponse as Record<string, unknown> | undefined
    if (!res) return []
    const dataObj = res.data as Record<string, unknown> | undefined
    if (!dataObj) return []
    const raw =
      dataObj.withdrawals ??
      dataObj.requests ??
      dataObj.items ??
      dataObj.content ??
      dataObj.data ??
      dataObj.list
    return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
  }, [apiResponse])

  const total = useMemo(() => {
    const res = apiResponse as Record<string, unknown> | undefined
    const dataObj = res?.data as Record<string, unknown> | undefined
    if (!dataObj) return list.length
    if (dataObj.totalWithdrawals != null) return Number(dataObj.totalWithdrawals)
    if (dataObj.totalElements != null) return Number(dataObj.totalElements)
    if (dataObj.total != null) return Number(dataObj.total)
    if (dataObj.totalCount != null) return Number(dataObj.totalCount)
    return list.length
  }, [apiResponse, list.length])

  const tableData = useMemo(() => {
    const start = (page - 1) * pageSize
    return list.map((row, index) => {
      const id = String(row._id ?? row.id ?? row.withdrawalId ?? '')

      const vendor = (row.vendor ?? row.vendorId) as Record<string, unknown> | undefined
      const vendorName =
        String(row.vendorName ?? '').trim() ||
        [vendor?.firstname, vendor?.lastname].filter(Boolean).join(' ').trim() ||
        String(vendor?.businessName ?? vendor?.fullName ?? '') ||
        '—'
      const vendorSite = String(row.vendorWebsite ?? vendor?.website ?? vendor?.storeUrl ?? '') || ''

      const amountRaw = row.amount ?? row.totalAmount ?? row.withdrawAmount ?? 0
      const amount =
        typeof amountRaw === 'number'
          ? `QAR ${Number(amountRaw).toLocaleString()}`
          : String(amountRaw ?? '')

      const feeRaw = row.fee ?? row.commission ?? row.charge ?? 0
      const fee =
        typeof feeRaw === 'number'
          ? `QAR ${Number(feeRaw).toLocaleString()}`
          : feeRaw
            ? String(feeRaw)
            : '-'

      const bankDetails = row.bankDetails as
        | {
            bankName?: string
            accountHolderName?: string
            accountNumber?: string | number
            accountType?: string
          }
        | undefined

      const payoutMethod = String(
        row.payoutMethod ??
          row.paymentMethod ??
          row.method ??
          (bankDetails?.bankName ? 'Bank Transfer' : '')
      )

      const bankMask =
        row.bankMask ??
        row.maskedAccount ??
        bankDetails?.accountNumber ??
        row.accountNumber ??
        row.iban ??
        ''

      const holder =
        row.bankHolder ??
        row.accountHolderName ??
        bankDetails?.accountHolderName ??
        vendorName

      const dateRaw = row.requestDate ?? row.createdAt ?? row.updatedAt ?? ''
      const date =
        typeof dateRaw === 'string' && dateRaw.length >= 10
          ? new Date(dateRaw).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : String(dateRaw ?? '')

      const statusRaw = String(
        row.status ??
          row.payoutStatus ??
          row.withdrawalStatus ??
          'pending'
      ).toLowerCase()
      const status =
        statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)

      return {
        id,
        rowNum: start + index + 1,
        vendorName,
        vendorSite,
        bankMask: bankMask ? String(bankMask) : '—',
        bankHolder: String(holder ?? ''),
        amount,
        commission: fee,
        payoutMethod,
        date,
        status,
        statusRaw,
      }
    })
  }, [list, page])

  const stats = useMemo(() => {
    const totalRequested = list.length
    const pending = list.filter((r) => {
      const status = String(
        (r.status ??
          (r as Record<string, unknown>).payoutStatus ??
          (r as Record<string, unknown>).withdrawalStatus ??
          'pending') as string
      ).toLowerCase()
      return status === 'pending'
    }).length
    const approved = list.filter((r) => {
      const status = String(
        (r.status ??
          (r as Record<string, unknown>).payoutStatus ??
          (r as Record<string, unknown>).withdrawalStatus ??
          '') as string
      ).toLowerCase()
      return status === 'approved' || status === 'success' || status === 'completed'
    }).length
    const totalAmount = list.reduce((sum, r) => {
      const val = (r.amount ??
        (r as Record<string, unknown>).totalAmount ??
        (r as Record<string, unknown>).withdrawAmount) as number | string | undefined
      const num =
        typeof val === 'number'
          ? val
          : typeof val === 'string'
            ? Number(val.replace(/[^\d.-]/g, '')) || 0
            : 0
      return sum + num
    }, 0)
    return {
      totalAmount,
      totalRequested,
      pending,
      approved,
    }
  }, [list])

  const statCards = useMemo(
    () => [
      {
        label: 'Total Requested Amount',
        value: `QAR ${stats.totalAmount.toLocaleString()}`,
        bar: 'bg-primary',
      },
      {
        label: 'Total Requests',
        value: String(stats.totalRequested),
        bar: 'bg-emerald-500',
      },
      {
        label: 'Pending Requests',
        value: String(stats.pending),
        bar: 'bg-amber-500',
      },
      {
        label: 'Approved Requests',
        value: String(stats.approved),
        bar: 'bg-emerald-400',
      },
    ],
    [stats],
  )

  const columns: TableColumn[] = useMemo(
    () => [
      { key: 'rowNum', label: '#' },
      {
        key: 'vendorName',
        label: 'Vendor',
        render: (_v, row) => (
          <VendorCell
            name={String(row.vendorName ?? '')}
            site={String(row.vendorSite ?? '')}
          />
        ),
      },
      {
        key: 'bankMask',
        label: 'Bank Account',
        render: (v, row) => (
          <div>
            <p className="text-sm font-Manrope text-gray-800">
              {String(v ?? '')}
            </p>
            <p className="text-xs text-gray-500">
              {String(row.bankHolder ?? '')}
            </p>
          </div>
        ),
      },
      { key: 'amount', label: 'Amount' },
      { key: 'commission', label: 'Platform Fee' },
      { key: 'payoutMethod', label: 'Payout Method' },
      { key: 'date', label: 'Requested On' },
      {
        key: 'status',
        label: 'Status',
        render: (_v, row) => {
          const raw = String(row.statusRaw ?? '').toLowerCase()
          const pillClass = STATUS_PILL[raw] ?? 'bg-gray-100 text-gray-600'
          return (
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope capitalize ${pillClass}`}>
              {String(row.status ?? '')}
            </span>
          )
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_v, row) => {
          const id = String(row.id ?? '')
          const raw = String(row.statusRaw ?? '').toLowerCase()
          const isPending = raw === 'pending'
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(id)
                  setActionType('approve')
                }}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Approve withdrawal"
                disabled={!isPending}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(id)
                  setActionType('reject')
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reject withdrawal"
                disabled={!isPending}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        },
      },
    ],
    [],
  )

  const isActionModalOpen = Boolean(selectedId && actionType)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  const handleCloseModal = () => {
    setSelectedId(null)
    setActionType(null)
    setRejectReason('')
  }

  const handleConfirmAction = async () => {
    if (!selectedId || !actionType) return
    try {
      if (actionType === 'approve') {
        const result = await approveWithdrawal(selectedId).unwrap()
        sSnack(result?.message ?? 'Withdrawal approved successfully')
      } else {
        const trimmed = rejectReason.trim()
        if (!trimmed) return
        const result = await rejectWithdrawal({
          id: selectedId,
          body: { reason: trimmed },
        }).unwrap()
        sSnack(result?.message ?? 'Withdrawal rejected')
      }
      handleCloseModal()
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update withdrawal'
      eSnack(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Earning & Payout</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage vendor withdrawal requests and payouts</p>
        </div>
        <button
          type="button"
          onClick={() => console.log('Export')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Export
        </button>
      </div>

      <div>
        <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Payout Dashboard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-start justify-between relative overflow-hidden">
              <div>
                <p className="text-base font-ManropeBold text-gray-800">{c.label}</p>
                <p className="text-xl font-ManropeBold text-primary mt-1">{c.value}</p>
              </div>
              <div className={`absolute right-0 top-0 bottom-0 w-3 rounded-r-xl ${c.bar}`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-ManropeBold text-gray-800 mb-4">
          Withdrawal Requests
        </h3>
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
      </div>

      <Modal
        isOpen={isActionModalOpen}
        onClose={handleCloseModal}
        title={actionType === 'reject' ? 'Reject Withdrawal' : 'Approve Withdrawal'}
        description={
          actionType === 'reject'
            ? 'Please provide a reason for rejecting this withdrawal request. The vendor will not receive this payout.'
            : 'Are you sure you want to approve this withdrawal request and release the payout to the vendor?'
        }
        iconType={actionType === 'reject' ? 'error' : 'success'}
        actions={[
          { label: 'Cancel', onClick: handleCloseModal, variant: 'secondary' },
          {
            label: actionType === 'reject' ? 'Reject Withdrawal' : 'Approve Withdrawal',
            onClick: handleConfirmAction,
            variant: actionType === 'reject' ? 'danger' : 'primary',
            disabled:
              isApproveLoading ||
              isRejectLoading ||
              (actionType === 'reject' && !rejectReason.trim()),
          },
        ]}
      >
        {actionType === 'reject' && (
          <div className="mt-4">
            <label className="block text-sm font-Manrope text-gray-700 mb-1">
              Rejection Reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-Manrope focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="Enter reason for rejecting this withdrawal..."
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EarningPayout
