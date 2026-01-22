export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  label?: string
  /** Optional class for the root wrapper. */
  className?: string
  /** 'full' = pill (default), 'lg' = rounded-lg for form/filter layouts */
  rounded?: 'full' | 'lg'
}

function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  label,
  className = '',
  rounded = 'full',
}: SelectProps) {
  const roundedClass = rounded === 'lg' ? 'rounded-lg' : 'rounded-full'
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 font-ManropeBold">
          {label}
        </label>
      )}
      <div className={`relative flex ${rounded === 'lg' ? 'w-full' : 'inline-flex'}`}>
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          className={`appearance-none bg-inputBg border border-[#DDD] pl-4 pr-10 py-2 text-sm font-Manrope text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${roundedClass} ${rounded === 'lg' ? 'w-full h-10' : ''}`}
        >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default Select
