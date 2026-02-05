import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type ModalIconType = 'warning' | 'info' | 'success' | 'error'

export interface ModalAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export interface ModalProps {
  /** Controlled: when true, modal is visible */
  isOpen: boolean
  /** Called on Escape key. Parent sets isOpen=false on Cancel/close. Backdrop click does NOT close. */
  onClose: () => void
  /** Modal title */
  title: string
  /** Body text or custom ReactNode */
  description?: ReactNode
  /** Preset icon: warning/error = red exclamation; info/success = optional later */
  iconType?: ModalIconType
  /** Buttons in order (left to right). variant: secondary=outline, primary=blue, danger=red */
  actions?: ModalAction[]
}

const iconMap: Record<ModalIconType, ReactNode> = {
  warning: (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
      <span className="text-2xl font-bold text-red-600">!</span>
    </div>
  ),
  error: (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
      <span className="text-xl font-bold text-white">!</span>
    </div>
  ),
  info: (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
  success: (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
      <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
}

const btnClass: Record<string, string> = {
  secondary: 'px-4 py-2 rounded-lg border border-primary text-primary bg-white hover:bg-primary/5 font-Manrope text-sm transition-colors',
  primary: 'px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-ManropeBold text-sm transition-colors',
  danger: 'px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-ManropeBold text-sm transition-colors',
}

function Modal({ isOpen, onClose, title, description, iconType, actions = [] }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/50 cursor-default" />
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {iconType && (
          <div className="mb-4 flex justify-start">
            {iconMap[iconType]}
          </div>
        )}
        <h2 id="modal-title" className="text-left text-lg font-ManropeBold text-gray-800">
          {title}
        </h2>
        {description != null && (
          <div className="mt-2 text-left text-sm font-Manrope text-gray-600">
            {description}
          </div>
        )}
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                disabled={a.disabled}
                className={`${btnClass[a.variant ?? 'primary']} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default Modal
