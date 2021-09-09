import type { SeriesLineOptions } from 'highcharts'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type {
  LogData,
  RestResponseListLogAnalysisClusterChartDTO,
  RestResponsePageAnalyzedLogDataDTO,
  RestResponsePageLogAnalysisClusterDTO
} from 'services/cv'
import type { ExecutionNode } from 'services/pipeline-ng'

export type LogAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesLineOptions[]
  riskScore: number
  riskStatus: string
}

export interface LogAnalysisContainerProps {
  step: ExecutionNode
  hostName?: string
}

export interface LogAnalysisProps {
  serviceIdentifier?: string
  environmentIdentifier?: string
  data: RestResponsePageAnalyzedLogDataDTO | RestResponsePageLogAnalysisClusterDTO | null
  logAnalysisTableData?: LogAnalysisRowData[]
  clusterChartData?: RestResponseListLogAnalysisClusterChartDTO | null
  logsLoading: boolean
  clusterChartLoading?: boolean
  goToPage(val: number): void
  selectedClusterType: SelectOption
  setSelectedClusterType: (clusterType: SelectOption) => void
  onChangeHealthSource: (selectedHealthSource: string) => void
  showClusterChart?: boolean
}
