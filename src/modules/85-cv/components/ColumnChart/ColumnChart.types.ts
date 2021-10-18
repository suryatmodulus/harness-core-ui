import type { GetDataError } from 'restful-react'
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
  columnWidth?: number
  isLoading?: boolean
  error?: GetDataError<unknown> | null
  refetchOnError?: () => void
  columnHeight?: number
  timestampMarker?: {
    timestamp: number
    color: string
  }
}
