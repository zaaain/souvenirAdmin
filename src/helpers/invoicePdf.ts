import { jsPDF } from 'jspdf'

/** Load image (e.g. logo) as PNG data URL for jsPDF (SVG not supported) */
export function loadLogoAsDataUrl(logoUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve('')
          return
        }
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve('')
      }
    }
    img.onerror = () => resolve('')
    img.src = logoUrl
  })
}

/** Generate and download invoice PDF – with logo and vendor detail */
export function downloadInvoicePdf(
  orderData: Record<string, unknown>,
  vendorName: string,
  vendorEmail: string,
  logoDataUrl: string
) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = doc.internal.pageSize.getWidth()
  let y = 18

  const orderId = String(orderData.orderId ?? '')
  const customerName = String(orderData.customerName ?? '')
  const customerPhone = String(orderData.customerPhone ?? '')
  const shippingAddress = String(orderData.shippingAddress ?? '')
  const status = String(orderData.status ?? '')
  const subtotal = String(orderData.subtotal ?? '')
  const deliveryFee = String(orderData.deliveryFee ?? '')
  const total = String(orderData.total ?? orderData.subtotal ?? '')
  const orderItems = (orderData.orderItems ?? []) as Array<Record<string, unknown>>

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 20, y, 36, 36)
    y += 40
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  if (vendorName) doc.text(vendorName, 20, y)
  y += vendorName ? 5 : 0
  if (vendorEmail) {
    doc.setFont('helvetica', 'normal')
    doc.text(vendorEmail, 20, y)
    y += 6
  }
  y += 6

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Order #${orderId}`, 20, y)
  doc.text(`Status: ${status}`, pageW - 20, y, { align: 'right' })
  y += 8

  doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 20, y)
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.text('Bill To', 20, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(customerName, 20, y)
  y += 5
  doc.text(customerPhone, 20, y)
  y += 5
  const addrLines = doc.splitTextToSize(shippingAddress, pageW - 40)
  doc.text(addrLines, 20, y)
  y += addrLines.length * 5 + 12

  const colW = [100, 22, 32, 36]
  const tableX = 20
  doc.setFillColor(240, 240, 240)
  doc.rect(tableX, y, colW.reduce((a, b) => a + b, 0), 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Product', tableX + 2, y + 5.5)
  doc.text('Qty', tableX + colW[0] + 2, y + 5.5)
  doc.text('Price', tableX + colW[0] + colW[1] + 2, y + 5.5)
  doc.text('Total', tableX + colW[0] + colW[1] + colW[2] + 2, y + 5.5)
  y += 8

  doc.setFont('helvetica', 'normal')
  orderItems.forEach((item) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    const productName = doc.splitTextToSize(String(item.productName ?? ''), colW[0] - 4)
    doc.text(productName, tableX + 2, y + 4)
    doc.text(String(item.quantity ?? 0), tableX + colW[0] + 2, y + 4)
    doc.text(String(item.price ?? ''), tableX + colW[0] + colW[1] + 2, y + 4)
    doc.text(String(item.total ?? ''), tableX + colW[0] + colW[1] + colW[2] + 2, y + 4)
    y += Math.max(productName.length * 5, 8)
  })
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.text('Subtotal:', tableX + colW[0] + colW[1], y)
  doc.text(subtotal, tableX + colW[0] + colW[1] + colW[2] + 2, y)
  y += 7
  doc.text('Delivery:', tableX + colW[0] + colW[1], y)
  doc.text(deliveryFee, tableX + colW[0] + colW[1] + colW[2] + 2, y)
  y += 10

  doc.setDrawColor(0, 0, 0)
  doc.line(tableX + colW[0] + colW[1], y, tableX + colW.reduce((a, b) => a + b, 0), y)
  y += 7
  doc.setFontSize(11)
  doc.text('Total:', tableX + colW[0] + colW[1], y)
  doc.text(total, tableX + colW[0] + colW[1] + colW[2] + 2, y)
  y += 15

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Thank you for your order.', pageW / 2, y, { align: 'center' })
  doc.text(`Invoice for Order #${orderId}`, pageW / 2, y + 5, { align: 'center' })

  doc.save(`Invoice-${orderId.replace(/\s/g, '-')}.pdf`)
}
