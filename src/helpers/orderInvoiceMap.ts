import type { OrderStatus, OrderTrackingStep } from '@components/order'
import { formatCurrency } from '@constants/currency'

type VendorOrderDetail = Record<string, any>

/** Map API status to stepper OrderStatus */
export function toOrderStatus(s: string | undefined): OrderStatus {
  const v = (s ?? '').trim().toLowerCase()
  if (v === 'pending' || v === 'confirmed' || v === 'processing' || v === 'shipped' || v === 'delivered') return v as OrderStatus
  return 'pending'
}

/** Address object from API: { postalCode, line1, line2, town, country, phone } */
export function formatAddress(addr: unknown): string {
  if (addr == null) return '—'
  if (typeof addr === 'string') return addr
  if (typeof addr !== 'object') return '—'
  const o = addr as Record<string, unknown>
  const parts = [
    o.line1,
    o.line2,
    o.town,
    o.postalCode,
    o.country,
    o.phone,
  ].filter(Boolean).map(String)
  return parts.length ? parts.join(', ') : '—'
}

/** Build UI order data from API order for invoice PDF */
export function mapOrderToUi(apiOrder: VendorOrderDetail | null | undefined): Record<string, unknown> {
  if (!apiOrder) {
    return {
      orderId: '—',
      status: '—',
      customerName: '—',
      customerEmail: '—',
      customerPhone: '—',
      billingAddress: '—',
      shippingAddress: '—',
      orderItems: [],
      subtotal: '—',
      deliveryFee: '—',
      trackingSteps: [],
      invoice: { fileName: '—', size: '—', generatedDate: '—' },
      deliveryProof: { fileName: '—', status: '—' },
    }
  }
  const rawItems = apiOrder.orderItems ?? (apiOrder as Record<string, unknown>).orderItems ?? apiOrder.products ?? []
  const orderItems = Array.isArray(rawItems)
    ? rawItems.map((item: Record<string, unknown>) => {
        const productId = item.productId
        const productName = item.productName ?? item.name ?? (productId && typeof productId === 'object' && 'name' in productId ? String((productId as Record<string, unknown>).name) : null) ?? '—'
        const sku =
          item.sku ??
          (productId && typeof productId === 'object' && 'sku' in productId
            ? String((productId as Record<string, unknown>).sku)
            : undefined) ??
          '—'
        return {
          productName,
          sku,
          quantity: item.quantity ?? 0,
          price: typeof item.price === 'number' ? formatCurrency(item.price) : (item.price ?? '—'),
          total: typeof item.subtotal === 'number' ? formatCurrency(item.subtotal) : typeof item.total === 'number' ? formatCurrency(item.total) : (item.subtotal != null ? formatCurrency(Number(item.subtotal)) : item.total != null ? formatCurrency(Number(item.total)) : '—'),
        }
      })
    : []
  const steps = (apiOrder.trackingSteps ?? []).map((s: { status?: string; date?: string; time?: string }) => ({
    status: (s.status ?? '') as OrderStatus,
    date: s.date ?? '',
    time: s.time ?? '',
  })) as OrderTrackingStep[]
  const userId = apiOrder.userId
  const customerName = (apiOrder as Record<string, unknown>).customerName ?? (apiOrder as Record<string, unknown>).customer
    ?? (userId ? `${String(userId.firstname ?? '').trim()} ${String(userId.lastname ?? '').trim()}`.trim() : null) ?? '—'
  const shippingAddr = apiOrder.shippingAddress
  const billingAddr = (apiOrder as Record<string, unknown>).billingAddress ?? shippingAddr
  const customerPhone = (apiOrder as Record<string, unknown>).customerPhone ?? (apiOrder as Record<string, unknown>).phone ?? userId?.phone ?? (shippingAddr && typeof shippingAddr === 'object' && 'phone' in shippingAddr ? String((shippingAddr as Record<string, unknown>).phone) : null) ?? '—'
  return {
    orderId: apiOrder.orderId ?? (apiOrder as Record<string, unknown>).orderNumber ?? apiOrder._id ?? '—',
    status: apiOrder.status ?? '—',
    customerName,
    customerEmail: (apiOrder as Record<string, unknown>).customerEmail ?? (apiOrder as Record<string, unknown>).email ?? userId?.email ?? '—',
    customerPhone,
    billingAddress: formatAddress(billingAddr),
    shippingAddress: formatAddress(shippingAddr),
    orderItems,
    subtotal: apiOrder.totalAmount != null ? formatCurrency(apiOrder.totalAmount) : (typeof (apiOrder as Record<string, unknown>).subtotal === 'number' ? formatCurrency((apiOrder as Record<string, unknown>).subtotal as number) : '—'),
    deliveryFee: apiOrder.shippingCost != null ? formatCurrency(apiOrder.shippingCost) : (typeof (apiOrder as Record<string, unknown>).deliveryFee === 'number' ? formatCurrency((apiOrder as Record<string, unknown>).deliveryFee as number) : '—'),
    trackingSteps: steps.length ? steps : [{ status: toOrderStatus(apiOrder.status), date: '', time: '' }],
    invoice: apiOrder.invoice ?? { fileName: 'Invoice', size: '—', generatedDate: '—' },
    deliveryProof: apiOrder.deliveryProof ?? { fileName: 'Delivery Proof', status: '—' },
  }
}
