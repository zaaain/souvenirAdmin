import toast from 'react-hot-toast'

/**
 * Hook for displaying success toast notifications
 * @param message - Success message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const sSnack = (message: string, duration: number = 3000) => {
  return toast.success(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  })
}

/**
 * Hook for displaying error toast notifications
 * @param message - Error message to display
 * @param duration - Duration in milliseconds (default: 4000)
 */
export const eSnack = (message: string, duration: number = 4000) => {
  return toast.error(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  })
}

/**
 * Hook for displaying info toast notifications
 * @param message - Info message to display
 * @param duration - Duration in milliseconds (default: 3000)
 */
export const iSnack = (message: string, duration: number = 3000) => {
  return toast(message, {
    duration,
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#3b82f6',
    },
  })
}

/**
 * Hook for displaying loading toast notifications
 * @param message - Loading message to display
 */
export const lSnack = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6b7280',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      borderRadius: '8px',
    },
  })
}

