import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@components/formsInput'

const AddCategory = () => {
  const navigate = useNavigate()
  const [category, setCategory] = useState('')

  const handleCancel = () => navigate('/categories')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Add Category', { category })
    navigate('/categories')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-ManropeBold text-gray-800">Add Category</h1>
          <p className="text-gray-500 font-Manrope mt-1">Add a new category</p>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      <form id="add-category-form" onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-base font-ManropeBold text-gray-800 mb-4">Category Information</h3>
          <div className="max-w-md">
            <Input
              label="Category"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddCategory
