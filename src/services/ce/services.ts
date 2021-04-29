export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type RecommendationsQueryVariables = Exact<{ [key: string]: never }>

export type RecommendationsQuery = {
  __typename?: 'Query'
  recommendations: Maybe<{
    __typename?: 'RecommendationsDTO'
    totalMonthlyCost: number
    totalMonthlySaving: number
    items: Maybe<
      Array<
        Maybe<{
          __typename?: 'NodeDTO'
          id: Maybe<string>
          resourceType: ResourceType
          resourceName: Maybe<string>
          monthlyCost: number
          monthlySaving: number
          recommendationDetails: Maybe<
            | { __typename?: 'NodeRecommendationDTO'; name: Maybe<string> }
            | {
                __typename?: 'WorkloadRecommendationDTO'
                items: Maybe<
                  Array<
                    Maybe<{
                      __typename?: 'ContainerHistogramDTO'
                      containerName: Maybe<string>
                      cpuHistogram: Maybe<{
                        __typename?: 'HistogramExp'
                        bucketWeights: Maybe<Array<Maybe<number>>>
                        firstBucketSize: number
                        growthRatio: number
                        maxBucket: number
                        numBuckets: number
                        precomputed: Maybe<Array<Maybe<number>>>
                        totalWeight: number
                      }>
                      memoryHistogram: Maybe<{
                        __typename?: 'HistogramExp'
                        bucketWeights: Maybe<Array<Maybe<number>>>
                        firstBucketSize: number
                        growthRatio: number
                        maxBucket: number
                        minBucket: number
                        numBuckets: number
                        precomputed: Maybe<Array<Maybe<number>>>
                        totalWeight: number
                      }>
                    }>
                  >
                >
              }
          >
        }>
      >
    >
  }>
}

export type FetchRecommendationQueryVariables = Exact<{
  id: Scalars['String']
}>

export type FetchRecommendationQuery = {
  __typename?: 'Query'
  recommendationDetails: Maybe<
    | { __typename?: 'NodeRecommendationDTO' }
    | {
        __typename?: 'WorkloadRecommendationDTO'
        items: Maybe<
          Array<
            Maybe<{
              __typename?: 'ContainerHistogramDTO'
              containerName: Maybe<string>
              cpuHistogram: Maybe<{
                __typename?: 'HistogramExp'
                bucketWeights: Maybe<Array<Maybe<number>>>
                firstBucketSize: number
                growthRatio: number
                maxBucket: number
                numBuckets: number
                precomputed: Maybe<Array<Maybe<number>>>
                totalWeight: number
              }>
              memoryHistogram: Maybe<{
                __typename?: 'HistogramExp'
                bucketWeights: Maybe<Array<Maybe<number>>>
                firstBucketSize: number
                growthRatio: number
                maxBucket: number
                minBucket: number
                numBuckets: number
                precomputed: Maybe<Array<Maybe<number>>>
                totalWeight: number
              }>
            }>
          >
        >
      }
  >
}

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** Long type */
  Long: any
  /** Built-in scalar representing a date-time with a UTC offset */
  OffsetDateTime: any
  /** Built-in scalar representing a time with a UTC offset */
  OffsetTime: any
  /** Use SPQR's SchemaPrinter to remove this from SDL */
  UNREPRESENTABLE: any
}

/** This union of all types of recommendations */
export type RecommendationDetails = NodeRecommendationDto | WorkloadRecommendationDto

export type BillingDataDemo = {
  __typename?: 'BillingDataDemo'
  billingamount: Maybe<Scalars['Float']>
  instancedata: Maybe<InstanceDataDemo>
  instanceid: Maybe<Scalars['String']>
  instancename: Maybe<Scalars['String']>
  starttime: Maybe<Scalars['Long']>
}

export type ContainerHistogramDto = {
  __typename?: 'ContainerHistogramDTO'
  containerName: Maybe<Scalars['String']>
  cpuHistogram: Maybe<HistogramExp>
  memoryHistogram: Maybe<HistogramExp>
}

export type HistogramExp = {
  __typename?: 'HistogramExp'
  bucketWeights: Maybe<Array<Maybe<Scalars['Float']>>>
  firstBucketSize: Scalars['Float']
  growthRatio: Scalars['Float']
  maxBucket: Scalars['Int']
  minBucket: Scalars['Int']
  numBuckets: Scalars['Int']
  precomputed: Maybe<Array<Maybe<Scalars['Float']>>>
  totalWeight: Scalars['Float']
}

export type InstanceDataDemo = {
  __typename?: 'InstanceDataDemo'
  cloudprovider: Maybe<Scalars['String']>
  instancetype: Maybe<Scalars['String']>
  region: Maybe<Scalars['String']>
}

export type NodeDto = {
  __typename?: 'NodeDTO'
  id: Maybe<Scalars['String']>
  monthlyCost: Scalars['Float']
  monthlySaving: Scalars['Float']
  recommendationDetails: Maybe<RecommendationDetails>
  resourceName: Maybe<Scalars['String']>
  resourceType: ResourceType
}

export type NodeDtoRecommendationDetailsArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  startTime: Maybe<Scalars['OffsetDateTime']>
}

export type NodeRecommendationDto = {
  __typename?: 'NodeRecommendationDTO'
  id: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
}

/** Query root */
export type Query = {
  __typename?: 'Query'
  billingdata: Maybe<Array<Maybe<BillingDataDemo>>>
  instancedata: Maybe<InstanceDataDemo>
  recommendationDetails: Maybe<RecommendationDetails>
  recommendations: Maybe<RecommendationsDto>
}

/** Query root */
export type QueryBillingdataArgs = {
  clusterid: Maybe<Scalars['String']>
  endTime: Maybe<Scalars['OffsetTime']>
  startTime: Maybe<Scalars['OffsetTime']>
}

/** Query root */
export type QueryInstancedataArgs = {
  instanceid: Scalars['String']
}

/** Query root */
export type QueryRecommendationDetailsArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  id: Scalars['String']
  resourceType: ResourceType
  startTime: Maybe<Scalars['OffsetDateTime']>
}

export type RecommendationsDto = {
  __typename?: 'RecommendationsDTO'
  items: Maybe<Array<Maybe<NodeDto>>>
  totalMonthlyCost: Scalars['Float']
  totalMonthlySaving: Scalars['Float']
}

export type WorkloadRecommendationDto = {
  __typename?: 'WorkloadRecommendationDTO'
  items: Maybe<Array<Maybe<ContainerHistogramDto>>>
}

export enum ResourceType {
  AutoStopping = 'AUTO_STOPPING',
  Cluster = 'CLUSTER',
  Node = 'NODE',
  Workload = 'WORKLOAD'
}
