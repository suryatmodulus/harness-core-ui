import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { AnalyzedLogDataDTO } from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import { LogAnalysisRowData, LogEvents } from './LogAnalysis.types'

export const getClusterTypes = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('pipeline.verification.logs.allEvents'), value: '' },
    { label: getString('pipeline.verification.logs.knownEvent'), value: LogEvents.KNOWN },
    { label: getString('pipeline.verification.logs.unknownEvent'), value: LogEvents.UNKNOWN },
    { label: getString('pipeline.verification.logs.unexpectedFrequency'), value: LogEvents.UNEXPECTED }
  ]
}

export function getLogAnalysisTableData(logsData: AnalyzedLogDataDTO[]): LogAnalysisRowData[] {
  return (
    logsData.map(log => ({
      clusterType: log.logData?.tag,
      count: log.logData?.count ?? 0,
      message: log.logData?.text ?? '',
      messageFrequency: [
        {
          name: 'trendData',
          type: 'line',
          color: getRiskColorValue(log.logData?.riskStatus),
          data: log.logData?.trend?.map(t => t.count ?? 0)
        }
      ],
      riskScore: log.logData?.riskScore ?? 0,
      riskStatus: log.logData?.riskStatus
    })) ?? []
  )
}
