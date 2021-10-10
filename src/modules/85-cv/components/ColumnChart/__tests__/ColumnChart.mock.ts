import type { ColumnChartProps } from '../ColumnChart.types'

export const mockSeriesData: ColumnChartProps = {
  data: [
    { color: 'var(--green-200)', riskStatus: 'LOW', height: 50, timeRange: { startTime: 2, endTime: 5 } },
    { color: 'var(--green-200)', riskStatus: 'LOW', height: 99, timeRange: { startTime: 6, endTime: 8 } },
    { color: 'var(--green-200)', riskStatus: 'LOW', height: 100, timeRange: { startTime: 9, endTime: 10 } },
    { color: 'var(--green-200)', riskStatus: 'LOW', height: 45, timeRange: { startTime: 11, endTime: 12 } }
  ]
}
