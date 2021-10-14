import type { TimelineRowProps } from '../TimelineRow/TimelineRow.types'
import type { TimestampChartProps } from '../TimestampChart/TimestampChart.types'

export interface TimelineProps {
  timelineRows: Omit<TimelineRowProps, 'labelWidth'>[]
  labelWidth?: number
  timestamps?: TimestampChartProps['timestamps']
  timeFormat?: string
  isLoading?: boolean
  rowOffset?: number
}
