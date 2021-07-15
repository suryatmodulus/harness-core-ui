import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export const FetchAllPerspectivesDocument = gql`
  query FetchAllPerspectives {
    perspectives {
      sampleViews {
        id
        name
        chartType
        createdAt
        viewState
        lastUpdatedAt
      }
      customerViews {
        id
        name
        chartType
        totalCost
        viewType
        viewState
        createdAt
        lastUpdatedAt
        timeRange
        reportScheduledConfigured
        dataSources
        groupBy {
          fieldId
          fieldName
          identifier
          identifierName
        }
      }
    }
  }
`

export function useFetchAllPerspectivesQuery(
  options: Omit<Urql.UseQueryArgs<FetchAllPerspectivesQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchAllPerspectivesQuery>({ query: FetchAllPerspectivesDocument, ...options })
}
export const RecommendationsDocument = gql`
  query Recommendations($filters: K8sRecommendationFilterDTOInput) {
    recommendationStatsV2(filter: $filters) {
      totalMonthlyCost
      totalMonthlySaving
    }
    recommendationsV2(filter: $filters) {
      items {
        id
        resourceType
        resourceName
        monthlyCost
        monthlySaving
      }
    }
  }
`

export function useRecommendationsQuery(options: Omit<Urql.UseQueryArgs<RecommendationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<RecommendationsQuery>({ query: RecommendationsDocument, ...options })
}
export const FetchPerspectiveFiltersValueDocument = gql`
  query FetchPerspectiveFiltersValue($filters: [QLCEViewFilterWrapperInput], $offset: Int, $limit: Int) {
    perspectiveFilters(filters: $filters, offset: $offset, limit: $limit) {
      values
    }
  }
`

export function useFetchPerspectiveFiltersValueQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveFiltersValueQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveFiltersValueQuery>({ query: FetchPerspectiveFiltersValueDocument, ...options })
}
export const FetchperspectiveGridDocument = gql`
  query FetchperspectiveGrid(
    $filters: [QLCEViewFilterWrapperInput]
    $groupBy: [QLCEViewGroupByInput]
    $limit: Int
    $offset: Int
    $aggregateFunction: [QLCEViewAggregationInput]
    $isClusterOnly: Boolean!
  ) {
    perspectiveGrid(
      aggregateFunction: $aggregateFunction
      filters: $filters
      groupBy: $groupBy
      limit: $limit
      offset: $offset
      sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
    ) {
      data {
        name
        id
        cost
        costTrend
        clusterPerspective @include(if: $isClusterOnly)
        clusterData @include(if: $isClusterOnly) {
          appId
          appName
          avgCpuUtilization
          avgMemoryUtilization
          cloudProvider
          cloudProviderId
          cloudServiceName
          clusterId
          clusterName
          clusterType
          costTrend
          cpuBillingAmount
          cpuIdleCost
          cpuUnallocatedCost
          efficiencyScore
          efficiencyScoreTrendPercentage
          envId
          envName
          environment
          id
          idleCost
          launchType
          maxCpuUtilization
          maxMemoryUtilization
          memoryBillingAmount
          memoryIdleCost
          memoryUnallocatedCost
          name
          namespace
          networkCost
          prevBillingAmount
          region
          serviceId
          serviceName
          storageActualIdleCost
          storageRequest
          storageUnallocatedCost
          storageUtilizationValue
          totalCost
          trendType
          type
          unallocatedCost
          workloadName
          workloadType
        }
      }
    }
  }
`

export function useFetchperspectiveGridQuery(
  options: Omit<Urql.UseQueryArgs<FetchperspectiveGridQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchperspectiveGridQuery>({ query: FetchperspectiveGridDocument, ...options })
}
export const FetchPerspectiveDetailsSummaryDocument = gql`
  query FetchPerspectiveDetailsSummary($filters: [QLCEViewFilterWrapperInput]) {
    perspectiveTrendStats(
      filters: $filters
      aggregateFunction: [
        { operationType: SUM, columnName: "cost" }
        { operationType: MAX, columnName: "startTime" }
        { operationType: MIN, columnName: "startTime" }
      ]
    ) {
      cost {
        statsDescription
        statsLabel
        statsTrend
        statsValue
        value
      }
    }
  }
`

export function useFetchPerspectiveDetailsSummaryQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveDetailsSummaryQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveDetailsSummaryQuery>({
    query: FetchPerspectiveDetailsSummaryDocument,
    ...options
  })
}
export const FetchPerspectiveTimeSeriesDocument = gql`
  query FetchPerspectiveTimeSeries(
    $filters: [QLCEViewFilterWrapperInput]
    $groupBy: [QLCEViewGroupByInput]
    $limit: Int
  ) {
    perspectiveTimeSeriesStats(
      filters: $filters
      groupBy: $groupBy
      limit: $limit
      includeOthers: false
      aggregateFunction: [{ operationType: SUM, columnName: "cost" }]
      sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
    ) {
      stats {
        values {
          key {
            id
            name
            type
          }
          value
        }
        time
      }
    }
  }
`

export function useFetchPerspectiveTimeSeriesQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveTimeSeriesQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveTimeSeriesQuery>({ query: FetchPerspectiveTimeSeriesDocument, ...options })
}
export const FetchRecommendationDocument = gql`
  query FetchRecommendation($id: String!, $startTime: OffsetDateTime!, $endTime: OffsetDateTime!) {
    recommendationStats(id: $id) {
      totalMonthlyCost
      totalMonthlySaving
    }
    recommendationDetails(id: $id, resourceType: WORKLOAD, startTime: $startTime, endTime: $endTime) {
      ... on WorkloadRecommendationDTO {
        containerRecommendations
        items {
          containerRecommendation {
            numDays
            current {
              CPU
              MEMORY
            }
            lastDayCost {
              cpu
              memory
            }
          }
          containerName
          cpuHistogram {
            bucketWeights
            firstBucketSize
            growthRatio
            maxBucket
            minBucket
            numBuckets
            precomputed
            totalWeight
          }
          memoryHistogram {
            bucketWeights
            firstBucketSize
            growthRatio
            maxBucket
            minBucket
            numBuckets
            precomputed
            totalWeight
          }
        }
      }
    }
  }
`

export function useFetchRecommendationQuery(
  options: Omit<Urql.UseQueryArgs<FetchRecommendationQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchRecommendationQuery>({ query: FetchRecommendationDocument, ...options })
}
export const RecommendationFiltersDocument = gql`
  query RecommendationFilters {
    recommendationFilterStats(keys: ["name", "resourceType", "namespace", "clusterName"]) {
      key
      values
    }
  }
`

export function useRecommendationFiltersQuery(
  options: Omit<Urql.UseQueryArgs<RecommendationFiltersQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<RecommendationFiltersQuery>({ query: RecommendationFiltersDocument, ...options })
}
export const FetchViewFieldsDocument = gql`
  query FetchViewFields($filters: [QLCEViewFilterWrapperInput]) {
    perspectiveFields(filters: $filters) {
      fieldIdentifierData {
        identifier
        identifierName
        values {
          fieldId
          fieldName
          identifier
          identifierName
        }
      }
    }
  }
`

export function useFetchViewFieldsQuery(options: Omit<Urql.UseQueryArgs<FetchViewFieldsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FetchViewFieldsQuery>({ query: FetchViewFieldsDocument, ...options })
}
export type FetchAllPerspectivesQueryVariables = Exact<{ [key: string]: never }>

export type FetchAllPerspectivesQuery = {
  __typename?: 'Query'
  perspectives: Maybe<{
    __typename?: 'PerspectiveData'
    sampleViews: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEView'
          id: Maybe<string>
          name: Maybe<string>
          chartType: Maybe<ViewChartType>
          createdAt: Maybe<any>
          viewState: Maybe<ViewState>
          lastUpdatedAt: Maybe<any>
        }>
      >
    >
    customerViews: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEView'
          id: Maybe<string>
          name: Maybe<string>
          chartType: Maybe<ViewChartType>
          totalCost: number
          viewType: Maybe<ViewType>
          viewState: Maybe<ViewState>
          createdAt: Maybe<any>
          lastUpdatedAt: Maybe<any>
          timeRange: Maybe<ViewTimeRangeType>
          reportScheduledConfigured: boolean
          dataSources: Maybe<Array<Maybe<ViewFieldIdentifier>>>
          groupBy: Maybe<{
            __typename?: 'QLCEViewField'
            fieldId: string
            fieldName: string
            identifier: Maybe<ViewFieldIdentifier>
            identifierName: Maybe<string>
          }>
        }>
      >
    >
  }>
}

export type RecommendationsQueryVariables = Exact<{
  filters: Maybe<K8sRecommendationFilterDtoInput>
}>

export type RecommendationsQuery = {
  __typename?: 'Query'
  recommendationStatsV2: Maybe<{
    __typename?: 'RecommendationOverviewStats'
    totalMonthlyCost: number
    totalMonthlySaving: number
  }>
  recommendationsV2: Maybe<{
    __typename?: 'RecommendationsDTO'
    items: Maybe<
      Array<
        Maybe<{
          __typename?: 'RecommendationItemDTO'
          id: string
          resourceType: ResourceType
          resourceName: Maybe<string>
          monthlyCost: Maybe<number>
          monthlySaving: Maybe<number>
        }>
      >
    >
  }>
}

export type FetchPerspectiveFiltersValueQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  offset: Maybe<Scalars['Int']>
  limit: Maybe<Scalars['Int']>
}>

export type FetchPerspectiveFiltersValueQuery = {
  __typename?: 'Query'
  perspectiveFilters: Maybe<{ __typename?: 'PerspectiveFilterData'; values: Maybe<Array<Maybe<string>>> }>
}

