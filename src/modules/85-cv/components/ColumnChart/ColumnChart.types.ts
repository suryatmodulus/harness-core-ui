import type { SeriesColumnOptions } from 'highcharts'

export type DataType = Omit<SeriesColumnOptions, 'type'>[]

export interface ColumnChartProps {
  data: DataType
  options?: Highcharts.Options
  timeFormat?: string
}
