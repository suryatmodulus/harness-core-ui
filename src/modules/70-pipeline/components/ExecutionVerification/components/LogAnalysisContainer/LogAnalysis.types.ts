import type { SeriesLineOptions } from 'highcharts'
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
  riskStatus: string
}

export interface LogAnalysisContainerProps {
  step: ExecutionNode
  hostName?: string
}

export interface LogAnalysisProps {
  data: RestResponsePageLogAnalysisClusterDTO | null
  clusterChartData: RestResponseListLogAnalysisClusterChartDTO | null
  goToPage(val: number): void
  isLoading: boolean
}
