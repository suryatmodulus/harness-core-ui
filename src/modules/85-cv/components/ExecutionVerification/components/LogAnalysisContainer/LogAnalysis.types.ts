import type { SeriesLineOptions } from 'highcharts'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type {
  LogData,
  RestResponseListLogAnalysisClusterChartDTO,
  RestResponsePageLogAnalysisClusterDTO
} from 'services/cv'
import type { ExecutionNode } from 'services/pipeline-ng'

export type LogAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesLineOptions[]
  riskScore: number
  riskStatus: LogData['riskStatus']
}

export interface LogAnalysisContainerProps {
  step: ExecutionNode
  hostName?: string
}

export interface LogAnalysisProps {
  data: RestResponsePageLogAnalysisClusterDTO | null
  clusterChartData: RestResponseListLogAnalysisClusterChartDTO | null
  goToPage(val: number): void
  logsLoading: boolean
  clusterChartLoading: boolean
  setSelectedClusterType: (clusterType: SelectOption) => void
  onChangeHealthSource: (selectedHealthSource: string) => void
  activityId?: string
}
