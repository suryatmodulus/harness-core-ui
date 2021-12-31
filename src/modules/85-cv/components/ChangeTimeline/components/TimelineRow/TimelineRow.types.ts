import type { PointMarkerOptionsObject } from 'highcharts'

export interface TimelineData {
  endTime: number
  icon: {
    height: number
    width: number
    fillColor?: string
    url: string
  }
  tooltip?: {
    message: string
    sideBorderColor: string
  }
  startTime: number
}

export interface TimelineDataPoint extends TimelineData {
  leftOffset: number
}
export interface TimelineRowProps {
  labelWidth?: number
  data: TimelineData[]
  labelName: string
  leftOffset?: number
  startTimestamp?: number
  endTimestamp?: number
  isLoading?: boolean
  noDataMessage?: string | null
  hideTimeline?: boolean
}

export interface PointMarkerOptionsObjectCustom extends PointMarkerOptionsObject {
  custom: {
    count?: number
    startTime: number
    endTime: number
    color: string
    toolTipLabel: string
  }
}
