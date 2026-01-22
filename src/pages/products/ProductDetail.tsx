import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Published: 'bg-primary text-white',
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-600',
}

const MOCK_PRODUCTS: Record<string, unknown>[] = [
  { productId: 'p-001', productName: 'Amoxicillin 50MG', sku: '302012', category: 'Vitamins', status: 'Pending' },
  { productId: 'p-002', productName: 'PetCalcium Plus', sku: '302013', category: 'Animal Medicines', status: 'Published' },
  { productId: 'p-003', productName: 'Multi-Vitamin Drops', sku: '302014', category: 'Feed & Nutrition', status: 'Published' },
  { productId: 'p-004', productName: 'Joint Care Supplement', sku: '302015', category: 'Supplements', status: 'Suspended' },
  { productId: 'p-005', productName: 'Amoxicillin 50MG', sku: '302016', category: 'Animal Medicines', status: 'Suspended' },
  { productId: 'p-006', productName: 'Omega Fish Oil', sku: '302017', category: 'Vitamins', status: 'Rejected' },
  { productId: 'p-007', productName: 'Probiotic Blend', sku: '302018', category: 'Supplements', status: 'Published' },
  { productId: 'p-008', productName: 'Dewormer Tablets', sku: '302019', category: 'Animal Medicines', status: 'Pending' },
  { productId: 'p-009', productName: 'Organic Feed Mix', sku: '302020', category: 'Feed & Nutrition', status: 'Published' },
  { productId: 'p-010', productName: 'Skin & Coat Formula', sku: '302021', category: 'Supplements', status: 'Suspended' },
  { productId: 'p-011', productName: 'Flea & Tick Spray', sku: '302022', category: 'Animal Medicines', status: 'Published' },
  { productId: 'p-012', productName: 'Digestive Enzymes', sku: '302023', category: 'Supplements', status: 'Pending' },
  { productId: 'p-013', productName: 'Premium Dog Food', sku: '302024', category: 'Feed & Nutrition', status: 'Published' },
  { productId: 'p-014', productName: 'Antibiotic Ointment', sku: '302025', category: 'Animal Medicines', status: 'Rejected' },
  { productId: 'p-015', productName: 'Vitamin B Complex', sku: '302026', category: 'Vitamins', status: 'Suspended' },
]

const LOREM =
  'Euismod purus a vel gravida interdum consectetur diam fermentum ultrices. Augue bibendum diam in elit eu laoreet faucibus ultrices. Condimentum phasellus non neque diam dignissim enim purus pulvinar. Eleifend tincidunt vitae id vitae venenatis. Turpis turpis eu quam ut non non elit eget. Tortor nunc at pharetra posuere justo neque. Ut suspendisse massa lobortis suscipit velit. Massa tellus ut condimentum dapibus eget lacinia suspendisse tristique egestas. Non volutpat sagittis etiam vel ac nisi vulputate elit. Parturient mollis vitae arcu iaculis donec turpis curabitur blandit orci. Tempus nunc tellus cursus cras placerat. Enim semper aliquet a eget dignissim amet ante molestie. At quisque ipsum tincidunt nunc et in vitae. Fringilla mauris at ipsum ipsum suspendisse elementum. Pellentesque pulvinar nulla arcu in tincidunt vestibulum diam vulputate. Et a.'

interface ProductDetailData {
  productName: string
  status: string
  general: VendorInfoCardItem[]
  pricing: VendorInfoCardItem[]
  shipping: VendorInfoCardItem[]
  images: string[]
}

const MOCK_DETAIL: Record<string, ProductDetailData> = {
  'p-001': {
    productName: 'Amoxicillin',
    status: 'Pending',
    general: [
      { label: 'Product Category', value: 'Medication' },
      { label: 'SKU', value: '1234321' },
      { label: 'Quantity Available (Stock)', value: '50' },
      { label: 'Description', value: LOREM, colSpan: 3 },
    ],
    pricing: [
      { label: 'Pricing', value: '$50.00' },
      { label: 'VAT Amount (%)', value: '0%' },
      { label: 'Discount Type', value: 'Percentage' },
      { label: 'Discount Percentage (%)', value: '50%' },
    ],
    shipping: [
      { label: 'Weight (kg)', value: '0.2' },
      { label: 'Dimensions [Height x Length x Width] (cm)', value: '120 x 320 x 120' },
    ],
    images: [
      'https://picsum.photos/seed/p001-1/240/240',
      'https://picsum.photos/seed/p001-2/240/240',
      'https://picsum.photos/seed/p001-3/240/240',
      'https://picsum.photos/seed/p001-4/240/240',
      'https://picsum.photos/seed/p001-5/240/240',
      'https://picsum.photos/seed/p001-6/240/240',
    ],
  },
}

