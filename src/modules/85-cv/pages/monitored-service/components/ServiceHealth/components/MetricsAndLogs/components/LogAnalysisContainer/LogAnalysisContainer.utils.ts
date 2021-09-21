import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import type { AnalyzedLogDataDTO, RestResponsePageAnalyzedLogDataDTO } from 'services/cv'
import type { LogAnalysisRowData } from '@cv/components/LogsAnalysis/LogAnalysis.types'

export function roundOffRiskScore(log: AnalyzedLogDataDTO): number {
  return (
    log?.logData?.riskScore && log?.logData?.riskScore % 1 !== 0
      ? log?.logData?.riskScore?.toFixed(1)
      : log?.logData?.riskScore
  ) as number
}

export function getLogAnalysisTableData(logsData: RestResponsePageAnalyzedLogDataDTO | null): LogAnalysisRowData[] {
  return (
    logsData?.resource?.content?.map(log => ({
      clusterType: log?.logData?.tag,
      count: log?.logData?.count as number,
      message: log?.logData?.text as string,
      messageFrequency: [
        {
          name: 'trendData',
          type: 'line',
          color: getRiskColorValue(log?.logData?.riskStatus),
          data: log?.logData?.trend?.map(trend => trend.count) as number[]
        }
      ],
      riskScore: roundOffRiskScore(log),
      riskStatus: log?.logData?.riskStatus as string
    })) ?? []
  )
}
