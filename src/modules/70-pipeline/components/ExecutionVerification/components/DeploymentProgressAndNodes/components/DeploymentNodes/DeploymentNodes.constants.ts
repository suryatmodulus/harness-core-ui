import type { ActivityVerificationSummary } from 'services/cv'

export type DeploymentNodeAnalysisResult = {
  hostName: string
  risk: ActivityVerificationSummary['risk']
  anomalousMetricsCount: number
  anomalousLogClustersCount: number
}

export type DeploymentNodeSubPartSize = {
  hexagonContainerSize: number
  hexagonSize: number
  hexagonRadius: number
  nodeHealthSize: number
  containerWidth: number
}

export const DefaultNodeSubPartSize: DeploymentNodeSubPartSize = {
  hexagonContainerSize: 25,
  hexagonSize: 24,
  hexagonRadius: 12,
  nodeHealthSize: 7,
  containerWidth: Number.MAX_VALUE
}
export const HexagonSizes: DeploymentNodeSubPartSize[] = [
  {
    containerWidth: 164,
    hexagonContainerSize: 20,
    hexagonSize: 19,
    hexagonRadius: 8,
    nodeHealthSize: 5
  },
  DefaultNodeSubPartSize
]
