import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@components/formsInput'

const AddAdmin = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleCancel = () => navigate('/team')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Add Admin', { fullName, phone, email })
    navigate('/team')
  }

  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const url = URL.createObjectURL(f)
      setAvatarPreview(url)
    }
    e.target.value = ''
  }

  const initial = fullName ? fullName.charAt(0).toUpperCase() : '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Add Admin</h1>
          <p className="text-gray-500 font-Manrope mt-1">Add a new admin</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-admin-form"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Admin
          </button>
        </div>
      </div>

      <form id="add-admin-form" onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Personal Information</h3>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400 text-2xl font-ManropeBold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-ManropeBold text-gray-800">Profile Picture</p>
              <p className="text-xs font-Manrope text-gray-500 mt-0.5">Upload a photo for admin&apos;s profile</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Upload New Picture
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="(214) 555-0123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mt-4 max-w-md">
            <Input
              label="Email"
              placeholder="operations@petcare.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddAdmin
