/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface ResourceDetails {
  cpu?: string
  memory: string
}

export interface ResourceObject {
  limits: ResourceDetails
  requests: ResourceDetails
}

export interface HistogramData {
  bucketWeights: Array<number>
  firstBucketSize: number
  growthRatio: number
  maxBucket: number
  numBuckets: number
  precomputed: Array<number>
  totalWeight: number
  minBucket: number
}

interface LastDayCost {
  cpu?: string
  memory?: string
}

export interface RecommendationItem {
  containerName: string
  cpuHistogram: HistogramData
  memoryHistogram: HistogramData
  containerRecommendation: {
    lastDayCost: LastDayCost
  }
}

export type TimeRangeValue = {
  label: TimeRange
  value: TimeRangeType
}

export enum TimeRange {
  'LAST_7' = 'LAST 7 DAYS',
  'LAST_30' = 'LAST 30 DAYS'
}

export enum TimeRangeType {
  'LAST_7' = 'LAST_7',
  'LAST_30' = 'LAST_30'
}

export enum CCM_PAGE_TYPE {
  Workload = 'WORKLOAD',
  Node = 'NODE'
}

export interface YamlDependency {
  selector: { ruleName: string }
  wait: number
}

export type AccessPointScreenMode = 'create' | 'import' | 'edit'
