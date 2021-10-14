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
