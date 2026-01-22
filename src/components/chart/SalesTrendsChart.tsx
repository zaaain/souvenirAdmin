import { useState, useEffect, useId } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

export interface SalesTrendsDataPoint {
  day: number
  value: number
}

const DEFAULT_LINE_COLOR = '#2466D0'

function formatYAxis(value: number): string {
  if (value >= 1000) return `$${value / 1000}k`
  return `$${value}`
}

function formatTooltipValue(value: number): string {
  return `$${value.toLocaleString()}`
}

interface SalesTrendsTooltipContentProps {
  active?: boolean
  payload?: { payload: SalesTrendsDataPoint; value: number }[]
  onActiveChange: (day: number | null) => void
}

function SalesTrendsTooltipContent({
  active,
  payload,
  onActiveChange,
}: SalesTrendsTooltipContentProps) {
  useEffect(() => {
    if (active && payload?.[0]?.payload?.day != null) {
      onActiveChange(payload[0].payload.day)
    } else {
      onActiveChange(null)
    }
  }, [active, payload, onActiveChange])

  if (!active || !payload?.[0]) return null

  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-lg border border-gray-100">
      <p className="text-sm font-ManropeBold text-gray-800">
        {formatTooltipValue(payload[0].value)}
      </p>
    </div>
  )
}

export interface SalesTrendsChartProps {
  data: SalesTrendsDataPoint[]
  height?: number
  lineColor?: string
  yDomain?: [number, number]
  xDomain?: [number, number]
}

function SalesTrendsChart({
  data,
  height = 240,
  lineColor = DEFAULT_LINE_COLOR,
  yDomain = [0, 1400],
  xDomain = [1, 31],
}: SalesTrendsChartProps) {
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const id = useId()
  const gradientId = `salesAreaFill-${id.replace(/:/g, '-')}`

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal vertical={false} />
          <XAxis
            dataKey="day"
            type="number"
            domain={xDomain}
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'Manrope' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            domain={yDomain}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: '#6b7280', fontFamily: 'Manrope' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            content={<SalesTrendsTooltipContent onActiveChange={setActiveDay} />}
            cursor={{ stroke: lineColor, strokeDasharray: '5 5', strokeWidth: 1 }}
          />
          {activeDay != null && (
            <ReferenceLine
              x={activeDay}
              stroke={lineColor}
              strokeDasharray="5 5"
              strokeWidth={1}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesTrendsChart
