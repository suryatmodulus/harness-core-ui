import type { LogAnalysisClusterChartDTO } from 'services/cv'

export interface ClusterChartProps {
  data: LogAnalysisClusterChartDTO[]
}

export type Risk = 'NO_DATA' | 'NO_ANALYSIS' | 'LOW' | 'MEDIUM' | 'HIGH' | undefined
