export enum MetricTypes {
  ANOMALOUS = 'ANOMALOUS'
}

export interface MetricsAnalysisProps {
  serviceIdentifier: string
  environmentIdentifier: string
  startTime: number
  endTime: number
}

export interface MetricsAnalysisContentProps extends MetricsAnalysisProps {
  isAnomalous: boolean
  healthSource?: string
  filterString?: string
}
