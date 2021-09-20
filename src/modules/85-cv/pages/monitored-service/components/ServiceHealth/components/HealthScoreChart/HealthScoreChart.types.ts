import type { SeriesColumnOptions } from 'highcharts'
import type { RiskData } from 'services/cv'

export interface HealthScoreChartProps {
  monitoredServiceIdentifier: string
  duration: 'FOUR_HOURS' | 'TWENTY_FOUR_HOURS' | 'THREE_DAYS' | 'SEVEN_DAYS' | 'THIRTY_DAYS'
  setHealthScoreData?: (healthScoreData: RiskData[]) => void
  timeFormat?: string
}

export interface SeriesDataPoint {
  y?: number
  color?: string
}

export type SeriesDataType = Omit<SeriesColumnOptions, 'type'>[]
