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

export interface RecommendationItem {
  containerName: string
  cpuHistogram: HistogramData
  memoryHistogram: HistogramData
}
