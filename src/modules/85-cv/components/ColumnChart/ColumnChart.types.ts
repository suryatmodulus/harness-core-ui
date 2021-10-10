export type ColumnData = {
  timeRange: {
    startTime: number
    endTime: number
  }
  color: string
  healthScore?: number
  riskStatus: string
  height: number
}

export interface ColumnChartProps {
  data: ColumnData[]
  leftOffset?: number
}
