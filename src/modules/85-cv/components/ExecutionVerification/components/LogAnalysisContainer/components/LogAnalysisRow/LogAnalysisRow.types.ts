import type { SeriesLineOptions } from 'highcharts'
import type { LogData } from 'services/cv'

export type LogAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesLineOptions[]
  riskScore: number
  riskStatus: string
}

export interface LogAnalysisRowProps {
  data: LogAnalysisRowData[]
  className?: string
}

export interface LogAnalysisDataRowProps {
  rowData: LogAnalysisRowData
  onSelect: (
    isSelected: boolean,
    selectedData: LogAnalysisRowData,
    index: number,
    chartOptions: Highcharts.Options
  ) => void
  index: number
  isSelected: boolean
}

export type CompareLogEventsInfo = {
  data: LogAnalysisRowData
  index: number
}