export type FetchperspectiveGridQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  isClusterOnly: Scalars['Boolean']
}>

export type FetchperspectiveGridQuery = {
  __typename?: 'Query'
  perspectiveGrid: Maybe<{
    __typename?: 'PerspectiveEntityStatsData'
    data: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewEntityStatsDataPoint'
          name: Maybe<string>
          id: Maybe<string>
          cost: Maybe<any>
          costTrend: Maybe<any>
          clusterPerspective: Maybe<boolean>
          clusterData?: Maybe<{
            __typename?: 'ClusterData'
            appId: Maybe<string>
            appName: Maybe<string>
            avgCpuUtilization: Maybe<number>
            avgMemoryUtilization: Maybe<number>
            cloudProvider: Maybe<string>
            cloudProviderId: Maybe<string>
            cloudServiceName: Maybe<string>
            clusterId: Maybe<string>
            clusterName: Maybe<string>
            clusterType: Maybe<string>
            costTrend: Maybe<number>
            cpuBillingAmount: Maybe<number>
            cpuIdleCost: Maybe<number>
            cpuUnallocatedCost: Maybe<number>
            efficiencyScore: number
            efficiencyScoreTrendPercentage: number
            envId: Maybe<string>
            envName: Maybe<string>
            environment: Maybe<string>
            id: Maybe<string>
            idleCost: Maybe<number>
            launchType: Maybe<string>
            maxCpuUtilization: Maybe<number>
            maxMemoryUtilization: Maybe<number>
            memoryBillingAmount: Maybe<number>
            memoryIdleCost: Maybe<number>
            memoryUnallocatedCost: Maybe<number>
            name: Maybe<string>
            namespace: Maybe<string>
            networkCost: Maybe<number>
            prevBillingAmount: Maybe<number>
            region: Maybe<string>
            serviceId: Maybe<string>
            serviceName: Maybe<string>
            storageActualIdleCost: Maybe<number>
            storageRequest: Maybe<number>
            storageUnallocatedCost: Maybe<number>
            storageUtilizationValue: Maybe<number>
            totalCost: Maybe<number>
            trendType: Maybe<string>
            type: Maybe<string>
            unallocatedCost: Maybe<number>
            workloadName: Maybe<string>
            workloadType: Maybe<string>
          }>
        }>
      >
    >
  }>
}

export type FetchPerspectiveDetailsSummaryQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
}>

export type FetchPerspectiveDetailsSummaryQuery = {
  __typename?: 'Query'
  perspectiveTrendStats: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsDescription: string
      statsLabel: string
      statsTrend: any
      statsValue: string
      value: any
    }>
  }>
}

export type FetchPerspectiveTimeSeriesQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
  limit: Maybe<Scalars['Int']>
}>

export type FetchPerspectiveTimeSeriesQuery = {
  __typename?: 'Query'
  perspectiveTimeSeriesStats: Maybe<{
    __typename?: 'PerspectiveTimeSeriesData'
    stats: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{
              __typename?: 'DataPoint'
              value: any
              key: { __typename?: 'Reference'; id: string; name: string; type: string }
            }>
          >
        }>
      >
    >
  }>
}

export type FetchRecommendationQueryVariables = Exact<{
  id: Scalars['String']
  startTime: Scalars['OffsetDateTime']
  endTime: Scalars['OffsetDateTime']
}>

