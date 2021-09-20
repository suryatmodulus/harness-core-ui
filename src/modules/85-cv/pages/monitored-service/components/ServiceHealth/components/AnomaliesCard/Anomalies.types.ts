import type { RiskData } from 'services/cv'

export interface IsAnomaliesDataAvailable {
  isTimeSeriesAnomaliesAvailable: boolean
  isLogsAnomaliesAvailable: boolean
  isTotalAnomaliesAvailable: boolean
  isLowestHealthScoreAvailable: boolean
}

export interface AnomaliesCardProps {
  timeRange?: { startTime: number; endTime: number }
  lowestHealthScoreBarForTimeRange?: RiskData
  timeFormat: string
  serviceIdentifier?: string
  environmentIdentifier?: string
  monitoredServiceIdentifier?: string
}
