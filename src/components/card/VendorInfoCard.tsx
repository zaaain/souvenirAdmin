export interface VendorInfoCardItem {
  label: string
  value: string
  /** 1 = one col, 2 = two cols, 3 = full width on lg. Default 1. */
  colSpan?: 1 | 2 | 3
}

export interface VendorInfoCardProps {
  heading: string
  data: VendorInfoCardItem[]
}

function VendorInfoCard({ heading, data }: VendorInfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-base font-ManropeBold text-gray-800 mb-2">{heading}</h3>
      <div className="border-b border-gray-200 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
        {data.map((item, i) => (
          <div
            key={i}
            className={
              item.colSpan === 3
                ? 'lg:col-span-3'
                : item.colSpan === 2
                  ? 'lg:col-span-2'
                  : ''
            }
          >
            <p className="text-xs font-Manrope text-gray-500">{item.label}</p>
            <p className="text-sm font-ManropeBold text-gray-800 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VendorInfoCard
