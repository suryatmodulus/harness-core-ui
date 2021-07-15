import type { ActivityVerificationSummary } from 'services/cv'

export type DeploymentNodeAnalysisResult = {
  hostName: string
  risk: ActivityVerificationSummary['risk']
  anomalousMetricsCount: number
  anomalousLogClustersCount: number
}

export const HEXAGON_CONTAINER_SIZE = 24
export const HEXAGON_SIZE = 23
export const NODE_HEALTH_SIZE = 7
