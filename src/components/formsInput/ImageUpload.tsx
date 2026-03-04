import React, { useRef, useState, useEffect } from 'react'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
const MAX_SIZE_MB = 5

export interface ImageUploadProps {
  label?: string
  value?: File | null
  onChange: (file: File | null) => void
  onBlur?: () => void
  error?: string
  required?: boolean
  previewUrl?: string | null
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  previewUrl = null,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (previewUrl || !value) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        setObjectUrl(null)
      }
      return
    }
    const url = URL.createObjectURL(value)
    setObjectUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [value, previewUrl])

  const resolvedDisplayUrl = previewUrl ?? objectUrl ?? null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      onChange(null)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onChange(null)
      return
    }
    onChange(file)
    onBlur?.()
  }

  const handleClear = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClick = () => inputRef.current?.click()

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 font-ManropeBold">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={`
          w-full min-h-[180px] rounded-2xl border-2 border-dashed transition-colors
          bg-inputBg flex flex-col items-center justify-center gap-3 p-6
          ${error ? 'border-red-500' : 'border-[#DDD]'}
          hover:border-primary/50 hover:bg-primary/5
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          className="hidden"
          aria-label={label}
        />
        {resolvedDisplayUrl ? (
          <>
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <img
                src={resolvedDisplayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-3 py-1.5 rounded-lg text-sm font-Manrope border border-primary text-primary hover:bg-primary/10 transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg text-sm font-Manrope text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-Manrope text-gray-600 text-center max-w-[240px]">
              Click or drag image here (JPEG, PNG, WebP, GIF, SVG — max {MAX_SIZE_MB}MB)
            </p>
            <button
              type="button"
              onClick={handleClick}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
            >
              Choose image
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 font-Manrope">{error}</p>
      )}
    </div>
  )
}

export default ImageUpload
