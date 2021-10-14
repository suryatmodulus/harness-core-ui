import type { RiskData } from 'services/cv'

export type ColumnData = {
  timeRange: {
    startTime: number
    endTime: number
  }
  color: string
  healthScore?: number
  riskStatus: RiskData['riskStatus']
  height: number
}

export interface ColumnChartProps {
  data: ColumnData[]
  leftOffset?: number
}
