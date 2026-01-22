import { useState, useMemo } from 'react'
import { Modal } from '@components/modal'
import { PaginateTable } from '@components/table'
import type { TableColumn } from '@components/table'

const STAT_CARDS = [
  { label: 'Total Revenue', value: '$248,592.00', bar: 'bg-primary' },
  { label: 'Escrow Balance', value: '$18,420.00', bar: 'bg-emerald-500' },
  { label: 'Total Requested Payouts', value: '43', bar: 'bg-emerald-400' },
  { label: 'Resolved Payouts', value: '1,847', bar: 'bg-primary' },
]

const PAYOUT_STATUS: Record<string, string> = {
  Pending: 'bg-amber-500 text-white',
  Success: 'bg-emerald-500 text-white',
}

const RECORD_STATUS: Record<string, string> = {
  Pending: 'bg-amber-500 text-white',
  Success: 'bg-emerald-500 text-white',
  Failed: 'bg-red-500 text-white',
}

const MOCK_PAYOUTS: Record<string, unknown>[] = [
  { id: 'po-1', vendorName: 'PetShop', vendorSite: 'www.techgearsolutions.com', bankMask: '*********** 1234', bankHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Jan 1-15, 2025', status: 'Pending' },
  { id: 'po-2', vendorName: 'PetShop', vendorSite: 'www.techgearsolutions.com', bankMask: '*********** 1234', bankHolder: 'Maddie Fox', amount: '$125,000', commission: '$350.00 (10%)', period: 'Jan 1-15, 2025', status: 'Pending' },
  { id: 'po-3', vendorName: 'PetShop', vendorSite: 'www.techgearsolutions.com', bankMask: '*********** 1234', bankHolder: 'Maddie Fox', amount: '$123,000', commission: '$324.00 (10%)', period: 'Dec 16-31, 2024', status: 'Success' },
  { id: 'po-4', vendorName: 'PetShop', vendorSite: 'www.techgearsolutions.com', bankMask: '*********** 1234', bankHolder: 'Maddie Fox', amount: '$98,500', commission: '$265.00 (10%)', period: 'Dec 1-15, 2024', status: 'Success' },
  { id: 'po-5', vendorName: 'PetShop', vendorSite: 'www.techgearsolutions.com', bankMask: '*********** 1234', bankHolder: 'Maddie Fox', amount: '$87,200', commission: '$232.00 (10%)', period: 'Nov 16-30, 2024', status: 'Success' },
  { id: 'po-6', vendorName: 'PetShop', vendorSite: 'www.techgearsolutions.com', bankMask: '*********** 1234', bankHolder: 'Maddie Fox', amount: '$112,000', commission: '$298.00 (10%)', period: 'Nov 1-15, 2024', status: 'Success' },
]

const MOCK_RECORDS: Record<string, unknown>[] = [
  { id: 'pr-1', invoiceId: 'TXN-2025-4A2B', orderId: 'ORD-10583', vendorName: 'PetShop', vendorSite: 'www.techgearsolut...', customerName: 'James Patterson', customerEmail: 'j.patterson@email.com', paymentMask: '********* 1234', amount: '$123,000', paymentMethod: 'MasterCard', date: 'Jan 15, 2025', status: 'Pending' },
  { id: 'pr-2', invoiceId: 'TXN-2025-5B3C', orderId: 'ORD-10584', vendorName: 'PetShop', vendorSite: 'www.techgearsolut...', customerName: 'Sarah Miller', customerEmail: 's.miller@email.com', paymentMask: '********* 5678', amount: '$45,000', paymentMethod: 'VISA', date: 'Jan 15, 2025', status: 'Success' },
  { id: 'pr-3', invoiceId: 'TXN-2025-6C4D', orderId: 'ORD-10585', vendorName: 'PetShop', vendorSite: 'www.techgearsolut...', customerName: 'Michael Brown', customerEmail: 'm.brown@email.com', paymentMask: '********* 9012', amount: '$28,500', paymentMethod: 'COD', date: 'Jan 14, 2025', status: 'Success' },
  { id: 'pr-4', invoiceId: 'TXN-2025-7D5E', orderId: 'ORD-10586', vendorName: 'PetShop', vendorSite: 'www.techgearsolut...', customerName: 'Emily Davis', customerEmail: 'e.davis@email.com', paymentMask: '********* 3456', amount: '$67,000', paymentMethod: 'MasterCard', date: 'Jan 14, 2025', status: 'Failed' },
  { id: 'pr-5', invoiceId: 'TXN-2025-8E6F', orderId: 'ORD-10587', vendorName: 'PetShop', vendorSite: 'www.techgearsolut...', customerName: 'David Wilson', customerEmail: 'd.wilson@email.com', paymentMask: '********* 7890', amount: '$34,200', paymentMethod: 'VISA', date: 'Jan 13, 2025', status: 'Success' },
  { id: 'pr-6', invoiceId: 'TXN-2025-9F7A', orderId: 'ORD-10588', vendorName: 'PetShop', vendorSite: 'www.techgearsolut...', customerName: 'Lisa Anderson', customerEmail: 'l.anderson@email.com', paymentMask: '********* 2345', amount: '$89,100', paymentMethod: 'MasterCard', date: 'Jan 13, 2025', status: 'Pending' },
]

const ITEMS_PER_PAGE = 10
const TOTAL_RESULTS = 147

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

function CustomerCell({ name, email }: { name: string; email: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : '—'
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-ManropeBold">
        {initial}
      </div>
      <div>
        <p className="text-sm font-Manrope text-gray-800">{name}</p>
        <p className="text-xs text-gray-500 truncate max-w-[140px]">{email}</p>
      </div>
    </div>
  )
}

const EarningPayout = () => {
  const [activeTab, setActiveTab] = useState<'payouts' | 'records'>('payouts')
  const [page, setPage] = useState(1)
  const [releaseModalOpen, setReleaseModalOpen] = useState(false)
  const [releasePayoutId, setReleasePayoutId] = useState<string | null>(null)

  const payoutColumns: TableColumn[] = useMemo(
    () => [
      { key: 'rowNum', label: '#' },
      {
        key: 'vendorName',
        label: 'Vendor',
        render: (_, row) => (
          <VendorCell name={String(row.vendorName ?? '')} site={String(row.vendorSite ?? '')} />
        ),
      },
      {
        key: 'bankMask',
        label: 'Bank Account',
        render: (v, row) => (
          <div>
            <p className="text-sm font-Manrope text-gray-800">{String(v ?? '')}</p>
            <p className="text-xs text-gray-500">{String(row.bankHolder ?? '')}</p>
          </div>
        ),
      },
      { key: 'amount', label: 'Amount' },
      { key: 'commission', label: 'Commission' },
      { key: 'period', label: 'Period' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${PAYOUT_STATUS[String(v ?? '')] ?? 'bg-gray-100 text-gray-600'}`}>
            {String(v ?? '')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_, row) => {
          const id = String(row.id ?? '')
          const isPending = row.status === 'Pending'
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => console.log('Download', id)}
                className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded"
                aria-label="Download"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              {isPending && (
                <button
                  type="button"
                  onClick={() => { setReleasePayoutId(id); setReleaseModalOpen(true) }}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                  aria-label="Release"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
            </div>
          )
        },
      },
    ],
    []
  )

  const recordColumns: TableColumn[] = useMemo(
    () => [
      { key: 'rowNum', label: '#' },
      {
        key: 'invoiceId',
        label: 'Invoice ID',
        render: (v, row) => (
          <div>
            <p className="text-sm font-Manrope text-gray-800">{String(v ?? '')}</p>
            <a href="#" className="text-xs text-primary hover:underline" onClick={(e) => { e.preventDefault(); console.log('Order', row.orderId) }}>
              Order #{String(row.orderId ?? '')}
            </a>
          </div>
        ),
      },
      {
        key: 'vendorName',
        label: 'Vendor',
        render: (_, row) => (
          <VendorCell name={String(row.vendorName ?? '')} site={String(row.vendorSite ?? '')} />
        ),
      },
      {
        key: 'customerName',
        label: 'Customer',
        render: (_, row) => (
          <CustomerCell name={String(row.customerName ?? '')} email={String(row.customerEmail ?? '')} />
        ),
      },
      { key: 'paymentMask', label: 'Payment Information' },
      { key: 'amount', label: 'Amount' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'date', label: 'Date' },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${RECORD_STATUS[String(v ?? '')] ?? 'bg-gray-100 text-gray-600'}`}>
            {String(v ?? '')}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_, row) => (
          <button
            type="button"
            onClick={() => console.log('Download', row.id)}
            className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded"
            aria-label="Download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        ),
      },
    ],
    []
  )

  const payoutsData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return MOCK_PAYOUTS.slice(0, 6).map((r, i) => ({ ...r, rowNum: start + i + 1 }))
  }, [page])

  const recordsData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return MOCK_RECORDS.slice(0, 6).map((r, i) => ({ ...r, rowNum: start + i + 1 }))
  }, [page])

  const handleTabChange = (tab: 'payouts' | 'records') => {
    setActiveTab(tab)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Earning & Payout</h1>
          <p className="text-gray-500 font-Manrope mt-1">Manage your orders</p>
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

      {/* Payout Dashboard - Stat cards */}
      <div>
        <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Payout Dashboard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((c) => (
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => handleTabChange('payouts')}
            className={`pb-3 text-sm font-ManropeBold transition-colors border-b-2 -mb-px ${
              activeTab === 'payouts' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Payment Payouts
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('records')}
            className={`pb-3 text-sm font-ManropeBold transition-colors border-b-2 -mb-px ${
              activeTab === 'records' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Payment Records
          </button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-base font-ManropeBold text-gray-800 mb-4">
          {activeTab === 'payouts' ? 'Payment Payouts' : 'Payment Records'}
        </h3>
        <PaginateTable
          headers={activeTab === 'payouts' ? payoutColumns : recordColumns}
          data={activeTab === 'payouts' ? payoutsData : recordsData}
          currentPage={page}
          itemsPerPage={ITEMS_PER_PAGE}
          totalResults={TOTAL_RESULTS}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={releaseModalOpen}
        onClose={() => { setReleaseModalOpen(false); setReleasePayoutId(null) }}
        title="Release Payment"
        description="Are you sure you want to release the payment? The payout request will be approved and payment will be disbursed to the vendor's bank account."
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => { setReleaseModalOpen(false); setReleasePayoutId(null) }, variant: 'secondary' },
          { label: 'Release Payment', onClick: () => { console.log('Release', releasePayoutId); setReleaseModalOpen(false); setReleasePayoutId(null) }, variant: 'primary' },
        ]}
      />
    </div>
  )
}

export default EarningPayout
