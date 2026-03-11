import React, { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrderTrackingStepper, type OrderTrackingStep } from '@components/order'
import { Modal } from '@components/modal'
import { Select } from '@components/select'
import { sSnack, eSnack } from '@hooks/useToast'
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useApproveDeliveryMutation,
} from '@store/features/order'
import { useAppSelector } from '@hooks/redux'
import { selectProfileData } from '@store/features/auth/authReducer'
import { loadLogoAsDataUrl, downloadInvoicePdf } from '@helpers/invoicePdf'
import { mapOrderToUi, toOrderStatus } from '@helpers/orderInvoiceMap'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

/** Same logo as sidebar – used in invoice PDF */
import Logo from '@assets/svg/logo.svg'

/** Order status keys used by API: pending, confirmed, processing, shipped, delivered, cancelled */
const ORDER_STATUS_VALUES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const

/** Step-by-step: only allow the next logical status from current */
const NEXT_STATUS_MAP: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

const STATUS_PILL: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-600',
  processing: 'bg-orange-100 text-orange-600',
  shipped: 'bg-purple-100 text-purple-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
}


function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false)
  const [updateStatusSelect, setUpdateStatusSelect] = useState('')
  const [isApprovingDelivery, setIsApprovingDelivery] = useState(false)
  const deliveryFileRef = useRef<HTMLInputElement>(null)

  const profileData = useAppSelector(selectProfileData)
  const { data, isLoading, isError, error } = useGetOrderByIdQuery(id!, { skip: !id })
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation()
  const [deleteOrder, { isLoading: isCancelling }] = useDeleteOrderMutation()
  const [approveDelivery] = useApproveDeliveryMutation()

  const orderData = useMemo(() => mapOrderToUi(data?.data), [data?.data])
  const status = orderData.status as string
  const statusForStepper = toOrderStatus(status)
  const isCancelled = (status ?? '').toLowerCase() === 'cancelled'

  const vendorName = profileData?.firstname || profileData?.lastname
    ? `${profileData?.firstname ?? ''} ${profileData?.lastname ?? ''}`.trim()
    : ''
  const vendorEmail = profileData?.email ?? ''

  const handleDownloadInvoice = async () => {
    try {
      const logoDataUrl = await loadLogoAsDataUrl(Logo)
      downloadInvoicePdf(orderData, vendorName, vendorEmail, logoDataUrl)
    } catch {
      downloadInvoicePdf(orderData, vendorName, vendorEmail, '')
    }
  }

  const handleCancelOrder = async () => {
    if (!id) return
    try {
      await deleteOrder(id).unwrap()
      sSnack('Order deleted successfully')
      setCancelModalOpen(false)
      navigate('/orders')
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message ?? 'Failed to cancel order')
        : 'Failed to cancel order'
      eSnack(msg)
    }
  }

  const allowedNextStatuses = NEXT_STATUS_MAP[(status ?? '').toLowerCase()] ?? []
  const allowedStatusOptions = ORDER_STATUS_VALUES
    .filter((v) => allowedNextStatuses.includes(v))
    .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))

  const openUpdateStatusModal = () => {
    setUpdateStatusSelect(allowedStatusOptions[0]?.value ?? '')
    setUpdateStatusModalOpen(true)
  }

  const handleDeliveryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setIsApprovingDelivery(true)
    try {
      const result = await approveDelivery({ id, file }).unwrap()
      sSnack(result?.message ?? 'Delivery proof uploaded successfully')
      const updatedOrder = result?.data ?? data?.data
      if (updatedOrder) {
        const uiOrder = mapOrderToUi(updatedOrder)
        try {
          const logoDataUrl = await loadLogoAsDataUrl(Logo)
          downloadInvoicePdf(uiOrder, vendorName, vendorEmail, logoDataUrl)
        } catch {
          downloadInvoicePdf(uiOrder, vendorName, vendorEmail, '')
        }
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message ?? 'Failed to upload delivery proof')
        : 'Failed to upload delivery proof'
      eSnack(msg)
    } finally {
      setIsApprovingDelivery(false)
      if (deliveryFileRef.current) deliveryFileRef.current.value = ''
    }
  }

  const handleUpdateStatus = async () => {
    if (!id || !updateStatusSelect.trim()) {
      eSnack('Please select a status')
      return
    }
    try {
      await updateOrderStatus({
        id,
        body: { status: updateStatusSelect.trim() as typeof ORDER_STATUS_VALUES[number] },
      }).unwrap()
      sSnack('Order status updated successfully')
      setUpdateStatusModalOpen(false)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? String((err as { data?: { message?: string } }).data?.message ?? 'Failed to update status')
        : 'Failed to update status'
      eSnack(msg)
    }
  }

  if (!id) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Invalid order ID
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={48} width={320} />
        <Skeleton height={280} className="rounded-xl" />
        <Skeleton height={200} className="rounded-xl" />
      </div>
    )
  }

  if (isError || !data?.data) {
    const errMsg = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { message?: string } }).data?.message ?? 'Failed to load order')
      : 'Failed to load order'
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{errMsg}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-ManropeBold text-gray-800">#{String(orderData.orderId)}</h1>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-Manrope ${
                STATUS_PILL[status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '—'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCancelled && (
            <>
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
                aria-label="Delete order"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m2 0v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7z" />
                </svg>
              </button>
              {allowedStatusOptions.length > 0 && (
                <button
                  type="button"
                  onClick={openUpdateStatusModal}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-Manrope hover:bg-gray-700 transition-colors"
                >
                  Update Status
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Track Order Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Track Order</h2>
            {isCancelled ? (
              <p className="text-gray-600 font-Manrope">This order was cancelled.</p>
            ) : (
              <OrderTrackingStepper
                currentStatus={statusForStepper}
                steps={orderData.trackingSteps as OrderTrackingStep[]}
              />
            )}
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">Products</th>
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">SKU</th>
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">Quantity</th>
                    <th className="text-left py-3 px-4 text-sm font-ManropeBold text-gray-800">Price</th>
                    <th className="text-right py-3 px-4 text-sm font-ManropeBold text-gray-800">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(orderData.orderItems as Array<Record<string, unknown>>).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <p className="text-sm font-Manrope text-gray-800">{item.productName as string}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.sku as string}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.quantity as number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.price as string}</td>
                      <td className="py-3 px-4 text-sm font-ManropeBold text-gray-800 text-right">
                        {item.total as string}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm font-ManropeBold text-gray-800 w-24">{orderData.subtotal as string}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-gray-600">Delivery Fee</span>
                    <span className="text-sm font-ManropeBold text-gray-800 w-24">{orderData.deliveryFee as string}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Document</h2>
            <div className="space-y-4">
              {/* Invoice - always visible */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm font-ManropeBold text-gray-800">Invoice</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                  aria-label="Download invoice"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>

              {/* Delivery Proof - only when status is delivered */}
              {status?.toLowerCase() === 'delivered' && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-ManropeBold text-gray-800">Delivery Proof</p>
                  </div>
                  <div>
                    <input
                      ref={deliveryFileRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleDeliveryFileChange}
                      disabled={isApprovingDelivery}
                    />
                    <button
                      type="button"
                      onClick={() => deliveryFileRef.current?.click()}
                      disabled={isApprovingDelivery}
                      className="p-2 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                      aria-label="Upload delivery proof"
                    >
                      {isApprovingDelivery ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Address</h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-ManropeBold text-gray-800">Billing</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(orderData.billingAddress as string)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {orderData.billingAddress as string}
                </a>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-ManropeBold text-gray-800">Shipping</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(orderData.shippingAddress as string)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {orderData.shippingAddress as string}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-ManropeBold text-gray-800 mb-4">Customer Information</h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-ManropeBold text-gray-800">{orderData.customerName as string}</p>
                  <p className="text-xs text-gray-500 mt-1">{orderData.customerPhone as string}</p>
                </div>
                {/* <button type="button" className="p-2 text-primary hover:bg-primary/10 rounded transition-colors ml-auto" aria-label="Chat">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Delete Order"
        description="Are you sure you want to permanently delete this order? This action cannot be undone."
        iconType="warning"
        actions={[
          { label: 'Cancel', onClick: () => setCancelModalOpen(false), variant: 'secondary' },
          { label: 'Delete Order', onClick: handleCancelOrder, variant: 'danger', disabled: isCancelling },
        ]}
      />

      {/* Update Status Modal with form */}
      <Modal
        isOpen={updateStatusModalOpen}
        onClose={() => setUpdateStatusModalOpen(false)}
        title="Update Status"
        description={
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-600">
              Update the order status. The customer, {String(orderData.customerName)}, will be notified.
            </p>
            <Select
              label="Status"
              value={updateStatusSelect}
              onValueChange={setUpdateStatusSelect}
              options={allowedStatusOptions}
              placeholder="Select status"
              rounded="lg"
            />
          </div>
        }
        iconType="success"
        actions={[
          { label: 'Cancel', onClick: () => setUpdateStatusModalOpen(false), variant: 'secondary' },
          { label: 'Update Status', onClick: handleUpdateStatus, variant: 'primary', disabled: isUpdatingStatus } as const,
        ]}
      />
    </div>
  )
}

export default OrderDetail
