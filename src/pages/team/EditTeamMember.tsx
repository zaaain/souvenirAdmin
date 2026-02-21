import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TailSpin } from 'react-loader-spinner'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '@components/formsInput'
import { useGetSubadminByIdQuery, useUpdateSubadminMutation } from '@store/features/team'
import { updateTeamMemberSchema, type UpdateTeamMemberFormData } from '@helpers/schemas'
import { sSnack, eSnack } from '@hooks/useToast'

const EditTeamMember = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: apiResponse, isLoading: isFetching, isError } = useGetSubadminByIdQuery(id!, { skip: !id })
  const [updateSubadmin, { isLoading: isUpdating }] = useUpdateSubadminMutation()

  const raw = apiResponse?.data as Record<string, unknown> | undefined
  const firstname = String(raw?.firstname ?? '').trim()
  const lastname = String(raw?.lastname ?? '').trim()
  const email = String(raw?.email ?? '').trim()

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<UpdateTeamMemberFormData>({
    resolver: yupResolver(updateTeamMemberSchema),
    mode: 'onChange',
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
    },
  })

  useEffect(() => {
    if (raw) {
      reset({
        firstname,
        lastname,
        email: email || '',
      })
    }
  }, [raw, firstname, lastname, email, reset])

  const handleCancel = () => navigate(id ? `/team/${id}` : '/team')

  const onSubmit = async (data: UpdateTeamMemberFormData) => {
    if (!id) return
    try {
      await updateSubadmin({
        id,
        body: {
          firstname: data.firstname.trim(),
          lastname: data.lastname.trim(),
          email: data.email.trim(),
        },
      }).unwrap()
      sSnack('Team member updated successfully.')
      navigate(`/team/${id}`)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : 'Failed to update team member.'
      eSnack(message)
    }
  }

  if (!id) {
    navigate('/team')
    return null
  }

  if (isFetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <TailSpin visible height={60} width={60} color="#2466D0" ariaLabel="Loading team member" />
      </div>
    )
  }

  if (isError || !raw) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Edit Team Member</h1>
          <p className="text-gray-500 font-Manrope mt-1">Team member not found.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/team')}
          className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5"
        >
          Back to Team
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Edit Team Member</h1>
          <p className="text-gray-500 font-Manrope mt-1">Update team member details</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg border border-primary text-primary text-sm font-Manrope hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-team-member-form"
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Save Changes
          </button>
        </div>
      </div>

      <form id="edit-team-member-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Personal Information</h3>

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
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditTeamMember
