import { SearchInput } from '@components/formsInput'
import { DateInput } from '@components/formsInput'
import { Select } from '@components/select'
import type { SelectOption } from '@components/select'

export interface FilterProps {
  searchValue: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  statusValue: string
  onStatusChange: (v: string) => void
  statusOptions: SelectOption[]
  dateValue: string
  onDateChange: (v: string) => void
  dateLabel?: string
  datePlaceholder?: string
  onApply: () => void
  onClearAll: () => void
}

function Filter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search by name, email, or phone...',
  statusValue,
  onStatusChange,
  statusOptions,
  dateValue,
  onDateChange,
  dateLabel = 'Date Joined',
  datePlaceholder = 'Select Date',
  onApply,
  onClearAll,
}: FilterProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
        <div className="flex-1 min-w-0">
          <SearchInput
            label="Search"
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="w-full lg:w-40">
          <Select
            label="Status"
            value={statusValue}
            onValueChange={onStatusChange}
            options={statusOptions}
            placeholder=""
            rounded="lg"
          />
        </div>
        <div className="w-full lg:w-44">
          <DateInput
            label={dateLabel}
            value={dateValue}
            onChange={onDateChange}
            placeholder={datePlaceholder}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onApply}
            className="px-4 py-2 h-10 rounded-lg bg-primary text-white text-sm font-ManropeBold hover:bg-primary/90 transition-colors"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="px-4 py-2 h-10 text-sm font-Manrope text-gray-700 hover:text-gray-900 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}

export default Filter
