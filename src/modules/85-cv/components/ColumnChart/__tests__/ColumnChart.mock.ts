import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import type { ColumnChartProps } from '../ColumnChart.types'

export const mockSeriesData: ColumnChartProps = {
  data: [
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 50,
      timeRange: { startTime: 2, endTime: 5 }
    },
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 99,
      timeRange: { startTime: 6, endTime: 8 }
    },
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 100,
      timeRange: { startTime: 9, endTime: 10 }
    },
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 45,
      timeRange: { startTime: 11, endTime: 12 }
    }
  ]
}
