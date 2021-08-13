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
  Workload = 'WORKLOAD'
}