export type FetchRecommendationQuery = {
  __typename?: 'Query'
  recommendationStats: Maybe<{
    __typename?: 'RecommendationOverviewStats'
    totalMonthlyCost: number
    totalMonthlySaving: number
  }>
  recommendationDetails: Maybe<
    | { __typename?: 'NodeRecommendationDTO' }
    | {
        __typename?: 'WorkloadRecommendationDTO'
        containerRecommendations: Maybe<any>
        items: Maybe<
          Array<
            Maybe<{
              __typename?: 'ContainerHistogramDTO'
              containerName: Maybe<string>
              containerRecommendation: Maybe<{
                __typename?: 'ContainerRecommendation'
                numDays: number
                current: Maybe<{ __typename?: 'ResourceRequirement'; CPU: Maybe<string>; MEMORY: Maybe<string> }>
                lastDayCost: Maybe<{ __typename?: 'Cost'; cpu: Maybe<any>; memory: Maybe<any> }>
              }>
              cpuHistogram: Maybe<{
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

export type RecommendationFiltersQueryVariables = Exact<{ [key: string]: never }>

export type RecommendationFiltersQuery = {
  __typename?: 'Query'
  recommendationFilterStats: Maybe<
    Array<Maybe<{ __typename?: 'FilterStatsDTO'; key: Maybe<string>; values: Maybe<Array<Maybe<string>>> }>>
  >
}

export type FetchViewFieldsQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
}>

export type FetchViewFieldsQuery = {
  __typename?: 'Query'
  perspectiveFields: Maybe<{
    __typename?: 'PerspectiveFieldsData'
    fieldIdentifierData: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewFieldIdentifierData'
          identifier: ViewFieldIdentifier
          identifierName: string
          values: Array<
            Maybe<{
              __typename?: 'QLCEViewField'
              fieldId: string
              fieldName: string
              identifier: Maybe<ViewFieldIdentifier>
              identifierName: Maybe<string>
            }>
          >
        }>
      >
    >
  }>
}

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** Built-in java.math.BigDecimal */
  BigDecimal: any
  /** Long type */
  Long: any
  /** Built-in scalar for map-like structures */
  Map_String_ContainerRecommendationScalar: any
  /** Built-in scalar for map-like structures */
  Map_String_ResourceRequirementScalar: any
  /** Built-in scalar for map-like structures */
  Map_String_StringScalar: any
  /** Built-in scalar representing a date-time with a UTC offset */
  OffsetDateTime: any
  /** Built-in scalar representing a time with a UTC offset */
  OffsetTime: any
  /** Use SPQR's SchemaPrinter to remove this from SDL */
  UNREPRESENTABLE: any
}

/** This union of all types of recommendations */
export type RecommendationDetails = NodeRecommendationDto | WorkloadRecommendationDto

export type BillingData = {
  __typename?: 'BillingData'
  accountid: Maybe<Scalars['String']>
  actualidlecost: Maybe<Scalars['Float']>
  appid: Maybe<Scalars['String']>
  avgcpuutilization: Maybe<Scalars['Float']>
  avgcpuutilizationvalue: Maybe<Scalars['Float']>
  avgmemoryutilization: Maybe<Scalars['Float']>
  avgmemoryutilizationvalue: Maybe<Scalars['Float']>
  billingaccountid: Maybe<Scalars['String']>
  billingamount: Maybe<Scalars['Float']>
  cloudprovider: Maybe<Scalars['String']>
  cloudproviderid: Maybe<Scalars['String']>
  cloudservicename: Maybe<Scalars['String']>
  clusterid: Maybe<Scalars['String']>
  clustername: Maybe<Scalars['String']>
  clustertype: Maybe<Scalars['String']>
  cpuactualidlecost: Maybe<Scalars['Float']>
  cpubillingamount: Maybe<Scalars['Float']>
  cpuidlecost: Maybe<Scalars['Float']>
  cpulimit: Maybe<Scalars['Float']>
  cpurequest: Maybe<Scalars['Float']>
  cpusystemcost: Maybe<Scalars['Float']>
  cpuunallocatedcost: Maybe<Scalars['Float']>
  cpuunitseconds: Maybe<Scalars['Float']>
  endtime: Maybe<Scalars['OffsetDateTime']>
  envid: Maybe<Scalars['String']>
  idlecost: Maybe<Scalars['Float']>
  instanceid: Maybe<Scalars['String']>
  instancename: Maybe<Scalars['String']>
  instancetype: Maybe<Scalars['String']>
  launchtype: Maybe<Scalars['String']>
  maxcpuutilization: Maybe<Scalars['Float']>
  maxcpuutilizationvalue: Maybe<Scalars['Float']>
  maxmemoryutilization: Maybe<Scalars['Float']>
  maxmemoryutilizationvalue: Maybe<Scalars['Float']>
  memoryactualidlecost: Maybe<Scalars['Float']>
  memorybillingamount: Maybe<Scalars['Float']>
  memoryidlecost: Maybe<Scalars['Float']>
  memorylimit: Maybe<Scalars['Float']>
  memorymbseconds: Maybe<Scalars['Float']>
  memoryrequest: Maybe<Scalars['Float']>
  memorysystemcost: Maybe<Scalars['Float']>
  memoryunallocatedcost: Maybe<Scalars['Float']>
  namespace: Maybe<Scalars['String']>
  networkcost: Maybe<Scalars['Float']>
  parentinstanceid: Maybe<Scalars['String']>
  pricingsource: Maybe<Scalars['String']>
  region: Maybe<Scalars['String']>
  serviceid: Maybe<Scalars['String']>
  settingid: Maybe<Scalars['String']>
  starttime: Maybe<Scalars['OffsetDateTime']>
  storageactualidlecost: Maybe<Scalars['Float']>
  storagecost: Maybe<Scalars['Float']>
  storagembseconds: Maybe<Scalars['Float']>
  storagerequest: Maybe<Scalars['Float']>
  storageunallocatedcost: Maybe<Scalars['Float']>
  storageutilizationvalue: Maybe<Scalars['Float']>
  systemcost: Maybe<Scalars['Float']>
  taskid: Maybe<Scalars['String']>
  unallocatedcost: Maybe<Scalars['Float']>
  usagedurationseconds: Maybe<Scalars['Float']>
  workloadname: Maybe<Scalars['String']>
  workloadtype: Maybe<Scalars['String']>
}

export type BillingDataDemo = {
  __typename?: 'BillingDataDemo'
  billingamount: Maybe<Scalars['Float']>
  instancedata: Maybe<InstanceDataDemo>
  instanceid: Maybe<Scalars['String']>
  instancename: Maybe<Scalars['String']>
  starttime: Maybe<Scalars['Long']>
}

export type ClusterData = {
  __typename?: 'ClusterData'
  appId: Maybe<Scalars['String']>
  appName: Maybe<Scalars['String']>
  avgCpuUtilization: Maybe<Scalars['Float']>
  avgMemoryUtilization: Maybe<Scalars['Float']>
  cloudProvider: Maybe<Scalars['String']>
  cloudProviderId: Maybe<Scalars['String']>
  cloudServiceName: Maybe<Scalars['String']>
  clusterId: Maybe<Scalars['String']>
  clusterName: Maybe<Scalars['String']>
  clusterType: Maybe<Scalars['String']>
  costTrend: Maybe<Scalars['Float']>
  cpuBillingAmount: Maybe<Scalars['Float']>
  cpuIdleCost: Maybe<Scalars['Float']>
  cpuUnallocatedCost: Maybe<Scalars['Float']>
  efficiencyScore: Scalars['Int']
  efficiencyScoreTrendPercentage: Scalars['Int']
  envId: Maybe<Scalars['String']>
  envName: Maybe<Scalars['String']>
  environment: Maybe<Scalars['String']>
  id: Maybe<Scalars['String']>
  idleCost: Maybe<Scalars['Float']>
  launchType: Maybe<Scalars['String']>
  maxCpuUtilization: Maybe<Scalars['Float']>
  maxMemoryUtilization: Maybe<Scalars['Float']>
  memoryBillingAmount: Maybe<Scalars['Float']>
  memoryIdleCost: Maybe<Scalars['Float']>
  memoryUnallocatedCost: Maybe<Scalars['Float']>
  name: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  networkCost: Maybe<Scalars['Float']>
  prevBillingAmount: Maybe<Scalars['Float']>
  region: Maybe<Scalars['String']>
  serviceId: Maybe<Scalars['String']>
  serviceName: Maybe<Scalars['String']>
  storageActualIdleCost: Maybe<Scalars['Float']>
  storageCost: Maybe<Scalars['Float']>
  storageRequest: Maybe<Scalars['Float']>
  storageUnallocatedCost: Maybe<Scalars['Float']>
  storageUtilizationValue: Maybe<Scalars['Float']>
  totalCost: Maybe<Scalars['Float']>
  trendType: Maybe<Scalars['String']>
  type: Maybe<Scalars['String']>
  unallocatedCost: Maybe<Scalars['Float']>
  workloadName: Maybe<Scalars['String']>
  workloadType: Maybe<Scalars['String']>
}

export type ContainerHistogramDto = {
  __typename?: 'ContainerHistogramDTO'
  containerName: Maybe<Scalars['String']>
  containerRecommendation: Maybe<ContainerRecommendation>
  cpuHistogram: Maybe<HistogramExp>
  memoryHistogram: Maybe<HistogramExp>
}

export type ContainerRecommendation = {
  __typename?: 'ContainerRecommendation'
  burstable: Maybe<ResourceRequirement>
  current: Maybe<ResourceRequirement>
  guaranteed: Maybe<ResourceRequirement>
  lastDayCost: Maybe<Cost>
  numDays: Scalars['Int']
  percentileBased: Maybe<Scalars['Map_String_ResourceRequirementScalar']>
  recommended: Maybe<ResourceRequirement>
  totalSamplesCount: Scalars['Int']
}

export type Cost = {
  __typename?: 'Cost'
  cpu: Maybe<Scalars['BigDecimal']>
  memory: Maybe<Scalars['BigDecimal']>
}

export type DataPoint = {
  __typename?: 'DataPoint'
  key: Reference
  value: Scalars['BigDecimal']
}

export type FilterStatsDto = {
  __typename?: 'FilterStatsDTO'
  key: Maybe<Scalars['String']>
  values: Maybe<Array<Maybe<Scalars['String']>>>
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

export type NodeRecommendationDto = {
  __typename?: 'NodeRecommendationDTO'
  currentCloudProvider: Maybe<Scalars['String']>
  currentService: Maybe<Scalars['String']>
  id: Maybe<Scalars['String']>
  maxCpu: Maybe<Scalars['Int']>
  maxMemory: Maybe<Scalars['Int']>
  sumCpu: Maybe<Scalars['Int']>
  sumMemory: Maybe<Scalars['Int']>
}

export type PerspectiveData = {
  __typename?: 'PerspectiveData'
  customerViews: Maybe<Array<Maybe<QlceView>>>
  sampleViews: Maybe<Array<Maybe<QlceView>>>
}

export type PerspectiveEntityStatsData = {
  __typename?: 'PerspectiveEntityStatsData'
  data: Maybe<Array<Maybe<QlceViewEntityStatsDataPoint>>>
}

export type PerspectiveFieldsData = {
  __typename?: 'PerspectiveFieldsData'
  fieldIdentifierData: Maybe<Array<Maybe<QlceViewFieldIdentifierData>>>
}

export type PerspectiveFilterData = {
  __typename?: 'PerspectiveFilterData'
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type PerspectiveOverviewStatsData = {
  __typename?: 'PerspectiveOverviewStatsData'
  isAwsOrGcpOrClusterConfigured: Maybe<Scalars['Boolean']>
  unifiedTableDataPresent: Maybe<Scalars['Boolean']>
}

export type PerspectiveTimeSeriesData = {
  __typename?: 'PerspectiveTimeSeriesData'
  stats: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
}

export type PerspectiveTrendStats = {
  __typename?: 'PerspectiveTrendStats'
  cost: Maybe<StatsInfo>
}

export type QlceView = {
  __typename?: 'QLCEView'
  chartType: Maybe<ViewChartType>
  createdAt: Maybe<Scalars['Long']>
  createdBy: Maybe<Scalars['String']>
  dataSources: Maybe<Array<Maybe<ViewFieldIdentifier>>>
  groupBy: Maybe<QlceViewField>
  id: Maybe<Scalars['String']>
  lastUpdatedAt: Maybe<Scalars['Long']>
  name: Maybe<Scalars['String']>
  reportScheduledConfigured: Scalars['Boolean']
  timeRange: Maybe<ViewTimeRangeType>
  totalCost: Scalars['Float']
  viewState: Maybe<ViewState>
  viewType: Maybe<ViewType>
}

export type QlceViewEntityStatsDataPoint = {
  __typename?: 'QLCEViewEntityStatsDataPoint'
  clusterData: Maybe<ClusterData>
  clusterPerspective: Scalars['Boolean']
  cost: Maybe<Scalars['BigDecimal']>
  costTrend: Maybe<Scalars['BigDecimal']>
  id: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
}

export type QlceViewField = {
  __typename?: 'QLCEViewField'
  fieldId: Scalars['String']
  fieldName: Scalars['String']
  identifier: Maybe<ViewFieldIdentifier>
  identifierName: Maybe<Scalars['String']>
}

export type QlceViewFieldIdentifierData = {
  __typename?: 'QLCEViewFieldIdentifierData'
  identifier: ViewFieldIdentifier
  identifierName: Scalars['String']
  values: Array<Maybe<QlceViewField>>
}

/** Query root */
export type Query = {
  __typename?: 'Query'
  billingData: Maybe<Array<Maybe<BillingData>>>
  billingdata: Maybe<Array<Maybe<BillingDataDemo>>>
  instancedata: Maybe<InstanceDataDemo>
  /** Fields for perspective explorer */
  perspectiveFields: Maybe<PerspectiveFieldsData>
  /** Filter values for perspective */
  perspectiveFilters: Maybe<PerspectiveFilterData>
  /** Table for perspective */
  perspectiveGrid: Maybe<PerspectiveEntityStatsData>
  /** Overview stats for perspective */
  perspectiveOverviewStats: Maybe<PerspectiveOverviewStatsData>
  /** Table for perspective */
  perspectiveTimeSeriesStats: Maybe<PerspectiveTimeSeriesData>
  /** Trend stats for perspective */
  perspectiveTrendStats: Maybe<PerspectiveTrendStats>
  /** Fetch perspectives for account */
  perspectives: Maybe<PerspectiveData>
  /** recommendation details/drillDown */
  recommendationDetails: Maybe<RecommendationDetails>
  /** possible filter values for each column */
  recommendationFilterStats: Maybe<Array<Maybe<FilterStatsDto>>>
  /** Possible filter values for each key */
  recommendationFilterStatsV2: Maybe<Array<Maybe<FilterStatsDto>>>
  /** top panel stats API */
  recommendationStats: Maybe<RecommendationOverviewStats>
  /** Top panel stats API, aggregated */
  recommendationStatsV2: Maybe<RecommendationOverviewStats>
  /** the list of all types of recommendations for overview page */
  recommendations: Maybe<RecommendationsDto>
  /** The list of all types of recommendations for overview page */
  recommendationsV2: Maybe<RecommendationsDto>
}

/** Query root */
export type QueryBillingDataArgs = {
  request: Maybe<GridRequestInput>
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
export type QueryPerspectiveFieldsArgs = {
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
}

/** Query root */
export type QueryPerspectiveFiltersArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  sortCriteria: Maybe<Array<Maybe<QlceViewSortCriteriaInput>>>
}

/** Query root */
export type QueryPerspectiveGridArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  sortCriteria: Maybe<Array<Maybe<QlceViewSortCriteriaInput>>>
}

/** Query root */
export type QueryPerspectiveTimeSeriesStatsArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  includeOthers: Scalars['Boolean']
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  sortCriteria: Maybe<Array<Maybe<QlceViewSortCriteriaInput>>>
}

/** Query root */
export type QueryPerspectiveTrendStatsArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
}

