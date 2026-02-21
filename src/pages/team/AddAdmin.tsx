import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '@components/formsInput'
import { useCreateSubadminMutation } from '@store/features/team'
import { createAdminSchema, type CreateAdminFormData } from '@helpers/schemas'
import { sSnack, eSnack } from '@hooks/useToast'

const AddAdmin = () => {
  const navigate = useNavigate()
  const [createSubadmin, { isLoading }] = useCreateSubadminMutation()

  const {
    control,
    handleSubmit,
  } = useForm<CreateAdminFormData>({
    resolver: yupResolver(createAdminSchema),
    mode: 'onChange',
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
    },
  })

  const handleCancel = () => navigate('/team')

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      await createSubadmin({
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.trim(),
        password: data.password,
      }).unwrap()
      sSnack('Subadmin created successfully.')
      navigate('/team')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : 'Failed to create subadmin.'
      eSnack(message)
    }
  }

  /* Avatar section – uncomment when backend supports profile picture
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const handleUploadClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      const url = URL.createObjectURL(f)
      setAvatarPreview(url)
    }
    e.target.value = ''
  }
  const displayName = watch('firstname') && watch('lastname') ? `${watch('firstname')} ${watch('lastname')}` : '—'
  const initial = displayName !== '—' ? displayName.charAt(0).toUpperCase() : '—'
  */

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Create Team Member</h1>
          <p className="text-gray-500 font-Manrope mt-1">Add a new team member</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-team-member-form"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Create Team Member
          </button>
        </div>
      </div>

      <form id="create-team-member-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Personal Information</h3>

          {/* Avatar section – commented out for now
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
              <p className="text-xs font-Manrope text-gray-500 mt-0.5">Upload a photo for admin&apos;s profile (optional)</p>
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
          */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="firstname"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="First Name"
                  placeholder="First Name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="lastname"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Last Name"
                  placeholder="Last Name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
          <div className="mt-4 space-y-4 w-full">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Email"
                  placeholder="subadmin@example.com"
                  type="email"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  className="w-full"
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  className="w-full"
                />
              )}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddAdmin
