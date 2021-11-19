import type { SeriesLineOptions } from 'highcharts'
import type { LogData } from 'services/cv'

export type LogAnalysisRowData = {
  clusterType: LogData['tag']
  message: string
  count: number
  messageFrequency: SeriesLineOptions[]
  riskScore: number
  riskStatus: LogData['riskStatus']
}

export interface LogAnalysisProps {
  serviceIdentifier: string
  environmentIdentifier: string
  startTime: number
  endTime: number
}

export enum LogEvents {
  KNOWN = 'KNOWN',
  UNKNOWN = 'UNKNOWN',
  UNEXPECTED = 'UNEXPECTED'
}

export interface LogAnalysisContentProps extends LogAnalysisProps {
  logEvent: LogEvents
  healthSource?: string
}