/** Query root */
export type QueryRecommendationDetailsArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  id: Scalars['String']
  resourceType: ResourceType
  startTime: Maybe<Scalars['OffsetDateTime']>
}

/** Query root */
export type QueryRecommendationFilterStatsArgs = {
  clusterName: Maybe<Scalars['String']>
  keys?: Maybe<Array<Maybe<Scalars['String']>>>
  minCost: Maybe<Scalars['Float']>
  minSaving: Maybe<Scalars['Float']>
  name: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  resourceType: Maybe<ResourceType>
}

/** Query root */
export type QueryRecommendationFilterStatsV2Args = {
  filter?: Maybe<K8sRecommendationFilterDtoInput>
  keys?: Maybe<Array<Maybe<Scalars['String']>>>
}

/** Query root */
export type QueryRecommendationStatsArgs = {
  clusterName: Maybe<Scalars['String']>
  id: Maybe<Scalars['String']>
  minCost: Maybe<Scalars['Float']>
  minSaving: Maybe<Scalars['Float']>
  name: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  resourceType: Maybe<ResourceType>
}

/** Query root */
export type QueryRecommendationStatsV2Args = {
  filter?: Maybe<K8sRecommendationFilterDtoInput>
}

/** Query root */
export type QueryRecommendationsArgs = {
  clusterName: Maybe<Scalars['String']>
  id: Maybe<Scalars['String']>
  limit?: Maybe<Scalars['Long']>
  minCost: Maybe<Scalars['Float']>
  minSaving: Maybe<Scalars['Float']>
  name: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  offset?: Maybe<Scalars['Long']>
  resourceType: Maybe<ResourceType>
}

