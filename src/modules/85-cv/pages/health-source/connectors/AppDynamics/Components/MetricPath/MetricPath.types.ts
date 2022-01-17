/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface MetricPathData {
  [key: string]: { value: string; path: string; isMetric?: boolean }
}

export interface MetaPathInterface {
  tier: string
  appName: string
  baseFolder: string
  metricPathValue: MetricPathData
  connectorIdentifier: string
  onChange: (key: string, value: MetricPathData) => void
}