function getProductDetail(id: string): ProductDetailData | null {
  if (MOCK_DETAIL[id]) return MOCK_DETAIL[id]
  const fromList = MOCK_PRODUCTS.find((v) => String(v.productId) === id) as Record<string, unknown> | undefined
  if (!fromList) return null
  return {
    productName: String(fromList.productName ?? '—'),
    status: String(fromList.status ?? '—'),
    general: [
      { label: 'Product Category', value: String(fromList.category ?? '—') },
      { label: 'SKU', value: String(fromList.sku ?? '—') },
      { label: 'Quantity Available (Stock)', value: '—' },
      { label: 'Description', value: '—', colSpan: 3 },
    ],
    pricing: [
      { label: 'Pricing', value: '—' },
      { label: 'VAT Amount (%)', value: '—' },
      { label: 'Discount Type', value: '—' },
      { label: 'Discount Percentage (%)', value: '—' },
    ],
    shipping: [
      { label: 'Weight (kg)', value: '—' },
      { label: 'Dimensions [Height x Length x Width] (cm)', value: '—' },
    ],
    images: [
      'https://picsum.photos/seed/def1/240/240',
      'https://picsum.photos/seed/def2/240/240',
      'https://picsum.photos/seed/def3/240/240',
    ],
  }
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const detail = id ? getProductDetail(id) : null

  const isPending = detail?.status === 'Pending'
  const isPublished = detail?.status === 'Published'
  const isSuspended = detail?.status === 'Suspended'
  const isRejected = detail?.status === 'Rejected'

  if (!id || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <p className="text-gray-600">Product not found.</p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[detail.status] ?? 'bg-gray-100 text-gray-600'
  const initial = detail.productName ? detail.productName.charAt(0).toUpperCase() : '—'

  return (
    <div className="space-y-6">
      {/* Header: Back | Avatar (first letter, same as VendorDetail) | Name + Status | Reject, Approve / Delete, Suspend / etc. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/products"
            className="shrink-0 p-1.5 -ml-1.5 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to Products"
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
              <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">{detail.productName}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${statusClass}`}>
                {detail.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="p-2.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            aria-label="Delete Product"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="px-4 py-2.5 rounded-lg border border-red-500 bg-red-50 text-red-600 text-sm font-Manrope hover:bg-red-100 transition-colors"
              >
                Reject Product
              </button>
              <button
                type="button"
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
              >
                Approve Product
              </button>
            </>
          )}
          {isPublished && (
            <button
              type="button"
              onClick={() => setSuspendModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-Manrope hover:bg-red-600 transition-colors"
            >
              Suspend Product
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
          {isRejected && (
            <button
              type="button"
              onClick={() => setApproveModalOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
            >
              Approve Product
            </button>
          )}
        </div>
      </div>

      {/* General Information: grid + Description (normal weight) */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">General Information</h3>
        <div className="border-b border-gray-200 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
          {detail.general.filter((i) => i.label !== 'Description').map((item, i) => (
            <div key={i}>
              <p className="text-xs font-Manrope text-gray-500">{item.label}</p>
              <p className="text-sm font-ManropeBold text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        {(() => {
          const d = detail.general.find((i) => i.label === 'Description')
          if (!d || !d.value) return null
          return (
            <div className="mt-4">
              <p className="text-xs font-Manrope text-gray-500">Description</p>
              <p className="text-sm font-Manrope text-gray-800 mt-0.5">{d.value}</p>
            </div>
          )
        })()}
      </div>
      <VendorInfoCard heading="Pricing" data={detail.pricing} />
      <VendorInfoCard heading="Shipping" data={detail.shipping} />

      {/* Product Images */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-ManropeBold text-gray-800 mb-2">Product Images</h3>
        <div className="border-b border-gray-200 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {detail.images.map((src, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Product"
        description="Rejecting the product request will deny its approval and remove the application from the pending list. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setRejectModalOpen(false), variant: 'secondary' },
          { label: 'Reject Product', onClick: () => { console.log('Reject', id); setRejectModalOpen(false); }, variant: 'danger' },
        ]}
      />

      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Product"
        description="Approving this product will publish it to the catalog and make it available for purchase."
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => setApproveModalOpen(false), variant: 'secondary' },
          { label: 'Approve Product', onClick: () => { console.log('Approve', id); setApproveModalOpen(false); }, variant: 'primary' },
        ]}
      />

      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title="Suspend Product"
        description="Are you sure you want to suspend this product? The vendor's access will be temporarily disabled until reactivated."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setSuspendModalOpen(false), variant: 'secondary' },
          { label: 'Suspend Product', onClick: () => { console.log('Suspend', id); setSuspendModalOpen(false); }, variant: 'danger' },
        ]}
      />

      <Modal
        isOpen={reactivateModalOpen}
        onClose={() => setReactivateModalOpen(false)}
        title="Reactivate Product"
        description="Reactivating this product will restore it to the catalog and make it available for purchase again."
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => setReactivateModalOpen(false), variant: 'secondary' },
          { label: 'Reactivate Product', onClick: () => { console.log('Reactivate', id); setReactivateModalOpen(false); }, variant: 'primary' },
        ]}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Product"
        description="Deleting the product will permanently remove it from the catalog. This action cannot be undone."
        iconType="error"
        actions={[
          { label: 'Cancel', onClick: () => setDeleteModalOpen(false), variant: 'secondary' },
          { label: 'Delete Product', onClick: () => { console.log('Delete', id); setDeleteModalOpen(false); }, variant: 'danger' },
        ]}
      />
    </div>
  )
}

export default ProductDetail