/** Query root */
export type QueryRecommendationsV2Args = {
  filter?: Maybe<K8sRecommendationFilterDtoInput>
}

export type RecommendationItemDto = {
  __typename?: 'RecommendationItemDTO'
  clusterName: Maybe<Scalars['String']>
  id: Scalars['String']
  monthlyCost: Maybe<Scalars['Float']>
  monthlySaving: Maybe<Scalars['Float']>
  /** recommendation details/drillDown */
  recommendationDetails: Maybe<RecommendationDetails>
  resourceName: Maybe<Scalars['String']>
  resourceType: ResourceType
}

export type RecommendationItemDtoRecommendationDetailsArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  startTime: Maybe<Scalars['OffsetDateTime']>
}

export type RecommendationOverviewStats = {
  __typename?: 'RecommendationOverviewStats'
  totalMonthlyCost: Scalars['Float']
  totalMonthlySaving: Scalars['Float']
}

export type RecommendationsDto = {
  __typename?: 'RecommendationsDTO'
  items: Maybe<Array<Maybe<RecommendationItemDto>>>
  limit: Scalars['Long']
  offset: Scalars['Long']
}

export type Reference = {
  __typename?: 'Reference'
  id: Scalars['String']
  name: Scalars['String']
  type: Scalars['String']
}

