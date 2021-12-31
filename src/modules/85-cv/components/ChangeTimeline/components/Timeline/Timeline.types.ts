import type { TimelineRowProps } from '../TimelineRow/TimelineRow.types'
export interface TimelineProps {
  timelineRows: Omit<TimelineRowProps, 'labelWidth'>[]
  labelWidth?: number
  timestamps?: number[]
  isLoading?: boolean
  rowOffset?: number
  hideTimeline?: boolean
}
