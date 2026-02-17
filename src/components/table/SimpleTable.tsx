const SKELETON_ROW_COUNT = 10
const PLACEHOLDER_NA = 'N/A'

export interface TableColumn {
  key: string
  label: string
  /** Custom cell render. Default: missing/empty value shows N/A */
  render?: (value: unknown, row: Record<string, unknown>, rowIndex: number) => React.ReactNode
}

export interface SimpleTableProps {
  headers: TableColumn[]
  data: Record<string, unknown>[]
  /** When true, shows skeleton rows inside the table */
  loading?: boolean
}

function TableSkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="bg-white">
      {Array.from({ length: colCount }).map((_, i) => (
        <td
          key={i}
          className="py-3 px-4 border-r border-gray-200 last:border-r-0 border-b border-gray-200"
        >
          <div className="h-4 w-full max-w-[120px] rounded bg-gray-200 animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

function SimpleTable({ headers, data, loading = false }: SimpleTableProps) {
  const colCount = headers.length

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((col) => (
              <th
                key={col.key}
                className="py-3 px-4 text-left text-sm font-ManropeBold text-gray-800 border-b border-r border-gray-200 last:border-r-0"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <TableSkeletonRow key={i} colCount={colCount} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="py-12 px-4 text-center text-sm font-Manrope text-gray-500"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const isLastRow = rowIndex === data.length - 1
              return (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'}
                >
                  {headers.map((col) => {
                    const value = row[col.key]
                    const isEmpty = value == null || value === ''
                    const cell =
                      col.render != null
                        ? col.render(value, row, rowIndex)
                        : isEmpty
                          ? PLACEHOLDER_NA
                          : String(value)
                    const display = cell == null || cell === '' ? PLACEHOLDER_NA : cell
                    return (
                      <td
                        key={col.key}
                        className={`py-3 px-4 text-sm font-Manrope text-gray-700 border-r border-gray-200 last:border-r-0 ${isLastRow ? 'border-b-0' : 'border-b border-gray-200'}`}
                      >
                        {display}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default SimpleTable
