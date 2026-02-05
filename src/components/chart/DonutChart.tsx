import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export interface DonutChartDataItem {
  name: string
  value: number
  color: string
}

export type RingThickness = 'thin' | 'thinMedium' | 'medium' | 'mediumThick' | 'thick'

const RING_THICKNESS_MAP: Record<RingThickness, number> = {
  thin: 0.78,       // patli (e.g. Age Distribution)
  thinMedium: 0.70, // Age se thoda moti, Category se patli (e.g. Conversion Rate)
  medium: 0.65,     // default
  mediumThick: 0.55,// medium se zyada moti (e.g. Category Performance)
  thick: 0.52,      // sabse moti
}

export interface DonutChartProps {
  data: DonutChartDataItem[]
  size?: number
  innerRadiusRatio?: number
  /** Ring thickness: thin < thinMedium < medium < mediumThick < thick. Overrides innerRadiusRatio when set. */
  ringThickness?: RingThickness
  showLabel?: boolean
  centerLabel?: string
}

function DonutChart({
  data,
  size = 220,
  innerRadiusRatio = 0.65,
  ringThickness,
  showLabel = true,
  centerLabel,
}: DonutChartProps) {
  const outerRadius = (size / 2) * 0.85
  const resolvedInnerRatio = ringThickness
    ? RING_THICKNESS_MAP[ringThickness]
    : innerRadiusRatio
  const innerRadius = outerRadius * resolvedInnerRatio

  return (
    <div className="relative w-full" style={{ height: size, minHeight: size }}>
      <ResponsiveContainer width="100%" height={size}>
        <PieChart>
        <Pie
          data={data as unknown as { name: string; value: number; color: string }[]}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={1}
          dataKey="value"
          label={
            showLabel
              ? (props: {
                  cx?: number
                  cy?: number
                  midAngle?: number
                  innerRadius?: number
                  outerRadius?: number
                  percent?: number
                }) => {
                  const RADIAN = Math.PI / 180
                  const cx = props.cx ?? 0
                  const cy = props.cy ?? 0
                  const midAngle = props.midAngle ?? 0
                  const innerRadius = props.innerRadius ?? 0
                  const outerRadius = props.outerRadius ?? 0
                  const percent = props.percent ?? 0
                  const r = (innerRadius + outerRadius) / 2
                  const x = cx + r * Math.cos(-midAngle * RADIAN)
                  const y = cy + r * Math.sin(-midAngle * RADIAN)
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {(percent * 100).toFixed(0)}%
                    </text>
                  )
                }
              : undefined
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-ManropeBold text-gray-800">{centerLabel}</span>
        </div>
      )}
    </div>
  )
}

export default DonutChart