export type ResourceRequirement = {
  __typename?: 'ResourceRequirement'
  CPU: Maybe<Scalars['String']>
  MEMORY: Maybe<Scalars['String']>
  empty: Scalars['Boolean']
  limits: Maybe<Scalars['Map_String_StringScalar']>
  requests: Maybe<Scalars['Map_String_StringScalar']>
}

export type StatsInfo = {
  __typename?: 'StatsInfo'
  statsDescription: Scalars['String']
  statsLabel: Scalars['String']
  statsTrend: Scalars['BigDecimal']
  statsValue: Scalars['String']
  value: Scalars['BigDecimal']
}

export type TimeSeriesDataPoints = {
  __typename?: 'TimeSeriesDataPoints'
  time: Scalars['Long']
  values: Array<Maybe<DataPoint>>
}

export type WorkloadRecommendationDto = {
  __typename?: 'WorkloadRecommendationDTO'
  /**
   * use items.containerRecommendation
   * @deprecated Field no longer supported
   */
  containerRecommendations: Maybe<Scalars['Map_String_ContainerRecommendationScalar']>
  items: Maybe<Array<Maybe<ContainerHistogramDto>>>
  lastDayCost: Maybe<Cost>
}

export enum AggregationOperation {
  Avg = 'AVG',
  Count = 'COUNT',
  Max = 'MAX',
  Min = 'MIN',
  Sum = 'SUM'
}

export enum FilterOperator {
  Equals = 'EQUALS',
  GreaterOrEquals = 'GREATER_OR_EQUALS',
  In = 'IN',
  LessOrEquals = 'LESS_OR_EQUALS',
  Like = 'LIKE',
  NotEquals = 'NOT_EQUALS',
  NotIn = 'NOT_IN',
  NotNull = 'NOT_NULL',
  TimeAfter = 'TIME_AFTER',
  TimeBefore = 'TIME_BEFORE'
}

