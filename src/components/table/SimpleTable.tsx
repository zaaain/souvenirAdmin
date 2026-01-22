export interface TableColumn {
  key: string
  label: string
  /** Custom cell render. Default: String(value ?? '') */
  render?: (value: unknown, row: Record<string, unknown>, rowIndex: number) => React.ReactNode
}

export interface SimpleTableProps {
  headers: TableColumn[]
  data: Record<string, unknown>[]
}

function SimpleTable({ headers, data }: SimpleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
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
          {data.map((row, rowIndex) => {
            const isLastRow = rowIndex === data.length - 1
            return (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'}
              >
                {headers.map((col) => {
                  const value = row[col.key]
                  const cell =
                    col.render != null
                      ? col.render(value, row, rowIndex)
                      : String(value ?? '')
                  return (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-sm font-Manrope text-gray-700 border-r border-gray-200 last:border-r-0 ${isLastRow ? 'border-b-0' : 'border-b border-gray-200'}`}
                    >
                      {cell}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default SimpleTable
