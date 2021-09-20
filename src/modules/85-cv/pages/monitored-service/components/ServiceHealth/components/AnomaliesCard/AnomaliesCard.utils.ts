import { Color } from '@wings-software/uicore'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { RestResponseAnomaliesSummaryDTO } from 'services/cv'
import type { IsAnomaliesDataAvailable } from './Anomalies.types'

export const areAnomaliesAvailable = (
  anomaliesData: RestResponseAnomaliesSummaryDTO | null,
  isLowestHealthScoreAvailable?: number
): IsAnomaliesDataAvailable => {
  return {
    isTimeSeriesAnomaliesAvailable: !!(
      anomaliesData?.resource?.timeSeriesAnomalies === 0 || anomaliesData?.resource?.timeSeriesAnomalies
    ),
    isLogsAnomaliesAvailable: !!(
      anomaliesData?.resource?.logsAnomalies === 0 || anomaliesData?.resource?.logsAnomalies
    ),
    isTotalAnomaliesAvailable: !!(
      anomaliesData?.resource?.totalAnomalies === 0 || anomaliesData?.resource?.totalAnomalies
    ),
    isLowestHealthScoreAvailable: !!(isLowestHealthScoreAvailable === 0 || isLowestHealthScoreAvailable)
  }
}

export const mapHealthBarRiskStatusToColor = (riskStatus: string): string => {
  switch (riskStatus) {
    case RiskValues.LOW:
      return Color.GREEN_500
    case RiskValues.MEDIUM:
      return Color.ORANGE_500
    case RiskValues.HIGH:
      return Color.RED_500
    default:
      return Color.GREY_200
  }
}
