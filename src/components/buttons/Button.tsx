import React from 'react'
import { TailSpin } from 'react-loader-spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  fullWidth?: boolean
  children: React.ReactNode
  loader?: boolean
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  children,
  loader = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'h-[56px] rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-blue-700 text-white font-ManropeBold',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 bg-white'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  const isDisabled = disabled || loader
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loader ? (
        <TailSpin
          height={20}
          width={20}
          color={variant === 'primary' ? '#ffffff' : variant === 'secondary' ? '#1f2937' : '#374151'}
          ariaLabel="loading"
        />
      ) : (
        children
      )}
    </button>
  )
}

export default Button

