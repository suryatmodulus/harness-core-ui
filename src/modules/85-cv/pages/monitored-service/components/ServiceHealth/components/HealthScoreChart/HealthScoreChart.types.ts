import type { SelectOption } from '@wings-software/uicore'
import type { SeriesColumnOptions } from 'highcharts'
import type { RiskData } from 'services/cv'

export interface HealthScoreChartProps {
  monitoredServiceIdentifier: string
  duration: SelectOption
  setHealthScoreData?: (healthScoreData: RiskData[]) => void
  timeFormat?: string
}

export interface SeriesDataPoint {
  y?: number
  color?: string
}

export type SeriesDataType = Omit<SeriesColumnOptions, 'type'>[]
