import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input, ImageUpload } from '@components/formsInput'
import { useCreateCategoryMutation } from '@store/features/category'
import { addCategorySchema, type AddCategoryFormData } from '@helpers/schemas'

const AddCategory = () => {
  const navigate = useNavigate()
  const [createCategory, { isLoading }] = useCreateCategoryMutation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddCategoryFormData>({
    resolver: yupResolver(addCategorySchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      image: undefined,
    },
  })

  const handleCancel = () => navigate('/categories')

  const onSubmit = async (data: AddCategoryFormData) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name.trim())
      if (data.description?.trim()) {
        formData.append('description', data.description.trim())
      }
      if (data.image && data.image instanceof File) {
        formData.append('image', data.image)
      }
      await createCategory(formData).unwrap()
      navigate('/categories')
    } catch {
      // Error can be shown via toast
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Add Category</h1>
          <p className="text-gray-500 font-Manrope mt-1">Create a new category</p>
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
            form="add-category-form"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isLoading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>

      <form id="add-category-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Category Information</h3>
          <div className="w-full space-y-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Category Name"
                  placeholder="e.g. Electronics"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  label="Category Image"
                  value={field.value ?? null}
                  onChange={(file) => field.onChange(file ?? undefined)}
                  onBlur={field.onBlur}
                  error={errors.image?.message}
                  required
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  label="Description (optional)"
                  placeholder="e.g. Electronic items and gadgets"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.description?.message}
                />
              )}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddCategory
