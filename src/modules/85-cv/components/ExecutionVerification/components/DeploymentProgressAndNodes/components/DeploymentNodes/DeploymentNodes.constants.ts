/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AnalysisResult } from 'services/cv'

export type DeploymentNodeAnalysisResult = {
  hostName: string
  risk: AnalysisResult['risk']
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
