import { useParams, Link } from 'react-router-dom'
import { SimpleTable } from '@components/table'
import type { TableColumn } from '@components/table'

const TRACK_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: 'cart' },
  { key: 'processing', label: 'Processing', icon: 'refresh' },
  { key: 'packed', label: 'Packed', icon: 'package' },
  { key: 'shipping', label: 'Shipping', icon: 'truck' },
  { key: 'delivered', label: 'Delivered', icon: 'check' },
]

const STATUS_PILL: Record<string, string> = {
  'Order Placed': 'bg-gray-100 text-gray-600',
  Processing: 'bg-gray-100 text-gray-600',
  Packed: 'bg-primary/10 text-primary',
  Shipping: 'bg-orange-100 text-orange-600',
  Delivered: 'bg-red-100 text-red-600',
}

const MOCK_ORDER = {
  orderId: '302012',
  status: 'Delivered',
  trackStep: 4,
  trackDates: ['12/12/2022, 03:00', '12/12/2022, 03:00', '12/12/2022, 03:00', '12/12/2022, 03:00', '12/12/2022, 03:00'],
  items: [
    { productName: 'Amoxicillin 50 MG', sku: '302012', qty: 1, price: '$123,000', total: '$123,000' },
    { productName: 'Amoxicillin 50 MG', sku: '302012', qty: 2, price: '$50,000', total: '$100,000' },
    { productName: 'Amoxicillin 50 MG', sku: '302012', qty: 1, price: '$123,000', total: '$123,000' },
  ],
  subtotal: '$123,000',
  vat: '$0',
  deliveryFee: '$123,000',
  documents: [
    { name: 'Invoice', size: '1.8 MB', generated: 'Generated Jan 10, 2025' },
    { name: 'Delivery Proof', size: '1.8 MB', generated: 'Generated Jan 10, 2025' },
  ],
  commission: '$123.00',
  billingAddress: '3051 Wehner Port, New Kingcester 68500-4356',
  shippingAddress: '3051 Wehner Port, New Kingcester 68500-4356',
  customerName: 'John Bushmill',
  customerPhone: '+1 123 123 1234',
  customerEmail: 'Johnb@mail.com',
}

function ProductIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </span>
  )
}

function StepIcon({ icon, active }: { icon: string; active: boolean }) {
  const cn = active ? 'text-primary' : 'text-gray-400'
  if (icon === 'cart') {
    return (
      <svg className={`w-5 h-5 ${cn}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
  if (icon === 'refresh') {
    return (
      <svg className={`w-5 h-5 ${cn}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  }
  if (icon === 'package') {
    return (
      <svg className={`w-5 h-5 ${cn}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  }
  if (icon === 'truck') {
    return (
      <svg className={`w-5 h-5 ${cn}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8m2 1-4v4m-2-4h.01M17 16h5m-1-4v4m-4 0V8m-4 4v.01" />
      </svg>
    )
  }
  return (
    <svg className={`w-5 h-5 ${cn}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const order = id ? MOCK_ORDER : null
  const stepIndex = order?.trackStep ?? 0

  if (!id || !order) {
    return (
      <div className="space-y-4">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>
        <p className="text-gray-600">Order not found.</p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[order.status] ?? 'bg-gray-100 text-gray-600'

  const itemColumns: TableColumn[] = [
    {
      key: 'productName',
      label: 'Products',
      render: (v) => (
        <div className="flex items-center gap-2">
          <ProductIcon />
          <span>{String(v ?? '')}</span>
        </div>
      ),
    },
    { key: 'sku', label: 'SKU' },
    { key: 'qty', label: 'Quantity' },
    { key: 'price', label: 'Price' },
    { key: 'total', label: 'Total' },
  ]
  const itemData = order.items.map((r) => ({ ...r }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/orders"
          className="shrink-0 p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100"
          aria-label="Back to Orders"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">#{order.orderId}</h1>
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${statusClass}`}>
          {order.status}
        </span>
      </div>

      {/* Track Order */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Track Order</h3>
        <div className="border-b border-gray-200 mb-4" />
        <div className="flex w-full items-start overflow-x-auto">
          {TRACK_STEPS.map((s, i) => {
            const active = i <= stepIndex
            const date = order.trackDates[i] ?? 'DD/MM/YY, 00:00'
            return (
              <div key={s.key} className="flex flex-1 min-w-0 items-start">
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${active ? 'border-primary bg-primary/10' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <StepIcon icon={s.icon} active={active} />
                  </div>
                  <p className={`mt-2 text-center text-xs font-ManropeBold ${active ? 'text-primary' : 'text-gray-500'}`}>
                    {s.label}
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-0.5">{date}</p>
                </div>
                {i < TRACK_STEPS.length - 1 && (
                  <div
                    className={`mx-1 mt-5 h-0.5 flex-1 min-w-[16px] self-start ${i < stepIndex ? 'bg-primary' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Items + Document */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Order Items</h3>
            <div className="border-b border-gray-200 mb-4" />
            <SimpleTable headers={itemColumns} data={itemData} />
            <div className="mt-4 space-y-1 text-sm font-Manrope text-gray-700 text-right">
              <p>Subtotal: {order.subtotal}</p>
              <p>VAT (0%): {order.vat}</p>
              <p>Delivery Fee: {order.deliveryFee}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Document</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-3">
              {order.documents.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-ManropeBold text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.size} | {d.generated}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => console.log('Download', d.name)}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded"
                    aria-label="Download"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Commission, Address, Customer */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Commission</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-Manrope text-gray-700">Potential Commission</span>
              <span className="text-sm font-ManropeBold text-primary">{order.commission}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Address</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-lg border border-gray-100">
                <span className="shrink-0 text-emerald-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-ManropeBold text-gray-800">Billing</p>
                  <p className="text-sm text-primary">{order.billingAddress}</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg border border-gray-100">
                <span className="shrink-0 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8m2 1-4v4m-2-4h.01M17 16h5m-1-4v4m-4 0V8m-4 4v.01" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-ManropeBold text-gray-800">Shipping</p>
                  <p className="text-sm text-primary">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Customer Information</h3>
            <div className="border-b border-gray-200 mb-4" />
            <div className="flex gap-3">
              <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <div className="space-y-1">
                <p className="text-sm font-ManropeBold text-gray-800">{order.customerName}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {order.customerPhone}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {order.customerEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
