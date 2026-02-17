import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { TailSpin } from 'react-loader-spinner'
import { VendorInfoCard } from '@components/card'
import type { VendorInfoCardItem } from '@components/card'
import { Modal } from '@components/modal'
import {
  useGetProductByIdQuery,
  useUpdateProductApprovalMutation,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
} from '@store/features/product'

const STATUS_PILL: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Published: 'bg-primary text-white',
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-600',
}

interface ProductDetailData {
  productName: string
  status: string
  general: VendorInfoCardItem[]
  pricing: VendorInfoCardItem[]
  shipping: VendorInfoCardItem[]
  images: string[]
}

const BASE_URL = 'https://api.souvenir.live'

function mapApiProductToDetail(raw: Record<string, unknown>): ProductDetailData {
  const name = String(raw.name ?? raw.productName ?? raw.title ?? '—')
  const statusRaw = String(raw.status ?? (raw.isActive === true ? 'Published' : 'Pending'))
  const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase()
  const category =
    typeof raw.category === 'object' && raw.category && !Array.isArray(raw.category)
      ? String((raw.category as Record<string, unknown>).name ?? (raw.category as Record<string, unknown>).categoryName ?? '—')
      : String(raw.category ?? raw.categoryName ?? '—')
  const sku = String(raw.sku ?? raw.skuCode ?? '—')
  const stock = raw.stock ?? raw.inventory ?? raw.quantity ?? '—'
  const description = String(raw.description ?? '—')
  const priceRaw = raw.price ?? raw.unitPrice ?? raw.pricing ?? 0
  const price = typeof priceRaw === 'number' ? `$${Number(priceRaw).toLocaleString()}` : String(priceRaw ?? '—')
  const vat = raw.vat ?? raw.vatAmount ?? raw.tax ?? '—'
  const vatStr = typeof vat === 'number' ? `${vat}%` : String(vat)
  const discountType = String(raw.discountType ?? '—')
  const discountPct = raw.discount ?? raw.discountPercentage ?? raw.discountPercent ?? '—'
  const discountStr = typeof discountPct === 'number' ? `${discountPct}%` : String(discountPct)

  const shippingDetails = raw.shippingDetails as Record<string, unknown> | undefined
  const weight = shippingDetails?.weight ?? raw.weight ?? raw.weightKg ?? '—'
  const height = shippingDetails?.height ?? '—'
  const length = shippingDetails?.length ?? '—'
  const width = shippingDetails?.width ?? '—'
  const dimensions =
    [height, length, width].every((v) => v !== '—' && v !== '')
      ? `${height} x ${length} x ${width}`
      : String(raw.dimensions ?? raw.size ?? '—')

  const general: VendorInfoCardItem[] = [
    { label: 'Product Category', value: category },
    { label: 'SKU', value: sku },
    { label: 'Quantity Available (Stock)', value: String(stock) },
    { label: 'Description', value: description || '—', colSpan: 3 },
  ]

  const pricing: VendorInfoCardItem[] = [
    { label: 'Pricing', value: price },
    { label: 'VAT Amount (%)', value: vatStr },
    { label: 'Discount Type', value: discountType },
    { label: 'Discount Percentage (%)', value: discountStr },
  ]

  const shipping: VendorInfoCardItem[] = [
    { label: 'Weight (kg)', value: String(weight) },
    { label: 'Dimensions [Height x Length x Width] (cm)', value: dimensions },
  ]

  let images: string[] = []
  const imgField = raw.images
  if (Array.isArray(imgField)) {
    images = imgField.flatMap((item: unknown) => {
      if (typeof item === 'string') {
        return item.split(',').map((s) => s.trim()).filter(Boolean)
      }
      if (item && typeof item === 'object' && 'url' in item) return [String((item as { url: string }).url)]
      if (item && typeof item === 'object' && 'image' in item) return [String((item as { image: string }).image)]
      return []
    }).filter(Boolean)
  } else if (typeof imgField === 'string') {
    images = imgField.split(',').map((s) => s.trim()).filter(Boolean)
  }
  const featureImage = raw.featureImage ? String(raw.featureImage) : ''
  if (featureImage) {
    const fullUrl = featureImage.startsWith('http') ? featureImage : `${BASE_URL}${featureImage.startsWith('/') ? '' : '/'}${featureImage}`
    if (!images.includes(fullUrl)) images = [fullUrl, ...images]
  }
  if (raw.imageUrl && typeof raw.imageUrl === 'string') images = [raw.imageUrl, ...images]
  if (raw.thumbnail && typeof raw.thumbnail === 'string') images = [raw.thumbnail, ...images]
  if (images.length === 0) {
    images = ['https://picsum.photos/seed/product/240/240']
  }

  return {
    productName: name,
    status,
    general,
    pricing,
    shipping,
    images,
  }
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data, isLoading, isError, error } = useGetProductByIdQuery(id!, { skip: !id })
  const [updateApproval, { isLoading: isApprovalLoading }] = useUpdateProductApprovalMutation()
  const [updateStatus, { isLoading: isStatusLoading }] = useUpdateProductStatusMutation()
  const [deleteProduct, { isLoading: isDeleteLoading }] = useDeleteProductMutation()

  const detail = useMemo(() => {
    if (!data) return null
    const raw = (data as Record<string, unknown>)?.data ?? data
    const product = typeof raw === 'object' && raw && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
    return mapApiProductToDetail(product)
  }, [data])

  const isPending = detail?.status === 'Pending'
  const isPublished = detail?.status === 'Published'
  const isSuspended = detail?.status === 'Suspended'
  const isRejected = detail?.status === 'Rejected'

  if (!id) {
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <TailSpin visible height={60} width={60} color="#2466D0" ariaLabel="Loading product" />
      </div>
    )
  }

  if (isError || !detail) {
    return (
      <div className="space-y-4">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm font-Manrope text-gray-600 hover:text-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <p className="text-gray-600">
          {String((error as { data?: { message?: string } })?.data?.message ?? (error as Error)?.message ?? 'Product not found.')}
        </p>
      </div>
    )
  }

  const statusClass = STATUS_PILL[detail.status] ?? 'bg-gray-100 text-gray-600'
  const initial = detail.productName ? detail.productName.charAt(0).toUpperCase() : '—'

  return (
    <div className="space-y-6">
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
          if (!d || !d.value || d.value === '—') return null
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
          {
            label: isApprovalLoading ? 'Rejecting...' : 'Reject Product',
            onClick: async () => {
              if (!id) return
              try {
                await updateApproval({ id, body: { action: 'reject' } }).unwrap()
                setRejectModalOpen(false)
              } catch {
                // Error can be shown via toast
              }
            },
            variant: 'danger',
            disabled: isApprovalLoading,
          },
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
          {
            label: isApprovalLoading ? 'Approving...' : 'Approve Product',
            onClick: async () => {
              if (!id) return
              try {
                await updateApproval({ id, body: { action: 'approve' } }).unwrap()
                setApproveModalOpen(false)
              } catch {
                // Error can be shown via toast
              }
            },
            variant: 'primary',
            disabled: isApprovalLoading,
          },
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
          {
            label: isStatusLoading ? 'Suspending...' : 'Suspend Product',
            onClick: async () => {
              if (!id) return
              try {
                await updateStatus({ id, body: { action: 'suspend' } }).unwrap()
                setSuspendModalOpen(false)
              } catch {
                // Error can be shown via toast
              }
            },
            variant: 'danger',
            disabled: isStatusLoading,
          },
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
          {
            label: isStatusLoading ? 'Reactivating...' : 'Reactivate Product',
            onClick: async () => {
              if (!id) return
              try {
                await updateStatus({ id, body: { action: 'reactivate' } }).unwrap()
                setReactivateModalOpen(false)
              } catch {
                // Error can be shown via toast
              }
            },
            variant: 'primary',
            disabled: isStatusLoading,
          },
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
          {
            label: isDeleteLoading ? 'Deleting...' : 'Delete Product',
            onClick: async () => {
              if (!id) return
              try {
                await deleteProduct(id).unwrap()
                setDeleteModalOpen(false)
                navigate('/products')
              } catch {
                // Error can be shown via toast
              }
            },
            variant: 'danger',
            disabled: isDeleteLoading,
          },
        ]}
      />
    </div>
  )
}

export default ProductDetail