export enum QlceSortOrder {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

export enum QlceViewAggregateOperation {
  Max = 'MAX',
  Min = 'MIN',
  Sum = 'SUM'
}

export enum QlceViewFilterOperator {
  Equals = 'EQUALS',
  In = 'IN',
  NotIn = 'NOT_IN',
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

export enum QlceViewSortType {
  ClusterCost = 'CLUSTER_COST',
  Cost = 'COST',
  Time = 'TIME'
}

export enum QlceViewTimeFilterOperator {
  After = 'AFTER',
  Before = 'BEFORE'
}

export enum QlceViewTimeGroupType {
  Day = 'DAY',
  Hour = 'HOUR',
  Month = 'MONTH',
  Week = 'WEEK'
}

export enum ResourceType {
  NodePool = 'NODE_POOL',
  Workload = 'WORKLOAD'
}

export enum SortOrder {
  Asc = 'ASC',
  Ascending = 'ASCENDING',
  Desc = 'DESC',
  Descending = 'DESCENDING'
}

export enum ViewChartType {
  StackedLineChart = 'STACKED_LINE_CHART',
  StackedTimeSeries = 'STACKED_TIME_SERIES'
}

export enum ViewFieldIdentifier {
  Aws = 'AWS',
  Azure = 'AZURE',
  Cluster = 'CLUSTER',
  Common = 'COMMON',
  Custom = 'CUSTOM',
  Gcp = 'GCP',
  Label = 'LABEL'
}

export enum ViewState {
  Completed = 'COMPLETED',
  Draft = 'DRAFT'
}

export enum ViewTimeRangeType {
  CurrentMonth = 'CURRENT_MONTH',
  Custom = 'CUSTOM',
  Last_30 = 'LAST_30',
  Last_7 = 'LAST_7',
  LastMonth = 'LAST_MONTH'
}

export enum ViewType {
  Customer = 'CUSTOMER',
  DefaultAzure = 'DEFAULT_AZURE',
  Sample = 'SAMPLE'
}

export type FieldAggregationInput = {
  field: Maybe<Scalars['String']>
  operation: Maybe<AggregationOperation>
}

export type FieldFilterInput = {
  field: Maybe<Scalars['String']>
  operator: Maybe<FilterOperator>
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type GridRequestInput = {
  aggregate: Maybe<Array<Maybe<FieldAggregationInput>>>
  entity: Maybe<Scalars['String']>
  groupBy: Maybe<Array<Maybe<Scalars['String']>>>
  having: Maybe<Array<Maybe<FieldFilterInput>>>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  orderBy: Maybe<Array<Maybe<SortCriteriaInput>>>
  where: Maybe<Array<Maybe<FieldFilterInput>>>
}

export type K8sRecommendationFilterDtoInput = {
  clusterNames: Maybe<Array<Maybe<Scalars['String']>>>
  ids: Maybe<Array<Maybe<Scalars['String']>>>
  limit: Maybe<Scalars['Long']>
  minCost: Maybe<Scalars['Float']>
  minSaving: Maybe<Scalars['Float']>
  names: Maybe<Array<Maybe<Scalars['String']>>>
  namespaces: Maybe<Array<Maybe<Scalars['String']>>>
  offset: Maybe<Scalars['Long']>
  resourceTypes: Maybe<Array<Maybe<ResourceType>>>
}

export type QlceViewAggregationInput = {
  columnName: Scalars['String']
  operationType: QlceViewAggregateOperation
}

export type QlceViewFieldInputInput = {
  fieldId: Scalars['String']
  fieldName: Scalars['String']
  identifier: ViewFieldIdentifier
  identifierName: Maybe<Scalars['String']>
}

export type QlceViewFilterInput = {
  field: QlceViewFieldInputInput
  operator: QlceViewFilterOperator
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type QlceViewFilterWrapperInput = {
  idFilter: Maybe<QlceViewFilterInput>
  ruleFilter: Maybe<QlceViewRuleInput>
  timeFilter: Maybe<QlceViewTimeFilterInput>
  viewMetadataFilter: Maybe<QlceViewMetadataFilterInput>
}

export type QlceViewGroupByInput = {
  entityGroupBy: Maybe<QlceViewFieldInputInput>
  timeTruncGroupBy: Maybe<QlceViewTimeTruncGroupByInput>
}

export type QlceViewMetadataFilterInput = {
  isPreview: Scalars['Boolean']
  viewId: Scalars['String']
}

export type QlceViewRuleInput = {
  conditions: Maybe<Array<Maybe<QlceViewFilterInput>>>
}

export type QlceViewSortCriteriaInput = {
  sortOrder: QlceSortOrder
  sortType: QlceViewSortType
}

export type QlceViewTimeFilterInput = {
  field: QlceViewFieldInputInput
  operator: QlceViewTimeFilterOperator
  value: Scalars['BigDecimal']
}

export type QlceViewTimeTruncGroupByInput = {
  resolution: QlceViewTimeGroupType
}

export type SortCriteriaInput = {
  field: Maybe<Scalars['String']>
  order: Maybe<SortOrder>
}
