import React from 'react'

/** Order status keys used by API (cancelled is not shown in stepper) */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered'

export interface OrderTrackingStep {
  status: OrderStatus | string
  date?: string
  time?: string
}

export interface OrderTrackingStepperProps {
  currentStatus: OrderStatus
  steps: OrderTrackingStep[]
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const STATUS_CONFIG: Record<
  OrderStatus,
  { icon: React.ReactNode; label: string }
> = {
  pending: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Pending',
  },
  confirmed: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Confirmed',
  },
  processing: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    label: 'Processing',
  },
  shipped: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1m1 0h1M9 16a1 1 0 104 0m-4 0a1 1 0 114 0m6 0a1 1 0 100-2m-100 2a1 1 0 110-2m100 2a1 1 0 100-2m-100 2a1 1 0 110-2" />
      </svg>
    ),
    label: 'Shipped',
  },
  delivered: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    label: 'Delivered',
  },
}

function OrderTrackingStepper({ currentStatus, steps }: OrderTrackingStepperProps) {
  const normalizedCurrent = (currentStatus ?? 'pending').toLowerCase() as OrderStatus
  const currentIndex = STATUS_ORDER.indexOf(normalizedCurrent) >= 0
    ? STATUS_ORDER.indexOf(normalizedCurrent)
    : 0

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STATUS_ORDER.map((status, index) => {
          const step = steps.find((s) => String(s.status).toLowerCase() === status)
          const isActive = index <= currentIndex
          const config = STATUS_CONFIG[status]

          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                    isActive
                      ? 'bg-primary border-primary text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {config.icon}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-ManropeBold ${
                      isActive ? 'text-primary' : 'text-gray-500'
                    }`}
                  >
                    {config.label}
                  </p>
                  {step?.date && step?.time ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.date}, {step.time}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">DD/MM/YY, 00:00</p>
                  )}
                </div>
              </div>
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isActive ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default OrderTrackingStepper
