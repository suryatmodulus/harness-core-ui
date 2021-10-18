import type { ColumnChartProps } from '@cv/components/ColumnChart/ColumnChart.types'
import type { RiskData } from 'services/cv'
import type { TimePeriodEnum } from '../../ServiceHealth.constants'

export interface HealthScoreChartProps {
  serviceIdentifier: string
  envIdentifier: string
  duration: TimePeriodEnum
  setHealthScoreData?: (healthScoreData: RiskData[]) => void
  timeFormat?: string
  endTime?: number
  columChartProps?: Pick<ColumnChartProps, 'columnHeight' | 'columnWidth' | 'timestampMarker'>
}
